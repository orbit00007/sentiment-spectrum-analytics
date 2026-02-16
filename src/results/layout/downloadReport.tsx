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

// ─── Intent helpers ────────────────────────────────────────
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
    return { intent: intent.label, presencePct: Math.round(presencePct), status, leader: leaderBrand, leaderPct: Math.round(leaderPct) };
  });
};

// ─── Printable Report Component ──────────────────────────────
const PrintableContent = ({
  brandName, brandWebsite, brandLogo, modelName, analysisDate, analysisKeywords,
  brandInfo, executiveSummary, recommendations, keywords, llmData, aiVisibility,
  mentionsData, sourcesAndContentImpact, platformPresence, competitorSentiment,
  sentiment, brandMentionRates, competitorData, keywordNames, sourcesData,
}: PrintableContentProps) => {
  const s = {
    page: { padding: '28px 36px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#1a1a1a', fontSize: '8.5pt', lineHeight: '1.4', backgroundColor: '#fff' },
    section: { marginBottom: '12px' },
    sectionHeader: { fontSize: '16px', fontWeight: '700' as const, marginBottom: '8px', marginTop: '14px', paddingBottom: '5px', borderBottom: '2px solid #2563eb', color: '#1e40af' },
    subsectionHeader: { fontSize: '12px', fontWeight: '600' as const, marginBottom: '6px', marginTop: '12px', color: '#1f2937' },
    subsubsectionHeader: { fontSize: '10px', fontWeight: '600' as const, marginBottom: '4px', marginTop: '8px', color: '#374151' },
    card: { padding: '10px', backgroundColor: '#f9fafb', borderRadius: '4px', marginBottom: '8px', border: '1px solid #e5e7eb', pageBreakInside: 'avoid' as const },
    metricCard: { padding: '10px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1.5px solid #bfdbfe', textAlign: 'center' as const, pageBreakInside: 'avoid' as const },
    metricValue: { fontSize: '24px', fontWeight: '700' as const, color: '#1e40af', marginBottom: '2px' },
    metricLabel: { fontSize: '8px', color: '#6b7280', fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: '0.3px' },
    table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: '4px', marginBottom: '8px', fontSize: '8pt' },
    th: { border: '1px solid #d1d5db', padding: '5px 6px', textAlign: 'left' as const, backgroundColor: '#1e40af', color: '#fff', fontWeight: '600' as const, fontSize: '7.5pt' },
    td: { border: '1px solid #d1d5db', padding: '4px 6px', backgroundColor: '#fff' },
    altRow: { backgroundColor: '#f9fafb' },
    badge: { display: 'inline-block', padding: '2px 6px', borderRadius: '3px', fontSize: '7.5pt', fontWeight: '600' as const },
    list: { listStyleType: 'disc' as const, paddingLeft: '16px', marginBottom: '6px' },
    listItem: { marginBottom: '2px', lineHeight: '1.4' },
  };

  const tierBadge = (tier: string) => {
    const base = { ...s.badge };
    switch (tier?.toLowerCase()) {
      case 'high': case 'positive': case 'leading': case 'strong': return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'medium': case 'neutral': case 'moderate': return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'low': case 'negative': case 'weak': case 'very low': return { ...base, backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { ...base, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const outlookBadge = (outlook: string) => tierBadge(outlook);

  const totalPrompts = keywords.reduce((sum, kw) => sum + (kw.prompts?.length || 0), 0);
  const sortedBrands = [...brandInfo].sort((a, b) => b.geo_score - a.geo_score);
  const models = modelName?.split(",").map(m => m.trim()).filter(Boolean) || [];
  const llmModels = Object.keys(llmData);
  const allBrandNames = brandInfo.map(b => b.brand);
  const intentResults = computeIntentData(keywords.flatMap(kw => kw.prompts.map(p => ({ query: p.query || "", brands_per_llm: p.brands_per_llm || {}, category: p.category }))), allBrandNames, llmModels, brandName);

  const sortedCompetitorData = [...competitorData].sort((a, b) => {
    const totalA = a.keywordScores.reduce((sum, sc) => sum + (Number(sc) || 0), 0);
    const totalB = b.keywordScores.reduce((sum, sc) => sum + (Number(sc) || 0), 0);
    return totalB - totalA;
  });
  const pIdx = sortedCompetitorData.findIndex(c => c.name === brandName);
  if (pIdx !== -1) { sortedCompetitorData.push(sortedCompetitorData.splice(pIdx, 1)[0]); }

  const sortedSentiment = [...competitorSentiment];
  const sIdx = sortedSentiment.findIndex(sc => sc.brand === brandName);
  if (sIdx !== -1) { sortedSentiment.push(sortedSentiment.splice(sIdx, 1)[0]); }

  const allBrandsForSources = competitorData.map(c => c.name);
  const srcIdx = allBrandsForSources.findIndex(b => b === brandName);
  if (srcIdx !== -1) { allBrandsForSources.push(allBrandsForSources.splice(srcIdx, 1)[0]); }

  const sourceAuthorityData = Object.entries(sourcesData || {}).map(([sourceName, sourceData]: [string, any]) => {
    const row: any = { name: sourceName };
    if (sourceData?.mentions && typeof sourceData.mentions === 'object') {
      allBrandsForSources.forEach(brand => { row[`${brand}Mentions`] = sourceData.mentions[brand]?.count || 0; });
    } else {
      allBrandsForSources.forEach(brand => { row[`${brand}Mentions`] = 0; });
    }
    return row;
  });

  const getBrandScoreForKeyword = (keywordId: string) => brandInfo.find(b => b.brand === brandName)?.mention_breakdown?.[keywordId] || 0;
  const getBrandsForKeyword = (keywordId: string) => {
    const brandsWithMentions = brandInfo.filter(b => (b.mention_breakdown?.[keywordId] || 0) > 0);
    const ourIdx = brandsWithMentions.findIndex(b => b.brand === brandName);
    let ourBrand = null;
    if (ourIdx !== -1) ourBrand = brandsWithMentions.splice(ourIdx, 1)[0];
    else ourBrand = brandInfo.find(b => b.brand === brandName);
    brandsWithMentions.sort((a, b) => (b.mention_breakdown?.[keywordId] || 0) - (a.mention_breakdown?.[keywordId] || 0));
    if (ourBrand) brandsWithMentions.push(ourBrand);
    return brandsWithMentions;
  };

  const highlightRow = (isBrand: boolean, idx: number) => ({
    ...(idx % 2 === 1 ? s.altRow : {}),
    backgroundColor: isBrand ? '#eff6ff' : (idx % 2 === 1 ? '#f9fafb' : '#fff'),
    fontWeight: isBrand ? '600' : 'normal' as any,
  });

  return (
    <div style={s.page}>
      {/* ═══ COVER PAGE ═══ */}
      <div style={{ textAlign: 'center', paddingTop: '160px', paddingBottom: '100px', pageBreakAfter: 'always' as const, borderBottom: '3px solid #2563eb' }}>
        {brandLogo && <div style={{ marginBottom: '24px' }}><img src={brandLogo} alt={brandName} style={{ width: '72px', height: '72px', objectFit: 'contain', margin: '0 auto' }} /></div>}
        <h1 style={{ fontSize: '38px', fontWeight: '700', marginBottom: '16px', color: '#1e40af', letterSpacing: '-0.5px' }}>AI Visibility Analysis Report</h1>
        <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>{brandName}</h2>
        <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '32px' }}>{brandWebsite}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {models.map((model, i) => <span key={i} style={{ ...s.badge, backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: '10px', padding: '4px 10px' }}>{getModelDisplayName(model)}</span>)}
        </div>
        <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
          Report Generated: {analysisDate || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ═══ TABLE OF CONTENTS ═══ */}
      <div style={{ pageBreakAfter: 'always' as const }}>
        <h2 style={s.sectionHeader}>Table of Contents</h2>
        <div style={{ paddingLeft: '12px', lineHeight: '1.6', fontSize: '9pt' }}>
          <p><strong>1. Brand Overview</strong></p>
          <p style={{ paddingLeft: '16px' }}>1.1 Brand Information &nbsp;•&nbsp; 1.2 Key Metrics Summary &nbsp;•&nbsp; 1.3 LLM Platform Performance</p>
          <p style={{ paddingLeft: '16px' }}>1.4 Platform Presence &nbsp;•&nbsp; 1.5 Brand Presence by Buyer Intent</p>
          <p><strong>2. Executive Summary</strong></p>
          <p style={{ paddingLeft: '16px' }}>2.1 Brand Score & Positioning &nbsp;•&nbsp; 2.2 Strengths & Weaknesses &nbsp;•&nbsp; 2.3 Competitor Positioning &nbsp;•&nbsp; 2.4 Prioritized Actions</p>
          <p><strong>3. AI Prompts & Query Analysis</strong></p>
          <p style={{ paddingLeft: '16px' }}>3.1 Keywords & Prompts Breakdown &nbsp;•&nbsp; 3.2 Brand Mentions by Keyword &nbsp;•&nbsp; 3.3 Model-Wise Prompt Analysis</p>
          <p><strong>4. Competitive Analysis</strong></p>
          <p style={{ paddingLeft: '16px' }}>4.1 Competitive Landscape &nbsp;•&nbsp; 4.2 Brand Response Rates &nbsp;•&nbsp; 4.3 Keyword Performance Matrix &nbsp;•&nbsp; 4.4 AI Brand Perception &nbsp;•&nbsp; 4.5 Source Authority Map</p>
          <p><strong>5. Sources & Content Impact</strong></p>
          <p style={{ paddingLeft: '16px' }}>5.1 Source Category Breakdown &nbsp;•&nbsp; 5.2 Brand Mentions by Source</p>
          <p><strong>6. Brand Sentiment Analysis</strong></p>
          <p style={{ paddingLeft: '16px' }}>6.1 Primary Brand Sentiment &nbsp;•&nbsp; 6.2 Competitor Sentiment Analysis</p>
          <p><strong>7. Strategic Recommendations</strong></p>
          <p style={{ paddingLeft: '16px' }}>7.1 Prioritized Action Items &nbsp;•&nbsp; 7.2 Implementation Roadmap</p>
          <p><strong>8. Appendix</strong></p>
        </div>
      </div>

      {/* ═══ SECTION 1: BRAND OVERVIEW ═══ */}
      <div>
        <h2 style={s.sectionHeader}>1. Brand Overview</h2>

        <h3 style={s.subsectionHeader}>1.1 Brand Information</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '4px', border: '1px solid #e5e7eb', marginBottom: '10px' }}>
          {brandLogo && <img src={brandLogo} alt={brandName} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px', backgroundColor: 'white', padding: '3px' }} />}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{brandName}</h3>
            <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '10px' }}>{brandWebsite}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {analysisKeywords.map((kw, i) => <span key={i} style={{ ...s.badge, backgroundColor: '#e5e7eb', color: '#374151', margin: 0 }}>{kw}</span>)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 2px 0', fontSize: '8px', color: '#6b7280' }}>Analysis Date</p>
            <p style={{ margin: '0 0 4px 0', fontSize: '10px', fontWeight: '600' }}>{analysisDate}</p>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
              {models.map((model, i) => <span key={i} style={{ ...s.badge, backgroundColor: '#e0e7ff', color: '#3730a3', margin: 0 }}>{getModelDisplayName(model)}</span>)}
            </div>
          </div>
        </div>

        <h3 style={s.subsectionHeader}>1.2 Key Metrics Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div style={s.metricCard}>
            <div style={s.metricValue}>{aiVisibility?.score || 0}</div>
            <div style={s.metricLabel}>AI Visibility Score</div>
            <span style={tierBadge(aiVisibility?.tier)}>{aiVisibility?.tier || 'N/A'} Tier</span>
          </div>
          <div style={s.metricCard}>
            <div style={s.metricValue}>{mentionsData?.brandMentions || 0}</div>
            <div style={s.metricLabel}>Total Mentions</div>
            <span style={tierBadge(mentionsData?.tier)}>{mentionsData?.tier || 'N/A'} Tier</span>
          </div>
          <div style={s.metricCard}>
            <div style={s.metricValue}>{totalPrompts}</div>
            <div style={s.metricLabel}>Prompts Analyzed</div>
            <span style={{ ...s.badge, backgroundColor: '#e0e7ff', color: '#3730a3' }}>{keywords.length} Keywords</span>
          </div>
          <div style={s.metricCard}>
            <div style={s.metricValue}>{Object.keys(llmData).length}</div>
            <div style={s.metricLabel}>LLM Platforms</div>
            <span style={tierBadge(sentiment?.dominant_sentiment)}>{sentiment?.dominant_sentiment}</span>
          </div>
        </div>

        {aiVisibility?.positionBreakdown && (
          <div style={{ ...s.card, marginBottom: '10px' }}>
            <h4 style={s.subsubsectionHeader}>Ranking Distribution</h4>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-around', marginTop: '4px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a' }}>{aiVisibility.positionBreakdown.topPosition}%</div>
                <div style={{ fontSize: '7.5pt', color: '#6b7280' }}>Top (#1)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#ca8a04' }}>{aiVisibility.positionBreakdown.midPosition}%</div>
                <div style={{ fontSize: '7.5pt', color: '#6b7280' }}>Mid (2-4)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#dc2626' }}>{aiVisibility.positionBreakdown.lowPosition}%</div>
                <div style={{ fontSize: '7.5pt', color: '#6b7280' }}>Low (5+)</div>
              </div>
            </div>
          </div>
        )}

        <h3 style={s.subsectionHeader}>1.3 LLM Platform Performance</h3>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>Platform</th>
            <th style={s.th}>Mentions</th>
            <th style={s.th}>Prompts</th>
            <th style={s.th}>Avg Rank</th>
            <th style={s.th}>Sources</th>
          </tr></thead>
          <tbody>
            {Object.entries(llmData).map(([llm, data], i) => (
              <tr key={i} style={i % 2 === 1 ? s.altRow : {}}>
                <td style={{ ...s.td, fontWeight: '600' }}>{getModelDisplayName(llm)}</td>
                <td style={s.td}>{data.mentions_count}</td>
                <td style={s.td}>{totalPrompts}</td>
                <td style={s.td}>{data.average_rank > 0 ? `#${data.average_rank.toFixed(1)}` : 'N/A'}</td>
                <td style={s.td}>{data.sources}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={s.subsectionHeader}>1.4 Platform Presence</h3>
        {Object.keys(platformPresence).length > 0 ? (
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>Platform</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>URL</th>
            </tr></thead>
            <tbody>
              {Object.entries(platformPresence).map(([platform, url], i) => (
                <tr key={i} style={i % 2 === 1 ? s.altRow : {}}>
                  <td style={{ ...s.td, fontWeight: '600', textTransform: 'capitalize' }}>{platform.replace('_', ' ')}</td>
                  <td style={s.td}><span style={url ? tierBadge('high') : tierBadge('low')}>{url ? 'Active' : 'Not Found'}</span></td>
                  <td style={{ ...s.td, fontSize: '7.5pt', wordBreak: 'break-all' as const }}>{url || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: '#6b7280' }}>No platform presence data available.</p>}

        <h3 style={s.subsectionHeader}>1.5 Brand Presence by Buyer Intent</h3>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>Intent</th>
            <th style={s.th}>Your Visibility</th>
            <th style={{ ...s.th, textAlign: 'center' }}>Strength</th>
            <th style={s.th}>Leader</th>
            <th style={{ ...s.th, textAlign: 'center' }}>Leader %</th>
          </tr></thead>
          <tbody>
            {intentResults.map((r, i) => (
              <tr key={i} style={i % 2 === 1 ? s.altRow : {}}>
                <td style={{ ...s.td, fontWeight: '600' }}>{r.intent}</td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ flex: 1, height: '10px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(r.presencePct, 100)}%`, height: '100%', backgroundColor: r.presencePct >= 40 ? '#16a34a' : r.presencePct >= 20 ? '#ca8a04' : '#dc2626', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '8pt', fontWeight: '600', minWidth: '28px' }}>{r.presencePct}%</span>
                  </div>
                </td>
                <td style={{ ...s.td, textAlign: 'center' }}><span style={tierBadge(r.status)}>{r.status}</span></td>
                <td style={s.td}>{r.leader}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{r.leaderPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══ SECTION 2: EXECUTIVE SUMMARY ═══ */}
      <div>
        <h2 style={s.sectionHeader}>2. Executive Summary</h2>

        <h3 style={s.subsectionHeader}>2.1 Brand Score & Positioning</h3>
        {executiveSummary?.brand_score_and_tier && <div style={s.card}><p style={{ lineHeight: '1.5' }}>{executiveSummary.brand_score_and_tier}</p></div>}
        {executiveSummary?.conclusion && <div style={s.card}><h4 style={s.subsubsectionHeader}>Strategic Conclusion</h4><p style={{ lineHeight: '1.5' }}>{executiveSummary.conclusion}</p></div>}

        <h3 style={s.subsectionHeader}>2.2 Strengths & Weaknesses</h3>
        {executiveSummary?.strengths && executiveSummary.strengths.length > 0 && (
          <div style={s.card}>
            <h4 style={{ ...s.subsubsectionHeader, color: '#16a34a' }}>✓ Key Strengths</h4>
            <ul style={s.list}>{executiveSummary.strengths.map((item, i) => <li key={i} style={s.listItem}>{item}</li>)}</ul>
          </div>
        )}
        {executiveSummary?.weaknesses && executiveSummary.weaknesses.length > 0 && (
          <div style={s.card}>
            <h4 style={{ ...s.subsubsectionHeader, color: '#dc2626' }}>✗ Areas for Improvement</h4>
            <ul style={s.list}>{executiveSummary.weaknesses.map((item, i) => <li key={i} style={s.listItem}>{item}</li>)}</ul>
          </div>
        )}

        <h3 style={s.subsectionHeader}>2.3 Competitor Positioning</h3>
        {executiveSummary?.competitor_positioning && (
          <>
            {executiveSummary.competitor_positioning.leaders && executiveSummary.competitor_positioning.leaders.length > 0 && (
              <div style={s.card}>
                <h4 style={{ ...s.subsubsectionHeader, color: '#16a34a' }}>🏆 Market Leaders</h4>
                {executiveSummary.competitor_positioning.leaders.map((item, i) => (
                  <div key={i} style={{ marginBottom: '6px', paddingLeft: '8px', borderLeft: '2px solid #16a34a' }}>
                    <p style={{ fontWeight: '600', marginBottom: '2px', fontSize: '9pt' }}>{item.name}</p>
                    <p style={{ color: '#4b5563', fontSize: '8.5pt' }}>{item.summary}</p>
                  </div>
                ))}
              </div>
            )}
            {executiveSummary.competitor_positioning.mid_tier && executiveSummary.competitor_positioning.mid_tier.length > 0 && (
              <div style={s.card}>
                <h4 style={{ ...s.subsubsectionHeader, color: '#ca8a04' }}>⚡ Mid-Tier Performers</h4>
                {executiveSummary.competitor_positioning.mid_tier.map((item, i) => (
                  <div key={i} style={{ marginBottom: '6px', paddingLeft: '8px', borderLeft: '2px solid #ca8a04' }}>
                    <p style={{ fontWeight: '600', marginBottom: '2px', fontSize: '9pt' }}>{item.name}</p>
                    <p style={{ color: '#4b5563', fontSize: '8.5pt' }}>{item.summary}</p>
                  </div>
                ))}
              </div>
            )}
            {executiveSummary.competitor_positioning.laggards && executiveSummary.competitor_positioning.laggards.length > 0 && (
              <div style={s.card}>
                <h4 style={{ ...s.subsubsectionHeader, color: '#dc2626' }}>📊 Emerging Players</h4>
                {executiveSummary.competitor_positioning.laggards.map((item, i) => (
                  <div key={i} style={{ marginBottom: '6px', paddingLeft: '8px', borderLeft: '2px solid #dc2626' }}>
                    <p style={{ fontWeight: '600', marginBottom: '2px', fontSize: '9pt' }}>{item.name}</p>
                    <p style={{ color: '#4b5563', fontSize: '8.5pt' }}>{item.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {executiveSummary?.prioritized_actions && executiveSummary.prioritized_actions.length > 0 && (
          <>
            <h3 style={s.subsectionHeader}>2.4 Prioritized Actions</h3>
            <div style={s.card}>
              <ol style={{ paddingLeft: '18px', margin: '0' }}>
                {executiveSummary.prioritized_actions.map((action, i) => <li key={i} style={{ marginBottom: '4px', lineHeight: '1.5' }}>{action}</li>)}
              </ol>
            </div>
          </>
        )}
      </div>

      {/* ═══ SECTION 3: AI PROMPTS & QUERY ANALYSIS ═══ */}
      <div>
        <h2 style={s.sectionHeader}>3. AI Prompts & Query Analysis</h2>

        <div style={{ ...s.card, marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div><div style={{ fontSize: '18px', fontWeight: '700', color: '#1e40af' }}>{keywords.length}</div><div style={{ fontSize: '7.5pt', color: '#6b7280' }}>Keywords</div></div>
            <div><div style={{ fontSize: '18px', fontWeight: '700', color: '#1e40af' }}>{totalPrompts}</div><div style={{ fontSize: '7.5pt', color: '#6b7280' }}>Total Prompts</div></div>
          </div>
        </div>

        <h3 style={s.subsectionHeader}>3.1 Keywords & Prompts Breakdown</h3>
        {keywords.map((kw, idx) => {
          const brandScore = getBrandScoreForKeyword(kw.id);
          const brandsToDisplay = getBrandsForKeyword(kw.id);
          return (
            <div key={idx} style={{ ...s.card, marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div>
                  <h4 style={{ ...s.subsubsectionHeader, marginTop: 0, marginBottom: '1px' }}>Keyword {idx + 1}: {kw.name}</h4>
                  <p style={{ fontSize: '7.5pt', color: '#6b7280', margin: 0 }}>{kw.prompts?.length || 0} prompts</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '28px', height: '28px', borderRadius: '50%', fontSize: '11px', fontWeight: '700',
                    backgroundColor: brandScore >= 3 ? '#d1fae5' : brandScore >= 1 ? '#fef3c7' : '#fee2e2',
                    color: brandScore >= 3 ? '#065f46' : brandScore >= 1 ? '#92400e' : '#991b1b',
                  }}>{brandScore}</span>
                </div>
              </div>

              <h5 style={{ fontSize: '8pt', fontWeight: '600', marginBottom: '3px', color: '#374151' }}>📝 AI Prompts</h5>
              <table style={{ ...s.table, fontSize: '7.5pt', marginBottom: '6px' }}>
                <thead><tr>
                  <th style={{ ...s.th, width: '28px' }}>#</th>
                  <th style={s.th}>Search Prompt</th>
                  {kw.prompts[0]?.category && <th style={s.th}>Intent</th>}
                </tr></thead>
                <tbody>
                  {kw.prompts.map((prompt, pI) => (
                    <tr key={pI} style={pI % 2 === 1 ? s.altRow : {}}>
                      <td style={{ ...s.td, textAlign: 'center' }}>{pI + 1}</td>
                      <td style={s.td}>{prompt.query}</td>
                      {kw.prompts[0]?.category && <td style={s.td}>{prompt.category || '-'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>

              <h5 style={{ fontSize: '8pt', fontWeight: '600', marginBottom: '3px', color: '#374151' }}>🏆 Brand Mentions for "{kw.name}"</h5>
              <table style={{ ...s.table, fontSize: '7.5pt' }}>
                <thead><tr>
                  <th style={s.th}>Brand</th>
                  <th style={{ ...s.th, width: '70px', textAlign: 'center' }}>Mentions</th>
                  <th style={{ ...s.th, width: '80px', textAlign: 'center' }}>Performance</th>
                </tr></thead>
                <tbody>
                  {brandsToDisplay.map((brand, bI) => {
                    const score = brand.mention_breakdown?.[kw.id] || 0;
                    const isBrand = brand.brand === brandName;
                    return (
                      <tr key={bI} style={highlightRow(isBrand, bI)}>
                        <td style={s.td}>{brand.brand}</td>
                        <td style={{ ...s.td, textAlign: 'center' }}>{score}</td>
                        <td style={{ ...s.td, textAlign: 'center' }}>
                          <span style={score >= 3 ? tierBadge('high') : score >= 1 ? tierBadge('medium') : tierBadge('low')}>
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

        <h3 style={s.subsectionHeader}>3.3 Model-Wise Prompt Analysis</h3>
        <p style={{ color: '#6b7280', marginBottom: '6px', fontSize: '8pt' }}>Which brands each AI model recommends per prompt</p>
        {keywords.map((kw, kwIdx) => (
          <div key={kwIdx} style={{ ...s.card, marginBottom: '8px' }}>
            <h4 style={{ ...s.subsubsectionHeader, marginTop: 0 }}>Keyword: {kw.name}</h4>
            <table style={{ ...s.table, fontSize: '7pt' }}>
              <thead><tr>
                <th style={{ ...s.th, width: '28px' }}>#</th>
                <th style={s.th}>Prompt</th>
                {llmModels.map(model => <th key={model} style={{ ...s.th, textAlign: 'center', fontSize: '7pt' }}>{getModelDisplayName(model)}</th>)}
              </tr></thead>
              <tbody>
                {kw.prompts.map((prompt, pI) => (
                  <tr key={pI} style={pI % 2 === 1 ? s.altRow : {}}>
                    <td style={{ ...s.td, textAlign: 'center' }}>{pI + 1}</td>
                    <td style={{ ...s.td, maxWidth: '160px' }}>{prompt.query}</td>
                    {llmModels.map(model => {
                      const brands = prompt.brands_per_llm?.[model] || [];
                      const hasBrand = brands.includes(brandName);
                      return (
                        <td key={model} style={{ ...s.td, textAlign: 'center', fontSize: '7pt', backgroundColor: hasBrand ? '#eff6ff' : undefined }}>
                          {brands.length > 0 ? brands.map((b, i) => (
                            <span key={i} style={{ display: 'block', fontWeight: b === brandName ? '700' : 'normal', color: b === brandName ? '#1e40af' : '#4b5563' }}>
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

      {/* ═══ SECTION 4: COMPETITIVE ANALYSIS ═══ */}
      <div>
        <h2 style={s.sectionHeader}>4. Competitive Analysis</h2>

        <h3 style={s.subsectionHeader}>4.1 Competitive Landscape</h3>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>Rank</th><th style={s.th}>Brand</th><th style={s.th}>Visibility</th><th style={s.th}>Tier</th><th style={s.th}>Mentions</th><th style={s.th}>Mention Tier</th><th style={s.th}>Outlook</th>
          </tr></thead>
          <tbody>
            {sortedBrands.map((brand, i) => (
              <tr key={i} style={highlightRow(brand.brand === brandName, i)}>
                <td style={s.td}>{i + 1}</td>
                <td style={s.td}>{brand.brand}</td>
                <td style={s.td}>{brand.geo_score}</td>
                <td style={s.td}><span style={tierBadge(brand.geo_tier)}>{brand.geo_tier}</span></td>
                <td style={s.td}>{brand.mention_score}</td>
                <td style={s.td}><span style={tierBadge(brand.mention_tier)}>{brand.mention_tier}</span></td>
                <td style={s.td}><span style={outlookBadge(brand.outlook)}>{brand.outlook}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={s.subsectionHeader}>4.2 Brand Response Rates</h3>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>Rank</th><th style={s.th}>Brand</th><th style={s.th}>Response Rate</th><th style={s.th}>Performance</th>
          </tr></thead>
          <tbody>
            {brandMentionRates.map((item, i) => (
              <tr key={i} style={highlightRow(item.isTestBrand, i)}>
                <td style={s.td}>{i + 1}</td>
                <td style={s.td}>{item.brand}</td>
                <td style={s.td}>{item.responseRate}%</td>
                <td style={s.td}>
                  <div style={{ width: '100%', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.responseRate}%`, height: '100%', backgroundColor: item.isTestBrand ? '#2563eb' : '#f59e0b', borderRadius: '3px' }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={s.subsectionHeader}>4.3 Keyword Performance Matrix</h3>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>Brand</th>
            {keywordNames.map((kw, i) => <th key={i} style={{ ...s.th, textAlign: 'center', fontSize: '7pt' }}>{kw}</th>)}
            <th style={{ ...s.th, textAlign: 'center' }}>Total</th>
          </tr></thead>
          <tbody>
            {sortedCompetitorData.map((c, i) => {
              const isPrimary = c.name === brandName;
              const total = c.keywordScores.reduce((sum, sc) => sum + (Number(sc) || 0), 0);
              return (
                <tr key={i} style={highlightRow(isPrimary, i)}>
                  <td style={s.td}>{c.name}</td>
                  {c.keywordScores.map((score, si) => <td key={si} style={{ ...s.td, textAlign: 'center' }}>{score}</td>)}
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', backgroundColor: isPrimary ? '#1e40af' : '#f3f4f6', color: isPrimary ? '#fff' : '#1f2937' }}>{total}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 style={s.subsectionHeader}>4.4 AI Brand Perception</h3>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>Brand</th><th style={s.th}>Sentiment Summary</th><th style={{ ...s.th, width: '80px', textAlign: 'center' }}>Outlook</th>
          </tr></thead>
          <tbody>
            {sortedSentiment.map((item, i) => (
              <tr key={i} style={highlightRow(item.brand === brandName, i)}>
                <td style={s.td}>{item.brand}</td>
                <td style={{ ...s.td, fontSize: '8pt' }}>{item.summary}</td>
                <td style={{ ...s.td, textAlign: 'center' }}><span style={outlookBadge(item.outlook)}>{item.outlook}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        {sourceAuthorityData.length > 0 && (
          <>
            <h3 style={s.subsectionHeader}>4.5 Source Authority Map</h3>
            <table style={s.table}>
              <thead><tr>
                <th style={s.th}>Source</th>
                {allBrandsForSources.map(brand => (
                  <th key={brand} style={{ ...s.th, textAlign: 'center', fontSize: '7pt', backgroundColor: brand === brandName ? '#1e3a8a' : '#1e40af' }}>{brand}</th>
                ))}
              </tr></thead>
              <tbody>
                {sourceAuthorityData.map((source: any, i: number) => (
                  <tr key={i} style={i % 2 === 1 ? s.altRow : {}}>
                    <td style={{ ...s.td, fontWeight: '600' }}>{source.name}</td>
                    {allBrandsForSources.map(brand => {
                      const mentions = source[`${brand}Mentions`] || 0;
                      const isPrimary = brand === brandName;
                      return (
                        <td key={brand} style={{ ...s.td, textAlign: 'center', backgroundColor: isPrimary ? '#eff6ff' : undefined }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '20px', height: '20px', borderRadius: '50%', fontSize: '8pt', fontWeight: '700',
                            backgroundColor: mentions > 0 ? (isPrimary ? '#dbeafe' : '#dcfce7') : '#fee2e2',
                            color: mentions > 0 ? (isPrimary ? '#1e40af' : '#166534') : '#991b1b',
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

      {/* ═══ SECTION 5: SOURCES & CONTENT IMPACT ═══ */}
      {sourcesAndContentImpact && Object.keys(sourcesAndContentImpact).length > 0 && (
        <div>
          <h2 style={s.sectionHeader}>5. Sources & Content Impact</h2>
          {Object.entries(sourcesAndContentImpact).map(([sourceName, sourceData]: [string, any], idx) => (
            <div key={idx} style={{ ...s.card, pageBreakInside: 'avoid', marginBottom: '8px' }}>
              <h3 style={{ ...s.subsectionHeader, marginTop: 0 }}>{sourceName}</h3>
              {sourceData.pages_used && sourceData.pages_used.length > 0 && (
                <div style={{ marginBottom: '6px' }}>
                  <h4 style={{ ...s.subsubsectionHeader, fontSize: '9px' }}>🔗 Referenced Sources ({sourceData.pages_used.length})</h4>
                  <table style={{ ...s.table, fontSize: '7pt' }}>
                    <thead><tr><th style={{ ...s.th, width: '28px' }}>#</th><th style={s.th}>URL</th></tr></thead>
                    <tbody>
                      {sourceData.pages_used.map((url: string, ui: number) => (
                        <tr key={ui} style={ui % 2 === 1 ? s.altRow : {}}>
                          <td style={{ ...s.td, textAlign: 'center' }}>{ui + 1}</td>
                          <td style={{ ...s.td, wordBreak: 'break-all' as const }}>{url}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {sourceData.mentions && Object.keys(sourceData.mentions).length > 0 && (
                <>
                  <h4 style={{ ...s.subsubsectionHeader, fontSize: '9px' }}>📊 Brand Mentions</h4>
                  <table style={s.table}>
                    <thead><tr>
                      <th style={s.th}>Brand</th><th style={s.th}>Count</th><th style={s.th}>Impact</th><th style={s.th}>Insight</th>
                    </tr></thead>
                    <tbody>
                      {Object.entries(sourceData.mentions)
                        .sort(([, a]: [string, any], [, b]: [string, any]) => b.count - a.count)
                        .map(([brand, mentionData]: [string, any], mI: number) => (
                          <tr key={mI} style={highlightRow(brand === brandName, mI)}>
                            <td style={s.td}>{brand}</td>
                            <td style={s.td}>{mentionData.count}</td>
                            <td style={s.td}>{Math.round(mentionData.score * 100)}%</td>
                            <td style={{ ...s.td, fontSize: '7.5pt' }}>{mentionData.insight}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══ SECTION 6: BRAND SENTIMENT ANALYSIS ═══ */}
      <div>
        <h2 style={s.sectionHeader}>6. Brand Sentiment Analysis</h2>

        <h3 style={s.subsectionHeader}>6.1 Primary Brand Sentiment</h3>
        <div style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            {brandLogo && <img src={brandLogo} alt={brandName} style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '50%', backgroundColor: 'white' }} />}
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{brandName}</h4>
              <span style={tierBadge(sentiment?.dominant_sentiment)}>{sentiment?.dominant_sentiment || 'N/A'}</span>
            </div>
          </div>
          <p style={{ color: '#4b5563', lineHeight: '1.5', fontSize: '8.5pt' }}>{sentiment?.summary || 'No sentiment data available.'}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
          {['Positive', 'Neutral', 'Negative'].map(sentimentType => {
            const matchingBrands = competitorSentiment.filter(c => c.outlook === sentimentType);
            const colors: Record<string, { bg: string; border: string }> = {
              'Positive': { bg: '#d1fae5', border: '#16a34a' },
              'Neutral': { bg: '#fef3c7', border: '#ca8a04' },
              'Negative': { bg: '#fee2e2', border: '#dc2626' }
            };
            return (
              <div key={sentimentType} style={{ ...s.card, backgroundColor: colors[sentimentType].bg, borderColor: colors[sentimentType].border, textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: colors[sentimentType].border }}>{matchingBrands.length}</div>
                <div style={{ fontSize: '8pt', fontWeight: '600' }}>{sentimentType}</div>
                <div style={{ fontSize: '7pt', color: '#6b7280' }}>{matchingBrands.map(b => b.brand).join(', ') || 'None'}</div>
              </div>
            );
          })}
        </div>

        <h3 style={s.subsectionHeader}>6.2 Competitor Sentiment</h3>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>Brand</th><th style={s.th}>Summary</th><th style={{ ...s.th, width: '80px', textAlign: 'center' }}>Outlook</th>
          </tr></thead>
          <tbody>
            {competitorSentiment.map((item, i) => (
              <tr key={i} style={highlightRow(item.brand === brandName, i)}>
                <td style={s.td}>{item.brand}</td>
                <td style={{ ...s.td, fontSize: '8pt' }}>{item.summary}</td>
                <td style={{ ...s.td, textAlign: 'center' }}><span style={outlookBadge(item.outlook)}>{item.outlook}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══ SECTION 7: RECOMMENDATIONS ═══ */}
      {recommendations && recommendations.length > 0 && (
        <div>
          <h2 style={s.sectionHeader}>7. Strategic Recommendations</h2>

          <div style={{ ...s.card, marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div><div style={{ fontSize: '18px', fontWeight: '700', color: '#1e40af' }}>{recommendations.length}</div><div style={{ fontSize: '7.5pt', color: '#6b7280' }}>Recommendations</div></div>
              <div><div style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a' }}>{recommendations.filter(r => r.impact?.toLowerCase() === 'high').length}</div><div style={{ fontSize: '7.5pt', color: '#6b7280' }}>High Impact</div></div>
              <div><div style={{ fontSize: '18px', fontWeight: '700', color: '#ca8a04' }}>{recommendations.filter(r => r.overall_effort?.toLowerCase() === 'low').length}</div><div style={{ fontSize: '7.5pt', color: '#6b7280' }}>Quick Wins</div></div>
            </div>
          </div>

          <h3 style={s.subsectionHeader}>7.1 Prioritized Action Items</h3>
          {recommendations.map((rec, i) => (
            <div key={i} style={{ ...s.card, marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <h4 style={{ ...s.subsubsectionHeader, marginTop: 0, flex: 1 }}>#{i + 1} — {rec.overall_insight}</h4>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <span style={tierBadge(rec.impact)}>Impact: {rec.impact}</span>
                  <span style={tierBadge(rec.overall_effort === 'Low' ? 'high' : rec.overall_effort === 'High' ? 'low' : 'medium')}>Effort: {rec.overall_effort}</span>
                </div>
              </div>

              {rec.insight?.summary && <p style={{ fontSize: '8pt', color: '#4b5563', lineHeight: '1.4', marginBottom: '4px' }}>{rec.insight.summary}</p>}
              {rec.suggested_action && <div style={{ marginBottom: '4px' }}><h5 style={{ fontSize: '8pt', fontWeight: '600', marginBottom: '2px', color: '#374151' }}>✅ Action</h5><p style={{ fontSize: '8pt', color: '#1f2937' }}>{rec.suggested_action}</p></div>}

              {rec.suggested_action_v1 && typeof rec.suggested_action_v1 === 'object' && Object.keys(rec.suggested_action_v1).length > 0 && (
                <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                  <h5 style={{ fontSize: '8pt', fontWeight: '600', marginBottom: '4px', color: '#1e40af' }}>🎯 Action Plan</h5>
                  {rec.suggested_action_v1.strategy && <p style={{ fontSize: '8pt', fontWeight: '600', color: '#1f2937', lineHeight: '1.4', marginBottom: '4px' }}>{rec.suggested_action_v1.strategy}</p>}
                  {rec.suggested_action_v1.start_here && <div style={{ marginBottom: '4px' }}><h6 style={{ fontSize: '7.5pt', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>▶ Start Here</h6><p style={{ fontSize: '8pt', color: '#4b5563' }}>{rec.suggested_action_v1.start_here}</p></div>}
                  {Array.isArray(rec.suggested_action_v1.how_to_execute) && rec.suggested_action_v1.how_to_execute.length > 0 && (
                    <div style={{ marginBottom: '4px' }}>
                      <h6 style={{ fontSize: '7.5pt', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>📋 Steps</h6>
                      <ol style={{ paddingLeft: '16px', margin: '0' }}>
                        {rec.suggested_action_v1.how_to_execute.map((step: string, si: number) => <li key={si} style={{ marginBottom: '2px', fontSize: '8pt', color: '#4b5563' }}>{step}</li>)}
                      </ol>
                    </div>
                  )}
                  {rec.suggested_action_v1.success_signal && (
                    <div style={{ borderTop: '1px solid #bfdbfe', paddingTop: '4px' }}>
                      <h6 style={{ fontSize: '7.5pt', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>✨ Success Signal</h6>
                      <p style={{ fontSize: '8pt', color: '#4b5563', fontStyle: 'italic' }}>{rec.suggested_action_v1.success_signal}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {executiveSummary?.prioritized_actions && executiveSummary.prioritized_actions.length > 0 && (
            <>
              <h3 style={s.subsectionHeader}>7.2 Implementation Roadmap</h3>
              <div style={s.card}>
                <ol style={{ paddingLeft: '18px', margin: '0' }}>
                  {executiveSummary.prioritized_actions.map((action, i) => <li key={i} style={{ marginBottom: '4px', lineHeight: '1.5' }}>{action}</li>)}
                </ol>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ SECTION 8: APPENDIX ═══ */}
      <div>
        <h2 style={s.sectionHeader}>8. Appendix</h2>

        <h3 style={s.subsectionHeader}>8.1 Competitor Brand Summaries</h3>
        {sortedBrands.map((brand, i) => (
          <div key={i} style={{ ...s.card, pageBreakInside: 'avoid' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h4 style={{ ...s.subsubsectionHeader, margin: 0 }}>{brand.brand}</h4>
              <span style={outlookBadge(brand.outlook)}>{brand.outlook}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '4px', flexWrap: 'wrap', fontSize: '8pt' }}>
              <span><strong>Visibility:</strong> {brand.geo_score}</span>
              <span><strong>Mentions:</strong> {brand.mention_score}</span>
              <span style={tierBadge(brand.geo_tier)}>{brand.geo_tier} Tier</span>
            </div>
            <p style={{ fontSize: '8pt', lineHeight: '1.5', color: '#4b5563', margin: 0 }}>{brand.summary}</p>
          </div>
        ))}

        <h3 style={s.subsectionHeader}>8.2 Methodology Notes</h3>
        <div style={s.card}>
          <h4 style={s.subsubsectionHeader}>Data Collection</h4>
          <p style={{ marginBottom: '6px', fontSize: '8pt' }}>
            Analysis conducted by querying {Object.keys(llmData).map(getModelDisplayName).join(', ')} across {keywords.length} keywords with {totalPrompts} prompts.
          </p>
          <h4 style={s.subsubsectionHeader}>Scoring</h4>
          <p style={{ marginBottom: '6px', fontSize: '8pt' }}>
            <strong>AI Visibility Score:</strong> Based on ranking positions, weighted by mention frequency and source authority.
            <strong> Tier Classification:</strong> High, Medium, or Low based on relative performance.
          </p>
          <h4 style={s.subsubsectionHeader}>Limitations</h4>
          <p style={{ margin: 0, fontSize: '8pt' }}>
            Snapshot in time. Results may vary with different query formulations.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1.5px solid #e5e7eb', textAlign: 'center', color: '#9ca3af', fontSize: '8pt' }}>
        <p style={{ marginBottom: '4px', fontWeight: '600' }}>Generated by GeoRankers AI Visibility Analysis Platform</p>
        <p style={{ margin: 0 }}>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
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
    toast({ title: "No Data Available", description: "Please wait for the analysis to complete before generating a report.", variant: "destructive" });
    return false;
  }

  toast({ title: "Generating Report", description: "Preparing your comprehensive report...", duration: 2000 });

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
      brandName={brandName} brandWebsite={brandWebsite} brandLogo={brandLogo}
      modelName={modelName} analysisDate={analysisDate} analysisKeywords={analysisKeywords}
      brandInfo={brandInfo} executiveSummary={executiveSummary} recommendations={recommendations}
      keywords={keywords} llmData={llmData} aiVisibility={aiVisibility}
      mentionsData={mentionsData} sourcesAndContentImpact={sourcesAndContentImpact}
      platformPresence={platformPresence} competitorSentiment={competitorSentiment}
      sentiment={sentiment} brandMentionRates={brandMentionRates}
      competitorData={competitorDataArr} keywordNames={keywordNames} sourcesData={sourcesDataObj}
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
      @page { size: A4; margin: 10mm 12mm; }
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
