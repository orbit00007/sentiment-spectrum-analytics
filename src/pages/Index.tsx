import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ModelInfo } from "@/components/dashboard/ModelInfo";
import { AnalysisScope } from "@/components/dashboard/AnalysisScope";
import { CalculationProvenance } from "@/components/dashboard/CalculationProvenance";
import { KPICard } from "@/components/dashboard/KPICard";
import { SourceAnalysisChart } from "@/components/dashboard/SourceAnalysisChart";
import { SourceMetricsTable } from "@/components/dashboard/SourceMetricsTable";
import { ComprehensiveCompetitorTable } from "@/components/dashboard/ComprehensiveCompetitorTable";
import { CompetitorProfiles } from "@/components/dashboard/CompetitorProfiles";
import { ContentImpactChart } from "@/components/dashboard/ContentImpactChart";
import { ContentImpactTable } from "@/components/dashboard/ContentImpactTable";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { AnalysisBreakdown } from "@/components/dashboard/AnalysisBreakdown";
import { ModelOutputs } from "@/components/dashboard/ModelOutputs";
import { VisualGuidance } from "@/components/dashboard/VisualGuidance";
import { Eye, MessageCircle, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import mockData from "@/data/mockdata.json";

const Index = () => {
  const data = mockData;
  const analysis = data.analysis;
  const overallInsights = analysis.overall_insights;
  const sourceAnalysis = analysis.source_analysis;
  const competitorAnalysis = analysis.competitor_analysis;
  const contentImpact = analysis.content_impact;
  const recommendations = analysis.recommendations;

  return (
    <div className="min-h-screen bg-white p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <DashboardHeader
          brandName={data.brand_name}
          brandWebsite={data.brand_website}
          analysisId={data.id}
          createdAt={data.created_at}
          status={data.status}
          type={data.type}
          dominantSentiment={overallInsights.dominant_sentiment.sentiment}
        />

        {/* Summary Section */}
        <section className="my-8">
          <div className="bg-muted/50 border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Analysis Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {overallInsights.summary}
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* FOLD 1 - Overall Insights */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Fold 1 - Overall Insights</h2>
            <p className="text-muted-foreground mb-6">Key performance indicators derived from available data</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              title="AI Visibility Score"
              value={overallInsights.ai_visibility.ai_visibility_score}
              badge={overallInsights.ai_visibility.tier}
              badgeVariant="outline"
              description="Based on market performance. Dominant"
              icon={Eye}
            />
            <KPICard
              title="Sentiment Score"
              value={overallInsights.dominant_sentiment.sentiment}
              badge={overallInsights.dominant_sentiment.sentiment}
              badgeVariant="secondary"
              description="Based on privacy sentiment analysis"
              icon={TrendingUp}
            />
            <KPICard
              title="Total Brand Mentions"
              value={overallInsights.brand_mentions.mentions_count}
              badge={overallInsights.brand_mentions.level}
              badgeVariant="secondary"
              description={`Total mentions across sources: ${overallInsights.brand_mentions.total_sources_checked}`}
              icon={MessageCircle}
            />
          </div>
        </section>

        {/* Sentiment Statement */}
        <section className="my-8">
          <div className="bg-muted/30 border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">AI Model Perspective</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {overallInsights.dominant_sentiment.statement}
            </p>
          </div>
        </section>

        <Separator className="my-8" />

        {/* FOLD 2 - Source Analysis */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Fold 2 - Source Analysis</h2>
            <p className="text-muted-foreground mb-6">Source Intelligence Data - Citation frequency across all results</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SourceAnalysisChart data={sourceAnalysis} />
            <SourceMetricsTable data={sourceAnalysis} />
          </div>
        </section>

        <Separator className="my-8" />

        {/* FOLD 3 - Competitor Analysis */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Fold 3 - Competitor Analysis</h2>
            <p className="text-muted-foreground mb-6">Competitive positioning across key dimensions</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ComprehensiveCompetitorTable 
              data={competitorAnalysis.table_1_by_dimension}
              ourBrand="Kommunicate"
            />
            <CompetitorProfiles data={competitorAnalysis.table_2_brand_profiles} />
          </div>
        </section>

        <Separator className="my-8" />

        {/* FOLD 4 - Content Impact */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Fold 4 - Content Impact</h2>
            <p className="text-muted-foreground mb-6">How much visibility comes from each content type</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1">
              <ContentImpactChart data={contentImpact} />
            </div>
            <div className="xl:col-span-2">
              <ContentImpactTable data={contentImpact} />
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {/* FOLD 5 - Recommendations */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Fold 5 - Strategic Recommendations</h2>
            <p className="text-muted-foreground mb-6">Actionable insights to improve AI platform visibility and performance</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((recommendation, index) => (
              <RecommendationCard key={index} recommendation={recommendation} />
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* Raw Model Outputs */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Raw Model Outputs</h2>
            <p className="text-muted-foreground mb-6">Raw data snippets and mention positions for specific queries</p>
          </div>
          <ModelOutputs data={data.raw_model_outputs_mapped} />
        </section>

        <Separator className="my-8" />

        {/* Additional Analysis Data */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Detailed Analysis Breakdown</h2>
            <p className="text-muted-foreground mb-6">Detailed methodology and calculation breakdown</p>
          </div>
          
          <AnalysisBreakdown 
            data={overallInsights.ai_visibility.calculation_breakdown}
            geoScore={overallInsights.ai_visibility.geo_score}
            weightedTotal={overallInsights.ai_visibility.weighted_mentions_total}
            queryCount={overallInsights.ai_visibility.distinct_queries_count}
          />
        </section>
      </div>
    </div>
  );
};

export default Index;
