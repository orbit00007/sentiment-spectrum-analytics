import { getAnalytics, getBrandName, getBrandInfoWithLogos } from "@/results/data/analyticsData";
import { ChevronDown, ChevronRight, Search, BarChart3, Zap } from "lucide-react";
import { useState } from "react";
import { TierBadge } from "@/results/ui/TierBadge";

const PromptsContent = () => {
  const analytics = getAnalytics();
  const brandName = getBrandName();
  const brandInfo = getBrandInfoWithLogos();
  const keywords = analytics?.analysis_scope?.search_keywords || [];
  const visibilityTable = analytics?.competitor_visibility_table;
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredKeywords = keywords.filter(k => 
    k.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const brandRow = visibilityTable?.rows?.find(row => row[0] === brandName);

  const getScoreTier = (score: number, maxScore: number) => {
    const ratio = score / maxScore;
    if (ratio >= 0.7) return 'High';
    if (ratio >= 0.4) return 'Medium';
    return 'Low';
  };

  const getBrandLogo = (name: string) => {
    const brand = brandInfo.find(b => b.brand === name);
    return brand?.logo;
  };

  const totalBrandScore = brandRow ? brandRow.slice(1).reduce((sum: number, s) => sum + (s as number), 0) : 0;

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 p-4 md:p-6">
        <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-primary/10 rounded-lg md:rounded-xl">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-foreground">Prompts & Keywords</h1>
              <p className="text-xs md:text-sm text-muted-foreground">{keywords.length} keywords analyzed</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl md:text-3xl font-bold text-primary">{totalBrandScore}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground">Total Visibility Score</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 bg-card border border-border rounded-lg md:rounded-xl text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Mobile-friendly Keywords Cards (visible on mobile) */}
      <div className="md:hidden space-y-3">
        {filteredKeywords.map((keyword, index) => {
          const keywordIndex = index + 1;
          const brandScore = brandRow ? brandRow[keywordIndex] as number : 0;
          
          let topCompetitor = '';
          let topScore = 0;
          let topCompetitorLogo = '';
          visibilityTable?.rows?.forEach(row => {
            const score = row[keywordIndex] as number;
            if (score > topScore) {
              topScore = score;
              topCompetitor = row[0] as string;
              topCompetitorLogo = getBrandLogo(topCompetitor) || '';
            }
          });

          const isExpanded = expandedKeyword === keyword;
          const isLeading = brandScore === topScore && brandScore > 0;
          const tier = getScoreTier(brandScore, topScore || 1);

          return (
            <div key={keyword} className="bg-card rounded-xl border border-border overflow-hidden">
              <div 
                className="p-3 flex items-center justify-between gap-2 touch-manipulation"
                onClick={() => setExpandedKeyword(isExpanded ? null : keyword)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="font-medium text-foreground text-sm truncate">{keyword}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                    brandScore >= 7 ? 'bg-green-500/20 text-green-500' :
                    brandScore >= 4 ? 'bg-amber-500/20 text-amber-500' :
                    brandScore > 0 ? 'bg-red-500/20 text-red-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {brandScore}
                  </span>
                  {isLeading ? (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-[10px] font-medium">
                      Leading
                    </span>
                  ) : (
                    <TierBadge tier={tier} />
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-border/50 pt-3 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Top Competitor:</span>
                    <div className="flex items-center gap-1.5">
                      {topCompetitorLogo && (
                        <img src={topCompetitorLogo} alt="" className="w-5 h-5 rounded-full object-contain bg-white" />
                      )}
                      <span className="font-medium">{topCompetitor}</span>
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-semibold">{topScore}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {visibilityTable?.rows
                      ?.slice()
                      .sort((a, b) => (b[keywordIndex] as number) - (a[keywordIndex] as number))
                      .slice(0, 6)
                      .map(row => {
                        const name = row[0] as string;
                        const score = row[keywordIndex] as number;
                        const isBrand = name === brandName;
                        const logo = getBrandLogo(name);
                        return (
                          <div 
                            key={name} 
                            className={`flex flex-col items-center p-2 rounded-lg border ${
                              isBrand 
                                ? 'bg-primary/10 border-primary/30' 
                                : 'bg-muted/50 border-border'
                            }`}
                          >
                            {logo && (
                              <img src={logo} alt="" className="w-6 h-6 rounded-full object-contain bg-white mb-1" />
                            )}
                            <span className={`text-[10px] font-medium text-center truncate w-full ${isBrand ? 'text-primary' : 'text-foreground'}`}>
                              {name}
                            </span>
                            <span className={`text-sm font-bold ${
                              score >= 7 ? 'text-green-500' :
                              score >= 4 ? 'text-amber-500' :
                              score > 0 ? 'text-red-500' :
                              'text-muted-foreground'
                            }`}>
                              {score}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Keywords Table (hidden on mobile) */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-8"></th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Keyword / Prompt</th>
                <th className="text-center py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{brandName} Score</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Competitor</th>
                <th className="text-center py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Score</th>
                <th className="text-center py-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords.map((keyword, index) => {
                const keywordIndex = index + 1;
                const brandScore = brandRow ? brandRow[keywordIndex] as number : 0;
                
                let topCompetitor = '';
                let topScore = 0;
                let topCompetitorLogo = '';
                visibilityTable?.rows?.forEach(row => {
                  const score = row[keywordIndex] as number;
                  if (score > topScore) {
                    topScore = score;
                    topCompetitor = row[0] as string;
                    topCompetitorLogo = getBrandLogo(topCompetitor) || '';
                  }
                });

                const isExpanded = expandedKeyword === keyword;
                const isLeading = brandScore === topScore && brandScore > 0;
                const tier = getScoreTier(brandScore, topScore || 1);

                return (
                  <>
                    <tr 
                      key={keyword}
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => setExpandedKeyword(isExpanded ? null : keyword)}
                    >
                      <td className="py-4 px-4">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-foreground">{keyword}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                          brandScore >= 7 ? 'bg-green-500/20 text-green-500' :
                          brandScore >= 4 ? 'bg-amber-500/20 text-amber-500' :
                          brandScore > 0 ? 'bg-red-500/20 text-red-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {brandScore}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {topCompetitorLogo && (
                            <img src={topCompetitorLogo} alt="" className="w-6 h-6 rounded-full object-contain bg-white" />
                          )}
                          <span className="text-foreground">{topCompetitor}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold">
                          {topScore}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {isLeading ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
                            <BarChart3 className="w-3 h-3" />
                            Leading
                          </span>
                        ) : (
                          <TierBadge tier={tier} />
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-muted/20">
                        <td colSpan={6} className="py-6 px-8">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground">All Competitors for "{keyword}"</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                              {visibilityTable?.rows
                                ?.slice()
                                .sort((a, b) => (b[keywordIndex] as number) - (a[keywordIndex] as number))
                                .map(row => {
                                  const name = row[0] as string;
                                  const score = row[keywordIndex] as number;
                                  const isBrand = name === brandName;
                                  const logo = getBrandLogo(name);
                                  return (
                                    <div 
                                      key={name} 
                                      className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                                        isBrand 
                                          ? 'bg-primary/10 border-primary/30' 
                                          : 'bg-card border-border hover:border-primary/20'
                                      }`}
                                    >
                                      {logo && (
                                        <img src={logo} alt="" className="w-10 h-10 rounded-full object-contain bg-white mb-2" />
                                      )}
                                      <span className={`text-sm font-medium mb-1 ${isBrand ? 'text-primary' : 'text-foreground'}`}>
                                        {name}
                                      </span>
                                      <span className={`text-2xl font-bold ${
                                        score >= 7 ? 'text-green-500' :
                                        score >= 4 ? 'text-amber-500' :
                                        score > 0 ? 'text-red-500' :
                                        'text-muted-foreground'
                                      }`}>
                                        {score}
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredKeywords.length === 0 && (
        <div className="text-center py-8 md:py-12 text-muted-foreground bg-card rounded-xl border border-border text-sm md:text-base">
          No prompts found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default PromptsContent;
