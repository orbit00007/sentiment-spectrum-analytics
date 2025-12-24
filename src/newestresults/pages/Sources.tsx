import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, ExternalLink, FileText, ChevronDown, ChevronRight, 
  TrendingUp, TrendingDown, Link as LinkIcon
} from "lucide-react";
import { 
  getSourcesAndContentImpact,
  getBrandName
} from "../data/newestAnalyticsData";

export default function Sources() {
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  
  const sources = getSourcesAndContentImpact();
  const primaryBrandName = getBrandName();

  const toggleSource = (sourceName: string) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(sourceName)) {
      newExpanded.delete(sourceName);
    } else {
      newExpanded.add(sourceName);
    }
    setExpandedSources(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.5) return 'Medium';
    return 'Low';
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const sourceEntries = Object.entries(sources);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Sources & Content Impact</h1>
        <p className="text-muted-foreground">Analyze how different source categories contribute to brand visibility</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Source Categories</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{sourceEntries.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Total Pages Used</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {sourceEntries.reduce((acc, [_, data]) => acc + (data.pages_used?.length || 0), 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Total Brand Mentions</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {sourceEntries.reduce((acc, [_, data]) => {
                const brandData = data.mentions?.[primaryBrandName];
                return acc + (brandData?.count || 0);
              }, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Source Categories */}
      <div className="space-y-4">
        {sourceEntries.map(([sourceName, sourceData]) => {
          const brandMention = sourceData.mentions?.[primaryBrandName];
          const isExpanded = expandedSources.has(sourceName);

          return (
            <Card key={sourceName} className="overflow-hidden">
              <button
                onClick={() => toggleSource(sourceName)}
                className="w-full"
              >
                <CardHeader className="hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                      <Globe className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg text-left">{sourceName}</CardTitle>
                    </div>
                    <div className="flex items-center gap-4">
                      {brandMention && (
                        <>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Mentions</p>
                            <p className="font-semibold text-foreground">{brandMention.count}</p>
                          </div>
                          <Badge className={getScoreColor(brandMention.score)}>
                            {getScoreLabel(brandMention.score)} ({Math.round(brandMention.score * 100)}%)
                          </Badge>
                        </>
                      )}
                      <Badge variant="outline">{sourceData.pages_used?.length || 0} pages</Badge>
                    </div>
                  </div>
                </CardHeader>
              </button>

              {isExpanded && (
                <CardContent className="border-t border-border pt-4">
                  {/* Brand Insight */}
                  {brandMention?.insight && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium text-foreground mb-2">
                        {primaryBrandName} Insight
                      </h4>
                      <p className="text-sm text-muted-foreground">{brandMention.insight}</p>
                    </div>
                  )}

                  {/* Pages Used */}
                  {sourceData.pages_used && sourceData.pages_used.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Pages Used
                      </h4>
                      <div className="space-y-2">
                        {sourceData.pages_used.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <img 
                              src={`https://www.google.com/s2/favicons?domain=${extractDomain(url)}`}
                              alt=""
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-foreground flex-1 truncate">
                              {url}
                            </span>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
