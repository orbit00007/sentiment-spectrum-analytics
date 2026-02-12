import { MessageSquare, Check, X } from "lucide-react";
import { getLlmData, getModelDisplayName } from "@/results/data/analyticsData";
import { LLMIcon } from "@/results/ui/LLMIcon";

const DEFAULT_BRAND_MENTION = 0;

interface Brand {
  brand: string;
  logo?: string;
  mention_breakdown?: Record<string, number>;
}

interface Prompt {
  query: string;
  brands_per_llm: Record<string, string[]>;
}

interface ModelWisePromptsTableProps {
  keywordName: string;
  keywordId: string;
  prompts: Prompt[];
  brandsToDisplay: Brand[];
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  brandName: string;
  getBrandLogo: (name: string) => string | undefined;
}

const ModelWisePromptsTable = ({
  keywordName,
  keywordId,
  prompts,
  brandsToDisplay,
  selectedBrand,
  setSelectedBrand,
  brandName,
  getBrandLogo,
}: ModelWisePromptsTableProps) => {
  const llmData = getLlmData();
  const modelNames = Object.keys(llmData);

  // Helper function to check if selected brand is in prompt's brands for a specific LLM
  const isBrandVisibleInLLM = (prompt: Prompt, modelName: string): boolean => {
    if (!selectedBrand) return false;
    const brandsForLLM = prompt.brands_per_llm[modelName] || [];
    return brandsForLLM.includes(selectedBrand);
  };

  return (
    <div className="border-t border-border/50 bg-muted/20">
      <div className="p-4 md:p-5 space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          AI Prompts Used
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Prompt
                </th>
                {modelNames.map((modelName) => (
                  <th
                    key={modelName}
                    className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <LLMIcon platform={modelName} size="sm" />
                      <span>{getModelDisplayName(modelName)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prompts.map((prompt, idx) => (
                <tr
                  key={idx}
                  className={
                    idx < prompts.length - 1
                      ? "border-b border-border/50"
                      : ""
                  }
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">
                        {prompt.query}
                      </p>
                    </div>
                  </td>
                  {modelNames.map((modelName) => {
                    const isVisible = isBrandVisibleInLLM(prompt, modelName);
                    console.log(isVisible);
                    return (
                      <td key={modelName} className="py-3 px-4 text-center">
                        {selectedBrand ? (
                          <div className="flex items-center justify-center">
                            {isVisible ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Competitor Breakdown */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Brand Mentions for &quot;{keywordName}&quot;
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {brandsToDisplay.map((brand) => {
              const score =
                brand.mention_breakdown?.[keywordId] ||
                DEFAULT_BRAND_MENTION;
              const brandToUse = selectedBrand || brandName;
              const isBrand = brand.brand === brandToUse;
              const shouldFade = false; // selectedBrand && brand.brand !== selectedBrand;
              return (
                <div
                  key={brand.brand}
                  className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                    isBrand
                      ? "bg-primary/10 border-primary/30"
                      : "bg-muted/50 border-border"
                  } ${shouldFade ? "opacity-30" : "opacity-100"}`}
                >
                  {brand.logo && (
                    <img
                      src={brand.logo}
                      alt=""
                      className="w-8 h-8 rounded-full object-contain bg-white mb-1"
                    />
                  )}
                  <span
                    className={`text-[10px] font-medium text-center truncate w-full ${
                      isBrand ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {brand.brand}
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      score >= 3
                        ? "text-green-500"
                        : score >= 1
                        ? "text-amber-500"
                        : "text-red-500"
                    }`}
                  >
                    {score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelWisePromptsTable;
