import { ResultsProvider, useResults } from "@/results/context/ResultsContext";
import { Layout } from "@/results/layout/Layout";
import OverviewContent from "./OverviewContent";
import PromptsContent from "./PromptsContent";
import SourcesAllContent from "./SourcesAllContent";
import CompetitorsComparisonsContent from "./CompetitorsComparisonsContent";
import ExecutiveSummaryContent from "./ExecutiveSummaryContent";
import RecommendationsContent from "./RecommendationsContent";
import AnalysisPipelineScreen from "@/results/loading/AnalysisPipelineScreen";
import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getUserScopedKey, STORAGE_KEYS } from "@/lib/storageKeys";

const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
};

const ResultsContent = () => {
  const { activeTab, dataReady, currentAnalytics } = useResults();
  const location = useLocation();

  // Check if pipeline should be skipped (first_analysis already "0")
  const shouldSkipPipeline = useMemo(() => {
    try {
      const key = getUserScopedKey(STORAGE_KEYS.FIRST_ANALYSIS);
      const val = localStorage.getItem(key);
      return val === "0";
    } catch {
      return false;
    }
  }, []);

  const [pipelineDone, setPipelineDone] = useState(shouldSkipPipeline);

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
      default:
        return <OverviewContent />;
    }
  };

  return (
    <Layout>
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