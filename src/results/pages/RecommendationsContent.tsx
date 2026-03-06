import { useMemo } from "react";
import { getBrandName, getRecommendations } from "@/results/data/analyticsData";
import { Lightbulb, Zap, TrendingUp, ArrowUpRight, CheckCircle2, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mt-8 mb-4">
    <div className="ds-section-title"><h2>{title}</h2></div>
    <p className="ds-section-subtitle">{subtitle}</p>
  </div>
);

const getImpactNumberStyle = (impact: string) => {
  if (impact === "High") return { bg: "#FFFFFF", border: "#F25454", text: "#F25454" };
  if (impact === "Medium") return { bg: "#FFFFFF", border: "#F5BE20", text: "#D97706" };
  return { bg: "#FFFFFF", border: "#22C55E", text: "#16A34A" };
};

const getInsightBg = (impact: string) => {
  if (impact === "High") return { bg: "#FEF2F2", border: "#F25454" };
  if (impact === "Medium") return { bg: "#FFFBEB", border: "#F5BE20" };
  return { bg: "#F0FDF4", border: "#22C55E" };
};

const getBadgeClass = (level: string) => {
  if (level === "High") return "ds-badge ds-badge-danger";
  if (level === "Medium") return "ds-badge ds-badge-warning";
  return "ds-badge ds-badge-positive";
};

const RecommendationsContent = () => {
  const brandName = getBrandName();
  const recommendations = getRecommendations();
  const navigate = useNavigate();

  const highImpact = useMemo(() => recommendations.filter((r: any) => r.impact === "High"), [recommendations]);
  const mediumImpact = useMemo(() => recommendations.filter((r: any) => r.impact === "Medium"), [recommendations]);
  const quickWins = useMemo(() => recommendations.filter((r: any) => r.overall_effort === "Low" && r.impact === "High"), [recommendations]);

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-6">
      {/* Header */}
      <div className="ds-card">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[32px] font-bold" style={{ color: '#1E2433' }}>Strategic Recommendations</h1>
          <span className="ds-badge ds-badge-info text-[13px]">{recommendations.length} Action Items</span>
        </div>
        <p className="text-[13px] leading-relaxed mt-2 max-w-2xl" style={{ color: '#737E8F' }}>
          Targeted optimizations for {brandName}'s AI search visibility
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4" style={{ alignItems: 'stretch' }}>
        {[
          { icon: Zap, label: "High Impact", value: highImpact.length, color: "#F25454", bg: "#FEF2F2", border: "rgba(242,84,84,0.3)", titleColor: "#F25454" },
          { icon: TrendingUp, label: "Strategic Growth", value: mediumImpact.length, color: "#D97706", bg: "#FFFBEB", border: "rgba(217,119,6,0.3)", titleColor: "#D97706" },
          { icon: Target, label: "Quick Wins", value: quickWins.length, color: "#16A34A", bg: "#F0FDF4", border: "rgba(22,163,74,0.3)", titleColor: "#16A34A" },
        ].map(({ icon: Icon, label, value, color, bg, border, titleColor }) => (
          <div key={label} className="ds-card" style={{ background: bg, borderColor: border }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: titleColor }}>{label}</span>
            </div>
            {value > 0 ? (
              <div className="text-[36px] font-bold leading-none" style={{ color: titleColor, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
            ) : (
              <div className="text-[13px] italic" style={{ color: '#737E8F' }}>None identified</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 mb-4" style={{ borderBottom: '1px solid #E3EAF2' }} />

      <SectionHeader title="Actionable Insights" subtitle="Prioritized recommendations to improve your AI visibility" />

      {/* Recommendations */}
      <div className="flex flex-col mt-4">
        {recommendations.map((rec: any, index: number) => {
          const steps = Array.isArray(rec?.suggested_action_v1?.how_to_execute) && rec.suggested_action_v1.how_to_execute.length
            ? rec.suggested_action_v1.how_to_execute
            : rec?.suggested_action ? rec.suggested_action.split(".").map((s: string) => s.trim()).filter(Boolean).slice(0, 3) : [];
          const successSignal = rec?.suggested_action_v1?.success_signal || null;
          const strategyTitle = rec?.suggested_action_v1?.strategy || rec?.suggested_action || "";
          const insightText = rec?.insight?.summary || rec?.overall_insight || "";
          const numStyle = getImpactNumberStyle(rec.impact);
          const insightStyle = getInsightBg(rec.impact);

          return (
            <div key={index}>
              {index > 0 && <div className="my-6" style={{ borderTop: '1px solid #E3EAF2' }} />}
              <div className="ds-card overflow-hidden">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: numStyle.bg, border: `2px solid ${numStyle.border}` }}>
                    <span className="text-[18px] font-bold" style={{ color: numStyle.text }}>{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap pt-1.5">
                    <span className={getBadgeClass(rec.overall_effort)}>Effort: {rec.overall_effort}</span>
                    <span className={getBadgeClass(rec.impact)}>Impact: {rec.impact}</span>
                  </div>
                </div>

                {/* Insight */}
                {insightText && (
                  <div className="rounded-lg p-3 mb-4" style={{ background: insightStyle.bg, borderLeft: `3px solid ${insightStyle.border}` }}>
                    <span className="text-[10px] uppercase font-semibold block mb-1" style={{ color: '#737E8F' }}>Insight</span>
                    <p className="text-[13px] font-medium leading-relaxed" style={{ color: '#1E2433' }}>{insightText}</p>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #E3EAF2', paddingTop: '16px' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#4DA6FF' }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#4DA6FF' }}>Suggested Action</span>
                  </div>
                  <p className="text-[18px] font-bold leading-[1.3] mb-1" style={{ color: '#1E2433' }}>{strategyTitle}</p>
                  {rec?.suggested_action_v1?.start_here && (
                    <p className="text-[13px] italic mb-3" style={{ color: '#737E8F' }}>→ {rec.suggested_action_v1.start_here}</p>
                  )}

                  {(steps.length > 0 || successSignal) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      {steps.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: '#737E8F' }}>Execution Steps</span>
                          <ol className="space-y-0">
                            {steps.slice(0, 4).map((step: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed py-2"
                                style={{ borderBottom: i < steps.length - 1 ? '1px solid #E3EAF2' : 'none', color: '#1E2433' }}>
                                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold text-white mt-0.5"
                                  style={{ background: '#4DA6FF' }}>{i + 1}</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {successSignal && (
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: '#737E8F' }}>Expected Outcome</span>
                          <div className="rounded-lg p-3" style={{ background: '#F0FDF4', borderLeft: '3px solid #22C55E' }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
                              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#22C55E' }}>Success Signal</span>
                            </div>
                            <p className="text-[13px] italic leading-relaxed" style={{ color: '#737E8F' }}>{successSignal}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end mt-3">
                    <button onClick={() => navigate('/results/prompts')} className="text-[12px] font-medium flex items-center gap-1" style={{ color: '#4DA6FF' }}>
                      View related prompts →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsContent;
