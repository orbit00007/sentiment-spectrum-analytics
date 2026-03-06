import { toOrdinal } from "@/results/data/formulas";
import { TierBadge } from "@/results/ui/TierBadge";
import {
  getExecutiveSummary,
  getAIVisibilityMetrics,
  getBrandInfoWithLogos,
  getRecommendations,
} from "@/results/data/analyticsData";
import {
  CheckCircle2,
  XCircle,
  Target,
  Trophy,
  TrendingUp,
  ArrowDown,
} from "lucide-react";

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mt-8 mb-4">
    <div className="ds-section-title">
      <h2 className="text-lg font-bold text-ds-text">{title}</h2>
    </div>
    <p className="ds-section-subtitle">{subtitle}</p>
  </div>
);

/* Donut Score Ring */
const ScoreDonut = ({ score, max = 20 }: { score: number; max?: number }) => {
  const pct = (score / max) * 100;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-[120px] h-[120px]">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#EFF3F8" strokeWidth="10" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#4DA6FF" strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-bold text-ds-text">{score}</span>
        <span className="text-[14px] text-ds-text-muted">/ {max}</span>
      </div>
    </div>
  );
};

const ExecutiveSummaryContent = () => {
  const visibilityData = getAIVisibilityMetrics();
  const brandInfo = getBrandInfoWithLogos();
  const executiveSummary = getExecutiveSummary();
  const recommendations = getRecommendations();

  const getBrandLogo = (brandName: string) => {
    const cleanName = brandName.replace(/\s*\(GEO \d+\)/, "");
    const brand = brandInfo.find((b) => b.brand === cleanName);
    return brand?.logo;
  };

  const getGeoScore = (brandName: string) => {
    const cleanName = brandName.replace(/\s*\(GEO \d+\)/, "");
    const brand = brandInfo.find((b) => b.brand === cleanName);
    return brand?.geo_score || 0;
  };

  const getOutlook = (brandName: string) => {
    const cleanName = brandName.replace(/\s*\(GEO \d+\)/, "");
    const brand = brandInfo.find((b) => b.brand === cleanName);
    return brand?.outlook || "Neutral";
  };

  const outlookDotColor = (outlook: string) => {
    if (outlook === "Positive") return "#22C55E";
    if (outlook === "Negative") return "#F25454";
    return "#F5BE20";
  };

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-6">
      {/* Header */}
      <div className="ds-card !rounded-2xl !px-6 !py-5">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center border border-[#DBEAFE] flex-shrink-0">
                <Target className="w-4 h-4 text-ds-blue" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ds-text-muted">Performance Report</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[32px] md:text-[48px] leading-[1.02] font-semibold tracking-[-0.02em] text-ds-text">Executive Summary</h1>
              <TierBadge tier={visibilityData.tier} className="text-[13px] px-3 py-1 font-semibold rounded-md translate-y-[-4px]" />
            </div>
            <p className="text-[13px] text-ds-text-muted leading-relaxed mt-2 max-w-2xl">
              A comprehensive overview of your brand's AI visibility performance, strengths, and areas for improvement
            </p>
          </div>
        </div>
      </div>

      {/* Overall Assessment */}
      {executiveSummary.conclusion && (
        <div className="ds-card mt-4">
          <div className="rounded-lg p-4" style={{ background: '#EFF3F8', borderLeft: '3px solid #4DA6FF' }}>
            <p className="text-[15px] text-ds-text leading-relaxed">{executiveSummary.conclusion || executiveSummary.brand_score_and_tier}</p>
          </div>
        </div>
      )}

      {/* Score + Strengths + Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Score Card - Donut */}
        <div className="ds-card flex flex-col items-center justify-center text-center">
          <ScoreDonut score={visibilityData.score} max={20} />
          <TierBadge tier={visibilityData.tier} className="text-sm px-3 py-1 mt-3" />
          <div className="inline-flex items-center rounded-full font-bold px-2.5 py-0.5 text-[11px] bg-[#4DA6FF] text-white mt-2">
            Ranked {toOrdinal(visibilityData.brandPosition)} of {visibilityData.totalBrands} brands
          </div>
        </div>

        {/* Strengths */}
        <div className="ds-card">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-ds-success" />
            <span className="text-[14px] font-semibold text-ds-text">Strengths</span>
          </div>
          <ul className="space-y-2">
            {executiveSummary.strengths?.map((strength: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-[13px] text-ds-text leading-relaxed rounded-lg p-2" style={{ background: '#F0FDF4', borderLeft: '3px solid #22C55E', border: '1px solid #BBF7D0', borderLeftWidth: '3px', borderLeftColor: '#22C55E' }}>
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5" style={{ background: '#22C55E' }}>{index + 1}</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="ds-card">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-ds-danger" />
            <span className="text-[14px] font-semibold text-ds-text">Weaknesses</span>
          </div>
          <ul className="space-y-2">
            {executiveSummary.weaknesses?.map((weakness: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-[13px] text-ds-text leading-relaxed rounded-lg p-2" style={{ background: '#FEF2F2', borderLeft: '3px solid #F25454', border: '1px solid #FECACA', borderLeftWidth: '3px', borderLeftColor: '#F25454' }}>
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5" style={{ background: '#F25454' }}>{index + 1}</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 mb-4 border-b border-border" />

      {/* Competitive Positioning */}
      <SectionHeader title="Competitive Positioning" subtitle="How your brand compares against competitors in AI visibility" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[
          { title: "Leaders", data: executiveSummary.competitor_positioning.leaders, icon: Trophy, bg: "#F0FDF4", borderColor: "#22C55E", iconColor: "#22C55E", titleColor: "#16A34A" },
          { title: "Mid-Tier", data: executiveSummary.competitor_positioning.mid_tier, icon: TrendingUp, bg: "#FFFBEB", borderColor: "#F5BE20", iconColor: "#F5BE20", titleColor: "#D97706" },
          { title: "Laggards", data: executiveSummary.competitor_positioning.laggards, icon: ArrowDown, bg: "#FEF2F2", borderColor: "#F25454", iconColor: "#F25454", titleColor: "#DC2626" },
        ].map(({ title, data, icon: Icon, bg, borderColor, iconColor, titleColor }) => (
          <div key={title} className="ds-card" style={{ background: bg, borderLeft: `3px solid ${borderColor}` }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4" style={{ color: iconColor }} />
              <span className="text-[14px] font-semibold" style={{ color: titleColor }}>{title}</span>
            </div>
            <div className="space-y-3">
              {data?.map((brand: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 py-2" style={{ borderBottom: idx < data.length - 1 ? '1px solid #E3EAF2' : 'none' }}>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full" style={{ background: outlookDotColor(getOutlook(brand.name)) }} />
                    {getBrandLogo(brand.name) && (
                      <img src={getBrandLogo(brand.name)} alt="" className="w-6 h-6 rounded-full object-contain bg-white border border-border flex-shrink-0" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-ds-text">{brand.name}</p>
                      <span className="text-[13px] font-bold text-ds-text">{getGeoScore(brand.name)}</span>
                    </div>
                    <p className="text-[12px] text-ds-text-muted leading-relaxed mt-0.5">{brand.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-4 border-b border-border" />

      {/* Prioritized Actions */}
      <SectionHeader title="Prioritized Actions" subtitle="Top recommended next steps to improve your positioning" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {executiveSummary.prioritized_actions?.map((action: string, index: number) => {
          const rec = recommendations[index];
          return (
            <div key={index} className="ds-card">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-[14px] font-bold" style={{ background: '#4DA6FF' }}>
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-[13px] text-ds-text leading-relaxed">{action}</p>
                  {rec && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`ds-badge ${rec.overall_effort === "High" ? "ds-badge-danger" : rec.overall_effort === "Medium" ? "ds-badge-warning" : "ds-badge-positive"}`}>
                        Effort: {rec.overall_effort}
                      </span>
                      <span className={`ds-badge ${rec.impact === "High" ? "ds-badge-danger" : rec.impact === "Medium" ? "ds-badge-warning" : "ds-badge-positive"}`}>
                        Impact: {rec.impact}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExecutiveSummaryContent;
