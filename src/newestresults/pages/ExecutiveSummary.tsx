import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, Target, Users, Award, 
  AlertTriangle, CheckCircle, Lightbulb, FileText
} from "lucide-react";
import { 
  getExecutiveSummary, 
  getBrandName, 
  getPrimaryBrand 
} from "../data/newestAnalyticsData";

export default function ExecutiveSummary() {
  const summary = getExecutiveSummary();
  const brandName = getBrandName();
  const primaryBrand = getPrimaryBrand();

  const { leaders, mid_tier, laggards } = summary.competitor_positioning;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Executive Summary</h1>
        <p className="text-muted-foreground">Complete overview and strategic recommendations</p>
      </div>

      {/* Brand Score */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Brand Score & Tier</h3>
              <p className="text-muted-foreground">{summary.brand_score_and_tier}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {summary.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-foreground">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="w-5 h-5" />
              Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {summary.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-foreground">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Positioning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Competitor Positioning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Leaders */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Leaders
              </h4>
              <div className="space-y-3">
                {leaders.map((leader, idx) => (
                  <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-1">{leader.name}</h5>
                    <p className="text-sm text-green-700">{leader.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mid Tier */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                Mid Tier
              </h4>
              <div className="space-y-3">
                {mid_tier.map((comp, idx) => (
                  <div key={idx} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="font-medium text-yellow-800 mb-1">{comp.name}</h5>
                    <p className="text-sm text-yellow-700">{comp.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Laggards */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Laggards
              </h4>
              <div className="space-y-3">
                {laggards.map((lag, idx) => (
                  <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h5 className="font-medium text-red-800 mb-1">{lag.name}</h5>
                    <p className="text-sm text-red-700">{lag.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prioritized Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Prioritized Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.prioritized_actions.map((action, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-4 p-4 bg-muted/50 border border-border rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">
                  {idx + 1}
                </div>
                <p className="text-foreground pt-1">{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conclusion */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Conclusion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg leading-relaxed">{summary.conclusion}</p>
        </CardContent>
      </Card>
    </div>
  );
}
