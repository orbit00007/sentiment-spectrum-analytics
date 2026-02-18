import { useState } from "react";
import { getRecommendations, getBrandName } from "@/results/data/analyticsData";
import {
  Lightbulb,
  Target,
  TrendingUp,
  Zap,
  Play,
  ChevronDown,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const RecommendationsContent = () => {
  const brandName = getBrandName();
  const recommendations = getRecommendations();
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "medium" | "quick">("all");
  const [expandedHowTo, setExpandedHowTo] = useState<Record<number, boolean>>({});

  const getEffortConfig = (effort: string) => {
    switch (effort) {
      case "High": return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", label: "Hard" };
      case "Medium": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", label: "Moderate" };
      case "Low": return { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20", label: "Easy" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", label: effort };
    }
  };

  const getImpactConfig = (impact: string) => {
    switch (impact) {
      case "High": return { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20" };
      case "Medium": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" };
      case "Low": return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
    }
  };

  const getImpactBarWidth = (impact: string) => {
    switch (impact) {
      case "High": return "75%";
      case "Medium": return "50%";
      case "Low": return "25%";
      default: return "0%";
    }
  };

  const getImpactBarColor = (impact: string) => {
    switch (impact) {
      case "High": return "bg-green-500";
      case "Medium": return "bg-amber-500";
      case "Low": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  const getPriorityBadge = (impact: string, effort: string) => {
    if (impact === "High" && effort === "Low") return { label: "Critical", color: "bg-red-500 text-white" };
    if (impact === "High") return { label: "High", color: "bg-orange-500/10 text-orange-600 border border-orange-500/20" };
    if (impact === "Medium") return { label: "Medium", color: "bg-amber-500/10 text-amber-600 border border-amber-500/20" };
    return null;
  };

  const getCategoryTag = (insight: string) => {
    const lower = insight.toLowerCase();
    if (lower.includes("content") || lower.includes("page") || lower.includes("blog")) return "CONTENT";
    if (lower.includes("technical") || lower.includes("schema") || lower.includes("canonical")) return "TECHNICAL";
    if (lower.includes("authority") || lower.includes("source") || lower.includes("citation")) return "AUTHORITY";
    if (lower.includes("visibility") || lower.includes("mention") || lower.includes("rank")) return "VISIBILITY";
    return "STRATEGY";
  };

  const highImpact = recommendations.filter((r: any) => r.impact === "High");
  const mediumImpact = recommendations.filter((r: any) => r.impact === "Medium");
  const quickWins = recommendations.filter((r: any) => r.overall_effort === "Low" && r.impact === "High");

  const filteredRecommendations = () => {
    switch (activeFilter) {
      case "high": return highImpact;
      case "medium": return mediumImpact;
      case "quick": return quickWins;
      default: return recommendations;
    }
  };

  const displayedRecommendations = filteredRecommendations();

  return (
    <div className="p-4 md:p-6 space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Strategic Recommendations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Our AI has analyzed your current GEO rankings and competitive landscape. These prioritized actions will yield the highest visibility ROI.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Actions</span>
          </div>
          <span className="text-3xl font-bold text-foreground">{recommendations.length}</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">High Impact</span>
          </div>
          <span className="text-3xl font-bold text-green-500">{highImpact.length}</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Quick Wins</span>
          </div>
          <span className="text-3xl font-bold text-amber-500">{quickWins.length}</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Strategic Goals</span>
          </div>
          <span className="text-3xl font-bold text-foreground">{mediumImpact.length + highImpact.length}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {[
          { key: "all", label: "all" },
          { key: "high", label: "high impact" },
          { key: "quick", label: "quick wins" },
          { key: "medium", label: "medium" },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeFilter === filter.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {filter.label}
          </button>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">
          Sorted by: Priority & Estimated Impact
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {displayedRecommendations.map((rec: any, index: number) => {
          const effortConfig = getEffortConfig(rec.overall_effort);
          const impactConfig = getImpactConfig(rec.impact);
          const priorityBadge = getPriorityBadge(rec.impact, rec.overall_effort);
          const categoryTag = getCategoryTag(rec.overall_insight || "");
          const hasSuggestedActionV1 = rec.suggested_action_v1 && typeof rec.suggested_action_v1 === "object" && Object.keys(rec.suggested_action_v1).length > 0;
          const insightSummary = rec.insight?.summary || rec.overall_insight || "";
          const isHowToExpanded = !!expandedHowTo[index];

          return (
            <div key={index} className="bg-card rounded-xl border-l-4 border border-border overflow-hidden" style={{ borderLeftColor: rec.impact === "High" ? "hsl(var(--primary))" : rec.impact === "Medium" ? "#f59e0b" : "hsl(var(--border))" }}>
              <div className="p-5">
                {/* Top row: Priority + Category */}
                <div className="flex items-center gap-2 mb-3">
                  {priorityBadge && (
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${priorityBadge.color}`}>
                      {priorityBadge.label}
                    </span>
                  )}
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {categoryTag}
                  </span>
                </div>

                {/* Title / Insight */}
                <h3 className="text-base font-semibold text-foreground mb-3">{insightSummary}</h3>

                {/* AI Insight Quote */}
                {hasSuggestedActionV1 && rec.suggested_action_v1?.strategy && (
                  <div className="bg-primary/5 border border-primary/15 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">AI INSIGHT</span>
                    </div>
                    <p className="text-sm text-foreground italic leading-relaxed">
                      "{rec.suggested_action_v1.strategy}"
                    </p>
                  </div>
                )}

                {/* Impact Bar + Effort */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>↗ Estimated Impact</span>
                      <span className={impactConfig.text}>{rec.impact}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${getImpactBarColor(rec.impact)}`} style={{ width: getImpactBarWidth(rec.impact) }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground block">⊙ Effort Level</span>
                    <span className={`text-xs font-semibold ${effortConfig.text}`}>{effortConfig.label}</span>
                  </div>
                </div>

                {/* Suggested Action */}
                {hasSuggestedActionV1 && (
                  <div className="space-y-3">
                    {rec.suggested_action_v1?.start_here && (
                      <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                        <Target className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Recommended action:</span>
                          <p className="text-sm text-foreground mt-0.5">{rec.suggested_action_v1.start_here}</p>
                        </div>
                      </div>
                    )}

                    {/* How to execute */}
                    {Array.isArray(rec.suggested_action_v1?.how_to_execute) && (
                      <div>
                        <button
                          type="button"
                          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                          onClick={() => setExpandedHowTo((prev) => ({ ...prev, [index]: !prev[index] }))}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isHowToExpanded ? "rotate-180" : ""}`} />
                          How to execute
                        </button>
                        {isHowToExpanded && (
                          <ol className="mt-3 space-y-2 pl-1">
                            {rec.suggested_action_v1.how_to_execute.map((step: string, stepIndex: number) => (
                              <li key={stepIndex} className="flex gap-3 text-sm text-foreground">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                  {stepIndex + 1}
                                </span>
                                <span className="leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    )}

                    {/* Success signal */}
                    {rec.suggested_action_v1?.success_signal && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Success signal</p>
                        <p className="text-xs italic text-muted-foreground">{rec.suggested_action_v1.success_signal}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Fallback for old format */}
                {!hasSuggestedActionV1 && rec.suggested_action && (
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                    <Target className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Recommended action:</span>
                      <p className="text-sm text-foreground mt-0.5">{rec.suggested_action}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsContent;
