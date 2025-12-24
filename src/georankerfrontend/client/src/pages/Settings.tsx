import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Edit2, User, Crown, Info, CheckCircle, Settings as SettingsIcon, Target, FileText, Users, MessageSquare, Calendar, Shield, Mail, Bell, Database, Zap, Search, BarChart, RefreshCw } from "lucide-react";

export default function Settings() {
  const [trackedTopics, setTrackedTopics] = useState([
    "AI Marketing",
    "Marketing Automation",
    "Content Generation",
    "B2B Marketing Solutions",
    "ChatGPT for Business"
  ]);
  
  const [newTopic, setNewTopic] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [setupChecklist, setSetupChecklist] = useState({
    profileComplete: true,
    topicsConfigured: true,
    integrationsSetup: false,
    firstReportGenerated: false,
    teamMembersInvited: false,
    notificationsSetup: false,
    alertsConfigured: false,
    contentCalendarSetup: false,
    competitorTracking: false,
    dataExportTested: false
  });

  // User plan information
  const userPlan = {
    name: "John Doe",
    email: "john.doe@company.com",
    company: "RedoraAI",
    planType: "Growth Plan",
    topicsUsed: trackedTopics.length,
    topicsLimit: 25,
    searchAppearances: 247,
    searchLimit: 500
  };

  const handleAddTopic = () => {
    if (newTopic.trim() && trackedTopics.length < userPlan.topicsLimit) {
      setTrackedTopics([...trackedTopics, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const handleRemoveTopic = (index: number) => {
    setTrackedTopics(trackedTopics.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(trackedTopics[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const updated = [...trackedTopics];
      updated[editingIndex] = editingValue.trim();
      setTrackedTopics(updated);
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleChecklistToggle = (key: string) => {
    setSetupChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isAtLimit = trackedTopics.length >= userPlan.topicsLimit;
  const usagePercentage = (trackedTopics.length / userPlan.topicsLimit) * 100;

  // Setup checklist items
  const checklistItems = [
    {
      key: "profileComplete",
      title: "Complete Profile Setup",
      description: "Add company information and user preferences",
      icon: User,
      completed: setupChecklist.profileComplete,
      action: "View Profile"
    },
    {
      key: "topicsConfigured",
      title: "Configure Tracked Topics",
      description: "Set up keywords and topics for monitoring",
      icon: Target,
      completed: setupChecklist.topicsConfigured,
      action: "Edit Topics"
    },
    {
      key: "integrationsSetup",
      title: "Connect Your Platforms",
      description: "Link WordPress, LinkedIn, Reddit, and other platforms",
      icon: Zap,
      completed: setupChecklist.integrationsSetup,
      action: "Setup Integrations"
    },
    {
      key: "firstReportGenerated",
      title: "Generate Your First Report",
      description: "Create a visibility report to see your baseline",
      icon: FileText,
      completed: setupChecklist.firstReportGenerated,
      action: "Generate Report"
    },
    {
      key: "teamMembersInvited",
      title: "Invite Team Members",
      description: "Add colleagues to collaborate on content strategy",
      icon: Users,
      completed: setupChecklist.teamMembersInvited,
      action: "Invite Team"
    },
    {
      key: "notificationsSetup",
      title: "Setup Email Notifications",
      description: "Configure alerts for mentions and visibility changes",
      icon: Mail,
      completed: setupChecklist.notificationsSetup,
      action: "Configure Alerts"
    },
    {
      key: "alertsConfigured",
      title: "Set Up Real-time Alerts",
      description: "Get instant notifications for urgent issues",
      icon: Bell,
      completed: setupChecklist.alertsConfigured,
      action: "Setup Alerts"
    },
    {
      key: "contentCalendarSetup",
      title: "Create Content Calendar",
      description: "Plan and schedule your content strategy",
      icon: Calendar,
      completed: setupChecklist.contentCalendarSetup,
      action: "Setup Calendar"
    },
    {
      key: "competitorTracking",
      title: "Enable Competitor Tracking",
      description: "Monitor your competitors' AI visibility",
      icon: Search,
      completed: setupChecklist.competitorTracking,
      action: "Add Competitors"
    },
    {
      key: "dataExportTested",
      title: "Test Data Export",
      description: "Verify you can export reports and data",
      icon: Database,
      completed: setupChecklist.dataExportTested,
      action: "Test Export"
    }
  ];

  const completedCount = Object.values(setupChecklist).filter(Boolean).length;
  const totalCount = Object.keys(setupChecklist).length;
  const completionPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and platform setup</p>
      </div>

      {/* Setup Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Setup Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {completedCount} of {totalCount} steps completed
              </h3>
              <p className="text-sm text-gray-600">
                Complete your setup to unlock the full RedoraAI experience
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(completionPercentage)}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Setup Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5" />
            <span>Setup Checklist</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklistItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.key} className={`flex items-center space-x-4 p-4 rounded-lg border ${
                  item.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => handleChecklistToggle(item.key)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      item.completed ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm ${
                      item.completed ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={item.completed ? "outline" : "default"}
                    className={item.completed ? "border-green-300 text-green-700" : ""}
                  >
                    {item.action}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Name</Label>
                <p className="text-gray-900 mt-1">{userPlan.name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <p className="text-gray-900 mt-1">{userPlan.email}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Company</Label>
                <p className="text-gray-900 mt-1">{userPlan.company}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Current Plan</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="default" className="flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>{userPlan.planType}</span>
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Usage Summary</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Tracked Topics</span>
                      <span className="text-sm font-medium text-gray-900">
                        {userPlan.topicsUsed} of {userPlan.topicsLimit}
                      </span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">AI Search Appearances</span>
                      <span className="text-sm font-medium text-gray-900">
                        {userPlan.searchAppearances} of {userPlan.searchLimit}
                      </span>
                    </div>
                    <Progress value={(userPlan.searchAppearances / userPlan.searchLimit) * 100} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button className="w-full" variant="outline">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracked Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Tracked Topics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isAtLimit && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You've reached your topic limit. Remove a topic to add a new one, or upgrade your plan.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                {trackedTopics.map((topic, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                    {editingIndex === index ? (
                      <>
                        <Input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleSaveEdit}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-gray-900">{topic}</span>
                        <Button size="sm" variant="outline" onClick={() => handleStartEdit(index)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRemoveTopic(index)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Add new topic..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                  disabled={isAtLimit}
                />
                <Button onClick={handleAddTopic} disabled={isAtLimit || !newTopic.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}