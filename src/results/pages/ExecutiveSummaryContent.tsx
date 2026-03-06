import { toOrdinal } from "@/results/data/formulas";
import { TierBadge } from "@/results/ui/TierBadge";
import {
  getExecutiveSummary, getAIVisibilityMetrics, getBrandInfoWithLogos, getRecommendations,
} from "@/results/data/analyticsData";
import { CheckCircle2, XCircle, Target, Trophy, TrendingUp, ArrowDown } from "lucide-react";

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mt-8 mb-4">
    <div className="ds-section-title"><h2>{title}</h2></div>
    <p className="ds-section-subtitle">{subtitle}</p>
  </div>
);

const ScoreDonut = ({ score, max = 20 }: { score: number; max?: number }) => {
  const pct = (score / max) * 100;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative" style={{ width: '130px', height: '130px' }}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#EFF3F8" strokeWidth="12" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#4DA6FF" strokeWidth="12"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[32px] font-bold" style={{ color: '#1E2433' }}>{score}</span>
        <span className="text-[16px]" style={{ color: '#737E8F' }}>/ {max}</span>
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
    return brandInfo.find((b) => b.brand === cleanName)?.logo;
  };
  const getGeoScore = (brandName: string) => {
    const cleanName = brandName.replace(/\s*\(GEO \d+\)/, "");
    return brandInfo.find((b) => b.brand === cleanName)?.geo_score || 0;
  };
  const getOutlook = (brandName: string) => {
    const cleanName = brandName.replace(/\s*\(GEO \d+\)/, "");
    return brandInfo.find((b) => b.brand === cleanName)?.outlook || "Neutral";
  };
  const outlookDotColor = (outlook: string) => {
    if (outlook === "Positive") return "#22C55E";
    if (outlook === "Negative") return "#F25454";
    return "#F5BE20";
  };

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-6">
      {/* Header */}
      <div className="ds-card">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[32px] font-bold" style={{ color: '#1E2433' }}>Executive Summary</h1>
          <TierBadge tier={visibilityData.tier} />
        </div>
        <p className="text-[14px] mt-2" style={{ color: '#737E8F' }}>
          A comprehensive overview of your brand's AI visibility performance, strengths, and areas for improvement
        </p>
      </div>

      {/* Conclusion callout */}
      {executiveSummary.conclusion && (
        <div className="mt-4 rounded-[10px] p-4 px-5" style={{ background: '#EFF3F8', borderLeft: '4px solid #4DA6FF' }}>
          <p className="text-[15px] font-medium leading-relaxed" style={{ color: '#1E2433' }}>
            {executiveSummary.conclusion || executiveSummary.brand_score_and_tier}
          </p>
        </div>
      )}

      {/* Score + Strengths + Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4" style={{ alignItems: 'stretch' }}>
        {/* Score Card */}
        <div className="ds-card flex flex-col items-center justify-center text-center">
          <ScoreDonut score={visibilityData.score} max={20} />
          <TierBadge tier={visibilityData.tier} className="text-sm px-3 py-1 mt-3" />
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold mt-2"
            style={{ background: '#EFF3F8', color: '#4DA6FF' }}>
            Ranked {toOrdinal(visibilityData.brandPosition)} of {visibilityData.totalBrands} brands
          </span>
        </div>

        {/* Strengths */}
        <div className="ds-card">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5" style={{ color: '#22C55E' }} />
            <span className="text-[16px] font-bold" style={{ color: '#22C55E' }}>Strengths</span>
          </div>
          <ul className="space-y-2">
            {executiveSummary.strengths?.map((strength: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-[13px] leading-relaxed rounded-lg p-2.5"
                style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderLeft: '3px solid #22C55E' }}>
                <span className="flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                  style={{ background: '#22C55E' }}>{index + 1}</span>
                <span style={{ color: '#1E2433' }}>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="ds-card">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5" style={{ color: '#F25454' }} />
            <span className="text-[16px] font-bold" style={{ color: '#F25454' }}>Weaknesses</span>
          </div>
          <ul className="space-y-2">
            {executiveSummary.weaknesses?.map((weakness: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-[13px] leading-relaxed rounded-lg p-2.5"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: '3px solid #F25454' }}>
                <span className="flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                  style={{ background: '#F25454' }}>{index + 1}</span>
                <span style={{ color: '#1E2433' }}>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 mb-4" style={{ borderBottom: '1px solid #E3EAF2' }} />

      {/* Competitive Positioning */}
      <SectionHeader title="Competitive Positioning" subtitle="How your brand compares against competitors in AI visibility" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[
          { title: "Leaders", data: executiveSummary.competitor_positioning.leaders, icon: Trophy, bg: "#F0FDF4", borderColor: "#22C55E", titleColor: "#16A34A" },
          { title: "Mid-Tier", data: executiveSummary.competitor_positioning.mid_tier, icon: TrendingUp, bg: "#FFFBEB", borderColor: "#F5BE20", titleColor: "#D97706" },
          { title: "Laggards", data: executiveSummary.competitor_positioning.laggards, icon: ArrowDown, bg: "#FEF2F2", borderColor: "#F25454", titleColor: "#DC2626" },
        ].map(({ title, data, icon: Icon, bg, borderColor, titleColor }) => (
          <div key={title} className="ds-card" style={{ background: bg, borderLeft: `3px solid ${borderColor}` }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4" style={{ color: borderColor }} />
              <span className="text-[14px] font-bold" style={{ color: titleColor }}>{title}</span>
            </div>
            <div className="space-y-3">
              {data?.map((brand: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 py-2"
                  style={{ borderBottom: idx < data.length - 1 ? `1px solid ${borderColor}30` : 'none' }}>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="w-[10px] h-[10px] rounded-full" style={{ background: outlookDotColor(getOutlook(brand.name)) }} />
                    {getBrandLogo(brand.name) && (
                      <img src={getBrandLogo(brand.name)} alt="" className="w-5 h-5 rounded-full object-contain"
                        style={{ background: '#FFFFFF', border: '1px solid #E3EAF2' }} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-bold" style={{ color: '#1E2433' }}>{brand.name}</p>
                      <span className="text-[16px] font-bold" style={{ color: '#1E2433' }}>{getGeoScore(brand.name)}</span>
                    </div>
                    <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: '#737E8F' }}>{brand.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-4" style={{ borderBottom: '1px solid #E3EAF2' }} />

      {/* Prioritized Actions */}
      <SectionHeader title="Prioritized Actions" subtitle="Top recommended next steps to improve your positioning" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {executiveSummary.prioritized_actions?.map((action: string, index: number) => {
          const rec = recommendations[index];
          return (
            <div key={index} className="ds-card">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold text-white"
                  style={{ background: '#4DA6FF' }}>{index + 1}</span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium leading-relaxed" style={{ color: '#1E2433', marginTop: '4px' }}>{action}</p>
                  {rec && (
                    <div className="flex items-center gap-2 mt-3">
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
