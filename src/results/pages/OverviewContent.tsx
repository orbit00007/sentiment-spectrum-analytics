import { useResults } from "@/results/context/ResultsContext";
import {
  getAIVisibilityMetrics,
  getMentionsPercentile,
  getSentiment,
  getBrandName,
  getAnalysisDate,
  getModelName,
  hasAnalyticsData,
} from "@/results/data/analyticsData";
import { LLMVisibilityTable } from "@/results/overview/LLMVisibilityTable";
import { PlatformPresence } from "@/results/overview/PlatformPresence";
import { CompetitorComparisonChart } from "@/results/overview/CompetitorComparisonChart";
import { SourceMentionsChart } from "@/results/overview/SourceMentionsChart";
import { SourceInsights } from "@/results/overview/SourceInsights";
import { BrandMentionsRadar } from "@/results/overview/BrandMentionsRadar";
import { PercentileGauge } from "@/results/ui/PercentileGauge";
import { TierBadge } from "@/results/ui/TierBadge";
import { LLMIcon } from "@/results/ui/LLMIcon";
import {
  Info,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Calendar,
  Search,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const OverviewContent = () => {
  const { dataReady, isLoading, previousAnalytics, currentAnalytics } = useResults();

  // Show loader if data not ready
  if (!dataReady || !hasAnalyticsData()) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Analysis Started</h2>
            <p className="text-muted-foreground">
              We are preparing your brand's comprehensive analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const visibilityData = getAIVisibilityMetrics();
  const mentionsData = getMentionsPercentile();
  const sentiment = getSentiment();
  const brandName = getBrandName();
  const analysisDate = getAnalysisDate();
  const modelName = getModelName();
  const models = modelName?.split(",").map((m) => m.trim()) || [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Overall Insights
          </h1>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Comprehensive overview of your brand's AI performance.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {analysisDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{analysisDate}</span>
            </div>
          )}
          {models.length > 0 && (
            <div className="flex items-center gap-2">
              {models.map((model) => (
                <div key={model} className="flex items-center gap-1">
                  <LLMIcon platform={model} size="sm" />
                  <span className="hidden sm:inline capitalize">
                    {model === "openai" ? "ChatGPT" : model}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* AI Visibility */}
        <div className="bg-card rounded-xl border p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">AI Visibility</span>
            </div>
            <TierBadge tier={visibilityData.tier} />
          </div>
          <PercentileGauge
            percentile={visibilityData.percentile}
            subtitle1={`GEO Score: ${visibilityData.score}`}
            subtitle2={`Top ${100 - visibilityData.percentile}% of ${
              visibilityData.totalBrands
            } brands`}
            label="percentile"
          />
        </div>

        {/* Brand Mentions */}
        <div className="bg-card rounded-xl border p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
              </div>
              <span className="text-sm font-medium">Brand Mentions</span>
            </div>
            <TierBadge tier={mentionsData.tier} />
          </div>
          <PercentileGauge
            percentile={mentionsData.percentile}
            subtitle1={`${mentionsData.brandMentions} total mentions`}
            subtitle2={`Top brand: ${mentionsData.topBrandMentions}`}
            label="percentile"
          />
        </div>

        {/* Sentiment */}
        <div className="bg-card rounded-xl border p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <ThumbsUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              </div>
              <span className="text-sm font-medium">Sentiment</span>
            </div>
            <TierBadge tier={sentiment.dominant_sentiment} />
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-sm text-muted-foreground text-center">
              {sentiment.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <CompetitorComparisonChart />
        <BrandMentionsRadar />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <LLMVisibilityTable />
        <PlatformPresence />
      </div>

      {/* Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <SourceMentionsChart />
        <SourceInsights />
      </div>
    </div>
  );
};

export default OverviewContent;
