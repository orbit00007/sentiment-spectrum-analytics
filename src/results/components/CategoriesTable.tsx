import { MessageSquare, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { getLlmData, getModelDisplayName, isResultAbsent } from "@/results/data/analyticsData";
import { LLMIcon } from "@/results/ui/LLMIcon";

interface Brand {
  brand: string;
  logo?: string;
  mention_breakdown?: Record<string, number>;
}

interface LLMPromptResult {
  tier: string;
  brands: string[];
}

interface Prompt {
  query: string;
  result: Record<string, LLMPromptResult>;
  category?: string;
  keywordId?: string;
  keywordName?: string;
}

interface CategoriesTableProps {
  prompts: Prompt[];
  brandsToDisplay: Brand[];
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  brandName: string;
  getBrandLogo: (name: string) => string | undefined;
  categories: string[];
  expandedCategories: Set<string>;
  setExpandedCategories: (categories: Set<string>) => void;
}

const CategoriesTable = ({
  prompts,
  brandsToDisplay,
  selectedBrand,
  setSelectedBrand,
  brandName,
  getBrandLogo,
  categories,
  expandedCategories,
  setExpandedCategories,
}: CategoriesTableProps) => {
  const llmData = getLlmData();
  const modelNames = Object.keys(llmData);

  const isBrandVisibleInLLM = (prompt: Prompt, modelName: string): boolean => {
    if (!selectedBrand) return false;
    const brandsForLLM = prompt.result[modelName]?.brands;
    return Array.isArray(brandsForLLM) && brandsForLLM.includes(selectedBrand);
  };

  const getBrandTickCount = (categoryPrompts: Prompt[]): number => {
    const brandToUse = selectedBrand || brandName;
    let count = 0;
    categoryPrompts.forEach((prompt) => {
      const isVisible = Object.values(prompt.result || {}).some((llmResult) =>
        Array.isArray(llmResult.brands) && llmResult.brands.includes(brandToUse)
      );
      if (isVisible) count++;
    });
    return count;
  };

  const getTopBrandForCategory = (
    categoryPrompts: Prompt[]
  ): { brand: string; count: number; logo: string | undefined } | null => {
    const brandCount: Record<string, number> = {};

    categoryPrompts.forEach((prompt) => {
      Object.values(prompt.result || {}).forEach((llmResult) => {
        if (Array.isArray(llmResult.brands)) {
          llmResult.brands.forEach((brand) => {
            brandCount[brand] = (brandCount[brand] || 0) + 1;
          });
        }
      });
    });

    let topBrand: string | null = null;
    let topCount = 0;

    Object.entries(brandCount).forEach(([brand, count]) => {
      if (count > topCount) {
        topCount = count;
        topBrand = brand;
      }
    });

    if (!topBrand) return null;
    return { brand: topBrand, count: topCount, logo: getBrandLogo(topBrand) };
  };

  // All brands from brandsToDisplay are always included.
  // Counts come from this category's prompts only.
  // Sorted highest → lowest, test/selected brand always last.
  const getBrandMentionsForCategory = (
    categoryPrompts: Prompt[]
  ): { brand: string; logo: string | undefined; count: number }[] => {
    const brandToUse = selectedBrand || brandName;

    // Count appearances in this category's prompts
    const brandCount: Record<string, number> = {};
    categoryPrompts.forEach((prompt) => {
      Object.values(prompt.result || {}).forEach((llmResult) => {
        if (Array.isArray(llmResult.brands)) {
          llmResult.brands.forEach((brand) => {
            brandCount[brand] = (brandCount[brand] || 0) + 1;
          });
        }
      });
    });

    // Start from brandsToDisplay so every known brand is always included
    const allBrands = brandsToDisplay.map((b) => ({
      brand: b.brand,
      logo: b.logo || getBrandLogo(b.brand),
      count: brandCount[b.brand] ?? 0,
    }));

    // Also add any brands found in prompts that aren't in brandsToDisplay
    Object.keys(brandCount).forEach((brand) => {
      if (!allBrands.find((b) => b.brand === brand)) {
        allBrands.push({ brand, logo: getBrandLogo(brand), count: brandCount[brand] });
      }
    });

    // Separate test brand from the rest
    const testBrandEntry = allBrands.find((b) => b.brand === brandToUse);
    const others = allBrands
      .filter((b) => b.brand !== brandToUse)
      .sort((a, b) => b.count - a.count); // sort others highest first

    // Test brand always at the end
    return testBrandEntry ? [...others, testBrandEntry] : others;
  };

  const groupPromptsByCategory = () => {
    const grouped: Record<string, Prompt[]> = {};
    categories.forEach((cat) => { grouped[cat] = []; });
    grouped["Other"] = [];

    prompts.forEach((prompt) => {
      if (prompt.category) {
        const trimmed = prompt.category.trim();
        const matched = categories.find(
          (cat) => cat.toLowerCase() === trimmed.toLowerCase()
        );
        if (matched) {
          grouped[matched].push(prompt);
          return;
        }
      }

      const q = prompt.query.toLowerCase();

      if (
        q.includes("affordable") || q.includes("free trial") ||
        q.includes("pricing") || q.includes("price") ||
        q.includes("cost-effective") || q.includes("cheap") ||
        q.includes("budget") || q.includes("expensive")
      ) {
        grouped["Pricing"].push(prompt);
      } else if (
        q.includes(" vs ") || q.includes(" vs.") ||
        q.includes("compare") || q.includes("alternative") ||
        q.includes("alternatives") || q.includes("difference between") ||
        q.includes("switch from") || q.includes("better than")
      ) {
        grouped["Comparison"].push(prompt);
      } else if (
        q.includes("most reliable") || q.includes("most trusted") ||
        q.includes("reliable") || q.includes("trusted") ||
        q.includes("trust") || q.includes("review") ||
        q.includes("rating") || q.includes("secure") || q.includes("safe")
      ) {
        grouped["Trust"].push(prompt);
      } else if (
        q.includes("how to") || q.includes("how do i") ||
        q.includes("use case") || q.includes("for startups") ||
        q.includes("for startup") || q.includes("for enterprises") ||
        q.includes("for enterprise") || q.includes("for small business") ||
        q.includes("for mobile") || q.includes("for teams")
      ) {
        grouped["Use Case"].push(prompt);
      } else if (
        q.includes("best") || q.includes("top-rated") ||
        q.includes("top rated") || q.startsWith("top ") ||
        q.includes(" top ") || q.includes("discover") ||
        q.includes("find") || q.includes("what is") ||
        q.includes("leading") || q.includes("popular") ||
        q.includes("recommended")
      ) {
        grouped["Discovery"].push(prompt);
      } else {
        grouped["Other"].push(prompt);
      }
    });

    return grouped;
  };

  const promptsByCategory = groupPromptsByCategory();

  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const renderCategoryHeader = (categoryLabel: string, categoryPrompts: Prompt[]) => {
    const isExpanded = expandedCategories.has(categoryLabel);
    const brandScore = getBrandTickCount(categoryPrompts);
    const topCompetitor = getTopBrandForCategory(categoryPrompts);

    return (
      <div
        className="p-4 md:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => toggleCategory(categoryLabel)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-sm md:text-base block truncate">
              {categoryLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              {categoryPrompts.length} prompts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex flex-col items-center">
            <span
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                brandScore >= 3
                  ? "bg-green-500/20 text-green-500"
                  : brandScore >= 1
                  ? "bg-amber-500/20 text-amber-500"
                  : "bg-red-500/20 text-red-500"
              }`}
            >
              {brandScore}
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">
              Your brand's mention
            </span>
          </div>

          {topCompetitor && (
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
              {topCompetitor.logo && (
                <img
                  src={topCompetitor.logo}
                  alt=""
                  className="w-5 h-5 rounded-full object-contain bg-white"
                />
              )}
              <span className="text-xs text-muted-foreground">Top:</span>
              <span className="text-xs font-medium">{topCompetitor.brand}</span>
              <span className="text-xs font-bold text-primary">{topCompetitor.count}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPromptsTable = (categoryLabel: string, categoryPrompts: Prompt[]) => {
    const intentBrandMentions = getBrandMentionsForCategory(categoryPrompts);
    const brandToUse = selectedBrand || brandName;

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
                {categoryPrompts.map((prompt, idx) => (
                  <tr
                    key={idx}
                    className={idx < categoryPrompts.length - 1 ? "border-b border-border/50" : ""}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-foreground leading-relaxed">
                            {prompt.query}
                          </p>
                          {prompt.keywordName && (
                            <span className="text-xs text-muted-foreground">
                              Keyword: {prompt.keywordName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {modelNames.map((modelName) => {
                      const absent = isResultAbsent(prompt.result[modelName]?.brands);
                      const isVisible = !absent && isBrandVisibleInLLM(prompt, modelName);
                      return (
                        <td key={modelName} className="py-3 px-4 text-center">
                          {absent ? (
                            <span className="text-sm text-muted-foreground">-</span>
                          ) : selectedBrand ? (
                            <div className="flex items-center justify-center">
                              {isVisible ? (
                                <Check className="w-5 h-5 text-green-500" />
                              ) : (
                                <X className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Per-intent brand mentions — all brands included, sorted, test brand last */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Brand Mentions for {categoryLabel}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {intentBrandMentions.map(({ brand, logo, count }) => {
                const isBrand = brand === brandToUse;
                return (
                  <div
                    key={brand}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                      isBrand
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    {logo && (
                      <img
                        src={logo}
                        alt=""
                        className="w-8 h-8 rounded-full object-contain bg-white mb-1"
                      />
                    )}
                    <span
                      className={`text-[10px] font-medium text-center truncate w-full ${
                        isBrand ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {brand}
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        count >= 3
                          ? "text-green-500"
                          : count >= 1
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {count}
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

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {categories.map((category) => {
          const categoryPrompts = promptsByCategory[category] || [];
          const isExpanded = expandedCategories.has(category);

          if (categoryPrompts.length === 0) return null;

          return (
            <div
              key={category}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              {renderCategoryHeader(category, categoryPrompts)}
              {isExpanded && renderPromptsTable(category, categoryPrompts)}
            </div>
          );
        })}

        {promptsByCategory["Other"] && promptsByCategory["Other"].length > 0 && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {renderCategoryHeader("Other", promptsByCategory["Other"])}
            {expandedCategories.has("Other") && renderPromptsTable("Other", promptsByCategory["Other"])}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesTable;