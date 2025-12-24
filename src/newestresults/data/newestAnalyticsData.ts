const NEWEST_ANALYTICS_STORAGE_KEY = 'newest_results_analytics_data';

// Global state to hold the API response data
let currentNewestAnalyticsData: any = null;

/**
 * Helper to format logo URL - handles both full URLs and domain-only formats
 */
const formatLogoUrl = (logo: string): string => {
  if (!logo) return '';
  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    return logo;
  }
  return `https://logo.clearbit.com/${logo}`;
};

/**
 * Set the analytics data from API response
 */
export const setNewestAnalyticsData = (apiResponse: any) => {
  if (apiResponse && apiResponse.analytics && Array.isArray(apiResponse.analytics)) {
    currentNewestAnalyticsData = apiResponse;
    try {
      localStorage.setItem(NEWEST_ANALYTICS_STORAGE_KEY, JSON.stringify(apiResponse));
      console.log('📦 [NEWEST ANALYTICS] Data stored in localStorage');
    } catch (e) {
      console.error('Failed to store newest analytics data in localStorage:', e);
    }
  } else {
    console.error('Invalid analytics data format');
  }
};

/**
 * Load analytics data from localStorage
 */
export const loadNewestAnalyticsFromStorage = (): boolean => {
  try {
    const stored = localStorage.getItem(NEWEST_ANALYTICS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.analytics && Array.isArray(parsed.analytics)) {
        currentNewestAnalyticsData = parsed;
        console.log('📦 [NEWEST ANALYTICS] Data loaded from localStorage');
        return true;
      }
    }
  } catch (e) {
    console.error('Failed to load newest analytics data from localStorage:', e);
  }
  return false;
};

/**
 * Clear analytics data from memory and localStorage
 */
export const clearNewestAnalyticsData = () => {
  currentNewestAnalyticsData = null;
  try {
    localStorage.removeItem(NEWEST_ANALYTICS_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear newest analytics data from localStorage:', e);
  }
};

/**
 * Get the stored analytics data
 */
export const newestAnalyticsData = () => currentNewestAnalyticsData;

// Helper to get the main analytics object
export const getNewestAnalytics = () => {
  if (!currentNewestAnalyticsData?.analytics?.[0]?.analytics) {
    return null;
  }
  return currentNewestAnalyticsData.analytics[0].analytics;
};

// Get brand name
export const getBrandName = () => getNewestAnalytics()?.brand_name || '';

// Get brand website
export const getBrandWebsite = () => getNewestAnalytics()?.brand_website || '';

// Get models used
export const getModelsUsed = (): string[] => {
  const models = getNewestAnalytics()?.models_used || '';
  return models.split(',').map((m: string) => m.trim()).filter(Boolean);
};

// Get all brands data
export const getBrands = (): Array<{
  brand: string;
  geo_score: number;
  logo: string;
  mention_count: number;
  mention_score: number;
  mention_breakdown: Record<string, number>;
  geo_tier: string;
  mention_tier: string;
  summary: string;
  outlook: string;
}> => {
  const analytics = getNewestAnalytics();
  const brands = analytics?.brands || [];
  
  return brands.map((b: any) => ({
    brand: b.brand,
    geo_score: b.geo_score,
    logo: formatLogoUrl(b.logo || ''),
    mention_count: b.mention_count,
    mention_score: b.mention_score,
    mention_breakdown: b.mention_breakdown || {},
    geo_tier: b.geo_tier || '',
    mention_tier: b.mention_tier || '',
    summary: b.summary || '',
    outlook: b.outlook || ''
  }));
};

// Get brand by name
export const getBrandByName = (brandName: string) => {
  const brands = getBrands();
  return brands.find(b => b.brand === brandName);
};

// Get primary brand data (first brand or matching brand_name)
export const getPrimaryBrand = () => {
  const brandName = getBrandName();
  const brands = getBrands();
  return brands.find(b => b.brand === brandName) || brands[0];
};

// Get search keywords
export const getSearchKeywords = (): Array<{
  id: string;
  name: string;
  prompts: string[];
}> => {
  const analytics = getNewestAnalytics();
  const keywords = analytics?.search_keywords || {};
  
  return Object.entries(keywords).map(([id, data]: [string, any]) => ({
    id,
    name: data.name,
    prompts: data.prompts || []
  }));
};

// Get LLM wise data
export const getLLMWiseData = (): Record<string, {
  mentions_count: number;
  prompts: number;
  average_rank: number;
  sources: number;
  t1: number;
  t2: number;
  t3: number;
}> => {
  const analytics = getNewestAnalytics();
  return analytics?.llm_wise_data || {};
};

// Get sources and content impact
export const getSourcesAndContentImpact = (): Record<string, {
  mentions: Record<string, {
    count: number;
    score: number;
    insight: string;
  }>;
  pages_used: string[];
}> => {
  const analytics = getNewestAnalytics();
  return analytics?.sources_and_content_impact || {};
};

// Get recommendations
export const getRecommendations = (): Array<{
  overall_insight: string;
  suggested_action: string;
  overall_effort: string;
  impact: string;
}> => {
  const analytics = getNewestAnalytics();
  return analytics?.recommendations || [];
};

// Get executive summary
export const getExecutiveSummary = (): {
  brand_score_and_tier: string;
  strengths: string[];
  weaknesses: string[];
  competitor_positioning: {
    leaders: Array<{ name: string; summary: string }>;
    mid_tier: Array<{ name: string; summary: string }>;
    laggards: Array<{ name: string; summary: string }>;
  };
  prioritized_actions: string[];
  conclusion: string;
} => {
  const analytics = getNewestAnalytics();
  return analytics?.executive_summary || {
    brand_score_and_tier: '',
    strengths: [],
    weaknesses: [],
    competitor_positioning: { leaders: [], mid_tier: [], laggards: [] },
    prioritized_actions: [],
    conclusion: ''
  };
};

// Get platform presence
export const getPlatformPresence = (): Record<string, string> => {
  const analytics = getNewestAnalytics();
  return analytics?.platform_presence || {};
};

// Get brand websites
export const getBrandWebsites = (): Record<string, string> => {
  const analytics = getNewestAnalytics();
  return analytics?.brand_websites || {};
};

// Get competitor visibility data for charts
export const getCompetitorVisibility = () => {
  const brands = getBrands();
  const maxScore = Math.max(...brands.map(b => b.geo_score), 1);
  
  return brands.map(b => ({
    ...b,
    visibility: Math.round((b.geo_score / maxScore) * 100)
  })).sort((a, b) => b.geo_score - a.geo_score);
};

// Get competitor sentiment data
export const getCompetitorSentiment = () => {
  const brands = getBrands();
  return brands.map(b => ({
    brand: b.brand,
    summary: b.summary,
    outlook: b.outlook,
    logo: b.logo
  }));
};

// Get AI visibility metrics
export const getAIVisibilityMetrics = () => {
  const primaryBrand = getPrimaryBrand();
  const brands = getBrands();
  const llmData = getLLMWiseData();
  
  // Calculate position breakdown from LLM data
  let totalT1 = 0, totalT2 = 0, totalT3 = 0;
  let totalPrompts = 0;
  
  Object.values(llmData).forEach((data) => {
    totalT1 += data.t1 || 0;
    totalT2 += data.t2 || 0;
    totalT3 += data.t3 || 0;
    totalPrompts += data.prompts || 0;
  });
  
  return {
    score: primaryBrand?.geo_score || 0,
    tier: primaryBrand?.geo_tier || 'Low',
    mentionTier: primaryBrand?.mention_tier || 'Low',
    mentionScore: primaryBrand?.mention_score || 0,
    mentionCount: primaryBrand?.mention_count || 0,
    totalBrands: brands.length,
    positionBreakdown: {
      topPosition: totalT1,
      midPosition: totalT2,
      lowPosition: totalT3
    }
  };
};

// Get total mentions across all sources for brand
export const getBrandTotalMentions = (brandName: string): number => {
  const sources = getSourcesAndContentImpact();
  let total = 0;
  
  Object.values(sources).forEach((source) => {
    if (source.mentions && source.mentions[brandName]) {
      total += source.mentions[brandName].count || 0;
    }
  });
  
  return total;
};

// Get brand mention response rates
export const getBrandMentionResponseRates = () => {
  const brandName = getBrandName();
  const brands = getBrands();
  
  return brands.map(b => ({
    brand: b.brand,
    responseRate: Math.min(b.mention_score, 100),
    logo: b.logo,
    isTestBrand: b.brand === brandName
  })).sort((a, b) => b.responseRate - a.responseRate);
};
