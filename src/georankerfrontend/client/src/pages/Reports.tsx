import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, BarChart3, TrendingUp, Download, Calendar, Settings, Eye } from "lucide-react";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("visibility");
  const [frequency, setFrequency] = useState("weekly");
  const [emailRecipients, setEmailRecipients] = useState("");
  const [reportSections, setReportSections] = useState({
    aiVisibility: true,
    communityAnalytics: true,
    contentPerformance: true,
    competitorAnalysis: false,
    executiveSummary: true
  });

  // Consolidated Report Types
  const reportTypes = [
    {
      id: "visibility",
      title: "Visibility Report",
      description: "AI search visibility, community presence, and brand mention tracking",
      icon: "Eye",
      color: "blue",
      sections: ["AI Visibility", "Community Analytics", "Brand Mentions", "Competitor Tracking"],
      quickInsights: {
        metricsChange: "+24% visibility growth",
        urgentActions: "Missing content on Gemini",
        topKeywords: "AI Marketing ROI trending"
      },
      lastGenerated: "2 hours ago"
    },
    {
      id: "content",
      title: "Content Strategy Report",
      description: "Content performance, optimization recommendations, and strategic insights",
      icon: "FileText",
      color: "green",
      sections: ["Content Performance", "Optimization Recommendations", "Content Gaps", "ROI Analysis"],
      quickInsights: {
        metricsChange: "+18% content efficiency",
        urgentActions: "3 pieces need optimization",
        topKeywords: "Case studies underperforming"
      },
      lastGenerated: "1 day ago"
    }
  ];

  // Historical Reports
  const historicalReports = [
    {
      title: "Monthly Visibility Report - January 2024",
      type: "Visibility Report",
      generatedDate: "2024-01-31",
      size: "2.4 MB",
      status: "Completed"
    },
    {
      title: "Content Strategy Analysis - Q4 2023",
      type: "Content Strategy Report",
      generatedDate: "2024-01-15",
      size: "1.8 MB",
      status: "Completed"
    },
    {
      title: "Weekly Visibility Update - Week 4",
      type: "Visibility Report",
      generatedDate: "2024-01-28",
      size: "945 KB",
      status: "Completed"
    }
  ];

  const handleSectionToggle = (section: string, checked: boolean) => {
    setReportSections(prev => ({
      ...prev,
      [section]: checked
    }));
  };

  const getIcon = (iconName: string) => {
    const icons = {
      Eye: Eye,
      FileText: FileText,
      BarChart3: BarChart3,
      TrendingUp: TrendingUp
    };
    const IconComponent = icons[iconName as keyof typeof icons] || FileText;
    return <IconComponent className="w-6 h-6" />;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
    };
    return colors[color as keyof typeof colors] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate comprehensive reports and configure automated delivery</p>
      </div>

      {/* Main Report Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="cursor-pointer border-2 hover:border-blue-300 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className={`w-12 h-12 ${getColorClasses(report.color)} rounded-lg flex items-center justify-center`}>
                  {getIcon(report.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  
                  {/* Quick Insights Preview */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Metrics Change:</span>
                      <span className="font-medium text-green-600">{report.quickInsights.metricsChange}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Urgent Actions:</span>
                      <span className="font-medium text-orange-600">{report.quickInsights.urgentActions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Top Trend:</span>
                      <span className="font-medium text-blue-600">{report.quickInsights.topKeywords}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last updated: {report.lastGenerated}</span>
                    <Button>Generate Report</Button>
                  </div>
                </div>
              </div>

              {/* Sections Toggle */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Include Sections:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {report.sections.map((section, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox id={`${report.id}-${index}`} defaultChecked={index < 3} />
                      <Label htmlFor={`${report.id}-${index}`} className="text-sm text-gray-700">
                        {section}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Automated Report Delivery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="frequency">Report Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="recipients">Email Recipients</Label>
                <Input
                  id="recipients"
                  placeholder="Enter email addresses separated by commas"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Smart Scheduling</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="visibility-weekly" />
                    <Label htmlFor="visibility-weekly" className="text-sm text-gray-700">
                      Visibility Report - Weekly
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="content-monthly" />
                    <Label htmlFor="content-monthly" className="text-sm text-gray-700">
                      Content Strategy Report - Monthly
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="urgent-immediate" />
                    <Label htmlFor="urgent-immediate" className="text-sm text-gray-700">
                      Urgent alerts - Immediate
                    </Label>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Configure Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Historical Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historicalReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{report.title}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">{report.type}</span>
                    <span className="text-sm text-gray-500">{report.generatedDate}</span>
                    <span className="text-sm text-gray-500">{report.size}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{report.status}</Badge>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}