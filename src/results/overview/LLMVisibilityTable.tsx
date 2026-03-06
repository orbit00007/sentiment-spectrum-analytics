import { getLlmData, getSearchKeywordsWithPrompts, getModelDisplayName } from "@/results/data/analyticsData";
import { LLMIcon } from "@/results/ui/LLMIcon";
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";

export const LLMVisibilityTable = () => {
  const llmData = getLlmData();
  const keywordsWithPrompts = getSearchKeywordsWithPrompts();
  const totalPrompts = keywordsWithPrompts.reduce((sum, kw) => sum + (kw.prompts?.length || 0), 0);

  const platformData = Object.entries(llmData).map(([platform, data]: [string, any]) => ({
    platform,
    displayName: getModelDisplayName(platform),
    appearances: data.mentions_count || 0,
    sources: data.sources || totalPrompts,
    avgPosition: data.average_rank ? `#${data.average_rank.toFixed(1)}` : "0",
    avgRankNum: data.average_rank || 0,
    mentionRatio: totalPrompts > 0 ? (data.mentions_count || 0) / totalPrompts : 0,
  }));

  const getRankBadge = (rank: number) => {
    if (rank === 0) return "text-ds-text-muted";
    if (rank <= 2) return "text-ds-success font-bold";
    if (rank <= 4) return "text-ds-blue font-bold";
    if (rank <= 6) return "text-ds-warning font-bold";
    return "text-ds-danger font-bold";
  };

  return (
    <div className="ds-card">
      <div className="flex items-center gap-2 mb-1">
        <Bot className="w-4 h-4 text-ds-blue" />
        <h3 className="text-[14px] font-semibold text-ds-text">Model-Wise Visibility</h3>
      </div>
      <p className="text-[12px] text-ds-text-muted mb-3">Your brand's reach across AI platforms · {platformData.length} model{platformData.length !== 1 ? 's' : ''} tested</p>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="table-header text-left py-2 px-3">Platform</th>
              <th className="table-header text-center py-2 px-3">Mentions</th>
              <th className="table-header text-center py-2 px-3">Sources</th>
              <th className="table-header text-center py-2 px-3">Avg Rank</th>
            </tr>
          </thead>
          <tbody>
            {platformData.map((row, idx) => (
              <tr key={row.platform} className={idx < platformData.length - 1 ? "border-b border-border/50" : ""}>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <LLMIcon platform={row.platform} size="md" />
                    <span className="font-medium text-[13px] text-ds-text">{row.displayName}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[15px] font-bold text-ds-text">{row.appearances}</span>
                    <div className="w-12 h-1.5 rounded-full" style={{ background: '#EFF3F8' }}>
                      <div className="h-full rounded-full" style={{ width: `${row.mentionRatio * 100}%`, background: '#4DA6FF' }} />
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <Link to="/results/prompts?expandAll=true&viewType=model" className="text-[13px] text-ds-text hover:text-ds-blue">{row.sources}</Link>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`text-[13px] ${getRankBadge(row.avgRankNum)}`}>{row.avgPosition}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {platformData.length === 0 && (
        <div className="text-center py-6 text-[13px] text-ds-text-muted">No LLM data available</div>
      )}
    </div>
  );
};
