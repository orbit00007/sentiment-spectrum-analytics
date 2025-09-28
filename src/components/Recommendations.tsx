import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  Clock, 
  Target, 
  TrendingUp, 
  Search, 
  Users, 
  Share2,
  Calendar,
  Zap
} from "lucide-react";

interface RecommendationsProps {
  recommendations: Array<{
    category: string;
    action: string;
    timeframe: string;
    rationale: string;
    expected_impact: string;
    effort: string;
  }>;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'content marketing':
      return <Lightbulb className="h-5 w-5" />;
    case 'seo optimization':
      return <Search className="h-5 w-5" />;
    case 'customer engagement':
      return <Users className="h-5 w-5" />;
    case 'social media marketing':
      return <Share2 className="h-5 w-5" />;
    default:
      return <Target className="h-5 w-5" />;
  }
};

const getEffortColor = (effort: string) => {
  switch (effort.toLowerCase()) {
    case 'high':
      return 'bg-destructive text-destructive-foreground';
    case 'medium':
      return 'bg-warning text-warning-foreground';
    case 'low':
      return 'bg-success text-success-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const getTimeframeIcon = (timeframe: string) => {
  if (timeframe.toLowerCase().includes('ongoing')) {
    return <Zap className="h-4 w-4" />;
  }
  return <Calendar className="h-4 w-4" />;
};

export const Recommendations = ({ recommendations }: RecommendationsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <TrendingUp className="h-7 w-7 text-primary" />
        Strategic Recommendations
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec, index) => (
          <Card key={index} className={`hover:shadow-lg transition-shadow border-2 ${
            rec.effort.toLowerCase() === 'high' ? 'border-destructive shadow-destructive/20 shadow-lg' :
            rec.effort.toLowerCase() === 'medium' ? 'border-warning shadow-warning/20 shadow-lg' :
            rec.effort.toLowerCase() === 'low' ? 'border-success shadow-success/20 shadow-lg' :
            'border-border'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  {getCategoryIcon(rec.category)}
                  {rec.category}
                </CardTitle>
                <Badge className={getEffortColor(rec.effort)} variant="secondary">
                  {rec.effort} Effort
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 text-foreground">Action Required</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{rec.action}</p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-semibold">Timeline:</span>
                <span className="text-muted-foreground">{rec.timeframe}</span>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Rationale
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{rec.rationale}</p>
              </div>

              <div className="bg-primary/5 p-3 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
                  <TrendingUp className="h-4 w-4" />
                  Expected Impact
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{rec.expected_impact}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};