import {
  getLlmData,
  getSearchKeywordsWithPrompts,
  getModelDisplayName,
  isResultAbsent,
} from "@/results/data/analyticsData";
import { LLMIcon } from "@/results/ui/LLMIcon";
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";

export const LLMVisibilityTable = () => {
  // 🔹 Get data
  const llmData = getLlmData();
  const keywordsWithPrompts = getSearchKeywordsWithPrompts();

  // 🔹 Prepare platform-wise rows
  const platformData = Object.entries(llmData).map(
    ([platform, data]: [string, any]) => ({
      platform,
      displayName: getModelDisplayName(platform),
      appearances: data.mentions_count || 0,

      // ✅ per-platform prompt count, excluding RESULT_ABSENT entries
      prompts: keywordsWithPrompts.reduce(
        (sum, keyword) =>
          sum +
          (keyword.prompts || []).filter(
            (prompt: any) => !isResultAbsent(prompt.result?.[platform]?.brands)
          ).length,
        0
      ),

      avgPosition: data.average_rank
        ? `#${data.average_rank.toFixed(1)}`
        : "0",
      sources: data.sources || 0,
    })
  );

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-1">
        <Bot className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Model-Wise Visibility
        </h3>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Your brand's ranking & reach across AI platforms
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Platform
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Mentions
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Prompts Executed
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Avg Rank
              </th>
            </tr>
          </thead>

          <tbody>
            {platformData.map((row, idx) => (
              <tr
                key={row.platform}
                className={
                  idx < platformData.length - 1
                    ? "border-b border-border/50"
                    : ""
                }
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <LLMIcon platform={row.platform} size="md" />
                    <span className="font-medium text-foreground">
                      {row.displayName}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-4 text-center">
                  <span className="text-lg font-semibold text-foreground">
                    {row.appearances}
                  </span>
                </td>

                <td className="py-3 px-4 text-center">
                  <Link
                    to={`/results/prompts?expandAll=true&viewType=model`}
                    className="text-primary text-sm font-medium hover:underline"
                    title="View Prompts"
                  >
                    <span className="text-foreground">
                      {row.prompts}
                    </span>
                  </Link>
                </td>

                <td className="py-3 px-4 text-center">
                  <span
                    className={`font-semibold ${
                      row.avgPosition !== "0" &&
                      parseFloat(row.avgPosition.slice(1)) <= 2
                        ? "text-green-500"
                        : row.avgPosition !== "0" &&
                          parseFloat(row.avgPosition.slice(1)) <= 3
                        ? "text-amber-500"
                        : row.avgPosition !== "0"
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {row.avgPosition}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {platformData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No LLM data available
        </div>
      )}
    </div>
  );
};
