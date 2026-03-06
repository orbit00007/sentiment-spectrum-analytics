import {
  getBrandName,
  getBrandInfoWithLogos,
  getAnalytics,
} from "@/results/data/analyticsData";
import {
  ChevronDown,
  ChevronRight,
  Globe,
  FileText,
  Layers,
  Search,
  Lightbulb,
  Link2,
  FolderOpen,
} from "lucide-react";
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

  const getBrandLogo = (name: string) => {
    const brand = brandInfo.find((b) => b.brand === name);
    return brand?.logo;
  };

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
      <div className="ds-card !rounded-2xl !px-6 !py-5">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center border border-[#DBEAFE] flex-shrink-0">
                <Layers className="w-4 h-4 text-ds-blue" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ds-text-muted">Content Intelligence</span>
            </div>
            <h1 className="text-[32px] md:text-[48px] leading-[1.02] font-semibold tracking-[-0.02em] text-ds-text">Sources</h1>
            <p className="text-[13px] text-ds-text-muted leading-relaxed mt-2 max-w-2xl">Where AI finds & cites your brand across the web</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="ds-card mt-4 !p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {[
            { value: totalSources, label: "Source Categories" },
            { value: totalMentionsAll, label: "Brand Mentions" },
            { value: totalUniqueSources, label: "Unique Sources" },
            { value: avgSourcesPerCategory, label: "Sources per Category" },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-4">
              {i > 0 && <div className="w-px h-10 bg-border hidden md:block" />}
              <div className="text-center">
                <div className="text-[28px] font-bold text-ds-blue leading-none">{value}</div>
                <div className="text-[12px] text-ds-text-muted mt-1">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mt-4">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ds-text-muted" />
        <input type="text" placeholder="Search source categories or URLs..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm text-ds-text placeholder:text-ds-text-muted focus:outline-none focus:ring-2 focus:ring-ds-blue/30 focus:border-ds-blue transition-all"
          style={{ boxShadow: 'var(--shadow-card)' }}
        />
      </div>

      {/* All Sources Dropdown */}
      <div className="ds-card overflow-hidden mt-4 !p-0">
        <div className="p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setShowAllSources(!showAllSources)}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${showAllSources ? 'text-ds-blue' : 'text-ds-text-muted -rotate-90'}`} />
            <FolderOpen className="w-5 h-5 text-ds-blue flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold text-ds-text text-sm block">All Sources</span>
              <span className="text-[12px] text-ds-text-muted">{totalUniqueSources} total sources across all categories</span>
            </div>
          </div>
          <span className="ds-badge ds-badge-info">{totalUniqueSources}</span>
        </div>
        {showAllSources && (
          <div className="border-t border-border" style={{ background: '#F8FAFC' }}>
            <div className="p-5 space-y-6">
              {filteredAllSources.map((category, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-semibold text-ds-text mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-ds-blue" />
                    {category.categoryName}
                  </h4>
                  <div className="space-y-2 pl-6">
                    {category.urls.map((url, urlIdx) => {
                      const domain = extractDomain(url);
                      return (
                        <div key={urlIdx} className="flex items-center gap-2">
                          <span className="text-[11px] text-ds-text-muted flex-shrink-0">{urlIdx + 1}.</span>
                          {domain && <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`} alt="" className="w-4 h-4 flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                          <a href={url.startsWith("http") ? url : `https://${url}`} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-ds-blue hover:underline truncate max-w-[500px]" title={url}>
                            {url}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {filteredAllSources.length === 0 && (
                <div className="text-center py-6 text-ds-text-muted text-sm">No sources found matching &quot;{searchQuery}&quot;</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border mt-4" />

      {/* Source Categories */}
      <div className="space-y-4 mt-4">
        {filteredSources.map((source) => {
          const isExpanded = expandedSource === source.name;
          const topCompetitor = getTopCompetitorForSource(source.mentions);
          const brandData = source.mentions[brandName] || DEFAULT_BRAND_DATA;

          return (
            <div key={source.name} className="ds-card overflow-hidden !p-0">
              <div className="p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedSource(isExpanded ? null : source.name)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'text-ds-blue' : 'text-ds-text-muted -rotate-90'}`} />
                  <div className="min-w-0">
                    <span className="font-semibold text-ds-text text-[14px] block truncate">{source.name}</span>
                    <span className="text-[12px] text-ds-text-muted">{source.pagesUsed.length} sources referenced</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                      brandData.count >= 3 ? "text-white" : brandData.count >= 1 ? "text-white" : "text-white"
                    }`} style={{ background: brandData.count >= 3 ? '#22C55E' : brandData.count >= 1 ? '#F5BE20' : '#F25454' }}>
                      {brandData.count}
                    </span>
                    <span className="text-[10px] text-ds-text-muted mt-1">Your brand</span>
                  </div>
                  {topCompetitor.brand && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border" style={{ background: '#F8FAFC' }}>
                      <span className="text-[11px] text-ds-text-muted">Top:</span>
                      {topCompetitor.logo && <img src={topCompetitor.logo} alt="" className="w-4 h-4 rounded-full object-contain bg-white" />}
                      <span className="text-[11px] font-medium text-ds-text">{topCompetitor.brand}</span>
                      <span className="text-[11px] font-bold text-ds-blue">{topCompetitor.count}</span>
                    </div>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border" style={{ background: '#F8FAFC' }}>
                  <div className="p-5 space-y-4">
                    {source.brandInsight && (
                      <div className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
                        <Lightbulb className="w-4 h-4 text-ds-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[12px] font-semibold text-ds-text">Insight for {brandName}:</span>
                          <p className="text-[13px] text-ds-text-muted mt-1">{source.brandInsight}</p>
                        </div>
                      </div>
                    )}

                    {source.pagesUsed.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-sm font-semibold text-ds-text flex items-center gap-2 mb-3">
                          <Link2 className="w-4 h-4 text-ds-blue" />
                          Sources Referenced ({source.pagesUsed.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {source.pagesUsed.map((p: string, i: number) => {
                            const domain = extractDomain(p);
                            return (
                              <a key={i} href={p.startsWith("http") ? p : `https://${p}`} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card text-ds-blue rounded-full text-[11px] hover:bg-muted transition-colors border border-border" title={p}>
                                {domain && <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`} alt="" className="w-3 h-3" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                                <span className="max-w-[250px] truncate">{p}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Brand Mentions Table */}
                    <div className="pt-4 border-t border-border">
                      <h4 className="text-sm font-semibold text-ds-text flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-ds-blue" />
                        Brand Mentions in &quot;{source.name}&quot;
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(source.mentions)
                          .sort(([, a]: any, [, b]: any) => (b.count || 0) - (a.count || 0))
                          .map(([brand, data]: [string, any]) => {
                            const isPrimary = brand === brandName;
                            const maxCount = Math.max(...Object.values(source.mentions).map((m: any) => m.count || 0), 1);
                            return (
                              <div key={brand} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isPrimary ? '' : ''}`}
                                style={isPrimary ? { background: '#EFF6FF', borderLeft: '3px solid #4DA6FF' } : {}}>
                                <div className="flex items-center gap-2 w-32 flex-shrink-0">
                                  {getBrandLogo(brand) && <img src={getBrandLogo(brand)} alt="" className="w-4 h-4 rounded-full bg-white" />}
                                  <span className={`text-[12px] font-medium ${isPrimary ? 'text-ds-blue' : 'text-ds-text'}`}>{brand}</span>
                                </div>
                                <div className="flex-1 h-[6px] rounded-full" style={{ background: '#EFF3F8' }}>
                                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((data.count || 0) / maxCount) * 100}%`, background: isPrimary ? '#4DA6FF' : '#CBD5E1' }} />
                                </div>
                                <span className="text-[12px] font-bold text-ds-text w-6 text-right">{data.count || 0}</span>
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
          <div className="text-center py-8 text-ds-text-muted ds-card text-sm">No sources found matching &quot;{searchQuery}&quot;</div>
        )}
      </div>
    </div>
  );
};

export default SourcesAllContent;
