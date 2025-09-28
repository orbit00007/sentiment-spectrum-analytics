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
import { Trophy, Star, Target } from "lucide-react";

interface CompetitorAnalysisProps {
  analysis: {
    dimensions?: Array<{
      dimension: string;
      top_3_competitors: string[];
      our_brand_position: { Value: number };
      our_brand_sentiment: string;
      evidence_snippet: string;
    }>;
    table_1_by_dimension?: Array<{
      dimension: string;
      top_5_competitors: Array<{
        brand: string;
        visibility_count: { Value: number };
      }>;
      our_brand_position: { Value: number };
      our_brand_visibility_count: { Value: number };
    }>;
    table_2_brand_profiles?: Array<{
      brand_name: string;
      ai_description: string;
      ai_sentiment: string;
      sources: string[];
      evidence_snippets: string[];
    }>;
  };
}

const getSentimentColor = (sentiment: string) => {
  switch (sentiment.toLowerCase()) {
    case "positive":
      return "bg-success text-success-foreground";
    case "negative":
      return "bg-destructive text-destructive-foreground";
    case "neutral":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const getCardBorderColor = (level?: string) => {
  const levelLower = (level || "").toLowerCase();
  switch (levelLower) {
    case "high":
    case "positive":
      return "border-success shadow-success/20 shadow-lg";
    case "medium":
    case "neutral":
      return "border-warning shadow-warning/20 shadow-lg";
    case "low":
    case "negative":
      return "border-destructive shadow-destructive/20 shadow-lg";
    default:
      return "border-gray-200";
  }
};

const getPositionIcon = (position: number) => {
  if (position <= 2) return <Trophy className="h-4 w-4" />;
  if (position <= 5) return <Star className="h-4 w-4" />;
  else return <Target className="h-4 w-4" />;
};

export const CompetitorAnalysis = ({ analysis }: CompetitorAnalysisProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        Competitor Analysis
      </h2>

      {/* Dimensions Overview */}
      {analysis.dimensions && analysis.dimensions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysis.dimensions.map((dimension, index) => (
          <Card
            key={index}
            className={getCardBorderColor(dimension.our_brand_sentiment)}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {getPositionIcon(dimension.our_brand_position.Value)}
                {dimension.dimension}
              </CardTitle>
              <div className="mt-2 space-y-1">
                <div className="text-sm text-foreground flex items-center gap-2">
                  Your Brand Position:{" "}
                  <span className="font-semibold flex items-center gap-1">
                    {getPositionIcon(dimension.our_brand_position.Value)}
                    {dimension.our_brand_position.Value}
                  </span>
                </div>
                <Badge
                  className={getSentimentColor(dimension.our_brand_sentiment)}
                  variant="secondary"
                >
                  {dimension.our_brand_sentiment}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Top Competitors</h4>
                <div className="flex flex-wrap gap-1">
                  {dimension.top_3_competitors.map((competitor, compIndex) => (
                    <Badge key={compIndex} variant="outline">
                      {competitor}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground italic">
                  "{dimension.evidence_snippet}"
                </p>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Competitive Rankings by Dimension */}
      {analysis.table_1_by_dimension && analysis.table_1_by_dimension.length > 0 && (
        <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Competitive Rankings by Dimension
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dimension</TableHead>
                <TableHead className="text-center">Rank 1</TableHead>
                <TableHead className="text-center">Rank 2</TableHead>
                <TableHead className="text-center">Rank 3</TableHead>
                <TableHead className="text-center">Your Brand</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.table_1_by_dimension.map((table, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {table.dimension}
                  </TableCell>
                  {[0, 1, 2].map((rankIndex) => (
                    <TableCell key={rankIndex}>
                      {table.top_5_competitors[rankIndex] ? (
                        <div className="text-center">
                          <div className="font-semibold flex items-center justify-center gap-1">
                            {getPositionIcon(rankIndex + 1)}
                            {table.top_5_competitors[rankIndex].brand}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Visibility Score:{" "}
                            {
                              table.top_5_competitors[rankIndex]
                                .visibility_count.Value
                            }
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
                    <div className="text-center bg-primary/5 rounded p-2">
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1 w-fit mx-auto"
                      >
                        {getPositionIcon(table.our_brand_position.Value)}
                        Position : {table.our_brand_position.Value}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Visibility Score:{" "}
                        {table.our_brand_visibility_count.Value}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        </Card>
      )}

      {/* Brand Profiles */}
      {analysis.table_2_brand_profiles && analysis.table_2_brand_profiles.length > 0 && (
        <Card>
        <CardHeader>
          <CardTitle className="text-lg">Competitor Brand Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.table_2_brand_profiles.map((brand, index) => (
              <Card
                key={index}
                className={`border-2 ${getCardBorderColor(brand.ai_sentiment)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {brand.brand_name}
                    </CardTitle>
                    <Badge
                      className={getSentimentColor(brand.ai_sentiment)}
                      variant="secondary"
                    >
                      {brand.ai_sentiment}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {brand.ai_description}
                  </p>

                  <div>
                    <h5 className="font-semibold text-xs mb-2">Key Sources</h5>
                    <div className="flex flex-wrap gap-1">
                      {brand.sources.map((source, sourceIndex) => (
                        <Badge
                          key={sourceIndex}
                          variant="outline"
                          className="text-xs"
                        >
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-xs mb-2">
                      Evidence Highlights
                    </h5>
                    <ul className="space-y-1">
                      {brand.evidence_snippets.map((snippet, snippetIndex) => (
                        <li
                          key={snippetIndex}
                          className="text-xs text-muted-foreground"
                        >
                          • {snippet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        </Card>
      )}
    </div>
  );
};
