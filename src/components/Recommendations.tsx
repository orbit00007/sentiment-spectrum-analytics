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
import { Lightbulb, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TOOLTIP_CONTENT, getEffortColor, getImpactColor } from "@/lib/formulas";

interface RecommendationsProps {
  recommendations: Array<{
    overall_insight: string;
    suggested_action: string;
    overall_effort: string;
    impact: string;
  }>;
}

export const Recommendations = ({ recommendations }: RecommendationsProps) => {
  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-primary" />
            Strategic Recommendations
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <div className="text-sm space-y-1">
                <p className="mb-2">{TOOLTIP_CONTENT.recommendations.description}</p>
                <p>
                  <span className="font-semibold">Overall Insight:</span> {TOOLTIP_CONTENT.recommendations.overallInsight}
                </p>
                <p>
                  <span className="font-semibold">Suggested Action:</span> {TOOLTIP_CONTENT.recommendations.suggestedAction}
                </p>
                <p>
                  <span className="font-semibold">Effort:</span> {TOOLTIP_CONTENT.recommendations.effort}
                </p>
                <p>
                  <span className="font-semibold">Impact:</span> {TOOLTIP_CONTENT.recommendations.impact}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* TRIPLE WRAPPER for maximum break prevention */}
        <div
          style={{
            pageBreakInside: "avoid",
            breakInside: "avoid",
            display: "block",
          }}
        >
          <Card className="w-full max-w-full" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-sm sm:text-base lg:text-lg">Actionable Insights</CardTitle>
            </CardHeader>
            <CardContent
              className="p-3 md:p-4"
              style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
            >
              <div style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                <div className="w-full overflow-x-auto -mx-3 px-3">
                  <Table
                    className="table-fixed min-w-[600px] w-full"
                    style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                  >
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3 whitespace-normal break-words text-[10px] sm:text-xs lg:text-sm">
                          Overall Insight
                        </TableHead>
                        <TableHead className="w-1/3 whitespace-normal break-words text-[10px] sm:text-xs lg:text-sm">
                          Suggested Action
                        </TableHead>
                        <TableHead className="w-1/6 text-center text-[10px] sm:text-xs lg:text-sm">
                          Effort
                        </TableHead>
                        <TableHead className="w-1/6 text-center text-[10px] sm:text-xs lg:text-sm">
                          Impact
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {recommendations.map((rec, index) => (
                        <TableRow
                          key={index}
                          style={{
                            pageBreakInside: "avoid",
                            breakInside: "avoid",
                          }}
                        >
                          <TableCell className="whitespace-normal break-words text-xs sm:text-sm lg:text-base px-2 py-2 lg:px-4">
                            {rec.overall_insight}
                          </TableCell>
                          <TableCell className="whitespace-normal break-words text-xs sm:text-sm lg:text-base px-2 py-2 lg:px-4">
                            {rec.suggested_action}
                          </TableCell>
                          <TableCell className="text-center px-2 py-2 lg:px-4">
                            <Badge className={`${getEffortColor(rec.overall_effort)} text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1`}>
                              {rec.overall_effort}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center px-2 py-2 lg:px-4">
                            <Badge className={`${getImpactColor(rec.impact)} text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1`}>
                              {rec.impact}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};
