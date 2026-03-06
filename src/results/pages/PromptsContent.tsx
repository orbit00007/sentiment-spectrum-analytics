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
  const [viewType, setViewType] = useState<"category" | "model" | "brand">("brand"); // Default to brand wise
  const [selectedBrand, setSelectedBrand] = useState("");
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
    if (selectedViewTypeParam) setViewType(selectedViewTypeParam as "model" | "category" | "brand");
  }, [searchParams, keywordsWithPrompts.length]);

  const filteredKeywords = keywordsWithPrompts;
  const allPrompts = filteredKeywords.flatMap((keyword) => keyword.prompts.map((prompt) => ({ ...prompt, keywordId: keyword.id, keywordName: keyword.name })));

  // Calculate mention rate
  const totalPrompts = keywordsWithPrompts.reduce((acc, k) => acc + k.prompts.length, 0);
  const brandMentionCount = brandInfo.find(b => b.brand === brandName)?.mention_breakdown
    ? Object.values(brandInfo.find(b => b.brand === brandName)?.mention_breakdown || {}).reduce((sum: number, v: any) => sum + (typeof v === 'number' ? v : 0), 0)
    : 0;
  const mentionRate = totalPrompts > 0 ? Math.round((brandMentionCount / totalPrompts) * 100) : 0;

  const getAllBrands = () => {
    const brandToUse = selectedBrand || brandName;
    const brandMap = new Map<string, Brand>();
    brandInfo.forEach((brand) => {
      const totalMentions = Object.values(brand.mention_breakdown || {}).reduce((sum: number, score: unknown) => sum + (typeof score === 'number' ? score : 0), 0);
      if (totalMentions > 0 || brand.brand === brandToUse) brandMap.set(brand.brand, { ...brand, mention_breakdown: brand.mention_breakdown || {} });
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
    return brandInfo.find((b) => b.brand === brandToUse)?.mention_breakdown?.[keywordId] || DEFAULT_BRAND_MENTION;
  };

  const getTopCompetitorForKeyword = (keywordId: string) => {
    let topBrand = "", topScore = 0, topLogo = "";
    brandInfo.forEach((b) => { const score = b.mention_breakdown?.[keywordId] || 0; if (score > topScore) { topScore = score; topBrand = b.brand; topLogo = b.logo; } });
    return { brand: topBrand, score: topScore, logo: topLogo };
  };

  const toggleKeyword = (keywordId: string) => {
    setExpandedKeywords((prev) => { const n = new Set(prev); if (n.has(keywordId)) n.delete(keywordId); else n.add(keywordId); return n; });
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

  const viewOptions = [
    { key: "brand" as const, label: "Brand wise" },
    { key: "model" as const, label: "Model wise" },
    { key: "category" as const, label: "Intent wise" },
  ];

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-6">
      {/* Header */}
      <div className="ds-card !rounded-2xl !px-6 !py-5">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center border border-[#DBEAFE] flex-shrink-0">
                <Zap className="w-4 h-4 text-ds-blue" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ds-text-muted">Query Intelligence</span>
            </div>
            <h1 className="text-[32px] md:text-[48px] leading-[1.02] font-semibold tracking-[-0.02em] text-ds-text">AI Prompts & Queries</h1>
            <p className="text-[13px] text-ds-text-muted leading-relaxed mt-2 max-w-2xl">Exact questions AI is answering about your brand</p>
          </div>
          <div className="hidden md:flex items-center gap-8 flex-shrink-0 pt-2">
            <div className="text-center">
              <div className="text-[28px] font-bold text-ds-text leading-none">{keywordsWithPrompts.length}</div>
              <div className="text-[11px] text-ds-text-muted uppercase tracking-[0.15em] font-medium mt-1">Keywords</div>
            </div>
            <div className="text-center">
              <div className="text-[28px] font-bold text-ds-text leading-none">{totalPrompts}</div>
              <div className="text-[11px] text-ds-text-muted uppercase tracking-[0.15em] font-medium mt-1">Prompts</div>
            </div>
            <div className="text-center">
              <div className="text-[28px] font-bold text-ds-blue leading-none">{mentionRate}%</div>
              <div className="text-[11px] text-ds-text-muted uppercase tracking-[0.15em] font-medium mt-1">Mention Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Type Toggle - Pill style */}
      <div className="flex gap-3 items-center flex-wrap mt-4">
        <div className="flex items-center gap-1 p-1 rounded-full border border-border bg-card" style={{ boxShadow: 'var(--shadow-card)' }}>
          {viewOptions.map(({ key, label }) => (
            <button key={key} onClick={() => setViewType(key)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-150 ${
                viewType === key
                  ? "text-white shadow-md"
                  : "text-ds-text-muted hover:text-ds-text"
              }`}
              style={viewType === key ? { background: '#4DA6FF', boxShadow: '0 1px 3px rgba(77,166,255,0.4)' } : { background: 'transparent' }}>
              {label}
            </button>
          ))}
        </div>
        <div className="grow flex justify-end gap-2">
          {selectedBrand && (
            <Button onClick={handleClearBrandSelection} variant="outline" size="default" className="whitespace-nowrap">Clear Brand</Button>
          )}
          <Button onClick={handleExpandAll} variant="outline" size="default" className="whitespace-nowrap">Expand All</Button>
          <Button onClick={handleCollapseAll} variant="outline" size="default" className="whitespace-nowrap">Collapse All</Button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {viewType === "category" ? (
          <CategoriesTable prompts={allPrompts} brandsToDisplay={getAllBrands()} selectedBrand={selectedBrand ? selectedBrand : brandName}
            setSelectedBrand={setSelectedBrand} brandName={brandName} getBrandLogo={getBrandLogo} categories={categories} />
        ) : (
          <div className="space-y-4">
            {filteredKeywords.map((keyword) => {
              const isExpanded = expandedKeywords.has(keyword.id);
              const brandScore = getBrandScoreForKeyword(keyword.id);
              const topCompetitor = getTopCompetitorForKeyword(keyword.id);
              const promptCount = keyword.prompts.length;
              const brandsToDisplay = getBrandsForKeyword(keyword.id);

              return (
                <div key={keyword.id} className="ds-card overflow-hidden !p-0">
                  <div className="p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleKeyword(keyword.id)}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'text-ds-blue' : 'text-ds-text-muted -rotate-90'}`} />
                      <div className="min-w-0">
                        <span className="font-semibold text-ds-text text-[15px] block truncate">{keyword.name}</span>
                        <span className="text-[12px] text-ds-text-muted">{promptCount} prompts</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex flex-col items-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white`}
                          style={{ background: brandScore >= 3 ? '#22C55E' : brandScore >= 1 ? '#F5BE20' : '#F25454' }}>
                          {brandScore}
                        </span>
                        <span className="text-[10px] text-ds-text-muted mt-1 uppercase">Your brand</span>
                      </div>
                      {topCompetitor.brand && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border" style={{ background: '#F8FAFC' }}>
                          {topCompetitor.logo && <img src={topCompetitor.logo} alt="" className="w-4 h-4 rounded-full object-contain bg-white" />}
                          <span className="text-[11px] text-ds-text-muted">Top:</span>
                          <span className="text-[11px] font-semibold text-ds-text">{topCompetitor.brand}</span>
                          <span className="text-[11px] font-bold text-ds-blue">{topCompetitor.score}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    viewType === "brand" ? (
                      <BrandWisePromptsTable keywordName={keyword.name} keywordId={keyword.id} prompts={keyword.prompts}
                        brandsToDisplay={brandsToDisplay} selectedBrand={selectedBrand ? selectedBrand : brandName}
                        setSelectedBrand={setSelectedBrand} brandName={brandName} getBrandLogo={getBrandLogo} />
                    ) : (
                      <ModelWisePromptsTable keywordName={keyword.name} keywordId={keyword.id} prompts={keyword.prompts}
                        brandsToDisplay={brandsToDisplay} selectedBrand={selectedBrand ? selectedBrand : brandName}
                        setSelectedBrand={setSelectedBrand} brandName={brandName} getBrandLogo={getBrandLogo} />
                    )
                  )}
                </div>
              );
            })}
            {filteredKeywords.length === 0 && (
              <div className="text-center py-8 text-ds-text-muted ds-card text-sm">No keywords or prompts found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptsContent;
