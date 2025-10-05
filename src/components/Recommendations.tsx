import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lightbulb } from "lucide-react";

interface RecommendationsProps {
  recommendations: Array<{
    overall_insight: string;
    suggested_action: string;
    overall_effort: string;
    impact: string;
  }>;
}

const getEffortColor = (effort: string) => {
  const effortLower = effort.toLowerCase();
  if (effortLower === 'high') return 'bg-negative text-negative-foreground';
  if (effortLower === 'medium') return 'bg-warning text-warning-foreground';
  if (effortLower === 'low') return 'bg-positive text-positive-foreground';
  return 'bg-secondary text-secondary-foreground';
};

const getImpactColor = (impact: string) => {
  switch (impact.toLowerCase()) {
    case 'high':
      return 'bg-emerald-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-red-500 text-white';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

export const Recommendations = ({ recommendations }: RecommendationsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Lightbulb className="h-7 w-7 text-primary" />
        Strategic Recommendations
      </h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Actionable Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Overall Insight</TableHead>
                <TableHead>Suggested Action</TableHead>
                <TableHead className="text-center">Effort</TableHead>
                <TableHead className="text-center">Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.map((rec, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{rec.overall_insight}</TableCell>
                  <TableCell>{rec.suggested_action}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={getEffortColor(rec.overall_effort)}>
                      {rec.overall_effort}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getImpactColor(rec.impact)}>
                      {rec.impact}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};