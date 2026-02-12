import { MessageSquare, Check, X } from "lucide-react";
import { getLlmData, getModelDisplayName } from "@/results/data/analyticsData";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface BrandWisePromptsTableProps {
  keywordName: string;
  keywordId: string;
  prompts: Prompt[];
  brandsToDisplay: Brand[];
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  brandName: string;
  getBrandLogo: (name: string) => string | undefined;
}

const BrandWisePromptsTable = ({
  keywordName,
  keywordId,
  prompts,
  brandsToDisplay,
  selectedBrand,
  setSelectedBrand,
  brandName,
  getBrandLogo,
}: BrandWisePromptsTableProps) => {
  const llmData = getLlmData();
  const modelNames = Object.keys(llmData);

  // Helper function to check if brand is found in prompt across any LLM
  // Returns array of LLM names where the brand was found
  const getLLMsWhereBrandFound = (prompt: Prompt, brandName: string): string[] => {
    const foundInLLMs: string[] = [];
    
    modelNames.forEach((modelName) => {
      const brandsForLLM = prompt.brands_per_llm[modelName] || [];
      if (brandsForLLM.includes(brandName)) {
        foundInLLMs.push(getModelDisplayName(modelName));
      }
    });

    return foundInLLMs;
  };

  // Helper function to check if brand is found in any LLM
  const isBrandFound = (prompt: Prompt, brandName: string): boolean => {
    return getLLMsWhereBrandFound(prompt, brandName).length > 0;
  };

  return (
    <TooltipProvider>
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
                  {brandsToDisplay.map((brand) => (
                    <th
                      key={brand.brand}
                      className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {brand.logo && (
                          <img
                            src={brand.logo}
                            alt=""
                            className="w-5 h-5 rounded-full object-contain bg-white"
                          />
                        )}
                        <span className="truncate max-w-[100px]">{brand.brand}</span>
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
                    {brandsToDisplay.map((brand) => {
                      const isFound = isBrandFound(prompt, brand.brand);
                      const foundInLLMs = getLLMsWhereBrandFound(prompt, brand.brand);

                      return (
                        <td key={brand.brand} className="py-3 px-4 text-center">
                          {isFound ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-center cursor-help">
                                  <Check className="w-5 h-5 text-green-500" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-semibold mb-1">Found in:</p>
                                  <p className="text-xs">
                                    {foundInLLMs.join(", ")}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <div className="flex items-center justify-center cursor-help">
                              <X className="w-5 h-5 text-red-500" />
                            </div>
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
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all cursor-pointer ${
                      isBrand
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/50 border-border"
                    } ${shouldFade ? "opacity-30" : "opacity-100"}`}
                    onClick={() => setSelectedBrand(brand.brand)}
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
    </TooltipProvider>
  );
};

export default BrandWisePromptsTable;
