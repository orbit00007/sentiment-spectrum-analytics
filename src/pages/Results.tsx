import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/Layout";
import { BrandHeader } from "@/components/BrandHeader";
import { OverallInsights } from "@/components/OverallInsights";
import { SourceAnalysis } from "@/components/SourceAnalysis";
import { CompetitorAnalysis } from "@/components/CompetitorAnalysis";
import { ContentImpact } from "@/components/ContentImpact";
import { Recommendations } from "@/components/Recommendations";
import { QueryAnalysis } from "@/components/QueryAnalysis";
import { Search } from "lucide-react";
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

// Updated interface for the API response structure
interface AnalyticsResponse {
  analytics: AnalyticsData[];
  count: number;
  limit: number;
  product_id: string;
}

// Updated AnalyticsData interface to match the provided JSON structure
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
    model_reported?: {
      model_name?: string;
      model_version?: string;
      report_generated_at?: string;
    };
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
    visual_guidance?: {
      scorecard_note?: string;
      competitor_table_note?: string;
      source_chart_note?: string;
    };
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const accessToken = localStorage.getItem("access_token") || "";
  const navigate = useNavigate();
  const location = useLocation();
  const pollingRef = useRef<{ productTimer?: number; hasShownStartMessage?: boolean }>({});
  const mountedRef = useRef(true);

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
        const today = new Date().toISOString().split("T")[0];
        const res = await getProductAnalytics(productId, today, accessToken);
        
        if (!mountedRef.current) return;

        if (res && res.analytics && Array.isArray(res.analytics)) {
          setAnalyticsResponse(res);
          
          // Find the most recent completed analysis or the first one
          const completedAnalysis = res.analytics.find(item => 
            item.status?.toLowerCase() === "completed"
          );
          const analysisToUse = completedAnalysis || res.analytics[0];
          
          if (analysisToUse) {
            setCurrentAnalytics(analysisToUse);
          
          // Check the status to determine if we should stop polling
          const status = analysisToUse.status?.toLowerCase() || "";
          
          if (status === "completed") {
            // Analysis is complete, stop polling and loading
            setIsLoading(false);
            setError(null);
            
            // Clear any existing timer
            if (pollingRef.current.productTimer) {
              clearTimeout(pollingRef.current.productTimer);
            }
          } else if (status === "failed") {
            // Analysis failed, stop polling but don't show error
            setIsLoading(false);
            setError(null);
            
            // Clear any existing timer
            if (pollingRef.current.productTimer) {
              clearTimeout(pollingRef.current.productTimer);
            }
          } else {
            // Analysis is still in progress, continue polling every 30 seconds
            setError(null);
            
            // Only show the "analysis started" message once
            if (!pollingRef.current.hasShownStartMessage && mountedRef.current) {
              pollingRef.current.hasShownStartMessage = true;
            }
            
            if (pollingRef.current.productTimer) {
              clearTimeout(pollingRef.current.productTimer);
            }
            
            pollingRef.current.productTimer = window.setTimeout(() => {
              if (mountedRef.current) {
                pollProductAnalytics(productId);
              }
            }, 30000); // Poll every 30 seconds
          }
          } else {
            // No analysis data found, continue polling
            if (pollingRef.current.productTimer) {
              clearTimeout(pollingRef.current.productTimer);
            }
            
            pollingRef.current.productTimer = window.setTimeout(() => {
              if (mountedRef.current) {
                pollProductAnalytics(productId);
              }
            }, 30000); // Poll every 30 seconds
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        // Continue polling on error, don't show error messages
        if (pollingRef.current.productTimer) {
          clearTimeout(pollingRef.current.productTimer);
        }
        
        // Retry after 30 seconds on error
        pollingRef.current.productTimer = window.setTimeout(() => {
          if (mountedRef.current) {
            pollProductAnalytics(productId);
          }
        }, 30000);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    if (resultsData?.product?.id) {
      // Reset the start message flag for new analysis
      pollingRef.current.hasShownStartMessage = false;
      if (pollingRef.current.productTimer) {
        clearTimeout(pollingRef.current.productTimer);
      }
      pollProductAnalytics(resultsData.product.id);
    }
  }, [resultsData, pollProductAnalytics]);

  // Show loading state if still loading or if analysis is not completed
  if (isLoading || !resultsData || !currentAnalytics || currentAnalytics.status?.toLowerCase() !== "completed") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Analysis Started</h2>
              <p className="text-muted-foreground">
                We are preparing your brand's comprehensive analysis. This strategic process ensures precision in every insight.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Extract data for components (only when analysis is completed)
  const analytics = currentAnalytics.analytics;
  const analysis = analytics?.analysis;
  
  // Prepare data for BrandHeader
  const brandName = analytics?.brand_name || getCleanDomainName(resultsData.website) || "Unknown Brand";
  const brandWebsite = analytics?.brand_website || resultsData.website || "";
  const keywordsAnalyzed = analysis?.overall_insights?.ai_visibility?.distinct_queries_count?.Value || resultsData.search_keywords?.length || 0;
  const status = currentAnalytics.status || "completed";
  const date = currentAnalytics.updated_at || currentAnalytics.date || new Date().toISOString();

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <BrandHeader 
            brandName={brandName}
            brandWebsite={brandWebsite}
            keywordsAnalyzed={keywordsAnalyzed}
            status={status}
            date={date}
          />
          
          {analysis?.overall_insights && (
            <>
            <OverallInsights insights={analysis.overall_insights} />
            <div className="border-t border-foreground my-12" />
            </>
          )}
          
          {analysis?.source_analysis && (
            <>
            <SourceAnalysis sources={analysis.source_analysis} />
            <div className="border-t border-foreground my-12" />
            </>
          )}
          
          {analysis?.competitor_analysis && (
            <>
            <CompetitorAnalysis analysis={analysis.competitor_analysis} />
            <div className="border-t border-foreground my-12" />
            </>
          )}
          
          {analysis?.content_impact && (
            <>
            <ContentImpact contentImpact={analysis.content_impact} />
            <div className="border-t border-foreground my-12" />
            </>
          )}
          
          {analysis?.recommendations && (
            <>
            <Recommendations recommendations={analysis.recommendations} />
            <div className="border-t border-foreground my-12" />
            </>
          )}
          
          {analytics?.raw_model_outputs_mapped && (
            <>
            <QueryAnalysis rawOutputs={analytics.raw_model_outputs_mapped} />
            <div className="border-t border-foreground my-8" />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}