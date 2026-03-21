const ANALYTICS_STORAGE_KEY_PREFIX = 'geo_analytics_data';
let currentAnalyticsData: any = null;
let currentUserId: string | null = null;

// Get storage key for specific user ID
const getStorageKey = (userId?: string): string => {
  const id = userId || currentUserId || localStorage.getItem('user_id') || '';
  if (id) {
    return `${ANALYTICS_STORAGE_KEY_PREFIX}_${id}`;
  }
  return ANALYTICS_STORAGE_KEY_PREFIX;
};

// Get current user ID
export const getCurrentUserId = (): string | null => {
  return currentUserId || localStorage.getItem('user_id');
};

// Legacy alias
export const getCurrentUserEmail = getCurrentUserId;

// Set current user ID (call this on login)
export const setCurrentUserId = (userId: string) => {
  currentUserId = userId;
  localStorage.setItem('user_id', userId);
  currentAnalyticsData = null;
  console.log('👤 [ANALYTICS] User ID set:', userId);
};

// Legacy alias
export const setCurrentUserEmail = setCurrentUserId;

// Clear user ID (call on logout)
export const clearCurrentUserId = () => {
  currentUserId = null;
  currentAnalyticsData = null;
  console.log('👤 [ANALYTICS] User ID cleared from memory');
};

// Legacy alias
export const clearCurrentUserEmail = clearCurrentUserId;

// Clear current analytics data (call when starting new analysis)
export const clearCurrentAnalyticsData = () => {
  currentAnalyticsData = null;
  console.log('🧹 [ANALYTICS] Current analytics data cleared from memory');
};

// Format logo URL using Google Favicon service
export const formatLogoUrl = (domain: string): string => {
  if (!domain) return '';
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  const fullUrl = `https://${cleanDomain}`;
  const template = import.meta.env.VITE_FAVICON_URL_TEMPLATE || 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url={domain}&size=64';
  return template.replace('{domain}', fullUrl);
};

// Load analytics from localStorage for current user
export const loadAnalyticsFromStorage = (): boolean => {
  try {
    // Try user-ID-scoped key from LAST_ANALYSIS_DATA
    const userId = getCurrentUserId();
    if (userId) {
      const lastDataKey = `last_analysis_data_${userId}`;
      const stored = localStorage.getItem(lastDataKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.analytics?.[0]) {
          currentAnalyticsData = parsed;
          console.log('📦 [ANALYTICS] Data loaded from user-scoped key:', lastDataKey);
          return true;
        }
      }
    }
    
    // Fallback to old keys for backward compatibility
    const storageKey = getStorageKey();
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      currentAnalyticsData = JSON.parse(stored);
      console.log('📦 [ANALYTICS] Data loaded from legacy key:', storageKey);
      return true;
    }
    
    const legacyStored = localStorage.getItem(ANALYTICS_STORAGE_KEY_PREFIX);
    if (legacyStored) {
      currentAnalyticsData = JSON.parse(legacyStored);
      console.log('📦 [ANALYTICS] Data loaded from legacy key');
      return true;
    }
  } catch (e) {
    console.error('Failed to load analytics from localStorage:', e);
  }
  return false;
};

// Check if analytics data is available
export const hasAnalyticsData = (): boolean => {
  if (!currentAnalyticsData) {
    loadAnalyticsFromStorage();
  }
  return !!(currentAnalyticsData?.analytics?.[0]?.analytics);
};

// Get the full analytics object
export const getAnalytics = (): any => {
  if (!currentAnalyticsData) {
    loadAnalyticsFromStorage();
  }
  return currentAnalyticsData?.analytics?.[0]?.analytics || null;
};

// Get brand name
export const getBrandName = (): string => {
  const analytics = getAnalytics();
  return analytics?.brand_name || '';
};

// Get brand website
export const getBrandWebsite = (): string => {
  const analytics = getAnalytics();
  return analytics?.brand_website || '';
};

// Get model name
export const getModelName = (): string => {
  const analytics = getAnalytics();
  return analytics?.models_used || '';
};

// Get human-readable model display name
export const getModelDisplayName = (modelName: string): string => {
  const normalized = modelName.toLowerCase();

  if (normalized === 'openai') return 'ChatGPT';
  if (normalized === 'gemini') return 'Gemini';
  if (normalized === 'google_ai_overview') return 'Google AI Overview';
  if (normalized === 'google_ai_mode') return 'Google AI Mode';

  // Fallback: basic capitalization
  return modelName.charAt(0).toUpperCase() + modelName.slice(1);
};

// Get analysis date
export const getAnalysisDate = (): string => {
  if (!currentAnalyticsData) {
    loadAnalyticsFromStorage();
  }
  const rawDate = currentAnalyticsData?.analytics?.[0]?.date;
  if (!rawDate) return '';
  
  try {
    const date = new Date(rawDate);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return rawDate;
  }
};

// Get analysis keywords
export const getAnalysisKeywords = (): string[] => {
  const analytics = getAnalytics();
  const searchKeywords = analytics?.search_keywords || {};
  return Object.values(searchKeywords).map((k: any) => k.name);
};

// Get keywords with details
export const getKeywords = (): string[] => {
  return getAnalysisKeywords();
};

// Get search keywords with prompts
export const getSearchKeywordsWithPrompts = (): Array<{ id: string; name: string; prompts: Array<{ query: string; category?: string; result: Record<string, { tier: string; brands: string[] }> }> }> => {
  const analytics = getAnalytics();
  const searchKeywords = analytics?.search_keywords || {};
  return Object.entries(searchKeywords).map(([id, data]: [string, any]) => ({
    id,
    name: data.name || '',
    prompts: data.prompts || []
  }));
};

// Get search keywords (simple list)
export const getSearchKeywords = (): string[] => {
  return getAnalysisKeywords();
};

// Returns true when a provider returned no result for a prompt (array is exactly ["RESULT_ABSENT"])
export const isResultAbsent = (brandsArr: any): boolean =>
  Array.isArray(brandsArr) && brandsArr.length === 1 && brandsArr[0] === 'RESULT_ABSENT';

// Get LLM data
export const getLlmData = (): Record<string, any> => {
  const analytics = getAnalytics();
  return analytics?.llm_wise_data || {};
};

// Get executive summary
export const getExecutiveSummary = (): any => {
  const analytics = getAnalytics();
  return analytics?.executive_summary || {
    brand_score_and_tier: '',
    strengths: [],
    weaknesses: [],
    competitor_positioning: { leaders: [], mid_tier: [], laggards: [] },
    prioritized_actions: [],
    conclusion: ''
  };
};

// Get recommendations
export const getRecommendations = (): Array<{
  overall_insight: string;
  suggested_action: string;
  overall_effort: string;
  impact: string;
}> => {
  const analytics = getAnalytics();
  return analytics?.recommendations || [];
};

// Get platform presence
export const getPlatformPresence = (): Record<string, string> => {
  const analytics = getAnalytics();
  return analytics?.platform_presence || {};
};

// Get sources data
export const getSourcesData = (): Record<string, any> => {
  const analytics = getAnalytics();
  return analytics?.sources_and_content_impact || {};
};

// Get source impact ranked (preferred for Source Intelligence UI)
export const getSourceImpactRanked = (): Record<string, any> => {
  const analytics = getAnalytics();
  return analytics?.source_impact_ranked || {};
};

// Get depth notes from sources
export const getDepthNotes = (): Array<{ source: string; notes: string[] }> => {
  const sourcesData = getSourcesData();
  return Object.entries(sourcesData).map(([source, data]: [string, any]) => ({
    source,
    notes: data.pages_used || []
  }));
};

// Get brand websites map
export const getBrandWebsites = (): Record<string, string> => {
  const analytics = getAnalytics();
  return analytics?.brand_websites || {};
};

// Get product ID
export const getProductId = (): string => {
  if (!currentAnalyticsData) {
    loadAnalyticsFromStorage();
  }
  return currentAnalyticsData?.product_id || '';
};

// Get brand info with logos - REVERSED ORDER for correct ranking
export const getBrandInfoWithLogos = (): Array<{
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
}> => {
  const analytics = getAnalytics();
  
  if (!analytics) {
    return [];
  }
  
  const brands = analytics?.brands;
  
  if (!brands || !Array.isArray(brands)) {
    const hasWarned = sessionStorage.getItem('analytics_brands_warning');
    if (!hasWarned) {
      console.warn('⚠️ [ANALYTICS] No brands array found in analytics data');
      sessionStorage.setItem('analytics_brands_warning', 'true');
    }
    return [];
  }
  
  // Reverse for descending order (highest score first)
  const reversedBrands = [...brands].reverse();
  
  return reversedBrands.map((brand: any) => ({
    brand: brand.brand,
    geo_score: typeof brand.geo_score === 'object' ? (brand.geo_score?.Value ?? 0) : (brand.geo_score || 0),
    mention_score: typeof brand.mention_score === 'object' ? (brand.mention_score?.Value ?? 0) : (brand.mention_score || 0),
    mention_count: typeof brand.mention_count === 'object' ? (brand.mention_count?.Value ?? 0) : (brand.mention_count || 0),
    logo: formatLogoUrl(brand.logo || ''),
    geo_tier: brand.geo_tier || 'Low',
    mention_tier: brand.mention_tier || 'Low',
    summary: brand.summary || '',
    outlook: brand.outlook || 'Neutral',
    mention_breakdown: brand.mention_breakdown || null
  }));
};

// Get brand logo
export const getBrandLogo = (brandName?: string): string => {
  if (brandName) {
    const brandInfo = getBrandInfoWithLogos();
    const brand = brandInfo.find(b => b.brand === brandName);
    if (brand?.logo) return brand.logo;
    
    const analytics = getAnalytics();
    const brandWebsites = analytics?.brand_websites || {};
    const website = brandWebsites[brandName];
    if (website) {
      return formatLogoUrl(website);
    }
  }
  
  const brandWebsite = getBrandWebsite();
  if (!brandWebsite) return '';
  return formatLogoUrl(brandWebsite);
};

// Get AI visibility metrics
export const getAIVisibilityMetrics = (): {
  score: number;
  tier: string;
  brandPosition: number;
  totalBrands: number;
  positionBreakdown: { topPosition: number; midPosition: number; lowPosition: number };
} => {
  const brandInfoWithLogos = getBrandInfoWithLogos();
  const brandName = getBrandName();
  const llmData = getLlmData();
  
  if (!brandInfoWithLogos.length || !brandName) {
    return {
      score: 0,
      tier: 'Low',
      brandPosition: 0,
      totalBrands: 0,
      positionBreakdown: { topPosition: 0, midPosition: 0, lowPosition: 0 }
    };
  }
  
  // Sort by geo_score descending for AI visibility ranking
  const sortedByGeoScore = [...brandInfoWithLogos].sort((a, b) => {
    if (b.geo_score !== a.geo_score) return b.geo_score - a.geo_score;
    return a.brand.localeCompare(b.brand);
  });
  
  const brandInfo = sortedByGeoScore.find(b => b.brand === brandName);
  const brandIndex = sortedByGeoScore.findIndex(b => b.brand === brandName);
  
  let totalT1 = 0;
  let totalT2 = 0;
  let totalT3 = 0;
  let llmCount = 0;
  
  Object.values(llmData).forEach((llm: any) => {
    if (!llm || typeof llm !== "object") return;

    const t1 = Number(llm.t1);
    const t2 = Number(llm.t2);
    const t3 = Number(llm.t3);

    // Only count entries that actually look like LLM tier penetration metrics.
    if (![t1, t2, t3].every((v) => Number.isFinite(v))) return;

    totalT1 += t1;
    totalT2 += t2;
    totalT3 += t3;
    llmCount++;
  });
  
  const topPosition = llmCount > 0 ? totalT1 / llmCount : 0;
  const midPosition = llmCount > 0 ? totalT2 / llmCount : 0;
  const lowPosition = llmCount > 0 ? totalT3 / llmCount : 0;
  
  return {
    score: brandInfo?.geo_score || 0,
    tier: brandInfo?.geo_tier || 'Low',
    brandPosition: brandIndex + 1,
    totalBrands: sortedByGeoScore.length,
    positionBreakdown: { topPosition, midPosition, lowPosition }
  };
};

// Get competitor data
export const getCompetitorData = (): Array<{
  name: string;
  brand: string;
  geo_score: number;
  mention_score: number;
  logo: string;
  keywordScores: number[];
}> => {
  const brandInfoWithLogos = getBrandInfoWithLogos();
  const analytics = getAnalytics();
  const searchKeywords = analytics?.search_keywords || {};
  const keywordIds = Object.keys(searchKeywords);
  
  return brandInfoWithLogos.map(b => {
    const keywordScores = keywordIds.map(keyId => {
      return b.mention_breakdown?.[keyId] || 0;
    });
    
    return {
      name: b.brand,
      brand: b.brand,
      geo_score: b.geo_score,
      mention_score: b.mention_score,
      logo: b.logo,
      keywordScores
    };
  });
};

// Legacy competitor data export
export const competitorData = {
  get data() {
    return getCompetitorData();
  }
};

// Get competitor names
export const getCompetitorNames = (): string[] => {
  const brandInfoWithLogos = getBrandInfoWithLogos();
  const brandName = getBrandName();
  return brandInfoWithLogos
    .filter(b => b.brand !== brandName)
    .map(b => b.brand);
};

// Get competitor visibility
export const getCompetitorVisibility = (): Array<{
  name: string;
  brand: string;
  score: number;
  tier: string;
  logo: string;
  visibility: number;
  totalScore: number;
}> => {
  const brandInfoWithLogos = getBrandInfoWithLogos();
  const maxMentionScore = Math.max(...brandInfoWithLogos.map(b => b.mention_score), 1);
  
  return brandInfoWithLogos.map(b => ({
    name: b.brand,
    brand: b.brand,
    score: b.geo_score,
    tier: b.geo_tier,
    logo: b.logo,
    visibility: Math.round((b.mention_score / maxMentionScore) * 100),
    totalScore: b.mention_score
  }));
};

// Get competitor sentiment
export const getCompetitorSentiment = (): Array<{
  brand: string;
  name: string;
  sentiment: string;
  outlook: string;
  summary: string;
  logo: string;
}> => {
  const brandInfoWithLogos = getBrandInfoWithLogos();
  return brandInfoWithLogos.map(b => ({
    brand: b.brand,
    name: b.brand,
    sentiment: b.outlook,
    outlook: b.outlook,
    summary: b.summary,
    logo: b.logo
  }));
};

// Get mentions position
export const getMentionsPosition = (): { 
  position: number; 
  tier: string; 
  totalBrands: number;
  topBrandMentions: number;
  brandMentions: number;
  allBrandMentions: Record<string, number>;
} => {
  const brandName = getBrandName();
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  if (!brandInfoWithLogos.length || !brandName) {
    return {
      position: 0,
      tier: 'Low',
      totalBrands: 0,
      topBrandMentions: 0,
      brandMentions: 0,
      allBrandMentions: {}
    };
  }
  
  const allMentionScores: Record<string, number> = {};
  brandInfoWithLogos.forEach(b => {
    allMentionScores[b.brand] = b.mention_score;
  });
  
  const sortedByMentions = [...brandInfoWithLogos].sort((a, b) => {
    if (b.mention_score !== a.mention_score) {
      return b.mention_score - a.mention_score;
    }
    // Tiebreaker: higher geo_score first
    if (b.geo_score !== a.geo_score) {
      return b.geo_score - a.geo_score;
    }
    return a.brand.localeCompare(b.brand);
  });
  
  const brandIndex = sortedByMentions.findIndex(b => b.brand === brandName);
  const position = brandIndex >= 0 ? brandIndex + 1 : sortedByMentions.length;
  
  const brandInfo = brandInfoWithLogos.find(b => b.brand === brandName);
  const brandMentionScore = brandInfo?.mention_score || 0;
  const topMentionScore = sortedByMentions[0]?.mention_score || 0;
  const tier = brandInfo?.mention_tier || 'Low';
  
  return {
    position,
    tier,
    totalBrands: brandInfoWithLogos.length,
    topBrandMentions: topMentionScore,
    brandMentions: brandMentionScore,
    allBrandMentions: allMentionScores
  };
};

// Get brand mention response rates
export const getBrandMentionResponseRates = (): Array<{
  brand: string;
  responseRate: number;
  logo: string;
  isTestBrand: boolean;
}> => {
  const brandName = getBrandName();
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  if (!brandInfoWithLogos.length || !brandName) {
    return [];
  }
  
  const allBrandsWithRates = brandInfoWithLogos.map(b => ({
    brand: b.brand,
    responseRate: b.mention_score,
    logo: b.logo,
    isTestBrand: b.brand === brandName
  }));
  
  const sortedBrands = [...allBrandsWithRates].sort((a, b) => {
    if (b.responseRate !== a.responseRate) {
      return b.responseRate - a.responseRate;
    }
    return a.brand.localeCompare(b.brand);
  });
  
  const topTwoCompetitors = sortedBrands.filter(b => !b.isTestBrand).slice(0, 2);
  const testBrand = sortedBrands.find(b => b.isTestBrand);
  
  const combinedBrands = [...topTwoCompetitors];
  if (testBrand) {
    combinedBrands.push(testBrand);
  }
  
  return combinedBrands.sort((a, b) => {
    if (b.responseRate !== a.responseRate) {
      return b.responseRate - a.responseRate;
    }
    return a.brand.localeCompare(b.brand);
  });
};

// Get sentiment
export const getSentiment = () => {
  const brandName = getBrandName();
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  if (!brandInfoWithLogos.length || !brandName) {
    return { 
      dominant_sentiment: 'N/A', 
      summary: 'No sentiment data available' 
    };
  }
  
  const brandInfo = brandInfoWithLogos.find(b => b.brand === brandName);
  
  return { 
    dominant_sentiment: brandInfo?.outlook || 'N/A', 
    summary: brandInfo?.summary || 'No sentiment data available' 
  };
};

// Set analytics data - CRITICAL: This is the main entry point for new data
export const setAnalyticsData = (apiResponse: any) => {
  if (apiResponse && apiResponse.analytics && Array.isArray(apiResponse.analytics)) {
    // CRITICAL: Always update in-memory cache immediately
    currentAnalyticsData = apiResponse;
    console.log('📦 [ANALYTICS] In-memory data updated');
    
    // Clear the warning flag when new data arrives
    sessionStorage.removeItem('analytics_brands_warning');
    
    // NOTE: localStorage persistence is now handled in ResultsContext
    // This function only updates the in-memory cache
  } else {
    console.error('Invalid analytics data format');
  }
};

// Temporarily set analytics data for report generation without polluting the results page.
// Returns a restore function that puts back the original data.
let _savedAnalyticsData: any = undefined;

export const setAnalyticsDataTemporary = (apiResponse: any): (() => void) => {
  _savedAnalyticsData = currentAnalyticsData;
  if (apiResponse && apiResponse.analytics && Array.isArray(apiResponse.analytics)) {
    currentAnalyticsData = apiResponse;
    sessionStorage.removeItem('analytics_brands_warning');
    console.log('📦 [ANALYTICS] Temporary data set for report generation');
  }
  return () => {
    currentAnalyticsData = _savedAnalyticsData;
    _savedAnalyticsData = undefined;
    console.log('📦 [ANALYTICS] Original data restored after report generation');
  };
};

// Clear analytics data for current user
export const clearAnalyticsData = () => {
  currentAnalyticsData = null;
  sessionStorage.removeItem('analytics_brands_warning');
  console.log('📦 [ANALYTICS] Cached data cleared from memory');
  
  // NOTE: localStorage clearing is now handled in storageKeys.ts
};

// Force refresh analytics data (bypasses cache)
export const forceRefreshAnalytics = () => {
  clearAnalyticsData();
  console.log('🔄 [ANALYTICS] Cache cleared - next data fetch will be fresh');
};

// Get sources data formatted for the comparison table
export const getSourcesDataForTable = (): Array<{
  name: string;
  [key: string]: any;
}> => {
  const sourcesData = getSourcesData();
  const allBrands = getBrandInfoWithLogos().map(b => b.brand);
  
  if (!sourcesData || typeof sourcesData !== 'object') {
    return [];
  }

  return Object.entries(sourcesData).map(([sourceName, sourceData]: [string, any]) => {
    const row: any = { name: sourceName };
    
    if (sourceData && sourceData.mentions && typeof sourceData.mentions === 'object') {
      allBrands.forEach(brand => {
        const brandMentionData = sourceData.mentions[brand];
        row[`${brand}Mentions`] = brandMentionData?.count || 0;
      });
    } else {
      allBrands.forEach(brand => {
        row[`${brand}Mentions`] = 0;
      });
    }
    
    return row;
  });
};

// Get total number of prompts analyzed across all keywords
export const getTotalPromptCount = (): number => {
  const keywords = getSearchKeywordsWithPrompts();
  return keywords.reduce((sum, kw) => sum + (kw.prompts?.length || 0), 0);
};

// Get prompts that contributed to a given position tier for the test brand.
// A prompt qualifies if ANY LLM assigned the brand to that tier (t1=top, t2=mid, t3=low).
// Returns the query and a map of LLMs where the brand qualified (llmName → 1-based rank).
export const getPromptsForPositionTier = (
  tier: 'top' | 'mid' | 'low',
  brandName: string
): Array<{ query: string; llmRanks: Record<string, number> }> => {
  const keywords = getSearchKeywordsWithPrompts();
  const results: Array<{ query: string; llmRanks: Record<string, number> }> = [];

  const tierKey = tier === 'top' ? 't1' : tier === 'mid' ? 't2' : 't3';

  for (const keyword of keywords) {
    for (const prompt of keyword.prompts) {
      const resultPerLlm = (prompt as any).result || {};
      let qualifies = false;
      const llmRanks: Record<string, number> = {};

      for (const [llmName, llmResult] of Object.entries(resultPerLlm)) {
        const r = llmResult as { tier: string; brands: string[] };
        const brands = r.brands;
        if (!Array.isArray(brands) || isResultAbsent(brands)) continue;
        const idx = brands.indexOf(brandName);
        if (idx === -1) continue;

        const rank = idx + 1;
        // Use the tier field from the backend (t1/t2/t3)
        if (r.tier === tierKey) {
          llmRanks[llmName] = rank;
          qualifies = true;
        }
      }

      if (qualifies) {
        results.push({ query: (prompt as any).query, llmRanks });
      }
    }
  }
  return results;
};

// ── Trend helpers ──────────────────────────────────────────────────────────────

import type { TrendRunItem } from "@/apiHelpers";

/**
 * Returns a stable string ID for a keyword set — sorted names joined with "|".
 * Two runs with the same keywords (regardless of order) produce the same ID.
 */
export const getKeywordSetId = (keywords: string[]): string =>
  [...keywords].sort().join("|");

/**
 * Returns { current, previous } values for a given metric across the two most
 * recent trend runs, or null if fewer than two runs exist.
 */
export const getDeltaForMetric = (
  trendRuns: TrendRunItem[],
  metric: "geo_score" | "mention_score" | "outlook"
): { current: number | string; previous: number | string } | null => {
  if (trendRuns.length < 2) return null;
  return {
    current: trendRuns[0][metric],
    previous: trendRuns[1][metric],
  };
};