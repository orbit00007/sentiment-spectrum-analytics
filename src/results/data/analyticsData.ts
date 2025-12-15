import { calculatePercentile, getTierFromPercentile } from './formulas';

const ANALYTICS_STORAGE_KEY = 'new_results_analytics_data';

// Global state to hold the API response data
let currentAnalyticsData: any = null;

/**
 * Helper to format logo URL - handles both full URLs and domain-only formats
 */
const formatLogoUrl = (logo: string): string => {
  if (!logo) return '';
  // If it's already a full URL, return as-is
  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    return logo;
  }
  // Otherwise, prepend clearbit URL
  return `https://logo.clearbit.com/${logo}`;
};

/**
 * Set the analytics data from API response
 * Call this function whenever you receive new data from the API
 * Also stores in localStorage for persistence
 */
export const setAnalyticsData = (apiResponse: any) => {
  if (apiResponse && apiResponse.analytics && Array.isArray(apiResponse.analytics)) {
    currentAnalyticsData = apiResponse;
    // Store in localStorage for persistence
    try {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(apiResponse));
      console.log('📦 [ANALYTICS] Data stored in localStorage');
    } catch (e) {
      console.error('Failed to store analytics data in localStorage:', e);
    }
  } else {
    console.error('Invalid analytics data format');
  }
};

/**
 * Load analytics data from localStorage
 * Call this on app initialization to restore previous data
 */
export const loadAnalyticsFromStorage = (): boolean => {
  try {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.analytics && Array.isArray(parsed.analytics)) {
        currentAnalyticsData = parsed;
        console.log('📦 [ANALYTICS] Data loaded from localStorage');
        return true;
      }
    }
  } catch (e) {
    console.error('Failed to load analytics data from localStorage:', e);
  }
  return false;
};

/**
 * Clear analytics data from memory and localStorage
 */
export const clearAnalyticsData = () => {
  currentAnalyticsData = null;
  try {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear analytics data from localStorage:', e);
  }
};

/**
 * Get the stored analytics data
 */
export const analyticsData = () => currentAnalyticsData;

// Helper to get the main analytics object
export const getAnalytics = () => {
  if (!currentAnalyticsData?.analytics?.[0]?.analytics) {
    return null;
  }
  return currentAnalyticsData.analytics[0].analytics;
};

// Get brand name (fully dynamic from data)
export const getBrandName = () => getAnalytics()?.brand_name || '';

// Get brand website
export const getBrandWebsite = () => getAnalytics()?.brand_website || '';

// Get all competitor names from the visibility table
export const getCompetitorNames = (): string[] => {
  const analytics = getAnalytics();
  if (!analytics?.competitor_visibility_table?.rows) return [];
  return analytics.competitor_visibility_table.rows.map((row: any) => row[0] as string);
};

// Get keywords from visibility table
export const getKeywords = (): string[] => {
  const analytics = getAnalytics();
  if (!analytics?.competitor_visibility_table?.header) return [];
  return analytics.competitor_visibility_table.header.slice(1);
};

// Get keywords from analysis_scope (for display purposes)
export const getAnalysisKeywords = (): string[] => {
  const analytics = getAnalytics();
  return analytics?.analysis_scope?.search_keywords || [];
};

// Get brand info with logos from percentile_trace
export const getBrandInfoWithLogos = (): Array<{
  brand: string;
  geo_score: number;
  mention_score: number;
  mention_count: number;
  logo: string;
}> => {
  const analytics = getAnalytics();
  const sortedBrandInfo = analytics?.ai_visibility?.percentile_trace?.sorted_brand_info || [];
  
  // Map the data to ensure consistent field names and format logos
  return sortedBrandInfo.map((brand: any) => ({
    brand: brand.brand,
    geo_score: brand.geo_score,
    mention_score: brand.mention_score ?? brand.brand_mentionscore ?? 0,
    mention_count: brand.mention_count ?? 0,
    logo: formatLogoUrl(brand.logo || '')
  }));
};

// Get logo for a specific brand
export const getBrandLogo = (brandName: string): string => {
  const brandInfo = getBrandInfoWithLogos();
  const brand = brandInfo.find(b => b.brand === brandName);
  return brand?.logo || '';
};

// Competitor data derived from competitor_visibility_table with percentiles
export const getCompetitorData = () => {
  const analytics = getAnalytics();
  if (!analytics?.competitor_visibility_table?.rows) return [];
  
  const keywords = getKeywords();
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  return analytics.competitor_visibility_table.rows.map((row: any) => {
    const name = row[0] as string;
    const keywordScores: number[] = [];
    let totalScore = 0;
    
    for (let i = 1; i < row.length; i++) {
      const score = row[i] as number;
      keywordScores.push(score);
      totalScore += score;
    }
    
    // Get logo from percentile_trace
    const brandInfo = brandInfoWithLogos.find(b => b.brand === name);
    
    return {
      name,
      keywordScores,
      totalScore,
      logo: brandInfo?.logo || ''
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
};

// Export as both function and constant for backward compatibility
export const competitorData = getCompetitorData();

// Calculate visibility for progress bars (relative to max)
export const getCompetitorVisibility = () => {
  const data = getCompetitorData();
  const maxScore = Math.max(...data.map(c => c.totalScore));
  return data.map(c => ({
    ...c,
    visibility: maxScore > 0 ? Math.round((c.totalScore / maxScore) * 100) : 0
  }));
};

// Get all brand total scores for percentile calculation
export const getAllBrandVisibilityScores = (): number[] => {
  return getCompetitorData().map(c => c.totalScore);
};

// Get AI Visibility data using geo_score and percentile_visibility from data
export const getAIVisibilityMetrics = (): { 
  score: number; 
  tier: string; 
  percentile: number;
  totalBrands: number;
  explanation: string;
  calculation: string;
  positionBreakdown: {
    topPosition: number;
    midPosition: number;
    lowPosition: number;
  };
} => {
  const analytics = getAnalytics();
  const aiVisibility = analytics?.ai_visibility;
  
  // Use geo_score and percentile_visibility directly from the data
  const score = aiVisibility?.geo_score || 0;
  const percentile = aiVisibility?.percentile_visibility || 0;
  const totalBrands = aiVisibility?.percentile_trace?.total_brands || getCompetitorData().length;
  
  // Calculate position breakdown from llm_wise_data
  // % calculation for Position = # of queries where the brand is at top/total number of queries where brand appeared
  const llmData = analytics?.llm_wise_data || {};
  const brandMentions = analytics?.brand_mentions || {};
  
  let totalQueriesWithBrand = 0;
  let topPositionCount = 0;
  let midPositionCount = 0;
  let lowPositionCount = 0;
  
  // Count from each LLM
  Object.values(llmData).forEach((data: any) => {
    if (data?.queries_with_brand) {
      totalQueriesWithBrand += data.queries_with_brand;
      const avgRank = data.average_brand_rank || 0;
      if (avgRank > 0) {
        if (avgRank <= 1) {
          topPositionCount += data.queries_with_brand;
        } else if (avgRank <= 4) {
          midPositionCount += data.queries_with_brand;
        } else {
          lowPositionCount += data.queries_with_brand;
        }
      }
    }
  });
  
  // Use queries_with_mentions from brand_mentions if available
  const queriesWithMentions = brandMentions?.queries_with_mentions || totalQueriesWithBrand;
  
  // Calculate percentages
  const topPosition = queriesWithMentions > 0 ? Math.round((topPositionCount / queriesWithMentions) * 100) : 0;
  const midPosition = queriesWithMentions > 0 ? Math.round((midPositionCount / queriesWithMentions) * 100) : 0;
  const lowPosition = queriesWithMentions > 0 ? Math.round((lowPositionCount / queriesWithMentions) * 100) : 0;
  
  return {
    score,
    tier: getTierFromPercentile(percentile),
    percentile,
    totalBrands,
    explanation: aiVisibility?.explanation || '',
    calculation: aiVisibility?.percentile_trace?.calculation || '',
    positionBreakdown: {
      topPosition,
      midPosition,
      lowPosition
    }
  };
};

// Legacy function for backward compatibility
export const getVisibilityPercentile = (): { percentile: number; tier: string; totalBrands: number } => {
  const metrics = getAIVisibilityMetrics();
  return {
    percentile: metrics.percentile,
    tier: metrics.tier,
    totalBrands: metrics.totalBrands
  };
};

// Calculate raw mentions for each brand from sources_and_content_impact
export const getBrandMentionCounts = (): Record<string, number> => {
  const analytics = getAnalytics();
  if (!analytics?.sources_and_content_impact?.rows) return {};
  
  const header = analytics.sources_and_content_impact.header;
  const mentionCounts: Record<string, number> = {};
  
  // Find all brand mention columns (columns that end with "Mentions")
  const mentionColumns: { brand: string; index: number }[] = [];
  header.forEach((col: string, idx: number) => {
    if (col.endsWith(' Mentions')) {
      const brand = col.replace(' Mentions', '');
      mentionColumns.push({ brand, index: idx });
    }
  });
  
  // Sum mentions for each brand across all sources
  mentionColumns.forEach(({ brand, index }) => {
    let totalMentions = 0;
    analytics.sources_and_content_impact.rows.forEach((row: any[]) => {
      const mentions = row[index] as number;
      totalMentions += mentions;
    });
    mentionCounts[brand] = totalMentions;
  });
  
  return mentionCounts;
};

// Calculate Brand's mentions percentile using mention_score from percentile_trace
export const getMentionsPercentile = (): { 
  percentile: number; 
  tier: string; 
  totalBrands: number;
  topBrandMentions: number;
  brandMentions: number;
  allBrandMentions: Record<string, number>;
} => {
  const brandName = getBrandName();
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  // Get all mention_scores from sorted_brand_info
  const allMentionScores = brandInfoWithLogos.map(b => b.mention_score);
  const allMentionCounts: Record<string, number> = {};
  
  brandInfoWithLogos.forEach(b => {
    allMentionCounts[b.brand] = b.mention_score;
  });
  
  // Find the brand's mention_score
  const brandInfo = brandInfoWithLogos.find(b => b.brand === brandName);
  const brandMentionScore = brandInfo?.mention_score || 0;
  const topMentionScore = allMentionScores.length > 0 ? Math.max(...allMentionScores) : 0;
  
  // Calculate percentile based on mention_score
  const percentile = allMentionScores.length > 0 ? calculatePercentile(brandMentionScore, allMentionScores) : 0;
  
  return {
    percentile,
    tier: getTierFromPercentile(percentile),
    totalBrands: brandInfoWithLogos.length,
    topBrandMentions: topMentionScore,
    brandMentions: brandMentionScore,
    allBrandMentions: allMentionCounts
  };
};

// Get brand mention response rates for table display
// Shows top 2 brands + test brand with % of AI responses where brand appeared
// % = (queries where brand appeared / total queries) * 100, capped at 100%
// Total queries = number of keywords × number of LLMs (e.g., 2 keywords × 2 LLMs = 4 total AI prompts)
export const getBrandMentionResponseRates = (): Array<{
  brand: string;
  responseRate: number;
  logo: string;
  isTestBrand: boolean;
}> => {
  const brandName = getBrandName();
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  // Use mention_score from sorted_brand_info which is pre-calculated as percentage
  // The mention_score is already the % of AI responses where brand appeared, capped at 100
  const brandsWithRates = brandInfoWithLogos.map(b => {
    // mention_score from data is already a percentage value
    // Cap at 100% to ensure no values exceed maximum
    const responseRate = Math.min(b.mention_score, 100);
    
    return {
      brand: b.brand,
      responseRate,
      logo: b.logo,
      isTestBrand: b.brand === brandName
    };
  }).sort((a, b) => b.responseRate - a.responseRate);
  
  // Get top 2 brands (excluding test brand) + test brand
  const topTwoBrands = brandsWithRates.filter(b => !b.isTestBrand).slice(0, 2);
  const testBrand = brandsWithRates.find(b => b.isTestBrand);
  
  const result = [...topTwoBrands];
  if (testBrand) {
    result.push(testBrand);
  }
  
  return result;
};

// Get all brands with their mention counts and calculated tiers
export const getAllBrandMentionsWithTiers = (): Array<{ brand: string; mentions: number; percentile: number; tier: string; logo: string }> => {
  const mentionCounts = getBrandMentionCounts();
  const allMentions = Object.values(mentionCounts);
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  return Object.entries(mentionCounts).map(([brand, mentions]) => {
    const percentile = calculatePercentile(mentions, allMentions);
    const brandInfo = brandInfoWithLogos.find(b => b.brand === brand);
    return {
      brand,
      mentions,
      percentile,
      tier: getTierFromPercentile(percentile),
      logo: brandInfo?.logo || ''
    };
  }).sort((a, b) => b.mentions - a.mentions);
};

// Get sources data with dynamic brand columns
export const getSourcesData = () => {
  const analytics = getAnalytics();
  if (!analytics?.sources_and_content_impact?.rows) return [];
  
  const header = analytics.sources_and_content_impact.header;
  const brands = getCompetitorNames();
  
  return analytics.sources_and_content_impact.rows.map((row: any[]) => {
    const sourceData: any = {
      name: row[0] as string,
      citedByLLMs: row[header.indexOf('Cited By LLMs')] as string,
      pagesUsed: row[header.indexOf('pages_used')] as string[]
    };
    
    // Add brand-specific data
    brands.forEach(brand => {
      const presenceIdx = header.indexOf(brand);
      const mentionsIdx = header.indexOf(`${brand} Mentions`);
      const scoreIdx = header.indexOf(`${brand} Mention Score`);
      
      if (presenceIdx !== -1) {
        sourceData[`${brand}Presence`] = row[presenceIdx];
      }
      if (mentionsIdx !== -1) {
        sourceData[`${brand}Mentions`] = row[mentionsIdx];
      }
      if (scoreIdx !== -1) {
        sourceData[`${brand}Score`] = row[scoreIdx];
      }
    });
    
    return sourceData;
  });
};

// Get depth notes for the brand
export const getDepthNotes = () => {
  const analytics = getAnalytics();
  const brandName = getBrandName();
  return analytics?.sources_and_content_impact?.depth_notes?.[brandName] || {};
};

// LLM-wise data
export const getLlmData = () => {
  const analytics = getAnalytics();
  return analytics?.llm_wise_data || {};
};

// Export as constant for backward compatibility
export const llmData = getLlmData();

// Recommendations
export const getRecommendations = () => {
  const analytics = getAnalytics();
  return analytics?.recommendations || [];
};

// Export as constant for backward compatibility
export const recommendations = getRecommendations();

// Executive Summary
export const getExecutiveSummary = () => {
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

// Export as constant for backward compatibility
export const executiveSummary = getExecutiveSummary();

// Competitor sentiment data
export const getCompetitorSentiment = () => {
  const analytics = getAnalytics();
  if (!analytics?.competitor_sentiment_table?.rows) return [];
  
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  return analytics.competitor_sentiment_table.rows.map((row: any[]) => {
    const brandName = row[0] as string;
    const brandInfo = brandInfoWithLogos.find(b => b.brand === brandName);
    return {
      brand: brandName,
      summary: row[1] as string,
      outlook: row[2] as string,
      logo: brandInfo?.logo || ''
    };
  });
};

// Export as constant for backward compatibility
export const competitorSentiment = getCompetitorSentiment();

// Get search keywords
export const getSearchKeywords = () => {
  const analytics = getAnalytics();
  return analytics?.analysis_scope?.search_keywords || [];
};

// Get sentiment
export const getSentiment = () => {
  const analytics = getAnalytics();
  return analytics?.sentiment || { dominant_sentiment: 'N/A', summary: '' };
};

// Get AI visibility data
export const getAIVisibility = () => {
  const analytics = getAnalytics();
  return analytics?.ai_visibility || null;
};

// Get brand mentions data
export const getBrandMentions = () => {
  const analytics = getAnalytics();
  return analytics?.brand_mentions || null;
};

// Get model name
export const getModelName = () => {
  const analytics = getAnalytics();
  return analytics?.model_name || '';
};

// Get analysis date
export const getAnalysisDate = () => {
  if (!currentAnalyticsData?.analytics?.[0]) return '';
  const data = currentAnalyticsData.analytics[0];
  const dateStr = data?.date || data?.updated_at || data?.created_at;
  
  return dateStr ? new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : '';
};

// Get total mentions across all sources for the primary brand
export const getPrimaryBrandTotalMentions = (): number => {
  const mentionCounts = getBrandMentionCounts();
  const brandName = getBrandName();
  return mentionCounts[brandName] || 0;
};

// Get platform presence
export const getPlatformPresence = () => {
  const analytics = getAnalytics();
  return analytics?.platform_presence || {};
};

// Get status
export const getStatus = () => {
  if (!currentAnalyticsData?.analytics?.[0]) return '';
  return currentAnalyticsData.analytics[0].status || '';
};

// Check if data is available
export const hasAnalyticsData = (): boolean => {
  return currentAnalyticsData !== null && getAnalytics() !== null;
};