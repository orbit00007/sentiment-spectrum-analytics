import { llmData, getSearchKeywords } from "@/results/data/analyticsData";
import { LLMIcon } from "@/results/ui/LLMIcon";
import { Bot } from "lucide-react";

export const LLMVisibilityTable = () => {
  const keywords = getSearchKeywords();
  
  const platformData = Object.entries(llmData).map(([platform, data]: [string, any]) => ({
    platform: platform,
    displayName: platform === 'openai' ? 'ChatGPT' : platform.charAt(0).toUpperCase() + platform.slice(1),
    appearances: data.brand_mentions_count || 0,
    keywords: data.queries_with_brand || 0,
    avgPosition: `#${data.average_brand_rank?.toFixed(1) || 'N/A'}`
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <Bot className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">AI Search Visibility</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Appearances by Platform</p>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Appearances</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Keywords</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Position</th>
            </tr>
          </thead>
          <tbody>
            {platformData.map((row, idx) => (
              <tr key={row.platform} className={idx < platformData.length - 1 ? "border-b border-border/50" : ""}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <LLMIcon platform={row.platform} size="md" />
                    <span className="font-medium text-foreground">{row.displayName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-lg font-semibold text-foreground">{row.appearances}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-foreground">{row.keywords}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`font-semibold ${
                    parseFloat(row.avgPosition.slice(1)) <= 2 ? 'text-green-500' :
                    parseFloat(row.avgPosition.slice(1)) <= 3 ? 'text-amber-500' :
                    'text-red-500'
                  }`}>{row.avgPosition}</span>
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
