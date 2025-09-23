import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, FileText } from "lucide-react";

interface AnalysisScope {
  keywords_or_queries: string[];
  date_range: {
    from: string | null;
    to: string | null;
  };
  notes: string;
}

interface AnalysisScopeProps {
  data: AnalysisScope;
}

export const AnalysisScope = ({ data }: AnalysisScopeProps) => {
  return (
    <Card className="shadow-elegant bg-white">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="w-5 h-5" />
          Analysis Scope
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Keywords, queries, and date range used for this analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium">Keywords & Queries</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.keywords_or_queries.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium">Date Range</h4>
          </div>
          <div className="text-sm text-muted-foreground">
            {data.date_range.from && data.date_range.to 
              ? `${data.date_range.from} to ${data.date_range.to}`
              : "No specific date range specified"
            }
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium">Notes</h4>
          </div>
          <p className="text-sm text-muted-foreground">{data.notes}</p>
        </div>
      </CardContent>
    </Card>
  );
};