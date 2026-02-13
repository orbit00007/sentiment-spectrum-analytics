import { createRoot } from "react-dom/client";
import {
  getBrandName,
  getBrandWebsite,
  getBrandInfoWithLogos,
  getAnalytics,
  getExecutiveSummary,
  getRecommendations,
  getSearchKeywordsWithPrompts,
  getLlmData,
  getAIVisibilityMetrics,
  getMentionsPosition,
  getPlatformPresence,
  getCompetitorSentiment,
  getBrandLogo,
  getModelName,
  getAnalysisDate,
  getAnalysisKeywords,
  getSentiment,
  getBrandMentionResponseRates,
  getModelDisplayName,
  getCompetitorData,
  getSourcesData,
  getKeywords,
} from '@/results/data/analyticsData';

// ─── Type definitions ────────────────────────────────────────
interface SourceMention {
  count: number;
  score: number;
  insight: string;
}

interface SourceData {
  mentions: Record<string, SourceMention>;
  pages_used: string[];
}

interface LlmDataItem {
  mentions_count: number;
  prompts: number;
  average_rank: number;
  sources: number;
  t1?: number;
  t2?: number;
  t3?: number;
}

interface BrandInfo {
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
}

interface Prompt {
  query: string;
  category?: string;
  brands_per_llm: Record<string, string[]>;
}

interface PrintableContentProps {
  brandName: string;
  brandWebsite: string;
  brandLogo: string;
  modelName: string;
  analysisDate: string;
  analysisKeywords: string[];
  brandInfo: BrandInfo[];
  executiveSummary: {
    brand_score_and_tier?: string;
    strengths?: string[];
    weaknesses?: string[];
    prioritized_actions?: string[];
    conclusion?: string;
    competitor_positioning?: {
      leaders?: Array<{ name: string; summary: string }>;
      mid_tier?: Array<{ name: string; summary: string }>;
      laggards?: Array<{ name: string; summary: string }>;
    };
  };
  recommendations: Array<{
    overall_insight: string;
    suggested_action: string;
    overall_effort: string;
    impact: string;
    insight?: { summary?: string };
    suggested_action_v1?: {
      strategy?: string;
      start_here?: string;
      how_to_execute?: string[];
      success_signal?: string;
    };
  }>;
  keywords: Array<{ id: string; name: string; prompts: Prompt[] }>;
  llmData: Record<string, LlmDataItem>;
  aiVisibility: {
    score: number;
    tier: string;
    brandPosition: number;
    totalBrands: number;
    positionBreakdown?: { topPosition: number; midPosition: number; lowPosition: number };
  };
  mentionsData: {
    position: number;
    tier: string;
    totalBrands: number;
    brandMentions: number;
    topBrandMentions: number;
    allBrandMentions: Record<string, number>;
  };
  sourcesAndContentImpact: Record<string, SourceData>;
  platformPresence: Record<string, string>;
  competitorSentiment: Array<{ brand: string; outlook: string; summary: string; logo: string }>;
  sentiment: { dominant_sentiment: string; summary: string };
  brandMentionRates: Array<{ brand: string; responseRate: number; isTestBrand: boolean }>;
  competitorData: Array<{ name: string; keywordScores: number[]; logo: string }>;
  keywordNames: string[];
  sourcesData: Record<string, any>;
}

// ─── Intent helpers (same logic as IntentWiseScoring) ────────
const INTENTS = [
  { key: "discovery", label: "Discovery" },
  { key: "use_case", label: "Use Case" },
  { key: "comparison", label: "Comparison" },
  { key: "pricing", label: "Pricing" },
  { key: "trust", label: "Trust" },
] as const;

const getIntentFromPrompt = (prompt: Prompt): string | null => {
  if (prompt.category) {
    const cl = prompt.category.toLowerCase().replace(/\s+/g, "_");
    const match = INTENTS.find(i => i.key === cl || i.label.toLowerCase() === prompt.category!.toLowerCase());
    if (match) return match.key;
  }
  const q = prompt.query.toLowerCase();
  if (q.includes("discover") || q.includes("find") || q.includes("what is") || q.includes("best")) return "discovery";
  if (q.includes("compare") || q.includes("vs") || q.includes("difference") || q.includes("better")) return "comparison";
  if (q.includes("price") || q.includes("cost") || q.includes("cheap") || q.includes("expensive")) return "pricing";
  if (q.includes("use") || q.includes("how to") || q.includes("example") || q.includes("case")) return "use_case";
  if (q.includes("trust") || q.includes("safe") || q.includes("reliable") || q.includes("secure")) return "trust";
  return null;
};

const computeIntentData = (
  allPrompts: Prompt[],
  brands: string[],
  llmModels: string[],
  testBrand: string
) => {
  const result: Record<string, Record<string, { vis: number; total: number }>> = {};
  INTENTS.forEach(i => {
    result[i.key] = {};
    brands.forEach(b => { result[i.key][b] = { vis: 0, total: 0 }; });
  });

  allPrompts.forEach(p => {
    const intent = getIntentFromPrompt(p);
    if (!intent) return;
    llmModels.forEach(m => {
      const brandsInResp = p.brands_per_llm[m] || [];
      brands.forEach(b => {
        result[intent][b].total++;
        if (brandsInResp.includes(b)) result[intent][b].vis++;
      });
    });
  });

  return INTENTS.map(intent => {
    const data = result[intent.key];
    const testData = data[testBrand];
    const presencePct = testData && testData.total > 0 ? (testData.vis / testData.total) * 100 : 0;

    // Find leader
    let leaderBrand = "";
    let leaderPct = 0;
    brands.forEach(b => {
      const pct = data[b].total > 0 ? (data[b].vis / data[b].total) * 100 : 0;
      if (pct > leaderPct) { leaderPct = pct; leaderBrand = b; }
    });

    // Status
    let status = "Weak";
    if (presencePct >= 60) status = "Leading";
    else if (presencePct >= 40) status = "Strong";
    else if (presencePct >= 20) status = "Moderate";
    else if (presencePct >= 5) status = "Weak";
    else status = "Very Low";

    return {
      intent: intent.label,
      presencePct: Math.round(presencePct),
      status,
      leader: leaderBrand,
      leaderPct: Math.round(leaderPct),
    };
  });
};

// ─── Printable Report Component ──────────────────────────────
const PrintableContent = ({
  brandName,
  brandWebsite,
  brandLogo,
  modelName,
  analysisDate,
  analysisKeywords,
  brandInfo,
  executiveSummary,
  recommendations,
  keywords,
  llmData,
  aiVisibility,
  mentionsData,
  sourcesAndContentImpact,
  platformPresence,
  competitorSentiment,
  sentiment,
  brandMentionRates,
  competitorData,
  keywordNames,
  sourcesData,
}: PrintableContentProps) => {
  // Styles
  const styles = {
    page: {
      padding: '50px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#1a1a1a',
      fontSize: '11pt',
      lineHeight: '1.6',
      backgroundColor: '#ffffff',
    },
    coverPage: {
      textAlign: 'center' as const,
      paddingTop: '180px',
      paddingBottom: '180px',
      pageBreakAfter: 'always' as const,
      borderBottom: '3px solid #2563eb',
    },
    mainTitle: {
      fontSize: '42px',
      fontWeight: '700',
      marginBottom: '20px',
      color: '#1e40af',
      letterSpacing: '-0.5px',
    },
    brandTitle: {
      fontSize: '32px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px',
    },
    websiteText: {
      fontSize: '16px',
      color: '#6b7280',
      marginBottom: '40px',
    },
    dateText: {
      fontSize: '14px',
      color: '#9ca3af',
      fontStyle: 'italic' as const,
    },
    section: {
      pageBreakBefore: 'auto' as const,
      pageBreakAfter: 'auto' as const,
      pageBreakInside: 'avoid' as const,
      marginBottom: '40px',
    },
    sectionHeader: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '24px',
      marginTop: '32px',
      paddingBottom: '12px',
      borderBottom: '3px solid #2563eb',
      color: '#1e40af',
    },
    subsectionHeader: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '16px',
      marginTop: '24px',
      color: '#1f2937',
    },
    subsubsectionHeader: {
      fontSize: '15px',
      fontWeight: '600',
      marginBottom: '12px',
      marginTop: '16px',
      color: '#374151',
    },
    card: {
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #e5e7eb',
      pageBreakInside: 'avoid' as const,
    },
    metricCard: {
      padding: '24px',
      backgroundColor: '#eff6ff',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '2px solid #bfdbfe',
      textAlign: 'center' as const,
      pageBreakInside: 'avoid' as const,
    },
    metricValue: {
      fontSize: '48px',
      fontWeight: '700',
      color: '#1e40af',
      marginBottom: '8px',
    },
    metricLabel: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '600',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '16px',
      marginBottom: '24px',
      fontSize: '10pt',
    },
    tableHeader: {
      border: '1px solid #d1d5db',
      padding: '12px',
      textAlign: 'left' as const,
      backgroundColor: '#1e40af',
      color: '#ffffff',
      fontWeight: '600',
      fontSize: '11pt',
    },
    tableCell: {
      border: '1px solid #d1d5db',
      padding: '10px',
      backgroundColor: '#ffffff',
    },
    tableRowAlt: {
      backgroundColor: '#f9fafb',
    },
    badge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      marginRight: '8px',
      marginBottom: '8px',
    },
    list: {
      listStyleType: 'disc' as const,
      paddingLeft: '24px',
      marginBottom: '16px',
    },
    listItem: {
      marginBottom: '8px',
      lineHeight: '1.6',
    },
    footer: {
      marginTop: '60px',
      paddingTop: '24px',
      borderTop: '2px solid #e5e7eb',
      textAlign: 'center' as const,
      color: '#9ca3af',
      fontSize: '10pt',
    },
    brandInfoBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '24px',
    },
  };

  // Helper functions
  const getTierBadgeStyle = (tier: string) => {
    const baseStyle = { ...styles.badge };
    switch (tier?.toLowerCase()) {
      case 'high': case 'positive': case 'leading': case 'strong':
        return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'medium': case 'neutral': case 'moderate':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'low': case 'negative': case 'weak': case 'very low':
        return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getImpactBadgeStyle = (level: string) => {
    const baseStyle = { ...styles.badge };
    switch (level?.toLowerCase()) {
      case 'high': return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
      case 'medium': return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'low': return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      default: return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getOutlookBadgeStyle = (outlook: string) => {
    const baseStyle = { ...styles.badge };
    switch (outlook?.toLowerCase()) {
      case 'positive': return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'neutral': return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'negative': return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  // Computed values
  const totalPrompts = keywords.reduce((sum, kw) => sum + (kw.prompts?.length || 0), 0);
  const totalMentions = Object.values(llmData).reduce((sum, llm) => sum + (llm.mentions_count || 0), 0);
  const sortedBrands = [...brandInfo].sort((a, b) => b.geo_score - a.geo_score);
  const models = modelName?.split(",").map((m) => m.trim()).filter(Boolean) || [];
  const llmModels = Object.keys(llmData);

  const getBrandScoreForKeyword = (keywordId: string) => {
    const brand = brandInfo.find((b) => b.brand === brandName);
    return brand?.mention_breakdown?.[keywordId] || 0;
  };

  const getBrandsForKeyword = (keywordId: string) => {
    const brandsWithMentions = brandInfo.filter(
      (b) => (b.mention_breakdown?.[keywordId] || 0) > 0
    );
    const ourBrandIndex = brandsWithMentions.findIndex((b) => b.brand === brandName);
    let ourBrand = null;
    if (ourBrandIndex !== -1) {
      ourBrand = brandsWithMentions.splice(ourBrandIndex, 1)[0];
    } else {
      ourBrand = brandInfo.find((b) => b.brand === brandName);
    }
    brandsWithMentions.sort(
      (a, b) => (b.mention_breakdown?.[keywordId] || 0) - (a.mention_breakdown?.[keywordId] || 0)
    );
    if (ourBrand) brandsWithMentions.push(ourBrand);
    return brandsWithMentions;
  };

  // Intent data
  const allPrompts: Prompt[] = keywords.flatMap(kw => kw.prompts.map(p => ({
    query: p.query || "",
    brands_per_llm: p.brands_per_llm || {},
    category: p.category,
  })));
  const allBrandNames = brandInfo.map(b => b.brand);
  const intentResults = computeIntentData(allPrompts, allBrandNames, llmModels, brandName);

  // Sorted competitor data (primary brand at end)
  const sortedCompetitorData = [...competitorData].sort((a, b) => {
    const totalA = a.keywordScores.reduce((sum, s) => sum + (Number(s) || 0), 0);
    const totalB = b.keywordScores.reduce((sum, s) => sum + (Number(s) || 0), 0);
    return totalB - totalA;
  });
  const primaryIdx = sortedCompetitorData.findIndex(c => c.name === brandName);
  if (primaryIdx !== -1) {
    const primary = sortedCompetitorData.splice(primaryIdx, 1)[0];
    sortedCompetitorData.push(primary);
  }

  // Sorted competitor sentiment (primary brand at end)
  const sortedSentiment = [...competitorSentiment];
  const sentPrimaryIdx = sortedSentiment.findIndex(s => s.brand === brandName);
  if (sentPrimaryIdx !== -1) {
    const primary = sortedSentiment.splice(sentPrimaryIdx, 1)[0];
    sortedSentiment.push(primary);
  }

  // Source authority map data
  const allBrandsForSources = competitorData.map(c => c.name);
  const srcPrimaryIdx = allBrandsForSources.findIndex(b => b === brandName);
  if (srcPrimaryIdx !== -1) {
    const primary = allBrandsForSources.splice(srcPrimaryIdx, 1)[0];
    allBrandsForSources.push(primary);
  }

  const sourceAuthorityData = Object.entries(sourcesData || {}).map(([sourceName, sourceData]: [string, any]) => {
    const row: any = { name: sourceName };
    if (sourceData?.mentions && typeof sourceData.mentions === 'object') {
      allBrandsForSources.forEach(brand => {
        row[`${brand}Mentions`] = sourceData.mentions[brand]?.count || 0;
      });
    } else {
      allBrandsForSources.forEach(brand => { row[`${brand}Mentions`] = 0; });
    }
    return row;
  });

  return (
    <div style={styles.page}>
      {/* ══════════════════════════════════════════════════════
          COVER PAGE
         ══════════════════════════════════════════════════════ */}
      <div style={styles.coverPage}>
        {brandLogo && (
          <div style={{ marginBottom: '30px' }}>
            <img src={brandLogo} alt={brandName}
              style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto' }} />
          </div>
        )}
        <h1 style={styles.mainTitle}>AI Visibility Analysis Report</h1>
        <h2 style={styles.brandTitle}>{brandName}</h2>
        <p style={styles.websiteText}>{brandWebsite}</p>
        <div style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {models.map((model, idx) => (
              <span key={idx} style={{ ...styles.badge, backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                {getModelDisplayName(model)}
              </span>
            ))}
          </div>
          <p style={styles.dateText}>
            Report Generated: {analysisDate || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TABLE OF CONTENTS
         ══════════════════════════════════════════════════════ */}
      <div style={{ pageBreakAfter: 'always' }}>
        <h2 style={styles.sectionHeader}>Table of Contents</h2>
        <div style={{ paddingLeft: '20px', lineHeight: '2' }}>
          <p><strong>1. Brand Overview</strong></p>
          <p style={{ paddingLeft: '20px' }}>1.1 Brand Information</p>
          <p style={{ paddingLeft: '20px' }}>1.2 Key Metrics Summary</p>
          <p style={{ paddingLeft: '20px' }}>1.3 LLM Platform Performance</p>
          <p style={{ paddingLeft: '20px' }}>1.4 Platform Presence</p>
          <p style={{ paddingLeft: '20px' }}>1.5 Brand Presence by Buyer Intent</p>
          <p><strong>2. Executive Summary</strong></p>
          <p style={{ paddingLeft: '20px' }}>2.1 Brand Score & Positioning</p>
          <p style={{ paddingLeft: '20px' }}>2.2 Strengths & Weaknesses</p>
          <p style={{ paddingLeft: '20px' }}>2.3 Competitor Positioning</p>
          <p style={{ paddingLeft: '20px' }}>2.4 Prioritized Actions</p>
          <p><strong>3. AI Prompts & Query Analysis</strong></p>
          <p style={{ paddingLeft: '20px' }}>3.1 Keywords & Prompts Breakdown</p>
          <p style={{ paddingLeft: '20px' }}>3.2 Brand Mentions by Keyword</p>
          <p style={{ paddingLeft: '20px' }}>3.3 Model-Wise Prompt Analysis</p>
          <p><strong>4. Competitive Analysis</strong></p>
          <p style={{ paddingLeft: '20px' }}>4.1 Competitive Landscape</p>
          <p style={{ paddingLeft: '20px' }}>4.2 Brand Response Rates</p>
          <p style={{ paddingLeft: '20px' }}>4.3 Keyword Performance Matrix</p>
          <p style={{ paddingLeft: '20px' }}>4.4 AI Brand Perception</p>
          <p style={{ paddingLeft: '20px' }}>4.5 Source Authority Map</p>
          <p><strong>5. Sources & Content Impact</strong></p>
          <p style={{ paddingLeft: '20px' }}>5.1 Source Category Breakdown</p>
          <p style={{ paddingLeft: '20px' }}>5.2 Brand Mentions by Source</p>
          <p><strong>6. Brand Sentiment Analysis</strong></p>
          <p style={{ paddingLeft: '20px' }}>6.1 Primary Brand Sentiment</p>
          <p style={{ paddingLeft: '20px' }}>6.2 Competitor Sentiment Analysis</p>
          <p><strong>7. Strategic Recommendations</strong></p>
          <p style={{ paddingLeft: '20px' }}>7.1 Prioritized Action Items</p>
          <p style={{ paddingLeft: '20px' }}>7.2 Implementation Roadmap</p>
          <p><strong>8. Appendix</strong></p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 1: BRAND OVERVIEW
         ══════════════════════════════════════════════════════ */}
      <div style={{ pageBreakAfter: 'always' }}>
        <h2 style={styles.sectionHeader}>1. Brand Overview</h2>

        {/* 1.1 Brand Information */}
        <h3 style={styles.subsectionHeader}>1.1 Brand Information</h3>
        <div style={styles.brandInfoBar}>
          {brandLogo && (
            <img src={brandLogo} alt={brandName}
              style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', backgroundColor: 'white', padding: '4px' }} />
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>{brandName}</h3>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>{brandWebsite}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {analysisKeywords.map((keyword, idx) => (
                <span key={idx} style={{ ...styles.badge, backgroundColor: '#e5e7eb', color: '#374151', margin: 0 }}>{keyword}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>Analysis Date</p>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>{analysisDate}</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              {models.map((model, idx) => (
                <span key={idx} style={{ ...styles.badge, backgroundColor: '#e0e7ff', color: '#3730a3', margin: 0 }}>
                  {getModelDisplayName(model)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 1.2 Key Metrics Summary */}
        <h3 style={styles.subsectionHeader}>1.2 Key Metrics Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '30px' }}>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{aiVisibility?.score || 0}</div>
            <div style={styles.metricLabel}>AI Visibility Score</div>
            <div style={{ marginTop: '12px' }}>
              <span style={getTierBadgeStyle(aiVisibility?.tier)}>{aiVisibility?.tier || 'N/A'} Tier</span>
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{mentionsData?.brandMentions || 0}</div>
            <div style={styles.metricLabel}>Total Mentions</div>
            <div style={{ marginTop: '12px' }}>
              <span style={getTierBadgeStyle(mentionsData?.tier)}>{mentionsData?.tier || 'N/A'} Tier</span>
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{totalPrompts}</div>
            <div style={styles.metricLabel}>Prompts Analyzed</div>
            <div style={{ marginTop: '12px' }}>
              <span style={{ ...styles.badge, backgroundColor: '#e0e7ff', color: '#3730a3' }}>{keywords.length} Keywords</span>
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{Object.keys(llmData).length}</div>
            <div style={styles.metricLabel}>LLM Platforms</div>
            <div style={{ marginTop: '12px' }}>
              <span style={getTierBadgeStyle(sentiment?.dominant_sentiment)}>{sentiment?.dominant_sentiment}</span>
            </div>
          </div>
        </div>

        {/* Position Breakdown */}
        {aiVisibility?.positionBreakdown && (
          <div style={styles.card}>
            <h4 style={styles.subsubsectionHeader}>Ranking Distribution</h4>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-around', marginTop: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#16a34a' }}>{aiVisibility.positionBreakdown.topPosition}%</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Top Position (#1)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#ca8a04' }}>{aiVisibility.positionBreakdown.midPosition}%</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Mid Position (2-4)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626' }}>{aiVisibility.positionBreakdown.lowPosition}%</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Low Position (5+)</div>
              </div>
            </div>
          </div>
        )}

        {/* 1.3 LLM Platform Performance */}
        <h3 style={styles.subsectionHeader}>1.3 LLM Platform Performance</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Platform</th>
              <th style={styles.tableHeader}>Mentions</th>
              <th style={styles.tableHeader}>Prompts Analyzed</th>
              <th style={styles.tableHeader}>Average Rank</th>
              <th style={styles.tableHeader}>Sources Used</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(llmData).map(([llm, data], idx) => (
              <tr key={idx} style={idx % 2 === 1 ? styles.tableRowAlt : {}}>
                <td style={{ ...styles.tableCell, fontWeight: '600' }}>{getModelDisplayName(llm)}</td>
                <td style={styles.tableCell}>{data.mentions_count}</td>
                <td style={styles.tableCell}>{totalPrompts}</td>
                <td style={styles.tableCell}>{data.average_rank > 0 ? `#${data.average_rank.toFixed(1)}` : 'N/A'}</td>
                <td style={styles.tableCell}>{data.sources}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 1.4 Platform Presence */}
        <h3 style={styles.subsectionHeader}>1.4 Platform Presence</h3>
        {Object.keys(platformPresence).length > 0 ? (
          <div style={styles.card}>
            <table style={{ ...styles.table, marginTop: 0 }}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Platform</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>URL</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(platformPresence).map(([platform, url], idx) => (
                  <tr key={idx} style={idx % 2 === 1 ? styles.tableRowAlt : {}}>
                    <td style={{ ...styles.tableCell, fontWeight: '600', textTransform: 'capitalize' }}>{platform.replace('_', ' ')}</td>
                    <td style={styles.tableCell}>
                      <span style={url ? getTierBadgeStyle('high') : getTierBadgeStyle('low')}>{url ? 'Active' : 'Not Found'}</span>
                    </td>
                    <td style={{ ...styles.tableCell, fontSize: '9pt', wordBreak: 'break-all' as const }}>{url || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#6b7280' }}>No platform presence data available.</p>
        )}

        {/* 1.5 Brand Presence by Buyer Intent */}
        <h3 style={styles.subsectionHeader}>1.5 Brand Presence by Buyer Intent</h3>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>How often your brand appears in AI-generated answers across different buying stages</p>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Intent</th>
              <th style={{ ...styles.tableHeader, textAlign: 'center' }}>Your Visibility</th>
              <th style={{ ...styles.tableHeader, textAlign: 'center' }}>Presence Strength</th>
              <th style={styles.tableHeader}>Leader</th>
              <th style={{ ...styles.tableHeader, textAlign: 'center' }}>Leader %</th>
            </tr>
          </thead>
          <tbody>
            {intentResults.map((result, idx) => (
              <tr key={idx} style={idx % 2 === 1 ? styles.tableRowAlt : {}}>
                <td style={{ ...styles.tableCell, fontWeight: '600' }}>{result.intent}</td>
                <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(result.presencePct, 100)}%`,
                        height: '100%',
                        backgroundColor: result.presencePct >= 40 ? '#16a34a' : result.presencePct >= 20 ? '#ca8a04' : '#dc2626',
                        borderRadius: '4px',
                      }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', minWidth: '35px' }}>{result.presencePct}%</span>
                  </div>
                </td>
                <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                  <span style={getTierBadgeStyle(result.status)}>{result.status}</span>
                </td>
                <td style={styles.tableCell}>{result.leader}</td>
                <td style={{ ...styles.tableCell, textAlign: 'center' }}>{result.leaderPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 2: EXECUTIVE SUMMARY
         ══════════════════════════════════════════════════════ */}
      <div style={{ pageBreakAfter: 'always' }}>
        <h2 style={styles.sectionHeader}>2. Executive Summary</h2>

        <h3 style={styles.subsectionHeader}>2.1 Brand Score & Positioning</h3>
        {executiveSummary?.brand_score_and_tier && (
          <div style={styles.card}>
            <p style={{ fontSize: '13pt', lineHeight: '1.8' }}>{executiveSummary.brand_score_and_tier}</p>
          </div>
        )}
        {executiveSummary?.conclusion && (
          <div style={styles.card}>
            <h4 style={styles.subsubsectionHeader}>Strategic Conclusion</h4>
            <p style={{ lineHeight: '1.8' }}>{executiveSummary.conclusion}</p>
          </div>
        )}

        <h3 style={styles.subsectionHeader}>2.2 Strengths & Weaknesses Analysis</h3>
        {executiveSummary?.strengths && executiveSummary.strengths.length > 0 && (
          <div style={styles.card}>
            <h4 style={{ ...styles.subsubsectionHeader, color: '#16a34a' }}>✓ Key Strengths</h4>
            <ul style={styles.list}>
              {executiveSummary.strengths.map((s, idx) => <li key={idx} style={styles.listItem}>{s}</li>)}
            </ul>
          </div>
        )}
        {executiveSummary?.weaknesses && executiveSummary.weaknesses.length > 0 && (
          <div style={styles.card}>
            <h4 style={{ ...styles.subsubsectionHeader, color: '#dc2626' }}>✗ Areas for Improvement</h4>
            <ul style={styles.list}>
              {executiveSummary.weaknesses.map((w, idx) => <li key={idx} style={styles.listItem}>{w}</li>)}
            </ul>
          </div>
        )}

        <h3 style={styles.subsectionHeader}>2.3 Competitor Positioning</h3>
        {executiveSummary?.competitor_positioning && (
          <>
            {executiveSummary.competitor_positioning.leaders && executiveSummary.competitor_positioning.leaders.length > 0 && (
              <div style={styles.card}>
                <h4 style={{ ...styles.subsubsectionHeader, color: '#16a34a' }}>🏆 Market Leaders</h4>
                {executiveSummary.competitor_positioning.leaders.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: '3px solid #16a34a' }}>
                    <p style={{ fontWeight: '600', marginBottom: '4px' }}>{item.name}</p>
                    <p style={{ color: '#4b5563', fontSize: '11pt' }}>{item.summary}</p>
                  </div>
                ))}
              </div>
            )}
            {executiveSummary.competitor_positioning.mid_tier && executiveSummary.competitor_positioning.mid_tier.length > 0 && (
              <div style={styles.card}>
                <h4 style={{ ...styles.subsubsectionHeader, color: '#ca8a04' }}>⚡ Mid-Tier Performers</h4>
                {executiveSummary.competitor_positioning.mid_tier.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: '3px solid #ca8a04' }}>
                    <p style={{ fontWeight: '600', marginBottom: '4px' }}>{item.name}</p>
                    <p style={{ color: '#4b5563', fontSize: '11pt' }}>{item.summary}</p>
                  </div>
                ))}
              </div>
            )}
            {executiveSummary.competitor_positioning.laggards && executiveSummary.competitor_positioning.laggards.length > 0 && (
              <div style={styles.card}>
                <h4 style={{ ...styles.subsubsectionHeader, color: '#dc2626' }}>📊 Emerging Players</h4>
                {executiveSummary.competitor_positioning.laggards.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: '3px solid #dc2626' }}>
                    <p style={{ fontWeight: '600', marginBottom: '4px' }}>{item.name}</p>
                    <p style={{ color: '#4b5563', fontSize: '11pt' }}>{item.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 2.4 Prioritized Actions */}
        {executiveSummary?.prioritized_actions && executiveSummary.prioritized_actions.length > 0 && (
          <>
            <h3 style={styles.subsectionHeader}>2.4 Prioritized Actions</h3>
            <div style={styles.card}>
              <ol style={{ paddingLeft: '24px', margin: '0' }}>
                {executiveSummary.prioritized_actions.map((action, idx) => (
                  <li key={idx} style={{ marginBottom: '12px', lineHeight: '1.7' }}>{action}</li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 3: AI PROMPTS & QUERY ANALYSIS
         ══════════════════════════════════════════════════════ */}
      <div style={{ pageBreakBefore: 'always' }}>
        <h2 style={styles.sectionHeader}>3. AI Prompts & Query Analysis</h2>

        <div style={{ ...styles.card, marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#1e40af' }}>{keywords.length}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Keywords Analyzed</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#1e40af' }}>{totalPrompts}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Prompts</div>
            </div>
          </div>
        </div>

        <h3 style={styles.subsectionHeader}>3.1 Keywords & Prompts Breakdown</h3>

        {keywords.map((kw, idx) => {
          const brandScore = getBrandScoreForKeyword(kw.id);
          const brandsToDisplay = getBrandsForKeyword(kw.id);

          return (
            <div key={idx} style={{ ...styles.card, pageBreakInside: 'avoid', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ ...styles.subsubsectionHeader, marginTop: '0', marginBottom: '4px' }}>Keyword {idx + 1}: {kw.name}</h4>
                  <p style={{ fontSize: '11pt', color: '#6b7280', margin: 0 }}>{kw.prompts?.length || 0} prompts analyzed</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '48px', height: '48px', borderRadius: '50%', fontSize: '18px', fontWeight: '700',
                    backgroundColor: brandScore >= 3 ? '#d1fae5' : brandScore >= 1 ? '#fef3c7' : '#fee2e2',
                    color: brandScore >= 3 ? '#065f46' : brandScore >= 1 ? '#92400e' : '#991b1b',
                  }}>{brandScore}</span>
                  <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>Your Mentions</p>
                </div>
              </div>

              {/* Prompts Table */}
              <h5 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>📝 AI Prompts Used</h5>
              <table style={{ ...styles.table, fontSize: '10pt', marginBottom: '16px' }}>
                <thead>
                  <tr>
                    <th style={{ ...styles.tableHeader, width: '40px' }}>#</th>
                    <th style={styles.tableHeader}>Search Prompt</th>
                    {kw.prompts[0]?.category && <th style={styles.tableHeader}>Intent</th>}
                  </tr>
                </thead>
                <tbody>
                  {kw.prompts.map((prompt, pIdx) => (
                    <tr key={pIdx} style={pIdx % 2 === 1 ? styles.tableRowAlt : {}}>
                      <td style={{ ...styles.tableCell, textAlign: 'center' }}>{pIdx + 1}</td>
                      <td style={styles.tableCell}>{prompt.query}</td>
                      {kw.prompts[0]?.category && <td style={styles.tableCell}>{prompt.category || '-'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Brand Mentions Breakdown */}
              <h5 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>🏆 Brand Mentions for "{kw.name}"</h5>
              <table style={{ ...styles.table, fontSize: '10pt' }}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Brand</th>
                    <th style={{ ...styles.tableHeader, width: '100px', textAlign: 'center' }}>Mentions</th>
                    <th style={{ ...styles.tableHeader, width: '100px', textAlign: 'center' }}>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {brandsToDisplay.map((brand, bIdx) => {
                    const score = brand.mention_breakdown?.[kw.id] || 0;
                    const isBrand = brand.brand === brandName;
                    return (
                      <tr key={bIdx} style={{
                        ...(bIdx % 2 === 1 ? styles.tableRowAlt : {}),
                        backgroundColor: isBrand ? '#eff6ff' : (bIdx % 2 === 1 ? '#f9fafb' : '#ffffff'),
                        fontWeight: isBrand ? '600' : 'normal',
                      }}>
                        <td style={styles.tableCell}>{brand.brand}</td>
                        <td style={{ ...styles.tableCell, textAlign: 'center' }}>{score}</td>
                        <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                          <span style={score >= 3 ? getTierBadgeStyle('high') : score >= 1 ? getTierBadgeStyle('medium') : getTierBadgeStyle('low')}>
                            {score >= 3 ? 'Strong' : score >= 1 ? 'Moderate' : 'Weak'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* 3.3 Model-Wise Prompt Analysis */}
        <h3 style={styles.subsectionHeader}>3.3 Model-Wise Prompt Analysis</h3>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>Which brands each AI model recommends for each prompt</p>

        {keywords.map((kw, kwIdx) => (
          <div key={kwIdx} style={{ ...styles.card, pageBreakInside: 'avoid', marginBottom: '24px' }}>
            <h4 style={{ ...styles.subsubsectionHeader, marginTop: '0' }}>Keyword: {kw.name}</h4>
            <table style={{ ...styles.table, fontSize: '9pt' }}>
              <thead>
                <tr>
                  <th style={{ ...styles.tableHeader, width: '40px' }}>#</th>
                  <th style={styles.tableHeader}>Prompt</th>
                  {llmModels.map(model => (
                    <th key={model} style={{ ...styles.tableHeader, textAlign: 'center' }}>{getModelDisplayName(model)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kw.prompts.map((prompt, pIdx) => (
                  <tr key={pIdx} style={pIdx % 2 === 1 ? styles.tableRowAlt : {}}>
                    <td style={{ ...styles.tableCell, textAlign: 'center' }}>{pIdx + 1}</td>
                    <td style={{ ...styles.tableCell, maxWidth: '200px' }}>{prompt.query}</td>
                    {llmModels.map(model => {
                      const brands = prompt.brands_per_llm?.[model] || [];
                      const hasBrand = brands.includes(brandName);
                      return (
                        <td key={model} style={{
                          ...styles.tableCell,
                          textAlign: 'center',
                          fontSize: '8pt',
                          backgroundColor: hasBrand ? '#eff6ff' : undefined,
                        }}>
                          {brands.length > 0 ? brands.map((b, i) => (
                            <span key={i} style={{
                              display: 'block',
                              fontWeight: b === brandName ? '700' : 'normal',
                              color: b === brandName ? '#1e40af' : '#4b5563',
                            }}>
                              {i + 1}. {b}
                            </span>
                          )) : <span style={{ color: '#9ca3af' }}>-</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 4: COMPETITIVE ANALYSIS
         ══════════════════════════════════════════════════════ */}
      <div style={{ pageBreakBefore: 'always' }}>
        <h2 style={styles.sectionHeader}>4. Competitive Analysis</h2>

        <h3 style={styles.subsectionHeader}>4.1 Competitive Landscape</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Rank</th>
              <th style={styles.tableHeader}>Brand</th>
              <th style={styles.tableHeader}>Visibility Score</th>
              <th style={styles.tableHeader}>Tier</th>
              <th style={styles.tableHeader}>Mentions</th>
              <th style={styles.tableHeader}>Mention Tier</th>
              <th style={styles.tableHeader}>Outlook</th>
            </tr>
          </thead>
          <tbody>
            {sortedBrands.map((brand, idx) => {
              const isCurrentBrand = brand.brand === brandName;
              return (
                <tr key={idx} style={{
                  ...(idx % 2 === 1 ? styles.tableRowAlt : {}),
                  backgroundColor: isCurrentBrand ? '#eff6ff' : (idx % 2 === 1 ? '#f9fafb' : '#ffffff'),
                  fontWeight: isCurrentBrand ? '600' : 'normal',
                }}>
                  <td style={styles.tableCell}>{idx + 1}</td>
                  <td style={styles.tableCell}>{brand.brand}</td>
                  <td style={styles.tableCell}>{brand.geo_score}</td>
                  <td style={styles.tableCell}><span style={getTierBadgeStyle(brand.geo_tier)}>{brand.geo_tier}</span></td>
                  <td style={styles.tableCell}>{brand.mention_score}</td>
                  <td style={styles.tableCell}><span style={getTierBadgeStyle(brand.mention_tier)}>{brand.mention_tier}</span></td>
                  <td style={styles.tableCell}><span style={getOutlookBadgeStyle(brand.outlook)}>{brand.outlook}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 style={styles.subsectionHeader}>4.2 Brand Response Rates</h3>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>Percentage of AI responses where each brand is mentioned</p>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Rank</th>
              <th style={styles.tableHeader}>Brand</th>
              <th style={styles.tableHeader}>Response Rate</th>
              <th style={styles.tableHeader}>Performance</th>
            </tr>
          </thead>
          <tbody>
            {brandMentionRates.map((item, idx) => (
              <tr key={idx} style={{
                ...(idx % 2 === 1 ? styles.tableRowAlt : {}),
                backgroundColor: item.isTestBrand ? '#eff6ff' : (idx % 2 === 1 ? '#f9fafb' : '#ffffff'),
                fontWeight: item.isTestBrand ? '600' : 'normal',
              }}>
                <td style={styles.tableCell}>{idx + 1}</td>
                <td style={styles.tableCell}>{item.brand}</td>
                <td style={styles.tableCell}>{item.responseRate}%</td>
                <td style={styles.tableCell}>
                  <div style={{ width: '100%', height: '20px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.responseRate}%`, height: '100%', backgroundColor: item.isTestBrand ? '#2563eb' : '#f59e0b', borderRadius: '4px' }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 4.3 Keyword Performance Matrix */}
        <h3 style={styles.subsectionHeader}>4.3 Keyword Performance Matrix</h3>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>How often each brand appears in AI-generated responses for each keyword</p>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Brand</th>
              {keywordNames.map((kw, idx) => (
                <th key={idx} style={{ ...styles.tableHeader, textAlign: 'center', fontSize: '9pt' }}>{kw}</th>
              ))}
              <th style={{ ...styles.tableHeader, textAlign: 'center' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sortedCompetitorData.map((c, idx) => {
              const isPrimaryBrand = c.name === brandName;
              const total = c.keywordScores.reduce((sum, s) => sum + (Number(s) || 0), 0);
              return (
                <tr key={idx} style={{
                  ...(idx % 2 === 1 ? styles.tableRowAlt : {}),
                  backgroundColor: isPrimaryBrand ? '#eff6ff' : (idx % 2 === 1 ? '#f9fafb' : '#ffffff'),
                  fontWeight: isPrimaryBrand ? '600' : 'normal',
                }}>
                  <td style={styles.tableCell}>{c.name}</td>
                  {c.keywordScores.map((score, sIdx) => (
                    <td key={sIdx} style={{ ...styles.tableCell, textAlign: 'center' }}>{score}</td>
                  ))}
                  <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: '6px', fontWeight: '600',
                      backgroundColor: isPrimaryBrand ? '#1e40af' : '#f3f4f6',
                      color: isPrimaryBrand ? '#ffffff' : '#1f2937',
                    }}>{total}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 4.4 AI Brand Perception (Competitor Sentiment) */}
        <h3 style={styles.subsectionHeader}>4.4 AI Brand Perception</h3>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>What AI is saying about you and your competitors</p>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Brand</th>
              <th style={styles.tableHeader}>Sentiment Summary</th>
              <th style={{ ...styles.tableHeader, width: '120px', textAlign: 'center' }}>Outlook</th>
            </tr>
          </thead>
          <tbody>
            {sortedSentiment.map((item, idx) => {
              const isPrimaryBrand = item.brand === brandName;
              return (
                <tr key={idx} style={{
                  ...(idx % 2 === 1 ? styles.tableRowAlt : {}),
                  backgroundColor: isPrimaryBrand ? '#eff6ff' : (idx % 2 === 1 ? '#f9fafb' : '#ffffff'),
                  fontWeight: isPrimaryBrand ? '600' : 'normal',
                }}>
                  <td style={styles.tableCell}>{item.brand}</td>
                  <td style={{ ...styles.tableCell, fontSize: '10pt' }}>{item.summary}</td>
                  <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                    <span style={getOutlookBadgeStyle(item.outlook)}>{item.outlook}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 4.5 Source Authority Map */}
        {sourceAuthorityData.length > 0 && (
          <>
            <h3 style={styles.subsectionHeader}>4.5 Source Authority Map</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>Which content channels are driving AI recommendations</p>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Source</th>
                  {allBrandsForSources.map(brand => (
                    <th key={brand} style={{
                      ...styles.tableHeader,
                      textAlign: 'center',
                      fontSize: '9pt',
                      backgroundColor: brand === brandName ? '#1e3a8a' : '#1e40af',
                    }}>{brand}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sourceAuthorityData.map((source: any, idx: number) => (
                  <tr key={idx} style={idx % 2 === 1 ? styles.tableRowAlt : {}}>
                    <td style={{ ...styles.tableCell, fontWeight: '600' }}>{source.name}</td>
                    {allBrandsForSources.map(brand => {
                      const mentions = source[`${brand}Mentions`] || 0;
                      const isPrimaryBrand = brand === brandName;
                      return (
                        <td key={brand} style={{
                          ...styles.tableCell,
                          textAlign: 'center',
                          backgroundColor: isPrimaryBrand ? '#eff6ff' : undefined,
                        }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '28px', height: '28px', borderRadius: '50%', fontSize: '11px', fontWeight: '700',
                            backgroundColor: mentions > 0 ? (isPrimaryBrand ? '#dbeafe' : '#dcfce7') : '#fee2e2',
                            color: mentions > 0 ? (isPrimaryBrand ? '#1e40af' : '#166534') : '#991b1b',
                          }}>{mentions}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 5: SOURCES & CONTENT IMPACT
         ══════════════════════════════════════════════════════ */}
      {sourcesAndContentImpact && Object.keys(sourcesAndContentImpact).length > 0 && (
        <div style={{ pageBreakBefore: 'always' }}>
          <h2 style={styles.sectionHeader}>5. Sources & Content Impact</h2>
          <p style={{ marginBottom: '24px', color: '#4b5563' }}>
            This section analyzes how different content sources impact brand visibility across AI platforms.
          </p>

          {Object.entries(sourcesAndContentImpact).map(([sourceName, sourceData]: [string, any], idx) => (
            <div key={idx} style={{ ...styles.card, pageBreakInside: 'avoid', marginBottom: '32px' }}>
              <h3 style={{ ...styles.subsectionHeader, marginTop: '0' }}>{sourceName}</h3>

              {/* Pages Used */}
              {sourceData.pages_used && sourceData.pages_used.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ ...styles.subsubsectionHeader, fontSize: '13px' }}>🔗 Referenced Sources ({sourceData.pages_used.length})</h4>
                  <table style={{ ...styles.table, fontSize: '9pt' }}>
                    <thead>
                      <tr>
                        <th style={{ ...styles.tableHeader, width: '40px' }}>#</th>
                        <th style={styles.tableHeader}>URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sourceData.pages_used.map((url: string, urlIdx: number) => (
                        <tr key={urlIdx} style={urlIdx % 2 === 1 ? styles.tableRowAlt : {}}>
                          <td style={{ ...styles.tableCell, textAlign: 'center' }}>{urlIdx + 1}</td>
                          <td style={{ ...styles.tableCell, wordBreak: 'break-all' as const }}>{url}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Brand Mentions Table */}
              {sourceData.mentions && Object.keys(sourceData.mentions).length > 0 && (
                <>
                  <h4 style={{ ...styles.subsubsectionHeader, fontSize: '13px' }}>📊 Brand Mentions Analysis</h4>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Brand</th>
                        <th style={styles.tableHeader}>Mention Count</th>
                        <th style={styles.tableHeader}>Impact Score</th>
                        <th style={styles.tableHeader}>Strategic Insight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(sourceData.mentions)
                        .sort(([, a]: [string, any], [, b]: [string, any]) => b.count - a.count)
                        .map(([brand, mentionData]: [string, any], mIdx: number) => {
                          const isCurrentBrand = brand === brandName;
                          return (
                            <tr key={mIdx} style={{
                              ...(mIdx % 2 === 1 ? styles.tableRowAlt : {}),
                              backgroundColor: isCurrentBrand ? '#eff6ff' : (mIdx % 2 === 1 ? '#f9fafb' : '#ffffff'),
                              fontWeight: isCurrentBrand ? '600' : 'normal',
                            }}>
                              <td style={styles.tableCell}>{brand}</td>
                              <td style={styles.tableCell}>{mentionData.count}</td>
                              <td style={styles.tableCell}>{Math.round(mentionData.score * 100)}%</td>
                              <td style={{ ...styles.tableCell, fontSize: '10pt' }}>{mentionData.insight}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION 6: BRAND SENTIMENT ANALYSIS
         ══════════════════════════════════════════════════════ */}
      <div style={{ pageBreakBefore: 'always' }}>
        <h2 style={styles.sectionHeader}>6. Brand Sentiment Analysis</h2>

        <h3 style={styles.subsectionHeader}>6.1 Primary Brand Sentiment</h3>
        <div style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            {brandLogo && (
              <img src={brandLogo} alt={brandName}
                style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '50%', backgroundColor: 'white' }} />
            )}
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{brandName} Sentiment Overview</h4>
              <span style={getTierBadgeStyle(sentiment?.dominant_sentiment)}>{sentiment?.dominant_sentiment || 'N/A'}</span>
            </div>
          </div>
          <p style={{ color: '#4b5563', lineHeight: '1.8' }}>{sentiment?.summary || 'No sentiment data available.'}</p>
        </div>

        {/* Sentiment Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {['Positive', 'Neutral', 'Negative'].map(sentimentType => {
            const matchingBrands = competitorSentiment.filter(c => c.outlook === sentimentType);
            const count = matchingBrands.length;
            const colors: Record<string, { bg: string; border: string }> = {
              'Positive': { bg: '#d1fae5', border: '#16a34a' },
              'Neutral': { bg: '#fef3c7', border: '#ca8a04' },
              'Negative': { bg: '#fee2e2', border: '#dc2626' }
            };
            return (
              <div key={sentimentType} style={{
                ...styles.card,
                backgroundColor: colors[sentimentType].bg,
                borderColor: colors[sentimentType].border,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: colors[sentimentType].border }}>{count}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{sentimentType}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {matchingBrands.map(b => b.brand).join(', ') || 'None'}
                </div>
              </div>
            );
          })}
        </div>

        <h3 style={styles.subsectionHeader}>6.2 Competitor Sentiment Analysis</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Brand</th>
              <th style={styles.tableHeader}>Sentiment Summary</th>
              <th style={{ ...styles.tableHeader, width: '120px', textAlign: 'center' }}>Outlook</th>
            </tr>
          </thead>
          <tbody>
            {competitorSentiment.map((item, idx) => {
              const isPrimaryBrand = item.brand === brandName;
              return (
                <tr key={idx} style={{
                  ...(idx % 2 === 1 ? styles.tableRowAlt : {}),
                  backgroundColor: isPrimaryBrand ? '#eff6ff' : (idx % 2 === 1 ? '#f9fafb' : '#ffffff'),
                  fontWeight: isPrimaryBrand ? '600' : 'normal',
                }}>
                  <td style={styles.tableCell}>{item.brand}</td>
                  <td style={{ ...styles.tableCell, fontSize: '10pt' }}>{item.summary}</td>
                  <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                    <span style={getOutlookBadgeStyle(item.outlook)}>{item.outlook}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 7: STRATEGIC RECOMMENDATIONS
         ══════════════════════════════════════════════════════ */}
      {recommendations && recommendations.length > 0 && (
        <div style={{ pageBreakBefore: 'always' }}>
          <h2 style={styles.sectionHeader}>7. Strategic Recommendations</h2>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ ...styles.card, textAlign: 'center', backgroundColor: '#dcfce7', borderColor: '#16a34a' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#16a34a' }}>
                {recommendations.filter((r: any) => r.impact === 'High').length}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>High Impact</div>
            </div>
            <div style={{ ...styles.card, textAlign: 'center', backgroundColor: '#fef3c7', borderColor: '#ca8a04' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#ca8a04' }}>
                {recommendations.filter((r: any) => r.impact === 'Medium').length}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Medium Impact</div>
            </div>
            <div style={{ ...styles.card, textAlign: 'center', backgroundColor: '#dbeafe', borderColor: '#1e40af' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#1e40af' }}>
                {recommendations.filter((r: any) => r.overall_effort === 'Low' && r.impact === 'High').length}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Quick Wins</div>
            </div>
          </div>

          <h3 style={styles.subsectionHeader}>7.1 Prioritized Action Items</h3>

          {recommendations.map((rec: any, idx: number) => (
            <div key={idx} style={{ ...styles.card, pageBreakInside: 'avoid', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: '#1e40af', color: '#ffffff', fontWeight: '700', fontSize: '14px',
                }}>{idx + 1}</span>
                <h4 style={{ ...styles.subsubsectionHeader, marginTop: '0', marginBottom: '0' }}>Recommendation {idx + 1}</h4>
                <span style={getImpactBadgeStyle(rec.impact)}>Impact: {rec.impact}</span>
                <span style={getImpactBadgeStyle(rec.overall_effort)}>Effort: {rec.overall_effort}</span>
              </div>

              {/* Insight */}
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>💡 Strategic Insight</h5>
                <p style={{ fontSize: '11pt', lineHeight: '1.7', color: '#4b5563' }}>
                  {rec.insight?.summary || rec.overall_insight}
                </p>
              </div>

              {/* Suggested Action (legacy) */}
              {rec.suggested_action && (
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>✅ Suggested Action</h5>
                  <p style={{ fontSize: '11pt', lineHeight: '1.7', color: '#1f2937' }}>{rec.suggested_action}</p>
                </div>
              )}

              {/* Suggested Action V1 (detailed format) */}
              {rec.suggested_action_v1 && typeof rec.suggested_action_v1 === 'object' && Object.keys(rec.suggested_action_v1).length > 0 && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                }}>
                  <h5 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#1e40af' }}>🎯 Detailed Action Plan</h5>

                  {rec.suggested_action_v1.strategy && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', lineHeight: '1.6' }}>
                        {rec.suggested_action_v1.strategy}
                      </p>
                    </div>
                  )}

                  {rec.suggested_action_v1.start_here && (
                    <div style={{ marginBottom: '16px' }}>
                      <h6 style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '6px' }}>▶ Start Here</h6>
                      <p style={{ fontSize: '11pt', color: '#4b5563', lineHeight: '1.7' }}>{rec.suggested_action_v1.start_here}</p>
                    </div>
                  )}

                  {Array.isArray(rec.suggested_action_v1.how_to_execute) && rec.suggested_action_v1.how_to_execute.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h6 style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>📋 How to Execute</h6>
                      <ol style={{ paddingLeft: '24px', margin: '0' }}>
                        {rec.suggested_action_v1.how_to_execute.map((step: string, stepIdx: number) => (
                          <li key={stepIdx} style={{ marginBottom: '8px', lineHeight: '1.6', fontSize: '11pt', color: '#4b5563' }}>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {rec.suggested_action_v1.success_signal && (
                    <div style={{ borderTop: '1px solid #bfdbfe', paddingTop: '12px' }}>
                      <h6 style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '6px' }}>✨ Success Signal</h6>
                      <p style={{ fontSize: '11pt', color: '#4b5563', fontStyle: 'italic', lineHeight: '1.6' }}>
                        {rec.suggested_action_v1.success_signal}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <h3 style={styles.subsectionHeader}>7.2 Implementation Roadmap</h3>
          {executiveSummary?.prioritized_actions && executiveSummary.prioritized_actions.length > 0 && (
            <div style={styles.card}>
              <h4 style={styles.subsubsectionHeader}>Priority Actions</h4>
              <ol style={{ paddingLeft: '24px', margin: '0' }}>
                {executiveSummary.prioritized_actions.map((action, idx) => (
                  <li key={idx} style={{ marginBottom: '12px', lineHeight: '1.7' }}>{action}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION 8: APPENDIX
         ══════════════════════════════════════════════════════ */}
      <div style={{ pageBreakBefore: 'always' }}>
        <h2 style={styles.sectionHeader}>8. Appendix</h2>

        <h3 style={styles.subsectionHeader}>8.1 Competitor Brand Summaries</h3>
        {sortedBrands.map((brand, idx) => (
          <div key={idx} style={{ ...styles.card, pageBreakInside: 'avoid' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ ...styles.subsubsectionHeader, margin: '0' }}>{brand.brand}</h4>
              <span style={getOutlookBadgeStyle(brand.outlook)}>{brand.outlook}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '10pt', color: '#6b7280', fontWeight: '600' }}>Visibility Score: </span>
                <span style={{ fontSize: '10pt', color: '#1f2937', fontWeight: '600' }}>{brand.geo_score}</span>
              </div>
              <div>
                <span style={{ fontSize: '10pt', color: '#6b7280', fontWeight: '600' }}>Mentions: </span>
                <span style={{ fontSize: '10pt', color: '#1f2937', fontWeight: '600' }}>{brand.mention_score}</span>
              </div>
              <div><span style={getTierBadgeStyle(brand.geo_tier)}>{brand.geo_tier} Tier</span></div>
            </div>
            <p style={{ fontSize: '11pt', lineHeight: '1.7', color: '#4b5563', margin: '0' }}>{brand.summary}</p>
          </div>
        ))}

        <h3 style={styles.subsectionHeader}>8.2 Methodology Notes</h3>
        <div style={styles.card}>
          <h4 style={styles.subsubsectionHeader}>Data Collection</h4>
          <p style={{ marginBottom: '12px' }}>
            This analysis was conducted by querying multiple AI language models (LLMs) including {Object.keys(llmData).map(getModelDisplayName).join(', ')}
            across {keywords.length} keyword categories with a total of {totalPrompts} unique prompts.
          </p>
          <h4 style={styles.subsubsectionHeader}>Scoring Methodology</h4>
          <p style={{ marginBottom: '12px' }}>
            <strong>AI Visibility Score:</strong> Calculated based on brand ranking positions across all queries,
            weighted by mention frequency and source authority.
          </p>
          <p style={{ marginBottom: '12px' }}>
            <strong>Tier Classification:</strong> Brands are classified into High, Medium, or Low tiers based on
            their relative performance within the competitive set.
          </p>
          <h4 style={styles.subsubsectionHeader}>Source Analysis</h4>
          <p style={{ marginBottom: '12px' }}>
            Sources are categorized by type and authority. The impact score reflects how frequently and prominently
            each brand appears in specific source categories.
          </p>
          <h4 style={styles.subsubsectionHeader}>Limitations</h4>
          <p style={{ marginBottom: '0' }}>
            This analysis represents a snapshot in time and may not capture real-time changes in AI model outputs.
            Results are based on the specific prompts tested and may vary with different query formulations.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={{ marginBottom: '8px', fontWeight: '600' }}>Generated by GeoRankers AI Visibility Analysis Platform</p>
        <p style={{ margin: '0' }}>
          {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

// ─── Generate Report Function ────────────────────────────────
export const generateReport = (toast: (props: { title: string; description: string; variant?: "default" | "destructive"; duration?: number }) => void) => {
  const brandName = getBrandName();
  const brandWebsite = getBrandWebsite();
  const brandLogo = getBrandLogo();
  const modelName = getModelName();
  const analysisDate = getAnalysisDate();
  const analysisKeywords = getAnalysisKeywords();
  const analytics = getAnalytics();
  const brandInfo = getBrandInfoWithLogos();
  const executiveSummary = getExecutiveSummary();
  const recommendations = getRecommendations();
  const keywords = getSearchKeywordsWithPrompts();
  const llmData = getLlmData();
  const aiVisibility = getAIVisibilityMetrics();
  const mentionsData = getMentionsPosition();
  const sourcesAndContentImpact = analytics?.sources_and_content_impact || {};
  const platformPresence = getPlatformPresence();
  const competitorSentiment = getCompetitorSentiment();
  const sentiment = getSentiment();
  const brandMentionRates = getBrandMentionResponseRates();
  const competitorDataArr = getCompetitorData();
  const keywordNames = getKeywords();
  const sourcesDataObj = getSourcesData();

  if (!brandName || brandInfo.length === 0) {
    toast({
      title: "No Data Available",
      description: "Please wait for the analysis to complete before generating a report.",
      variant: "destructive",
    });
    return false;
  }

  toast({
    title: "Generating Report",
    description: "Preparing your comprehensive report...",
    duration: 2000,
  });

  let printContainer = document.getElementById("print-report-container") as HTMLDivElement;
  if (!printContainer) {
    printContainer = document.createElement("div");
    printContainer.id = "print-report-container";
    printContainer.style.display = "none";
    document.body.appendChild(printContainer);
  }

  const root = createRoot(printContainer);
  root.render(
    <PrintableContent
      brandName={brandName}
      brandWebsite={brandWebsite}
      brandLogo={brandLogo}
      modelName={modelName}
      analysisDate={analysisDate}
      analysisKeywords={analysisKeywords}
      brandInfo={brandInfo}
      executiveSummary={executiveSummary}
      recommendations={recommendations}
      keywords={keywords}
      llmData={llmData}
      aiVisibility={aiVisibility}
      mentionsData={mentionsData}
      sourcesAndContentImpact={sourcesAndContentImpact}
      platformPresence={platformPresence}
      competitorSentiment={competitorSentiment}
      sentiment={sentiment}
      brandMentionRates={brandMentionRates}
      competitorData={competitorDataArr}
      keywordNames={keywordNames}
      sourcesData={sourcesDataObj}
    />
  );

  const printStyleId = "print-report-styles";
  let styleSheet = document.getElementById(printStyleId) as HTMLStyleElement;
  if (!styleSheet) {
    styleSheet = document.createElement("style");
    styleSheet.id = printStyleId;
    document.head.appendChild(styleSheet);
  }

  styleSheet.textContent = `
    @media print {
      @page { size: A4; margin: 15mm; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body > *:not(#print-report-container) { display: none !important; }
      #print-report-container { display: block !important; }
      header, nav, .fixed, button, .sidebar, [data-sidebar] { display: none !important; }
      * { box-shadow: none !important; transition: none !important; animation: none !important; }
    }
    @media screen {
      #print-report-container { display: none !important; }
    }
  `;

  setTimeout(() => {
    printContainer.style.display = "block";
    window.print();
    setTimeout(() => {
      printContainer.style.display = "none";
      root.unmount();
    }, 1000);
  }, 500);

  return true;
};
