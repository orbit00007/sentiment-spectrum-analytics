import { 
  getAIVisibilityMetrics,
  getMentionsPercentile,
  getSentiment,
  getBrandName,
  getAnalysisDate,
  getModelName,
  hasAnalyticsData,
  executiveSummary,
  getAnalytics,
  getBrandInfoWithLogos,
  getSourcesData,
  getDepthNotes,
  competitorData,
  competitorSentiment,
  getCompetitorVisibility,
  getKeywords,
  getBrandLogo,
  recommendations,
} from "@/results/data/analyticsData";
import { TierBadge } from "@/results/ui/TierBadge";
import { LLMIcon } from "@/results/ui/LLMIcon";
import { 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp, 
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  Target,
  AlertTriangle,
  Trophy,
  Users,
  ArrowDown,
  Zap,
  Globe,
  FileText,
  Layers,
  BookOpen,
  Lightbulb,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const FullReportContent = () => {
  if (!hasAnalyticsData()) {
    return null;
  }

  const visibilityData = getAIVisibilityMetrics();
  const mentionsData = getMentionsPercentile();
  const sentiment = getSentiment();
  const brandName = getBrandName();
  const analysisDate = getAnalysisDate();
  const modelName = getModelName();
  const models = modelName?.split(",").map(m => m.trim()) || [];
  const analytics = getAnalytics();
  const brandInfo = getBrandInfoWithLogos();
  const keywords = analytics?.analysis_scope?.search_keywords || [];
  const visibilityTable = analytics?.competitor_visibility_table;
  const sourcesData = getSourcesData();
  const depthNotes = getDepthNotes();
  const competitorVisibility = getCompetitorVisibility();

  const brandRow = visibilityTable?.rows?.find((row: any) => row[0] === brandName);
  const totalBrandScore = brandRow ? brandRow.slice(1).reduce((sum: number, s: any) => sum + (s as number), 0) : 0;

  const brandMentionsKey = `${brandName}Mentions`;
  const brandPresenceKey = `${brandName}Presence`;
  const totalSources = sourcesData.length;
  const sourcesWithMentions = sourcesData.filter((s: any) => (s[brandMentionsKey] || 0) > 0).length;
  const totalMentions = sourcesData.reduce((acc: number, s: any) => acc + (s[brandMentionsKey] || 0), 0);
  const presentSources = sourcesData.filter((s: any) => s[brandPresenceKey] === 'Present').length;

  const getBrandLogoUrl = (name: string) => {
    const brand = brandInfo.find((b: any) => b.brand === name);
    return brand?.logo;
  };

  const outlookOrder = { 'Positive': 0, 'Neutral': 1, 'Negative': 2 };
  const sortedSentiment = [...competitorSentiment].sort((a, b) => {
    return (outlookOrder[a.outlook as keyof typeof outlookOrder] || 2) - 
           (outlookOrder[b.outlook as keyof typeof outlookOrder] || 2);
  });

  const getEffortConfig = (effort: string) => {
    switch (effort) {
      case 'High': return { bg: 'bg-red-500/10', text: 'text-red-500' };
      case 'Medium': return { bg: 'bg-amber-500/10', text: 'text-amber-500' };
      case 'Low': return { bg: 'bg-green-500/10', text: 'text-green-500' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground' };
    }
  };

  const getImpactConfig = (impact: string) => {
    switch (impact) {
      case 'High': return { bg: 'bg-green-500/10', text: 'text-green-500' };
      case 'Medium': return { bg: 'bg-amber-500/10', text: 'text-amber-500' };
      case 'Low': return { bg: 'bg-red-500/10', text: 'text-red-500' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground' };
    }
  };

  return (
    <div className="print-report-container space-y-8 p-6 bg-background">
      {/* Report Header */}
      <div className="text-center border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">GEO Analysis Report</h1>
        <p className="text-lg text-muted-foreground">{brandName}</p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
          {analysisDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{analysisDate}</span>
            </div>
          )}
          {models.length > 0 && (
            <div className="flex items-center gap-2">
              {models.map(model => (
                <div key={model} className="flex items-center gap-1">
                  <LLMIcon platform={model} size="sm" />
                  <span className="capitalize">{model === "openai" ? "ChatGPT" : model}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 1: Executive Summary */}
      <section className="page-break-inside-avoid">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Executive Summary</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Overall Assessment</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{executiveSummary.brand_score_and_tier}</p>
            <p className="text-sm text-muted-foreground">{executiveSummary.conclusion}</p>
          </div>
          <div className="bg-primary/10 rounded-xl border border-primary/20 p-4 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-primary mb-1">{visibilityData.score}</div>
            <div className="text-sm text-muted-foreground mb-2">GEO Score</div>
            <TierBadge tier={visibilityData.tier} />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Top {100 - visibilityData.percentile}% of {visibilityData.totalBrands} brands
            </p>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h3 className="font-semibold text-foreground">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {executiveSummary.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-green-500/20 text-green-500 text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-foreground">Weaknesses</h3>
            </div>
            <ul className="space-y-2">
              {executiveSummary.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Prioritized Actions */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Prioritized Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {executiveSummary.prioritized_actions.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-sm text-foreground">{action}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Overview Metrics */}
      <section className="page-break-before page-break-inside-avoid">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Overview Metrics</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI Visibility</span>
              <TierBadge tier={visibilityData.tier} className="ml-auto" />
            </div>
            <div className="text-3xl font-bold text-primary">{visibilityData.percentile}%</div>
            <p className="text-xs text-muted-foreground">GEO Score: {visibilityData.score}</p>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Brand Mentions</span>
              <TierBadge tier={mentionsData.tier} className="ml-auto" />
            </div>
            <div className="text-3xl font-bold text-amber-500">{mentionsData.brandMentions}</div>
            <p className="text-xs text-muted-foreground">Top brand: {mentionsData.topBrandMentions}</p>
          </div>
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Sentiment</span>
              <TierBadge tier={sentiment.dominant_sentiment} className="ml-auto" />
            </div>
            <p className="text-sm text-muted-foreground">{sentiment.summary}</p>
          </div>
        </div>
      </section>

      {/* Section 3: Prompts & Keywords */}
      <section className="page-break-before page-break-inside-avoid">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Prompts & Keywords</h2>
          <span className="ml-auto text-lg font-bold text-primary">{totalBrandScore} Total Score</span>
        </div>
        
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Keyword</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">{brandName}</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Top Competitor</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Top Score</th>
              </tr>
            </thead>
            <tbody>
              {keywords.slice(0, 15).map((keyword: string, index: number) => {
                const keywordIndex = index + 1;
                const brandScore = brandRow ? brandRow[keywordIndex] as number : 0;
                let topCompetitor = '';
                let topScore = 0;
                visibilityTable?.rows?.forEach((row: any) => {
                  const score = row[keywordIndex] as number;
                  if (score > topScore) {
                    topScore = score;
                    topCompetitor = row[0] as string;
                  }
                });
                return (
                  <tr key={keyword} className="border-b border-border/50">
                    <td className="py-2 px-4 text-foreground">{keyword}</td>
                    <td className="py-2 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        brandScore >= 7 ? 'bg-green-500/20 text-green-500' :
                        brandScore >= 4 ? 'bg-amber-500/20 text-amber-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>{brandScore}</span>
                    </td>
                    <td className="py-2 px-4 text-foreground">{topCompetitor}</td>
                    <td className="py-2 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold">{topScore}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Sources */}
      <section className="page-break-before page-break-inside-avoid">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Sources & Content Impact</h2>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-card rounded-xl border p-3 text-center">
            <Globe className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-2xl font-bold text-foreground">{totalSources}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </div>
          <div className="bg-card rounded-xl border p-3 text-center">
            <FileText className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-500">{presentSources}</div>
            <div className="text-xs text-muted-foreground">Present In</div>
          </div>
          <div className="bg-card rounded-xl border p-3 text-center">
            <BookOpen className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-500">{sourcesWithMentions}</div>
            <div className="text-xs text-muted-foreground">With Mentions</div>
          </div>
          <div className="bg-card rounded-xl border p-3 text-center">
            <FileText className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-2xl font-bold text-primary">{totalMentions}</div>
            <div className="text-xs text-muted-foreground">Total Mentions</div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Source Category</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Presence</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Mentions</th>
              </tr>
            </thead>
            <tbody>
              {sourcesData.slice(0, 10).map((source: any) => (
                <tr key={source.name} className="border-b border-border/50">
                  <td className="py-2 px-4 text-foreground font-medium">{source.name}</td>
                  <td className="py-2 px-4 text-center">
                    <TierBadge tier={source[brandPresenceKey] || 'Absent'} />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                      (source[brandMentionsKey] || 0) > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>{source[brandMentionsKey] || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Competitor Comparisons */}
      <section className="page-break-before page-break-inside-avoid">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Competitor Comparisons</h2>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Brand</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Total Score</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Visibility</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {[...competitorData].sort((a, b) => b.totalScore - a.totalScore).map((c) => {
                const isPrimaryBrand = c.name === brandName;
                const sentimentData = competitorSentiment.find(s => s.brand === c.name);
                const visData = competitorVisibility.find(v => v.name === c.name);
                return (
                  <tr key={c.name} className={`border-b border-border/50 ${isPrimaryBrand ? 'bg-primary/5' : ''}`}>
                    <td className={`py-2 px-4 font-medium ${isPrimaryBrand ? 'text-primary' : 'text-foreground'}`}>
                      {c.name}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${isPrimaryBrand ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                        {c.totalScore}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-center text-foreground">{visData?.visibility || 0}%</td>
                    <td className="py-2 px-4 text-center">
                      <TierBadge tier={sentimentData?.outlook || 'N/A'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 6: Brand Sentiment */}
      <section className="page-break-before page-break-inside-avoid">
        <div className="flex items-center gap-2 mb-4">
          <ThumbsUp className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold text-foreground">Brand Sentiment Analysis</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {['Positive', 'Neutral', 'Negative'].map(sentimentType => {
            const count = competitorSentiment.filter(c => c.outlook === sentimentType).length;
            const colors = {
              'Positive': 'bg-green-500/10 border-green-500/30 text-green-500',
              'Neutral': 'bg-gray-500/10 border-gray-500/30 text-gray-500',
              'Negative': 'bg-red-500/10 border-red-500/30 text-red-500'
            };
            return (
              <div key={sentimentType} className={`rounded-xl border p-3 text-center ${colors[sentimentType as keyof typeof colors]}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm">{sentimentType}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Brand</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Summary</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Outlook</th>
              </tr>
            </thead>
            <tbody>
              {sortedSentiment.map((item, index) => {
                const isPrimaryBrand = item.brand === brandName;
                return (
                  <tr key={index} className={`border-b border-border/50 ${isPrimaryBrand ? 'bg-primary/5' : ''}`}>
                    <td className={`py-2 px-4 font-medium ${isPrimaryBrand ? 'text-primary' : 'text-foreground'}`}>
                      {item.brand}
                    </td>
                    <td className="py-2 px-4 text-muted-foreground text-xs max-w-md truncate">{item.summary}</td>
                    <td className="py-2 px-4 text-center">
                      <TierBadge tier={item.outlook} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 7: Recommendations */}
      <section className="page-break-before page-break-inside-avoid">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-foreground">Strategic Recommendations</h2>
          <span className="ml-auto text-lg font-bold text-amber-500">{recommendations.length} Actions</span>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec: any, index: number) => {
            const effortConfig = getEffortConfig(rec.overall_effort);
            const impactConfig = getImpactConfig(rec.impact);
            return (
              <div key={index} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${impactConfig.bg} ${impactConfig.text} font-bold text-sm`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-3 h-3 text-amber-400" />
                      <span className="text-xs font-medium text-muted-foreground uppercase">Insight</span>
                    </div>
                    <p className="text-sm text-foreground">{rec.overall_insight}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <div className={`px-2 py-1 rounded-lg ${effortConfig.bg}`}>
                      <span className="text-[8px] text-muted-foreground block">Effort</span>
                      <span className={`text-xs font-semibold ${effortConfig.text}`}>{rec.overall_effort}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-lg ${impactConfig.bg}`}>
                      <span className="text-[8px] text-muted-foreground block">Impact</span>
                      <span className={`text-xs font-semibold ${impactConfig.text}`}>{rec.impact}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10 ml-11">
                  <Target className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-medium text-primary uppercase block mb-0.5">Action</span>
                    <p className="text-xs text-foreground">{rec.suggested_action}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <div className="text-center border-t border-border pt-6 mt-8 text-sm text-muted-foreground">
        <p>Generated by GeoRankers • {analysisDate}</p>
      </div>
    </div>
  );
};

export default FullReportContent;
