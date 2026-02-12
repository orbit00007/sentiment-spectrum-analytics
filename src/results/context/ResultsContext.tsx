import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { getProductAnalytics, getAnalyticsList, getAnalyticsById, AnalyticsListItem } from "@/apiHelpers";
import { setAnalyticsData, clearCurrentAnalyticsData } from "@/results/data/analyticsData";
import { clearAnalyticsDataForCurrentUser } from "@/lib/storageKeys";
import { useToast } from "@/hooks/use-toast";
import { handleUnauthorized, isUnauthorizedError } from "@/lib/authGuard";
import { getAccessToken, hasAccessToken } from "@/lib/secureTokenStore";
import { useAnalysisState } from "@/hooks/useAnalysisState";
import { getEmailScopedKey, STORAGE_KEYS } from "@/lib/storageKeys";

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
  | "content-impact-analysis";

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
}

const ResultsContext = createContext<ResultsContextType | null>(null);

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
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState<string | null>(null);
  const [analyticsVersion, setAnalyticsVersion] = useState<number>(0);

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
    };
    const targetPath = tabToPath[tab];
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  };

  const POLL_INTERVAL_MS = 2 * 60 * 1000;
  const POLL_MAX_ATTEMPTS = 30;
  const POLL_COOLDOWN_MS = 10 * 60 * 1000;

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
  const pageLoadTimestampRef = useRef<number>(Date.now()); // Track when page loaded
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
    accessTokenRef.current = getAccessToken() || "";
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

      console.log(`⏱️ [SCHEDULE] Scheduling next poll in ${POLL_INTERVAL_MS / 60000} minutes...`);
      pollingTimerRef.current = window.setTimeout(() => {
        if (
          mountedRef.current &&
          currentProductIdRef.current === productId &&
          !hasReceivedDataRef.current
        ) {
          isPollingRef.current = false;
          pollProductAnalytics(productId);
        }
      }, POLL_INTERVAL_MS);
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

        toastRef.current({
          title: "Analysis Taking Longer Than Expected",
          description: `We'll pause checking for ${POLL_COOLDOWN_MS / 60000} minutes. The analysis will continue in the background.`,
          duration: 5000,
        });

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

              // Show completion notification ONLY if page was loaded BEFORE analysis completed
              if (currentStatus === "completed" && !hasShownCompletionToastRef.current) {
                // Check if analysis completed AFTER this page load
                const analysisCompletedAfterPageLoad = analysisTimestamp > pageLoadTimestampRef.current;
                
                if (analysisCompletedAfterPageLoad) {
                  // Analysis completed while user is on this page -> ask to refresh
                  hasShownCompletionToastRef.current = true;
                  toastRef.current({
                    title: "Analysis Complete!",
                    description: "Your analysis is ready. Refresh the page to see the latest data.",
                    duration: 10000,
                  });
                  console.log("🎉 [POLL] Showing refresh notification - analysis completed while on page");
                } else {
                  // Page was refreshed AFTER analysis completed -> no notification needed
                  console.log("✅ [POLL] Page already refreshed after completion - no notification");
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
                  duration: 10000,
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
                  duration: 10000,
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
        const list = await getAnalyticsList(productId, limit);
        const sorted = [...list].sort((a, b) => {
          const tA = new Date(a.created_at).getTime();
          const tB = new Date(b.created_at).getTime();
          return tB - tA;
        });
        setAnalyticsList(sorted);

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

    if (!hasAccessToken()) {
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
      const storedProductId = localStorage.getItem("product_id");
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

  useEffect(() => {
    if (!productData?.id) return;
    if (analyticsList.length > 0) {
      console.log("⏭️ [EFFECT] Analytics list already loaded, skipping refresh");
      return;
    }
    
    console.log("📋 [EFFECT] Initial analytics list load for product:", productData.id);
    refreshAnalyticsList();
  }, [productData?.id, refreshAnalyticsList, analyticsList.length]);

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
      }}
    >
      {children}
    </ResultsContext.Provider>
  );
};