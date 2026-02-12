/**
 * useAnalysisState - Single source of truth for analysis lifecycle state
 * 
 * State is persisted to localStorage and scoped PER USER ID.
 */

import { useCallback, useSyncExternalStore } from "react";
import { STORAGE_KEYS, getEmailScopedKey } from "@/lib/storageKeys";

const STORAGE_KEY_PREFIX = "analysis_state";

interface AnalysisState {
  isAnalyzing: boolean;
  triggeredAt: number | null;
  productId: string | null;
}

const defaultState: AnalysisState = {
  isAnalyzing: false,
  triggeredAt: null,
  productId: null,
};

let cachedState: AnalysisState = defaultState;
let currentUserId: string | null = null;

const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((cb) => cb());
}

// Get storage key scoped to user ID
function getStorageKey(userId?: string): string {
  const id = userId || currentUserId || localStorage.getItem("user_id") || "";
  if (id) {
    return `${STORAGE_KEY_PREFIX}_${id.replace(/[^a-z0-9\-]/g, "_")}`;
  }
  return STORAGE_KEY_PREFIX;
}

function readFromStorage(userId?: string): AnalysisState {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as AnalysisState;
      if (
        typeof parsed.isAnalyzing === "boolean" &&
        (parsed.triggeredAt === null || typeof parsed.triggeredAt === "number") &&
        (parsed.productId === null || typeof parsed.productId === "string")
      ) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return defaultState;
}

function writeToStorage(state: AnalysisState) {
  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // ignore
  }
  cachedState = state;
  notifySubscribers();
}

// Initialize cache
if (typeof window !== "undefined") {
  currentUserId = localStorage.getItem("user_id");
  cachedState = readFromStorage();
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getSnapshot(): AnalysisState {
  return cachedState;
}

function getServerSnapshot(): AnalysisState {
  return defaultState;
}

/**
 * Set current user ID for scoping (call on login)
 */
export function setAnalysisUserEmail(userId: string) {
  currentUserId = userId;
  try {
    localStorage.setItem("user_id", userId);
  } catch {
    // ignore
  }
  cachedState = readFromStorage(userId);
  notifySubscribers();
}

/**
 * Clear user ID (call on logout)
 */
export function clearAnalysisUserEmail() {
  currentUserId = null;
  cachedState = defaultState;
  notifySubscribers();
}

/**
 * Hook to access and mutate analysis state
 */
export function useAnalysisState() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const startAnalysis = useCallback((productId: string) => {
    try {
      const toastKey = getEmailScopedKey(STORAGE_KEYS.COMPLETION_TOAST_SHOWN);
      localStorage.removeItem(toastKey);
    } catch {
      // ignore
    }
    
    const newState: AnalysisState = {
      isAnalyzing: true,
      triggeredAt: Date.now(),
      productId,
    };
    writeToStorage(newState);
  }, []);

  const completeAnalysis = useCallback(() => {
    writeToStorage(defaultState);
  }, []);

  const clearAnalysisState = useCallback(() => {
    try {
      const key = getStorageKey();
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    cachedState = defaultState;
    notifySubscribers();
  }, []);

  const isNewerThanTrigger = useCallback(
    (analysisTimestamp: number | null): boolean => {
      if (!state.triggeredAt) return true;
      if (!analysisTimestamp) return false;
      return analysisTimestamp > state.triggeredAt;
    },
    [state.triggeredAt]
  );

  return {
    isAnalyzing: state.isAnalyzing,
    triggeredAt: state.triggeredAt,
    productId: state.productId,
    startAnalysis,
    completeAnalysis,
    clearAnalysisState,
    isNewerThanTrigger,
  };
}
