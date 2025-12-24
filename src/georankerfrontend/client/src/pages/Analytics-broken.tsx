import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { aiSearchTable, platformMentionsData, sentimentData, shareOfVoiceData, trendingConversations, communityMetrics } from "@/lib/dummyData";

export default function Analytics() {
  const [platform, setPlatform] = useState("all");
  const [timeRange, setTimeRange] = useState("30days");
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("ai-search");

  // Handle direct navigation from Quick Access
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const tab = url.searchParams.get('tab');
      if (tab && ['ai-search', 'community', 'competitor'].includes(tab)) {
        setActiveTab(tab);
      }
    };

    // Check initial URL
    handlePopState();

    // Listen for URL changes
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location]);

  const platformChartData = platformMentionsData.labels.map((label, index) => ({
    name: label,
    value: platformMentionsData.datasets[0].data[index],
    fill: platformMentionsData.datasets[0].backgroundColor[index]
  }));

  const sentimentChartData = sentimentData.labels.map((label, index) => ({
    name: label,
    value: sentimentData.datasets[0].data[index],
    fill: sentimentData.datasets[0].backgroundColor[index]
  }));

  const shareOfVoiceChartData = shareOfVoiceData.labels.map((label, index) => ({
    name: label,
    RedoraAI: shareOfVoiceData.datasets[0].data[index],
    CompetitorA: shareOfVoiceData.datasets[1].data[index],
    CompetitorB: shareOfVoiceData.datasets[2].data[index]
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Deep insights into your AI search and community performance</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai-search">AI Search Visibility</TabsTrigger>
          <TabsTrigger value="community">Community Analytics</TabsTrigger>
          <TabsTrigger value="competitor">Competitor Benchmarking</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-search">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Brand Mentions in AI Search Tools</CardTitle>
                <div className="flex items-center space-x-4">
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="chatgpt">ChatGPT</SelectItem>
                      <SelectItem value="gemini">Gemini</SelectItem>
                      <SelectItem value="perplexity">Perplexity</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="3months">Last 3 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keyword/Topic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brand Mentions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Competitor Mentions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {aiSearchTable.map((row, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.keyword}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Badge 
                            variant={row.platform === "ChatGPT" ? "default" : row.platform === "Gemini" ? "secondary" : "outline"}
                          >
                            {row.platform}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.brandMentions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.competitorMentions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community">
          {/* Community Summary Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Community Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{communityMetrics.totalConversations}</div>
                    <div className="text-sm text-gray-500">Total Tracked Conversations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">{communityMetrics.totalMentions}</div>
                    <div className="text-sm text-gray-500">Total Brand/Keyword Mentions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mentions by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {platformChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sentimentChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {sentimentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Trending Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200">
                {trendingConversations.map((conversation, index) => (
                  <div key={index} className="py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-2">"{conversation.snippet}"</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{conversation.platform}</span>
                          <Badge 
                            variant={conversation.sentiment === "Positive" ? "default" : "secondary"}
                          >
                            {conversation.sentiment}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="ml-4">
                        {conversation.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitor">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Share of Voice - Mention Counts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={shareOfVoiceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Mention Count', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value, name) => [`${value} mentions`, name]} />
                      <Legend />
                      <Line type="monotone" dataKey="RedoraAI" stroke="hsl(207, 90%, 54%)" strokeWidth={2} />
                      <Line type="monotone" dataKey="HubSpot" stroke="hsl(0, 84%, 60%)" strokeWidth={2} />
                      <Line type="monotone" dataKey="Salesforce" stroke="hsl(160, 60%, 45%)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitor Mention Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="text-sm font-medium text-amber-900">Gap: "AI-powered email marketing"</h4>
                    <p className="text-sm text-amber-700 mt-1">HubSpot: 15 mentions, Salesforce: 12 mentions, RedoraAI: 0 mentions</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900">Competitive: "Marketing automation"</h4>
                    <p className="text-sm text-blue-700 mt-1">RedoraAI: 1 mention, HubSpot: 6 mentions, Marketo: 6 mentions</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h4 className="text-sm font-medium text-emerald-900">Opportunity: "AI content generation"</h4>
                    <p className="text-sm text-emerald-700 mt-1">Low competitor activity - Copy.ai: 15 mentions, Jasper: 23 mentions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
