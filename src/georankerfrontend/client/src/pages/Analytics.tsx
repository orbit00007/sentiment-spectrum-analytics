import { useState, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Search, Users, FileText, Target, AlertTriangle, ArrowUp, ArrowDown, Filter, Download, Calendar, Plus, ExternalLink, BarChart3, ChevronDown, ChevronRight } from "lucide-react";

export default function Analytics() {
  const [selectedLLM, setSelectedLLM] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [selectedContentType, setSelectedContentType] = useState("all");
  const [expandedKeywords, setExpandedKeywords] = useState<Set<number>>(new Set());

  // Model-wise Prompt Share Data
  const modelShareData = [
    { name: "ChatGPT", value: 42, mentions: 147, change: 12, color: "#10b981" },
    { name: "Gemini", value: 28, mentions: 98, change: -3, color: "#3b82f6" },
    { name: "Perplexity", value: 20, mentions: 70, change: 8, color: "#f59e0b" },
    { name: "Claude", value: 10, mentions: 35, change: 5, color: "#8b5cf6" }
  ];

  // Sentiment Trends Data
  const sentimentTrends = [
    { date: "Week 1", positive: 65, neutral: 25, negative: 10, total: 89 },
    { date: "Week 2", positive: 68, neutral: 22, negative: 10, total: 92 },
    { date: "Week 3", positive: 72, neutral: 20, negative: 8, total: 95 },
    { date: "Week 4", positive: 75, neutral: 18, negative: 7, total: 98 }
  ];

  // Keyword Gains & Losses
  const keywordPerformance = [
    { keyword: "AI Marketing ROI", currentRank: 1, previousRank: 3, mentions: 34, change: "gain", changeValue: 2, impact: "high" },
    { keyword: "Marketing Automation", currentRank: 2, previousRank: 2, mentions: 28, change: "stable", changeValue: 0, impact: "medium" },
    { keyword: "B2B Lead Generation", currentRank: 3, previousRank: 5, mentions: 22, change: "gain", changeValue: 2, impact: "high" },
    { keyword: "Content Strategy Tools", currentRank: 4, previousRank: 1, mentions: 18, change: "loss", changeValue: -3, impact: "high" },
    { keyword: "Sales Funnel Optimization", currentRank: 5, previousRank: 4, mentions: 15, change: "loss", changeValue: -1, impact: "low" },
    { keyword: "Customer Journey Mapping", currentRank: 6, previousRank: 7, mentions: 12, change: "gain", changeValue: 1, impact: "medium" }
  ];

  // Prompt-level performance data for each keyword
  const promptPerformanceData: { [key: number]: any[] } = {
    0: [ // AI Marketing ROI
      { prompt: "What is the ROI of AI in marketing?", chatgpt: 12, gemini: 8, perplexity: 6, total: 26 },
      { prompt: "How to measure AI marketing ROI", chatgpt: 5, gemini: 3, perplexity: 0, total: 8 },
      { prompt: "Best practices for calculating marketing AI returns", chatgpt: 0, gemini: 0, perplexity: 0, total: 0 }
    ],
    1: [ // Marketing Automation
      { prompt: "Top marketing automation tools", chatgpt: 10, gemini: 7, perplexity: 5, total: 22 },
      { prompt: "How does marketing automation work?", chatgpt: 4, gemini: 2, perplexity: 0, total: 6 },
      { prompt: "Marketing automation for small businesses", chatgpt: 0, gemini: 0, perplexity: 0, total: 0 }
    ],
    2: [ // B2B Lead Generation
      { prompt: "Best B2B lead generation strategies", chatgpt: 8, gemini: 6, perplexity: 4, total: 18 },
      { prompt: "How to generate B2B leads online", chatgpt: 3, gemini: 1, perplexity: 0, total: 4 },
      { prompt: "B2B lead generation tools and platforms", chatgpt: 0, gemini: 0, perplexity: 0, total: 0 }
    ],
    3: [ // Content Strategy Tools
      { prompt: "What are the best content strategy tools?", chatgpt: 7, gemini: 5, perplexity: 3, total: 15 },
      { prompt: "Content planning and strategy software", chatgpt: 2, gemini: 1, perplexity: 0, total: 3 },
      { prompt: "How to choose a content strategy platform", chatgpt: 0, gemini: 0, perplexity: 0, total: 0 }
    ],
    4: [ // Sales Funnel Optimization
      { prompt: "How to optimize sales funnel", chatgpt: 6, gemini: 4, perplexity: 2, total: 12 },
      { prompt: "Sales funnel optimization techniques", chatgpt: 2, gemini: 1, perplexity: 0, total: 3 },
      { prompt: "Best tools for funnel optimization", chatgpt: 0, gemini: 0, perplexity: 0, total: 0 }
    ],
    5: [ // Customer Journey Mapping
      { prompt: "What is customer journey mapping?", chatgpt: 5, gemini: 3, perplexity: 2, total: 10 },
      { prompt: "Customer journey mapping tools", chatgpt: 1, gemini: 1, perplexity: 0, total: 2 },
      { prompt: "How to create a customer journey map", chatgpt: 0, gemini: 0, perplexity: 0, total: 0 }
    ]
  };

  // Prompt Volume Over Time
  const promptVolumeData = [
    { date: "Jan 1", volume: 145, annotations: [] },
    { date: "Jan 8", volume: 152, annotations: [] },
    { date: "Jan 15", volume: 167, annotations: ["Content Launch"] },
    { date: "Jan 22", volume: 189, annotations: [] },
    { date: "Jan 29", volume: 205, annotations: ["PR Campaign"] },
    { date: "Feb 5", volume: 198, annotations: [] },
    { date: "Feb 12", volume: 223, annotations: [] },
    { date: "Feb 19", volume: 247, annotations: ["Case Study Release"] }
  ];

  // Channel Performance
  const channelPerformance = [
    { channel: "YouTube", mentions: 67, engagement: 4.2, growth: 12, reach: "145K" },
    { channel: "Medium", mentions: 45, engagement: 3.8, growth: -5, reach: "89K" },
    { channel: "Product Hunt", mentions: 32, engagement: 5.1, growth: 23, reach: "56K" },
    { channel: "LinkedIn", mentions: 28, engagement: 3.5, growth: 8, reach: "123K" },
    { channel: "Reddit", mentions: 24, engagement: 2.9, growth: -12, reach: "78K" },
    { channel: "Dev.to", mentions: 18, engagement: 4.7, growth: 15, reach: "34K" }
  ];

  // Competitor Comparison
  const competitorData = [
    { brand: "RedoraAI", chatgpt: 89, gemini: 67, perplexity: 54, total: 210, change: 12 },
    { brand: "HubSpot", chatgpt: 156, gemini: 123, perplexity: 87, total: 366, change: -3 },
    { brand: "Salesforce", chatgpt: 134, gemini: 98, perplexity: 76, total: 308, change: 5 },
    { brand: "Marketo", chatgpt: 78, gemini: 56, perplexity: 43, total: 177, change: -8 },
    { brand: "Mailchimp", chatgpt: 67, gemini: 45, perplexity: 32, total: 144, change: 2 }
  ];

  const handleCreateContentBrief = (keyword: string) => {
    // This would typically navigate to content creation or open a modal
    console.log(`Creating content brief for: ${keyword}`);
  };

  const handleExport = (format: string) => {
    // This would typically trigger a download
    console.log(`Exporting data as: ${format}`);
  };

  const toggleKeywordExpansion = (index: number) => {
    const newExpanded = new Set(expandedKeywords);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedKeywords(newExpanded);
  };

  const getChangeColor = (change: string) => {
    switch (change) {
      case "gain": return "text-green-600";
      case "loss": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case "gain": return <ArrowUp className="w-4 h-4" />;
      case "loss": return <ArrowDown className="w-4 h-4" />;
      default: return null;
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800"
    };
    return <Badge className={colors[impact as keyof typeof colors]}>{impact}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Performance Insights</h1>
        <p className="text-gray-600">Deep-dive analytics for SEO specialists, content strategists, and marketing ops</p>
      </div>

      {/* Filter Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="llm-filter">LLM</Label>
              <Select value={selectedLLM} onValueChange={setSelectedLLM}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="chatgpt">ChatGPT</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="perplexity">Perplexity</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content-type">Content Type</Label>
              <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="blog">Blog Posts</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="case-study">Case Studies</SelectItem>
                  <SelectItem value="guide">Guides</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="channel-filter">Channel</Label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="producthunt">Product Hunt</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time-range">Time Range</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model-wise Prompt Share */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model-wise Prompt Share & Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelShareData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {modelShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modelShareData.map((model, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: model.color }}></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{model.name}</h4>
                      <p className="text-sm text-gray-600">{model.mentions} mentions</p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 ${model.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {model.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span className="text-sm font-medium">{Math.abs(model.change)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} name="Positive" />
                <Line type="monotone" dataKey="neutral" stroke="#6b7280" strokeWidth={2} name="Neutral" />
                <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} name="Negative" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Keyword Gains & Losses */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Gains & Losses</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Click on any keyword to view prompt-level performance</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-8"></th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Keyword</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Current Rank</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Previous Rank</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Mentions</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Change</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Impact</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {keywordPerformance.map((keyword, index) => (
                  <Fragment key={index}>
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleKeywordExpansion(index)}
                      data-testid={`keyword-row-${index}`}
                    >
                      <td className="py-4 px-4">
                        {expandedKeywords.has(index) ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" data-testid={`expand-icon-${index}`} />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" data-testid={`expand-icon-${index}`} />
                        )}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">{keyword.keyword}</td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant="outline">#{keyword.currentRank}</Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant="outline">#{keyword.previousRank}</Badge>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600">{keyword.mentions}</td>
                      <td className={`py-4 px-4 text-center ${getChangeColor(keyword.change)}`}>
                        <div className="flex items-center justify-center space-x-1">
                          {getChangeIcon(keyword.change)}
                          <span className="font-medium">{Math.abs(keyword.changeValue)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getImpactBadge(keyword.impact)}
                      </td>
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateContentBrief(keyword.keyword)}
                          data-testid={`button-create-brief-${index}`}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Brief
                        </Button>
                      </td>
                    </tr>
                    {expandedKeywords.has(index) && promptPerformanceData[index] && (
                      <tr key={`${index}-prompts`} className="bg-gray-50" data-testid={`prompt-details-${index}`}>
                        <td colSpan={8} className="py-4 px-4">
                          <div className="ml-8">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Prompt-Level Performance
                            </h4>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-100 border-b border-gray-200">
                                    <th className="text-left py-2 px-4 font-medium text-xs text-gray-700">Prompt Text</th>
                                    <th className="text-center py-2 px-4 font-medium text-xs text-gray-700">ChatGPT</th>
                                    <th className="text-center py-2 px-4 font-medium text-xs text-gray-700">Gemini</th>
                                    <th className="text-center py-2 px-4 font-medium text-xs text-gray-700">Perplexity</th>
                                    <th className="text-center py-2 px-4 font-medium text-xs text-gray-700">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {promptPerformanceData[index].map((prompt, promptIndex) => (
                                    <tr key={promptIndex} className="hover:bg-gray-50" data-testid={`prompt-row-${index}-${promptIndex}`}>
                                      <td className="py-3 px-4 text-sm text-gray-900 max-w-md">{prompt.prompt}</td>
                                      <td className="py-3 px-4 text-center">
                                        <Badge 
                                          variant="outline" 
                                          className={prompt.chatgpt > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500"}
                                          data-testid={`chatgpt-mentions-${index}-${promptIndex}`}
                                        >
                                          {prompt.chatgpt}
                                        </Badge>
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <Badge 
                                          variant="outline" 
                                          className={prompt.gemini > 0 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-500"}
                                          data-testid={`gemini-mentions-${index}-${promptIndex}`}
                                        >
                                          {prompt.gemini}
                                        </Badge>
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <Badge 
                                          variant="outline" 
                                          className={prompt.perplexity > 0 ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-gray-50 text-gray-500"}
                                          data-testid={`perplexity-mentions-${index}-${promptIndex}`}
                                        >
                                          {prompt.perplexity}
                                        </Badge>
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <Badge 
                                          variant="outline" 
                                          className={prompt.total > 0 ? "bg-purple-50 text-purple-700 border-purple-200 font-semibold" : "bg-gray-50 text-gray-500"}
                                          data-testid={`total-mentions-${index}-${promptIndex}`}
                                        >
                                          {prompt.total}
                                        </Badge>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Volume Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt Volume Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={promptVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Channel Performance & Competitor Comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channelPerformance.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{channel.channel}</h4>
                    <p className="text-sm text-gray-600">{channel.mentions} mentions • {channel.reach} reach</p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 ${channel.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {channel.growth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      <span className="text-sm font-medium">{Math.abs(channel.growth)}%</span>
                    </div>
                    <p className="text-xs text-gray-500">Engagement: {channel.engagement}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competitor AI Mentions Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Brand</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">ChatGPT</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Gemini</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Perplexity</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Total</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {competitorData.map((brand, index) => (
                    <tr key={index} className={`hover:bg-gray-50 ${brand.brand === 'RedoraAI' ? 'bg-blue-50' : ''}`}>
                      <td className="py-2 px-3 font-medium text-gray-900">
                        {brand.brand}
                        {brand.brand === 'RedoraAI' && <Badge className="ml-2 text-xs">You</Badge>}
                      </td>
                      <td className="py-2 px-3 text-center text-gray-600">{brand.chatgpt}</td>
                      <td className="py-2 px-3 text-center text-gray-600">{brand.gemini}</td>
                      <td className="py-2 px-3 text-center text-gray-600">{brand.perplexity}</td>
                      <td className="py-2 px-3 text-center font-medium text-gray-900">{brand.total}</td>
                      <td className={`py-2 px-3 text-center ${brand.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-center space-x-1">
                          {brand.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          <span className="text-sm">{Math.abs(brand.change)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}