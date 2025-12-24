import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, PenTool, Target, RefreshCw, FileText, Edit, Share2, Search, Lightbulb, Clock, CheckCircle, AlertCircle, Settings, BookOpen, TrendingUp, Users, MessageSquare, Star, ArrowUp, ArrowDown, BarChart } from "lucide-react";

export default function ContentHub() {
  const [activeTab, setActiveTab] = useState("plan");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [contentType, setContentType] = useState("");
  const [tone, setTone] = useState("");
  const [expandedBrief, setExpandedBrief] = useState<string | null>(null);

  // Plan Tab Data
  const contentCalendar = [
    {
      id: "1",
      date: "2024-01-15",
      topic: "AI Marketing ROI",
      format: "Blog Post",
      goal: "Rank #1 on ChatGPT",
      status: "Scheduled",
      keywords: ["AI marketing", "ROI measurement"],
      priority: "high"
    },
    {
      id: "2",
      date: "2024-01-17",
      topic: "Marketing Automation Trends",
      format: "LinkedIn Post",
      goal: "Increase engagement",
      status: "Draft",
      keywords: ["automation", "trends 2024"],
      priority: "medium"
    },
    {
      id: "3",
      date: "2024-01-20",
      topic: "B2B Lead Generation",
      format: "Case Study",
      goal: "Convert prospects",
      status: "Planned",
      keywords: ["lead generation", "B2B marketing"],
      priority: "high"
    }
  ];

  // Create Tab Data
  const briefTemplates = [
    {
      id: "brief-1",
      title: "AI Marketing ROI Guide",
      keyword: "AI Marketing ROI",
      format: "Blog Post",
      performance: { visibility: 85, mentions: 24, rank: 2 },
      llmReadiness: 92,
      promptFriendly: 88,
      citationDensity: 76,
      tone: "Professional & Data-driven",
      cta: "Download ROI Calculator",
      headlines: [
        "How to Calculate AI Marketing ROI: A Complete Guide",
        "Measuring Marketing ROI: AI Tools vs Traditional Methods",
        "The Ultimate AI Marketing ROI Calculator"
      ],
      expanded: false
    },
    {
      id: "brief-2",
      title: "Marketing Automation Trends",
      keyword: "Marketing Automation",
      format: "LinkedIn Article",
      performance: { visibility: 67, mentions: 18, rank: 4 },
      llmReadiness: 78,
      promptFriendly: 82,
      citationDensity: 65,
      tone: "Conversational & Expert",
      cta: "Book a Strategy Call",
      headlines: [
        "5 Marketing Automation Trends Transforming B2B",
        "Why Your Marketing Automation Strategy Needs an Update",
        "Marketing Automation: Beyond Email Campaigns"
      ],
      expanded: false
    },
    {
      id: "brief-3",
      title: "B2B Lead Generation Strategies",
      keyword: "B2B Lead Generation",
      format: "Case Study",
      performance: { visibility: 45, mentions: 12, rank: 6 },
      llmReadiness: 65,
      promptFriendly: 70,
      citationDensity: 58,
      tone: "Results-driven & Technical",
      cta: "Get Free Assessment",
      headlines: [
        "How We Generated 300% More B2B Leads",
        "The Complete B2B Lead Generation Playbook",
        "B2B Lead Generation: From Strategy to Results"
      ],
      expanded: false
    }
  ];

  // Optimize Tab Data
  const underperformingContent = [
    {
      id: "under-1",
      title: "Customer Success: 300% Lead Increase",
      type: "Case Study",
      currentPerformance: { visibility: 23, mentions: 3, rank: 8 },
      recommendations: [
        "Add more LLM-friendly headings",
        "Increase citation density by 40%",
        "Optimize for voice search queries"
      ],
      repurposeOptions: [
        { format: "LinkedIn Post", preview: "Share key stats and client quote" },
        { format: "Blog Series", preview: "Break into 3-part implementation guide" },
        { format: "Video Script", preview: "2-minute client testimonial" }
      ],
      lastOptimized: "Never"
    },
    {
      id: "under-2",
      title: "Marketing Automation Best Practices",
      type: "Blog Post",
      currentPerformance: { visibility: 41, mentions: 8, rank: 5 },
      recommendations: [
        "Update with 2024 trends",
        "Add more actionable examples",
        "Improve prompt friendliness score"
      ],
      repurposeOptions: [
        { format: "Reddit Comment", preview: "Share insights in r/marketing" },
        { format: "Twitter Thread", preview: "10-tweet actionable tips" },
        { format: "Email Newsletter", preview: "Weekly tips series" }
      ],
      lastOptimized: "3 months ago"
    }
  ];

  const handleToggleBrief = (briefId: string) => {
    setExpandedBrief(expandedBrief === briefId ? null : briefId);
  };

  const handleCreateBrief = () => {
    console.log("Creating new brief...");
  };

  const handleOptimizeContent = (contentId: string) => {
    console.log("Optimizing content:", contentId);
  };

  const handleRepurpose = (contentId: string, format: string) => {
    console.log("Repurposing content:", contentId, "to", format);
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Hub</h1>
        <p className="text-gray-600">Plan, create, and optimize content for maximum AI visibility</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="optimize">Optimize</TabsTrigger>
        </TabsList>

        {/* PLAN TAB */}
        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Content Calendar & Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentCalendar.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{item.topic}</h3>
                          <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                            {item.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.format}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.goal}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📅 {item.date}</span>
                          <span>🎯 {item.keywords.join(", ")}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          item.status === 'Scheduled' ? 'default' :
                          item.status === 'Draft' ? 'secondary' : 'outline'
                        }>
                          {item.status}
                        </Badge>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Add New Content to Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CREATE TAB */}
        <TabsContent value="create">
          <div className="space-y-6">
            {/* AI Draft Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PenTool className="w-5 h-5 mr-2" />
                  AI Draft Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="content-type">Content Type</Label>
                      <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blog">Blog Post</SelectItem>
                          <SelectItem value="linkedin">LinkedIn Post</SelectItem>
                          <SelectItem value="reddit">Reddit Comment</SelectItem>
                          <SelectItem value="twitter">Twitter Thread</SelectItem>
                          <SelectItem value="case-study">Case Study</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="topic">Topic/Keyword</Label>
                      <Input 
                        id="topic"
                        placeholder="Enter your topic..." 
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="tone">Tone & Style</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full">Generate Draft</Button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">LLM Optimization</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-800">Structure-first approach</span>
                          <input type="checkbox" className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-800">Prompt-friendly format</span>
                          <input type="checkbox" className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-800">High citation density</span>
                          <input type="checkbox" className="rounded" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Export Options</h4>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full">Export as PDF</Button>
                        <Button size="sm" variant="outline" className="w-full">Copy to Clipboard</Button>
                        <Button size="sm" variant="outline" className="w-full">Save as Template</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Briefs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Content Briefs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {briefTemplates.map((brief) => (
                    <div key={brief.id} className="border border-gray-200 rounded-lg">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{brief.title}</h3>
                              <Badge variant="outline" className="text-xs">{brief.format}</Badge>
                            </div>
                            
                            {/* Performance Metrics */}
                            <div className="flex items-center space-x-6 mb-2">
                              <div className="flex items-center space-x-2">
                                <BarChart className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-600">Visibility: {brief.performance.visibility}%</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MessageSquare className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-gray-600">{brief.performance.mentions} mentions</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Star className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-gray-600">Rank #{brief.performance.rank}</span>
                              </div>
                            </div>

                            {/* LLM Scores */}
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span>LLM Readiness: <strong className="text-green-600">{brief.llmReadiness}%</strong></span>
                              <span>Prompt Friendly: <strong className="text-blue-600">{brief.promptFriendly}%</strong></span>
                              <span>Citation Density: <strong className="text-purple-600">{brief.citationDensity}%</strong></span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleToggleBrief(brief.id)}
                            >
                              {expandedBrief === brief.id ? 'Collapse' : 'Expand'}
                            </Button>
                            <Button size="sm">Edit Brief</Button>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedBrief === brief.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Headlines</h4>
                              <div className="space-y-1">
                                {brief.headlines.map((headline, index) => (
                                  <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                                    {headline}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Tone:</span>
                                <span className="text-sm text-gray-600 ml-2">{brief.tone}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">CTA:</span>
                                <span className="text-sm text-gray-600 ml-2">{brief.cta}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button className="w-full" onClick={handleCreateBrief}>
                    <PenTool className="w-4 h-4 mr-2" />
                    Create New Brief
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* OPTIMIZE TAB */}
        <TabsContent value="optimize">
          <div className="space-y-6">
            {/* Underperforming Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Content Optimization & Repurposing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Identify underperforming content and get recommendations for improvement or repurposing
                </p>
                
                <div className="space-y-6">
                  {underperformingContent.map((content) => (
                    <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{content.title}</h3>
                            <Badge variant="outline" className="text-xs">{content.type}</Badge>
                          </div>
                          
                          {/* Current Performance */}
                          <div className="flex items-center space-x-6 mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Visibility: {content.currentPerformance.visibility}%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">{content.currentPerformance.mentions} mentions</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Rank #{content.currentPerformance.rank}</span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            Last optimized: {content.lastOptimized}
                          </div>
                        </div>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleOptimizeContent(content.id)}
                        >
                          Optimize Now
                        </Button>
                      </div>

                      {/* Recommendations */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                        <div className="space-y-1">
                          {content.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Repurpose Options */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Repurpose Options</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {content.repurposeOptions.map((option, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">{option.format}</span>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRepurpose(content.id, option.format)}
                                >
                                  Create
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600">{option.preview}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* LLM Optimization Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  LLM Optimization Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Content Analysis</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Average LLM Readiness</span>
                        <span className="text-lg font-bold text-blue-600">78%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Prompt Friendliness</span>
                        <span className="text-lg font-bold text-green-600">82%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Citation Density</span>
                        <span className="text-lg font-bold text-purple-600">66%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Optimization Suggestions</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">Structure Improvement</h4>
                        <p className="text-sm text-blue-800">Add more clear headings and bullet points</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-1">Citation Enhancement</h4>
                        <p className="text-sm text-green-800">Increase authoritative source references</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-1">Voice Search Ready</h4>
                        <p className="text-sm text-purple-800">Optimize for conversational queries</p>
                      </div>
                    </div>
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