import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  Users,
  BarChart3,
  Target,
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

// New interface for the API response structure
interface AnalyticsResponse {
  analytics: AnalyticsData[];
  count: number;
  limit: number;
  product_id: string;
}

// Updated AnalyticsData interface to match new nested structure
interface AnalyticsData {
  id?: string;
  product_id?: string;
  product_name?: string;
  date?: string;
  status?: string;
  analytics?: {
    id?: string;
    type?: string;
    status?: string;
    brand_name?: string;
    brand_website?: string;
    analysis?: {
      overall_insights?: {
        ai_visibility?: {
          tier?: string;
          ai_visibility_score?: { Value: number };
          geo_score?: { Value: number };
          weighted_mentions_total?: { Value: number };
          distinct_queries_count?: { Value: number };
          calculation_breakdown?: Array<{
            query: string;
            weighted_points_for_brand: { Value: number };
            explanation: string;
          }>;
        };
        brand_mentions?: {
          level?: string;
          mentions_count?: { Value: number };
          total_sources_checked?: { Value: number };
        };
        dominant_sentiment?: {
          sentiment?: string;
          statement?: string;
        };
        summary?: string;
      };
      source_analysis?: Array<{
        category: string;
        sources: string[];
        total_citations: { Value: number };
        visibility: string;
        cited_by_models: string[];
        notes: string;
      }>;
      competitor_analysis?: {
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
      content_impact?: {
        [key: string]: {
          top_3_brands?: Array<{
            brand: string;
            position: { Value: number };
            visibility: { Value: number };
          }>;
          our_brand_position?: {
            brand: string;
            position: { Value: number };
            visibility: { Value: number };
          };
        };
      };
      recommendations?: Array<{
        category: string;
        action: string;
        timeframe: string;
        rationale: string;
        expected_impact: string;
        effort: string;
      }>;
    };
    raw_model_outputs_mapped?: Array<{
      query: string;
      snippet: string;
      mention_positions: Array<{
        brand: string;
        first_position_index: { Value: number };
      }>;
      sources_mentioned: string[];
    }>;
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
      return `${baseClasses} text-white bg-destructive border-destructive`;
    if (lower.includes("medium"))
      return `${baseClasses} text-background bg-warning border-warning`;
    if (lower.includes("low"))
      return `${baseClasses} text-white bg-success border-success`;

    return `${baseClasses} text-muted-foreground bg-muted border-muted`;
  };

  const getTierColor = (tier?: string) => {
    const tierLower = (tier || "").toLowerCase();
    switch (tierLower) {
      case "high":
        return "text-destructive bg-destructive/10 border-destructive/20";
      case "medium":
        return "text-warning bg-warning/10 border-warning/20";
      case "low":
        return "text-success bg-success/10 border-success/20";
      default:
        return "text-muted-foreground bg-muted/10 border-muted/20";
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    const sentimentLower = (sentiment || "").toLowerCase();
    switch (sentimentLower) {
      case "positive":
        return "text-success bg-success/10 border-success/20";
      case "negative":
        return "text-destructive bg-destructive/10 border-destructive/20";
      case "neutral":
      default:
        return "text-warning bg-warning/10 border-warning/20";
    }
  };

  const getEffortColor = (effort?: string) => {
    const effortLower = (effort || "").toLowerCase();
    switch (effortLower) {
      case "high":
        return "border-destructive/30";
      case "medium":
        return "border-warning/30";
      case "low":
        return "border-success/30";
      default:
        return "border-muted/30";
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
      const cleanUrl = url.replace(/^https?:\/\//, "");
      const withoutWww = cleanUrl.replace(/^www\./, "");
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

  // Poll product analytics function
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
          if (res.analytics && res.analytics.length > 0) {
            setCurrentAnalytics(res.analytics[0]);
          }
        }

        const status = res?.analytics?.[0]?.status?.toLowerCase() || "";
        if (status !== "completed") {
          if (pollingRef.current.productTimer) {
            clearTimeout(pollingRef.current.productTimer);
          }
          pollingRef.current.productTimer = window.setTimeout(() => {
            pollProductAnalytics(productId);
          }, 5000);
        } else {
          console.log("Brand analysis completed");
          setIsLoading(false);
        }
      } catch (err) {
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
  const analytics = currentAnalytics?.analytics;
  const overallInsights = analytics?.analysis?.overall_insights;
  const aiVisibility = overallInsights?.ai_visibility;
  const brandMentions = overallInsights?.brand_mentions;
  const dominantSentiment = overallInsights?.dominant_sentiment;
  
  const websiteName = getCleanDomainName(
    analytics?.brand_name || 
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center text-white font-bold">
                  {websiteName?.charAt(0)?.toUpperCase() || "C"}
                </div>
                <div>
                  <h1 className="font-semibold text-lg">
                    {analytics?.brand_name || websiteName || "Unknown Website"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Analysis completed on {formatDate(currentAnalytics?.updated_at || currentAnalytics?.date)}
                  </p>
                </div>
              </div>

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
          {/* Show banner when analyzing */}
          {overallStatus !== "completed" && (
            <div className="mb-6 p-4 rounded-md bg-warning/10 border border-warning/20 text-sm">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 animate-spin text-muted-foreground" />
                <div>
                  <div className="font-semibold">Analysis in progress</div>
                  <div className="text-xs text-muted-foreground">
                    We are gathering and analyzing AI answers — this usually takes a few seconds to a couple of minutes.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Section */}
          {overallInsights?.summary && (
            <div className="mb-6 animate-in fade-in-50 zoom-in-95 duration-300">
              <Card className="card-gradient border-0">
                <CardHeader>
                  <CardTitle className="text-xl">Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {overallInsights.summary}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Sentiment */}
          {dominantSentiment?.statement && (
            <div className="mb-6 animate-in fade-in-50 zoom-in-95 duration-300 delay-100">
              <Card className="card-gradient border-0">
                <CardHeader>
                  <CardTitle className="text-xl">AI Sentiment</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Overall Sentiment:</span>
                    <Badge className={getSentimentColor(dominantSentiment.sentiment)}>
                      {dominantSentiment.sentiment?.toUpperCase() || "NEUTRAL"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {dominantSentiment.statement}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Overall Insights */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {aiVisibility && (
              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">AI Visibility</span>
                    </div>
                     <Badge className={getTierColor(aiVisibility.tier)}>
                      {aiVisibility.tier?.toUpperCase() || "UNKNOWN"}
                    </Badge>
                  </div>
                  <div className="text-lg font-semibold mb-2">
                    {aiVisibility.ai_visibility_score?.Value || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Score: {aiVisibility.weighted_mentions_total?.Value || 0} × {aiVisibility.distinct_queries_count?.Value || 0}
                  </p>
                </CardContent>
              </Card>
            )}

            {brandMentions && (
              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Brand Mentions</span>
                    </div>
                     <Badge className={getTierColor(brandMentions.level)}>
                      {brandMentions.level?.toUpperCase() || "UNKNOWN"}
                    </Badge>
                  </div>
                  <div className="text-lg font-semibold mb-2">
                    {brandMentions.mentions_count?.Value || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {brandMentions.total_sources_checked?.Value || 0} sources
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="card-gradient border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Brand Name</span>
                  </div>
                </div>
                <div className="text-lg font-semibold mb-2">
                  {analytics?.brand_name || "Unknown"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Primary brand identity
                </p>
              </CardContent>
            </Card>

            <Card className="card-gradient border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Analysis Type</span>
                  </div>
                </div>
                <div className="text-lg font-semibold mb-2">
                  {analytics?.type?.replace('_', ' ')?.toUpperCase() || "Intelligence"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Report category
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Source Analysis */}
          {analytics?.analysis?.source_analysis && (
            <Card className="card-gradient border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Source Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {analytics.analysis.source_analysis.map((source, i) => (
                    <div key={i} className="p-4 rounded-lg bg-accent/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{source.category}</h4>
                        <Badge className={getTierColor(source.visibility)}>
                          {source.visibility?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {source.total_citations?.Value || 0} citations
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {source.sources?.slice(0, 3).join(", ")}
                        {source.sources?.length > 3 && ` +${source.sources.length - 3} more`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competitor Analysis */}
          {analytics?.analysis?.competitor_analysis?.dimensions && (
            <Card className="card-gradient border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Competitor Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.analysis.competitor_analysis.dimensions.map((dimension, i) => (
                    <div key={i} className="p-4 rounded-lg bg-accent/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{dimension.dimension}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            Position #{dimension.our_brand_position?.Value || "N/A"}
                          </Badge>
                          <Badge className={getSentimentColor(dimension.our_brand_sentiment)}>
                            {dimension.our_brand_sentiment?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Top competitors: {dimension.top_3_competitors?.join(", ")}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dimension.evidence_snippet}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analytics?.analysis?.recommendations && (
            <Card className="card-gradient border-0">
              <CardHeader>
                <CardTitle className="text-xl">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.analysis.recommendations.map((recommendation, i) => (
                    <div key={i} className={`p-4 rounded-lg bg-accent/30 border-l-4 ${getEffortColor(recommendation.effort)}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="font-semibold">
                          {recommendation.category}
                        </Badge>
                        <Badge className={getColorClass(recommendation.effort)} variant="outline">
                          {recommendation.effort} effort
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm font-medium mb-1">{recommendation.action}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          <span className="font-medium">Timeline:</span> {recommendation.timeframe}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><span className="font-medium">Rationale:</span> {recommendation.rationale}</p>
                        <p><span className="font-medium">Expected Impact:</span> {recommendation.expected_impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}