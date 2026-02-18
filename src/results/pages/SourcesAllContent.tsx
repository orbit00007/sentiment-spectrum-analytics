import {
  getBrandName,
  getBrandInfoWithLogos,
  getAnalytics,
  getLlmData,
  getSearchKeywordsWithPrompts,
  getModelDisplayName,
  getPlatformPresence,
} from "@/results/data/analyticsData";
import {
  ChevronDown,
  ChevronRight,
  Globe,
  Layers,
  Search,
  Lightbulb,
  Link2,
  FolderOpen,
  Bot,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  Share2,
  Download,
} from "lucide-react";
import { useState, useMemo } from "react";
import { LLMIcon } from "@/results/ui/LLMIcon";

const DEFAULT_BRAND_DATA = { count: 0, score: 0, insight: "No insights were found" };

const cleanUrl = (url: string): string => {
  if (!url || typeof url !== "string") return "";
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\.([a-z]+)\1(?=\/)/gi, ".$1");
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = "https://" + cleaned;
  }
  return cleaned;
};

const extractDomain = (url: string): string => {
  try {
    const cleaned = cleanUrl(url);
    if (!cleaned) return "";
    return new URL(cleaned).origin;
  } catch { return ""; }
};

const FAVICON_URL_TEMPLATE = import.meta.env.VITE_FAVICON_URL_TEMPLATE || 'https://www.google.com/s2/favicons?domain={domain}&sz=128';

const faviconFromUrl = (url: string): string => {
  if (!url) return "";
  const domain = extractDomain(url);
  if (!domain) return "";
  return FAVICON_URL_TEMPLATE.replace("{domain}", domain);
};

const autoLabel = (key: string): string =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const SourcesAllContent = () => {
  const brandName = getBrandName();
  const analytics = getAnalytics();
  const sourcesAndContentImpact = analytics?.sources_and_content_impact || {};
  const brandInfo = getBrandInfoWithLogos();
  const llmData = getLlmData();
  const keywordsWithPrompts = getSearchKeywordsWithPrompts();
  const platformPresence = getPlatformPresence();

  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // LLM platform data
  const totalPrompts = keywordsWithPrompts.reduce((sum, keyword) => sum + (keyword.prompts?.length || 0), 0);
  const platformData = Object.entries(llmData).map(([platform, data]: [string, any]) => ({
    platform,
    displayName: getModelDisplayName(platform),
    appearances: data.mentions_count || 0,
    prompts: totalPrompts,
    avgPosition: data.average_rank ? `#${data.average_rank.toFixed(1)}` : "N/A",
  }));

  // Platform presence
  const platforms = Object.entries(platformPresence).map(([key, url]) => {
    const cleanedUrl = cleanUrl(url as string);
    return {
      key, label: autoLabel(key),
      icon: faviconFromUrl(cleanedUrl),
      status: cleanedUrl ? "present" : "missing",
    };
  });
  const presentCount = platforms.filter((p) => p.status === "present").length;

  // Sources data
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

  const filteredSources = sourcesData.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalSources = sourcesData.length;
  const totalMentionsAll = sourcesData.reduce((acc, s) => acc + s.brandMentions, 0);

  const getBrandLogo = (name: string) => brandInfo.find((b) => b.brand === name)?.logo;

  const getTopCompetitorForSource = (mentions: Record<string, any>) => {
    let topBrand = "", topScore = 0, topLogo = "";
    Object.entries(mentions).forEach(([brand, data]: [string, any]) => {
      if (data.count > topScore) { topScore = data.count; topBrand = brand; topLogo = getBrandLogo(brand) || ""; }
    });
    return { brand: topBrand, count: topScore, logo: topLogo };
  };

  return (
    <div className="p-4 md:p-6 space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Sources Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tracking brand authority and mention distribution across the modern web ecosystem.
          </p>
        </div>
      </div>

      {/* Top Section: Model-Wise Visibility + Platform Presence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model-Wise Visibility Table */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Model-Wise Visibility</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            How your brand ranks and reaches audiences across leading AI LLM platforms.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Platform</th>
                  <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Mentions</th>
                  <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Prompts</th>
                  <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Avg Rank</th>
                </tr>
              </thead>
              <tbody>
                {platformData.map((row, idx) => (
                  <tr key={row.platform} className={idx < platformData.length - 1 ? "border-b border-border/50" : ""}>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <LLMIcon platform={row.platform} size="md" />
                        <span className="font-medium text-foreground text-sm">{row.displayName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-semibold text-foreground">{row.appearances}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-sm text-foreground">{row.prompts}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`font-semibold ${
                        row.avgPosition !== "N/A" && parseFloat(row.avgPosition.slice(1)) <= 3
                          ? "text-green-500"
                          : row.avgPosition !== "N/A" && parseFloat(row.avgPosition.slice(1)) <= 5
                          ? "text-amber-500"
                          : row.avgPosition !== "N/A" ? "text-red-500" : "text-muted-foreground"
                      }`}>
                        {row.avgPosition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Platform Presence Summary */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Platform Presence Summary</h3>
            </div>
            <span className="text-xs text-muted-foreground font-medium">{presentCount}/{platforms.length} ACTIVE</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Active brand citations across authority-building external platforms.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => (
              <div
                key={platform.key}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={platform.icon} alt={platform.label}
                    className="w-5 h-5 rounded-full object-contain bg-white flex-shrink-0"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <span className="font-medium text-sm text-foreground">{platform.label}</span>
                </div>
                {platform.status === "present" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            ))}
          </div>

          {/* Missing platform recommendation */}
          {platforms.some(p => p.status === "missing") && (
            <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">Recommendation</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your {platforms.filter(p => p.status === "missing").map(p => p.label).join(", ")} presence is currently missing. Securing these pages would improve your authority score across all LLMs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Source Categories with Search */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Source Categories</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredSources.map((source) => {
            const isExpanded = expandedSource === source.name;
            const topCompetitor = getTopCompetitorForSource(source.mentions);
            const brandData = source.mentions[brandName] || DEFAULT_BRAND_DATA;

            return (
              <div key={source.name} className="bg-card rounded-xl border border-border overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedSource(isExpanded ? null : source.name)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground text-sm block truncate">{source.name}</span>
                      <span className="text-xs text-muted-foreground">{source.pagesUsed.length} sources referenced</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-col items-center">
                      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
                        brandData.count >= 3 ? "bg-green-500/20 text-green-500"
                        : brandData.count >= 1 ? "bg-amber-500/20 text-amber-500"
                        : "bg-red-500/20 text-red-500"
                      }`}>{brandData.count}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">mentions</span>
                    </div>
                    {topCompetitor.brand && (
                      <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                        {topCompetitor.logo && <img src={topCompetitor.logo} alt="" className="w-4 h-4 rounded-full object-contain bg-white" />}
                        <span className="text-xs text-muted-foreground">Top:</span>
                        <span className="text-xs font-medium">{topCompetitor.brand}</span>
                        <span className="text-xs font-bold text-primary">{topCompetitor.count}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/50 bg-muted/10 p-4 space-y-4">
                    {source.brandInsight && (
                      <div className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border/50">
                        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-semibold text-foreground">Insight for {brandName}:</span>
                          <p className="text-sm text-muted-foreground mt-1">{source.brandInsight}</p>
                        </div>
                      </div>
                    )}

                    {source.pagesUsed.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                          <Link2 className="w-4 h-4 text-primary" />
                          Sources Referenced ({source.pagesUsed.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {source.pagesUsed.map((p: string, i: number) => (
                            <a
                              key={i}
                              href={p.startsWith("http") ? p : `https://${p}`}
                              target="_blank" rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs hover:bg-primary/20 transition-colors"
                            >
                              <Globe className="w-3 h-3" />
                              <span className="max-w-[300px] truncate">{p}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Brand Mentions */}
                    <div className="pt-3 border-t border-border/50">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-primary" />
                        Brand Mentions in "{source.name}"
                      </h4>
                      <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2 border-b border-border">
                          <div className="grid grid-cols-12 gap-4 text-[10px] font-semibold text-muted-foreground uppercase">
                            <span className="col-span-3">Brand</span>
                            <span className="col-span-2 text-center">Mentions</span>
                            <span className="col-span-2 text-center">Score</span>
                            <span className="col-span-5">Insight</span>
                          </div>
                        </div>
                        {Object.entries(source.mentions).map(([brand, data]: [string, any]) => {
                          const isPrimary = brand === brandName;
                          return (
                            <div key={brand} className={`px-4 py-2.5 border-b border-border/30 ${isPrimary ? "bg-primary/5" : ""}`}>
                              <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-3 flex items-center gap-2">
                                  {getBrandLogo(brand) && <img src={getBrandLogo(brand)} alt="" className="w-5 h-5 rounded-full bg-white border" />}
                                  <span className={`text-sm ${isPrimary ? "text-primary font-semibold" : "text-foreground"}`}>{brand}</span>
                                </div>
                                <div className="col-span-2 text-center">
                                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                    data.count >= 3 ? "bg-green-500/20 text-green-500"
                                    : data.count >= 1 ? "bg-amber-500/20 text-amber-500"
                                    : "bg-red-500/20 text-red-500"
                                  }`}>{data.count}</span>
                                </div>
                                <div className="col-span-2 text-center text-sm font-medium text-foreground">
                                  {Math.round((data.score || 0) * 100)}%
                                </div>
                                <div className="col-span-5 text-xs text-muted-foreground line-clamp-2">
                                  {data.insight || "—"}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SourcesAllContent;
