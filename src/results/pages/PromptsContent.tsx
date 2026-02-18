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
  Search,
  Hash,
  BarChart3,
  TrendingDown,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
  const [viewType, setViewType] = useState<"category" | "model" | "brand">("model");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [promptSearch, setPromptSearch] = useState("");
  const llmData = getLlmData();
  const categories = ['Discovery', 'Comparison', 'Pricing', 'Use Case', 'Trust'];

  useEffect(() => {
    const expandAllParam = searchParams.get("expandAll");
    const selectedBrandParam = searchParams.get("selectBrand");
    const selectedViewTypeParam = searchParams.get("viewType");
    if (expandAllParam === "true" && keywordsWithPrompts.length > 0) {
      setExpandedKeywords(new Set(keywordsWithPrompts.map((k) => k.id)));
    }
    if (selectedBrandParam) setSelectedBrand(selectedBrandParam);
    if (selectedViewTypeParam) setViewType(selectedViewTypeParam as any);
  }, [searchParams, keywordsWithPrompts.length]);

  const filteredKeywords = keywordsWithPrompts;
  const totalPrompts = keywordsWithPrompts.reduce((acc, k) => acc + k.prompts.length, 0);

  // Compute KPI metrics
  const avgRank = useMemo(() => {
    const llmEntries = Object.values(llmData);
    if (llmEntries.length === 0) return 0;
    const totalRank = llmEntries.reduce((sum: number, d: any) => sum + (d.average_rank || 0), 0);
    return (totalRank / llmEntries.length).toFixed(1);
  }, [llmData]);

  const totalMentions = useMemo(() => {
    return Object.values(llmData).reduce((sum: number, d: any) => sum + (d.mentions_count || 0), 0);
  }, [llmData]);

  const brandSharePct = useMemo(() => {
    const myBrand = brandInfo.find(b => b.brand === brandName);
    if (!myBrand) return 0;
    const totalMentionScores = brandInfo.reduce((sum, b) => sum + b.mention_score, 0);
    if (totalMentionScores === 0) return 0;
    return ((myBrand.mention_score / totalMentionScores) * 100).toFixed(1);
  }, [brandInfo, brandName]);

  const allPrompts = filteredKeywords.flatMap((keyword) =>
    keyword.prompts.map((prompt) => ({ ...prompt, keywordId: keyword.id, keywordName: keyword.name }))
  );

  const getAllBrands = () => {
    const brandToUse = selectedBrand || brandName;
    const brandMap = new Map<string, Brand>();
    brandInfo.forEach((brand) => {
      const totalMentions = Object.values(brand.mention_breakdown || {}).reduce(
        (sum: number, score: unknown) => sum + (typeof score === 'number' ? score : 0), 0
      );
      if (totalMentions > 0 || brand.brand === brandToUse) {
        brandMap.set(brand.brand, { ...brand, mention_breakdown: brand.mention_breakdown || {} });
      }
    });
    const brandsArray = Array.from(brandMap.values());
    const ourBrandIndex = brandsArray.findIndex((b) => b.brand === brandToUse);
    let ourBrand = null;
    if (ourBrandIndex !== -1) ourBrand = brandsArray.splice(ourBrandIndex, 1)[0];
    else ourBrand = brandInfo.find((b) => b.brand === brandToUse);
    brandsArray.sort((a, b) => {
      const aTotal = Object.values(a.mention_breakdown || {}).reduce((sum: number, score: unknown) => sum + (typeof score === 'number' ? score : 0), 0);
      const bTotal = Object.values(b.mention_breakdown || {}).reduce((sum: number, score: unknown) => sum + (typeof score === 'number' ? score : 0), 0);
      return bTotal - aTotal;
    });
    if (ourBrand) brandsArray.push(ourBrand);
    return brandsArray;
  };

  const getBrandLogo = (name: string) => brandInfo.find((b) => b.brand === name)?.logo;
  const getBrandScoreForKeyword = (keywordId: string) => {
    const brandToUse = selectedBrand || brandName;
    const brand = brandInfo.find((b) => b.brand === brandToUse);
    return brand?.mention_breakdown?.[keywordId] || DEFAULT_BRAND_MENTION;
  };
  const getTopCompetitorForKeyword = (keywordId: string) => {
    let topBrand = "", topScore = 0, topLogo = "";
    brandInfo.forEach((b) => {
      const score = b.mention_breakdown?.[keywordId] || 0;
      if (score > topScore) { topScore = score; topBrand = b.brand; topLogo = b.logo; }
    });
    return { brand: topBrand, score: topScore, logo: topLogo };
  };
  const toggleKeyword = (keywordId: string) => {
    setExpandedKeywords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keywordId)) newSet.delete(keywordId); else newSet.add(keywordId);
      return newSet;
    });
  };
  const handleExpandAll = () => setExpandedKeywords(new Set(keywordsWithPrompts.map((k) => k.id)));
  const handleCollapseAll = () => setExpandedKeywords(new Set());
  const handleClearBrandSelection = () => setSelectedBrand("");
  const getBrandsForKeyword = (keywordId: string) => {
    const brandToUse = selectedBrand || brandName;
    const brandsWithMentions = brandInfo.filter((b) => (b.mention_breakdown?.[keywordId] || 0) > 0);
    const ourBrandIndex = brandsWithMentions.findIndex((b) => b.brand === brandToUse);
    let ourBrand = null;
    if (ourBrandIndex !== -1) ourBrand = brandsWithMentions.splice(ourBrandIndex, 1)[0];
    else ourBrand = brandInfo.find((b) => b.brand === brandToUse);
    brandsWithMentions.sort((a, b) => (b.mention_breakdown?.[keywordId] || 0) - (a.mention_breakdown?.[keywordId] || 0));
    if (ourBrand) brandsWithMentions.push(ourBrand);
    return brandsWithMentions;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-primary font-semibold uppercase tracking-wider">〉 ANALYTICS MODULE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Prompts Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed breakdown of brand performance across {totalPrompts.toLocaleString()} strategic search prompts.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">AVG. AI RANK</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">#{avgRank}</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">BRAND SHARE</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{brandSharePct}%</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">MENTIONS</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{totalMentions.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">PROMPTS ANALYZED</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{totalPrompts}</span>
          </div>
        </div>
      </div>

      {/* View Type + Controls */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-2.5">
          <span className="text-sm text-muted-foreground">View:</span>
          <RadioGroup
            value={viewType}
            onValueChange={(value) => setViewType(value as any)}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="model" id="model" />
              <Label htmlFor="model" className="text-sm cursor-pointer">Model wise</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="category" id="category" />
              <Label htmlFor="category" className="text-sm cursor-pointer">Intent wise</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="brand" id="brand" />
              <Label htmlFor="brand" className="text-sm cursor-pointer">Brand wise</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="grow flex justify-end gap-2">
          {selectedBrand && (
            <Button onClick={handleClearBrandSelection} variant="outline" size="default" className="whitespace-nowrap">
              Clear Brand Selection
            </Button>
          )}
          <Button onClick={handleExpandAll} variant="outline" size="default" className="whitespace-nowrap">Expand All</Button>
          <Button onClick={handleCollapseAll} variant="outline" size="default" className="whitespace-nowrap">Collapse All</Button>
        </div>
      </div>

      {/* Content */}
      {viewType === "category" ? (
        <CategoriesTable
          prompts={allPrompts}
          brandsToDisplay={getAllBrands()}
          selectedBrand={selectedBrand ? selectedBrand : brandName}
          setSelectedBrand={setSelectedBrand}
          brandName={brandName}
          getBrandLogo={getBrandLogo}
          categories={categories}
        />
      ) : (
        <div className="space-y-3">
          {filteredKeywords.map((keyword) => {
            const isExpanded = expandedKeywords.has(keyword.id);
            const brandScore = getBrandScoreForKeyword(keyword.id);
            const topCompetitor = getTopCompetitorForKeyword(keyword.id);
            const promptCount = keyword.prompts.length;
            const brandsToDisplay = getBrandsForKeyword(keyword.id);

            return (
              <div key={keyword.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleKeyword(keyword.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground text-sm block truncate">{keyword.name}</span>
                      <span className="text-xs text-muted-foreground">{promptCount} prompts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-col items-center">
                      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
                        brandScore >= 3 ? "bg-green-500/20 text-green-500"
                        : brandScore >= 1 ? "bg-amber-500/20 text-amber-500"
                        : "bg-red-500/20 text-red-500"
                      }`}>{brandScore}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {selectedBrand ? `${selectedBrand}'s` : "Your"} mentions
                      </span>
                    </div>
                    {topCompetitor.brand && (
                      <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                        {topCompetitor.logo && <img src={topCompetitor.logo} alt="" className="w-4 h-4 rounded-full object-contain bg-white" />}
                        <span className="text-xs text-muted-foreground">Top:</span>
                        <span className="text-xs font-medium">{topCompetitor.brand}</span>
                        <span className="text-xs font-bold text-primary">{topCompetitor.score}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  viewType === "brand" ? (
                    <BrandWisePromptsTable
                      keywordName={keyword.name} keywordId={keyword.id} prompts={keyword.prompts}
                      brandsToDisplay={brandsToDisplay} selectedBrand={selectedBrand ? selectedBrand : brandName}
                      setSelectedBrand={setSelectedBrand} brandName={brandName} getBrandLogo={getBrandLogo}
                    />
                  ) : (
                    <ModelWisePromptsTable
                      keywordName={keyword.name} keywordId={keyword.id} prompts={keyword.prompts}
                      brandsToDisplay={brandsToDisplay} selectedBrand={selectedBrand ? selectedBrand : brandName}
                      setSelectedBrand={setSelectedBrand} brandName={brandName} getBrandLogo={getBrandLogo}
                    />
                  )
                )}
              </div>
            );
          })}

          {filteredKeywords.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
              No keywords or prompts found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptsContent;
