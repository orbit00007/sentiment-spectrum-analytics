import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, FileText, Target, Brain, Clock, CheckCircle } from "lucide-react";
import { contentStrategyPlans, contentPlannerCalendar, contentBriefs } from "@/lib/dummyData";

export default function ContentStrategyPlanner() {
  const [selectedPlan, setSelectedPlan] = useState(contentStrategyPlans[0]);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(contentPlannerCalendar[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "bg-green-100 text-green-800";
      case "Scheduled": return "bg-blue-100 text-blue-800";
      case "Draft": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case "Rank": return "bg-purple-100 text-purple-800";
      case "Engage": return "bg-emerald-100 text-emerald-800";
      case "Convert": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Strategy Planner</h1>
        <p className="text-gray-600">Build multi-week content campaigns tied to your tracked topics</p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Content Plans</TabsTrigger>
          <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
          <TabsTrigger value="briefs">Content Briefs</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Active Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Active Content Plans</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentStrategyPlans.map((plan) => (
                    <div 
                      key={plan.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPlan.id === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{plan.title}</h3>
                        <Badge variant={plan.status === 'Active' ? 'default' : 'secondary'}>
                          {plan.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {plan.startDate} - {plan.endDate}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{plan.completedPosts}/{plan.plannedPosts} posts</span>
                        </div>
                        <Progress value={(plan.completedPosts / plan.plannedPosts) * 100} className="h-2" />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {plan.contentTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Plan Details */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{selectedPlan.title}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedPlan.startDate} - {selectedPlan.endDate}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tracked Topics</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPlan.trackedTopics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Content Types</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPlan.contentTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full">
                      Edit Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Content Calendar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentPlannerCalendar.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-900 min-w-[100px]">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.content}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">{item.type}</Badge>
                          <Badge className={`text-xs ${getGoalColor(item.goal)}`}>
                            {item.goal}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.optimizedFor}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedContent(item);
                          setShowBriefModal(true);
                        }}
                      >
                        View Brief
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="briefs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Content Briefs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {contentBriefs.map((brief) => (
                  <div key={brief.id} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-4">{brief.title}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Headline Options</h4>
                        <div className="space-y-2">
                          {brief.headlines.map((headline, idx) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                              {headline}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Structure</h4>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Length:</span> {brief.idealLength}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">H1:</span> {brief.format.h1}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">H2s:</span>
                            <ul className="list-disc list-inside ml-2 mt-1 text-xs">
                              {brief.format.h2s.map((h2, idx) => (
                                <li key={idx}>{h2}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">CTA:</span> {brief.format.cta}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                        <Brain className="w-4 h-4 mr-1" />
                        LLM Optimization
                      </h4>
                      <div className="text-sm text-blue-800">
                        <div><span className="font-medium">Platform:</span> {brief.llmOptimization.platform}</div>
                        <div><span className="font-medium">Strategy:</span> {brief.llmOptimization.prompt}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Brief Modal */}
      <Dialog open={showBriefModal} onOpenChange={setShowBriefModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Content Brief: {selectedContent.content}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Content Type</Label>
                <p className="text-sm text-gray-600">{selectedContent.type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Goal</Label>
                <p className="text-sm text-gray-600">{selectedContent.goal}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Optimized For</Label>
              <p className="text-sm text-gray-600">{selectedContent.optimizedFor}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge className={`text-xs ${getStatusColor(selectedContent.status)}`}>
                {selectedContent.status}
              </Badge>
            </div>
            <div className="pt-4 border-t">
              <Button className="w-full">
                Generate Full Brief
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}