import { useMemo } from "react";
import { getSearchKeywordsWithPrompts, getBrandInfoWithLogos, getBrandName, getLlmData, hasAnalyticsData } from "@/results/data/analyticsData";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useResults } from "@/results/context/ResultsContext";

const INTENTS = [
  { key: "discovery", label: "Discovery", color: "#4DA6FF" },
  { key: "use_case", label: "Use Case", color: "#A78BFA" },
  { key: "comparison", label: "Comparison", color: "#22C55E" },
  { key: "pricing", label: "Pricing", color: "#F25454" },
  { key: "trust", label: "Trust", color: "#14B8A6" },
] as const;

interface Prompt { query: string; brands_per_llm: Record<string, string[]>; category?: string; }

const getIntentFromPrompt = (prompt: Prompt): string | null => {
  if (prompt.category) {
    const cl = prompt.category.toLowerCase().replace(/\s+/g, "_");
    const match = INTENTS.find(i => i.key === cl || i.label.toLowerCase() === prompt.category!.toLowerCase());
    if (match) return match.key;
  }
  const q = prompt.query.toLowerCase();
  if (q.includes("discover") || q.includes("find") || q.includes("what is") || q.includes("best")) return "discovery";
  if (q.includes("compare") || q.includes("vs") || q.includes("difference") || q.includes("better")) return "comparison";
  if (q.includes("price") || q.includes("cost") || q.includes("cheap")) return "pricing";
  if (q.includes("use") || q.includes("how to") || q.includes("example") || q.includes("case")) return "use_case";
  if (q.includes("trust") || q.includes("safe") || q.includes("reliable")) return "trust";
  return null;
};

const computePresencePerIntent = (prompts: Prompt[], brands: string[], llmModels: string[]) => {
  const result: Record<string, Record<string, { visibleCount: number; totalResponses: number }>> = {};
  INTENTS.forEach(i => { result[i.key] = {}; brands.forEach(b => { result[i.key][b] = { visibleCount: 0, totalResponses: 0 }; }); });
  prompts.forEach(p => {
    const intent = getIntentFromPrompt(p);
    if (!intent) return;
    llmModels.forEach(m => {
      const mentioned = p.brands_per_llm[m] || [];
      brands.forEach(b => { result[intent][b].totalResponses++; if (mentioned.includes(b)) result[intent][b].visibleCount++; });
    });
  });
  return result;
};

export const IntentWiseScoring = () => {
  const { analyticsVersion } = useResults();
  const analyticsAvailable = hasAnalyticsData();
  const keywordsWithPrompts = getSearchKeywordsWithPrompts();
  const brandInfo = getBrandInfoWithLogos();
  const brandName = getBrandName();
  const llmData = getLlmData();

  const intentResults = useMemo(() => {
    if (!analyticsAvailable || !brandName || brandInfo.length === 0) {
      return INTENTS.map(i => ({ intent: i.key, intentLabel: i.label, color: i.color, presencePct: null, statusLabel: "N/A", description: "", dominantCompetitor: "", status: "insufficient_data" as const }));
    }
    const allPrompts: Prompt[] = keywordsWithPrompts.flatMap(kw => kw.prompts.map((p: any) => ({ query: p.query || "", brands_per_llm: p.brands_per_llm || {}, category: p.category })));
    const allBrands = brandInfo.map(b => b.brand);
    const llmModels = Object.keys(llmData);
    const presenceData = computePresencePerIntent(allPrompts, allBrands, llmModels);

    return INTENTS.map(intent => {
      const ipd = presenceData[intent.key];
      const td = ipd[brandName];
      if (!td || td.totalResponses === 0) return { intent: intent.key, intentLabel: intent.label, color: intent.color, presencePct: null, statusLabel: "N/A", description: "", dominantCompetitor: "", status: "insufficient_data" as const };
      const testPct = (td.visibleCount / td.totalResponses) * 100;
      const brandPcts = allBrands.map(b => ({ brand: b, pct: ipd[b].totalResponses > 0 ? (ipd[b].visibleCount / ipd[b].totalResponses) * 100 : 0 })).sort((a, b) => b.pct - a.pct);
      const isLeader = brandPcts[0]?.brand === brandName && brandPcts[1] && (brandPcts[0].pct / (brandPcts[1].pct || 1)) >= 1.25;
      const statusLabel = isLeader ? "Very Strong" : testPct >= 60 ? "Strong" : testPct >= 35 ? "Moderate" : testPct >= 15 ? "Weak" : "Very Low";
      const status = isLeader ? "leading" : testPct >= 60 ? "strong" : testPct >= 35 ? "moderate" : testPct >= 15 ? "weak" : "very_low";
      const topNonBrand = brandPcts.find(b => b.brand !== brandName);
      const dominantCompetitor = topNonBrand ? topNonBrand.brand : "";
      return { intent: intent.key, intentLabel: intent.label, color: intent.color, presencePct: testPct, statusLabel, description: topNonBrand && topNonBrand.pct > testPct ? `Dominated by ${topNonBrand.brand}` : "Your brand leads", dominantCompetitor, status };
    });
  }, [analyticsAvailable, keywordsWithPrompts, brandInfo, brandName, llmData, analyticsVersion]);

  const leadingCount = intentResults.filter(r => r.presencePct !== null && r.presencePct > 0).length;
  const gapIntent = intentResults.find(r => r.presencePct === 0);

  const getStatusBadge = (status: string) => {
    if (status === "leading" || status === "strong") return "ds-badge ds-badge-positive";
    if (status === "moderate") return "ds-badge ds-badge-warning";
    if (status === "weak" || status === "very_low") return "ds-badge ds-badge-danger";
    return "ds-badge";
  };

  const getBarColor = (status: string) => {
    if (status === "leading" || status === "strong") return "#4DA6FF";
    if (status === "moderate") return "#F5BE20";
    return "#F25454";
  };

  return (
    <div className="ds-card">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-ds-warning" />
        <h3 className="text-[14px] font-semibold text-ds-text">Brand Presence by Buyer Intent</h3>
      </div>
      <p className="text-[12px] text-ds-text-muted mb-3">How often you appear across buyer journey stages</p>

      {/* Summary callout */}
      {leadingCount > 0 && (
        <div className="rounded-lg p-3 mb-4" style={{ background: '#EFF3F8', borderLeft: '3px solid #4DA6FF' }}>
          <p className="text-[12px] text-ds-text">
            {brandName} leads in <strong>{leadingCount} of {INTENTS.length}</strong> intent stages
            {gapIntent && <> · Biggest gap: <strong>{gapIntent.intentLabel}</strong> (0%)</>}
          </p>
        </div>
      )}

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="table-header text-left py-2 px-3" style={{ width: '15%' }}>Intent</th>
              <th className="table-header text-left py-2 px-3" style={{ width: '40%' }}>Visibility %</th>
              <th className="table-header text-left py-2 px-3" style={{ width: '20%' }}>Strength</th>
              <th className="table-header text-left py-2 px-3" style={{ width: '25%' }}>Top Competitor</th>
            </tr>
          </thead>
          <tbody>
            {intentResults.map((result) => (
              <tr key={result.intent} className="border-b border-border/50 last:border-b-0">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: result.color }} />
                    <Link to={`/results/prompts?expandAll=true&viewType=category&category=${result.intent}`}
                      className="text-[13px] font-semibold text-ds-text hover:text-ds-blue">{result.intentLabel}</Link>
                  </div>
                </td>
                <td className="py-3 px-3">
                  {result.presencePct !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-[6px] rounded-full" style={{ background: '#EFF3F8' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(result.presencePct, 100)}%`, background: getBarColor(result.status) }} />
                      </div>
                      <span className="text-[13px] font-semibold text-ds-text min-w-[36px] text-right">{Math.round(result.presencePct)}%</span>
                    </div>
                  ) : <span className="text-[13px] text-ds-text-muted">-</span>}
                </td>
                <td className="py-3 px-3">
                  <span className={getStatusBadge(result.status)}>{result.statusLabel}</span>
                </td>
                <td className="py-3 px-3">
                  {result.dominantCompetitor ? (
                    <span className="text-[12px] text-ds-text-muted">{result.dominantCompetitor}</span>
                  ) : <span className="text-[12px] text-ds-text-muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
