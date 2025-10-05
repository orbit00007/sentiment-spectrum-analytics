/**
 * Formulas and calculation explanations for the AI Visibility Dashboard
 */

export const TOOLTIP_CONTENT = {
  // Overall Insights Section
  overallInsights: {
    title: "Overall Insights",
    description: "Comprehensive overview of your brand's performance across AI platforms including search, chat, and recommendations. This dashboard aggregates data from multiple AI sources to provide actionable insights."
  },

  // AI Visibility Card
  aiVisibility: {
    title: "AI Visibility Score",
    description: "Measures how prominently your brand appears in AI-generated responses.",
    formula: "Score = (Top 2 Mentions × 3) + (Top 5 Mentions × 2) + (Later Mentions × 1)",
    tiers: {
      high: "≥ 250 points",
      medium: "100-249 points", 
      low: "< 100 points"
    }
  },

  // Brand Mentions Card
  brandMentions: {
    title: "Brand Mentions",
    description: "Total mentions of your brand across all AI platforms compared to the top-performing competitor.",
    formula: "Mention Ratio = (Your Brand's Total Mentions / Top Brand's Total Mentions) × 100",
    calculation: "Total calculated by summing all mentions across platforms from the Platform-wise Brand Performance table",
    tiers: {
      high: "≥ 70% of top brand",
      medium: "40-69% of top brand",
      low: "< 40% of top brand"
    }
  },

  // Sentiment Analysis Card
  sentimentAnalysis: {
    title: "Sentiment Analysis",
    description: "Overall sentiment tone of your brand mentions across AI platforms.",
    explanation: "Analyzes the context and tone in which your brand is mentioned to determine if the overall sentiment is Positive, Neutral, or Negative."
  },

  // Executive Summary
  executiveSummary: {
    title: "Executive Summary",
    description: "Strategic overview of your brand's AI visibility performance, including competitive positioning, key strengths and weaknesses, and prioritized action items for improvement."
  },

  // Brand Header
  brandHeader: {
    brandName: "Your brand's name being analyzed for AI visibility",
    website: "Official website URL of the brand",
    keywords: "Target keywords analyzed to measure AI visibility across platforms",
    status: "Current analysis status: Completed, Processing, or Error",
    model: "AI model used to perform the visibility analysis (e.g., GPT-5)",
    date: "Timestamp when the analysis was completed"
  },

  // Platform-wise Performance
  platformPerformance: {
    title: "Platform-wise Brand Performance",
    description: "Breakdown of your brand's performance across different AI platform types (Blogs, Chat, Search, etc.)",
    formula: "Mention Ratio = (Brand's Mentions in Source / Highest Mentions in Source) × 100",
    tiers: {
      high: "≥ 70% of top brand in that source",
      medium: "40-69% of top brand in that source",
      low: "< 40% of top brand in that source"
    }
  },

  // Source Analysis
  sourceAnalysis: {
    title: "Source Analysis",
    description: "Detailed breakdown of individual AI sources where your brand appears, showing mention counts and visibility ratings.",
    calculation: "Each source is rated based on your brand's mention ratio compared to the highest-mentioned brand in that specific source.",
    mentions: "Total number of times your brand appears in this source category",
    tier: "Performance tier calculated using: Tier = (Mentions / Max Mentions in Row) × 100. High: ≥70%, Medium: 40-69%, Low: <40%"
  },

  // Query Analysis
  queryAnalysis: {
    title: "Query Analysis",
    description: "Analysis of specific search queries and AI prompts where your brand appears, showing ranking positions and context.",
    explanation: "Helps identify which types of queries trigger mentions of your brand and your position relative to competitors."
  },

  // Competitor Analysis
  competitorAnalysis: {
    title: "Competitor Analysis",
    description: "Comparative analysis of your brand versus competitors across all AI platforms.",
    visibilityTable: "Shows total visibility scores for each competitor across different keywords analyzed",
    sentimentTable: "Summarizes market positioning and sentiment for each competitor brand",
    sentiment: "Overall perception (Positive, Neutral, or Negative) of the brand in AI-generated responses"
  },

  // Content Impact
  contentImpact: {
    title: "Content Impact Analysis",
    description: "Performance of your content across different source types and platforms.",
    explanation: "Identifies which content types and platforms are most effective for your brand visibility in AI responses.",
    mentions: "Total brand mentions in this platform category",
    tier: "Calculated as: (Brand Mentions / Top Brand Mentions) × 100. High: ≥70%, Medium: 40-69%, Low: <40%"
  },

  // Recommendations
  recommendations: {
    title: "Strategic Recommendations",
    description: "AI-powered actionable recommendations to improve your brand's visibility across AI platforms.",
    effort: "Implementation effort required: High (extensive resources), Medium (moderate resources), Low (quick win)",
    impact: "Expected visibility improvement: High (significant gain), Medium (moderate gain), Low (minimal gain)"
  }
};

/**
 * Calculate AI Visibility Tier based on score
 */
export const calculateAIVisibilityTier = (score: number): string => {
  if (score >= 250) return "High";
  if (score >= 100) return "Medium";
  if (score > 0) return "Low";
  return "N/A";
};

/**
 * Calculate Brand Mentions Tier based on ratio to top brand
 */
export const calculateBrandMentionsTier = (
  yourBrandTotal: number,
  topBrandTotal: number
): { tier: string; ratio: number } => {
  const ratio = topBrandTotal > 0 ? (yourBrandTotal / topBrandTotal) * 100 : 0;
  
  let tier = "N/A";
  if (ratio >= 70) tier = "High";
  else if (ratio >= 40) tier = "Medium";
  else if (ratio > 0) tier = "Low";

  return { tier, ratio };
};

/**
 * Calculate Platform-wise Mention Tier
 */
export const calculatePlatformMentionTier = (
  brandMentions: number,
  topBrandMentions: number
): { tier: string; ratio: number } => {
  const ratio = topBrandMentions > 0 ? (brandMentions / topBrandMentions) * 100 : 0;
  
  let tier = "N/A";
  if (ratio >= 70) tier = "High";
  else if (ratio >= 40) tier = "Medium";
  else if (ratio > 0) tier = "Low";

  return { tier, ratio };
};
