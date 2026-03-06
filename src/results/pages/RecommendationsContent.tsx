import { useMemo } from "react";
import { getBrandName, getRecommendations } from "@/results/data/analyticsData";
import {
  Lightbulb,
  Zap,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mt-8 mb-4">
    <div className="ds-section-title">
      <h2 className="text-lg font-bold text-ds-text">{title}</h2>
    </div>
    <p className="ds-section-subtitle">{subtitle}</p>
  </div>
);

const getImpactNumberStyle = (impact: string) => {
  if (impact === "High") return { bg: "#FEF2F2", border: "#F25454", text: "#F25454" };
  if (impact === "Medium") return { bg: "#FFFBEB", border: "#F5BE20", text: "#D97706" };
  return { bg: "#F0FDF4", border: "#22C55E", text: "#16A34A" };
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

const cleanPriorityLabel = (tier: string) => {
  if (!tier) return "";
  const t = tier.toLowerCase();
  if (t === "high_impact") return "High Impact";
  if (t === "medium_impact") return "Medium Impact";
  if (t === "quick_win") return "Quick Win";
  return tier;
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
      <div className="ds-card !rounded-2xl !px-6 !py-5">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0" style={{ background: '#FFF9EE', borderColor: '#F0D8AB' }}>
                <Lightbulb className="w-4 h-4 text-ds-warning" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ds-text-muted">Action Plan</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[32px] md:text-[48px] leading-[1.02] font-semibold tracking-[-0.02em] text-ds-text">Strategic Recommendations</h1>
              <span className="ds-badge ds-badge-info text-[14px] font-bold translate-y-[-4px]">{recommendations.length} Action Items</span>
            </div>
            <p className="text-[13px] text-ds-text-muted leading-relaxed mt-2 max-w-2xl">
              Targeted optimizations for {brandName}'s AI search visibility
            </p>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[
          { icon: Zap, label: "High Impact", value: highImpact.length, color: "#22C55E", bg: "#F0FDF4", border: "#BBF7D0" },
          { icon: TrendingUp, label: "Strategic Growth", value: mediumImpact.length, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
          { icon: Target, label: "Quick Wins", value: quickWins.length, color: "#4DA6FF", bg: "#EFF6FF", border: "#BFDBFE" },
        ].map(({ icon: Icon, label, value, color, bg, border }) => (
          <div key={label} className="ds-card" style={{ background: bg, borderColor: border }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-[13px] font-semibold uppercase tracking-wider" style={{ color }}>{label}</span>
            </div>
            <div className="text-[32px] font-bold text-ds-text leading-none">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-4 border-b border-border" />

      <SectionHeader title="Actionable Insights" subtitle="Prioritized recommendations to improve your AI visibility" />

      {/* Recommendations List */}
      <div className="flex flex-col gap-6 mt-4">
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
            <div key={index} className="ds-card overflow-hidden">
              {/* Card Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: numStyle.bg, border: `2px solid ${numStyle.border}` }}>
                  <span className="text-[18px] font-bold" style={{ color: numStyle.text }}>{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-[10px] uppercase font-semibold text-ds-text-muted">Effort</span>
                    <span className={getBadgeClass(rec.overall_effort)}>{rec.overall_effort}</span>
                    <span className="text-[10px] uppercase font-semibold text-ds-text-muted ml-2">Impact</span>
                    <span className={getBadgeClass(rec.impact)}>{rec.impact}</span>
                  </div>
                </div>
              </div>

              {/* Insight */}
              {insightText && (
                <div className="rounded-lg p-3 mb-4" style={{ background: insightStyle.bg, borderLeft: `3px solid ${insightStyle.border}` }}>
                  <span className="text-[10px] uppercase font-semibold text-ds-text-muted block mb-1">Insight</span>
                  <p className="text-[13px] text-ds-text font-medium leading-relaxed">{insightText}</p>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-3.5 h-3.5 text-ds-blue" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ds-blue">Suggested Action</span>
                </div>
                <p className="text-[18px] font-bold text-ds-text leading-[1.3] mb-3">{strategyTitle}</p>

                {(steps.length > 0 || successSignal) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {steps.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-ds-text-muted mb-2 block">Execution Steps</span>
                        <ol className="space-y-0">
                          {steps.slice(0, 4).map((step: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-[14px] text-ds-text leading-relaxed py-2" style={{ borderBottom: i < steps.length - 1 ? '1px solid #E3EAF2' : 'none' }}>
                              <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold text-white mt-0.5" style={{ background: '#4DA6FF' }}>{i + 1}</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {successSignal && (
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-ds-text-muted mb-2 block">Expected Outcome</span>
                        <div className="rounded-lg p-3" style={{ background: '#F0FDF4', borderLeft: '3px solid #22C55E' }}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
                            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#22C55E' }}>Success Signal</span>
                          </div>
                          <p className="text-[13px] text-ds-text-muted italic leading-relaxed">{successSignal}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end mt-3">
                  <button onClick={() => navigate('/results/prompts')} className="text-[12px] font-medium text-ds-blue hover:underline flex items-center gap-1">
                    View related prompts <ArrowUpRight className="w-3 h-3" />
                  </button>
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
