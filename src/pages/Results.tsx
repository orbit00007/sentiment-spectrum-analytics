// src/pages/Results.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
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
import { toast } from "sonner";
import { getProductAnalytics } from "@/apiHelpers";

interface InputStateAny {
  product?: { id: string; name?: string; website?: string };
  id?: string;
  productId?: string;
  website?: string;
  search_keywords?: Array<{ id?: string; keyword: string }>;
  keywords?: string[];
  analytics?: any;
}

interface InsightCard {
  title: string;
  value: string;
  trend?: "up" | "down" | "stable" | "unknown" | "emerging" | "consistent" | "increasing" | "maintained";
  description?: string;
}

interface RecommendedAction {
  category: string;
  priority?: string;
  action?: string;
  impact?: string;
  effort?: string;
}

// New interface for the API response structure
interface AnalyticsResponse {
  analytics: AnalyticsData[];
  count: number;
  limit: number;
  product_id: string;
}

// Updated AnalyticsData interface
interface AnalyticsData {
  id?: string;
  product_id?: string;
  product_name?: string;
  date?: string;
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

export default function Results() {
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [analyticsResponse, setAnalyticsResponse] = useState<AnalyticsResponse | null>(null);
  const [currentAnalytics, setCurrentAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { user } = useAuth();
  const accessToken = localStorage.getItem("access_token") || "";
  const navigate = useNavigate();
  const location = useLocation();
  const pollingRef = useRef<{ productTimer?: number }>({});
  const mountedRef = useRef(true);

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

    // default fallback
    return `${baseClasses} text-gray-700 bg-gray-100 border-gray-300`;
  };

  const getTrendIcon = (trend?: string) => {
    const trendLower = (trend || "").toLowerCase();
    switch (trendLower) {
      case "up":
      case "increasing":
      case "emerging":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "stable":
      case "consistent":
      case "maintained":
        return <Minus className="w-4 h-4 text-blue-500" />;
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

  const getCleanDomainName = (url?: string) => {
    if (!url) return "";
    try {
      // Remove protocol if present
      const cleanUrl = url.replace(/^https?:\/\//, "");
      // Remove www. if present
      const withoutWww = cleanUrl.replace(/^www\./, "");
      // Remove trailing slash and any path
      const domain = withoutWww.split('/')[0];
      return domain;
    } catch {
      return url;
    }
  };

  // Parse and normalize location.state
  useEffect(() => {
    mountedRef.current = true;
    const state = (location.state || {}) as InputStateAny;

    if (state && state.product?.id) {
      const normalized: ResultsData = {
        website:
          (state.website ||
            state.product.website ||
            state.product.name ||
            "") + "",
        product: {
          id: state.product.id,
          name: state.product.name || state.product.website || state.product.id,
        },
        search_keywords: (state.search_keywords || []).map((k) => ({
          id: k.id,
          keyword: k.keyword,
        })),
      };
      setResultsData(normalized);
    } else if ((state as any).productId || (state as any).id) {
      const pid = (state as any).productId || (state as any).id;
      const normalized: ResultsData = {
        website: state.website || "",
        product: { id: pid.toString(), name: state.website || pid.toString() },
        search_keywords: Array.isArray(state.search_keywords)
          ? state.search_keywords.map((k) => ({ id: k.id, keyword: k.keyword }))
          : (state.keywords || []).map((k: string) => ({ keyword: k })),
      };
      setResultsData(normalized);
    } else {
      navigate("/input");
    }

    return () => {
      mountedRef.current = false;
    };
  }, [location.state, navigate]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (pollingRef.current.productTimer) {
        clearTimeout(pollingRef.current.productTimer);
      }
    };
  }, []);

  // Updated poll product analytics function
  const pollProductAnalytics = useCallback(
    async (productId: string) => {
      if (!productId || !accessToken || !mountedRef.current) return;
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split("T")[0];
        const res = await getProductAnalytics(productId, today, accessToken);
        if (!mountedRef.current) return;

        if (res) {
          setAnalyticsResponse(res);
          // Extract the first analytics item from the array
          if (res.analytics && res.analytics.length > 0) {
            setCurrentAnalytics(res.analytics[0]);
          }
        }

        // Check status from the first analytics item
        const status = res?.analytics?.[0]?.status?.toLowerCase() || "";
        if (status !== "completed") {
          if (pollingRef.current.productTimer) {
            clearTimeout(pollingRef.current.productTimer);
          }
          pollingRef.current.productTimer = window.setTimeout(() => {
            pollProductAnalytics(productId);
          }, 5000);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch analytics");
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    if (resultsData?.product?.id) {
      if (pollingRef.current.productTimer) {
        clearTimeout(pollingRef.current.productTimer);
      }
      pollProductAnalytics(resultsData.product.id);
    }
  }, [resultsData, pollProductAnalytics]);

  // Loading state
  if (isLoading || !resultsData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Analyzing...</h2>
              <p className="text-muted-foreground">
                Please wait while we prepare your results.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const overallStatus = currentAnalytics?.status || "pending";
  
  // Get the clean website name from either the current analytics or results data
  const websiteName = getCleanDomainName(
    currentAnalytics?.product_name || 
    resultsData.website || 
    resultsData.product.name
  );

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
                  {websiteName?.charAt(0)?.toUpperCase() || "C"}
                </div>
                <div>
                  <h1 className="font-semibold text-lg">
                    {websiteName || "Unknown Website"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Analysis completed on {formatDate(currentAnalytics?.updated_at || currentAnalytics?.date)}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Keywords analyzed:
                  </span>
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
          {/* <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/input")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div> */}

          {/* Show banner when analyzing */}
          {overallStatus !== "completed" && (
            <div className="mb-6 p-4 rounded-md bg-yellow-50 border border-yellow-200 text-sm">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 animate-spin text-muted-foreground" />
                <div>
                  <div className="font-semibold">Analysis in progress</div>
                  <div className="text-xs text-muted-foreground">
                    We are gathering and analyzing AI answers — this usually
                    takes a few seconds to a couple of minutes depending on
                    keywords and sources.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {currentAnalytics ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {(currentAnalytics.analytics?.insight_cards || []).length > 0 ? (
                  currentAnalytics.analytics!.insight_cards!.map((card, i) => (
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
                    {(currentAnalytics.analytics?.recommended_actions || [])
                      .length > 0 ? (
                      currentAnalytics.analytics!.recommended_actions!.map(
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
                        currentAnalytics.analytics?.drilldowns?.query_explorer ||
                        []
                      ).length > 0 ? (
                        currentAnalytics
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
                      {(currentAnalytics.analytics?.drilldowns?.sources_list || [])
                        .length > 0 ? (
                        currentAnalytics.analytics!.drilldowns!.sources_list!.map(
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
                      currentAnalytics.analytics?.drilldowns?.attributes_matrix ||
                      []
                    ).length > 0 ? (
                      currentAnalytics.analytics!.drilldowns!.attributes_matrix!.map(
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
              <p className="text-muted-foreground">No analytics data available</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}