import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Info, CheckCircle, XCircle, AlertCircle, Settings, Zap, Users, FileText, MessageSquare, ShoppingCart } from "lucide-react";

export default function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState(1);

  // Integration status data
  const integrations = [
    {
      id: "wordpress",
      name: "WordPress",
      description: "Publish and sync content directly to your WordPress site",
      icon: FileText,
      color: "blue",
      status: "Connected",
      recommendation: null,
      features: ["Auto-publish posts", "SEO optimization", "Content sync"]
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      description: "Share content and track professional engagement",
      icon: Users,
      color: "blue",
      status: "Connected",
      recommendation: null,
      features: ["Post scheduling", "Engagement tracking", "Lead generation"]
    },
    {
      id: "reddit",
      name: "Reddit",
      description: "Monitor mentions and engage with communities",
      icon: MessageSquare,
      color: "orange",
      status: "Not Connected",
      recommendation: "High engagement potential for your B2B content",
      features: ["Mention tracking", "Community engagement", "Trend monitoring"]
    },
    {
      id: "discord",
      name: "Discord",
      description: "Track brand mentions in Discord communities",
      icon: MessageSquare,
      color: "purple",
      status: "Not Connected",
      recommendation: null,
      features: ["Server monitoring", "Real-time alerts", "Community insights"]
    },
    {
      id: "producthunt",
      name: "Product Hunt",
      description: "Monitor product mentions and launch tracking",
      icon: ShoppingCart,
      color: "orange",
      status: "Not Connected",
      recommendation: "Recommended: Integrate for case study mentions",
      features: ["Launch tracking", "Mention monitoring", "Competitor analysis"]
    },
    {
      id: "hubspot",
      name: "HubSpot CRM",
      description: "Connect marketing data with customer insights",
      icon: Users,
      color: "orange",
      status: "Not Connected",
      recommendation: null,
      features: ["Lead scoring", "Attribution tracking", "Customer journey"]
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect with 1000+ apps and automate workflows",
      icon: Zap,
      color: "yellow",
      status: "Not Connected",
      recommendation: null,
      features: ["Workflow automation", "Custom triggers", "Multi-app sync"]
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get notifications and collaborate with your team",
      icon: MessageSquare,
      color: "green",
      status: "Not Connected",
      recommendation: null,
      features: ["Real-time notifications", "Team collaboration", "Custom alerts"]
    }
  ];

  // Demo content for guided setup
  const demoContent = {
    blogPosts: [
      { title: "AI Marketing ROI: Complete Guide", platform: "WordPress", status: "Published" },
      { title: "Marketing Automation Trends 2024", platform: "LinkedIn", status: "Scheduled" }
    ],
    mentions: [
      { platform: "Reddit", mention: "RedoraAI helped us improve our content strategy", sentiment: "Positive" },
      { platform: "Discord", mention: "Anyone tried RedoraAI for marketing analytics?", sentiment: "Neutral" }
    ],
    opportunities: [
      { platform: "Product Hunt", opportunity: "Launch feature: AI Content Optimizer", impact: "High" },
      { platform: "HubSpot", opportunity: "Import lead data for better targeting", impact: "Medium" }
    ]
  };

  const handleConnect = (integrationId: string) => {
    setSelectedIntegration(integrationId);
    setSetupStep(1);
  };

  const handleSetupComplete = () => {
    setSelectedIntegration(null);
    setSetupStep(1);
  };

  const getStatusColor = (status: string) => {
    return status === "Connected" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    return status === "Connected" ? CheckCircle : XCircle;
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Integrations</h1>
        <p className="text-gray-600">Connect your platforms for deeper insights and automated workflows</p>
      </div>

      {/* Integration Status Alert */}
      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>2 of 8 integrations connected</strong><br />
              Connect more platforms to unlock advanced features and get personalized recommendations.
            </div>
            <Button variant="outline" size="sm">View Setup Guide</Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          const IconComponent = integration.icon;
          const StatusIcon = getStatusIcon(integration.status);
          
          return (
            <Card key={integration.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${integration.color}-100 text-${integration.color}-600 rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`w-4 h-4 ${integration.status === 'Connected' ? 'text-green-600' : 'text-gray-400'}`} />
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status}
                    </Badge>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                
                {integration.recommendation && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      {integration.recommendation}
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {integration.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      variant={integration.status === "Connected" ? "outline" : "default"}
                      onClick={() => handleConnect(integration.id)}
                    >
                      {integration.status === "Connected" ? (
                        <>
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {integration.status === "Connected" ? "Manage" : "Connect"} {integration.name}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {integration.status === "Connected" ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-green-900">Connected Successfully</h4>
                              <p className="text-sm text-green-700">Integration is active and working</p>
                            </div>
                            <Button variant="outline" size="sm">Disconnect</Button>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                                ✓ Synced 3 new posts in the last week
                              </div>
                              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                                ✓ Tracked 12 new mentions
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Guided Setup Wizard</h4>
                            <p className="text-sm text-blue-700">
                              We'll walk you through connecting {integration.name} with pre-populated demo content to show immediate value.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Demo Content Preview</h4>
                              <div className="space-y-2">
                                {demoContent.blogPosts.map((post, index) => (
                                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                                    📝 {post.title}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Expected Benefits</h4>
                              <div className="space-y-2">
                                <div className="text-sm p-2 bg-green-50 rounded text-green-800">
                                  📈 2x faster content publishing
                                </div>
                                <div className="text-sm p-2 bg-blue-50 rounded text-blue-800">
                                  🎯 Better audience targeting
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <Button variant="outline">Learn More</Button>
                            <Button onClick={handleSetupComplete}>Start Setup</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Manual Data Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Manual Data Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 mb-4">
                Upload CSV files to import your existing data and get immediate insights without waiting for API connections.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Drop files here or click to upload</h4>
                <p className="text-sm text-gray-500 mb-3">Supports CSV files up to 10MB</p>
                <Button>Choose Files</Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Supported Data Types:</h4>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-900">Content Performance</h5>
                  <p className="text-sm text-gray-600">Date, Platform, Content Title, Views, Engagement</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-900">Brand Mentions</h5>
                  <p className="text-sm text-gray-600">Date, Platform, Mention, Sentiment, Reach</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-900">Competitor Data</h5>
                  <p className="text-sm text-gray-600">Date, Competitor, Keyword, Mentions, Rank</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}