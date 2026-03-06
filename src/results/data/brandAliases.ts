/**
 * Brand Aliasing System
 * 
 * Detects and merges brands that are the same company but listed under different names.
 * E.g., "YouTube" and "YouTube Live" are the same brand.
 * 
 * Detection strategies:
 * 1. Known alias map (hardcoded common aliases)
 * 2. Logo-based matching (same favicon = same company)
 * 3. Name similarity (one name contains the other + a qualifier like "Live", "Pro", "Plus")
 */

// Known brand aliases: maps variant names to canonical names
const KNOWN_ALIASES: Record<string, string> = {
  "youtube live": "YouTube",
  "youtube music": "YouTube",
  "youtube tv": "YouTube",
  "youtube premium": "YouTube",
  "youtube kids": "YouTube",
  "google meet": "Google",
  "google docs": "Google",
  "google drive": "Google",
  "google maps": "Google",
  "facebook live": "Facebook",
  "facebook messenger": "Facebook",
  "facebook marketplace": "Facebook",
  "instagram reels": "Instagram",
  "instagram stories": "Instagram",
  "twitter x": "X",
  "twitter spaces": "X",
  "twitch studio": "Twitch",
  "amazon prime": "Amazon",
  "amazon prime video": "Amazon",
  "microsoft teams": "Microsoft",
  "microsoft 365": "Microsoft",
  "apple music": "Apple",
  "apple tv": "Apple",
  "apple tv+": "Apple",
  "hbo max": "HBO",
  "hbo go": "HBO",
  "tiktok live": "TikTok",
  "tiktok shop": "TikTok",
  "linkedin learning": "LinkedIn",
  "slack huddles": "Slack",
  "zoom meetings": "Zoom",
  "zoom webinars": "Zoom",
  "discord nitro": "Discord",
};

// Common qualifiers that indicate a sub-product of the same brand
const QUALIFIERS = [
  "live", "pro", "plus", "premium", "studio", "max", "go", 
  "tv", "music", "kids", "reels", "stories", "spaces",
  "meetings", "webinars", "huddles", "nitro", "shop",
  "marketplace", "messenger", "learning",
];

/**
 * Get the canonical brand name for a given brand
 */
export const getCanonicalBrandName = (brandName: string): string => {
  const lower = brandName.toLowerCase().trim();
  
  // Check known aliases
  if (KNOWN_ALIASES[lower]) {
    return KNOWN_ALIASES[lower];
  }
  
  return brandName;
};

/**
 * Check if two brand names are aliases of each other
 */
export const areBrandsAliased = (brand1: string, brand2: string): boolean => {
  if (brand1 === brand2) return true;
  
  const canonical1 = getCanonicalBrandName(brand1);
  const canonical2 = getCanonicalBrandName(brand2);
  
  if (canonical1 === canonical2) return true;
  
  // Check if one contains the other + a qualifier
  const lower1 = brand1.toLowerCase().trim();
  const lower2 = brand2.toLowerCase().trim();
  
  for (const qualifier of QUALIFIERS) {
    if (lower1 === `${lower2} ${qualifier}` || lower2 === `${lower1} ${qualifier}`) {
      return true;
    }
  }
  
  return false;
};

/**
 * Check if two brands have the same logo (indicating same company)
 */
export const haveSameLogo = (logo1: string, logo2: string): boolean => {
  if (!logo1 || !logo2) return false;
  
  // Extract domain from favicon URLs
  const extractDomain = (url: string): string => {
    try {
      // Handle Google favicon API URLs
      const match = url.match(/[?&](?:url|domain)=([^&]+)/i);
      if (match) {
        return match[1].replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
      }
      return new URL(url).hostname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  };
  
  return extractDomain(logo1) === extractDomain(logo2);
};

export interface MergedBrand {
  canonicalName: string;
  originalNames: string[];
  geo_score: number;
  mention_score: number;
  mention_count: number;
  logo: string;
  geo_tier: string;
  mention_tier: string;
  summary: string;
  outlook: string;
  mention_breakdown: Record<string, number> | null;
  isTestBrand: boolean;
  isMerged: boolean; // true if this brand was created by merging 2+ brands
}

/**
 * Merge aliased brands in an array of brand data.
 * Keeps the brand with the higher score as the canonical one,
 * and combines scores from aliases.
 */
export const mergeBrandAliases = <T extends {
  brand: string;
  geo_score: number;
  mention_score: number;
  mention_count: number;
  logo: string;
  geo_tier: string;
  mention_tier: string;
  summary: string;
  outlook: string;
  mention_breakdown: Record<string, number> | null;
}>(brands: T[], testBrandName?: string): (T & { isMerged: boolean; originalNames: string[]; canonicalName: string })[] => {
  if (!brands.length) return [];
  
  const mergeGroups: Map<string, T[]> = new Map();
  
  // Group brands by canonical name or logo match
  for (const brand of brands) {
    let foundGroup = false;
    
    // Check against existing groups
    for (const [groupKey, groupBrands] of mergeGroups) {
      const representative = groupBrands[0];
      if (
        areBrandsAliased(brand.brand, representative.brand) ||
        haveSameLogo(brand.logo, representative.logo)
      ) {
        groupBrands.push(brand);
        foundGroup = true;
        break;
      }
    }
    
    if (!foundGroup) {
      mergeGroups.set(brand.brand, [brand]);
    }
  }
  
  // Merge each group
  return Array.from(mergeGroups.values()).map(group => {
    if (group.length === 1) {
      return {
        ...group[0],
        isMerged: false,
        originalNames: [group[0].brand],
        canonicalName: group[0].brand,
      };
    }
    
    // Pick the canonical name (prefer known canonical, then the shorter name, then highest score)
    const canonicalNames = group.map(b => getCanonicalBrandName(b.brand));
    const knownCanonical = canonicalNames.find(c => c !== group.find(b => getCanonicalBrandName(b.brand) === c)?.brand);
    
    // Sort by score descending to pick the best one as primary
    const sorted = [...group].sort((a, b) => b.geo_score - a.geo_score || b.mention_score - a.mention_score);
    const primary = sorted[0];
    
    // Use the canonical name or the shorter name
    const canonicalName = knownCanonical || 
      sorted.reduce((shortest, b) => b.brand.length < shortest.length ? b.brand : shortest, sorted[0].brand);
    
    // Combine scores (take the max since they're the same entity)
    const combinedGeoScore = Math.max(...group.map(b => b.geo_score));
    const combinedMentionScore = Math.max(...group.map(b => b.mention_score));
    const combinedMentionCount = group.reduce((sum, b) => sum + b.mention_count, 0);
    
    // Merge mention breakdowns
    let combinedBreakdown: Record<string, number> | null = null;
    for (const b of group) {
      if (b.mention_breakdown) {
        if (!combinedBreakdown) combinedBreakdown = {};
        for (const [key, val] of Object.entries(b.mention_breakdown)) {
          combinedBreakdown[key] = (combinedBreakdown[key] || 0) + val;
        }
      }
    }
    
    // Determine best tier
    const tierOrder = ['Very Strong', 'Strong', 'High', 'Medium', 'Moderate', 'Low', 'Very Low', 'Absent'];
    const bestGeoTier = group.reduce((best, b) => {
      const bestIdx = tierOrder.indexOf(best);
      const currentIdx = tierOrder.indexOf(b.geo_tier);
      return currentIdx < bestIdx ? b.geo_tier : best;
    }, group[0].geo_tier);
    
    return {
      ...primary,
      brand: canonicalName,
      canonicalName,
      originalNames: group.map(b => b.brand),
      geo_score: combinedGeoScore,
      mention_score: combinedMentionScore,
      mention_count: combinedMentionCount,
      geo_tier: bestGeoTier,
      mention_breakdown: combinedBreakdown,
      logo: primary.logo,
      summary: group.map(b => b.summary).filter(Boolean).join(' '),
      outlook: primary.outlook,
      isMerged: true,
    };
  });
};
