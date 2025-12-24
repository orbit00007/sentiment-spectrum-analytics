import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Search, Users, FileText, Target, AlertTriangle, ArrowUp, ArrowDown, BarChart3, Globe } from "lucide-react";

export default function Dashboard() {
  // Top Summary Metrics Data
  const summaryMetrics = {
    aiVisibilityScore: { value: 87, change: 12, trend: "up" },
    shareOfVoice: { value: 34, change: 5, trend: "up" },
    visibilityGrowth: { value: 24.7, change: 8.3, trend: "up" },
    contentEfficiency: { value: 3.2, change: -0.4, trend: "down" }
  };

  // AI Search Visibility Data
  const aiSearchData = [
    { platform: "ChatGPT", appearances: 89, rankingKeywords: 12, topPositions: 7, avgPosition: 2.3 },
    { platform: "Gemini", appearances: 67, rankingKeywords: 8, topPositions: 5, avgPosition: 2.8 },
    { platform: "Perplexity", appearances: 54, rankingKeywords: 6, topPositions: 3, avgPosition: 3.1 }
  ];

  const keywordTrends = [
    { keyword: "AI Marketing ROI", week1: 3, week2: 2, week3: 1, week4: 1, change: "up" },
    { keyword: "Marketing Automation", week1: 5, week2: 4, week3: 3, week4: 2, change: "up" },
    { keyword: "B2B Lead Generation", week1: 8, week2: 7, week3: 6, week4: 4, change: "up" },
    { keyword: "Content Strategy", week1: 12, week2: 10, week3: 8, week4: 7, change: "up" }
  ];

  const answerPositioning = { topThree: 68, topFive: 82, cited: 94 };

  // Community Visibility Data
  const communityData = [
    { platform: "Reddit", mentions: 45, sentiment: "Positive", growth: 12 },
    { platform: "Discord", mentions: 23, sentiment: "Neutral", growth: -3 },
    { platform: "Product Hunt", mentions: 18, sentiment: "Positive", growth: 8 }
  ];

  const sentimentTrend = [
    { week: "Week 1", positive: 65, neutral: 25, negative: 10 },
    { week: "Week 2", positive: 70, neutral: 22, negative: 8 },
    { week: "Week 3", positive: 72, neutral: 20, negative: 8 },
    { week: "Week 4", positive: 76, neutral: 18, negative: 6 }
  ];

  const influencerMentions = [
    { user: "@marketingpro", followers: "25K", mention: "RedoraAI's approach to AI marketing is game-changing", platform: "Twitter" },
    { user: "sarah_growth", followers: "15K", mention: "Finally, a tool that tracks AI search visibility", platform: "LinkedIn" }
  ];

  // Content Impact Data
  const topPerformingContent = [
    {
      title: "AI Marketing ROI: Complete Guide",
      type: "Blog Post",
      visibilityContribution: 30,
      aiAppearances: 24,
      communityMentions: 12,
      published: "2 weeks ago"
    },
    {
      title: "Marketing Automation Best Practices",
      type: "Case Study",
      visibilityContribution: 18,
      aiAppearances: 15,
      communityMentions: 8,
      published: "1 month ago"
    },
    {
      title: "B2B Lead Generation Strategies",
      type: "LinkedIn Article",
      visibilityContribution: 15,
      aiAppearances: 12,
      communityMentions: 6,
      published: "3 weeks ago"
    }
  ];

  const contentReleaseData = [
    { date: "Jan 1", visibility: 45, content: null },
    { date: "Jan 8", visibility: 52, content: null },
    { date: "Jan 15", visibility: 67, content: "AI Marketing ROI Guide" },
    { date: "Jan 22", visibility: 73, content: null },
    { date: "Jan 29", visibility: 89, content: "Automation Case Study" }
  ];

  // Competitor Signals Data
  const competitorDeltas = [
    { keyword: "AI Marketing Tools", competitor: "HubSpot", change: 8, direction: "up", action: "Create comparison guide" },
    { keyword: "Marketing Automation", competitor: "Salesforce", change: -3, direction: "down", action: "Capitalize on their decline" },
    { keyword: "Content Generation", competitor: "Jasper", change: 12, direction: "up", action: "Reclaim position with fresh content" }
  ];

  const shareOfVoiceTrend = [
    { week: "Week 1", redora: 28, hubspot: 35, salesforce: 25, others: 12 },
    { week: "Week 2", redora: 30, hubspot: 33, salesforce: 24, others: 13 },
    { week: "Week 3", redora: 32, hubspot: 32, salesforce: 23, others: 13 },
    { week: "Week 4", redora: 34, hubspot: 31, salesforce: 22, others: 13 }
  ];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Executive Summary</h1>
        <p className="text-gray-600">High-level snapshot and decision-making insights for leadership</p>
      </div>

      {/* GEO Score & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">GEO Score</h3>
              <div className={`flex items-center ${summaryMetrics.aiVisibilityScore.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {summaryMetrics.aiVisibilityScore.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="text-sm ml-1">+{summaryMetrics.aiVisibilityScore.change}</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{summaryMetrics.aiVisibilityScore.value}</div>
            <p className="text-sm text-gray-600 mt-1">Global engagement optimization</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Brand Mentions</h3>
              <div className="flex items-center text-emerald-600">
                <ArrowUp className="w-4 h-4" />
                <span className="text-sm ml-1">+18%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">247</div>
            <p className="text-sm text-gray-600 mt-1">across top 3 LLMs</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Share of Voice</h3>
              <div className={`flex items-center ${summaryMetrics.shareOfVoice.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {summaryMetrics.shareOfVoice.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="text-sm ml-1">+{summaryMetrics.shareOfVoice.change}%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{summaryMetrics.shareOfVoice.value}%</div>
            <p className="text-sm text-gray-600 mt-1">vs competitors</p>
          </CardContent>
        </Card>
      </div>

      {/* Share of Voice Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Share of Voice Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shareOfVoiceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="redora" fill="#3b82f6" name="RedoraAI" />
                <Bar dataKey="hubspot" fill="#ef4444" name="HubSpot" />
                <Bar dataKey="salesforce" fill="#f59e0b" name="Salesforce" />
                <Bar dataKey="others" fill="#6b7280" name="Others" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Visibility Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Visibility Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-900">ChatGPT</span>
                <span className="text-sm text-blue-700">74% to target</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '74%' }}></div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-900">Gemini</span>
                <span className="text-sm text-green-700">84% to target</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-orange-900">Perplexity</span>
                <span className="text-sm text-orange-700">54% to target</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '54%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Gap & Competitive Opportunity Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Content Gap & Competitive Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                <h4 className="font-medium text-red-900">Content Generation Gap</h4>
              </div>
              <p className="text-sm text-red-700 mb-3">
                <strong>Jasper gained 12 mentions</strong> in AI marketing automation while we have zero coverage in this space.
              </p>
              <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                <FileText className="w-4 h-4 mr-2" />
                Create Content Plan
              </Button>
            </div>
            
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-900">Competitive Opportunity</h4>
              </div>
              <p className="text-sm text-green-700 mb-3">
                <strong>Marketing Automation: Salesforce mentions dropped</strong> 15% this week. Prime opportunity to capture share.
              </p>
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                <Target className="w-4 h-4 mr-2" />
                Exploit Opportunity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Presence Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Platform Presence Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Brand presence on key AI-relevant platforms
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">R</span>
                  </div>
                  <span className="font-medium text-gray-900">Reddit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 text-sm">✅ Present</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">P</span>
                  </div>
                  <span className="font-medium text-gray-900">Product Hunt</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600 text-sm">⚠️ Needs Update</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">M</span>
                  </div>
                  <span className="font-medium text-gray-900">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 text-sm">✅ Present</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">W</span>
                  </div>
                  <span className="font-medium text-gray-900">Wikipedia</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 text-sm">❌ Missing</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">G</span>
                  </div>
                  <span className="font-medium text-gray-900">GitHub</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 text-sm">✅ Present</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline" size="sm" className="w-full">
                <Globe className="w-4 h-4 mr-2" />
                Claim Wikipedia Page
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <ArrowUp className="w-4 h-4 mr-2" />
                Submit Product Hunt Update
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Add Medium Article
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* SECTION 2: AI Search Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            AI Search Visibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Platform Appearances */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Appearances by Platform</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Platform</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Appearances</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Keywords</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Avg Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {aiSearchData.map((platform, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{platform.platform}</td>
                        <td className="px-4 py-4 text-sm text-center text-gray-600">{platform.appearances}</td>
                        <td className="px-4 py-4 text-sm text-center text-gray-600">{platform.rankingKeywords}</td>
                        <td className="px-4 py-4 text-sm text-center">
                          <Badge variant="outline" className="text-xs">
                            #{platform.avgPosition}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Answer Positioning Score */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Answer Positioning Score</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm font-medium text-emerald-900">Top 3 Citations</span>
                  <span className="text-lg font-bold text-emerald-900">{answerPositioning.topThree}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Top 5 Citations</span>
                  <span className="text-lg font-bold text-blue-900">{answerPositioning.topFive}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">Total Cited</span>
                  <span className="text-lg font-bold text-gray-900">{answerPositioning.cited}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Keyword Trends */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Tracked Keyword Rank Trends</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {keywordTrends.map((keyword, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-900">{keyword.keyword}</h5>
                    <div className={`flex items-center ${keyword.change === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {keyword.change === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Current Rank: #{keyword.week4}</div>
                  <div className="text-xs text-gray-500">Previous: #{keyword.week1}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: Community Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Community Visibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Platform Breakdown */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Platform-Level Breakdown</h4>
              <div className="space-y-3">
                {communityData.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h5 className="font-medium text-gray-900">{platform.platform}</h5>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">{platform.mentions} mentions</span>
                        <Badge 
                          className={`text-xs ${
                            platform.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-800' :
                            platform.sentiment === 'Negative' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {platform.sentiment}
                        </Badge>
                      </div>
                    </div>
                    <div className={`flex items-center ${platform.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {platform.growth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      <span className="text-sm ml-1">{Math.abs(platform.growth)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment Trend */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Sentiment Trend</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="positive" stackId="a" fill="hsl(160, 60%, 45%)" />
                    <Bar dataKey="neutral" stackId="a" fill="hsl(45, 60%, 60%)" />
                    <Bar dataKey="negative" stackId="a" fill="hsl(0, 60%, 60%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Influencer Mentions */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Influencer Mentions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {influencerMentions.map((mention, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{mention.user}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">{mention.platform}</Badge>
                      <Badge variant="secondary" className="text-xs">{mention.followers}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">"{mention.mention}"</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4: Content Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Content Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Top Performing Content */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Top-Performing Content by Visibility</h4>
              <div className="space-y-3">
                {topPerformingContent.map((content, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{content.title}</h5>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">{content.type}</Badge>
                          <span className="text-xs text-gray-500">{content.published}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600">{content.visibilityContribution}%</div>
                        <div className="text-xs text-gray-500">visibility</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{content.aiAppearances} AI appearances</span>
                      <span>{content.communityMentions} community mentions</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Release Attribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Content → AI Visibility Attribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={contentReleaseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="visibility" 
                      stroke="hsl(207, 90%, 54%)" 
                      strokeWidth={2}
                      dot={(props) => {
                        if (props.payload && props.payload.content) {
                          return <circle cx={props.cx} cy={props.cy} r={6} fill="hsl(160, 60%, 45%)" />;
                        }
                        return <circle cx={props.cx} cy={props.cy} r={3} fill="hsl(207, 90%, 54%)" />;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-900">
                  <strong>AI Marketing ROI Guide</strong> drove 30% of Gemini visibility increase
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 5: Competitor Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Competitor Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Keyword-Level Competitor Deltas */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Keyword-Level Competitor Changes</h4>
              <div className="space-y-3">
                {competitorDeltas.map((delta, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{delta.keyword}</h5>
                      <div className={`flex items-center ${delta.direction === 'up' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {delta.direction === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        <span className="text-sm ml-1">{delta.change}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>{delta.competitor}</strong> {delta.direction === 'up' ? 'gained' : 'lost'} {delta.change} mentions
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{delta.action}</span>
                      <Button size="sm" variant="outline">Take Action</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share of Voice Trend */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Share of Voice Trend</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={shareOfVoiceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="redora" stroke="hsl(207, 90%, 54%)" strokeWidth={2} name="RedoraAI" />
                    <Line type="monotone" dataKey="hubspot" stroke="hsl(0, 84%, 60%)" strokeWidth={2} name="HubSpot" />
                    <Line type="monotone" dataKey="salesforce" stroke="hsl(160, 60%, 45%)" strokeWidth={2} name="Salesforce" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>


        </CardContent>
      </Card>
    </div>
  );
}