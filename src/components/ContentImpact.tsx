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
import { BarChart3, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  TOOLTIP_CONTENT, 
  getTierFromRatio, 
  calculateMentionRatio,
  getTierColor,
  safeNumber
} from "@/lib/formulas";

interface BrandLogo {
  brand: string;
  logo: string;
}

interface ContentImpactProps {
  brandName: string;
  brandLogos?: BrandLogo[];
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

export const ContentImpact = ({
  brandName,
  brandLogos,
  contentImpact,
}: ContentImpactProps) => {
  if (!contentImpact.rows || contentImpact.rows.length === 0) return null;

  // Extract brand names from header (every 3rd item starting at index 1)
  // Header structure: [Sources, BrandA, BrandA Mentions, BrandA Mention Score, BrandB, ...]
  const brandNames: string[] = [];
  for (let i = 1; i < contentImpact.header.length - 2; i += 3) {
    brandNames.push(contentImpact.header[i] as string);
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-primary" />
            Content Impact Analysis
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-sm mb-2">
                {TOOLTIP_CONTENT.contentImpact.description}
              </p>
              <p className="text-xs mb-2">
                {TOOLTIP_CONTENT.contentImpact.explanation}
              </p>
              <p className="text-xs font-semibold">Formula:</p>
              <p className="text-xs mb-2">
                {TOOLTIP_CONTENT.platformPerformance.formula}
              </p>
              <p className="text-xs font-semibold">Tiers:</p>
              <p className="text-xs">
                • High: {TOOLTIP_CONTENT.platformPerformance.tiers.high}
              </p>
              <p className="text-xs">
                • Medium: {TOOLTIP_CONTENT.platformPerformance.tiers.medium}
              </p>
              <p className="text-xs">
                • Low: {TOOLTIP_CONTENT.platformPerformance.tiers.low}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Card className="w-full max-w-full">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
              Platform-wise Brand Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            <div className="w-full overflow-x-auto -mx-3 px-3">
              <Table className="min-w-[500px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-[10px] sm:text-xs lg:text-sm">
                      Platform
                    </TableHead>
                    {brandNames.map((brand, i) => {
                      const isYourBrand = i === brandNames.length - 1;
                      const logoInfo = brandLogos?.find(l => l.brand === brand);
                      return (
                        <TableHead
                          key={i}
                          className={`text-center font-bold text-[10px] sm:text-xs lg:text-sm ${
                            isYourBrand ? "bg-primary/5 text-primary" : ""
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {logoInfo?.logo && (
                              <img 
                                src={logoInfo.logo} 
                                alt={`${brand} logo`}
                                className="h-4 w-4 rounded object-contain bg-white"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <span>{brand}</span>
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentImpact.rows.map((row, rowIndex) => {
                    const sourceName = row[0] as string;

                    // Find the highest mention count in this row across all brands
                    // Row structure: [Source, BrandA_Tier, BrandA_Mentions, BrandA_Score, BrandB_Tier, BrandB_Mentions, BrandB_Score, ..., CitedByLLMs, pages_used]
                    // Each brand has 3 values in the row (tier string, mentions count, mention score string)
                    const mentionCounts: number[] = [];
                    for (let i = 0; i < brandNames.length; i++) {
                      mentionCounts.push(safeNumber(row[2 + i * 3], 0));
                    }
                    const maxMentions = Math.max(...mentionCounts);

                    return (
                      <TableRow key={rowIndex}>
                        <TableCell className="font-semibold text-xs sm:text-sm lg:text-base px-2 py-1.5 lg:px-4">
                          {sourceName}
                        </TableCell>
                        {brandNames.map((brand, index) => {
                          // Each brand has 3 values: tier string, mentions count, mention score string
                          const mentions = safeNumber(row[2 + index * 3], 0);

                          // Calculate mention ratio using centralized formula
                          const mentionRatio = calculateMentionRatio(mentions, maxMentions);

                          // Get tier based on ratio using centralized formula
                          const tier = getTierFromRatio(mentionRatio);

                          // check if this brand column is "your brand"
                          const isYourBrand = index === brandNames.length - 1;

                          return (
                            <TableCell
                              key={index}
                              className={`text-center px-2 py-1.5 lg:px-4 ${
                                isYourBrand ? "bg-primary/5" : ""
                              }`}
                            >
                              <div className="space-y-1">
                                <div
                                  className={`font-semibold text-xs sm:text-sm ${
                                    isYourBrand ? "text-primary font-bold" : ""
                                  }`}
                                >
                                  Mentions: {mentions}
                                </div>
                                <Badge className={`${getTierColor(tier)} text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1`}>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
