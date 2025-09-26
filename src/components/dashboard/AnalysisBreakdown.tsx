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

interface CalculationBreakdown {
  query: string;
  weighted_points_for_brand: number;
  explanation: string;
}

interface AnalysisBreakdownProps {
  data: CalculationBreakdown[];
  geoScore: number;
  weightedTotal: number;
  queryCount: number;
}

export const AnalysisBreakdown = ({ data, geoScore, weightedTotal, queryCount }: AnalysisBreakdownProps) => {
  return (
    <Card className="shadow-elegant bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Visibility Score Calculation</CardTitle>
        <p className="text-sm text-muted-foreground">
          Detailed breakdown of AI visibility scoring methodology
        </p>
        <div className="flex items-center gap-4 mt-2">
          <Badge variant="outline" className="font-mono">
            GEO Score: {geoScore} = {weightedTotal} × {queryCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Query</TableHead>
              <TableHead className="text-center">Points</TableHead>
              <TableHead>Explanation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="font-medium max-w-xs">
                  <div className="truncate" title={item.query}>
                    {item.query}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    className={`font-mono ${
                      item.weighted_points_for_brand >= 3 
                        ? "bg-green-500 text-white" 
                        : item.weighted_points_for_brand === 2 
                        ? "bg-yellow-500 text-white"
                        : "bg-orange-500 text-white"
                    }`}
                  >
                    {item.weighted_points_for_brand}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.explanation}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4 p-4 bg-muted/20 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Weighted Points:</span>
              <div className="text-2xl font-bold text-brand-primary">{weightedTotal}</div>
            </div>
            <div>
              <span className="font-medium">Query Count:</span>
              <div className="text-2xl font-bold text-brand-primary">{queryCount}</div>
            </div>
            <div>
              <span className="font-medium">Final GEO Score:</span>
              <div className="text-2xl font-bold text-brand-primary">{geoScore}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};