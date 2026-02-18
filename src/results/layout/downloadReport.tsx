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

// ─── Intent helpers ─────────────────────────────────────────
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

    let leaderBrand = "";
    let leaderPct = 0;
    brands.forEach(b => {
      const pct = data[b].total > 0 ? (data[b].vis / data[b].total) * 100 : 0;
      if (pct > leaderPct) { leaderPct = pct; leaderBrand = b; }
    });

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

// ─── Enterprise Design System ────────────────────────────────
const COLORS = {
  navy: '#0f172a',
  navyLight: '#1e293b',
  blue: '#1e40af',
  blueLight: '#3b82f6',
  bluePale: '#eff6ff',
  blueBorder: '#bfdbfe',
  slate: '#334155',
  slateLight: '#64748b',
  slatePale: '#94a3b8',
  gray100: '#f8fafc',
  gray200: '#f1f5f9',
  gray300: '#e2e8f0',
  gray400: '#cbd5e1',
  white: '#ffffff',
  green: '#059669',
  greenBg: '#ecfdf5',
  greenBorder: '#a7f3d0',
  amber: '#d97706',
  amberBg: '#fffbeb',
  amberBorder: '#fde68a',
  red: '#dc2626',
  redBg: '#fef2f2',
  redBorder: '#fecaca',
  gold: '#b45309',
};

const S = {
  page: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: COLORS.navy,
    fontSize: '9.5pt',
    lineHeight: '1.65',
    backgroundColor: COLORS.white,
  },
  sansSerif: {
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  },

  // Cover page
  coverPage: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    textAlign: 'center' as const,
    pageBreakAfter: 'always' as const,
    background: `rgba(255,255,255,0.35)`,
    color: 'rgba(0,0,0,1)',
    padding: '60px 40px',
    position: 'relative' as const,
  },
  coverWatermark: {
    position: 'absolute' as const,
    top: '30px',
    right: '40px',
    fontSize: '15px',
    letterSpacing: '3px',
    textTransform: 'uppercase' as const,
    color: 'rgba(0,0,0,0.6)',
    fontFamily: "'Segoe UI', sans-serif",
    fontWeight: '600' as const,
  },
  coverTitle: {
    fontSize: '20px',
    fontWeight: '600' as const,
    letterSpacing: '4px',
    textTransform: 'uppercase' as const,
    color: 'rgba(0,0,0,0.7)',
    marginBottom: '24px',
    fontFamily: "'Segoe UI', sans-serif",
  },
  coverBrandName: {
    fontSize: '44px',
    fontWeight: '700' as const,
    letterSpacing: '-1px',
    marginBottom: '12px',
    lineHeight: '1.1',
  },
  coverReportTitle: {
    fontSize: '20px',
    fontWeight: '400' as const,
    color: 'rgba(0,0,0,0.85)',
    marginBottom: '40px',
    maxWidth: '500px',
    lineHeight: '1.4',
  },
  coverMeta: {
    fontSize: '20px',
    color: 'rgba(0,0,0,0.6)',
    fontFamily: "'Segoe UI', sans-serif",
    marginBottom: '6px',
  },
  coverModelBadge: {
    display: 'inline-block',
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '20px',
    fontWeight: '600' as const,
    backgroundColor: `${COLORS.bluePale}`,
    color: 'black',
    margin: '4px',
    fontFamily: "'Segoe UI', sans-serif",
    border: '1px solid rgba(0,0,0,0.4)',
  },
  coverFooter: {
    position: 'absolute' as const,
    bottom: '40px',
    fontSize: '20px',
    color: 'rgba(0,0,0,0.7)',
    fontFamily: "'Segoe UI', sans-serif",
  },

  // Section headers
  sectionPage: {
    padding: '24px 40px 0 40px',
    pageBreakBefore: 'auto' as const,
    pageBreakInside: 'auto' as const,
  },
  sectionHeader: {
    fontSize: '18px',
    fontWeight: '700' as const,
    color: COLORS.navy,
    marginBottom: '4px',
    letterSpacing: '-0.3px',
  },
  sectionSubtitle: {
    fontSize: '10px',
    color: COLORS.slateLight,
    marginBottom: '14px',
    fontFamily: "'Segoe UI', sans-serif",
    lineHeight: '1.5',
  },
  sectionDivider: {
    width: '50px',
    height: '3px',
    backgroundColor: COLORS.blue,
    marginBottom: '12px',
    borderRadius: '2px',
  },

  // Subsections
  subsection: {
    fontSize: '14px',
    fontWeight: '700' as const,
    color: COLORS.navyLight,
    marginTop: '16px',
    marginBottom: '8px',
  },
  subsubsection: {
    fontSize: '13px',
    fontWeight: '600' as const,
    color: COLORS.slate,
    marginTop: '16px',
    marginBottom: '8px',
  },

  // Cards
  card: {
    padding: '12px 16px',
    backgroundColor: COLORS.gray100,
    borderRadius: '6px',
    marginBottom: '10px',
    border: `1px solid ${COLORS.gray300}`,
    pageBreakInside: 'auto' as const,
  },
  calloutCard: {
    padding: '14px 18px',
    borderRadius: '6px',
    marginBottom: '10px',
    pageBreakInside: 'auto' as const,
    borderLeft: `4px solid ${COLORS.blue}`,
    backgroundColor: COLORS.bluePale,
  },
  riskCard: {
    padding: '10px 16px',
    borderRadius: '6px',
    marginBottom: '8px',
    pageBreakInside: 'auto' as const,
    borderLeft: '4px solid',
  },

  // KPI blocks
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
    marginBottom: '14px',
  },
  kpiBlock: {
    padding: '12px 10px',
    borderRadius: '6px',
    textAlign: 'center' as const,
    pageBreakInside: 'avoid' as const,
    border: `1px solid ${COLORS.gray300}`,
    backgroundColor: COLORS.white,
  },
  kpiValue: {
    fontSize: '24px',
    fontWeight: '700' as const,
    color: COLORS.blue,
    marginBottom: '2px',
    fontFamily: "'Segoe UI', sans-serif",
    lineHeight: '1.1',
  },
  kpiLabel: {
    fontSize: '10px',
    color: COLORS.slateLight,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.7px',
    fontFamily: "'Segoe UI', sans-serif",
  },
  kpiSub: {
    fontSize: '10px',
    color: COLORS.slatePale,
    marginTop: '4px',
    fontFamily: "'Segoe UI', sans-serif",
  },

  // Tables
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '8px',
    marginBottom: '16px',
    fontSize: '9pt',
    fontFamily: "'Segoe UI', sans-serif",
  },
  th: {
    border: `1px solid ${COLORS.gray300}`,
    padding: '10px 12px',
    textAlign: 'left' as const,
    backgroundColor: COLORS.navy,
    color: COLORS.white,
    fontWeight: '600' as const,
    fontSize: '9pt',
    letterSpacing: '0.3px',
  },
  td: {
    border: `1px solid ${COLORS.gray300}`,
    padding: '8px 12px',
    backgroundColor: COLORS.white,
    fontSize: '9pt',
  },
  tdAlt: {
    backgroundColor: COLORS.gray100,
  },

  // Badges
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600' as const,
    fontFamily: "'Segoe UI', sans-serif",
    letterSpacing: '0.3px',
  },

  // Footer
  footer: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: `2px solid ${COLORS.gray300}`,
    textAlign: 'center' as const,
    color: COLORS.slatePale,
    fontSize: '9pt',
    fontFamily: "'Segoe UI', sans-serif",
  },

  // Utility
  text: {
    lineHeight: '1.7',
    color: COLORS.slate,
    fontSize: '10pt',
  },
  pageBreak: {
    pageBreakBefore: 'auto' as const,
    padding: '24px 40px 0 40px',
  },
};

// ─── Helper functions ─────────────────────────────────────
const tierBadge = (tier: string) => {
  const t = tier?.toLowerCase() || '';
  if (['high', 'positive', 'leading', 'strong', 'leader'].includes(t))
    return { ...S.badge, backgroundColor: COLORS.greenBg, color: COLORS.green, border: `1px solid ${COLORS.greenBorder}` };
  if (['medium', 'neutral', 'moderate', 'strong performer', 'challenger'].includes(t))
    return { ...S.badge, backgroundColor: COLORS.amberBg, color: COLORS.amber, border: `1px solid ${COLORS.amberBorder}` };
  if (['low', 'negative', 'weak', 'very low', 'laggard', 'absent'].includes(t))
    return { ...S.badge, backgroundColor: COLORS.redBg, color: COLORS.red, border: `1px solid ${COLORS.redBorder}` };
  return { ...S.badge, backgroundColor: COLORS.gray200, color: COLORS.slate, border: `1px solid ${COLORS.gray300}` };
};

const severityColor = (level: string) => {
  switch (level) {
    case 'Critical': return COLORS.red;
    case 'High': return COLORS.red;
    case 'Medium': return COLORS.amber;
    case 'Low': return COLORS.green;
    default: return COLORS.slateLight;
  }
};

const getVisibilityTier = (score: number): string => {
  if (score >= 70) return 'Leader';
  if (score >= 50) return 'Strong Performer';
  if (score >= 30) return 'Challenger';
  return 'Laggard';
};

const getShareOfVoice = (brandMentions: number, allMentions: Record<string, number>): number => {
  const total = Object.values(allMentions).reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  return Math.min(Math.round((brandMentions / total) * 100), 100);
};

const getCompetitiveGap = (brandScore: number, topScore: number): number => {
  if (topScore === 0) return 0;
  return Math.round(((topScore - brandScore) / topScore) * 100);
};

const getRankQualityIndex = (llmData: Record<string, LlmDataItem>): number => {
  const entries = Object.values(llmData);
  if (entries.length === 0) return 0;
  const avgRank = entries.reduce((s, e) => s + (e.average_rank || 0), 0) / entries.length;
  if (avgRank <= 0) return 0;
  // Scale: rank 1 = 100, rank 5 = 20, rank 10 = 0
  return Math.max(0, Math.min(100, Math.round(100 - (avgRank - 1) * 11)));
};

const getVisibilityConsistency = (llmData: Record<string, LlmDataItem>): number => {
  const entries = Object.values(llmData);
  if (entries.length <= 1) return 100;
  const mentions = entries.map(e => e.mentions_count || 0);
  const avg = mentions.reduce((s, v) => s + v, 0) / mentions.length;
  if (avg === 0) return 0;
  const variance = mentions.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / mentions.length;
  const cv = Math.sqrt(variance) / avg; // coefficient of variation
  return Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
};

// ─── Enterprise Printable Report ─────────────────────────────
const PrintableContent = (props: PrintableContentProps) => {
  const {
    brandName, brandWebsite, brandLogo, modelName, analysisDate,
    analysisKeywords, brandInfo, executiveSummary, recommendations,
    keywords, llmData, aiVisibility, mentionsData,
    sourcesAndContentImpact, platformPresence, competitorSentiment,
    sentiment, brandMentionRates, competitorData, keywordNames, sourcesData,
  } = props;

  // Computed
  const totalPrompts = keywords.reduce((sum, kw) => sum + (kw.prompts?.length || 0), 0);
  const totalMentions = Object.values(llmData).reduce((sum, llm) => sum + (llm.mentions_count || 0), 0);
  const sortedBrands = [...brandInfo].sort((a, b) => b.geo_score - a.geo_score);
  const models = modelName?.split(",").map(m => m.trim()).filter(Boolean) || [];
  const llmModels = Object.keys(llmData);
  const visibilityTier = getVisibilityTier(aiVisibility?.score || 0);
  const shareOfVoice = getShareOfVoice(mentionsData?.brandMentions || 0, mentionsData?.allBrandMentions || {});
  const competitiveGap = getCompetitiveGap(aiVisibility?.score || 0, sortedBrands[0]?.geo_score || 0);
  const rankQuality = getRankQualityIndex(llmData);
  const visConsistency = getVisibilityConsistency(llmData);
  const topCompetitor = sortedBrands.find(b => b.brand !== brandName);

  // T1/T2/T3 distribution
  let totalT1 = 0, totalT2 = 0, totalT3 = 0;
  Object.values(llmData).forEach((llm: any) => {
    totalT1 += llm.t1 || 0; totalT2 += llm.t2 || 0; totalT3 += llm.t3 || 0;
  });
  const tierTotal = totalT1 + totalT2 + totalT3;

  // Intent data
  const allPrompts: Prompt[] = keywords.flatMap(kw => kw.prompts.map(p => ({
    query: p.query || "", brands_per_llm: p.brands_per_llm || {}, category: p.category,
  })));
  const allBrandNames = brandInfo.map(b => b.brand);
  const intentResults = computeIntentData(allPrompts, allBrandNames, llmModels, brandName);

  // Sorted competitor data
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

  // Sorted sentiment
  const sortedSentiment = [...competitorSentiment];
  const sentPrimaryIdx = sortedSentiment.findIndex(s => s.brand === brandName);
  if (sentPrimaryIdx !== -1) {
    const primary = sortedSentiment.splice(sentPrimaryIdx, 1)[0];
    sortedSentiment.push(primary);
  }

  // Source authority
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

  // Risk calculations
  const brandData = brandInfo.find(b => b.brand === brandName);
  const isInvisible = (aiVisibility?.score || 0) < 30;
  const topThreat = topCompetitor && topCompetitor.geo_score > (brandData?.geo_score || 0) * 1.5;
  const trustDeficit = sentiment?.dominant_sentiment?.toLowerCase() === 'negative';
  const reviewAbsent = !Object.entries(sourcesAndContentImpact || {}).some(
    ([name]) => name.toLowerCase().includes('review')
  );
  const zeroIntents = intentResults.filter(i => i.presencePct === 0);

  // Keyword helpers
  const getBrandScoreForKeyword = (keywordId: string) => {
    const brand = brandInfo.find(b => b.brand === brandName);
    return brand?.mention_breakdown?.[keywordId] || 0;
  };

  const getBrandsForKeyword = (keywordId: string) => {
    const brandsWithMentions = brandInfo.filter(b => (b.mention_breakdown?.[keywordId] || 0) > 0);
    const ourBrandIndex = brandsWithMentions.findIndex(b => b.brand === brandName);
    let ourBrand = null;
    if (ourBrandIndex !== -1) {
      ourBrand = brandsWithMentions.splice(ourBrandIndex, 1)[0];
    } else {
      ourBrand = brandInfo.find(b => b.brand === brandName);
    }
    brandsWithMentions.sort((a, b) => (b.mention_breakdown?.[keywordId] || 0) - (a.mention_breakdown?.[keywordId] || 0));
    if (ourBrand) brandsWithMentions.push(ourBrand);
    return brandsWithMentions;
  };

  // Opportunity index
  const highLeverageIntents = intentResults.filter(i => i.presencePct < 40 && i.leaderPct > 50);
  const fastWins = recommendations.filter(r => r.overall_effort === 'Low' && r.impact === 'High');
  const modelGrowthAreas = Object.entries(llmData)
    .filter(([, d]) => (d.mentions_count || 0) < totalMentions / llmModels.length * 0.5)
    .map(([m]) => getModelDisplayName(m));

  return (
    <div style={S.page}>
      {/* ══════════════════════════════════════════════════════
          1. COVER PAGE
         ══════════════════════════════════════════════════════ */}
      <div style={S.coverPage}>
        <div style={S.coverTitle}>GeoRankers Intelligence</div>
        {brandLogo && (
          <div style={{ marginBottom: '24px' }}>
            <img src={brandLogo} alt={brandName}
              style={{ width: '72px', height: '72px', objectFit: 'contain', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '8px' }} />
          </div>
        )}
        <div style={S.coverBrandName}>{brandName}</div>
        <div style={S.coverReportTitle}>
          AI Search & LLM Visibility Intelligence Report
        </div>
        <div style={{ marginBottom: '12px' }}>
          {models.map((model, idx) => (
            <span key={idx} style={S.coverModelBadge}>{getModelDisplayName(model)}</span>
          ))}
        </div>
        <div style={S.coverMeta}>{brandWebsite}</div>
        <div style={S.coverMeta}>
          {analysisDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div style={S.coverMeta}>
          {analysisKeywords.length} Keywords · {totalPrompts} Prompts · {llmModels.length} AI Models
        </div>
        <div style={S.coverFooter}>
          © {new Date().getFullYear()} GeoRankers · AI Search Intelligence Platform
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TABLE OF CONTENTS
         ══════════════════════════════════════════════════════ */}
      <div style={{ ...S.pageBreak, pageBreakBefore: 'auto', pageBreakAfter: 'always' as const }}>
        <div style={S.sectionHeader}>Table of Contents</div>
        <div style={S.sectionDivider} />
        <div style={{ ...S.sansSerif, fontSize: '10.5pt', lineHeight: '2.2', color: COLORS.slate }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.gray300}`, padding: '4px 0' }}>
            <span><strong>1.</strong> Executive Summary</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.gray300}`, padding: '4px 0' }}>
            <span><strong>2.</strong> AI Visibility Scorecard</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.gray300}`, padding: '4px 0' }}>
            <span><strong>3.</strong> Competitive Intelligence Matrix</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.gray300}`, padding: '4px 0' }}>
            <span><strong>4.</strong> LLM-Specific Performance Breakdown</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.gray300}`, padding: '4px 0' }}>
            <span><strong>5.</strong> Intent-Level Analysis</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.gray300}`, padding: '4px 0' }}>
            <span><strong>6.</strong> Source Authority & Ecosystem Analysis</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.gray300}`, padding: '4px 0' }}>
            <span><strong>7.</strong> Narrative Positioning Analysis</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.gray300}`, padding: '4px 0' }}>
            <span><strong>8.</strong> AI Prompts & Query Analysis</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.gray300}`, padding: '4px 0' }}>
            <span><strong>9.</strong> Strategic Action Plan</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.gray300}`, padding: '4px 0' }}>
            <span><strong>10.</strong> Risk & Exposure Assessment</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.gray300}`, padding: '4px 0' }}>
            <span><strong>11.</strong> Opportunity Index</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span><strong>12.</strong> Methodology & Appendix</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          2. EXECUTIVE SUMMARY
         ══════════════════════════════════════════════════════ */}
      <div style={S.sectionPage}>
        <div style={S.sectionHeader}>1. Executive Summary</div>
        <div style={S.sectionSubtitle}>Board-level strategic overview of {brandName}'s AI search visibility position</div>
        <div style={S.sectionDivider} />

        {/* Visibility Tier Callout */}
        <div style={{
          ...S.calloutCard,
          borderLeftColor: visibilityTier === 'Leader' ? COLORS.green : visibilityTier === 'Strong Performer' ? COLORS.blueLight : visibilityTier === 'Challenger' ? COLORS.amber : COLORS.red,
          backgroundColor: visibilityTier === 'Leader' ? COLORS.greenBg : visibilityTier === 'Strong Performer' ? COLORS.bluePale : visibilityTier === 'Challenger' ? COLORS.amberBg : COLORS.redBg,
          textAlign: 'center' as const,
          padding: '28px',
        }}>
          <div style={{ ...S.sansSerif, fontSize: '11px', color: COLORS.slateLight, textTransform: 'uppercase' as const, letterSpacing: '2px', marginBottom: '8px' }}>
            Overall Visibility Classification
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700' as const, color: COLORS.navy, marginBottom: '8px', fontFamily: "'Segoe UI', sans-serif" }}>
            {visibilityTier}
          </div>
          <div style={{ fontSize: '14px', color: COLORS.slateLight }}>
            AI Visibility Score: <strong style={{ color: COLORS.blue }}>{aiVisibility?.score || 0}</strong> · 
            Position #{aiVisibility?.brandPosition || '-'} of {aiVisibility?.totalBrands || '-'} brands analyzed
          </div>
        </div>

        {/* Strategic Diagnosis */}
        {executiveSummary?.brand_score_and_tier && (
          <div style={{ ...S.card, marginTop: '16px' }}>
            <div style={{ ...S.subsubsection, marginTop: 0, color: COLORS.navy }}>Strategic Diagnosis</div>
            <p style={S.text}>{executiveSummary.brand_score_and_tier}</p>
          </div>
        )}

        {/* 3 Critical Risks + 3 Opportunities side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          <div style={{ ...S.card, borderLeft: `4px solid ${COLORS.red}` }}>
            <div style={{ ...S.subsubsection, marginTop: 0, color: COLORS.red }}>Critical Risks</div>
            <ul style={{ paddingLeft: '18px', margin: 0 }}>
              {(executiveSummary?.weaknesses || []).slice(0, 3).map((w, i) => (
                <li key={i} style={{ ...S.text, marginBottom: '6px', fontSize: '9.5pt' }}>{w}</li>
              ))}
              {(!executiveSummary?.weaknesses || executiveSummary.weaknesses.length === 0) && (
                <li style={S.text}>No critical weaknesses identified in current analysis.</li>
              )}
            </ul>
          </div>
          <div style={{ ...S.card, borderLeft: `4px solid ${COLORS.green}` }}>
            <div style={{ ...S.subsubsection, marginTop: 0, color: COLORS.green }}>Growth Opportunities</div>
            <ul style={{ paddingLeft: '18px', margin: 0 }}>
              {(executiveSummary?.strengths || []).slice(0, 3).map((s, i) => (
                <li key={i} style={{ ...S.text, marginBottom: '6px', fontSize: '9.5pt' }}>{s}</li>
              ))}
              {(!executiveSummary?.strengths || executiveSummary.strengths.length === 0) && (
                <li style={S.text}>Analysis did not surface specific growth opportunities.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Competitive Position Snapshot */}
        {executiveSummary?.competitor_positioning && (
          <div style={{ ...S.card, marginTop: '16px' }}>
            <div style={{ ...S.subsubsection, marginTop: 0, color: COLORS.navy }}>Competitive Position Snapshot</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <div style={{ textAlign: 'center' as const }}>
                <div style={{ ...S.sansSerif, fontSize: '10px', color: COLORS.green, fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' as const }}>Leaders</div>
                {(executiveSummary.competitor_positioning.leaders || []).map((l, i) => (
                  <div key={i} style={{ ...S.sansSerif, fontSize: '11px', color: COLORS.slate, marginBottom: '2px' }}>{l.name}</div>
                ))}
                {(!executiveSummary.competitor_positioning.leaders || executiveSummary.competitor_positioning.leaders.length === 0) && (
                  <div style={{ ...S.sansSerif, fontSize: '11px', color: COLORS.slatePale }}>—</div>
                )}
              </div>
              <div style={{ textAlign: 'center' as const }}>
                <div style={{ ...S.sansSerif, fontSize: '10px', color: COLORS.amber, fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' as const }}>Challengers</div>
                {(executiveSummary.competitor_positioning.mid_tier || []).map((m, i) => (
                  <div key={i} style={{ ...S.sansSerif, fontSize: '11px', color: COLORS.slate, marginBottom: '2px' }}>{m.name}</div>
                ))}
                {(!executiveSummary.competitor_positioning.mid_tier || executiveSummary.competitor_positioning.mid_tier.length === 0) && (
                  <div style={{ ...S.sansSerif, fontSize: '11px', color: COLORS.slatePale }}>—</div>
                )}
              </div>
              <div style={{ textAlign: 'center' as const }}>
                <div style={{ ...S.sansSerif, fontSize: '10px', color: COLORS.red, fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' as const }}>Laggards</div>
                {(executiveSummary.competitor_positioning.laggards || []).map((l, i) => (
                  <div key={i} style={{ ...S.sansSerif, fontSize: '11px', color: COLORS.slate, marginBottom: '2px' }}>{l.name}</div>
                ))}
                {(!executiveSummary.competitor_positioning.laggards || executiveSummary.competitor_positioning.laggards.length === 0) && (
                  <div style={{ ...S.sansSerif, fontSize: '11px', color: COLORS.slatePale }}>—</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Immediate Priority Actions */}
        {executiveSummary?.prioritized_actions && executiveSummary.prioritized_actions.length > 0 && (
          <div style={{ ...S.calloutCard, marginTop: '16px' }}>
            <div style={{ ...S.subsubsection, marginTop: 0, color: COLORS.blue }}>Immediate Priority Actions</div>
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              {executiveSummary.prioritized_actions.slice(0, 5).map((action, idx) => (
                <li key={idx} style={{ ...S.text, marginBottom: '8px' }}>{action}</li>
              ))}
            </ol>
          </div>
        )}

        {executiveSummary?.conclusion && (
          <div style={{ ...S.card, marginTop: '16px', backgroundColor: COLORS.gray200 }}>
            <div style={{ ...S.subsubsection, marginTop: 0 }}>Strategic Conclusion</div>
            <p style={{ ...S.text, fontStyle: 'italic' as const }}>{executiveSummary.conclusion}</p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          3. AI VISIBILITY SCORECARD
         ══════════════════════════════════════════════════════ */}
      <div style={S.sectionPage}>
        <div style={S.sectionHeader}>2. AI Visibility Scorecard</div>
        <div style={S.sectionSubtitle}>Comprehensive visibility metrics derived from {totalPrompts} AI prompts across {llmModels.length} models</div>
        <div style={S.sectionDivider} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          <div style={S.kpiBlock}>
            <div style={S.kpiValue}>{aiVisibility?.score || 0}</div>
            <div style={S.kpiLabel}>AI Visibility Score</div>
            <div style={{ marginTop: '6px' }}><span style={tierBadge(aiVisibility?.tier || '')}>{aiVisibility?.tier || 'N/A'}</span></div>
          </div>
          <div style={S.kpiBlock}>
            <div style={S.kpiValue}>{totalMentions}</div>
            <div style={S.kpiLabel}>Total AI Mentions</div>
            <div style={S.kpiSub}>across all platforms</div>
          </div>
          <div style={S.kpiBlock}>
            <div style={S.kpiValue}>{shareOfVoice}%</div>
            <div style={S.kpiLabel}>Share of Voice</div>
            <div style={S.kpiSub}>vs. {brandInfo.length} competitors</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          <div style={S.kpiBlock}>
            <div style={S.kpiValue}>{rankQuality}</div>
            <div style={S.kpiLabel}>Rank Quality Index</div>
            <div style={S.kpiSub}>higher = better positions</div>
          </div>
          <div style={S.kpiBlock}>
            <div style={S.kpiValue}>{visConsistency}%</div>
            <div style={S.kpiLabel}>Visibility Consistency</div>
            <div style={S.kpiSub}>cross-model stability</div>
          </div>
          <div style={S.kpiBlock}>
            <div style={{ ...S.kpiValue, fontSize: '20px' }}>
              {competitiveGap > 0 ? `-${competitiveGap}%` : 'Leading'}
            </div>
            <div style={S.kpiLabel}>Competitive Gap</div>
            <div style={S.kpiSub}>vs. top competitor</div>
          </div>
        </div>

        {/* Tier Distribution */}
        {tierTotal > 0 && (
          <div style={S.card}>
            <div style={{ ...S.subsubsection, marginTop: 0 }}>Ranking Tier Distribution</div>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-around', marginTop: '12px' }}>
              <div style={{ textAlign: 'center' as const }}>
                <div style={{ ...S.sansSerif, fontSize: '26px', fontWeight: '700', color: COLORS.green }}>{tierTotal > 0 ? Math.round((totalT1 / tierTotal) * 100) : 0}%</div>
                <div style={{ ...S.kpiLabel, color: COLORS.green }}>T1 (#1 Position)</div>
                <div style={S.kpiSub}>{totalT1} appearances</div>
              </div>
              <div style={{ textAlign: 'center' as const }}>
                <div style={{ ...S.sansSerif, fontSize: '26px', fontWeight: '700', color: COLORS.amber }}>{tierTotal > 0 ? Math.round((totalT2 / tierTotal) * 100) : 0}%</div>
                <div style={{ ...S.kpiLabel, color: COLORS.amber }}>T2 (Rank 2-4)</div>
                <div style={S.kpiSub}>{totalT2} appearances</div>
              </div>
              <div style={{ textAlign: 'center' as const }}>
                <div style={{ ...S.sansSerif, fontSize: '26px', fontWeight: '700', color: COLORS.red }}>{tierTotal > 0 ? Math.round((totalT3 / tierTotal) * 100) : 0}%</div>
                <div style={{ ...S.kpiLabel, color: COLORS.red }}>T3 (Rank 5+)</div>
                <div style={S.kpiSub}>{totalT3} appearances</div>
              </div>
            </div>
          </div>
        )}

        {/* LLM Coverage Gap */}
        <div style={{ ...S.card, marginTop: '16px' }}>
          <div style={{ ...S.subsubsection, marginTop: 0 }}>LLM Coverage Analysis</div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>AI Model</th>
                <th style={{ ...S.th, textAlign: 'center' as const }}>Mentions</th>
                <th style={{ ...S.th, textAlign: 'center' as const }}>Avg. Rank</th>
                <th style={{ ...S.th, textAlign: 'center' as const }}>Sources</th>
                <th style={{ ...S.th, textAlign: 'center' as const }}>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(llmData).map(([llm, data], idx) => {
                const maxMentions = Math.max(...Object.values(llmData).map(d => d.mentions_count || 0), 1);
                const coverage = Math.round(((data.mentions_count || 0) / maxMentions) * 100);
                return (
                  <tr key={idx} style={idx % 2 === 1 ? S.tdAlt : {}}>
                    <td style={{ ...S.td, fontWeight: '600' }}>{getModelDisplayName(llm)}</td>
                    <td style={{ ...S.td, textAlign: 'center' }}>{data.mentions_count}</td>
                    <td style={{ ...S.td, textAlign: 'center' }}>{data.average_rank > 0 ? `#${data.average_rank.toFixed(1)}` : 'N/A'}</td>
                    <td style={{ ...S.td, textAlign: 'center' }}>{data.sources}</td>
                    <td style={{ ...S.td, textAlign: 'center' }}>
                      <span style={tierBadge(coverage >= 70 ? 'high' : coverage >= 40 ? 'medium' : 'low')}>{coverage}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          4. COMPETITIVE INTELLIGENCE MATRIX
         ══════════════════════════════════════════════════════ */}
      <div style={S.sectionPage}>
        <div style={S.sectionHeader}>3. Competitive Intelligence Matrix</div>
        <div style={S.sectionSubtitle}>Comprehensive competitive positioning analysis across {brandInfo.length} brands</div>
        <div style={S.sectionDivider} />

        {/* Competitive Ranking Table */}
        <div style={S.subsection}>Competitive Ranking Table</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Rank</th>
              <th style={S.th}>Brand</th>
              <th style={{ ...S.th, textAlign: 'center' as const }}>Visibility Score</th>
              <th style={{ ...S.th, textAlign: 'center' as const }}>Mention Score</th>
              <th style={{ ...S.th, textAlign: 'center' as const }}>Tier</th>
              <th style={{ ...S.th, textAlign: 'center' as const }}>Outlook</th>
              <th style={{ ...S.th, textAlign: 'center' as const }}>Threat Level</th>
            </tr>
          </thead>
          <tbody>
            {sortedBrands.map((brand, idx) => {
              const isCurrent = brand.brand === brandName;
              const threatLevel = brand.brand === brandName ? '—' :
                brand.geo_score > (brandData?.geo_score || 0) * 1.5 ? 'Critical' :
                brand.geo_score > (brandData?.geo_score || 0) ? 'High' :
                brand.geo_score > (brandData?.geo_score || 0) * 0.5 ? 'Medium' : 'Low';
              return (
                <tr key={idx} style={{
                  ...(idx % 2 === 1 ? S.tdAlt : {}),
                  backgroundColor: isCurrent ? COLORS.bluePale : (idx % 2 === 1 ? COLORS.gray100 : COLORS.white),
                  fontWeight: isCurrent ? '600' : 'normal',
                }}>
                  <td style={{ ...S.td, textAlign: 'center', fontWeight: '700' }}>{idx + 1}</td>
                  <td style={S.td}>{brand.brand}</td>
                  <td style={{ ...S.td, textAlign: 'center' }}>{brand.geo_score}</td>
                  <td style={{ ...S.td, textAlign: 'center' }}>{brand.mention_score}</td>
                  <td style={{ ...S.td, textAlign: 'center' }}><span style={tierBadge(brand.geo_tier)}>{brand.geo_tier}</span></td>
                  <td style={{ ...S.td, textAlign: 'center' }}><span style={tierBadge(brand.outlook)}>{brand.outlook}</span></td>
                  <td style={{ ...S.td, textAlign: 'center' }}>
                    {threatLevel !== '—' ? <span style={{ ...S.badge, color: severityColor(threatLevel), backgroundColor: 'transparent', fontWeight: '700' }}>{threatLevel}</span> : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Keyword Performance Matrix */}
        <div style={S.subsection}>Keyword Performance Matrix</div>
        <p style={{ ...S.sansSerif, color: COLORS.slateLight, marginBottom: '12px', fontSize: '10pt' }}>Brand mention frequency across analyzed keyword categories</p>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Brand</th>
              {keywordNames.map((kw, idx) => (
                <th key={idx} style={{ ...S.th, textAlign: 'center', fontSize: '8.5pt' }}>{kw}</th>
              ))}
              <th style={{ ...S.th, textAlign: 'center' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sortedCompetitorData.map((c, idx) => {
              const isPrimary = c.name === brandName;
              const total = c.keywordScores.reduce((sum, s) => sum + (Number(s) || 0), 0);
              return (
                <tr key={idx} style={{
                  backgroundColor: isPrimary ? COLORS.bluePale : (idx % 2 === 1 ? COLORS.gray100 : COLORS.white),
                  fontWeight: isPrimary ? '600' : 'normal',
                }}>
                  <td style={S.td}>{c.name}</td>
                  {c.keywordScores.map((score, sIdx) => (
                    <td key={sIdx} style={{ ...S.td, textAlign: 'center' }}>{score}</td>
                  ))}
                  <td style={{ ...S.td, textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: '4px', fontWeight: '700',
                      backgroundColor: isPrimary ? COLORS.navy : COLORS.gray200,
                      color: isPrimary ? COLORS.white : COLORS.navy,
                      fontSize: '11px',
                    }}>{total}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Brand Response Rates */}
        <div style={S.subsection}>Brand AI Response Rate</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Rank</th>
              <th style={S.th}>Brand</th>
              <th style={{ ...S.th, textAlign: 'center' }}>Response Rate</th>
              <th style={S.th}>Dominance</th>
            </tr>
          </thead>
          <tbody>
            {brandMentionRates.map((item, idx) => (
              <tr key={idx} style={{
                backgroundColor: item.isTestBrand ? COLORS.bluePale : (idx % 2 === 1 ? COLORS.gray100 : COLORS.white),
                fontWeight: item.isTestBrand ? '600' : 'normal',
              }}>
                <td style={{ ...S.td, textAlign: 'center' }}>{idx + 1}</td>
                <td style={S.td}>{item.brand}</td>
                <td style={{ ...S.td, textAlign: 'center', fontWeight: '700', color: COLORS.blue }}>{item.responseRate}%</td>
                <td style={S.td}>
                  <div style={{ width: '100%', height: '14px', backgroundColor: COLORS.gray300, borderRadius: '7px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(item.responseRate, 100)}%`, height: '100%', backgroundColor: item.isTestBrand ? COLORS.blue : COLORS.amber, borderRadius: '7px' }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════
          5. LLM-SPECIFIC PERFORMANCE BREAKDOWN
         ══════════════════════════════════════════════════════ */}
      <div style={S.sectionPage}>
        <div style={S.sectionHeader}>4. LLM-Specific Performance Breakdown</div>
        <div style={S.sectionSubtitle}>Individual AI model analysis with strategic interpretation and dependence risk</div>
        <div style={S.sectionDivider} />

        {Object.entries(llmData).map(([llm, data], idx) => {
          const maxMentions = Math.max(...Object.values(llmData).map(d => d.mentions_count || 0), 1);
          const penetration = Math.round(((data.mentions_count || 0) / maxMentions) * 100);
          const tierPenetration = ((data.t1 || 0) + (data.t2 || 0)) > 0 ? 
            Math.round(((data.t1 || 0) / ((data.t1 || 0) + (data.t2 || 0) + (data.t3 || 0))) * 100) : 0;
          const visGap = 100 - penetration;

          return (
            <div key={idx} style={{ ...S.card, marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ ...S.subsection, marginTop: 0, marginBottom: 0 }}>{getModelDisplayName(llm)}</div>
                <span style={tierBadge(penetration >= 60 ? 'high' : penetration >= 30 ? 'medium' : 'low')}>
                  {penetration >= 60 ? 'Strong' : penetration >= 30 ? 'Moderate' : 'Weak'} Coverage
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginTop: '14px' }}>
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ ...S.sansSerif, fontSize: '22px', fontWeight: '700', color: COLORS.blue }}>{data.mentions_count}</div>
                  <div style={S.kpiLabel}>Mentions</div>
                </div>
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ ...S.sansSerif, fontSize: '22px', fontWeight: '700', color: COLORS.navy }}>{data.average_rank > 0 ? `#${data.average_rank.toFixed(1)}` : 'N/A'}</div>
                  <div style={S.kpiLabel}>Avg Rank</div>
                </div>
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ ...S.sansSerif, fontSize: '22px', fontWeight: '700', color: COLORS.green }}>{tierPenetration}%</div>
                  <div style={S.kpiLabel}>T1 Penetration</div>
                </div>
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ ...S.sansSerif, fontSize: '22px', fontWeight: '700', color: visGap > 50 ? COLORS.red : COLORS.amber }}>{visGap}%</div>
                  <div style={S.kpiLabel}>Visibility Gap</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Model Dependence Risk */}
        <div style={{ ...S.calloutCard, borderLeftColor: COLORS.amber, backgroundColor: COLORS.amberBg }}>
          <div style={{ ...S.subsubsection, marginTop: 0, color: COLORS.gold }}>Model Dependence Risk Assessment</div>
          <p style={S.text}>
            {visConsistency >= 70
              ? `${brandName} demonstrates balanced visibility across AI models (${visConsistency}% consistency). This indicates low model-dependence risk — the brand's AI presence is not overly reliant on any single platform.`
              : visConsistency >= 40
              ? `${brandName} shows moderate variation in visibility across AI models (${visConsistency}% consistency). Certain models contribute disproportionately to overall brand presence, creating selective exposure risk.`
              : `${brandName} shows significant inconsistency across AI models (${visConsistency}% consistency). The brand's visibility is heavily concentrated in ${
                  Object.entries(llmData).sort(([, a], [, b]) => (b.mentions_count || 0) - (a.mentions_count || 0))[0]?.[0]
                    ? getModelDisplayName(Object.entries(llmData).sort(([, a], [, b]) => (b.mentions_count || 0) - (a.mentions_count || 0))[0][0])
                    : 'a single model'
                }, creating high platform-dependence risk.`
            }
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          6. INTENT-LEVEL ANALYSIS
         ══════════════════════════════════════════════════════ */}
      <div style={S.sectionPage}>
        <div style={S.sectionHeader}>5. Intent-Level Analysis</div>
        <div style={S.sectionSubtitle}>Visibility segmented by buyer journey stage — Discovery, Comparison, Pricing, Use Case, Trust</div>
        <div style={S.sectionDivider} />

        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Intent Category</th>
              <th style={{ ...S.th, textAlign: 'center' }}>Your Visibility</th>
              <th style={{ ...S.th, textAlign: 'center' }}>Strength</th>
              <th style={S.th}>Dominant Brand</th>
              <th style={{ ...S.th, textAlign: 'center' }}>Leader %</th>
              <th style={{ ...S.th, textAlign: 'center' }}>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {intentResults.map((result, idx) => {
              const riskLevel = result.presencePct === 0 ? 'Critical' :
                result.presencePct < 20 ? 'High' :
                result.presencePct < 40 ? 'Medium' : 'Low';
              return (
                <tr key={idx} style={idx % 2 === 1 ? S.tdAlt : {}}>
                  <td style={{ ...S.td, fontWeight: '600' }}>{result.intent}</td>
                  <td style={{ ...S.td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '12px', backgroundColor: COLORS.gray300, borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(result.presencePct, 100)}%`, height: '100%',
                          backgroundColor: result.presencePct >= 40 ? COLORS.green : result.presencePct >= 20 ? COLORS.amber : COLORS.red,
                          borderRadius: '6px',
                        }} />
                      </div>
                      <span style={{ ...S.sansSerif, fontSize: '11px', fontWeight: '700', minWidth: '35px' }}>{result.presencePct}%</span>
                    </div>
                  </td>
                  <td style={{ ...S.td, textAlign: 'center' }}><span style={tierBadge(result.status)}>{result.status}</span></td>
                  <td style={S.td}>{result.leader}</td>
                  <td style={{ ...S.td, textAlign: 'center', fontWeight: '600' }}>{result.leaderPct}%</td>
                  <td style={{ ...S.td, textAlign: 'center' }}>
                    <span style={{ ...S.badge, color: severityColor(riskLevel), backgroundColor: 'transparent', fontWeight: '700' }}>{riskLevel}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Strategic Implications */}
        {intentResults.some(i => i.presencePct < 20) && (
          <div style={{ ...S.calloutCard, marginTop: '16px' }}>
            <div style={{ ...S.subsubsection, marginTop: 0, color: COLORS.blue }}>Strategic Implications</div>
            <p style={S.text}>
              {brandName} has critical visibility gaps in {intentResults.filter(i => i.presencePct < 20).map(i => i.intent).join(', ')} intent categories. 
              These represent high-value buyer journey stages where competitors dominate the AI narrative. 
              Addressing these gaps should be prioritized in the 90-day roadmap.
            </p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          7. SOURCE AUTHORITY & ECOSYSTEM ANALYSIS
         ══════════════════════════════════════════════════════ */}
      <div style={S.sectionPage}>
        <div style={S.sectionHeader}>6. Source Authority & Ecosystem Analysis</div>
        <div style={S.sectionSubtitle}>Analysis of content channels driving AI brand recommendations and competitive ecosystem positioning</div>
        <div style={S.sectionDivider} />

        {sourceAuthorityData.length > 0 && (
          <>
            <div style={S.subsection}>Source Authority Map</div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Source Type</th>
                  {allBrandsForSources.map(brand => (
                    <th key={brand} style={{
                      ...S.th, textAlign: 'center', fontSize: '8.5pt',
                      backgroundColor: brand === brandName ? '#1e3a8a' : COLORS.navy,
                    }}>{brand}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sourceAuthorityData.map((source: any, idx: number) => (
                  <tr key={idx} style={idx % 2 === 1 ? S.tdAlt : {}}>
                    <td style={{ ...S.td, fontWeight: '600' }}>{source.name}</td>
                    {allBrandsForSources.map(brand => {
                      const mentions = source[`${brand}Mentions`] || 0;
                      const isPrimary = brand === brandName;
                      return (
                        <td key={brand} style={{ ...S.td, textAlign: 'center', backgroundColor: isPrimary ? COLORS.bluePale : undefined }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '28px', height: '28px', borderRadius: '50%', fontSize: '11px', fontWeight: '700',
                            backgroundColor: mentions > 0 ? (isPrimary ? '#dbeafe' : COLORS.greenBg) : COLORS.redBg,
                            color: mentions > 0 ? (isPrimary ? COLORS.blue : COLORS.green) : COLORS.red,
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

        {/* Ecosystem Risk Assessment */}
        <div style={{ ...S.card, marginTop: '16px' }}>
          <div style={{ ...S.subsubsection, marginTop: 0 }}>Ecosystem Risk Indicators</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <div style={{ ...S.riskCard, borderLeftColor: reviewAbsent ? COLORS.red : COLORS.green, backgroundColor: reviewAbsent ? COLORS.redBg : COLORS.greenBg }}>
              <div style={{ ...S.sansSerif, fontSize: '11px', fontWeight: '700', color: reviewAbsent ? COLORS.red : COLORS.green }}>
                Review Site Visibility: {reviewAbsent ? 'AT RISK' : 'COVERED'}
              </div>
              <div style={{ ...S.sansSerif, fontSize: '10px', color: COLORS.slateLight, marginTop: '4px' }}>
                {reviewAbsent ? 'No review site citations detected — AI models may lack third-party validation signals.' : 'Review platforms contributing to AI brand mentions.'}
              </div>
            </div>
            <div style={{ ...S.riskCard, borderLeftColor: Object.keys(platformPresence).length < 3 ? COLORS.amber : COLORS.green, backgroundColor: Object.keys(platformPresence).length < 3 ? COLORS.amberBg : COLORS.greenBg }}>
              <div style={{ ...S.sansSerif, fontSize: '11px', fontWeight: '700', color: Object.keys(platformPresence).length < 3 ? COLORS.amber : COLORS.green }}>
                Platform Presence: {Object.keys(platformPresence).length} platforms
              </div>
              <div style={{ ...S.sansSerif, fontSize: '10px', color: COLORS.slateLight, marginTop: '4px' }}>
                {Object.keys(platformPresence).length < 3 ? 'Limited platform footprint may reduce AI citation breadth.' : 'Healthy multi-platform presence supports AI visibility.'}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Source Breakdown */}
        {sourcesAndContentImpact && Object.keys(sourcesAndContentImpact).length > 0 && (
          <>
            <div style={S.subsection}>Detailed Source & Content Impact</div>
            {Object.entries(sourcesAndContentImpact).map(([sourceName, sourceData]: [string, any], idx) => (
              <div key={idx} style={{ ...S.card, marginBottom: '12px' }}>
                <div style={{ ...S.subsubsection, marginTop: 0 }}>{sourceName}</div>

                {sourceData.pages_used && sourceData.pages_used.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ ...S.sansSerif, fontSize: '10px', color: COLORS.slateLight, fontWeight: '600', marginBottom: '4px' }}>
                      Referenced URLs ({sourceData.pages_used.length})
                    </div>
                    {sourceData.pages_used.slice(0, 5).map((url: string, uIdx: number) => (
                      <div key={uIdx} style={{ ...S.sansSerif, fontSize: '9pt', color: COLORS.blue, wordBreak: 'break-all' as const, marginBottom: '2px' }}>{url}</div>
                    ))}
                    {sourceData.pages_used.length > 5 && (
                      <div style={{ ...S.sansSerif, fontSize: '9pt', color: COLORS.slatePale }}>+{sourceData.pages_used.length - 5} more sources</div>
                    )}
                  </div>
                )}

                {sourceData.mentions && Object.keys(sourceData.mentions).length > 0 && (
                  <table style={{ ...S.table, marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th style={S.th}>Brand</th>
                        <th style={{ ...S.th, textAlign: 'center' }}>Citations</th>
                        <th style={{ ...S.th, textAlign: 'center' }}>Impact Score</th>
                        <th style={S.th}>Insight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(sourceData.mentions)
                        .sort(([, a]: [string, any], [, b]: [string, any]) => b.count - a.count)
                        .map(([brand, mentionData]: [string, any], mIdx: number) => {
                          const isCurrent = brand === brandName;
                          return (
                            <tr key={mIdx} style={{
                              backgroundColor: isCurrent ? COLORS.bluePale : (mIdx % 2 === 1 ? COLORS.gray100 : COLORS.white),
                              fontWeight: isCurrent ? '600' : 'normal',
                            }}>
                              <td style={S.td}>{brand}</td>
                              <td style={{ ...S.td, textAlign: 'center' }}>{mentionData.count}</td>
                              <td style={{ ...S.td, textAlign: 'center' }}>{Math.round(mentionData.score * 100)}%</td>
                              <td style={{ ...S.td, fontSize: '9pt' }}>{mentionData.insight}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          8. NARRATIVE POSITIONING ANALYSIS
         ══════════════════════════════════════════════════════ */}
      <div style={S.sectionPage}>
        <div style={S.sectionHeader}>7. Narrative Positioning Analysis</div>
        <div style={S.sectionSubtitle}>How AI models perceive, frame, and communicate each brand's market identity</div>
        <div style={S.sectionDivider} />

        {/* Primary brand narrative */}
        {brandData && (
          <div style={{ ...S.calloutCard, marginBottom: '20px' }}>
            <div style={{ ...S.subsection, marginTop: 0, marginBottom: '8px', color: COLORS.blue }}>
              {brandName} — AI Brand Perception
            </div>
            <p style={{ ...S.text, marginBottom: '12px' }}>{brandData.summary}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ ...S.sansSerif, fontSize: '10px', color: COLORS.slateLight, fontWeight: '600', marginBottom: '4px' }}>MARKET POSITIONING</div>
                <div style={{ ...S.sansSerif, fontSize: '11px', color: COLORS.navy }}>{brandData.geo_tier} Tier · Score {brandData.geo_score}</div>
              </div>
              <div>
                <div style={{ ...S.sansSerif, fontSize: '10px', color: COLORS.slateLight, fontWeight: '600', marginBottom: '4px' }}>AI SENTIMENT</div>
                <span style={tierBadge(brandData.outlook)}>{brandData.outlook}</span>
              </div>
            </div>
          </div>
        )}

        {/* All brand narratives */}
        <div style={S.subsection}>Competitor Narrative Profiles</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Brand</th>
              <th style={S.th}>AI Narrative Summary</th>
              <th style={{ ...S.th, textAlign: 'center', width: '100px' }}>Outlook</th>
            </tr>
          </thead>
          <tbody>
            {sortedSentiment.map((item, idx) => {
              const isPrimary = item.brand === brandName;
              return (
                <tr key={idx} style={{
                  backgroundColor: isPrimary ? COLORS.bluePale : (idx % 2 === 1 ? COLORS.gray100 : COLORS.white),
                  fontWeight: isPrimary ? '600' : 'normal',
                }}>
                  <td style={{ ...S.td, fontWeight: '600' }}>{item.brand}</td>
                  <td style={{ ...S.td, fontSize: '9.5pt' }}>{item.summary}</td>
                  <td style={{ ...S.td, textAlign: 'center' }}><span style={tierBadge(item.outlook)}>{item.outlook}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════
          9. AI PROMPTS & QUERY ANALYSIS
         ══════════════════════════════════════════════════════ */}
      <div style={S.sectionPage}>
        <div style={S.sectionHeader}>8. AI Prompts & Query Analysis</div>
        <div style={S.sectionSubtitle}>Detailed breakdown of {totalPrompts} prompts across {keywords.length} keyword categories</div>
        <div style={S.sectionDivider} />

        {/* Summary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          <div style={S.kpiBlock}>
            <div style={S.kpiValue}>{keywords.length}</div>
            <div style={S.kpiLabel}>Keywords</div>
          </div>
          <div style={S.kpiBlock}>
            <div style={S.kpiValue}>{totalPrompts}</div>
            <div style={S.kpiLabel}>Total Prompts</div>
          </div>
          <div style={S.kpiBlock}>
            <div style={S.kpiValue}>{llmModels.length}</div>
            <div style={S.kpiLabel}>AI Models Tested</div>
          </div>
        </div>

        {keywords.map((kw, idx) => {
          const brandScore = getBrandScoreForKeyword(kw.id);
          const brandsToDisplay = getBrandsForKeyword(kw.id);

          return (
            <div key={idx} style={{ ...S.card, marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ ...S.subsection, marginTop: 0, marginBottom: '2px', fontSize: '14px' }}>Keyword: {kw.name}</div>
                  <div style={{ ...S.sansSerif, fontSize: '10px', color: COLORS.slateLight }}>{kw.prompts?.length || 0} prompts analyzed</div>
                </div>
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '40px', height: '40px', borderRadius: '50%', fontSize: '16px', fontWeight: '700',
                    backgroundColor: brandScore >= 3 ? COLORS.greenBg : brandScore >= 1 ? COLORS.amberBg : COLORS.redBg,
                    color: brandScore >= 3 ? COLORS.green : brandScore >= 1 ? COLORS.amber : COLORS.red,
                    border: `2px solid ${brandScore >= 3 ? COLORS.greenBorder : brandScore >= 1 ? COLORS.amberBorder : COLORS.redBorder}`,
                  }}>{brandScore}</div>
                  <div style={{ ...S.sansSerif, fontSize: '9px', color: COLORS.slatePale, marginTop: '4px' }}>Your Mentions</div>
                </div>
              </div>

              {/* Prompts Table */}
              <table style={{ ...S.table, fontSize: '9pt', marginBottom: '12px' }}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: '36px' }}>#</th>
                    <th style={S.th}>AI Search Prompt</th>
                    {kw.prompts[0]?.category && <th style={{ ...S.th, width: '100px' }}>Intent</th>}
                  </tr>
                </thead>
                <tbody>
                  {kw.prompts.map((prompt, pIdx) => (
                    <tr key={pIdx} style={pIdx % 2 === 1 ? S.tdAlt : {}}>
                      <td style={{ ...S.td, textAlign: 'center' }}>{pIdx + 1}</td>
                      <td style={S.td}>{prompt.query}</td>
                      {kw.prompts[0]?.category && <td style={S.td}>{prompt.category || '-'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Brand Mentions for this keyword */}
              <div style={{ ...S.sansSerif, fontSize: '10px', fontWeight: '600', color: COLORS.slate, marginBottom: '6px' }}>Brand Mentions for "{kw.name}"</div>
              <table style={{ ...S.table, fontSize: '9pt' }}>
                <thead>
                  <tr>
                    <th style={S.th}>Brand</th>
                    <th style={{ ...S.th, width: '80px', textAlign: 'center' }}>Mentions</th>
                    <th style={{ ...S.th, width: '100px', textAlign: 'center' }}>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {brandsToDisplay.map((brand, bIdx) => {
                    const score = brand.mention_breakdown?.[kw.id] || 0;
                    const isBrand = brand.brand === brandName;
                    return (
                      <tr key={bIdx} style={{
                        backgroundColor: isBrand ? COLORS.bluePale : (bIdx % 2 === 1 ? COLORS.gray100 : COLORS.white),
                        fontWeight: isBrand ? '600' : 'normal',
                      }}>
                        <td style={S.td}>{brand.brand}</td>
                        <td style={{ ...S.td, textAlign: 'center' }}>{score}</td>
                        <td style={{ ...S.td, textAlign: 'center' }}>
                          <span style={tierBadge(score >= 3 ? 'high' : score >= 1 ? 'medium' : 'low')}>
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

        {/* Model-Wise Prompt Analysis */}
        <div style={S.subsection}>Model-Wise Prompt Analysis</div>
        <p style={{ ...S.sansSerif, color: COLORS.slateLight, marginBottom: '12px', fontSize: '10pt' }}>Which brands each AI model recommends per prompt</p>
        {keywords.map((kw, kwIdx) => (
          <div key={kwIdx} style={{ ...S.card, marginBottom: '12px' }}>
            <div style={{ ...S.subsubsection, marginTop: 0 }}>Keyword: {kw.name}</div>
            <table style={{ ...S.table, fontSize: '8.5pt' }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: '36px' }}>#</th>
                  <th style={S.th}>Prompt</th>
                  {llmModels.map(model => (
                    <th key={model} style={{ ...S.th, textAlign: 'center', fontSize: '8.5pt' }}>{getModelDisplayName(model)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kw.prompts.map((prompt, pIdx) => (
                  <tr key={pIdx} style={pIdx % 2 === 1 ? S.tdAlt : {}}>
                    <td style={{ ...S.td, textAlign: 'center' }}>{pIdx + 1}</td>
                    <td style={{ ...S.td, maxWidth: '200px' }}>{prompt.query}</td>
                    {llmModels.map(model => {
                      const brands = prompt.brands_per_llm?.[model] || [];
                      const hasBrand = brands.includes(brandName);
                      return (
                        <td key={model} style={{
                          ...S.td, textAlign: 'center', fontSize: '8pt',
                          backgroundColor: hasBrand ? COLORS.bluePale : undefined,
                        }}>
                          {brands.length > 0 ? brands.map((b, i) => (
                            <span key={i} style={{
                              display: 'block',
                              fontWeight: b === brandName ? '700' : 'normal',
                              color: b === brandName ? COLORS.blue : COLORS.slate,
                            }}>
                              {i + 1}. {b}
                            </span>
                          )) : <span style={{ color: COLORS.slatePale }}>—</span>}
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
          10. STRATEGIC ACTION PLAN
         ══════════════════════════════════════════════════════ */}
      {recommendations && recommendations.length > 0 && (
        <div style={S.sectionPage}>
          <div style={S.sectionHeader}>9. Strategic Action Plan</div>
          <div style={S.sectionSubtitle}>Prioritized roadmap with effort-impact analysis and execution framework</div>
          <div style={S.sectionDivider} />

          {/* Priority Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div style={{ ...S.kpiBlock, borderLeft: `4px solid ${COLORS.green}` }}>
              <div style={{ ...S.kpiValue, color: COLORS.green }}>{recommendations.filter(r => r.impact === 'High').length}</div>
              <div style={S.kpiLabel}>High Impact</div>
            </div>
            <div style={{ ...S.kpiBlock, borderLeft: `4px solid ${COLORS.amber}` }}>
              <div style={{ ...S.kpiValue, color: COLORS.amber }}>{recommendations.filter(r => r.impact === 'Medium').length}</div>
              <div style={S.kpiLabel}>Medium Impact</div>
            </div>
            <div style={{ ...S.kpiBlock, borderLeft: `4px solid ${COLORS.blue}` }}>
              <div style={{ ...S.kpiValue, color: COLORS.blue }}>{fastWins.length}</div>
              <div style={S.kpiLabel}>Quick Wins</div>
              <div style={S.kpiSub}>Low effort, high impact</div>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.map((rec: any, idx: number) => (
            <div key={idx} style={{ ...S.card, marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' as const, alignItems: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: COLORS.navy, color: COLORS.white, fontWeight: '700', fontSize: '12px',
                  fontFamily: "'Segoe UI', sans-serif",
                }}>{idx + 1}</span>
                <span style={{ ...S.sansSerif, fontSize: '13px', fontWeight: '700', color: COLORS.navy }}>Recommendation {idx + 1}</span>
                <span style={tierBadge(rec.impact === 'High' ? 'high' : rec.impact === 'Medium' ? 'medium' : 'low')}>Impact: {rec.impact}</span>
                <span style={tierBadge(rec.overall_effort === 'Low' ? 'high' : rec.overall_effort === 'Medium' ? 'medium' : 'low')}>Effort: {rec.overall_effort}</span>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ ...S.sansSerif, fontSize: '10px', fontWeight: '600', color: COLORS.slateLight, marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Strategic Insight</div>
                <p style={{ ...S.text, fontSize: '9.5pt' }}>{rec.insight?.summary || rec.overall_insight}</p>
              </div>

              {rec.suggested_action && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ ...S.sansSerif, fontSize: '10px', fontWeight: '600', color: COLORS.slateLight, marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Recommended Action</div>
                  <p style={{ ...S.text, fontSize: '9.5pt' }}>{rec.suggested_action}</p>
                </div>
              )}

              {rec.suggested_action_v1 && typeof rec.suggested_action_v1 === 'object' && Object.keys(rec.suggested_action_v1).length > 0 && (
                <div style={{ padding: '14px', backgroundColor: COLORS.bluePale, borderRadius: '6px', border: `1px solid ${COLORS.blueBorder}` }}>
                  <div style={{ ...S.sansSerif, fontSize: '10px', fontWeight: '600', color: COLORS.blue, marginBottom: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Execution Plan</div>

                  {rec.suggested_action_v1.strategy && (
                    <p style={{ ...S.text, fontWeight: '600', marginBottom: '8px' }}>{rec.suggested_action_v1.strategy}</p>
                  )}
                  {rec.suggested_action_v1.start_here && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ ...S.sansSerif, fontSize: '10px', fontWeight: '600', color: COLORS.blue, marginBottom: '2px' }}>▶ Start Here</div>
                      <p style={{ ...S.text, fontSize: '9.5pt' }}>{rec.suggested_action_v1.start_here}</p>
                    </div>
                  )}
                  {Array.isArray(rec.suggested_action_v1.how_to_execute) && rec.suggested_action_v1.how_to_execute.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ ...S.sansSerif, fontSize: '10px', fontWeight: '600', color: COLORS.blue, marginBottom: '2px' }}>Steps to Execute</div>
                      <ol style={{ paddingLeft: '20px', margin: '0' }}>
                        {rec.suggested_action_v1.how_to_execute.map((step: string, stepIdx: number) => (
                          <li key={stepIdx} style={{ ...S.text, marginBottom: '4px', fontSize: '9.5pt' }}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {rec.suggested_action_v1.success_signal && (
                    <div style={{ borderTop: `1px solid ${COLORS.blueBorder}`, paddingTop: '8px' }}>
                      <div style={{ ...S.sansSerif, fontSize: '10px', fontWeight: '600', color: COLORS.blue, marginBottom: '2px' }}>✓ Success Signal</div>
                      <p style={{ ...S.text, fontSize: '9.5pt', fontStyle: 'italic' as const }}>{rec.suggested_action_v1.success_signal}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* 90-Day Roadmap */}
          {executiveSummary?.prioritized_actions && executiveSummary.prioritized_actions.length > 0 && (
            <div style={{ ...S.calloutCard, marginTop: '16px' }}>
              <div style={{ ...S.subsubsection, marginTop: 0, color: COLORS.blue }}>90-Day Priority Roadmap</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '8px' }}>
                <div>
                  <div style={{ ...S.sansSerif, fontSize: '10px', fontWeight: '700', color: COLORS.green, marginBottom: '6px', textTransform: 'uppercase' as const }}>Days 1-30: Foundation</div>
                  {executiveSummary.prioritized_actions.slice(0, Math.ceil(executiveSummary.prioritized_actions.length / 3)).map((a, i) => (
                    <div key={i} style={{ ...S.sansSerif, fontSize: '9.5pt', color: COLORS.slate, marginBottom: '4px', paddingLeft: '8px', borderLeft: `2px solid ${COLORS.green}` }}>{a}</div>
                  ))}
                </div>
                <div>
                  <div style={{ ...S.sansSerif, fontSize: '10px', fontWeight: '700', color: COLORS.amber, marginBottom: '6px', textTransform: 'uppercase' as const }}>Days 31-60: Acceleration</div>
                  {executiveSummary.prioritized_actions.slice(Math.ceil(executiveSummary.prioritized_actions.length / 3), Math.ceil(executiveSummary.prioritized_actions.length * 2 / 3)).map((a, i) => (
                    <div key={i} style={{ ...S.sansSerif, fontSize: '9.5pt', color: COLORS.slate, marginBottom: '4px', paddingLeft: '8px', borderLeft: `2px solid ${COLORS.amber}` }}>{a}</div>
                  ))}
                </div>
                <div>
                  <div style={{ ...S.sansSerif, fontSize: '10px', fontWeight: '700', color: COLORS.blue, marginBottom: '6px', textTransform: 'uppercase' as const }}>Days 61-90: Scale</div>
                  {executiveSummary.prioritized_actions.slice(Math.ceil(executiveSummary.prioritized_actions.length * 2 / 3)).map((a, i) => (
                    <div key={i} style={{ ...S.sansSerif, fontSize: '9.5pt', color: COLORS.slate, marginBottom: '4px', paddingLeft: '8px', borderLeft: `2px solid ${COLORS.blue}` }}>{a}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          11. RISK & EXPOSURE ASSESSMENT
         ══════════════════════════════════════════════════════ */}
      <div style={S.sectionPage}>
        <div style={S.sectionHeader}>10. Risk & Exposure Assessment</div>
        <div style={S.sectionSubtitle}>Enterprise risk evaluation across AI search visibility dimensions</div>
        <div style={S.sectionDivider} />

        {[
          {
            title: 'AI Invisibility Risk',
            severity: isInvisible ? 'Critical' : aiVisibility?.score < 50 ? 'Medium' : 'Low',
            desc: isInvisible
              ? `${brandName} scores below 30 on AI visibility — effectively invisible in most AI-generated responses. Immediate intervention required.`
              : `${brandName} maintains ${aiVisibility?.tier?.toLowerCase()} visibility across AI platforms with a score of ${aiVisibility?.score}.`,
          },
          {
            title: 'Competitive Encroachment Risk',
            severity: topThreat ? 'High' : competitiveGap > 30 ? 'Medium' : 'Low',
            desc: topThreat
              ? `${topCompetitor?.brand} dominates with ${topCompetitor?.geo_score} vs. your ${brandData?.geo_score || 0}, creating significant competitive displacement risk in AI recommendations.`
              : `Competitive gap is ${competitiveGap}% — ${competitiveGap < 15 ? 'manageable and within striking distance' : 'present but addressable with targeted action'}.`,
          },
          {
            title: 'Trust Deficit Risk',
            severity: trustDeficit ? 'High' : sentiment?.dominant_sentiment === 'Neutral' ? 'Medium' : 'Low',
            desc: trustDeficit
              ? `AI models currently frame ${brandName} with negative sentiment. This directly impacts conversion from AI-recommended traffic.`
              : `Brand sentiment is ${sentiment?.dominant_sentiment?.toLowerCase() || 'neutral'} — ${sentiment?.dominant_sentiment === 'Positive' ? 'a strong trust signal in AI narratives' : 'not yet a competitive differentiator'}.`,
          },
          {
            title: 'Review Ecosystem Absence Risk',
            severity: reviewAbsent ? 'High' : 'Low',
            desc: reviewAbsent
              ? `No review platform citations detected. AI models heavily weight third-party validation — absence creates a significant authority gap.`
              : `Review platform citations present, supporting AI model confidence in brand recommendations.`,
          },
          {
            title: 'Enterprise Query Failure Risk',
            severity: zeroIntents.length >= 3 ? 'Critical' : zeroIntents.length >= 1 ? 'Medium' : 'Low',
            desc: zeroIntents.length > 0
              ? `Zero visibility in ${zeroIntents.map(i => i.intent).join(', ')} intent categories — ${zeroIntents.length >= 3 ? 'representing a systemic visibility failure' : 'creating gaps in buyer journey coverage'}.`
              : `Brand maintains presence across all measured intent categories.`,
          },
        ].map((risk, idx) => (
          <div key={idx} style={{
            ...S.riskCard,
            borderLeftColor: severityColor(risk.severity),
            backgroundColor: risk.severity === 'Critical' ? COLORS.redBg : risk.severity === 'High' ? '#fff7ed' : COLORS.gray100,
            marginBottom: '14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ ...S.sansSerif, fontSize: '13px', fontWeight: '700', color: COLORS.navy }}>{risk.title}</div>
              <span style={{ ...S.badge, color: severityColor(risk.severity), backgroundColor: 'transparent', fontWeight: '700', fontSize: '11px' }}>
                {risk.severity}
              </span>
            </div>
            <p style={{ ...S.text, fontSize: '9.5pt', margin: 0 }}>{risk.desc}</p>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          12. OPPORTUNITY INDEX
         ══════════════════════════════════════════════════════ */}
      <div style={S.sectionPage}>
        <div style={S.sectionHeader}>11. Opportunity Index</div>
        <div style={S.sectionSubtitle}>Strategic growth vectors and high-leverage opportunities identified from analysis data</div>
        <div style={S.sectionDivider} />

        {/* Fastest Wins */}
        {fastWins.length > 0 && (
          <div style={{ ...S.card, borderLeft: `4px solid ${COLORS.green}` }}>
            <div style={{ ...S.subsection, marginTop: 0, marginBottom: '8px', color: COLORS.green }}>Fastest Win Opportunities</div>
            {fastWins.map((fw, i) => (
              <div key={i} style={{ marginBottom: '8px', paddingLeft: '12px', borderLeft: `2px solid ${COLORS.greenBorder}` }}>
                <p style={{ ...S.text, fontSize: '9.5pt', margin: 0 }}>{fw.insight?.summary || fw.overall_insight}</p>
              </div>
            ))}
          </div>
        )}

        {/* High Leverage Intent Areas */}
        {highLeverageIntents.length > 0 && (
          <div style={{ ...S.card, borderLeft: `4px solid ${COLORS.blue}`, marginTop: '14px' }}>
            <div style={{ ...S.subsection, marginTop: 0, marginBottom: '8px', color: COLORS.blue }}>High-Leverage Intent Categories</div>
            <p style={{ ...S.text, fontSize: '9.5pt', marginBottom: '8px' }}>
              These intent categories have low brand presence ({'<'}40%) but high competitor activity ({'>'}50%), representing the largest opportunity gaps:
            </p>
            {highLeverageIntents.map((intent, i) => (
              <div key={i} style={{ ...S.sansSerif, fontSize: '11px', color: COLORS.navy, marginBottom: '4px' }}>
                <strong>{intent.intent}</strong>: Your visibility {intent.presencePct}% vs. leader at {intent.leaderPct}% ({intent.leader})
              </div>
            ))}
          </div>
        )}

        {/* Model-Specific Growth */}
        {modelGrowthAreas.length > 0 && (
          <div style={{ ...S.card, borderLeft: `4px solid ${COLORS.amber}`, marginTop: '14px' }}>
            <div style={{ ...S.subsection, marginTop: 0, marginBottom: '8px', color: COLORS.gold }}>Model-Specific Growth Areas</div>
            <p style={{ ...S.text, fontSize: '9.5pt' }}>
              {brandName} is under-represented on {modelGrowthAreas.join(', ')}. 
              Targeted optimization for these models could significantly increase overall AI visibility with relatively low incremental effort.
            </p>
          </div>
        )}

        {/* Underserved Keywords */}
        {keywords.some(kw => getBrandScoreForKeyword(kw.id) === 0) && (
          <div style={{ ...S.card, borderLeft: `4px solid ${COLORS.red}`, marginTop: '14px' }}>
            <div style={{ ...S.subsection, marginTop: 0, marginBottom: '8px', color: COLORS.red }}>Zero-Visibility Keywords</div>
            <p style={{ ...S.text, fontSize: '9.5pt', marginBottom: '8px' }}>
              The following keywords returned zero mentions for {brandName} — representing immediate optimization targets:
            </p>
            {keywords.filter(kw => getBrandScoreForKeyword(kw.id) === 0).map((kw, i) => (
              <div key={i} style={{ ...S.sansSerif, fontSize: '11px', color: COLORS.red, marginBottom: '2px' }}>• {kw.name}</div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          13. METHODOLOGY & APPENDIX
         ══════════════════════════════════════════════════════ */}
      <div style={S.sectionPage}>
        <div style={S.sectionHeader}>12. Methodology & Appendix</div>
        <div style={S.sectionSubtitle}>Data collection, scoring methodology, and analytical framework</div>
        <div style={S.sectionDivider} />

        <div style={S.card}>
          <div style={{ ...S.subsection, marginTop: 0 }}>Data Collection Protocol</div>
          <p style={S.text}>
            This intelligence report was generated by systematically querying {llmModels.length} AI language models 
            ({Object.keys(llmData).map(getModelDisplayName).join(', ')}) across {keywords.length} keyword categories 
            using {totalPrompts} unique prompts designed to simulate real user search behavior across different buyer intent stages.
          </p>
        </div>

        <div style={S.card}>
          <div style={{ ...S.subsection, marginTop: 0 }}>Scoring Methodology</div>
          <p style={S.text}>
            <strong>AI Visibility Score:</strong> Composite metric calculated from brand ranking positions across all queries, 
            weighted by mention frequency, position tier (T1/T2/T3), and cross-model consistency.
          </p>
          <p style={S.text}>
            <strong>Share of Voice:</strong> Percentage of total brand mentions attributed to the analyzed brand across all 
            competitors ({shareOfVoice}% for {brandName}).
          </p>
          <p style={S.text}>
            <strong>Rank Quality Index:</strong> Normalized score (0-100) derived from average ranking position across all AI responses. 
            Higher scores indicate more frequent top-position appearances.
          </p>
          <p style={S.text}>
            <strong>Visibility Consistency:</strong> Measures cross-model stability using coefficient of variation. 
            Score of 100% indicates identical performance across all AI platforms.
          </p>
          <p style={S.text}>
            <strong>Competitive Gap:</strong> Percentage difference between the analyzed brand's visibility score and the 
            highest-scoring competitor.
          </p>
        </div>

        <div style={S.card}>
          <div style={{ ...S.subsection, marginTop: 0 }}>Tier Classification</div>
          <table style={{ ...S.table, marginBottom: 0 }}>
            <thead>
              <tr>
                <th style={S.th}>Classification</th>
                <th style={S.th}>Score Range</th>
                <th style={S.th}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={S.td}><span style={tierBadge('Leader')}>Leader</span></td>
                <td style={S.td}>70+</td>
                <td style={S.td}>Dominant position in AI-generated recommendations</td>
              </tr>
              <tr style={S.tdAlt}>
                <td style={S.td}><span style={tierBadge('Strong Performer')}>Strong Performer</span></td>
                <td style={S.td}>50-69</td>
                <td style={S.td}>Consistent presence with room for optimization</td>
              </tr>
              <tr>
                <td style={S.td}><span style={tierBadge('Challenger')}>Challenger</span></td>
                <td style={S.td}>30-49</td>
                <td style={S.td}>Emerging presence requiring strategic intervention</td>
              </tr>
              <tr style={S.tdAlt}>
                <td style={S.td}><span style={tierBadge('Laggard')}>Laggard</span></td>
                <td style={S.td}>&lt;30</td>
                <td style={S.td}>Minimal visibility — significant investment needed</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={S.card}>
          <div style={{ ...S.subsection, marginTop: 0 }}>LLM Testing Protocol</div>
          <p style={S.text}>
            Each AI model was queried independently using standardized prompt templates. Responses were parsed to identify 
            brand mentions, ranking positions, and source citations. Results represent a snapshot of AI model behavior at the 
            time of analysis and may vary with model updates or different query formulations.
          </p>
        </div>

        <div style={S.card}>
          <div style={{ ...S.subsection, marginTop: 0 }}>Source Attribution</div>
          <p style={S.text}>
            Source analysis identifies content platforms and websites that AI models reference when generating brand-related 
            responses. Source authority is inferred from citation frequency and cross-model reference patterns. 
            {Object.keys(sourcesAndContentImpact || {}).length} source categories were analyzed.
          </p>
        </div>

        {/* Confidentiality Notice */}
        <div style={{
          marginTop: '24px', padding: '20px', backgroundColor: COLORS.gray200,
          borderRadius: '8px', border: `1px solid ${COLORS.gray300}`, textAlign: 'center' as const,
        }}>
          <div style={{ ...S.sansSerif, fontSize: '11px', fontWeight: '700', color: COLORS.navy, marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '2px' }}>
            Confidentiality Notice
          </div>
          <p style={{ ...S.sansSerif, fontSize: '9.5pt', color: COLORS.slateLight, lineHeight: '1.6', margin: 0 }}>
            This report contains proprietary competitive intelligence and is intended solely for the use of {brandName} and its authorized representatives. 
            Distribution, reproduction, or disclosure to third parties without written consent from GeoRankers is strictly prohibited. 
            The analysis methodology, scoring frameworks, and derived insights constitute the intellectual property of GeoRankers AI Search Intelligence Platform.
          </p>
        </div>

        {/* Brand Summaries Appendix */}
        <div style={{ ...S.subsection, marginTop: '28px' }}>Appendix: Brand Intelligence Summaries</div>
        {sortedBrands.map((brand, idx) => (
          <div key={idx} style={{ ...S.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ ...S.sansSerif, fontSize: '13px', fontWeight: '700', color: COLORS.navy }}>{brand.brand}</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={tierBadge(brand.geo_tier)}>{brand.geo_tier}</span>
                <span style={tierBadge(brand.outlook)}>{brand.outlook}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '8px', ...S.sansSerif, fontSize: '10px' }}>
              <span>Visibility: <strong>{brand.geo_score}</strong></span>
              <span>Mentions: <strong>{brand.mention_score}</strong></span>
            </div>
            <p style={{ ...S.text, fontSize: '9.5pt', margin: 0 }}>{brand.summary}</p>
          </div>
        ))}
      </div>

      {/* ═══ FOOTER ═══ */}
      <div style={S.footer}>
        <div style={{ marginBottom: '6px', fontWeight: '600', fontSize: '10pt', color: COLORS.navy }}>
          GeoRankers · AI Search & LLM Visibility Intelligence Platform
        </div>
        <div style={{ fontSize: '9pt', color: COLORS.slatePale }}>
          Report generated {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} · © {new Date().getFullYear()} GeoRankers. All rights reserved.
        </div>
        <div style={{ fontSize: '8pt', color: COLORS.gray400, marginTop: '4px' }}>
          AI Search Visibility is the new SEO — this is the enterprise intelligence layer.
        </div>
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
    title: "Generating Intelligence Report",
    description: "Preparing your enterprise AI visibility intelligence report...",
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
      @page { size: A4; margin: 10mm 12mm; margin-top: 8mm; margin-bottom: 8mm; }
      @page { @top-left { content: none; } @top-right { content: none; } @bottom-left { content: none; } @bottom-right { content: none; } }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0 !important; }
      body > *:not(#print-report-container) { display: none !important; }
      #print-report-container { display: block !important; }
      header, nav, .fixed, button, .sidebar, [data-sidebar] { display: none !important; }
      * { box-shadow: none !important; transition: none !important; animation: none !important; }
      table { page-break-inside: auto !important; }
      tr { page-break-inside: avoid !important; }
      thead { display: table-header-group !important; }
      tfoot { display: table-footer-group !important; }
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
