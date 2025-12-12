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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Info } from "lucide-react";
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
  getBarColor,
  safeNumber
} from "@/lib/formulas";

interface SourceAnalysisProps {
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
  brandName: string;
}

export const SourceAnalysis = ({
  contentImpact,
  brandName,
}: SourceAnalysisProps) => {
  // Extract brand names from header (every 3rd item starting at index 1)
  // Header structure: [Sources, BrandA, BrandA Mentions, BrandA Mention Score, BrandB, ...]
  const brandNames: string[] = [];
  for (let i = 1; i < contentImpact.header.length - 2; i += 3) {
    brandNames.push(contentImpact.header[i] as string);
  }

  // Find the index of brandName in the extracted brand names array
  const brandIndex = brandNames.findIndex((b) => b === brandName);

  const sources = contentImpact.rows.map((row) => {
    const sourceName = row[0] as string;
    
    // Row structure: [Source, BrandA_Tier, BrandA_Mentions, BrandA_Score, BrandB_Tier, BrandB_Mentions, BrandB_Score, ..., CitedByLLMs, pages_used]
    // Each brand has 3 values in the row (Tier string, Mentions count, Mention Score string)
    const mentions = brandIndex >= 0 ? safeNumber(row[2 + brandIndex * 3], 0) : 0;

    // Get all mention counts for max calculation (mentions are at index 2 + i*3)
    const mentionCounts: number[] = brandNames.map((_, i) =>
      safeNumber(row[2 + i * 3], 0)
    );
    const maxMentions = Math.max(...mentionCounts);

    const mentionRatio = calculateMentionRatio(mentions, maxMentions);
    const tier = getTierFromRatio(mentionRatio);
    const depthNote = contentImpact.depth_notes?.[brandName]?.[sourceName];

    const shortCategory = sourceName.split(/[\s\\/]+/).join("\n");

    return {
      category: sourceName,
      shortCategory,
      mentions,
      mentionRatio,
      score: tier,
      insight: depthNote?.insight || "",
      pages_used: depthNote?.pages_used || [],
    };
  });

  const chartData = sources.map((source) => ({
    category: source.shortCategory,
    citations: source.mentions,
    visibility: source.score,
  }));

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
            Source Analysis
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-sm mb-2">
                {TOOLTIP_CONTENT.sourceAnalysis.description}
              </p>
              <p className="text-xs">
                {TOOLTIP_CONTENT.sourceAnalysis.calculation}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Chart - Wrapped to prevent breaks */}
        <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <Card className="w-full max-w-full">
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-sm sm:text-base lg:text-lg">
                Citation Distribution by Source Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ bottom: 40, top: 10, left: 0, right: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={8}
                    interval={0}
                    tick={({ x, y, payload }) => (
                      <g transform={`translate(${x},${y + 5})`}>
                        {payload.value.split("\n").map((line: string, index: number) => (
                          <text
                            key={index}
                            x={0}
                            y={index * 9}
                            textAnchor="middle"
                            fontSize={8}
                            fill="hsl(var(--foreground))"
                            fontWeight="500"
                          >
                            {line}
                          </text>
                        ))}
                      </g>
                    )}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} />
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="citations" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={getBarColor(entry.visibility)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table - Wrapped to prevent breaks */}
        <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <Card className="w-full max-w-full">
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-sm sm:text-base lg:text-lg">
                Source Details for{" "}
                <span className="font-bold text-primary">{brandName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              <div className="w-full overflow-x-auto -mx-3 px-3">
                <Table className="table-fixed min-w-[600px] w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold w-1/5 text-[10px] sm:text-xs lg:text-sm">Source</TableHead>
                      <TableHead className="text-center font-semibold w-1/10 text-[10px] sm:text-xs lg:text-sm">Mentions</TableHead>
                      <TableHead className="text-center font-semibold w-1/10 text-[10px] sm:text-xs lg:text-sm">Tier</TableHead>
                      <TableHead className="font-semibold w-1/3 text-[10px] sm:text-xs lg:text-sm">Insights</TableHead>
                      <TableHead className="font-semibold w-1/5 text-[10px] sm:text-xs lg:text-sm">Pages Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sources.map((source, index) => (
                      <TableRow key={index} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                        <TableCell className="font-medium break-words whitespace-normal w-1/5 text-xs sm:text-sm lg:text-base px-2 py-1.5 lg:px-4">
                          {source.shortCategory}
                        </TableCell>
                        <TableCell className="text-center font-semibold break-words whitespace-pre-line w-1/10 text-xs sm:text-sm lg:text-base px-2 py-1.5 lg:px-4">
                          {source.mentions}
                        </TableCell>
                        <TableCell className="text-center break-words whitespace-pre-line w-1/10 px-2 py-1.5 lg:px-4">
                          <Badge
                            className={`${getTierColor(source.score)} text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1`}
                            variant="secondary"
                          >
                            {source.score}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground break-words whitespace-pre-line w-1/3 px-2 py-1.5 lg:px-4">
                          {source.insight || "No insights available"}
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-xs text-muted-foreground break-words whitespace-pre-line w-1/5 px-2 py-1.5 lg:px-4">
                          {Array.isArray(source.pages_used) && source.pages_used.length > 0 &&
                          !source.pages_used.includes("Absent") ? (
                            <ul className="space-y-1 pl-0">
                              {source.pages_used.map((page, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span className="flex-1">{page}</span>
                                </li>
                              ))}
                            </ul>
                          ) : Array.isArray(source.pages_used) && source.pages_used.includes("Absent") ? (
                            "~ No pages found"
                          ) : (
                            "~ No pages found"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};
