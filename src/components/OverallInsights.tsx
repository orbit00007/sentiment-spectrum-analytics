import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Eye, MessageSquare } from "lucide-react";

interface OverallInsightsProps {
  insights: {
    ai_visibility?: {
      tier?: string;
      ai_visibility_score?: { Value: number };
      geo_score?: { Value: number };
      weighted_mentions_total?: { Value: number };
      distinct_queries_count?: { Value: number };
    };
    brand_mentions?: {
      level?: string;
      mentions_count?: { Value: number };
      total_sources_checked?: { Value: number };
    };
    dominant_sentiment?: {
      sentiment?: string;
      statement?: string;
    };
    summary?: string;
  };
}

const getTierColor = (tier?: string) => {
  const tierLower = (tier || "").toLowerCase();
  switch (tierLower) {
    case 'high':
      return 'bg-success text-success-foreground';
    case 'medium':
      return 'bg-warning text-warning-foreground';
    case 'low':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const getSentimentColor = (sentiment?: string) => {
  const sentimentLower = (sentiment || "").toLowerCase();
  switch (sentimentLower) {
    case 'positive':
      return 'bg-success text-success-foreground';
    case 'negative':
      return 'bg-destructive text-destructive-foreground';
    case 'neutral':
      return 'bg-warning text-warning-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';  
  }
};

const getCardBorderColor = (level?: string) => {
  const levelLower = (level || "").toLowerCase();
  switch (levelLower) {
    case 'high':
    case 'positive':
      return 'border-success shadow-success/20 shadow-lg';
    case 'medium':
    case 'neutral':
      return 'border-warning shadow-warning/20 shadow-lg';
    case 'low':
    case 'negative':
      return 'border-destructive shadow-destructive/20 shadow-lg';
    default:
      return 'border-gray-200';
  }
};

export const OverallInsights = ({ insights }: OverallInsightsProps) => {
  // Safely extract values with fallbacks
  const visibilityScore = insights?.ai_visibility?.ai_visibility_score?.Value || 0;
  const geoScore = insights?.ai_visibility?.geo_score?.Value || 0;
  const mentionsCount = insights?.brand_mentions?.mentions_count?.Value || 0;
  const totalSourcesChecked = insights?.brand_mentions?.total_sources_checked?.Value || 1;
  const mentionsPercentage = (mentionsCount / totalSourcesChecked) * 100;
  
  const aiVisibilityTier = insights?.ai_visibility?.tier || 'unknown';
  const brandMentionsLevel = insights?.brand_mentions?.level || 'unknown';
  const sentiment = insights?.dominant_sentiment?.sentiment || 'neutral';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Overall Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Visibility Card */}
        <Card className={`border-2 ${getCardBorderColor(aiVisibilityTier)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                AI Visibility
              </CardTitle>
              <Badge className={getTierColor(aiVisibilityTier)} variant="secondary">
                {aiVisibilityTier.charAt(0).toUpperCase() + aiVisibilityTier.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Visibility Score</span>
                <span className="font-semibold">{visibilityScore}</span>
              </div>
              <Progress value={Math.min((visibilityScore / 300) * 100, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Geo Score</span>
                <span className="font-semibold">{geoScore}</span>
              </div>
              <Progress value={Math.min((geoScore / 300) * 100, 100)} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 text-center">
              <div>
                <div className="text-xl font-bold text-primary">
                  {insights?.ai_visibility?.weighted_mentions_total?.Value || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Mentions</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">
                  {insights?.ai_visibility?.distinct_queries_count?.Value || 0}
                </div>
                <div className="text-xs text-muted-foreground">Query Types</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Mentions Card */}
        <Card className={`border-2 ${getCardBorderColor(brandMentionsLevel)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Brand Mentions
              </CardTitle>
              <Badge className={getTierColor(brandMentionsLevel)} variant="secondary">
                {brandMentionsLevel.charAt(0).toUpperCase() + brandMentionsLevel.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Mention Coverage</span>
                <span className="font-semibold">{mentionsPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={mentionsPercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 text-center">
              <div>
                <div className="text-xl font-bold text-primary">{mentionsCount}</div>
                <div className="text-xs text-muted-foreground">Mentions Found</div>
              </div>
              <div>
                <div className="text-xl font-bold text-muted-foreground">{totalSourcesChecked}</div>
                <div className="text-xs text-muted-foreground">Sources Checked</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Analysis Card */}
        <Card className={`border-2 ${getCardBorderColor(sentiment)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sentiment Analysis
              </CardTitle>
              <Badge className={getSentimentColor(sentiment)} variant="secondary">
                {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insights?.dominant_sentiment?.statement || "No sentiment analysis available."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      {insights?.summary && (
        <Card className="border-2 border-excutive-summary shadow-excutive-summary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{insights.summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};