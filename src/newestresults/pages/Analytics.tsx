import { useState, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { 
  ChevronDown, ChevronRight, Filter, Download, Search, 
  ArrowUp, ArrowDown, TrendingUp, Target
} from "lucide-react";
import { 
  getBrands, 
  getSearchKeywords, 
  getLLMWiseData,
  getBrandName
} from "../data/newestAnalyticsData";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [expandedKeywords, setExpandedKeywords] = useState<Set<string>>(new Set());
  
  const brands = getBrands();
  const keywords = getSearchKeywords();
  const llmData = getLLMWiseData();
  const primaryBrandName = getBrandName();

  const toggleKeyword = (keywordId: string) => {
    const newExpanded = new Set(expandedKeywords);
    if (newExpanded.has(keywordId)) {
      newExpanded.delete(keywordId);
    } else {
      newExpanded.add(keywordId);
    }
    setExpandedKeywords(newExpanded);
  };

  // LLM Distribution pie chart data
  const llmPieData = Object.entries(llmData).map(([name, data], idx) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: data.mentions_count + data.prompts,
    mentions: data.mentions_count,
    prompts: data.prompts,
    color: COLORS[idx % COLORS.length]
  }));

  // Brand tier distribution
  const tierDistribution = brands.reduce((acc, b) => {
    const tier = b.geo_tier || 'Unknown';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tierChartData = Object.entries(tierDistribution).map(([tier, count], idx) => ({
    name: tier,
    value: count,
    color: tier === 'High' ? '#10b981' : tier === 'Medium' ? '#f59e0b' : '#ef4444'
  }));

  const getTierColor = (tier: string) => {
    switch(tier?.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutlookColor = (outlook: string) => {
    switch(outlook?.toLowerCase()) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Performance Insights</h1>
          <p className="text-muted-foreground">Deep-dive analytics for SEO specialists and marketing ops</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* LLM & Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>LLM Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={llmPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {llmPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {llmPieData.map((llm) => (
                <div key={llm.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: llm.color }} />
                    <span className="text-foreground">{llm.name}</span>
                  </div>
                  <span className="text-muted-foreground">{llm.mentions} mentions, {llm.prompts} prompts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tierChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6">
              {tierChartData.map((tier) => (
                <div key={tier.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span className="text-sm text-foreground">{tier.name}: {tier.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keywords Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Keyword & Prompt Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keywords.map((keyword) => (
              <div key={keyword.id} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleKeyword(keyword.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedKeywords.has(keyword.id) ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium text-foreground">{keyword.name}</span>
                  </div>
                  <Badge variant="outline">{keyword.prompts.length} prompts</Badge>
                </button>
                
                {expandedKeywords.has(keyword.id) && (
                  <div className="border-t border-border p-4 bg-muted/30">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Prompts</h4>
                    <ul className="space-y-2">
                      {keyword.prompts.map((prompt, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary font-medium">{idx + 1}.</span>
                          <span className="text-foreground">{prompt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Brand Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Brand Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Brand</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">GEO Score</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">GEO Tier</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Mention Score</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Mention Tier</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Outlook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {brands.map((brand, idx) => (
                  <tr 
                    key={brand.brand} 
                    className={`hover:bg-muted/50 ${brand.brand === primaryBrandName ? 'bg-primary/5' : ''}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {brand.logo && (
                          <img 
                            src={brand.logo} 
                            alt={brand.brand}
                            className="w-6 h-6 rounded"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        )}
                        <span className="font-medium text-foreground">{brand.brand}</span>
                        {brand.brand === primaryBrandName && (
                          <Badge className="bg-primary/10 text-primary">Primary</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-semibold text-foreground">{brand.geo_score}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge className={getTierColor(brand.geo_tier)}>{brand.geo_tier}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-semibold text-foreground">{brand.mention_score}%</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge className={getTierColor(brand.mention_tier)}>{brand.mention_tier}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-medium ${getOutlookColor(brand.outlook)}`}>
                        {brand.outlook}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
