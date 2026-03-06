import {
  getBrandName, getBrandInfoWithLogos, getAnalytics,
} from "@/results/data/analyticsData";
import { ChevronDown, Globe, FileText, Layers, Search, Lightbulb, Link2, FolderOpen } from "lucide-react";
import { useState, useMemo } from "react";

const DEFAULT_BRAND_DATA = { count: 0, score: 0, insight: "No insights were found" };

const SourcesAllContent = () => {
  const brandName = getBrandName();
  const analytics = getAnalytics();
  const sourcesAndContentImpact = analytics?.sources_and_content_impact || {};
  const brandInfo = getBrandInfoWithLogos();

  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllSources, setShowAllSources] = useState(false);

  const sourcesData = useMemo(() => {
    if (!sourcesAndContentImpact || typeof sourcesAndContentImpact !== "object") return [];
    return Object.entries(sourcesAndContentImpact).map(([sourceName, sourceData]: [string, any]) => {
      const mentions = sourceData.mentions || {};
      const pagesUsed = sourceData.pages_used || [];
      let totalMentions = 0;
      Object.values(mentions).forEach((m: any) => { totalMentions += m.count || 0; });
      return {
        name: sourceName, pagesUsed, mentions, totalMentions,
        brandMentions: mentions[brandName]?.count || 0,
        brandScore: Math.round((mentions[brandName]?.score || 0) * 100),
        brandInsight: mentions[brandName]?.insight || "",
      };
    });
  }, [sourcesAndContentImpact, brandName]);

  const allSourcesData = useMemo(() => {
    return sourcesData.map((category) => ({ categoryName: category.name, urls: category.pagesUsed })).filter((cat) => cat.urls.length > 0);
  }, [sourcesData]);

  const filteredSources = sourcesData.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredAllSources = allSourcesData.filter((cat) => cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) || cat.urls.some((url) => url.toLowerCase().includes(searchQuery.toLowerCase())));

  const totalSources = sourcesData.length;
  const totalMentionsAll = sourcesData.reduce((acc, s) => acc + s.brandMentions, 0);
  const totalUniqueSources = sourcesData.reduce((acc, s) => acc + s.pagesUsed.length, 0);
  const avgSourcesPerCategory = totalSources > 0 ? Math.round(totalUniqueSources / totalSources) : 0;

  const getBrandLogo = (name: string) => brandInfo.find((b) => b.brand === name)?.logo;

  const getTopCompetitorForSource = (mentions: Record<string, any>) => {
    let topBrand = "", topScore = 0, topLogo = "";
    Object.entries(mentions).forEach(([brand, data]: [string, any]) => {
      if (data.count > topScore) { topScore = data.count; topBrand = brand; topLogo = getBrandLogo(brand) || ""; }
    });
    return { brand: topBrand, count: topScore, logo: topLogo };
  };

  const extractDomain = (url: string) => {
    try { return new URL(url.startsWith("http") ? url : `https://${url}`).hostname; } catch { return ""; }
  };

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-6">
      {/* Header */}
      <div className="ds-card">
        <h1 className="text-[32px] font-bold" style={{ color: '#1E2433' }}>Sources</h1>
        <p className="text-[13px] leading-relaxed mt-2 max-w-2xl" style={{ color: '#737E8F' }}>Where AI finds & cites your brand across the web</p>
      </div>

      {/* Stats Bar */}
      <div className="ds-card mt-4" style={{ padding: '20px' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {[
            { value: totalSources, label: "Source Categories", color: '#4DA6FF' },
            { value: totalMentionsAll, label: "Brand Mentions", color: totalMentionsAll === 0 ? '#F25454' : '#4DA6FF' },
            { value: totalUniqueSources, label: "Unique Sources", color: '#4DA6FF' },
            { value: avgSourcesPerCategory, label: "Sources per Category", color: '#4DA6FF' },
          ].map(({ value, label, color }, i) => (
            <div key={label} className="flex items-center gap-4">
              {i > 0 && <div className="w-px h-10 hidden md:block" style={{ background: '#E3EAF2' }} />}
              <div className="text-center">
                <div className="text-[28px] font-bold leading-none" style={{ color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
                <div className="text-[12px] mt-1" style={{ color: '#737E8F' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mt-4">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#737E8F' }} />
        <input type="text" placeholder="Search source categories or URLs..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-lg text-sm placeholder:text-[#737E8F] focus:outline-none transition-all"
          style={{ background: '#FFFFFF', border: '1px solid #E3EAF2', color: '#1E2433', boxShadow: 'var(--shadow-card)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#4DA6FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(77,166,255,0.15)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#E3EAF2'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
        />
      </div>

      {/* All Sources Dropdown */}
      <div className="ds-card overflow-hidden mt-4" style={{ padding: 0 }}>
        <div className="p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
          onClick={() => setShowAllSources(!showAllSources)}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${showAllSources ? '' : '-rotate-90'}`}
              style={{ color: showAllSources ? '#4DA6FF' : '#737E8F' }} />
            <FolderOpen className="w-5 h-5 flex-shrink-0" style={{ color: '#4DA6FF' }} />
            <div className="min-w-0">
              <span className="font-semibold text-sm block" style={{ color: '#1E2433' }}>All Sources</span>
              <span className="text-[12px]" style={{ color: '#737E8F' }}>{totalUniqueSources} total sources across all categories</span>
            </div>
          </div>
          <span className="ds-badge ds-badge-info">{totalUniqueSources}</span>
        </div>
        {showAllSources && (
          <div style={{ borderTop: '1px solid #E3EAF2', background: '#F8FAFC' }}>
            <div className="p-5 space-y-6">
              {filteredAllSources.map((category, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: '#1E2433' }}>
                    <Layers className="w-4 h-4" style={{ color: '#4DA6FF' }} />{category.categoryName}
                  </h4>
                  <div className="space-y-2 pl-6">
                    {category.urls.map((url, urlIdx) => {
                      const domain = extractDomain(url);
                      return (
                        <div key={urlIdx} className="flex items-center gap-2">
                          <span className="text-[11px] flex-shrink-0" style={{ color: '#737E8F' }}>{urlIdx + 1}.</span>
                          {domain && <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`} alt="" className="w-4 h-4 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                          <a href={url.startsWith("http") ? url : `https://${url}`} target="_blank" rel="noopener noreferrer"
                            className="text-sm hover:underline truncate max-w-[500px]" style={{ color: '#4DA6FF' }} title={url}>{url}</a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {filteredAllSources.length === 0 && (
                <div className="text-center py-6 text-sm" style={{ color: '#737E8F' }}>No sources found matching "{searchQuery}"</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4" style={{ borderTop: '1px solid #E3EAF2' }} />

      {/* Source Categories */}
      <div className="space-y-4 mt-4">
        {filteredSources.map((source) => {
          const isExpanded = expandedSource === source.name;
          const topCompetitor = getTopCompetitorForSource(source.mentions);
          const brandData = source.mentions[brandName] || DEFAULT_BRAND_DATA;

          return (
            <div key={source.name} className="ds-card overflow-hidden" style={{ padding: 0 }}>
              <div className="p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                onClick={() => setExpandedSource(isExpanded ? null : source.name)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                    style={{ color: isExpanded ? '#4DA6FF' : '#737E8F' }} />
                  <div className="min-w-0">
                    <span className="font-semibold text-[14px] block truncate" style={{ color: '#1E2433' }}>{source.name}</span>
                    <span className="text-[12px]" style={{ color: '#737E8F' }}>{source.pagesUsed.length} sources referenced</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white"
                      style={{ background: brandData.count > 0 ? '#22C55E' : '#F25454' }}>
                      {brandData.count}
                    </span>
                    <span className="text-[10px] mt-1" style={{ color: '#737E8F' }}>Your brand</span>
                  </div>
                  {topCompetitor.brand && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #E3EAF2' }}>
                      <span className="text-[11px]" style={{ color: '#737E8F' }}>Top:</span>
                      {topCompetitor.logo && <img src={topCompetitor.logo} alt="" className="w-4 h-4 rounded-full object-contain bg-white" />}
                      <span className="text-[11px] font-medium" style={{ color: '#1E2433' }}>{topCompetitor.brand}</span>
                      <span className="text-[11px] font-bold" style={{ color: '#4DA6FF' }}>{topCompetitor.count}</span>
                    </div>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: '1px solid #E3EAF2', background: '#F8FAFC' }}>
                  <div className="p-5 space-y-4">
                    {source.brandInsight && (
                      <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E3EAF2' }}>
                        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#F5BE20' }} />
                        <div>
                          <span className="text-[12px] font-semibold" style={{ color: '#1E2433' }}>Insight for {brandName}:</span>
                          <p className="text-[13px] mt-1" style={{ color: '#737E8F' }}>{source.brandInsight}</p>
                        </div>
                      </div>
                    )}

                    {source.pagesUsed.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: '#1E2433' }}>
                          <Link2 className="w-4 h-4" style={{ color: '#4DA6FF' }} />Sources Referenced ({source.pagesUsed.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {source.pagesUsed.map((p: string, i: number) => {
                            const domain = extractDomain(p);
                            return (
                              <a key={i} href={p.startsWith("http") ? p : `https://${p}`} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] hover:opacity-80 transition-opacity"
                                style={{ background: '#EFF3F8', color: '#4DA6FF' }} title={p}>
                                {domain && <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`} alt="" className="w-3.5 h-3.5" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                                <span className="max-w-[250px] truncate">{p.length > 55 ? p.substring(0, 55) + '…' : p}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pt-4" style={{ borderTop: '1px solid #E3EAF2' }}>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: '#1E2433' }}>
                        <FileText className="w-4 h-4" style={{ color: '#4DA6FF' }} />Brand Mentions in "{source.name}"
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(source.mentions)
                          .sort(([, a]: any, [, b]: any) => (b.count || 0) - (a.count || 0))
                          .map(([brand, data]: [string, any]) => {
                            const isPrimary = brand === brandName;
                            const maxCount = Math.max(...Object.values(source.mentions).map((m: any) => m.count || 0), 1);
                            return (
                              <div key={brand} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                                style={isPrimary ? { background: '#EFF6FF', borderLeft: '3px solid #4DA6FF' } : {}}>
                                <div className="flex items-center gap-2 w-32 flex-shrink-0">
                                  {getBrandLogo(brand) && <img src={getBrandLogo(brand)} alt="" className="w-4 h-4 rounded-full bg-white" />}
                                  <span className="text-[12px] font-medium" style={{ color: isPrimary ? '#4DA6FF' : '#1E2433' }}>{brand}</span>
                                </div>
                                <div className="flex-1 h-[6px] rounded-full" style={{ background: '#EFF3F8' }}>
                                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((data.count || 0) / maxCount) * 100}%`, background: isPrimary ? '#4DA6FF' : '#CBD5E1' }} />
                                </div>
                                <span className="text-[12px] font-bold w-6 text-right" style={{ color: (data.count || 0) === 0 ? '#CBD5E1' : '#1E2433' }}>{data.count || 0}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredSources.length === 0 && (
          <div className="text-center py-8 ds-card text-sm" style={{ color: '#737E8F' }}>No sources found matching "{searchQuery}"</div>
        )}
      </div>
    </div>
  );
};

export default SourcesAllContent;
