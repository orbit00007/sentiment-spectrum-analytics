// src/pages/ExampleResults.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import exampleData from "@/data/mockInsights.json";

interface InsightCard {
  title: string;
  value: string;
  trend?: "up" | "down" | "stable" | "unknown";
  description?: string;
}

interface RecommendedAction {
  category: string;
  priority?: string;
  action?: string;
  impact?: string;
  effort?: string;
}

interface AnalyticsData {
  id?: string;
  type?: string;
  status?: string;
  analytics?: {
    insight_cards?: InsightCard[];
    recommended_actions?: RecommendedAction[];
    drilldowns?: {
      query_explorer?: any[];
      sources_list?: any[];
      attributes_matrix?: any[];
    };
    reason_missing?: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface ResultsData {
  website: string;
  product: { id: string; name?: string };
  search_keywords: Array<{ id?: string; keyword: string }>;
}

export default function ExampleResults() {
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const getColorClass = (
    text?: string,
    type: "priority" | "importance" = "priority"
  ) => {
    if (!text) return "";
    const lower = text.toLowerCase();

    const baseClasses = type === "priority" ? "font-semibold" : "font-medium";

    if (lower.includes("high"))
      return `${baseClasses} text-white bg-red-500 border-red-500`;
    if (lower.includes("medium"))
      return `${baseClasses} text-black bg-yellow-400 border-yellow-400`;
    if (lower.includes("low"))
      return `${baseClasses} text-white bg-green-600 border-green-500`;

    return `${baseClasses} text-gray-700 bg-gray-100 border-gray-300`;
  };

  const getTrendIcon = (trend?: string) => {
    switch ((trend || "").toLowerCase()) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatDate = (iso?: string) => {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Load example data on mount
  useEffect(() => {
    const loadExampleData = () => {
      setTimeout(() => {
        const mockData = exampleData as any;

        const exampleResultsData: ResultsData = {
          website: mockData.website || "example",
          product: {
            id: mockData.id || "example-search-123",
            name: mockData.product?.name || "Example Search",
          },
          search_keywords: [
            { id: "1", keyword: "example search" },
            { id: "2", keyword: "search engine" },
            { id: "3", keyword: "web search" },
          ],
        };

        const exampleAnalyticsData: AnalyticsData = {
          id: mockData.id || "example-analytics-123",
          type: mockData.type || "product_analytics",
          status: "completed",
          analytics: {
            insight_cards: mockData.analytics?.insight_cards || [],
            recommended_actions: mockData.analytics?.recommended_actions || [],
            drilldowns: {
              query_explorer: mockData.analytics?.drilldowns?.query_explorer || [],
              sources_list: mockData.analytics?.drilldowns?.sources_list || [],
              attributes_matrix: mockData.analytics?.drilldowns?.attributes_matrix || [],
            },
          },
          created_at: mockData.created_at || new Date().toISOString(),
          updated_at: mockData.updated_at || new Date().toISOString(),
        };

        setResultsData(exampleResultsData);
        setAnalyticsData(exampleAnalyticsData);
        setIsLoading(false);
      }, 1000);
    };

    loadExampleData();
  }, []);

  // Loading state
  if (isLoading || !resultsData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Loading Example...</h2>
              <p className="text-muted-foreground">
                Please wait while we prepare your example results.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const overallStatus = analyticsData?.status || "completed";

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              {/* Brand Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center text-white font-bold">
                  {resultsData.website?.charAt(0)?.toUpperCase() || "G"}
                </div>
                <div>
                  <h1 className="font-semibold text-lg">
                    {resultsData.website || resultsData.product.name}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Example analysis completed on {formatDate(analyticsData?.updated_at)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      DEMO
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Keywords analyzed:</span>
                  <span className="font-semibold">
                    {resultsData.search_keywords?.length ?? 0}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold">{overallStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/input")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>

          {/* Example banner */}
          <div className="mb-6 p-4 rounded-md bg-blue-50 border border-blue-200 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                !
              </div>
              <div>
                <div className="font-semibold text-blue-900">Example Results</div>
                <div className="text-xs text-blue-700">
                  This is a demonstration of our analysis capabilities using sample data. 
                  Start your own analysis to see real insights for your product.
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {analyticsData ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {(analyticsData.analytics?.insight_cards || []).length > 0 ? (
                  analyticsData.analytics!.insight_cards!.map((card, i) => (
                    <Card key={i} className="card-gradient border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                            <span className="text-sm font-medium">
                              {card.title}
                            </span>
                          </div>
                          {getTrendIcon(card.trend)}
                        </div>
                        <div className="text-lg font-semibold mb-2">
                          {card.value || "—"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {card.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No insight cards available
                  </p>
                )}
              </div>

              <Card className="card-gradient border-0 mb-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Recommended Actions
                  </h3>
                  <div className="space-y-4">
                    {(analyticsData.analytics?.recommended_actions || [])
                      .length > 0 ? (
                      analyticsData.analytics!.recommended_actions!.map(
                        (action, i) => (
                          <div key={i} className="p-4 rounded-lg bg-accent/50">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge
                                className={`${getColorClass(
                                  action.priority
                                )} border`}
                              >
                                {(action.priority || "").toUpperCase()}
                              </Badge>
                              <span className="font-semibold">
                                {action.category}
                              </span>
                              <Badge
                                variant="outline"
                                className={getColorClass(action.effort)}
                              >
                                {action.effort} effort
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{action.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {action.impact}
                            </p>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No recommended actions
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card className="card-gradient border-0">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Query Explorer</h3>
                    <div className="space-y-3">
                      {(
                        analyticsData.analytics?.drilldowns?.query_explorer ||
                        []
                      ).length > 0 ? (
                        analyticsData
                          .analytics!.drilldowns!.query_explorer!.slice(0, 8)
                          .map((q, idx) => (
                            <div
                              key={idx}
                              className="flex items-start space-x-2"
                            >
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                                {q.performance_score}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">{q.query}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getColorClass(
                                      q.search_volume
                                    )}`}
                                  >
                                    {q.search_volume}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getColorClass(
                                      q.competition
                                    )}`}
                                  >
                                    {q.competition}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No queries found
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-0">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Top Sources</h3>
                    <div className="space-y-3">
                      {(analyticsData.analytics?.drilldowns?.sources_list || [])
                        .length > 0 ? (
                        analyticsData.analytics!.drilldowns!.sources_list!.map(
                          (source, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {source.source}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {source.url}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  {source.frequency}
                                </Badge>
                                <div className="w-16 h-2 bg-muted rounded-full">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        (source.relevance_score / 10) * 100,
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No sources found
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Key Attributes</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {(
                      analyticsData.analytics?.drilldowns?.attributes_matrix ||
                      []
                    ).length > 0 ? (
                      analyticsData.analytics!.drilldowns!.attributes_matrix!.map(
                        (attr, i) => (
                          <div key={i} className="p-4 rounded-lg bg-accent/30">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{attr.attribute}</h4>
                              <Badge
                                className={getColorClass(
                                  attr.importance,
                                  "importance"
                                )}
                              >
                                {(attr.importance || "").toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {attr.value}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs">Frequency:</span>
                              <Badge variant="outline">{attr.frequency}</Badge>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No attributes found
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No example data available</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}