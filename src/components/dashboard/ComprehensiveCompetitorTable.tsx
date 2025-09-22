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

interface CompetitorDimension {
  dimension: string;
  top_5_competitors: Array<{
    brand: string;
    visibility_count: number;
  }>;
  our_brand_position: number;
  our_brand_visibility_count: number;
}

interface ComprehensiveCompetitorTableProps {
  data: CompetitorDimension[];
  ourBrand: string;
}

export const ComprehensiveCompetitorTable = ({ data, ourBrand }: ComprehensiveCompetitorTableProps) => {
  // Get unique brands across all dimensions
  const allBrands = new Set<string>();
  data.forEach(dimension => {
    dimension.top_5_competitors.forEach(competitor => {
      allBrands.add(competitor.brand);
    });
  });
  
  const brandList = Array.from(allBrands);

  const getRankForBrand = (dimension: CompetitorDimension, brand: string) => {
    const competitor = dimension.top_5_competitors.find(c => c.brand === brand);
    if (competitor) {
      const index = dimension.top_5_competitors.indexOf(competitor);
      return { rank: index + 1, visibility: competitor.visibility_count };
    }
    return { rank: "-", visibility: 0 };
  };

  const getRankBadge = (rank: number | string, isOurBrand: boolean) => {
    if (rank === "-") return <span className="text-muted-foreground">-</span>;
    
    if (isOurBrand) {
      return <Badge className="bg-brand-primary text-white">#{rank}</Badge>;
    }
    
    if (typeof rank === 'number' && rank <= 3) {
      return <Badge className="bg-success text-success-foreground">#{rank}</Badge>;
    }
    return <Badge variant="outline">#{rank}</Badge>;
  };

  return (
    <Card className="shadow-elegant bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Comprehensive Competitor Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Brand positioning across key competitive dimensions
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Brand</TableHead>
                {data.map((dimension) => (
                  <TableHead key={dimension.dimension} className="text-center min-w-[100px]">
                    {dimension.dimension}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandList.map((brand) => {
                const isOurBrand = brand === ourBrand;
                return (
                  <TableRow 
                    key={brand} 
                    className={`hover:bg-muted/50 ${
                      isOurBrand ? "bg-brand-light border-l-4 border-l-brand-primary" : ""
                    }`}
                  >
                    <TableCell className="font-semibold">
                      {brand}
                      {isOurBrand && (
                        <Badge className="ml-2 bg-brand-primary text-white text-xs">
                          Our Brand
                        </Badge>
                      )}
                    </TableCell>
                    {data.map((dimension) => {
                      const { rank, visibility } = getRankForBrand(dimension, brand);
                      return (
                        <TableCell key={dimension.dimension} className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getRankBadge(rank, isOurBrand)}
                            {visibility > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {visibility} pts
                              </span>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};