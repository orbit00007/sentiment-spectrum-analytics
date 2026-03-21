import { ResultsProvider, useResults } from "@/results/context/ResultsContext";
import { Layout } from "@/results/layout/Layout";
import OverviewContent from "./OverviewContent";
import PromptsContent from "./PromptsContent";
import SourcesAllContent from "./SourcesAllContent";
import CompetitorsComparisonsContent from "./CompetitorsComparisonsContent";
import ExecutiveSummaryContent from "./ExecutiveSummaryContent";
import RecommendationsContent from "./RecommendationsContent";
import AIReadinessContent from "./AIReadinessContent";
import AnalysisPipelineScreen from "@/results/loading/AnalysisPipelineScreen";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserScopedKey, STORAGE_KEYS } from "@/lib/storageKeys";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import planExpiredImage from "@/assets/plan-expired.png";

const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
};

/** Full-page overlay when free trial has expired — blocks all results */
const FreeTrialExpiredOverlay = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <img
        src={planExpiredImage}
        alt="Plan expired"
        className="w-full max-w-2xl rounded-2xl border border-border shadow-lg mb-8"
      />
      <h2 className="text-2xl font-bold text-foreground mb-2">Your free trial has ended</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Choose a plan to continue accessing your dashboard, analytics, and AI insights.
      </p>
      <Button
        size="lg"
        className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        onClick={() => navigate("/billing")}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Choose a Plan
      </Button>
    </div>
  );
};

/** Plan expiration banner — shown when paid plan is expired */
const PlanExpiredBanner = () => {
  const { pricingPlan, planExpiresAt } = useAuth();
  const navigate = useNavigate();

  if (!planExpiresAt) return null;
  const isExpired = Date.now() / 1000 > planExpiresAt;
  if (!isExpired) return null;
  // Free plan shows full overlay, not banner
  if (pricingPlan === "free") return null;

  return (
    <div className="mx-auto max-w-4xl mt-6 mb-4 px-4">
      <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
              Your {pricingPlan.charAt(0).toUpperCase() + pricingPlan.slice(1)} plan has expired
            </p>
            <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
              Renew your plan to restore full access to analytics and features.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-amber-500 text-white hover:bg-amber-600 font-semibold flex-shrink-0 border-0"
          onClick={() => navigate("/billing")}
        >
          Renew Plan <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>
    </div>
  );
};

const ResultsContent = () => {
  const { activeTab, dataReady, currentAnalytics, analyticsList, isAnalyzing } = useResults();
  const location = useLocation();

  // Pipeline should ONLY be shown when navigating from the input page
  // (location.state?.isNew === true) for the very first analysis
  const cameFromInputPage = !!(location.state as any)?.isNew;

  const [pipelineDone, setPipelineDone] = useState(!cameFromInputPage);
  const hasCompletedPipelineRef = useRef(false);

  // If user didn't come from input page, never show pipeline
  useEffect(() => {
    if (!cameFromInputPage && !pipelineDone) {
      setPipelineDone(true);
    }
  }, [cameFromInputPage, pipelineDone]);

  useEffect(() => {
    if (pipelineDone) {
      scrollToTop();
    }
  }, [location.pathname, activeTab, pipelineDone]);

  const analyticsData =
    currentAnalytics?.analytics?.[0]?.analytics ??
    currentAnalytics?.analytics ??
    null;
  const isAlreadyCompleted =
    currentAnalytics?.status?.toLowerCase() === "completed";

  if (!pipelineDone) {
    return (
      <Layout hideNav>
        <AnalysisPipelineScreen
          dataReady={dataReady}
          analyticsData={analyticsData}
          onComplete={() => {
            scrollToTop();
            setPipelineDone(true);
            hasCompletedPipelineRef.current = true;
            // Set first_analysis flag to "0" so it's recorded
            try {
              const key = getUserScopedKey(STORAGE_KEYS.FIRST_ANALYSIS);
              localStorage.setItem(key, "0");
            } catch {}
          }}
          isAlreadyCompleted={isAlreadyCompleted}
        />
      </Layout>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewContent />;
      case "executive-summary":
        return <ExecutiveSummaryContent />;
      case "prompts":
        return <PromptsContent />;
      case "sources-all":
        return <SourcesAllContent />;
      case "competitors-comparisons":
        return <CompetitorsComparisonsContent />;
      case "recommendations":
        return <RecommendationsContent />;
      case "ai-readiness-checker":
        return <AIReadinessContent />;
      default:
        return <OverviewContent />;
    }
  };

  return (
    <Layout>
      <PlanExpiredBanner />
      {renderContent()}
      <div className="md:w-full md:h-[100px]" />
    </Layout>
  );
};

const LoadingBootstrap = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const NewResultsContainer = () => {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    console.log("🎬 [NewResultsContainer] Mount - checking auth");
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.log("🔒 [NewResultsContainer] No token - will redirect in context");
    }
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  if (initializing) {
    return <LoadingBootstrap />;
  }

  return (
    <ResultsProvider>
      <ResultsContent />
    </ResultsProvider>
  );
};

export default NewResultsContainer;
