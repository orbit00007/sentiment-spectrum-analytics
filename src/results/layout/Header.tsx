import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  checkJourneyAccess,
  PLAN_LIMITS,
  type PricingPlanName,
} from "@/lib/plans";
import {
  Menu,
  X,
  User,
  LogOut,
  RefreshCw,
  Plus,
  Loader2,
  FileDown,
  History,
  Check,
  ChevronDown,
  CreditCard,
  MailPlus,
  Lock,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { regenerateAnalysis } from "@/apiHelpers";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisState } from "@/hooks/useAnalysisState";
import { getSecureProductId } from "@/lib/secureStorage";
import {
  isAnalyticsCooldownActive,
  getAnalyticsCooldownText,
} from "@/lib/dateUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResults, TabType } from "@/results/context/ResultsContext";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";
import { generateReport } from "@/results/layout/downloadReport";
import { getBrandName } from "@/results/data/analyticsData";
import { getSecureAccessToken } from "@/lib/secureStorage";

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

// Analysis Animation Component - Figma-matching pill design
const AnalyzingAnimation = ({
  hasError = false,
  hasCompleted = false,
  onRetry,
}: {
  hasError?: boolean;
  hasCompleted?: boolean;
  onRetry?: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Creating Queries",
    "Searching LLMs",
    "Processing Data",
    "Analyzing Results",
    "Building Report",
  ];

  useEffect(() => {
    if (hasError || hasCompleted) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [hasError, hasCompleted]);

  if (hasCompleted) {
    return (
      <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/40">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </span>
        <span className="text-sm font-semibold text-green-700 dark:text-green-400">
          Analysis Complete
        </span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40">
        <span className="relative flex h-3 w-3">
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
        <span className="text-sm font-semibold text-red-700 dark:text-red-400">
          Analysis Failed
        </span>
        {onRetry && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/40">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
      </span>
      <span className="text-sm font-semibold text-orange-700 dark:text-orange-400 transition-all duration-500">
        {steps[currentStep]}
      </span>
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
  // Track whether we were actually in an analysis state before data arrived
  const [wasAnalyzing, setWasAnalyzing] = useState(false);
  const hasMountedRef = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    logout,
    products,
    userRoleInt,
    planInt,
    planExpiresAt,
    pricingPlan,
  } = useAuth();
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
    switchToAnalytics,
    nextAnalyticsGenerationTime,
  } = useResults();
  const { toggleSidebar } = useSidebar();
  const {
    isAnalyzing: analysisLocked,
    startAnalysis,
    completeAnalysis,
  } = useAnalysisState();

  // Analysis is in progress if loading and no data ready yet, OR if analyzing via hook
  const isAnalysisInProgress = (isLoading && !dataReady) || isAnalyzing;

  // Helper to build a unique key for tracking shown completions per user+analytics
  const getCompletionShownKey = useCallback(() => {
    const userId = user?.id || "unknown";
    const analyticsId = selectedAnalyticsId || "default";
    return `analysis_completed_shown_${userId}_${analyticsId}`;
  }, [user, selectedAnalyticsId]);

  // Only mark wasAnalyzing when user explicitly triggers regeneration
  // Do NOT react to isAnalysisInProgress — it's briefly true on every page load
  // which would falsely trigger the completion pill on login/refresh
  useEffect(() => {
    if (isRegenerating) {
      setWasAnalyzing(true);
      // Clear the shown flag when a NEW analysis starts so completion can show once
      try {
        localStorage.removeItem(getCompletionShownKey());
      } catch {}
    }
  }, [isRegenerating, getCompletionShownKey]);

  // Also track real server-side analysis (isAnalyzing from polling), but only
  // AFTER the component has mounted — skip the initial render cycle entirely
  // to prevent falsely triggering the completion pill on login/refresh
  useEffect(() => {
    if (!hasMountedRef.current) {
      // Skip the very first evaluation — this is the initial page load
      hasMountedRef.current = true;
      return;
    }
    if (isAnalyzing && !dataReady) {
      setWasAnalyzing(true);
    }
  }, [isAnalyzing, dataReady]);

  // Only show "Analysis Complete" once per analysis, tied to user+analytics ID
  useEffect(() => {
    if (dataReady && !isLoading && !isAnalyzing && wasAnalyzing) {
      setIsRegenerating(false);
      setAnalysisError(false);
      setWasAnalyzing(false);
      completeAnalysis();

      // Check if we already showed completion for this user+analytics combo
      const key = getCompletionShownKey();
      const alreadyShown = localStorage.getItem(key);
      if (!alreadyShown) {
        setAnalysisCompleted(true);
        localStorage.setItem(key, Date.now().toString());
        // No auto-clear — pill stays visible until page is refreshed
      }
    }
    // If data is ready on mount but we were never analyzing, just clean up
    if (dataReady && !isLoading && !isAnalyzing && !wasAnalyzing) {
      setIsRegenerating(false);
      completeAnalysis();
    }
  }, [
    dataReady,
    isLoading,
    isAnalyzing,
    wasAnalyzing,
    completeAnalysis,
    getCompletionShownKey,
  ]);

  // Plan expiry check
  const isPlanExpired = planExpiresAt ? Date.now() / 1000 > planExpiresAt : false;
  const isFreePlan = pricingPlan === "free";
  const isPaidPlanExpired = isPlanExpired && !isFreePlan;

  // Compute cooldown using plan-aware midnight-based logic
  const planLimits =
    PLAN_LIMITS[pricingPlan as PricingPlanName] || PLAN_LIMITS.free;
  const lastRunDate = analyticsList?.[0]?.created_at || null;
  const isCooldownBlocked = lastRunDate
    ? isAnalyticsCooldownActive(lastRunDate, planLimits.analyticsCooldownHrs)
    : false;
  const cooldownTimeLeft = lastRunDate
    ? getAnalyticsCooldownText(lastRunDate, planLimits.analyticsCooldownHrs)
    : null;

  // Journey-based access checks
  const canGenerateAnalytics = checkJourneyAccess(
    "analytics:generate",
    userRoleInt,
    planInt,
    planExpiresAt
  ).allowed;
  const canExportReport = checkJourneyAccess(
    "report:export",
    userRoleInt,
    planInt,
    planExpiresAt
  ).allowed;
  const canInviteUsers =
    userRoleInt <= 1 ||
    checkJourneyAccess("admin:invite-user", userRoleInt, planInt, planExpiresAt)
      .allowed;
  const canManageBilling = checkJourneyAccess(
    "admin:manage-app",
    userRoleInt,
    planInt,
    planExpiresAt
  ).allowed;

  const actionsDisabled =
    isAnalysisInProgress ||
    isRegenerating ||
    analysisLocked ||
    isCooldownBlocked ||
    !canGenerateAnalytics ||
    isPlanExpired;

  useEffect(() => {
    const storedProductId = getSecureProductId();
    setProductId(storedProductId || null);
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
    if (isPlanExpired) {
      navigate("/billing", { state: { from: location.pathname } });
      return;
    }
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
    if (isPlanExpired) {
      navigate("/billing", { state: { from: location.pathname } });
      return;
    }
    if (!productId) return;
    if (actionsDisabled) return;

    setIsRegenerating(true);
    setAnalysisError(false);
    setAnalysisCompleted(false);
    startAnalysis(productId);

    try {
      const accessToken = getSecureAccessToken();
      await regenerateAnalysis(productId, accessToken);

      toast({
        title: "Analysis in Progress",
        description:
          "Your analysis has begun. You'll receive a notification on your email when it's ready.",
        duration: Infinity,
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
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canSeeMore = planInt >= 3; // enterprise / agency
  const ITEMS_PER_PAGE = 12;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const paginatedItems = canSeeMore
    ? analyticsList.slice(0, visibleCount)
    : analyticsList; // backend already filtered by plan
  const hasMore = canSeeMore && visibleCount < analyticsList.length;
  const showUpgradePrompt = !canSeeMore; // always show for free / launch / grow

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
            {(isAnalysisInProgress ||
              isRegenerating ||
              analysisLocked ||
              analysisError ||
              analysisCompleted) && (
              <div className="flex items-center">
                <AnalyzingAnimation
                  hasError={analysisError}
                  hasCompleted={analysisCompleted}
                  onRetry={handleRegenerateAnalysis}
                />
              </div>
            )}

            {/* Previous Analytics Dropdown — always show for free/launch/grow, or when there are multiple runs */}
            {analyticsList && (analyticsList.length >= 1 || showUpgradePrompt) && (
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

                <DropdownMenuContent align="end" className="w-56 p-0">
                  <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Past Runs
                  </div>

                  <div className="py-1 max-h-[320px] overflow-y-auto">
                    {paginatedItems.map((item, index) => {
                      const isLatest = index === 0;
                      const isSelected =
                        selectedAnalyticsId === item.analytics_id;
                      const formattedDate = new Date(
                        item.created_at
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      return (
                        <DropdownMenuItem
                          key={item.analytics_id}
                          onClick={() => switchToAnalytics(item.analytics_id)}
                          disabled={isSwitchingAnalytics}
                          className={cn(
                            "px-3 py-2 cursor-pointer",
                            isSelected && "bg-muted focus:bg-muted"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {formattedDate}
                            </span>
                            {isLatest && (
                              <span className="text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400 px-1.5 py-0.5 rounded">
                                Latest
                              </span>
                            )}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>

                  {/* View More (enterprise/agency only) */}
                  {hasMore && (
                    <div className="border-t border-border p-1">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>
                          View more ({analyticsList.length - visibleCount}{" "}
                          remaining)
                        </span>
                      </DropdownMenuItem>
                    </div>
                  )}

                  {/* Upgrade prompt — always shown for free / launch / grow regardless of run count */}
                  {showUpgradePrompt && (
                    <div className="border-t border-border p-1">
                      <DropdownMenuItem
                        onClick={() =>
                          navigate("/billing", {
                            state: { from: location.pathname },
                          })
                        }
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Upgrade to see more runs</span>
                      </DropdownMenuItem>
                    </div>
                  )}

                  {/* Regenerate Analysis */}
                  <div className="border-t border-border p-1">
                    <DropdownMenuItem
                      onClick={handleRegenerateAnalysis}
                      disabled={actionsDisabled && !isPlanExpired}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm font-medium cursor-pointer",
                        isPlanExpired
                          ? "text-amber-600 focus:text-amber-600"
                          : "text-primary focus:text-primary",
                        actionsDisabled && !isPlanExpired && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isPlanExpired ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{isFreePlan ? "Choose a Plan" : "Plan Expired"}</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw
                            className={cn(
                              "w-3.5 h-3.5",
                              isRegenerating && "animate-spin"
                            )}
                          />
                          <span>
                            {isCooldownBlocked
                              ? `Regenerate (${cooldownTimeLeft})`
                              : "Regenerate Analysis"}
                          </span>
                        </>
                      )}
                    </DropdownMenuItem>
                  </div>
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
              <span className="hidden sm:inline">
                {isCooldownBlocked
                  ? `New Analysis (${cooldownTimeLeft})`
                  : "New Analysis"}
              </span>
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
                <DropdownMenuContent
                  className="w-56 bg-card border-border p-0"
                  align="end"
                  forceMount
                >
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-sm font-bold text-foreground">
                      {user.first_name}{" "}
                      {user.last_name ? `${user.last_name}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <DropdownMenuItem
                      onClick={() =>
                        navigate("/settings", {
                          state: { from: location.pathname },
                        })
                      }
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-primary font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate("/billing", {
                          state: { from: location.pathname },
                        })
                      }
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    {canInviteUsers && (
                      <DropdownMenuItem
                        onClick={() =>
                          navigate("/invite", {
                            state: { from: location.pathname },
                          })
                        }
                        className="flex items-center gap-2.5 px-3 py-2 cursor-pointer"
                      >
                        <MailPlus className="w-4 h-4" />
                        <span>Invite Team</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </div>
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