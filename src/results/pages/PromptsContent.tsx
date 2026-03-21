import {
  getAnalytics,
  getBrandName,
  getBrandInfoWithLogos,
  getSearchKeywordsWithPrompts,
  getLlmData,
} from "@/results/data/analyticsData";
import {
  ChevronDown,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ModelWisePromptsTable from "@/results/components/ModelWisePromptsTable";
import BrandWisePromptsTable from "@/results/components/BrandWisePromptsTable";
import CategoriesTable from "@/results/components/CategoriesTable";

const DEFAULT_BRAND_MENTION = 0;

interface Brand {
  brand: string;
  logo?: string;
  mention_breakdown?: Record<string, number>;
}

const PromptsContent = () => {
  const brandName = getBrandName();
  const brandInfo = getBrandInfoWithLogos();
  const keywordsWithPrompts = getSearchKeywordsWithPrompts();
  const [searchParams] = useSearchParams();
  const [expandedKeywords, setExpandedKeywords] = useState<Set<string>>(new Set());
  const [initialExpandDone, setInitialExpandDone] = useState(false);
  const [viewType, setViewType] = useState<"category" | "model" | "brand">("model");
  const [selectedBrand, setSelectedBrand] = useState("");
  const llmData = getLlmData();
  const categories = ['Discovery', 'Comparison', 'Pricing', 'Use Case', 'Trust'];

  // Lifted up from CategoriesTable — needed so expand/collapse button can control it
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories));

  // Expand all keywords by default on first load
  useEffect(() => {
    if (!initialExpandDone && keywordsWithPrompts.length > 0) {
      const allKeywordIds = new Set(keywordsWithPrompts.map((k) => k.id));
      setExpandedKeywords(allKeywordIds);
      setInitialExpandDone(true);
    }
  }, [keywordsWithPrompts.length, initialExpandDone]);

  // Check for query parameters on component load
  useEffect(() => {
    const expandAllParam = searchParams.get("expandAll");
    const selectedBrandParam = searchParams.get("selectBrand");
    const selectedViewTypeParam = searchParams.get("viewType");

    if (expandAllParam === "true" && keywordsWithPrompts.length > 0) {
      const allKeywordIds = new Set(keywordsWithPrompts.map((k) => k.id));
      setExpandedKeywords(allKeywordIds);
    }

    if (selectedBrandParam) {
      setSelectedBrand(selectedBrandParam);
    }

    if (selectedViewTypeParam) {
      setViewType(selectedViewTypeParam as "model" | "category" | "brand");
    }
  }, [searchParams, keywordsWithPrompts.length]);

  const filteredKeywords = keywordsWithPrompts;

  const allPrompts = filteredKeywords.flatMap((keyword) =>
    keyword.prompts.map((prompt) => ({
      ...prompt,
      keywordId: keyword.id,
      keywordName: keyword.name,
    }))
  );

  const getAllBrands = () => {
    const brandToUse = selectedBrand || brandName;
    const brandMap = new Map<string, Brand>();

    brandInfo.forEach((brand) => {
      const totalMentions = Object.values(brand.mention_breakdown || {}).reduce(
        (sum: number, score: unknown) => sum + (typeof score === 'number' ? score : 0),
        0
      );
      brandMap.set(brand.brand, { ...brand, mention_breakdown: brand.mention_breakdown || {} });
    });

    const brandsArray = Array.from(brandMap.values());
    const ourBrandIndex = brandsArray.findIndex((b) => b.brand === brandToUse);
    let ourBrand = null;

    if (ourBrandIndex !== -1) {
      ourBrand = brandsArray.splice(ourBrandIndex, 1)[0];
    } else {
      ourBrand = brandInfo.find((b) => b.brand === brandToUse);
    }

    brandsArray.sort((a, b) => {
      const aTotal = Object.values(a.mention_breakdown || {}).reduce(
        (sum: number, score: unknown) => sum + (typeof score === 'number' ? score : 0), 0
      );
      const bTotal = Object.values(b.mention_breakdown || {}).reduce(
        (sum: number, score: unknown) => sum + (typeof score === 'number' ? score : 0), 0
      );
      return bTotal - aTotal;
    });

    if (ourBrand) brandsArray.push(ourBrand);
    return brandsArray;
  };

  const getBrandLogo = (name: string) => {
    const brand = brandInfo.find((b) => b.brand === name);
    return brand?.logo;
  };

  const getBrandScoreForKeyword = (keywordId: string) => {
    const brandToUse = selectedBrand || brandName;
    const brand = brandInfo.find((b) => b.brand === brandToUse);
    return brand?.mention_breakdown?.[keywordId] || DEFAULT_BRAND_MENTION;
  };

  const getTopCompetitorForKeyword = (keywordId: string) => {
    let topBrand = "";
    let topScore = 0;
    let topLogo = "";

    brandInfo.forEach((b) => {
      const score = b.mention_breakdown?.[keywordId] || 0;
      if (score > topScore) {
        topScore = score;
        topBrand = b.brand;
        topLogo = b.logo;
      }
    });

    return { brand: topBrand, score: topScore, logo: topLogo };
  };

  const totalPrompts = keywordsWithPrompts.reduce((acc, k) => acc + k.prompts.length, 0);

  const toggleKeyword = (keywordId: string) => {
    setExpandedKeywords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keywordId)) {
        newSet.delete(keywordId);
      } else {
        newSet.add(keywordId);
      }
      return newSet;
    });
  };

  // Determine allExpanded based on current viewType
  const allExpanded = viewType === "category"
    ? categories.length > 0 && categories.every((c) => expandedCategories.has(c))
    : keywordsWithPrompts.length > 0 && keywordsWithPrompts.every((k) => expandedKeywords.has(k.id));

  const handleToggleAll = () => {
    if (viewType === "category") {
      if (allExpanded) {
        setExpandedCategories(new Set());
      } else {
        setExpandedCategories(new Set(categories));
      }
    } else {
      if (allExpanded) {
        setExpandedKeywords(new Set());
      } else {
        setExpandedKeywords(new Set(keywordsWithPrompts.map((k) => k.id)));
      }
    }
  };

  const handleClearBrandSelection = () => {
    setSelectedBrand("");
  };

  const getBrandsForKeyword = (keywordId: string) => {
    const brandToUse = selectedBrand || brandName;
    const brandsWithMentions = [...brandInfo];

    const ourBrandIndex = brandsWithMentions.findIndex((b) => b.brand === brandToUse);
    let ourBrand = null;

    if (ourBrandIndex !== -1) {
      ourBrand = brandsWithMentions.splice(ourBrandIndex, 1)[0];
    } else {
      ourBrand = brandInfo.find((b) => b.brand === brandToUse);
    }

    brandsWithMentions.sort(
      (a, b) => (b.mention_breakdown?.[keywordId] || 0) - (a.mention_breakdown?.[keywordId] || 0)
    );

    if (ourBrand) brandsWithMentions.push(ourBrand);
    return brandsWithMentions;
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 p-4 md:p-6">
        <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-primary/10 rounded-lg md:rounded-xl">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                AI Prompts & Query Analysis
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Exact questions AI is answering about your brand & industry
              </p>
            </div>
          </div>
          <div className="flex gap-10 justify-center">
            <div className="text-center sm:text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {keywordsWithPrompts.length}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground">keywords</div>
            </div>
            <div className="text-center sm:text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {totalPrompts}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground">prompts analyzed</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Type Selection with single Expand/Collapse toggle */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex items-center gap-4 bg-card border border-border rounded-lg md:rounded-xl px-4 py-2.5 md:py-3">
          Select View:
          <RadioGroup
            value={viewType}
            onValueChange={(value) => setViewType(value as "category" | "model" | "brand")}
            className="flex gap-4 md:gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="model" id="model" />
              <Label htmlFor="model" className="text-sm md:text-base cursor-pointer">
                Model wise
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="category" id="category" />
              <Label htmlFor="category" className="text-sm md:text-base cursor-pointer">
                Intent wise
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="brand" id="brand" />
              <Label htmlFor="brand" className="text-sm md:text-base cursor-pointer">
                Brand wise
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="grow flex justify-end gap-2">
          {selectedBrand && (
            <Button
              onClick={handleClearBrandSelection}
              variant="outline"
              size="default"
              className="whitespace-nowrap"
            >
              Clear Brand Selection
            </Button>
          )}
          <Button
            onClick={handleToggleAll}
            variant="outline"
            size="default"
            className="whitespace-nowrap"
          >
            {allExpanded ? "Collapse All" : "Expand All"}
          </Button>
        </div>
      </div>

      {/* Conditional rendering based on viewType */}
      {viewType === "category" ? (
        <CategoriesTable
          prompts={allPrompts}
          brandsToDisplay={getAllBrands()}
          selectedBrand={selectedBrand ? selectedBrand : brandName}
          setSelectedBrand={setSelectedBrand}
          brandName={brandName}
          getBrandLogo={getBrandLogo}
          categories={categories}
          expandedCategories={expandedCategories}
          setExpandedCategories={setExpandedCategories}
        />
      ) : (
        <div className="space-y-4">
          {filteredKeywords.map((keyword) => {
            const isExpanded = expandedKeywords.has(keyword.id);
            const brandScore = getBrandScoreForKeyword(keyword.id);
            const topCompetitor = getTopCompetitorForKeyword(keyword.id);
            const promptCount = keyword.prompts.length;
            const brandsToDisplay = getBrandsForKeyword(keyword.id);

            return (
              <div
                key={keyword.id}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {/* Keyword Header */}
                <div
                  className="p-4 md:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleKeyword(keyword.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground text-sm md:text-base block truncate">
                        {keyword.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {promptCount} prompts
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Brand Score Badge */}
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
                        {selectedBrand ? `${selectedBrand}'s mention` : "Your brand's mention"}
                      </span>
                    </div>

                    {/* Top Competitor */}
                    {topCompetitor.brand && (
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
                        <span className="text-xs font-bold text-primary">{topCompetitor.score}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Prompts List */}
                {isExpanded && (
                  viewType === "brand" ? (
                    <BrandWisePromptsTable
                      keywordName={keyword.name}
                      keywordId={keyword.id}
                      prompts={keyword.prompts}
                      brandsToDisplay={brandsToDisplay}
                      selectedBrand={selectedBrand ? selectedBrand : brandName}
                      setSelectedBrand={setSelectedBrand}
                      brandName={brandName}
                      getBrandLogo={getBrandLogo}
                    />
                  ) : (
                    <ModelWisePromptsTable
                      keywordName={keyword.name}
                      keywordId={keyword.id}
                      prompts={keyword.prompts}
                      brandsToDisplay={brandsToDisplay}
                      selectedBrand={selectedBrand ? selectedBrand : brandName}
                      setSelectedBrand={setSelectedBrand}
                      brandName={brandName}
                      getBrandLogo={getBrandLogo}
                    />
                  )
                )}
              </div>
            );
          })}

          {filteredKeywords.length === 0 && (
            <div className="text-center py-8 md:py-12 text-muted-foreground bg-card rounded-xl border border-border text-sm md:text-base">
              No keywords or prompts found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptsContent;