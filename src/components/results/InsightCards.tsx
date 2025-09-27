import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Shield,
  ExternalLink,
  AlertTriangle
} from "lucide-react";

interface InsightCardsProps {
  data: any;
  cardCount: "4" | "5";
  onViewQueries: () => void;
  onViewSources: () => void;
  onViewAttributes: () => void;
}

export const InsightCards = ({ data, cardCount, onViewQueries, onViewSources, onViewAttributes }: InsightCardsProps) => {
  const { summary, insights } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {/* Card 1 - AI Share of Answers */}
      <Card className="card-gradient border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">AI Share of Answers</CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-foreground">
                {summary.ai_share_of_answers.brand_hits}
              </span>
              <span className="text-muted-foreground">of {summary.total_queries}</span>
              <Badge variant="secondary" className="ml-auto">
                {summary.ai_share_of_answers.percent}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              How often AI assistants include your brand
            </p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={onViewQueries}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View queries
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 2 - Competitor Share of Voice */}
      <Card className="card-gradient border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Competitor Share of Voice</CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.competitor_share_of_voice.slice(0, 5).map((competitor: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{competitor.name}</span>
                <div className="flex items-center space-x-2">
                  <Progress value={competitor.percent} className="w-16" />
                  <span className="text-xs text-muted-foreground w-8">{competitor.count}</span>
                </div>
              </div>
            ))}
            <p className="text-sm text-muted-foreground pt-2">
              Who dominates answers in your category
            </p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={() => {}}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              See full list
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 3 - Source Influence */}
      <Card className="card-gradient border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Source Influence</CardTitle>
            <Globe className="w-5 h-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Citations: {insights.source_influence.total_citations}
            </div>
            <div className="flex flex-wrap gap-1">
              {insights.source_influence.domains.slice(0, 8).map((domain: any, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {domain.domain} ({domain.count})
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              These sites shape what AI says
            </p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={onViewSources}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View all sources
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 4 - Narrative Gaps */}
      <Card className="card-gradient border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Narrative Gaps</CardTitle>
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.narrative_gaps.slice(0, 6).map((gap: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{gap.label}</span>
                {gap.brandHas ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
              </div>
            ))}
            <p className="text-sm text-muted-foreground pt-2">
              What AI credits rivals for but not you
            </p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={onViewAttributes}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              See details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 5 - Brand Defense Risk (Conditional) */}
      {cardCount === "5" && insights.brand_defense?.enabled && (
        <Card className="card-gradient border-0 col-span-full md:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Brand Defense Risk</CardTitle>
              <Shield className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Badge 
                variant={
                  insights.brand_defense.risk === "High" ? "destructive" :
                  insights.brand_defense.risk === "Medium" ? "warning" : "success"
                }
              >
                {insights.brand_defense.risk} Risk
              </Badge>
              <p className="text-sm">
                In 'alternatives' queries, you appear in{" "}
                <span className="font-semibold">
                  {insights.brand_defense.brand_appears_in_alt}
                </span>{" "}
                of {insights.brand_defense.alt_queries_count}.
              </p>
              <p className="text-sm text-muted-foreground">
                Are you present when people ask for alternatives to you
              </p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary"
                onClick={onViewQueries}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                See queries
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};