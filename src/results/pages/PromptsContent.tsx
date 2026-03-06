import {
  getAnalytics, getBrandName, getBrandInfoWithLogos, getSearchKeywordsWithPrompts, getLlmData,
} from "@/results/data/analyticsData";
import { ChevronDown, Zap } from "lucide-react";
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
  const [viewType, setViewType] = useState<"category" | "model" | "brand">("brand");
  const [selectedBrand, setSelectedBrand] = useState("");
  const llmData = getLlmData();
  const categories = ['Discovery', 'Comparison', 'Pricing', 'Use Case', 'Trust'];

  useEffect(() => {
    const expandAllParam = searchParams.get("expandAll");
    const selectedBrandParam = searchParams.get("selectBrand");
    const selectedViewTypeParam = searchParams.get("viewType");
    if (expandAllParam === "true" && keywordsWithPrompts.length > 0) setExpandedKeywords(new Set(keywordsWithPrompts.map((k) => k.id)));
    if (selectedBrandParam) setSelectedBrand(selectedBrandParam);
    if (selectedViewTypeParam) setViewType(selectedViewTypeParam as any);
  }, [searchParams, keywordsWithPrompts.length]);

  const filteredKeywords = keywordsWithPrompts;
  const allPrompts = filteredKeywords.flatMap((keyword) => keyword.prompts.map((prompt) => ({ ...prompt, keywordId: keyword.id, keywordName: keyword.name })));

  const totalPrompts = keywordsWithPrompts.reduce((acc, k) => acc + k.prompts.length, 0);
  const brandMentionCount = brandInfo.find(b => b.brand === brandName)?.mention_breakdown
    ? Object.values(brandInfo.find(b => b.brand === brandName)?.mention_breakdown || {}).reduce((sum: number, v: any) => sum + (typeof v === 'number' ? v : 0), 0)
    : 0;
  const mentionRate = totalPrompts > 0 ? Math.round((brandMentionCount / totalPrompts) * 100) : 0;
  const mentionRateColor = mentionRate === 0 ? '#F25454' : mentionRate < 50 ? '#F5BE20' : '#22C55E';

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
      <div className="ds-card">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <h1 className="text-[32px] font-bold" style={{ color: '#1E2433' }}>AI Prompts & Queries</h1>
            <p className="text-[13px] leading-relaxed mt-2 max-w-2xl" style={{ color: '#737E8F' }}>Exact questions AI is answering about your brand</p>
          </div>
          <div className="hidden md:flex items-center gap-8 flex-shrink-0 pt-2">
            <div className="text-center">
              <div className="text-[28px] font-bold leading-none" style={{ color: '#1E2433', fontVariantNumeric: 'tabular-nums' }}>{keywordsWithPrompts.length}</div>
              <div className="text-[11px] uppercase tracking-[0.15em] font-medium mt-1" style={{ color: '#737E8F' }}>Keywords</div>
            </div>
            <div className="text-center">
              <div className="text-[28px] font-bold leading-none" style={{ color: '#1E2433', fontVariantNumeric: 'tabular-nums' }}>{totalPrompts}</div>
              <div className="text-[11px] uppercase tracking-[0.15em] font-medium mt-1" style={{ color: '#737E8F' }}>Prompts</div>
            </div>
            <div className="text-center">
              <div className="text-[28px] font-bold leading-none" style={{ color: mentionRateColor, fontVariantNumeric: 'tabular-nums' }}>{mentionRate}%</div>
              <div className="text-[11px] uppercase tracking-[0.15em] font-medium mt-1" style={{ color: '#737E8F' }}>Mention Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Type Toggle */}
      <div className="flex gap-3 items-center flex-wrap mt-4">
        <div className="flex items-center gap-0.5 p-1 rounded-full" style={{ background: '#EFF3F8' }}>
          {viewOptions.map(({ key, label }) => (
            <button key={key} onClick={() => setViewType(key)}
              className="px-[18px] py-1.5 rounded-full text-[13px] font-semibold transition-all duration-150"
              style={viewType === key
                ? { background: '#4DA6FF', color: '#FFFFFF', boxShadow: '0 1px 3px rgba(77,166,255,0.3)' }
                : { background: 'transparent', color: '#737E8F' }}>
              {label}
            </button>
          ))}
        </div>
        <div className="grow flex justify-end gap-2">
          {selectedBrand && <Button onClick={handleClearBrandSelection} variant="outline" size="default" className="whitespace-nowrap">Clear Brand</Button>}
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
                <div key={keyword.id} className="ds-card overflow-hidden" style={{ padding: 0 }}>
                  <div className="p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                    onClick={() => toggleKeyword(keyword.id)}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                        style={{ color: isExpanded ? '#4DA6FF' : '#737E8F' }} />
                      <div className="min-w-0">
                        <span className="font-bold text-[15px] block truncate" style={{ color: '#1E2433' }}>{keyword.name}</span>
                        <span className="text-[12px]" style={{ color: '#737E8F' }}>{promptCount} prompts</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex flex-col items-center">
                        <div className="text-[10px] uppercase mb-1" style={{ color: '#737E8F' }}>Your brand</div>
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold text-white"
                          style={{ background: brandScore > 0 ? '#22C55E' : '#F25454' }}>
                          {brandScore}
                        </span>
                      </div>
                      {topCompetitor.brand && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #E3EAF2' }}>
                          {topCompetitor.logo && <img src={topCompetitor.logo} alt="" className="w-4 h-4 rounded-full object-contain bg-white" />}
                          <span className="text-[11px]" style={{ color: '#737E8F' }}>Top:</span>
                          <span className="text-[11px] font-bold" style={{ color: '#1E2433' }}>{topCompetitor.brand}</span>
                          <span className="text-[11px] font-bold" style={{ color: '#4DA6FF' }}>{topCompetitor.score}</span>
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
              <div className="text-center py-8 ds-card text-sm" style={{ color: '#737E8F' }}>No keywords or prompts found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptsContent;
