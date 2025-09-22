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
        return <Badge className="bg-success text-success-foreground">High</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
      case "low":
        return <Badge className="bg-muted text-muted-foreground">Low</Badge>;
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
              <TableHead className="text-center">Citations</TableHead>
              <TableHead className="text-center">Visibility Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((source, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{source.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {source.examples.slice(0, 2).join(", ")}
                      {source.examples.length > 2 && "..."}
                    </div>
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