import { useResults } from "@/results/context/ResultsContext";
import { DeltaPill } from "@/results/ui/DeltaPill";
import { getKeywordSetId } from "@/results/data/analyticsData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: "text-emerald-600",
  Neutral: "text-amber-600",
  Negative: "text-red-600",
};

const DISPLAY_LIMIT = 10;

export const ProgressAcrossRuns = () => {
  const { trendRuns } = useResults();

  if (trendRuns.length === 0) return null;

  const visibleRuns = trendRuns.slice(0, DISPLAY_LIMIT);

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-foreground">Progress Across Runs</h3>
          <p className="text-xs text-muted-foreground mt-0.5">How your key metrics have changed over time</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0 mt-1">{trendRuns.length} total run{trendRuns.length !== 1 ? "s" : ""}</span>
      </div>

      {/* All Runs table */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground">Last 10 Runs</h4>
          <span className="text-[10px] text-muted-foreground">
            Showing last 10 runs · ▲▼ change vs the previous run, shown only when the same keyword set has been run before
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Date</th>
                <th className="text-left py-2 pr-3 font-medium">Keywords</th>
                <th className="text-right py-2 pr-3 font-medium">AI Visibility</th>
                <th className="text-right py-2 pr-3 font-medium">Brand %</th>
                <th className="text-right py-2 font-medium">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {visibleRuns.map((run, i) => {
                const isFirst = i === 0;
                const kwSetId = getKeywordSetId(run.keywords);

                // Compare against the row BELOW (older run) — trendRuns is latest-first
                const nextInTable = i < trendRuns.length - 1 ? trendRuns[i + 1] : null;
                const nextInTableKwId = nextInTable ? getKeywordSetId(nextInTable.keywords) : null;

                // Delta shows on this row when the older run below has the same keyword set
                const sameKwAsNextRow = nextInTable !== null && nextInTableKwId === kwSetId;

                // "keyword set updated" badge shows on the row that introduced new keywords
                // i.e. this row's keywords differ from the older run below
                const kwSetChanged = nextInTable !== null && nextInTableKwId !== kwSetId;

                return (
                  <tr
                    key={run.analytics_id}
                    className={cn(
                      "border-b border-border/50",
                      isFirst && "bg-primary/5"
                    )}
                  >
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isFirst && (
                          <Badge className="text-[9px] px-1.5 py-0 bg-primary text-primary-foreground h-4">
                            Latest
                          </Badge>
                        )}
                        <span className={cn(isFirst && "font-medium text-foreground")}>
                          {formatDate(run.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-1">
                        {kwSetChanged && (
                          <span className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            ⚑ keyword set updated
                          </span>
                        )}
                        {run.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={cn(isFirst && "font-medium text-foreground")}>
                          {run.geo_score}
                        </span>
                        {sameKwAsNextRow && nextInTable && (
                          <DeltaPill
                            current={run.geo_score}
                            previous={nextInTable.geo_score}
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={cn(isFirst && "font-medium text-foreground")}>
                          {run.mention_score}%
                        </span>
                        {sameKwAsNextRow && nextInTable && (
                          <DeltaPill
                            current={run.mention_score}
                            previous={nextInTable.mention_score}
                            unit="%"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={cn(SENTIMENT_COLORS[run.outlook] ?? "text-foreground", isFirst && "font-medium")}>
                          {run.outlook}
                        </span>
                        {sameKwAsNextRow && nextInTable && (
                          <DeltaPill
                            type="sentiment"
                            current={run.outlook}
                            previous={nextInTable.outlook}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
