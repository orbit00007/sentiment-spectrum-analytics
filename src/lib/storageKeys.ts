/**
 * User-ID-scoped storage key utilities
 * Used to scope localStorage/sessionStorage keys per user ID
 */

// Get user ID for use in storage keys
export function getUserId(userId?: string): string {
  return userId || localStorage.getItem("user_id") || "";
}

// Get user-ID-scoped key
export function getUserScopedKey(baseKey: string, userId?: string): string {
  const id = getUserId(userId);
  if (id) {
    return `${baseKey}_${id}`;
  }
  return baseKey;
}

// Keep legacy aliases for backward compatibility during migration
export const getSanitizedEmail = getUserId;
export const getEmailScopedKey = getUserScopedKey;

// Storage key constants
export const STORAGE_KEYS = {
  ANALYTICS_DATA: "geo_analytics_data",
  LAST_ANALYSIS_DATA: "last_analysis_data",
  LAST_ANALYSIS_DATE: "last_analysis_date",
  ANALYSIS_STATE: "analysis_state",
  USER_ID: "user_id",
  USER_EMAIL: "user_email", // kept for legacy
  COMPLETION_TOAST_SHOWN: "completion_toast_shown",
  PREVIOUS_ANALYTICS_CACHE: "previous_analytics_cache",
  FIRST_ANALYSIS: "first_analysis",
} as const;

// Clear analytics data for current user (call when starting new analysis)
export function clearAnalyticsDataForCurrentUser(): void {
  const id = getUserId();
  if (!id) return;
  
  const keysToRemove = [
    `${STORAGE_KEYS.ANALYTICS_DATA}_${id}`,
    `${STORAGE_KEYS.LAST_ANALYSIS_DATA}_${id}`,
    `${STORAGE_KEYS.LAST_ANALYSIS_DATE}_${id}`,
    `${STORAGE_KEYS.COMPLETION_TOAST_SHOWN}_${id}`,
  ];
  
  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}

// Get all user-scoped datasets from localStorage
export function getAllEmailScopedDatasets(): Array<{
  email: string;
  key: string;
  hasAnalyticsData: boolean;
  hasLastAnalysisData: boolean;
  lastAnalysisDate: string | null;
}> {
  const datasets: Array<{
    email: string;
    key: string;
    hasAnalyticsData: boolean;
    hasLastAnalysisData: boolean;
    lastAnalysisDate: string | null;
  }> = [];
  
  const analyticsPrefix = STORAGE_KEYS.ANALYTICS_DATA + "_";
  const lastDataPrefix = STORAGE_KEYS.LAST_ANALYSIS_DATA + "_";
  const lastDatePrefix = STORAGE_KEYS.LAST_ANALYSIS_DATE + "_";
  
  const idSuffixes = new Set<string>();
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    if (key.startsWith(analyticsPrefix)) {
      idSuffixes.add(key.substring(analyticsPrefix.length));
    } else if (key.startsWith(lastDataPrefix)) {
      idSuffixes.add(key.substring(lastDataPrefix.length));
    } else if (key.startsWith(lastDatePrefix)) {
      idSuffixes.add(key.substring(lastDatePrefix.length));
    }
  }
  
  idSuffixes.forEach((suffix) => {
    const analyticsKey = `${STORAGE_KEYS.ANALYTICS_DATA}_${suffix}`;
    const lastDataKey = `${STORAGE_KEYS.LAST_ANALYSIS_DATA}_${suffix}`;
    const lastDateKey = `${STORAGE_KEYS.LAST_ANALYSIS_DATE}_${suffix}`;
    
    datasets.push({
      email: suffix,
      key: suffix,
      hasAnalyticsData: localStorage.getItem(analyticsKey) !== null,
      hasLastAnalysisData: localStorage.getItem(lastDataKey) !== null,
      lastAnalysisDate: localStorage.getItem(lastDateKey),
    });
  });
  
  return datasets;
}

// Delete all data for a specific user suffix
export function deleteEmailScopedData(suffix: string): void {
  const keysToDelete = [
    `${STORAGE_KEYS.ANALYTICS_DATA}_${suffix}`,
    `${STORAGE_KEYS.LAST_ANALYSIS_DATA}_${suffix}`,
    `${STORAGE_KEYS.LAST_ANALYSIS_DATE}_${suffix}`,
  ];
  
  keysToDelete.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
  
  try {
    sessionStorage.removeItem(`${STORAGE_KEYS.ANALYSIS_STATE}_${suffix}`);
  } catch {
    // ignore
  }
  
  console.log(`🗑️ [STORAGE] Deleted data for: ${suffix}`);
}
