import { useResults } from "@/results/context/ResultsContext";
import { areBrandsAliased } from "@/results/data/brandAliases";
import { useEffect, useState, useMemo } from "react";
import {
  getAIVisibilityMetrics, getMentionsPosition, getBrandMentionResponseRates,
  getSentiment, hasAnalyticsData, getBrandInfoWithLogos, getBrandName, getRecommendations,
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
  Info, TrendingUp, MessageSquare, ThumbsUp, Search, ArrowUp, ArrowRight, ArrowDown,
  CheckCircle2, ArrowUpRight,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mt-8 mb-4">
    <div className="ds-section-title"><h2>{title}</h2></div>
    <p className="ds-section-subtitle">{subtitle}</p>
  </div>
);

const getImpactBorder = (impact: string) => {
  if (impact === "High") return { borderLeft: '3px solid #F25454' };
  if (impact === "Medium") return { borderLeft: '3px solid #F5BE20' };
  return { borderLeft: '3px solid #22C55E' };
};

const getImpactBadgeClass = (impact: string) => {
  if (impact === "High") return "ds-badge ds-badge-danger";
  if (impact === "Medium") return "ds-badge ds-badge-warning";
  return "ds-badge ds-badge-positive";
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
      brand: b.brand, responseRate: b.mention_score, logo: b.logo,
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

  const sentimentBullets = useMemo(() => {
    if (!sentiment.summary) return [];
    return sentiment.summary.split(/[●•]|\n-\s*|\n/).map(s => s.trim()).filter(s => s.length > 0).slice(0, 5);
  }, [sentiment.summary]);

  const avgResponseRate = useMemo(() => {
    if (allBrandMentionRates.length === 0) return 0;
    return Math.round(allBrandMentionRates.reduce((sum, b) => sum + b.responseRate, 0) / allBrandMentionRates.length);
  }, [allBrandMentionRates]);

  if (!dataReady || !analyticsAvailable) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="text-center">
          <Search className="w-12 h-12 mx-auto mb-3 animate-spin" style={{ color: '#737E8F' }} />
          <h2 className="text-xl font-semibold mb-1" style={{ color: '#1E2433' }}>Analysis Started</h2>
          <p className="text-[13px]" style={{ color: '#737E8F' }}>Preparing your brand's comprehensive analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-6">
      <BrandInfoBar />

      <SectionHeader title="Overall Insights" subtitle="Key performance metrics across AI platforms" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4" style={{ alignItems: 'stretch' }}>
        {/* AI Visibility Card */}
        <div className="ds-card flex flex-col" style={{ minHeight: '100%' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: '#4DA6FF' }} />
              <span className="text-[14px] font-semibold" style={{ color: '#1E2433' }}>AI Visibility</span>
              <Tooltip>
                <TooltipTrigger><Info className="w-3.5 h-3.5" style={{ color: '#737E8F' }} /></TooltipTrigger>
                <TooltipContent className="max-w-xs"><p className="text-xs">A weighted score based on where and how often your brand appears in AI responses.</p></TooltipContent>
              </Tooltip>
            </div>
            <TierBadge tier={visibilityData.tier} />
          </div>
          <p className="text-[12px] mb-3" style={{ color: '#737E8F' }}>Where and how often your brand appears in AI responses</p>

          <div className="mb-4">
            <span className="text-[36px] font-bold leading-none" style={{ color: '#1E2433', fontVariantNumeric: 'tabular-nums' }}>{visibilityData.score}</span>
            <span className="text-[10px] ml-1.5 uppercase tracking-wider font-semibold" style={{ color: '#737E8F' }}>Score</span>
          </div>

          <div className="space-y-3 flex-1">
            {[
              { label: "Top Position", value: visibilityData.positionBreakdown.topPosition, color: "#22C55E", icon: ArrowUp },
              { label: "Mid Position (2–4)", value: visibilityData.positionBreakdown.midPosition, color: "#F5BE20", icon: ArrowRight },
              { label: "Low Position", value: visibilityData.positionBreakdown.lowPosition, color: "#F25454", icon: ArrowDown },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} style={{ borderLeft: `3px solid ${color}`, paddingLeft: '8px' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-[12px] font-medium" style={{ color: '#1E2433' }}>{label}</span>
                  </div>
                  <span className="text-[13px] font-semibold" style={{ color }}>{value}%</span>
                </div>
                <div className="h-[5px] rounded-full" style={{ background: '#EFF3F8' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4">
            <div className="ds-insight-chip">↑ {visibilityInsight}</div>
          </div>
        </div>

        {/* Brand Mentions Card */}
        <div className="ds-card flex flex-col" style={{ minHeight: '100%' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" style={{ color: '#F5BE20' }} />
              <span className="text-[14px] font-semibold" style={{ color: '#1E2433' }}>Brand Mentions</span>
            </div>
            <TierBadge tier={mentionsData.tier} />
          </div>
          <p className="text-[12px] mb-3" style={{ color: '#737E8F' }}>% of AI responses mentioning each brand</p>

          <div className="mb-1">
            <span className="text-[36px] font-bold leading-none" style={{ color: '#1E2433', fontVariantNumeric: 'tabular-nums' }}>{mentionsData.brandMentions}</span>
            <span className="text-[16px] font-bold" style={{ color: '#737E8F' }}>%</span>
            <div className="text-[12px] mt-0.5" style={{ color: '#737E8F' }}>across {allBrandMentionRates.length} total mentions</div>
          </div>

          <div className="space-y-2 flex-1 relative">
            {/* 50% dashed ref line label */}
            <div className="text-right pr-[calc(50%+2px)]" style={{ marginBottom: '-4px' }}>
              <span className="text-[10px]" style={{ color: '#737E8F' }}>50%</span>
            </div>
            {allBrandMentionRates.map((item, index) => (
              <div key={`brand-${item.brand}-${index}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    {item.logo && (
                      <img src={`https://www.google.com/s2/favicons?domain=${item.logo}&sz=16`} alt="" className="w-4 h-4 rounded-full object-contain"
                        style={{ background: '#FFFFFF' }} onError={(e) => { e.currentTarget.src = item.logo; }} />
                    )}
                    <span className={`text-[11px] font-medium ${item.isTestBrand ? '' : ''}`}
                      style={{ color: item.isTestBrand ? '#4DA6FF' : '#1E2433', fontWeight: item.isTestBrand ? 700 : 500 }}>
                      {item.brand}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: '#1E2433' }}>{item.responseRate}%</span>
                </div>
                <div className="h-[6px] rounded-full relative cursor-pointer" style={{ background: '#EFF3F8' }}
                  onClick={() => navigate(`/results/prompts?expandAll=true&viewType=brand`)}>
                  <div className="absolute top-0 bottom-0" style={{ left: '50%', width: '1px', borderLeft: '1px dashed #CBD5E1', zIndex: 2 }} />
                  <div className="h-full rounded-full transition-all duration-700"
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
            <div className="ds-insight-chip">Your brand ranked {toOrdinal(mentionsData.position)} of {mentionsData.totalBrands} brands</div>
          </div>
        </div>

        {/* Sentiment Card */}
        <div className="ds-card flex flex-col justify-between" style={{ minHeight: '100%' }}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" style={{ color: '#22C55E' }} />
                <span className="text-[14px] font-semibold" style={{ color: '#1E2433' }}>Sentiment</span>
              </div>
              <TierBadge tier={sentiment.dominant_sentiment} />
            </div>
            <p className="text-[12px] mb-3" style={{ color: '#737E8F' }}>How AI models perceive your brand's authority</p>

            <div className="text-[24px] font-bold mb-3" style={{ color: '#1E2433' }}>{sentiment.dominant_sentiment}</div>

            <div className="space-y-2">
              {sentimentBullets.length > 0 ? (
                sentimentBullets.map((bullet, index) => (
                  <div key={`s-${index}`} className="flex items-start gap-2">
                    <CheckCircle2 className="w-[14px] h-[14px] flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
                    <span className="text-[13px] leading-relaxed" style={{ color: '#1E2433' }}>{bullet}</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Info className="w-8 h-8 mb-2" style={{ color: '#94A3B8' }} />
                  <span className="text-[13px]" style={{ color: '#737E8F' }}>No sentiment data available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-4" style={{ borderBottom: '1px solid #E3EAF2' }} />

      {/* Key Signals */}
      {recommendations.length > 0 && (
        <>
          <SectionHeader title="Key Signals" subtitle="Data-driven actions from your analysis" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {recommendations.slice(0, 4).map((rec: any, index: number) => (
              <div key={index} className="ds-card flex flex-col" style={getImpactBorder(rec.impact)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={getImpactBadgeClass(rec.impact)}>{cleanPriorityLabel(rec.priority_tier) || `${rec.impact} Impact`}</span>
                </div>
                <p className="text-[14px] font-medium leading-relaxed mb-3" style={{ color: '#1E2433', marginTop: '8px' }}>
                  {rec.insight?.summary || rec.overall_insight || ""}
                </p>
                <div className="flex items-center justify-between mt-auto pt-3">
                  <div className="flex items-center gap-2">
                    <span className={getImpactBadgeClass(rec.overall_effort)}>Effort: {rec.overall_effort}</span>
                    <span className={getImpactBadgeClass(rec.impact)}>Impact: {rec.impact}</span>
                  </div>
                  <button onClick={() => navigate('/results/recommendations')} className="text-[12px] font-medium flex items-center gap-1" style={{ color: '#4DA6FF' }}>
                    View action →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 mb-4" style={{ borderBottom: '1px solid #E3EAF2' }} />
        </>
      )}

      {/* Competitor Intelligence */}
      <SectionHeader title="Competitor Intelligence" subtitle="Compare your AI visibility against competitors" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <CompetitorComparisonChart />
        <BrandMentionsRadar />
      </div>

      <div className="mt-8 mb-4" style={{ borderBottom: '1px solid #E3EAF2' }} />

      {/* Platform & Model Analysis */}
      <SectionHeader title="Platform & Model Analysis" subtitle="Performance across AI platforms" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <LLMVisibilityTable />
        <PlatformPresence />
      </div>

      <div className="mt-8 mb-4" style={{ borderBottom: '1px solid #E3EAF2' }} />

      {/* Buyer Intent */}
      <SectionHeader title="Buyer Intent & Conversion Dynamics" subtitle="Visibility across buyer journey stages" />
      <div className="mt-4">
        <IntentWiseScoring />
      </div>
    </div>
  );
};

export default OverviewContent;
