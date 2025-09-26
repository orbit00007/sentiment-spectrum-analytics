import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, BarChart3, Table } from "lucide-react";

interface VisualGuidance {
  scorecard_note: string;
  competitor_table_note: string;
  source_chart_note: string;
}

interface VisualGuidanceProps {
  data: VisualGuidance;
}

export const VisualGuidance = ({ data }: VisualGuidanceProps) => {
  return (
    <Card className="shadow-elegant bg-white">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Visual Guidance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Notes on how to visually represent the data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-4 h-4 text-muted-foreground mt-1" />
          <div>
            <h4 className="font-medium text-sm mb-1">Scorecard Display</h4>
            <p className="text-sm text-muted-foreground">{data.scorecard_note}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Table className="w-4 h-4 text-muted-foreground mt-1" />
          <div>
            <h4 className="font-medium text-sm mb-1">Competitor Table</h4>
            <p className="text-sm text-muted-foreground">{data.competitor_table_note}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <BarChart3 className="w-4 h-4 text-muted-foreground mt-1" />
          <div>
            <h4 className="font-medium text-sm mb-1">Source Chart</h4>
            <p className="text-sm text-muted-foreground">{data.source_chart_note}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};