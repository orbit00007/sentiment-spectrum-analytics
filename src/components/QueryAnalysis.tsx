import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Target, Quote } from "lucide-react";

interface QueryAnalysisProps {
  rawOutputs: Array<{
    query: string;
    snippet: string;
    mention_positions: Array<{
      brand: string;
      first_position_index: { Value: number };
    }>;
    sources_mentioned: string[];
  }>;
}

export const QueryAnalysis = ({ rawOutputs }: QueryAnalysisProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Search className="h-7 w-7 text-primary" />
        Query Analysis & Performance
      </h2>
      
      <div className="grid grid-cols-1 gap-6">
        {rawOutputs.map((output, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Query {index + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 text-foreground">Search Query</h4>
                <p className="text-sm text-muted-foreground font-medium bg-muted/50 p-3 rounded-lg">
                  "{output.query}"
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Quote className="h-4 w-4 text-primary" />
                  AI Response Snippet
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed bg-primary/5 p-3 rounded-lg">
                  {output.snippet}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Brand Mentions</h4>
                  <div className="space-y-2">
                    {output.mention_positions.map((mention, mentionIndex) => (
                      <div key={mentionIndex} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm font-medium">{mention.brand}</span>
                        <Badge variant="outline" className="text-xs">
                          Position #{mention.first_position_index.Value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Sources Referenced</h4>
                  <div className="flex flex-wrap gap-1">
                    {output.sources_mentioned.map((source, sourceIndex) => (
                      <Badge key={sourceIndex} variant="secondary" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};