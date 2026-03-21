import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { getProductAnalytics, getAnalyticsList, getAnalyticsById, getAnalyticsTrendSummary, AnalyticsListItem, TrendRunItem, regenerateAnalysis } from "@/apiHelpers";
import { setAnalyticsData, clearCurrentAnalyticsData } from "@/results/data/analyticsData";
import { clearAnalyticsDataForCurrentUser } from "@/lib/storageKeys";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { handleUnauthorized, isUnauthorizedError } from "@/lib/authGuard";
import { useAnalysisState } from "@/hooks/useAnalysisState";
import { getEmailScopedKey, STORAGE_KEYS } from "@/lib/storageKeys";
import { getSecureAccessToken, getSecureProductId } from "@/lib/secureStorage";

interface AnalyticsData {
  id?: string;
  product_id?: string;
  date?: string;
  status?: string;
  analytics?: any;
  created_at?: string;
  updated_at?: string;
}

export type TabType = 
  | "overview" 
  | "executive-summary" 
  | "prompts" 
  | "sources-all" 
  | "competitors-comparisons"
  | "recommendations"
  | "content-impact-analysis"
  | "ai-readiness-checker";

interface ResultsContextType {
  productData: any;
  currentAnalytics: AnalyticsData | null;
  previousAnalytics: AnalyticsData | null;
  isLoading: boolean;
  dataReady: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAnalyzing: boolean;
  analyticsList: AnalyticsListItem[];
  isAnalyticsListLoading: boolean;
  isSwitchingAnalytics: boolean;
  selectedAnalyticsId: string | null;
  refreshAnalyticsList: (limit?: number) => Promise<void>;
  switchToAnalytics: (analyticsId: string) => Promise<void>;
  analyticsVersion: number;
  trendRuns: TrendRunItem[];
  nextAnalyticsGenerationTime: string | null;
}

export const ResultsContext = createContext<ResultsContextType | null>(null);

export const useResults = () => {
  const context = useContext(ResultsContext);
  if (!context) {
    throw new Error("useResults must be used within a ResultsProvider");
  }
  return context;
};

interface ResultsProviderProps {
  children: React.ReactNode;
}

export const ResultsProvider: React.FC<ResultsProviderProps> = ({ children }) => {
  const [productData, setProductData] = useState<any>(null);
  const [currentAnalytics, setCurrentAnalytics] = useState<AnalyticsData | null>(null);
  const [previousAnalytics, setPreviousAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataReady, setDataReady] = useState<boolean>(false);
  const [activeTab, setActiveTabState] = useState<TabType>("overview");
  const [analyticsList, setAnalyticsList] = useState<AnalyticsListItem[]>([]);
  const [isAnalyticsListLoading, setIsAnalyticsListLoading] = useState<boolean>(false);
  const [isSwitchingAnalytics, setIsSwitchingAnalytics] = useState<boolean>(false);
  const [trendRuns, setTrendRuns] = useState<TrendRunItem[]>([]);
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState<string | null>(null);
  const [analyticsVersion, setAnalyticsVersion] = useState<number>(0);
  const [nextAnalyticsGenerationTime, setNextAnalyticsGenerationTime] = useState<string | null>(null);

  const { products } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    isAnalyzing, 
    triggeredAt, 
    completeAnalysis, 
    isNewerThanTrigger,
    startAnalysis 
  } = useAnalysisState();

  const pathToTab: Record<string, TabType> = {
    "/results": "overview",
    "/results/executive-summary": "executive-summary",
    "/results/prompts": "prompts",
    "/results/sources-all": "sources-all",
    "/results/competitors-comparisons": "competitors-comparisons",
    "/results/ai-readiness-checker": "ai-readiness-checker",
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const matchedTab = pathToTab[currentPath];
    if (matchedTab && matchedTab !== activeTab) {
      setActiveTabState(matchedTab);
    }
  }, [location.pathname]);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    const tabToPath: Record<TabType, string> = {
      "overview": "/results",
      "executive-summary": "/results/executive-summary",
      "prompts": "/results/prompts",
      "sources-all": "/results/sources-all",
      "competitors-comparisons": "/results/competitors-comparisons",
      "recommendations": "/results/recommendations",
      "content-impact-analysis": "/results/content-impact-analysis",
      "ai-readiness-checker": "/results/ai-readiness-checker",
    };
    const targetPath = tabToPath[tab];
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  };

  const POLL_FIRST_DELAY_MS = 5 * 60 * 1000; // First poll after 5 minutes
  const POLL_INTERVAL_MS = 2 * 60 * 1000;   // Subsequent polls every 2 minutes
  const POLL_MAX_ATTEMPTS = 5;               // 5 polls per batch
  const POLL_COOLDOWN_MS = 10 * 60 * 1000;   // 10 minute cooldown between batches

  const pollingTimerRef = useRef<number>();
  const hasShownStartMessageRef = useRef(false);
  const previousAnalyticsRef = useRef<AnalyticsData | null>(null);
  const isPollingRef = useRef(false);
  const mountedRef = useRef(true);
  const currentProductIdRef = useRef<string | null>(null);
  const pollingAttemptsRef = useRef(0);
  const cooldownTimerRef = useRef<number>();
  const isInCooldownRef = useRef(false);
  const hasReceivedDataRef = useRef(false);
  const accessTokenRef = useRef<string>("");
  const hasFetchedRef = useRef(false);
  const isLoadingListRef = useRef(false);
  const toastRef = useRef(toast);
  const hasShownCompletionToastRef = useRef(false);
  const pageLoadTimestampRef = useRef<number>(Date.now());
  const analyticsCacheKeyRef = useRef<string>("");
  
  const getCompletionToastShownKey = useCallback(() => {
    return getEmailScopedKey(STORAGE_KEYS.COMPLETION_TOAST_SHOWN);
  }, []);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    previousAnalyticsRef.current = previousAnalytics;
  }, [previousAnalytics]);

  useEffect(() => {
    accessTokenRef.current = getSecureAccessToken();
    analyticsCacheKeyRef.current = getEmailScopedKey(STORAGE_KEYS.PREVIOUS_ANALYTICS_CACHE);
  }, []);

  const loadAnalyticsCache = useCallback((): Record<string, any> => {
    const key = analyticsCacheKeyRef.current;
    if (!key) return {};
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, any>;
      }
    } catch (e) {
      console.error("Failed to parse analytics cache:", e);
    }
    return {};
  }, []);

  const saveAnalyticsCache = useCallback((cache: Record<string, any>) => {
    const key = analyticsCacheKeyRef.current;
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(cache));
    } catch (e) {
      console.error("Failed to save analytics cache:", e);
    }
  }, []);

  const pruneAnalyticsCache = useCallback((validIds: string[]) => {
    if (!validIds || validIds.length === 0) {
      const key = analyticsCacheKeyRef.current;
      if (key) {
        try {
          localStorage.removeItem(key);
        } catch {
          // ignore
        }
      }
      return;
    }
    const cache = loadAnalyticsCache();
    const validSet = new Set(validIds);
    let changed = false;
    Object.keys(cache).forEach((id) => {
      if (!validSet.has(id)) {
        delete cache[id];
        changed = true;
      }
    });
    if (changed) {
      saveAnalyticsCache(cache);
    }
  }, [loadAnalyticsCache, saveAnalyticsCache]);

  // Load existing data from localStorage on mount
  useEffect(() => {
    const loadExistingData = () => {
      try {
        const lastDataKey = getEmailScopedKey(STORAGE_KEYS.LAST_ANALYSIS_DATA);
        const stored = localStorage.getItem(lastDataKey);
        
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.analytics?.length > 0) {
            const latestAnalysis = parsed.analytics[0];
            
            if (latestAnalysis.status?.toLowerCase() === "completed") {
              console.log("📦 [MOUNT] Loading completed analysis from localStorage");
              setCurrentAnalytics(latestAnalysis);
              setPreviousAnalytics(latestAnalysis);
              setDataReady(true);
              setIsLoading(false);
              
              // Prevent poll from re-showing toast for already-loaded data
              hasReceivedDataRef.current = true;
              hasShownCompletionToastRef.current = true;
              
              // Also update analyticsData cache
              setAnalyticsData(parsed);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load existing data:", e);
      }
    };
    
    loadExistingData();
  }, []);

  const scheduleNextPoll = useCallback(
    (productId: string) => {
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
      }

      if (hasReceivedDataRef.current) {
        console.log("✅ [SCHEDULE] Data already received - no more polls");
        return;
      }

      // Use first delay (5 min) for the first poll, then regular interval (2 min)
      const isFirstPoll = pollingAttemptsRef.current === 0;
      const delay = isFirstPoll ? POLL_FIRST_DELAY_MS : POLL_INTERVAL_MS;

      console.log(`⏱️ [SCHEDULE] Scheduling next poll in ${delay / 60000} minutes (attempt ${pollingAttemptsRef.current})...`);
      pollingTimerRef.current = window.setTimeout(() => {
        if (
          mountedRef.current &&
          currentProductIdRef.current === productId &&
          !hasReceivedDataRef.current
        ) {
          isPollingRef.current = false;
          pollProductAnalytics(productId);
        }
      }, delay);
    },
    []
  );

  const pollProductAnalytics = useCallback(
    async (productId: string) => {
      pollingAttemptsRef.current += 1;
      const attemptNum = pollingAttemptsRef.current;
      console.log(`[POLL] Starting poll #${attemptNum} for product:`, productId);

      if (!mountedRef.current) {
        console.log("[POLL] Component unmounted - aborting");
        return;
      }

      if (isInCooldownRef.current) {
        console.log("[POLL] In cooldown period - skipping poll");
        return;
      }

      if (hasReceivedDataRef.current) {
        console.log("✅ [POLL] Already received completed/failed data - stopping all polling");
        return;
      }

      if (isPollingRef.current) {
        console.log("[POLL] Already polling - skipping");
        return;
      }

      if (!productId || !accessTokenRef.current) {
        console.log("[POLL] Missing productId or accessToken");
        if (!accessTokenRef.current) {
          console.log("🔒 [POLL] No access token - redirecting to login");
          handleUnauthorized();
        }
        return;
      }

      if (pollingAttemptsRef.current >= POLL_MAX_ATTEMPTS) {
        console.log(
          `🛑 [POLL] Reached max poll limit (${POLL_MAX_ATTEMPTS}) - entering ${POLL_COOLDOWN_MS / 60000} min cooldown`
        );
        isInCooldownRef.current = true;

        if (pollingTimerRef.current) {
          clearTimeout(pollingTimerRef.current);
          pollingTimerRef.current = undefined;
        }

        cooldownTimerRef.current = window.setTimeout(() => {
          if (
            mountedRef.current &&
            !hasReceivedDataRef.current &&
            currentProductIdRef.current === productId
          ) {
            console.log("[POLL] Cooldown complete - resetting counter and starting new batch");
            pollingAttemptsRef.current = 0;
            isInCooldownRef.current = false;
            pollProductAnalytics(productId);
          }
        }, POLL_COOLDOWN_MS);

        return;
      }

      isPollingRef.current = true;
      console.log(`✅ [POLL] Lock acquired, attempt ${pollingAttemptsRef.current}/${POLL_MAX_ATTEMPTS}`);

      try {
        const res = await getProductAnalytics(productId, accessTokenRef.current);
        console.log("[POLL] Analytics response received:", res);

        if (!mountedRef.current) {
          console.log("[POLL] Component unmounted during fetch - aborting");
          return;
        }

        if (hasReceivedDataRef.current) {
          console.log("✅ [POLL] Data received while fetching - aborting");
          return;
        }

        if (res && res.analytics && Array.isArray(res.analytics)) {
          const mostRecentAnalysis = res.analytics[0];

          if (mostRecentAnalysis) {
            const currentStatus = mostRecentAnalysis.status?.toLowerCase() || "";
            const currentDate =
              mostRecentAnalysis.date ||
              mostRecentAnalysis.updated_at ||
              mostRecentAnalysis.created_at;

            const analysisTimestamp = currentDate ? new Date(currentDate).getTime() : 0;
            const isNewData = isNewerThanTrigger(analysisTimestamp);

            console.log(`[POLL] Analysis date: ${currentDate}, Trigger time: ${triggeredAt ? new Date(triggeredAt).toISOString() : 'none'}, isNew: ${isNewData}`);

            // COMPLETED or FAILED = STOP ONLY IF it's NEWER analysis
            if ((currentStatus === "completed" || currentStatus === "failed") && isNewData) {
              hasReceivedDataRef.current = true;
              pollingAttemptsRef.current = 0;
              
              // CRITICAL FIX: Clear old data FIRST
              console.log("🧹 [POLL] Clearing old data from storage");
              clearAnalyticsDataForCurrentUser();
              clearCurrentAnalyticsData();
              
              // CRITICAL FIX: Save new data to localStorage IMMEDIATELY
              console.log("💾 [POLL] Saving new data to localStorage immediately");
              const dataToSave = {
                analytics: [mostRecentAnalysis],
                count: 1,
                limit: 1,
                product_id: productId,
              };
              
              // Save to email-scoped key
              const lastDataKey = getEmailScopedKey(STORAGE_KEYS.LAST_ANALYSIS_DATA);
              const lastDateKey = getEmailScopedKey(STORAGE_KEYS.LAST_ANALYSIS_DATE);
              
              try {
                localStorage.setItem(lastDataKey, JSON.stringify(dataToSave));
                if (currentDate) {
                  localStorage.setItem(lastDateKey, currentDate);
                }
                console.log("✅ [POLL] New data saved to localStorage successfully");
              } catch (e) {
                console.error("❌ [POLL] Failed to save to localStorage:", e);
              }
              
              // Also update analyticsData cache
              setAnalyticsData(dataToSave);
              
              // Clear analysis state
              completeAnalysis();

              // Clear all timers
              if (pollingTimerRef.current) {
                clearTimeout(pollingTimerRef.current);
                pollingTimerRef.current = undefined;
              }
              if (cooldownTimerRef.current) {
                clearTimeout(cooldownTimerRef.current);
                cooldownTimerRef.current = undefined;
              }

              // Update React state
              setCurrentAnalytics(mostRecentAnalysis);
              setPreviousAnalytics(mostRecentAnalysis);
              setDataReady(true);
              setIsLoading(false);
              
              // Increment version to force component re-renders
              setAnalyticsVersion(prev => prev + 1);

              // Show notification ONLY once per analysis ID
              const analysisId = mostRecentAnalysis?.id || '';
              const toastShownKey = getCompletionToastShownKey();
              const shownForIds = (() => {
                try {
                  return JSON.parse(localStorage.getItem(toastShownKey) || '[]');
                } catch { return []; }
              })();
              const alreadyShownForThisAnalysis = shownForIds.includes(analysisId);

              // ─── COMPLETED TOAST ───────────────────────────────────────────
              // Only show if: not already shown, not shown for this analysis ID,
              // AND the user is NOT currently on the pipeline screen (first_analysis != "0" means pipeline may be showing)
              const isPipelineActive = (() => {
                try {
                  const faKey = getEmailScopedKey(STORAGE_KEYS.FIRST_ANALYSIS);
                  const faVal = localStorage.getItem(faKey);
                  // Pipeline is active if first_analysis flag is NOT "0" (hasn't been dismissed yet)
                  return faVal !== "0";
                } catch { return false; }
              })();

              if (currentStatus === "completed" && !hasShownCompletionToastRef.current && !alreadyShownForThisAnalysis && !isPipelineActive) {
                // Use triggeredAt (regen flow) if available, otherwise fall back to page load timestamp
                const referenceTimestamp = triggeredAt ?? pageLoadTimestampRef.current;
                const analysisCompletedAfterReference = analysisTimestamp > referenceTimestamp;

                if (analysisCompletedAfterReference) {
                  hasShownCompletionToastRef.current = true;
                  
                  // Persist shown flag for this analysis ID
                  try {
                    const updated = [...shownForIds, analysisId].slice(-20);
                    localStorage.setItem(toastShownKey, JSON.stringify(updated));
                  } catch {}

                  // Compute snapshot stats
                  const analyticsPayload = mostRecentAnalysis?.analytics?.[0]?.analytics ?? mostRecentAnalysis?.analytics ?? {};
                  const searchKeywords = analyticsPayload?.search_keywords || {};
                  let promptsExecuted = 0;
                  Object.values(searchKeywords).forEach((kw: any) => {
                    if (Array.isArray(kw?.prompts)) promptsExecuted += kw.prompts.length;
                  });
                  const llmData = analyticsPayload?.llm_wise_data || {};
                  const aiModelsAnalyzed = Object.keys(llmData).length || (analyticsPayload?.models_used ? analyticsPayload.models_used.split(",").length : 0);
                  const responsesProcessed = promptsExecuted * Math.max(aiModelsAnalyzed, 1);
                  const sourcesData = analyticsPayload?.sources_and_content_impact || {};
                  const citationsMapped = Object.keys(sourcesData).length;
                  const brands = analyticsPayload?.brands || [];
                  const competitorsDetected = Math.max(0, brands.length - 1);

                  toastRef.current({
                    title: "🎉 Analysis Updated",
                    description: React.createElement(
                      "div",
                      { className: "flex flex-col gap-3" },
                      React.createElement(
                        "p",
                        { className: "whitespace-pre-line text-sm" },
                        [
                          "Analysis Snapshot",
                          `Prompts executed:                    ${promptsExecuted}`,
                          `AI models analyzed:                ${aiModelsAnalyzed}`,
                          `Responses processed:             ${responsesProcessed}`,
                          `Sources:                                    ${citationsMapped}`,
                          `Competitors detected:              ${competitorsDetected}`,
                        ].join("\n")
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: () => window.location.reload(),
                          className: "w-full bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 text-xs md:text-sm font-medium rounded-md text-center",
                        },
                        "Refresh Page"
                      )
                    ),
                    duration: Infinity,
                  });
                  console.log("🎉 [POLL] Showing Analysis Updated notification");
                } else {
                  console.log("✅ [POLL] Analysis predates reference timestamp - skipping toast");
                }
              }

              // ─── FAILED TOAST ──────────────────────────────────────────────
              if (currentStatus === "failed" && !hasShownCompletionToastRef.current && !alreadyShownForThisAnalysis) {
                // Same timestamp guard as completed — skip stale failed analyses
                const referenceTimestamp = triggeredAt ?? pageLoadTimestampRef.current;
                const analysisFailedAfterReference = analysisTimestamp > referenceTimestamp;

                if (analysisFailedAfterReference) {
                  hasShownCompletionToastRef.current = true;

                  // Persist shown flag
                  try {
                    const updated = [...shownForIds, analysisId].slice(-20);
                    localStorage.setItem(toastShownKey, JSON.stringify(updated));
                  } catch {}

                  const funnyMessages = [
                    "Oops! Our AI had a little hiccup 🤖💫 Want to give it another shot?",
                    "Well, that didn't go as planned! 😅 Shall we try again?",
                    "Our analysis engine tripped over its own feet! 🙈 Want to give it another shot?",
                    "Houston, we had a problem! 🚀 But we're ready to launch again!",
                  ];
                  const randomMsg = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

                  toastRef.current({
                    title: "❌ Analysis Failed",
                    description: React.createElement(
                      "div",
                      { className: "flex flex-col gap-3" },
                      React.createElement(
                        "p",
                        { className: "text-sm" },
                        randomMsg
                      ),
                      React.createElement(
                        "button",
                        {
                          onClick: async () => {
                            try {
                              const token = getSecureAccessToken();
                              await regenerateAnalysis(productId, token);
                              toastRef.current({
                                title: "🔄 Analysis Restarted",
                                description: "Hang tight! We're giving it another go.",
                                duration: Infinity,
                              });
                            } catch {
                              toastRef.current({
                                title: "Error",
                                description: "Failed to restart analysis. Please try again.",
                                variant: "destructive",
                              });
                            }
                          },
                          className: "w-full bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 text-xs md:text-sm font-medium rounded-md text-center",
                        },
                        "🔄 Retry Analysis"
                      )
                    ),
                    duration: Infinity,
                  });
                  console.log("❌ [POLL] Showing Analysis Failed notification");
                } else {
                  console.log("✅ [POLL] Failed analysis predates reference timestamp - skipping toast");
                }
              }

              console.log(`✅ [POLL] Analysis ${currentStatus.toUpperCase()} - ALL polling stopped, data saved`);
              return;
            }

            // OLD completed data found but waiting for NEW analysis
            if ((currentStatus === "completed" || currentStatus === "failed") && !isNewData) {
              console.log(`⏳ [POLL] Found OLD ${currentStatus} analysis - waiting for NEW analysis`);
              
              // Show old data while waiting
              if (!currentAnalytics) {
                setCurrentAnalytics(mostRecentAnalysis);
                setPreviousAnalytics(mostRecentAnalysis);
                setDataReady(true);
              }
              
              setIsLoading(true);

              if (!hasShownStartMessageRef.current && mountedRef.current) {
                toastRef.current({
                  title: "Analysis in Progress",
                  description: "Your new analysis has begun. You'll receive a notification on your email when it's ready.",
                  duration: Infinity,
                });
                hasShownStartMessageRef.current = true;
              }

              scheduleNextPoll(productId);
              return;
            }

            // IN_PROGRESS or ERROR
            if (currentStatus === "error" || currentStatus === "in_progress") {
              if (!currentAnalytics) {
                setCurrentAnalytics(mostRecentAnalysis);
              }

              setIsLoading(true);

              if (!hasShownStartMessageRef.current && mountedRef.current) {
                toastRef.current({
                  title: "Analysis in Progress",
                  description: "Your analysis has begun. You'll receive a notification on your email when it's ready.",
                  duration: Infinity,
                });
                hasShownStartMessageRef.current = true;
              }

              scheduleNextPoll(productId);
              return;
            }

            // Unknown status
            if (!currentAnalytics) {
              setCurrentAnalytics(mostRecentAnalysis);
            }
            setIsLoading(true);
            console.log(`⚠️ [POLL] Unknown status "${currentStatus}" - continuing polling`);
            scheduleNextPoll(productId);
          } else {
            console.log("⚠️ [POLL] No analysis found - scheduling next poll");
            setIsLoading(true);
            scheduleNextPoll(productId);
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err: any) {
        console.error(`❌ [POLL] Failed to fetch analytics:`, err);

        if (isUnauthorizedError(err)) {
          console.log("🔒 [POLL] Unauthorized error - logging out");
          handleUnauthorized();
          return;
        }

        if (hasReceivedDataRef.current) {
          console.log("✅ [POLL] Already have completed data - not retrying after error");
          return;
        }

        scheduleNextPoll(productId);
      } finally {
        isPollingRef.current = false;
        console.log("🔓 [POLL] Lock released");
      }
    },
    [scheduleNextPoll, isNewerThanTrigger, triggeredAt, completeAnalysis]
  );

  const refreshAnalyticsList = useCallback(
    async (limit: number = 10) => {
      const productId = currentProductIdRef.current || productData?.id;
      if (!productId) return;

      if (isLoadingListRef.current) {
        console.log("⏳ [LIST] Already loading analytics list, skipping");
        return;
      }

      isLoadingListRef.current = true;
      setIsAnalyticsListLoading(true);
      try {
        console.log("🔄 [LIST] Fetching analytics list for product:", productId);
        const response = await getAnalyticsList(productId, limit);
        const sorted = [...response.analytics].sort((a, b) => {
          const tA = new Date(a.created_at).getTime();
          const tB = new Date(b.created_at).getTime();
          return tB - tA;
        });
        setAnalyticsList(sorted);
        setNextAnalyticsGenerationTime(response.next_analytics_generation_time);

        const currentId = currentAnalytics?.id;
        if (currentId && sorted.some((item) => item.analytics_id === currentId)) {
          setSelectedAnalyticsId(currentId);
        }

        pruneAnalyticsCache(sorted.map((item) => item.analytics_id));
        console.log("✅ [LIST] Analytics list loaded successfully:", sorted.length, "items");
      } catch (err) {
        console.error("Failed to refresh analytics list:", err);
      } finally {
        setIsAnalyticsListLoading(false);
        isLoadingListRef.current = false;
      }
    },
    [productData?.id, currentAnalytics, pruneAnalyticsCache]
  );

  const switchToAnalytics = useCallback(
    async (analyticsId: string) => {
      if (!analyticsId) return;

      if (selectedAnalyticsId === analyticsId && currentAnalytics?.id === analyticsId) {
        console.log("⏭️ [SWITCH] Already viewing this analytics:", analyticsId);
        return;
      }

      setIsSwitchingAnalytics(true);
      setSelectedAnalyticsId(analyticsId);

      try {
        let response = null;

        const lastDataKey = getEmailScopedKey(STORAGE_KEYS.LAST_ANALYSIS_DATA);
        try {
          const storedData = localStorage.getItem(lastDataKey);
          if (storedData) {
            const parsed = JSON.parse(storedData);
            if (parsed.analytics?.[0]?.id === analyticsId) {
              console.log("✅ [SWITCH] Found analytics in localStorage:", analyticsId);
              response = parsed;
            }
          }
        } catch (e) {
          console.error("Failed to parse localStorage data:", e);
        }

        if (!response) {
          let cache = loadAnalyticsCache();
          response = cache[analyticsId];
          if (response) {
            console.log("✅ [SWITCH] Found analytics in cache:", analyticsId);
          }
        }

        if (!response) {
          console.log("🔄 [SWITCH] Fetching analytics from API:", analyticsId);
          const apiResponse = await getAnalyticsById(analyticsId);
          
          if (!apiResponse) {
            console.error("❌ [SWITCH] No response from API");
            return;
          }
          
          if (Array.isArray(apiResponse.analytics)) {
            response = apiResponse;
          } else if (apiResponse.id === analyticsId) {
            response = {
              analytics: [apiResponse],
              count: 1,
              limit: 1,
              product_id: apiResponse.product_id
            };
            console.log("📦 [SWITCH] Normalized single analytics object to array format");
          } else {
            console.error("❌ [SWITCH] Invalid analytics-by-id response structure", apiResponse);
            return;
          }
        }

        if (response) {
          const cache = loadAnalyticsCache();
          const updatedCache = {
            ...cache,
            [analyticsId]: response,
          };
          saveAnalyticsCache(updatedCache);
          console.log("💾 [SWITCH] Saved to cache:", analyticsId);
          
          try {
            localStorage.setItem(lastDataKey, JSON.stringify(response));
            const lastDateKey = getEmailScopedKey(STORAGE_KEYS.LAST_ANALYSIS_DATE);
            if (response.analytics[0]?.created_at) {
              localStorage.setItem(lastDateKey, response.analytics[0].created_at);
            }
            console.log("💾 [SWITCH] Saved to localStorage:", analyticsId);
          } catch (e) {
            console.error("Failed to save to localStorage:", e);
          }
        }

        const selected = response.analytics[0];
        
        console.log("🔄 [SWITCH] Updating UI with analytics:", analyticsId);
        setAnalyticsData(response);
        setCurrentAnalytics(selected);
        setPreviousAnalytics(selected);
        setDataReady(true);
        setIsLoading(false);
        
        // Increment version to force component re-renders
        setAnalyticsVersion(prev => prev + 1);
        console.log("✅ [SWITCH] Analytics version incremented to trigger re-renders");
      } catch (err) {
        console.error("Failed to switch analytics:", err);
      } finally {
        setIsSwitchingAnalytics(false);
      }
    },
    [selectedAnalyticsId, currentAnalytics, loadAnalyticsCache, saveAnalyticsCache]
  );

  // Parse location.state and handle incoming navigation
  useEffect(() => {
    mountedRef.current = true;
    const state = location.state as any;

    const accessToken = getSecureAccessToken();
    if (!accessToken) {
      console.log("🔒 [STATE] No access token - redirecting to login");
      handleUnauthorized();
      return;
    }

    if (state?.isNew && state?.productId && state?.analysisTriggeredAt) {
      console.log("🆕 [STATE] New analysis detected from InputPage");
      setIsLoading(true);
      setDataReady(false);
      hasReceivedDataRef.current = false;
      hasFetchedRef.current = false;
      hasShownCompletionToastRef.current = false;
      // Reset page load timestamp when new analysis is triggered
      pageLoadTimestampRef.current = Date.now();
    }

    if (state?.product?.id) {
      setProductData({
        id: state.product.id,
        name: state.product.name || state.product.website || state.product.id,
        website: state.website || state.product.website || "",
      });
    } else if (state?.productId || state?.id) {
      const pid = state.productId || state.id;
      setProductData({
        id: pid.toString(),
        name: state.website || pid.toString(),
        website: state.website || "",
      });
    } else if (products && products.length > 0) {
      setProductData({
        id: products[0].id,
        name: products[0].name || products[0].website,
        website: products[0].website || "",
      });
    } else {
      const storedProductId = getSecureProductId();
      if (storedProductId) {
        setProductData({
          id: storedProductId,
          name: storedProductId,
          website: "",
        });
      } else {
        console.log("⚠️ [STATE] No product data - redirecting to input");
        navigate("/input");
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, [location.state, navigate, products, startAnalysis]);

  // Start polling when productId changes
  useEffect(() => {
    const productId = productData?.id;

    if (!productId) return;

    if (currentProductIdRef.current === productId && hasFetchedRef.current) {
      return;
    }

    currentProductIdRef.current = productId;
    hasFetchedRef.current = true;

    hasShownStartMessageRef.current = false;
    hasShownCompletionToastRef.current = false;
    isPollingRef.current = false;
    pollingAttemptsRef.current = 0;
    isInCooldownRef.current = false;
    hasReceivedDataRef.current = false;

    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = undefined;
    }
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = undefined;
    }

    console.log("▶️ [EFFECT] Starting poll for product:", productId);
    pollProductAnalytics(productId);

    return () => {
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = undefined;
      }
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = undefined;
      }
      isPollingRef.current = false;
      pollingAttemptsRef.current = 0;
      isInCooldownRef.current = false;
    };
  }, [productData?.id, pollProductAnalytics]);

  // Restart polling when a new analysis is triggered (regenerate/new analysis)
  useEffect(() => {
    if (!isAnalyzing || !triggeredAt) return;
    const productId = currentProductIdRef.current;
    if (!productId) return;

    // Reset polling state so new polls can start
    console.log("🔄 [REGEN] Analysis triggered - resetting polling state");
    hasReceivedDataRef.current = false;
    hasShownStartMessageRef.current = false;
    hasShownCompletionToastRef.current = false;
    isPollingRef.current = false;
    pollingAttemptsRef.current = 0;
    isInCooldownRef.current = false;
    pageLoadTimestampRef.current = Date.now();

    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = undefined;
    }
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = undefined;
    }

    setIsLoading(true);
    
    // Schedule first poll after 5 minutes
    scheduleNextPoll(productId);
  }, [isAnalyzing, triggeredAt, scheduleNextPoll]);

  useEffect(() => {
    if (!productData?.id) return;
    if (analyticsList.length > 0) {
      console.log("⏭️ [EFFECT] Analytics list already loaded, skipping refresh");
      return;
    }
    
    console.log("📋 [EFFECT] Initial analytics list load for product:", productData.id);
    refreshAnalyticsList();
  }, [productData?.id, refreshAnalyticsList, analyticsList.length]);

  // Independent trend summary fetch — not plan-capped, does not affect any existing state
  useEffect(() => {
    const productId = productData?.id;
    if (!productId) return;
    getAnalyticsTrendSummary(productId)
      .then((runs) => {
        if (mountedRef.current) setTrendRuns(runs);
      })
      .catch(() => {/* silently ignore — trend data is non-critical */});
  }, [productData?.id, analyticsVersion]);

  useEffect(() => {
    mountedRef.current = true;
    console.log("[MOUNT] Component mounted");

    return () => {
      console.log("🛑 [UNMOUNT] Component unmounting");
      mountedRef.current = false;
      currentProductIdRef.current = null;
      hasFetchedRef.current = false;
    };
  }, []);

  return (
    <ResultsContext.Provider
      value={{
        productData,
        currentAnalytics,
        previousAnalytics,
        isLoading,
        dataReady,
        activeTab,
        setActiveTab,
        isAnalyzing,
        analyticsList,
        isAnalyticsListLoading,
        isSwitchingAnalytics,
        selectedAnalyticsId,
        refreshAnalyticsList,
        switchToAnalytics,
        analyticsVersion,
        trendRuns,
        nextAnalyticsGenerationTime,
      }}
    >
      {children}
    </ResultsContext.Provider>
  );
};