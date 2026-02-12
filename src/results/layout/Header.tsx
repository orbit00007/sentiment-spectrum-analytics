import { useNavigate, useLocation, Link } from "react-router-dom";
import { Menu, X, User, LogOut, RefreshCw, Plus, Loader2, FileDown, FileText, Globe, Database, Sparkles, Brain, History, Check, ChevronDown, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { regenerateAnalysis } from "@/apiHelpers";
import { getAccessToken } from "@/lib/secureTokenStore";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisState } from "@/hooks/useAnalysisState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResults, TabType } from "@/results/context/ResultsContext";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";
import { generateReport } from '@/results/layout/downloadReport';
import { getBrandName } from '@/results/data/analyticsData';

const mobileNavItems = [
  { label: "Overview", path: "/results", tab: "overview" as TabType },
  {
    label: "Executive Summary",
    path: "/results/executive-summary",
    tab: "executive-summary" as TabType,
  },
  { label: "Prompts", path: "/results/prompts", tab: "prompts" as TabType },
  {
    label: "Sources",
    path: "/results/sources-all",
    tab: "sources-all" as TabType,
  },
  {
    label: "Competitors",
    path: "/results/competitors-comparisons",
    tab: "competitors-comparisons" as TabType,
  },
  {
    label: "Recommendations",
    path: "/results/recommendations",
    tab: "recommendations" as TabType,
  },
];

// Analysis Animation Component
const AnalyzingAnimation = ({ 
  hasError = false, 
  hasCompleted = false,
  onRetry 
}: { 
  hasError?: boolean; 
  hasCompleted?: boolean;
  onRetry?: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);
  
  const steps = [
    { icon: FileText, text: "Gathering", color: "text-blue-500" },
    { icon: Globe, text: "Searching", color: "text-green-500" },
    { icon: Database, text: "Processing", color: "text-purple-500" },
    { icon: Brain, text: "ChatGPT", color: "text-emerald-500" },
    { icon: Sparkles, text: "Gemini", color: "text-amber-500" },
    { icon: Brain, text: "Analyzing", color: "text-pink-500" },
  ];

  useEffect(() => {
    if (hasError || hasCompleted) return; // Don't animate if there's an error or completed
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [hasError, hasCompleted]);

  // Show retry prompt when error occurs
  useEffect(() => {
    if (hasError) {
      setShowRetryPrompt(true);
    } else {
      setShowRetryPrompt(false);
    }
  }, [hasError]);

  const handleRetry = () => {
    setShowRetryPrompt(false);
    onRetry?.();
  };

  const handleDismiss = () => {
    setShowRetryPrompt(false);
  };

  // Success state - using same style as analyzing steps
  if (hasCompleted) {
    const SuccessIcon = CheckCircle;
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500/10 via-green-500/10 to-green-500/10 border border-green-500/20">
        <div className="relative w-5 h-5 flex items-center justify-center">
          <div className="absolute inset-0 animate-ping opacity-75">
            <SuccessIcon className="w-5 h-5 text-green-500" />
          </div>
          <SuccessIcon className="w-5 h-5 relative z-10 text-green-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold transition-all duration-300 text-green-500">
            Analysis Completed
          </span>
          <div className="flex gap-0.5 mt-0.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className="h-0.5 w-3 rounded-full bg-green-500"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state - using same style as analyzing steps
  if (hasError) {
    const ErrorIcon = AlertCircle;
    return (
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500/10 via-red-500/10 to-red-500/10 border border-red-500/20">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <div className="absolute inset-0 animate-ping opacity-75">
              <ErrorIcon className="w-5 h-5 text-red-500" />
            </div>
            <ErrorIcon className="w-5 h-5 relative z-10 text-red-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold transition-all duration-300 text-red-500">
              Analysis Failed
            </span>
            <div className="flex gap-0.5 mt-0.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className="h-0.5 w-3 rounded-full bg-red-500"
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Retry Prompt Notification */}
        {showRetryPrompt && onRetry && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Arrow pointing up */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-card mx-auto mb-0" />
            
            <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
              <p className="text-xs font-medium text-foreground mb-2">
                Do you want to regenerate the analysis?
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1 h-7 text-xs"
                  onClick={handleRetry}
                >
                  Yes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                  onClick={handleDismiss}
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Normal analyzing state
  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/10 via-purple-500/10 to-amber-500/10 border border-primary/20">
      <div className="relative w-5 h-5 flex items-center justify-center">
        <div className="absolute inset-0 animate-ping opacity-75">
          <CurrentIcon className={cn("w-5 h-5", steps[currentStep].color)} />
        </div>
        <CurrentIcon className={cn("w-5 h-5 relative z-10", steps[currentStep].color)} />
      </div>
      <div className="flex flex-col">
        <span className={cn("text-xs font-semibold transition-all duration-300", steps[currentStep].color)}>
          {steps[currentStep].text}
        </span>
        <div className="flex gap-0.5 mt-0.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-0.5 w-3 rounded-full transition-all duration-300",
                idx === currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};


export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, products } = useAuth();
  const { toast } = useToast();
  const { 
    setActiveTab, 
    isLoading, 
    dataReady, 
    isAnalyzing, 
    analyticsList, 
    isAnalyticsListLoading, 
    isSwitchingAnalytics, 
    selectedAnalyticsId, 
    switchToAnalytics 
  } = useResults();
  const { toggleSidebar } = useSidebar();
  const { isAnalyzing: analysisLocked, startAnalysis, completeAnalysis } = useAnalysisState();

  // Analysis is in progress if loading and no data ready yet, OR if analyzing via hook
  const isAnalysisInProgress = (isLoading && !dataReady) || isAnalyzing;

  // Clear regenerating state once data is ready
  useEffect(() => {
    if (dataReady && !isLoading && !isAnalyzing) {
      setIsRegenerating(false);
      setAnalysisError(false);
      setAnalysisCompleted(true);
      completeAnalysis();
      
      // Auto-clear completed state after 5 seconds
      const timer = setTimeout(() => {
        setAnalysisCompleted(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [dataReady, isLoading, isAnalyzing, completeAnalysis]);

  const actionsDisabled = isAnalysisInProgress || isRegenerating || analysisLocked;

  useEffect(() => {
    const storedProductId = localStorage.getItem("product_id");
    setProductId(storedProductId);
  }, [location]);

  // Handle mobile menu body scroll lock
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNewAnalysis = () => {
    if (actionsDisabled) return;

    const currentWebsite = products?.[0]?.website || "";
    const currentProductId = products?.[0]?.id || productId || "";

    navigate("/input", {
      state: {
        prefillWebsite: currentWebsite,
        productId: currentProductId,
        isNewAnalysis: true,
        disableWebsiteEdit: true,
      },
    });
  };

  const handleRegenerateAnalysis = async () => {
    if (!productId) return;
    if (actionsDisabled) return;

    setIsRegenerating(true);
    setAnalysisError(false);
    setAnalysisCompleted(false);
    startAnalysis(productId);

    try {
      const accessToken = getAccessToken() || "";
      await regenerateAnalysis(productId, accessToken);

      toast({
        title: "Analysis in Progress",
        description:
          "Your analysis has begun. Please stay on this page, you'll receive a notification here when it's ready.",
        duration: 10000,
      });

      // NOTE: keep locked until dataReady becomes true (handled by useEffect)
    } catch (error) {
      setAnalysisError(true);
      
      toast({
        title: "Error",
        description: "Failed to regenerate analysis. Please try again.",
        variant: "destructive",
      });

      setIsRegenerating(false);
      completeAnalysis();
      
      // Auto-clear error state after 5 seconds
      setTimeout(() => {
        setAnalysisError(false);
      }, 5000);
    }
  };

  const handleMobileNavClick = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleGenerateReport = useCallback(() => {
    setIsGeneratingReport(true);
    
    const success = generateReport(toast);
    
    if (!success) {
      setIsGeneratingReport(false);
      return;
    }

    // Reset generating state after print
    setTimeout(() => {
      setIsGeneratingReport(false);
    }, 2000);
  }, [toast]);

  // Format analytics date for dropdown
  const formatAnalyticsLabel = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border no-print shadow-sm">
        <div className="flex items-center justify-between px-3 md:px-6 md:pl-14 py-2 md:py-3">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 -ml-1 text-foreground touch-manipulation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={toggleSidebar}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle sidebar"
            >
              <PanelLeft className="h-5 w-5 text-foreground" />
            </button>

            <Link to="/" className="flex items-center gap-1.5 md:gap-2">
              <span className="text-lg md:text-2xl font-bold gradient-text">
                GeoRankers
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            {/* Analysis in Progress Animation - beside New Analysis button */}
            {(isAnalysisInProgress || isRegenerating || analysisLocked || analysisError || analysisCompleted) && (
              <div className="flex items-center">
                <AnalyzingAnimation 
                  hasError={analysisError} 
                  hasCompleted={analysisCompleted}
                  onRetry={handleRegenerateAnalysis}
                />
              </div>
            )}
            
            {/* Previous Analytics Dropdown */}
            {analyticsList && analyticsList.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] md:text-sm px-2 py-1 md:px-4 md:py-2 gap-1 h-7 md:h-9"
                    disabled={isAnalyticsListLoading || isSwitchingAnalytics}
                  >
                    {isSwitchingAnalytics ? (
                      <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                    ) : (
                      <History className="w-3 h-3 md:w-4 md:h-4" />
                    )}
                    <span className="hidden sm:inline">Previous Analytics</span>
                    <span className="sm:hidden">Previous</span>
                    <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Previous analytics
                  </div>
                  {analyticsList.map((item) => (
                    <DropdownMenuItem
                      key={item.analytics_id}
                      onClick={() => switchToAnalytics(item.analytics_id)}
                      disabled={isSwitchingAnalytics}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      <span className="text-sm">
                        {formatAnalyticsLabel(item.created_at)}
                      </span>
                      {selectedAnalyticsId === item.analytics_id && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* New Analysis Button */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-[10px] md:text-sm px-2 py-1 md:px-4 md:py-2 gap-1 h-7 md:h-9",
                actionsDisabled
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              )}
              onClick={handleNewAnalysis}
              disabled={actionsDisabled}
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">New Analysis</span>
              <span className="sm:hidden">New</span>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-7 w-7 md:h-10 md:w-10 rounded-full p-0 md:mr-5"
                  >
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs md:text-sm shadow-lg">
                      {user.first_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>
                      {user.first_name} {user.last_name}
                    </span>
                  </DropdownMenuItem>
                  {productId && (
                    <>
                      <DropdownMenuItem
                        onClick={handleRegenerateAnalysis}
                        disabled={actionsDisabled}
                        className={cn(
                          "flex items-center space-x-2",
                          actionsDisabled && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <RefreshCw
                          className={cn("w-4 h-4", isRegenerating && "animate-spin")}
                        />
                        <span>Regenerate Analysis</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport || isAnalysisInProgress}
                        className={cn(
                          "flex items-center space-x-2",
                          (isGeneratingReport || isAnalysisInProgress) && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <FileDown
                          className={cn(
                            "w-4 h-4",
                            isGeneratingReport && "animate-pulse"
                          )}
                        />
                        <span>
                          {isGeneratingReport ? "Generating..." : "Generate Report"}
                        </span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 md:gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs md:text-sm h-7 md:h-9 px-2 md:px-3"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs md:text-sm h-7 md:h-9 px-2 md:px-3"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden touch-manipulation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={cn(
          "fixed top-[49px] left-0 right-0 bg-card border-b border-border z-50 md:hidden transition-all duration-300 overflow-hidden",
          mobileMenuOpen
            ? "max-h-[80vh] opacity-100 overflow-y-auto"
            : "max-h-0 opacity-0"
        )}
      >
        <nav className="p-3 space-y-1">
          {mobileNavItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleMobileNavClick(item.tab)}
              className={cn(
                "block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors touch-manipulation",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted active:bg-muted"
              )}
            >
              {item.label}
            </button>
          ))}
          <div className="px-3 py-2.5 text-sm text-muted-foreground">
            <span className="font-medium">Content Impact Analysis</span>
            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
              Coming Soon
            </span>
          </div>
        </nav>
      </div>
    </>
  );
};