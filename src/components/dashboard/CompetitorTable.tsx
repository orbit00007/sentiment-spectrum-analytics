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

interface Competitor {
  brand: string;
  visibility_count: number;
}

interface CompetitorTableProps {
  title: string;
  data: Competitor[];
  ourBrand: string;
  dimension?: string;
}

export const CompetitorTable = ({ title, data, ourBrand, dimension }: CompetitorTableProps) => {
  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {dimension && (
          <p className="text-sm text-muted-foreground">
            Performance analysis for: {dimension}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead className="text-center">AI Visibility Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((competitor, index) => (
              <TableRow 
                key={index} 
                className={`hover:bg-muted/50 ${
                  competitor.brand === ourBrand 
                    ? "bg-brand-light border-l-4 border-l-brand-primary" 
                    : ""
                }`}
              >
                <TableCell className="font-medium">
                  <Badge variant={index < 3 ? "default" : "outline"}>
                    #{index + 1}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  {competitor.brand}
                  {competitor.brand === ourBrand && (
                    <Badge className="ml-2 bg-brand-primary text-white">
                      Our Brand
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {competitor.visibility_count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};