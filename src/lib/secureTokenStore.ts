/**
 * Secure token store
 * 
 * Uses sessionStorage instead of localStorage for access_token.
 * - Not visible in localStorage in DevTools Application tab
 * - Automatically cleared when browser tab/window closes
 * - More secure than localStorage (not shared across tabs)
 */

const TOKEN_KEY = "__st";

export const setAccessToken = (token: string | null) => {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
};

export const getAccessToken = (): string | null => {
  return sessionStorage.getItem(TOKEN_KEY);
};

export const clearAccessToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
};

export const hasAccessToken = (): boolean => {
  return !!sessionStorage.getItem(TOKEN_KEY);
};
