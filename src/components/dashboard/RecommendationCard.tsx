import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, TrendingUp } from "lucide-react";

interface Recommendation {
  category: string;
  action: string;
  timeframe: string;
  rationale: string;
  expected_impact: string;
  effort: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  const getEffortBadge = (effort: string) => {
    switch (effort.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-500 text-white">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-500 text-white">Low</Badge>;
      default:
        return <Badge variant="outline">{effort}</Badge>;
    }
  };

  const getBorderColor = (effort: string) => {
    switch (effort.toLowerCase()) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-brand-primary";
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes("docs")) return Target;
    if (category.toLowerCase().includes("content")) return TrendingUp;
    return Clock;
  };

  const CategoryIcon = getCategoryIcon(recommendation.category);

  return (
    <Card className={`shadow-elegant hover:shadow-dramatic transition-all duration-300 border-l-4 ${getBorderColor(recommendation.effort)} bg-white`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-light rounded-lg">
              <CategoryIcon className="h-5 w-5 text-brand-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{recommendation.category}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{recommendation.timeframe}</span>
              </div>
            </div>
          </div>
          {getEffortBadge(recommendation.effort)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">ACTION</h4>
          <p className="text-sm">{recommendation.action}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">RATIONALE</h4>
          <p className="text-sm text-muted-foreground">{recommendation.rationale}</p>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            EXPECTED IMPACT
          </h4>
          <p className="text-sm">{recommendation.expected_impact}</p>
        </div>
      </CardContent>
    </Card>
  );
};