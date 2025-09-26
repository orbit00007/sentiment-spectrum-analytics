import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Filter,
  Globe,
} from "lucide-react";

interface DrilldownsProps {
  data: {
    query_explorer: Array<{
      query_id: string;
      query: string;
      providers: string[];
      brand_present: boolean;
      top_answers: Array<{
        name: string;
        best_rank: number;
        description: string;
        price?: string;
        features?: string | string[];
        sources?: string[];
      }>;
      sources_count: number;
    }>;
    sources_detail: Array<{
      domain: string;
      count: number;
      percent: number;
      queries: string[];
    }>;
    attributes_matrix: {
      columns: string[];
      rows: Array<{
        attribute: string;
        values: boolean[];
      }>;
    };
  };
}

export const Drilldowns = ({ data }: DrilldownsProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [expandedSources, setExpandedSources] = useState<
    Record<string, boolean>
  >({});

  const toggleRowExpansion = (queryId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [queryId]: !prev[queryId],
    }));
  };

  const toggleSourceExpansion = (domain: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [domain]: !prev[domain],
    }));
  };

  const filteredQueries = data.query_explorer.filter((query) => {
    if (filter === "yes") return query.brand_present;
    if (filter === "no") return !query.brand_present;
    return true;
  });

  return (
    <Card className="card-gradient border-0">
      <CardHeader>
        <CardTitle className="text-xl">Evidence & Transparency</CardTitle>
        <CardDescription>
          Detailed analysis and supporting data for all insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="queries" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger
              value="queries"
              className="text-xs sm:text-sm px-2 py-2"
            >
              <span className="hidden sm:inline">Query Explorer</span>
              <span className="sm:hidden">Queries</span>
            </TabsTrigger>
            <TabsTrigger
              value="sources"
              className="text-xs sm:text-sm px-2 py-2"
            >
              <span className="hidden sm:inline">Sources Detail</span>
              <span className="sm:hidden">Sources</span>
            </TabsTrigger>
            <TabsTrigger
              value="attributes"
              className="text-xs sm:text-sm px-2 py-2"
            >
              <span className="hidden sm:inline">Attributes Matrix</span>
              <span className="sm:hidden">Matrix</span>
            </TabsTrigger>
          </TabsList>
          {/* Query Explorer Tab */}
          <TabsContent value="queries" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="font-semibold">Query Analysis</h4>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    Filter:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className="text-xs px-2 py-1"
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === "yes" ? "success" : "outline"}
                    size="sm"
                    onClick={() => setFilter("yes")}
                    className="text-xs px-2 py-1"
                  >
                    <span className="hidden sm:inline">Brand Present</span>
                    <span className="sm:hidden">Present</span>
                  </Button>
                  <Button
                    variant={filter === "no" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setFilter("no")}
                    className="text-xs px-2 py-1"
                  >
                    <span className="hidden sm:inline">Not Present</span>
                    <span className="sm:hidden">Not Present</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {filteredQueries.map((query) => (
                <div key={query.query_id} className="border rounded-lg">
                  <div
                    className="p-4 hover:bg-accent cursor-pointer transition-smooth"
                    onClick={() => toggleRowExpansion(query.query_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{query.query}</span>
                          {query.brand_present ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                          <div className="flex flex-wrap gap-1">
                            {query.providers.map((provider, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {provider}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {query.sources_count} sources
                          </span>
                        </div>
                      </div>
                      {expandedRows[query.query_id] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {expandedRows[query.query_id] && (
                    <div className="px-4 pb-4 border-t bg-muted/20">
                      <div className="space-y-3 pt-3">
                        {query.top_answers.map((answer, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded border bg-background"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">
                                    #{answer.best_rank}
                                  </Badge>
                                  <span className="font-medium">
                                    {answer.name}
                                  </span>
                                  {answer.price && (
                                    <Badge variant="secondary">
                                      {answer.price}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                                  {answer.description}
                                </p>
                                {answer.features && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {(Array.isArray(answer.features)
                                        ? answer.features
                                        : [answer.features]
                                      )
                                        .slice(0, 5)
                                        .map((feature, featureIdx) => (
                                          <Badge
                                            key={featureIdx}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {feature}
                                          </Badge>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            {answer.sources && answer.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="flex items-center space-x-2">
                                  <Globe className="w-3 h-3 text-muted-foreground" />
                                  <div className="flex flex-wrap gap-1">
                                    {answer.sources
                                      .slice(0, 3)
                                      .map((source, sourceIdx) => (
                                        <Badge
                                          key={sourceIdx}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {source}
                                        </Badge>
                                      ))}
                                    {answer.sources.length > 3 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        +{answer.sources.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredQueries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Select a query to see details.
                </div>
              )}
            </div>
          </TabsContent>
          {/* Sources Detail Tab */}
          <TabsContent value="sources" className="space-y-4">
            <h4 className="font-semibold">Source Influence Rankings</h4>
            <div className="space-y-2">
              {data.sources_detail.map((source, index) => (
                <Collapsible
                  key={index}
                  open={expandedSources[source.domain]}
                  onOpenChange={() => toggleSourceExpansion(source.domain)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 border rounded hover:bg-accent transition-smooth">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{source.domain}</span>
                        <Badge variant="outline">{source.count}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {source.percent}%
                        </span>
                      </div>
                      {expandedSources[source.domain] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-3 pb-3">
                      <Separator className="mb-3" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Appears in these queries:
                        </p>
                        {source.queries.map((query, queryIdx) => (
                          <p
                            key={queryIdx}
                            className="text-sm pl-2 border-l-2 border-muted"
                          >
                            {query}
                          </p>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </TabsContent>

          {/* Attributes Matrix Tab */}
          <TabsContent value="attributes" className="w-full space-y-4">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h4 className="font-semibold">Attributes Comparison</h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-xs sm:text-sm">
                      Attribute cited for brand
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="text-xs sm:text-sm">Not cited</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div
                  className="w-full border rounded-lg"
                  style={{ minWidth: "fit-content" }}
                >
                  {/* Header Row */}
                  <div
                    className="grid border-b bg-muted/50"
                    style={{
                      gridTemplateColumns: `minmax(140px, 2fr) repeat(${data.attributes_matrix.columns.length}, minmax(70px, 1fr))`,
                    }}
                  >
                    <div className="p-2 sm:p-3 font-medium text-xs sm:text-sm border-r">
                      Attribute
                    </div>
                    {data.attributes_matrix.columns.map((column, idx) => (
                      <div
                        key={idx}
                        className="p-1 sm:p-2 text-center font-medium border-r last:border-r-0 text-xs sm:text-sm"
                      >
                        <span
                          className="block whitespace-nowrap"
                          title={column}
                        >
                          {column}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Data Rows */}
                  {data.attributes_matrix.rows.map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="grid border-b hover:bg-accent/30 last:border-b-0"
                      style={{
                        gridTemplateColumns: `minmax(140px, 2fr) repeat(${data.attributes_matrix.columns.length}, minmax(70px, 1fr))`,
                      }}
                    >
                      <div className="p-2 sm:p-3 text-xs sm:text-sm border-r">
                        <span className="block" title={row.attribute}>
                          {row.attribute}
                        </span>
                      </div>
                      {row.values.map((value, colIdx) => (
                        <div
                          key={colIdx}
                          className="p-1 sm:p-2 text-center border-r last:border-r-0 flex items-center justify-center"
                        >
                          {value ? (
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                          ) : (
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-destructive flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
