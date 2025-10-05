import { BrandHeader } from "@/components/BrandHeader";
import { OverallInsights } from "@/components/OverallInsights";
import { SourceAnalysis } from "@/components/SourceAnalysis";
import { CompetitorAnalysis } from "@/components/CompetitorAnalysis";
import { ContentImpact } from "@/components/ContentImpact";
import { Recommendations } from "@/components/Recommendations";
import { QueryAnalysis } from "@/components/QueryAnalysis";
import analysisData from "@/data/analysis.json";

const Index = () => {
  // Brand Intelligence Dashboard
  const data = analysisData;

  // Transform data to match component interfaces
  const insights = {
    ai_visibility: {
      tier: data.ai_visibility.brand_tier,
      ai_visibility_score: {
        Value: data.ai_visibility.weighted_mentions_total,
      },
      weighted_mentions_total: {
        Value: data.ai_visibility.weighted_mentions_total,
      },
      distinct_queries_count: {
        Value: data.brand_mentions.queries_with_mentions,
      },
      breakdown: data.ai_visibility.breakdown,
      tier_mapping_method: data.ai_visibility.tier_mapping_method,
      explanation: data.ai_visibility.explanation,
    },
    brand_mentions: {
      level: "",
      mentions_count: { Value: data.brand_mentions.total_mentions },
      total_sources_checked: {
        Value: data.brand_mentions.total_sources_checked,
      },
      queries_with_mentions: data.brand_mentions.queries_with_mentions,
      alignment_with_visibility: data.brand_mentions.alignment_with_visibility,
      mention_list: data.analysis_scope?.keywords_or_queries || [],
    },
    dominant_sentiment: {
      sentiment: data.sentiment.dominant_sentiment,
      statement: data.sentiment.summary,
    },
  };

  // Calculate total mentions per brand from Platform-wise Brand Performance table
  const brandMentionTotals: { [key: string]: number } = {};
  const contentImpact = data.sources_and_content_impact;
  
  if (contentImpact?.header && contentImpact?.rows) {
    // Extract brand names from header
    const brandNames: string[] = [];
    for (let i = 1; i < contentImpact.header.length - 2; i += 3) {
      brandNames.push(contentImpact.header[i] as string);
    }

    // Calculate totals for each brand
    brandNames.forEach((brand, index) => {
      let total = 0;
      contentImpact.rows.forEach((row) => {
        const mentions = row[1 + index * 3 + 1] as number;
        total += mentions;
      });
      brandMentionTotals[brand] = total;
    });
  }

  // Find top brand and its total
  let topBrand = "";
  let topBrandTotal = 0;
  Object.entries(brandMentionTotals).forEach(([brand, total]) => {
    if (total > topBrandTotal) {
      topBrandTotal = total;
      topBrand = brand;
    }
  });

  // Get your brand's total (last brand in the list)
  const yourBrandTotal = Object.values(brandMentionTotals)[Object.values(brandMentionTotals).length - 1] || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <BrandHeader
          brandName={data.brand_name}
          brandWebsite={data.brand_website}
          keywordsAnalyzed={data.analysis_scope?.search_keywords || []}
          status={data.status}
          date={new Date().toISOString()}
          modelName={data.model_name}
        />

        <OverallInsights
          insights={insights}
          executiveSummary={data.executive_summary}
          yourBrandTotal={yourBrandTotal}
          topBrand={topBrand}
          topBrandTotal={topBrandTotal}
        />

        <SourceAnalysis
          contentImpact={data.sources_and_content_impact}
          brandName={data.brand_name}
        />

        {(data.competitor_visibility_table ||
          data.competitor_sentiment_table) && (
          <CompetitorAnalysis
            brandName={data.brand_name}
            analysis={{
              competitor_visibility_table: data.competitor_visibility_table,
              competitor_sentiment_table: data.competitor_sentiment_table,
            }}
          />
        )}

        {data.sources_and_content_impact &&
          data.sources_and_content_impact.rows &&
          data.sources_and_content_impact.rows.length > 0 && (
            <ContentImpact
              brandName={data.brand_name}
              contentImpact={data.sources_and_content_impact}
            />
          )}

        {data.recommendations && data.recommendations.length > 0 && (
          <Recommendations recommendations={data.recommendations} />
        )}
      </div>
    </div>
  );
};

export default Index;
