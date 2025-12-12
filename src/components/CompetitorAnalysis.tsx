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
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TOOLTIP_CONTENT, getSentimentColor } from "@/lib/formulas";

interface BrandLogo {
  brand: string;
  logo: string;
}

interface CompetitorAnalysisProps {
  brandName: string;
  brandLogos?: BrandLogo[];
  analysis: {
    competitor_visibility_table?: {
      header: string[];
      rows: Array<Array<string | number>>;
    };
    competitor_sentiment_table?: {
      header: string[];
      rows: Array<Array<string>>;
    };
  };
}

const BrandWithLogo = ({ brandName, logos }: { brandName: string; logos?: BrandLogo[] }) => {
  const logoInfo = logos?.find(l => l.brand === brandName);
  return (
    <div className="flex items-center gap-2">
      {logoInfo?.logo && (
        <img 
          src={logoInfo.logo} 
          alt={`${brandName} logo`}
          className="h-5 w-5 rounded object-contain bg-white"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      <span>{brandName}</span>
    </div>
  );
};

export const CompetitorAnalysis = ({
  brandName,
  brandLogos,
  analysis,
}: CompetitorAnalysisProps) => {
  if (
    !analysis.competitor_visibility_table &&
    !analysis.competitor_sentiment_table
  ) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
            Competitor Analysis
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-sm">
                {TOOLTIP_CONTENT.competitorAnalysis.description}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Competitor Mentions by Keyword */}
        {analysis.competitor_visibility_table && (
          <Card className="w-full max-w-full">
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
                Competitor Mentions by Keyword
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      {TOOLTIP_CONTENT.competitorAnalysis.visibilityTable}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              <div className="w-full overflow-x-auto -mx-3 px-3">
                <Table className="table-fixed min-w-[500px] w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-normal break-words font-semibold text-[10px] sm:text-xs lg:text-sm">
                        Brand's
                      </TableHead>
                      {analysis.competitor_visibility_table.header
                        .filter((header) => header !== "brand_names")
                        .map((header, index) => (
                          <TableHead
                            key={index}
                            className="whitespace-normal break-words font-semibold text-center text-[10px] sm:text-xs lg:text-sm"
                          >
                            {header}
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.competitor_visibility_table.rows.map(
                      (row, rowIndex) => {
                        const isYourBrand = row[0] === brandName;
                        return (
                          <TableRow
                            key={rowIndex}
                            className={
                              isYourBrand
                                ? "bg-primary/5 border-l-4 border-primary"
                                : ""
                            }
                          >
                            <TableCell
                              className={`whitespace-normal break-words font-medium text-xs sm:text-sm lg:text-base px-2 py-1.5 lg:px-4 ${
                                isYourBrand ? "text-primary font-bold" : ""
                              }`}
                            >
                              <BrandWithLogo brandName={row[0] as string} logos={brandLogos} />
                            </TableCell>
                            {row.slice(1).map((cell, cellIndex) => (
                              <TableCell
                                key={cellIndex}
                                className="text-center whitespace-normal break-words text-xs sm:text-sm lg:text-base px-2 py-1.5 lg:px-4"
                              >
                                <span
                                  className={
                                    isYourBrand
                                      ? "font-semibold text-primary"
                                      : ""
                                  }
                                >
                                  {cell}
                                </span>
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Competitor Sentiment Analysis */}
        {analysis.competitor_sentiment_table && (
          <Card className="w-full max-w-full">
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2">
                Competitor Sentiment Analysis
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      {TOOLTIP_CONTENT.competitorAnalysis.sentimentTable}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              <div className="w-full overflow-x-auto -mx-3 px-3">
                <Table className="table-fixed min-w-[400px] w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[15%] min-w-[100px] font-bold text-[10px] sm:text-xs lg:text-sm">
                        Brand
                      </TableHead>
                      <TableHead className="w-[65%] min-w-[200px] font-bold text-[10px] sm:text-xs lg:text-sm">
                        Sentiment Summary
                      </TableHead>
                      <TableHead className="w-[20%] min-w-[100px] text-center font-bold text-[10px] sm:text-xs lg:text-sm">
                        Overall Outlook
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.competitor_sentiment_table.rows.map(
                      (row, rowIndex) => {
                        const isYourBrand = row[0] === brandName;
                        return (
                          <TableRow
                            key={rowIndex}
                            className={
                              isYourBrand
                                ? "bg-primary/5 border-l-4 border-primary"
                                : ""
                            }
                          >
                            <TableCell
                              className={`font-semibold w-[15%] whitespace-normal break-words text-xs sm:text-sm lg:text-base px-2 py-1.5 lg:px-4 ${
                                isYourBrand ? "text-primary font-bold" : ""
                              }`}
                            >
                              <BrandWithLogo brandName={row[0] as string} logos={brandLogos} />
                            </TableCell>
                            <TableCell
                              className={`font-semibold w-[65%] whitespace-normal break-words text-xs sm:text-sm lg:text-base px-2 py-1.5 lg:px-4 ${
                                isYourBrand ? "text-primary font-bold" : ""
                              }`}
                            >
                              {row[1]}
                            </TableCell>
                            <TableCell className="text-center w-[20%] px-2 py-1.5 lg:px-4">
                              <Badge className={`${getSentimentColor(row[2])} text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1`}>
                                {row[2]}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};
