import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ContentImpactProps {
  contentImpact: {
    [key: string]: {
      top_3_brands?: Array<{
        brand: string;
        position: { Value: number };
        visibility: { Value: number };
      }>;
      our_brand_position?: {
        brand: string;
        position: { Value: number };
        visibility: { Value: number };
      };
    };
  };
}

export const ContentImpact = ({ contentImpact }: ContentImpactProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        Content Impact Analysis
      </h2>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead className="text-center">Rank 1</TableHead>
                <TableHead className="text-center">Rank 2</TableHead>
                <TableHead className="text-center">Rank 3</TableHead>
                <TableHead className="text-center">Your Brand</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(contentImpact).map(([platform, data]) => (
                <TableRow key={platform}>
                  <TableCell className="font-medium">{platform}</TableCell>
                  {[0, 1, 2].map((rankIndex) => (
                    <TableCell key={rankIndex}>
                      {data.top_3_brands && data.top_3_brands[rankIndex] ? (
                        <div className="text-center">
                          <div className="font-semibold">
                            {data.top_3_brands[rankIndex].brand}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Visibility Score:{" "}
                            {data.top_3_brands[rankIndex].visibility.Value}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">
                          -
                        </div>
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    {data.our_brand_position ? (
                      <div className="text-center bg-primary/5 rounded p-2">
                        <Badge variant="outline" className="text-xs">
                          Position : {data.our_brand_position.position.Value}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          Visibility Score:{" "}
                          {data.our_brand_position.visibility.Value}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">-</div>
                    )}
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
