import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from "recharts";
import { 
  TrendingUp, TrendingDown, ArrowUp, ArrowDown, Target, 
  Globe, FileText, ExternalLink, Users, Lightbulb
} from "lucide-react";
import { 
  getBrandName, 
  getBrandWebsite, 
  getBrands, 
  getAIVisibilityMetrics,
  getCompetitorVisibility,
  getLLMWiseData,
  getPlatformPresence,
  getExecutiveSummary,
  getPrimaryBrand,
  getModelsUsed
} from "../data/newestAnalyticsData";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  
  const brandName = getBrandName();
  const brandWebsite = getBrandWebsite();
  const brands = getBrands();
  const primaryBrand = getPrimaryBrand();
  const aiMetrics = getAIVisibilityMetrics();
  const competitorVisibility = getCompetitorVisibility();
  const llmData = getLLMWiseData();
  const platformPresence = getPlatformPresence();
  const executiveSummary = getExecutiveSummary();
  const modelsUsed = getModelsUsed();

  // Prepare chart data
  const brandComparisonData = brands.map((b, i) => ({
    name: b.brand.length > 15 ? b.brand.substring(0, 15) + '...' : b.brand,
    fullName: b.brand,
    geoScore: b.geo_score,
    mentionScore: b.mention_score,
    fill: b.brand === brandName ? '#3b82f6' : COLORS[i % COLORS.length]
  }));

  const llmChartData = Object.entries(llmData).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    mentions: data.mentions_count,
    prompts: data.prompts,
    avgRank: data.average_rank,
    sources: data.sources
  }));

  const getTierColor = (tier: string) => {
    switch(tier?.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutlookIcon = (outlook: string) => {
    switch(outlook?.toLowerCase()) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <ArrowUp className="w-4 h-4 text-yellow-500 rotate-90" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Executive Summary</h1>
          <p className="text-muted-foreground">High-level snapshot and decision-making insights for leadership</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {primaryBrand?.logo && (
              <img 
                src={primaryBrand.logo} 
                alt={brandName}
                className="w-8 h-8 rounded"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <div>
              <p className="font-semibold text-foreground">{brandName}</p>
              <a 
                href={brandWebsite} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {brandWebsite?.replace('https://', '').replace('www.', '')}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {modelsUsed.map((model) => (
              <Badge key={model} variant="outline" className="capitalize">
                {model}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">GEO Score</h3>
              <Badge className={getTierColor(aiMetrics.tier)}>{aiMetrics.tier}</Badge>
            </div>
            <div className="text-3xl font-bold text-foreground">{aiMetrics.score}</div>
            <p className="text-sm text-muted-foreground mt-1">Global engagement optimization</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Mention Score</h3>
              <Badge className={getTierColor(aiMetrics.mentionTier)}>{aiMetrics.mentionTier}</Badge>
            </div>
            <div className="text-3xl font-bold text-foreground">{aiMetrics.mentionScore}%</div>
            <p className="text-sm text-muted-foreground mt-1">{aiMetrics.mentionCount} total mentions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Competitors Analyzed</h3>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold text-foreground">{aiMetrics.totalBrands}</div>
            <p className="text-sm text-muted-foreground mt-1">brands in comparison</p>
          </CardContent>
        </Card>
      </div>

      {/* Brand Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Brand Comparison - GEO Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandComparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{data.fullName}</p>
                          <p className="text-sm text-muted-foreground">GEO Score: {data.geoScore}</p>
                          <p className="text-sm text-muted-foreground">Mention Score: {data.mentionScore}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="geoScore" radius={[0, 4, 4, 0]}>
                  {brandComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* LLM Performance & Platform Presence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LLM Performance */}
        <Card>
          <CardHeader>
            <CardTitle>LLM Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {llmChartData.map((llm, idx) => (
                <div key={llm.name} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{llm.name}</h4>
                    <Badge variant="outline">{llm.sources} sources</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Mentions</p>
                      <p className="font-semibold text-foreground">{llm.mentions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prompts</p>
                      <p className="font-semibold text-foreground">{llm.prompts}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Rank</p>
                      <p className="font-semibold text-foreground">{llm.avgRank || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Presence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Platform Presence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(platformPresence).map(([platform, url]) => (
                <div 
                  key={platform} 
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-foreground uppercase">
                        {platform.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium text-foreground capitalize">{platform.replace('_', ' ')}</span>
                  </div>
                  {url ? (
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 text-sm flex items-center gap-1"
                    >
                      ✅ Present
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-red-600 text-sm">❌ Missing</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {executiveSummary.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-foreground">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="w-5 h-5" />
              Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {executiveSummary.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span className="text-foreground">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Prioritized Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Prioritized Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {executiveSummary.prioritized_actions.map((action, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-muted/50 border border-border rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                </div>
                <p className="text-foreground text-sm">{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conclusion */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-2">Conclusion</h3>
          <p className="text-muted-foreground">{executiveSummary.conclusion}</p>
        </CardContent>
      </Card>
    </div>
  );
}
