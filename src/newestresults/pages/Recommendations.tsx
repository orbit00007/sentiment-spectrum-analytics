import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, Target, TrendingUp, ArrowRight, 
  CheckCircle, AlertCircle, Clock
} from "lucide-react";
import { getRecommendations } from "../data/newestAnalyticsData";

export default function Recommendations() {
  const recommendations = getRecommendations();

  const getEffortColor = (effort: string) => {
    switch(effort?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch(impact?.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortIcon = (effort: string) => {
    switch(effort?.toLowerCase()) {
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  // Group by impact
  const highImpact = recommendations.filter(r => r.impact?.toLowerCase() === 'high');
  const mediumImpact = recommendations.filter(r => r.impact?.toLowerCase() === 'medium');
  const lowImpact = recommendations.filter(r => r.impact?.toLowerCase() === 'low');

  const renderRecommendation = (rec: typeof recommendations[0], idx: number) => (
    <Card key={idx} className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1">
            {/* Insight */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Insight</h4>
              <p className="text-foreground">{rec.overall_insight}</p>
            </div>

            {/* Suggested Action */}
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Suggested Action
              </h4>
              <p className="text-sm text-muted-foreground">{rec.suggested_action}</p>
            </div>

            {/* Effort & Impact */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Effort:</span>
                <Badge className={getEffortColor(rec.overall_effort)}>
                  <span className="flex items-center gap-1">
                    {getEffortIcon(rec.overall_effort)}
                    {rec.overall_effort}
                  </span>
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Impact:</span>
                <Badge className={getImpactColor(rec.impact)}>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {rec.impact}
                  </span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Recommendations</h1>
        <p className="text-muted-foreground">Actionable insights to improve your brand's AI visibility</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700">High Impact</p>
                <p className="text-2xl font-bold text-green-800">{highImpact.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-700">Medium Impact</p>
                <p className="text-2xl font-bold text-yellow-800">{mediumImpact.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Low Impact</p>
                <p className="text-2xl font-bold text-gray-800">{lowImpact.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Impact Recommendations */}
      {highImpact.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            High Impact Recommendations
          </h2>
          <div className="space-y-4">
            {highImpact.map((rec, idx) => renderRecommendation(rec, idx))}
          </div>
        </div>
      )}

      {/* Medium Impact Recommendations */}
      {mediumImpact.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            Medium Impact Recommendations
          </h2>
          <div className="space-y-4">
            {mediumImpact.map((rec, idx) => renderRecommendation(rec, idx))}
          </div>
        </div>
      )}

      {/* Low Impact Recommendations */}
      {lowImpact.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
            Low Impact Recommendations
          </h2>
          <div className="space-y-4">
            {lowImpact.map((rec, idx) => renderRecommendation(rec, idx))}
          </div>
        </div>
      )}
    </div>
  );
}
