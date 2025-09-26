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

interface ContentImpactData {
  [key: string]: {
    top_3_brands: Array<{
      brand: string;
      visibility: number;
      position: number;
    }>;
    our_brand_position: {
      brand: string;
      position: number;
      visibility: number;
    };
  };
}

interface ContentImpactTableProps {
  data: ContentImpactData;
}

export const ContentImpactTable = ({ data }: ContentImpactTableProps) => {
  const getPositionBadge = (position: number) => {
    if (position <= 3) {
      return <Badge className="bg-green-500 text-white">#{position}</Badge>;
    } else if (position <= 5) {
      return <Badge className="bg-yellow-500 text-white">#{position}</Badge>;
    } else {
      return <Badge className="bg-red-500 text-white">#{position}</Badge>;
    }
  };

  return (
    <Card className="shadow-elegant bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Content Impact Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Brand visibility across different content categories
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content Category</TableHead>
              <TableHead className="text-center">Our Position</TableHead>
              <TableHead className="text-center">Our Visibility Score</TableHead>
              <TableHead className="text-center">Top Performer</TableHead>
              <TableHead className="text-center">Top Score</TableHead>
              <TableHead className="text-center">Gap</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(data).map(([category, info]) => {
              const topPerformer = info.top_3_brands[0];
              const gap = topPerformer.visibility - info.our_brand_position.visibility;
              
              return (
                <TableRow key={category} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{category}</TableCell>
                  <TableCell className="text-center">
                    {getPositionBadge(info.our_brand_position.position)}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {info.our_brand_position.visibility}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {topPerformer.brand}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {topPerformer.visibility}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={gap > 5 ? "destructive" : gap > 2 ? "secondary" : "outline"}
                      className="font-mono"
                    >
                      -{gap}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};