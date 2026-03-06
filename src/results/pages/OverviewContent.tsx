import { useResults } from "@/results/context/ResultsContext";
import { areBrandsAliased } from "@/results/data/brandAliases";
import { useEffect, useState, useMemo } from "react";
import {
  getAIVisibilityMetrics,
  getMentionsPosition,
  getBrandMentionResponseRates,
  getSentiment,
  hasAnalyticsData,
  getBrandInfoWithLogos,
  getBrandName,
  getRecommendations,
} from "@/results/data/analyticsData";
import { LLMVisibilityTable } from "@/results/overview/LLMVisibilityTable";
import { PlatformPresence } from "@/results/overview/PlatformPresence";
import { CompetitorComparisonChart } from "@/results/overview/CompetitorComparisonChart";
import { BrandMentionsRadar } from "@/results/overview/BrandMentionsRadar";
import BrandInfoBar from "@/results/overview/BrandInfoBar";
import { IntentWiseScoring } from "@/results/overview/IntentWiseScoring";
import { TierBadge } from "@/results/ui/TierBadge";
import { toOrdinal } from "@/results/data/formulas";
import {
  Info,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Search,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

/* ─── Section Header ─── */
const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mt-8 mb-4">
    <div className="ds-section-title">
      <h2 className="text-lg font-bold text-ds-text">{title}</h2>
    </div>
    <p className="ds-section-subtitle">{subtitle}</p>
  </div>
);

/* ─── Impact color helpers ─── */
const getImpactBorder = (impact: string) => {
  if (impact === "High") return "border-l-[3px] border-l-ds-danger";
  if (impact === "Medium") return "border-l-[3px] border-l-ds-warning";
  return "border-l-[3px] border-l-ds-success";
};

const getImpactBadgeClass = (impact: string) => {
  if (impact === "High") return "ds-badge-danger";
  if (impact === "Medium") return "ds-badge-warning";
  return "ds-badge-positive";
};

const getEffortBadgeClass = (effort: string) => {
  if (effort === "High") return "ds-badge-danger";
  if (effort === "Medium") return "ds-badge-warning";
  return "ds-badge-positive";
};

const cleanPriorityLabel = (tier: string) => {
  if (!tier) return "";
  const t = tier.toLowerCase();
  if (t === "high_impact") return "High Impact";
  if (t === "medium_impact") return "Medium Impact";
  if (t === "quick_win") return "Quick Win";
  return tier;
};

const OverviewContent = () => {
  const { dataReady, analyticsVersion } = useResults();
  const [animatedBars, setAnimatedBars] = useState(false);
  const navigate = useNavigate();
  const analyticsAvailable = hasAnalyticsData();

  const visibilityData = useMemo(() => {
    if (!analyticsAvailable) return { score: 0, tier: "Low", brandPosition: 0, totalBrands: 0, positionBreakdown: { topPosition: 0, midPosition: 0, lowPosition: 0 } };
    return getAIVisibilityMetrics();
  }, [analyticsAvailable, analyticsVersion]);

  const mentionsData = useMemo(() => {
    if (!analyticsAvailable) return { position: 0, tier: "Low", totalBrands: 0, topBrandMentions: 0, brandMentions: 0, allBrandMentions: {} };
    return getMentionsPosition();
  }, [analyticsAvailable, analyticsVersion]);

  const allBrandMentionRates = useMemo(() => {
    if (!analyticsAvailable) return [];
    const brandInfo = getBrandInfoWithLogos();
    const brandName = getBrandName();
    return brandInfo.map(b => ({
      brand: b.brand,
      responseRate: b.mention_score,
      logo: b.logo,
      isTestBrand: b.brand === brandName || areBrandsAliased(b.brand, brandName),
    })).sort((a, b) => b.responseRate - a.responseRate);
  }, [analyticsAvailable, analyticsVersion]);

  const sentiment = useMemo(() => {
    if (!analyticsAvailable) return { dominant_sentiment: "N/A", summary: "" };
    return getSentiment();
  }, [analyticsAvailable, analyticsVersion]);

  const recommendations = useMemo(() => {
    if (!analyticsAvailable) return [];
    return getRecommendations();
  }, [analyticsAvailable, analyticsVersion]);

  useEffect(() => {
    if (dataReady && analyticsAvailable) {
      const timer = setTimeout(() => setAnimatedBars(true), 100);
      return () => clearTimeout(timer);
    }
  }, [dataReady, analyticsAvailable]);

  const visibilityInsight = useMemo(() => {
    const { brandPosition, totalBrands } = visibilityData;
    if (!brandPosition || brandPosition <= 0) return "Your brand is currently not ranking in AI search visibility.";
    if (brandPosition === 1) return `Your brand is leading in AI visibility among ${totalBrands} brands.`;
    return `Your brand ranked ${toOrdinal(brandPosition)} out of ${totalBrands} brands.`;
  }, [visibilityData]);

  // Parse sentiment summary bullets
  const sentimentBullets = useMemo(() => {
    if (!sentiment.summary) return [];
    // Split by ● or • or newlines with dashes
    return sentiment.summary
      .split(/[●•]|\n-\s*|\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 5);
  }, [sentiment.summary]);

  // Max response rate for avg line
  const avgResponseRate = useMemo(() => {
    if (allBrandMentionRates.length === 0) return 0;
    return Math.round(allBrandMentionRates.reduce((sum, b) => sum + b.responseRate, 0) / allBrandMentionRates.length);
  }, [allBrandMentionRates]);

  if (!dataReady || !analyticsAvailable) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="text-center">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-3 animate-spin" />
          <h2 className="text-xl font-semibold mb-1 text-foreground">Analysis Started</h2>
          <p className="text-[13px] text-muted-foreground">Preparing your brand's comprehensive analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-6">
      <BrandInfoBar />

      {/* ═══ Overall Insights ═══ */}
      <SectionHeader title="Overall Insights" subtitle="Key performance metrics across AI platforms" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-stretch">
        {/* AI Visibility Card */}
        <div className="ds-card flex flex-col h-full">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ds-blue" />
              <span className="text-[14px] font-semibold text-ds-text">AI Visibility</span>
              <Tooltip>
                <TooltipTrigger><Info className="w-3.5 h-3.5 text-ds-text-muted" /></TooltipTrigger>
                <TooltipContent className="max-w-xs"><p className="text-xs">A weighted score based on where and how often your brand appears in AI responses.</p></TooltipContent>
              </Tooltip>
            </div>
            <TierBadge tier={visibilityData.tier} />
          </div>
          <p className="text-[12px] text-ds-text-muted mb-3">Where and how often your brand appears in AI responses</p>

          <div className="mb-4">
            <span className="text-[36px] font-bold text-ds-text leading-none">{visibilityData.score}</span>
            <span className="text-[11px] text-ds-text-muted ml-1.5 uppercase tracking-wider font-semibold">Score</span>
          </div>

          <div className="space-y-3 flex-1">
            {[
              { label: "Top Position", value: visibilityData.positionBreakdown.topPosition, color: "#22C55E", icon: ArrowUp },
              { label: "Mid Position (2–4)", value: visibilityData.positionBreakdown.midPosition, color: "#F5BE20", icon: ArrowRight },
              { label: "Low Position", value: visibilityData.positionBreakdown.lowPosition, color: "#F25454", icon: ArrowDown },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-[12px] font-medium text-ds-text">{label}</span>
                  </div>
                  <span className="text-[13px] font-semibold" style={{ color }}>{value}%</span>
                </div>
                <div className="h-[4px] rounded-full" style={{ background: '#EFF3F8' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>

          {visibilityInsight && (
            <div className="mt-auto pt-4">
           <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted" style={{ borderLeft: '3px solid #4DA6FF' }}>
                <span className="text-[12px] text-ds-text">↑ {visibilityInsight}</span>
              </div>
            </div>
          )}
        </div>

        {/* Brand Mentions Card - ALL brands */}
        <div className="ds-card flex flex-col h-full">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-ds-warning" />
              <span className="text-[14px] font-semibold text-ds-text">Brand Mentions</span>
            </div>
            <TierBadge tier={mentionsData.tier} />
          </div>
          <p className="text-[12px] text-ds-text-muted mb-3">% of AI responses mentioning each brand</p>

          <div className="mb-1">
            <span className="text-[36px] font-bold text-ds-text leading-none">{mentionsData.brandMentions}</span>
            <span className="text-[16px] font-bold text-ds-text-muted">%</span>
            <div className="text-[12px] text-ds-text-muted mt-0.5">across {allBrandMentionRates.length} total brands</div>
          </div>

          <div className="space-y-2 flex-1 relative">
            {allBrandMentionRates.map((item, index) => (
              <div key={`brand-${item.brand}-${index}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    {item.logo && (
                      <img src={item.logo} alt="" className="w-4 h-4 rounded-full object-contain bg-white" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    )}
                    <span className={`text-[11px] font-medium uppercase tracking-wide ${item.isTestBrand ? "text-ds-blue" : "text-ds-text"}`}>
                      {item.brand}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-ds-text">{item.responseRate}%</span>
                </div>
                <div className="h-[6px] rounded-full relative cursor-pointer" style={{ background: '#EFF3F8' }}
                  onClick={() => navigate(`/results/prompts?expandAll=true&viewType=brand`)}>
                  {/* Avg dashed line */}
                  <div className="absolute top-0 bottom-0" style={{ left: `${avgResponseRate}%`, width: '1px', borderLeft: '1px dashed #CBD5E1', zIndex: 2 }} />
                  <div className={`h-full rounded-full transition-all duration-700`}
                    style={{
                      width: animatedBars ? `${item.responseRate}%` : "0%",
                      background: item.isTestBrand ? '#4DA6FF' : index === 0 ? '#F5BE20' : '#CBD5E1',
                      transitionDelay: `${index * 50}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted" style={{ borderLeft: '3px solid #4DA6FF' }}>
              <span className="text-[12px] text-ds-text">Your brand ranked {toOrdinal(mentionsData.position)} of {mentionsData.totalBrands} brands</span>
            </div>
          </div>
        </div>

        {/* Sentiment Card - parse bullets */}
        <div className="ds-card flex flex-col h-full">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-ds-success" />
              <span className="text-[14px] font-semibold text-ds-text">Sentiment</span>
            </div>
            <TierBadge tier={sentiment.dominant_sentiment} />
          </div>
          <p className="text-[12px] text-ds-text-muted mb-3">How AI models perceive your brand's authority</p>

          <div className="text-[24px] font-bold text-ds-text mb-3">{sentiment.dominant_sentiment}</div>

          <div className="space-y-2 flex-1">
          {sentimentBullets.length > 0 ? (
              sentimentBullets.map((bullet, index) => (
                <div key={`s-${index}`} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-ds-success flex-shrink-0 mt-0.5" />
                  <span className="text-[13px] text-ds-text leading-relaxed">{bullet}</span>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#94A3B8] flex-shrink-0 mt-0.5" />
                <span className="text-[13px] text-ds-text-muted">No sentiment data available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 mb-4 border-b border-border" />

      {/* ═══ Key Signals ═══ */}
      {recommendations.length > 0 && (
        <>
          <SectionHeader title="Key Signals" subtitle="Data-driven actions from your analysis" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {recommendations.slice(0, 4).map((rec: any, index: number) => (
              <div key={index} className={`ds-card-compact ${getImpactBorder(rec.impact)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`ds-badge ${getImpactBadgeClass(rec.impact)}`}>{cleanPriorityLabel(rec.priority_tier) || `${rec.impact} Impact`}</span>
                </div>
                <p className="text-[13px] text-ds-text leading-relaxed mb-3">
                  {rec.insight?.summary || rec.overall_insight || ""}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`ds-badge ${getEffortBadgeClass(rec.overall_effort)}`}>Effort: {rec.overall_effort}</span>
                    <span className={`ds-badge ${getImpactBadgeClass(rec.impact)}`}>Impact: {rec.impact}</span>
                  </div>
                  <button onClick={() => navigate('/results/recommendations')} className="text-[12px] font-medium text-ds-blue hover:underline flex items-center gap-1">
                    View action <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 mb-4 border-b border-border" />
        </>
      )}

      {/* ═══ Competitor Intelligence ═══ */}
      <SectionHeader title="Competitor Intelligence" subtitle="Compare your AI visibility against competitors" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <CompetitorComparisonChart />
        <BrandMentionsRadar />
      </div>

      <div className="mt-8 mb-4 border-b border-border" />

      {/* ═══ Platform & Model Analysis ═══ */}
      <SectionHeader title="Platform & Model Analysis" subtitle="Performance across AI platforms" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <LLMVisibilityTable />
        <PlatformPresence />
      </div>

      <div className="mt-8 mb-4 border-b border-border" />

      {/* ═══ Buyer Intent ═══ */}
      <SectionHeader title="Buyer Intent & Conversion Dynamics" subtitle="Visibility across buyer journey stages" />
      <div className="mt-4">
        <IntentWiseScoring />
      </div>
    </div>
  );
};

export default OverviewContent;
