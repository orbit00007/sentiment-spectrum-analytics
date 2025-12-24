import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Users, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { 
  getBrands, 
  getBrandName,
  getCompetitorSentiment,
  getBrandWebsites
} from "../data/newestAnalyticsData";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Competitors() {
  const brands = getBrands();
  const primaryBrandName = getBrandName();
  const brandWebsites = getBrandWebsites();

  // Sort by GEO score
  const sortedBrands = [...brands].sort((a, b) => b.geo_score - a.geo_score);
  const maxGeoScore = Math.max(...brands.map(b => b.geo_score), 1);

  const chartData = sortedBrands.map((b, idx) => ({
    name: b.brand.length > 12 ? b.brand.substring(0, 12) + '...' : b.brand,
    fullName: b.brand,
    geoScore: b.geo_score,
    mentionScore: b.mention_score,
    fill: b.brand === primaryBrandName ? '#3b82f6' : COLORS[(idx + 1) % COLORS.length]
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
      default: return null;
    }
  };

  const getOutlookColor = (outlook: string) => {
    switch(outlook?.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Competitor Analysis</h1>
        <p className="text-muted-foreground">Compare your brand's performance against competitors</p>
      </div>

      {/* Visibility Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            GEO Score Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-foreground">{data.fullName}</p>
                          <p className="text-sm text-muted-foreground">GEO Score: {data.geoScore}</p>
                          <p className="text-sm text-muted-foreground">Mention Score: {data.mentionScore}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="geoScore" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Brand Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedBrands.map((brand, idx) => (
          <Card 
            key={brand.brand}
            className={brand.brand === primaryBrandName ? 'border-primary/50 bg-primary/5' : ''}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {brand.logo && (
                    <img 
                      src={brand.logo} 
                      alt={brand.brand}
                      className="w-10 h-10 rounded"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {brand.brand}
                      {brand.brand === primaryBrandName && (
                        <Badge className="bg-primary text-primary-foreground text-xs">Your Brand</Badge>
                      )}
                    </CardTitle>
                    {brandWebsites[brand.brand] && (
                      <a 
                        href={brandWebsites[brand.brand]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Visit website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-sm font-medium flex items-center gap-1 ${getOutlookColor(brand.outlook)}`}>
                  {getOutlookIcon(brand.outlook)}
                  {brand.outlook}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Score Bars */}
              <div className="space-y-4 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">GEO Score</span>
                    <span className="font-medium text-foreground">{brand.geo_score}</span>
                  </div>
                  <Progress 
                    value={(brand.geo_score / maxGeoScore) * 100} 
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Mention Score</span>
                    <span className="font-medium text-foreground">{brand.mention_score}%</span>
                  </div>
                  <Progress value={brand.mention_score} className="h-2" />
                </div>
              </div>

              {/* Tiers */}
              <div className="flex gap-2 mb-4">
                <Badge className={getTierColor(brand.geo_tier)}>GEO: {brand.geo_tier}</Badge>
                <Badge className={getTierColor(brand.mention_tier)}>Mention: {brand.mention_tier}</Badge>
              </div>

              {/* Summary */}
              <p className="text-sm text-muted-foreground">{brand.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
