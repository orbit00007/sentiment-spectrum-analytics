import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SourceData {
  category: string;
  total_citations: number;
  visibility: string;
  examples: string[];
}

interface SourceMetricsTableProps {
  data: SourceData[];
}

export const SourceMetricsTable = ({ data }: SourceMetricsTableProps) => {
  const getVisibilityBadge = (visibility: string) => {
    switch (visibility.toLowerCase()) {
      case "high":
        return <Badge className="bg-green-500 text-white">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
      case "low":
        return <Badge className="bg-red-500 text-white">Low</Badge>;
      default:
        return <Badge variant="outline">{visibility}</Badge>;
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-chart-6 rounded-full"></div>
          Detailed Source Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Example Websites</TableHead>
              <TableHead className="text-center">Citations</TableHead>
              <TableHead className="text-center">Visibility Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((source, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="font-semibold">{source.category}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {source.examples.slice(0, 3).map((example, i) => (
                      <div key={i} className="mb-1 last:mb-0 text-muted-foreground">
                        • {example}
                      </div>
                    ))}
                    {source.examples.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{source.examples.length - 3} more
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono">
                  {source.total_citations}
                </TableCell>
                <TableCell className="text-center">
                  {getVisibilityBadge(source.visibility)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};