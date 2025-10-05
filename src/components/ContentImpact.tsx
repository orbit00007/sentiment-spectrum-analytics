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
import { BarChart3 } from "lucide-react";

interface ContentImpactProps {
  brandName: string;
  contentImpact: {
    header: string[];
    rows: (string | number | string[])[][];
    depth_notes?: {
      [brand: string]: {
        [source: string]: {
          insight: string;
          pages_used: string[];
        };
      };
    };
  };
}

const getMentionScoreColor = (tier: string) => {
  const tierLower = tier.toLowerCase();
  if (tierLower === "high") return "bg-emerald-500 text-white";
  if (tierLower === "medium") return "bg-yellow-500 text-black";
  if (tierLower === "low" || tierLower === "absent")
    return "bg-red-500 text-white";
  return "bg-secondary text-secondary-foreground";
};

const getMentionTier = (ratio: number) => {
  if (ratio >= 70) return "High";
  if (ratio >= 40) return "Medium";
  if (ratio > 0) return "Low";
  return "N/A";
};

export const ContentImpact = ({
  brandName,
  contentImpact,
}: ContentImpactProps) => {
  if (!contentImpact.rows || contentImpact.rows.length === 0) return null;

  // Extract brand names from header
  const brandNames: string[] = [];
  for (let i = 1; i < contentImpact.header.length - 2; i += 3) {
    brandNames.push(contentImpact.header[i] as string);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <BarChart3 className="h-7 w-7 text-primary" />
        Content Impact Analysis
      </h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Platform-wise Brand Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px] font-bold">
                  Platform
                </TableHead>
                {brandNames.slice(0, -1).map((brand, i) => (
                  <TableHead
                    key={i}
                    className="text-center min-w-[120px] font-bold"
                  >
                    Competitor {i + 1}
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-[120px] font-bold bg-primary/10">
                  Your Brand
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contentImpact.rows.map((row, rowIndex) => {
                const sourceName = row[0] as string;
                
                // Find the highest mention count in this row across all brands
                const mentionCounts: number[] = [];
                for (let i = 0; i < brandNames.length; i++) {
                  mentionCounts.push(row[1 + i * 3 + 1] as number);
                }
                const maxMentions = Math.max(...mentionCounts);

                return (
                  <TableRow key={rowIndex}>
                    <TableCell className="font-semibold">
                      {sourceName}
                    </TableCell>
                    {brandNames.map((brand, index) => {
                      // Each brand has mentions and score in the row
                      const mentions = row[1 + index * 3 + 1] as number;
                      
                      // Calculate mention ratio: (brand mentions / max mentions) × 100
                      const mentionRatio = maxMentions > 0 ? (mentions / maxMentions) * 100 : 0;
                      
                      // Get tier based on ratio
                      const tier = getMentionTier(mentionRatio);

                      // check if this brand column is "your brand"
                      const isYourBrand = index === brandNames.length - 1;

                      return (
                        <TableCell
                          key={index}
                          className={`text-center ${
                            isYourBrand ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="space-y-1">
                            <div
                              className={`font-medium text-sm ${
                                isYourBrand ? "text-primary" : ""
                              }`}
                            >
                              {isYourBrand ? `${brandName}` : brand}
                            </div>
                            <div
                              className={`font-semibold ${
                                isYourBrand ? "text-primary font-bold" : ""
                              }`}
                            >
                              Mentions: {mentions}
                            </div>
                            <Badge className={getMentionScoreColor(tier)}>
                              {tier}
                            </Badge>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
