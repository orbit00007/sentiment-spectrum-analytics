import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Speedometer } from "@/components/Speedometer";
import { TrendingUp, Eye, MessageSquare, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TOOLTIP_CONTENT } from "@/lib/formulas";

interface ExecutiveSummary {
  brand_score_and_tier: string;
  strengths: string[];
  weaknesses: string[];
  competitor_positioning: {
    leaders: { name: string; summary: string }[];
    mid_tier: { name: string; summary: string }[];
    laggards: { name: string; summary: string }[];
  };
  prioritized_actions: string[];
  conclusion: string;
}

interface OverallInsightsProps {
  insights: {
    ai_visibility?: {
      tier: string;
      ai_visibility_score: { Value: number };
      weighted_mentions_total: { Value: number };
      distinct_queries_count?: { Value: number };
      breakdown?: {
        top_two_mentions: number;
        top_five_mentions: number;
        later_mentions: number;
        calculation?: string;
      };
      tier_mapping_method?: string;
      explanation?: string;
    };
    brand_mentions?: {
      total_sources_checked: { Value: number };
    };
    dominant_sentiment?: {
      sentiment: string;
      statement: string;
      summary?: string;
    };
    summary?: string;
  };
  executiveSummary?: ExecutiveSummary;
  yourBrandTotal?: number;
  topBrand?: string;
  topBrandTotal?: number;
}

const getTierColor = (tier: string) => {
  const lowerTier = tier.toLowerCase();
  switch (lowerTier) {
    case "high":
      return "bg-positive text-positive-foreground";
    case "medium":
      return "bg-warning text-warning-foreground";
    case "low":
      return "bg-negative text-negative-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const getSentimentColor = (sentiment: string) => {
  const lowerSentiment = sentiment.toLowerCase();
  switch (lowerSentiment) {
    case "positive":
      return "bg-positive text-positive-foreground";
    case "negative":
      return "bg-negative text-negative-foreground";
    case "neutral":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const OverallInsights = ({
  insights,
  executiveSummary,
  yourBrandTotal = 0,
  topBrand = "",
  topBrandTotal = 0,
}: OverallInsightsProps) => {
  const visibilityScore =
    insights?.ai_visibility?.ai_visibility_score?.Value || 0;

  // Calculate brand mentions tier based on ratio to top brand
  const mentionRatio = topBrandTotal > 0 ? (yourBrandTotal / topBrandTotal) * 100 : 0;
  
  const brandMentionsLevel =
    mentionRatio >= 70
      ? "High"
      : mentionRatio >= 40
      ? "Medium"
      : mentionRatio > 0
      ? "Low"
      : "N/A";

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Overall Insights</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-5 w-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="font-semibold">{TOOLTIP_CONTENT.overallInsights.title}</p>
              <p className="text-sm">{TOOLTIP_CONTENT.overallInsights.description}</p>
            </TooltipContent>
          </Tooltip>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Visibility Card */}
        <Card
          className={`border-2 ${
            insights?.ai_visibility?.tier?.toLowerCase() === "high"
              ? "border-positive"
              : insights?.ai_visibility?.tier?.toLowerCase() === "medium"
              ? "border-warning"
              : insights?.ai_visibility?.tier?.toLowerCase() === "low"
              ? "border-negative"
              : "border-border"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                AI Visibility
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="font-semibold">{TOOLTIP_CONTENT.aiVisibility.title}</p>
                    <p className="text-sm mb-2">{TOOLTIP_CONTENT.aiVisibility.description}</p>
                    <p className="text-xs font-semibold">Formula:</p>
                    <p className="text-xs mb-2">{TOOLTIP_CONTENT.aiVisibility.formula}</p>
                    <p className="text-xs font-semibold">Tiers:</p>
                    <p className="text-xs">• High: {TOOLTIP_CONTENT.aiVisibility.tiers.high}</p>
                    <p className="text-xs">• Medium: {TOOLTIP_CONTENT.aiVisibility.tiers.medium}</p>
                    <p className="text-xs">• Low: {TOOLTIP_CONTENT.aiVisibility.tiers.low}</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Badge
                className={getTierColor(insights?.ai_visibility?.tier || "")}
                variant="secondary"
              >
                {insights?.ai_visibility?.tier || "N/A"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="pt-4">
              <Speedometer value={visibilityScore} />
            </div>
          </CardContent>
        </Card>

        {/* Brand Mentions Card */}
        <Card
          className={`border-2 ${
            brandMentionsLevel.toLowerCase() === "high"
              ? "border-positive"
              : brandMentionsLevel.toLowerCase() === "medium"
              ? "border-warning"
              : brandMentionsLevel.toLowerCase() === "low"
              ? "border-negative"
              : "border-border"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Brand Mentions
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="font-semibold">{TOOLTIP_CONTENT.brandMentions.title}</p>
                    <p className="text-sm mb-2">{TOOLTIP_CONTENT.brandMentions.description}</p>
                    <p className="text-xs font-semibold">Calculation:</p>
                    <p className="text-xs mb-2">{TOOLTIP_CONTENT.brandMentions.calculation}</p>
                    <p className="text-xs font-semibold">Formula:</p>
                    <p className="text-xs mb-2">{TOOLTIP_CONTENT.brandMentions.formula}</p>
                    <p className="text-xs font-semibold">Tiers:</p>
                    <p className="text-xs">• High: {TOOLTIP_CONTENT.brandMentions.tiers.high}</p>
                    <p className="text-xs">• Medium: {TOOLTIP_CONTENT.brandMentions.tiers.medium}</p>
                    <p className="text-xs">• Low: {TOOLTIP_CONTENT.brandMentions.tiers.low}</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Badge
                className={getTierColor(brandMentionsLevel)}
                variant="secondary"
              >
                {brandMentionsLevel}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="pt-4">
                <Speedometer value={yourBrandTotal} maxValue={topBrandTotal} />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Top Brand Mention - <span className="font-bold text-primary">{topBrand}</span> - <span className="font-bold text-primary">{topBrandTotal}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Analysis Card */}
        <Card
          className={`border-2 ${
            insights?.dominant_sentiment?.sentiment?.toLowerCase() ===
            "positive"
              ? "border-positive"
              : insights?.dominant_sentiment?.sentiment?.toLowerCase() ===
                "negative"
              ? "border-negative"
              : insights?.dominant_sentiment?.sentiment?.toLowerCase() ===
                "neutral"
              ? "border-warning"
              : "border-border"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sentiment Analysis
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="font-semibold">{TOOLTIP_CONTENT.sentimentAnalysis.title}</p>
                    <p className="text-sm">{TOOLTIP_CONTENT.sentimentAnalysis.description}</p>
                    <p className="text-xs mt-2">{TOOLTIP_CONTENT.sentimentAnalysis.explanation}</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Badge
                className={getSentimentColor(
                  insights?.dominant_sentiment?.sentiment || ""
                )}
                variant="secondary"
              >
                {insights?.dominant_sentiment?.sentiment || "N/A"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insights?.dominant_sentiment?.statement ||
                "No sentiment analysis available"}
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Executive Summary Section */}
        {executiveSummary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Executive Summary
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="font-semibold">{TOOLTIP_CONTENT.executiveSummary.title}</p>
                    <p className="text-sm">{TOOLTIP_CONTENT.executiveSummary.description}</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-6 text-sm text-muted-foreground">
            {/* Benchmark */}
            <div>
              <h3 className="font-semibold text-foreground">
                Brand Visibility Scoring and Tier
              </h3>
              <p>{executiveSummary.brand_score_and_tier}</p>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="font-semibold text-foreground">Strengths</h3>
              <ul className="list-disc pl-5">
                {executiveSummary.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h3 className="font-semibold text-foreground">Weaknesses</h3>
              <ul className="list-disc pl-5">
                {executiveSummary.weaknesses.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            {/* Competitor Benchmarking */}
            <div>
              <h3 className="font-semibold text-foreground">
                Competitor Benchmarking
              </h3>
              <div>
                <p className="font-medium">Leaders</p>
                <ul className="list-disc pl-5">
                  {executiveSummary.competitor_positioning.leaders.map(
                    (l, idx) => (
                      <li key={idx}>
                        {l.name} : {l.summary}
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <p className="font-medium">Mid-Tier</p>
                <ul className="list-disc pl-5">
                  {executiveSummary.competitor_positioning.mid_tier.map(
                    (m, idx) => (
                      <li key={idx}>
                        {m.name} : {m.summary}
                      </li>
                    )
                  )}
                </ul>
              </div>
              {executiveSummary.competitor_positioning.laggards.length > 0 && (
                <div>
                  <p className="font-medium">Laggards</p>
                  <ul className="list-disc pl-5">
                    {executiveSummary.competitor_positioning.laggards.map(
                      (lag, idx) => (
                        <li key={idx}>
                          {lag.name} : {lag.summary}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div>
              <h3 className="font-semibold text-foreground">
                Prioritized Actions
              </h3>
              <ul className="list-disc pl-5">
                {executiveSummary.prioritized_actions.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>

            {/* Conclusion */}
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground">Conclusion</h3>
              <p>{executiveSummary.conclusion}</p>
            </div>
          </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};
