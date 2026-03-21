// src/apiHelpers.tsx
import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS } from "./api";
import { handleUnauthorized, isUnauthorizedError } from "./lib/authGuard";
import { encryptPassword } from "./lib/encryption";
import {
  getSecureAccessToken,
  getSecureSessionId,
  getSecureApplicationId,
  setSecureAccessToken,
  setSecureSessionId,
  setSecureApplicationId,
} from "./lib/secureStorage";

/* =====================
   TYPES
   ===================== */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  sid?: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    owned_applications?: {
      id: string;
      company_name: string;
      project_token: string;
    }[];
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  app_name: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  application: {
    id: string;
    user_id: string;
    company_name: string;
    project_token: string;
  };
  access_token: string;
  refresh_token: string;
}

export interface ProductPayload {
  name: string;
  description: string;
  website: string;
  business_domain: string;
  application_id: string;
  search_keywords: string[];
  competitors?: OnboardingSuggestionCompetitor[];
}

export interface NewAnalysis {
  productId: string;
  searchKeywords: string[];
}

export interface OnboardingSuggestionCompetitor {
  name: string;
  website: string;
  reason?: string;
}

export interface OnboardingSuggestionsResponse {
  product_name: string;
  description: string;
  competitors: OnboardingSuggestionCompetitor[];
  keywords: string[];
  max_competitors_allowed?: number;
  max_keywords_allowed?: number;
}

export interface OnboardingSuggestionsParams {
  website: string;
  name?: string;
  business_domain?: string;
}

/* =====================
   AXIOS CONFIG
   ===================== */
const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

// Request interceptor - add auth token and session ID
API.interceptors.request.use((config) => {
  const token = getSecureAccessToken();
  const sessionId = getSecureSessionId();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (sessionId && config.headers) {
    config.headers["X-Session-ID"] = sessionId;
  }
  if (config.headers) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// Response interceptor - handle 401 unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const authEndpoints = [
      "/login",
      "/register",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
      "/invitations/accept",
    ];
    const requestUrl = error.config?.url || "";
    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      requestUrl.includes(endpoint)
    );

    if (!isAuthEndpoint && isUnauthorizedError(error)) {
      handleUnauthorized();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

/* =====================
   AUTH HELPERS
   ===================== */
export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const encryptedPayload = {
    ...payload,
    password: encryptPassword(payload.password),
  };

  const res: AxiosResponse<LoginResponse> = await API.post(
    API_ENDPOINTS.login,
    encryptedPayload
  );

  if (res.data.access_token && res.data.access_token.trim() !== "") {
    setSecureAccessToken(res.data.access_token);

    if (res.data.sid) {
      setSecureSessionId(res.data.sid);
    }

    const appId = res.data.user?.owned_applications?.[0]?.id;
    if (appId) {
      setSecureApplicationId(appId);
    }
  } else {
    console.log(
      "No access token in response - email verification may be pending"
    );
  }

  return res.data;
};

export const register = async (
  payload: RegisterRequest
): Promise<RegisterResponse | null> => {
  try {
    const encryptedPayload = {
      ...payload,
      password: encryptPassword(payload.password),
    };

    const res: AxiosResponse<RegisterResponse> = await API.post(
      API_ENDPOINTS.register,
      encryptedPayload
    );

    if (res.data.access_token) {
      setSecureAccessToken(res.data.access_token);
    }
    if (res.data.application?.id) {
      setSecureApplicationId(res.data.application.id);
    }

    return res.data;
  } catch (error: any) {
    console.error("Register error:", error);
    const backendMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Registration failed. Please try again.";
    throw new Error(backendMessage);
  }
};

/* =====================
   FORGOT PASSWORD & RESET
   ===================== */
export const forgotPassword = async (email: string): Promise<any> => {
  try {
    const res = await API.post(API_ENDPOINTS.forgotPassword, { email });
    return res.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<any> => {
  try {
    const res = await API.post(API_ENDPOINTS.resetPassword, {
      token,
      new_password: encryptPassword(newPassword),
    });
    return res.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

export const verifyEmail = async (token: string): Promise<any> => {
  try {
    const res = await API.get(`${API_ENDPOINTS.verifyEmail}?token=${token}`);
    return res.data;
  } catch (error) {
    console.error("Verify email error:", error);
    throw error;
  }
};

/* =====================
   LOGOUT
   ===================== */
export const logout = async (
  accessToken?: string,
  sessionId?: string
): Promise<void> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    if (sessionId) headers["X-Session-ID"] = sessionId;

    console.log("🔒 [LOGOUT] Calling logout API with headers:", {
      hasToken: !!accessToken,
      hasSessionId: !!sessionId,
    });

    await axios.post(API_ENDPOINTS.logout, {}, { headers });
    console.log("✅ [LOGOUT] Logout API call successful");
  } catch (error) {
    console.warn("Logout API call failed:", error);
    throw error;
  }
};

/* =====================
   ONBOARDING HELPERS
   ===================== */
export interface OnboardingDataRequest {
  website: string;
  business_domain?: string;
  application_id: string;
  product_id?: string;
}

export interface OnboardingCompetitor {
  name: string;
  website: string;
}

export interface OnboardingDataResponse {
  description: string;
  name: string;
  competitors: OnboardingCompetitor[];
  keywords: string[];
}

export const fetchOnboardingData = async (
  website: string,
  business_domain?: string,
  productId?: string
): Promise<OnboardingDataResponse> => {
  try {
    let appId = getSecureApplicationId();

    if (!appId) {
      appId = crypto.randomUUID();
      setSecureApplicationId(appId);
    }

    const payload: OnboardingDataRequest = {
      website,
      application_id: appId,
      ...(business_domain && { business_domain }),
      ...(productId && { product_id: productId }),
    };

    const res = await API.post(API_ENDPOINTS.onboardingData, payload);
    return res.data;
  } catch (error: any) {
    console.error("Fetch onboarding data error:", error);
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Failed to fetch onboarding data";
    throw new Error(message);
  }
};

export interface OnboardingSelectionsRequest {
  website: string;
  competitors: OnboardingCompetitor[];
  keywords: string[];
  application_id?: string;
}

export const saveOnboardingSelections = async (
  payload: OnboardingSelectionsRequest
): Promise<{ message: string }> => {
  try {
    const appId = payload.application_id || getSecureApplicationId() || "";

    const body = {
      ...payload,
      application_id: appId,
    };

    const res = await API.post(API_ENDPOINTS.onboardingSelections, body);
    return res.data;
  } catch (error: any) {
    console.error("Save onboarding selections error:", error);
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Failed to save selections";
    throw new Error(message);
  }
};

export interface CreateProductRequest {
  website: string;
  name?: string;
  description?: string;
  business_domain?: string;
  application_id?: string;
}

export const createProduct = async (
  payload: CreateProductRequest
): Promise<any> => {
  try {
    const appId = payload.application_id || getSecureApplicationId() || "";

    const body = {
      ...payload,
      application_id: appId,
    };

    const res = await API.post(API_ENDPOINTS.createProduct, body);
    return res.data;
  } catch (error: any) {
    console.error("Create product error:", error);
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Failed to create product";
    throw new Error(message);
  }
};

/* =====================
   PRODUCT HELPERS
   ===================== */
export const createProductWithKeywords = async (
  payload: ProductPayload
): Promise<any> => {
  try {
    const appId = payload.application_id || getSecureApplicationId() || "";

    let body;
    if ((payload as any).brand) {
      const brandTrimmed = (payload as any).brand.trim();
      body = {
        name: brandTrimmed,
        description: brandTrimmed,
        website: brandTrimmed,
        business_domain: brandTrimmed,
        application_id: appId,
        search_keywords:
          (payload as any).search_keywords?.filter(
            (k: string) => k.trim() !== ""
          ) || [],
        competitors: ((payload as any).competitors || [])
          .filter((c: any) => c?.name && c?.website)
          .map((c: any) => ({
            name: String(c.name).trim(),
            website: String(c.website).trim(),
            reason: c.reason ? String(c.reason).trim() : undefined,
          })),
      };
    } else {
      body = {
        name: payload.name,
        description: payload.description,
        website: payload.website,
        business_domain: payload.business_domain,
        application_id: appId,
        search_keywords: (payload.search_keywords || []).filter(
          (k) => k.trim() !== ""
        ),
        competitors: (payload.competitors || [])
          .filter((c) => c?.name && c?.website)
          .map((c) => ({
            name: c.name.trim(),
            website: c.website.trim(),
            reason: c.reason?.trim(),
          })),
      };
    }

    const res = await API.post(API_ENDPOINTS.createProductWithKeywords, body);
    return res.data;
  } catch (error) {
    return null;
  }
};

export const fetchProductsWithKeywords = async (
  payload: ProductPayload
): Promise<any> => {
  try {
    const res = await API.post(
      API_ENDPOINTS.createProductWithKeywords,
      payload
    );
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getOnboardingSuggestions = async (
  params: OnboardingSuggestionsParams
): Promise<OnboardingSuggestionsResponse | null> => {
  try {
    const query = new URLSearchParams();
    query.set("website", params.website);
    if (params.name) {
      query.set("name", params.name);
    }
    if (params.business_domain) {
      query.set("business_domain", params.business_domain);
    }

    const url = `${API_ENDPOINTS.onboardingSuggestions}?${query.toString()}`;
    const res = await API.get(url);
    const data = res?.data;
    if (!data) {
      return null;
    }

    return {
      product_name: String(data.product_name || ""),
      description: String(data.description || ""),
      competitors: Array.isArray(data.competitors)
        ? data.competitors
            .filter((c: any) => c?.name && c?.website)
            .map((c: any) => ({
              name: String(c.name),
              website: String(c.website),
              reason: c.reason ? String(c.reason) : undefined,
            }))
        : [],
      keywords: Array.isArray(data.keywords)
        ? data.keywords
            .filter((k: any) => typeof k === "string")
            .map((k: string) => k.trim())
            .filter((k: string) => k.length > 0)
        : [],
      max_competitors_allowed:
        typeof data.max_competitors_allowed === "number" &&
        Number.isFinite(data.max_competitors_allowed)
          ? data.max_competitors_allowed
          : undefined,
      max_keywords_allowed:
        typeof data.max_keywords_allowed === "number" &&
        Number.isFinite(data.max_keywords_allowed)
          ? data.max_keywords_allowed
          : undefined,
    };
  } catch (error) {
    return null;
  }
};

export const generateWithKeywords = async (
  productId: string,
  searchKeywords: string[]
): Promise<any> => {
  try {
    const body = {
      product_id: productId,
      search_keywords: searchKeywords,
    };
    const res = await API.post(API_ENDPOINTS.generateWithKeywords, body);
    return res.data;
  } catch (error) {
    return null;
  }
};

/* =====================
   ANALYTICS HELPERS
   ===================== */
export interface AnalyticsListItem {
  analytics_id: string;
  created_at: string;
}

export interface TrendRunItem {
  analytics_id: string;
  created_at: string;
  geo_score: number;
  mention_score: number;
  outlook: string; // "Positive" | "Neutral" | "Negative"
  keywords: string[]; // sorted keyword names
}

export interface AnalyticsListResponse {
  analytics: AnalyticsListItem[];
  next_analytics_generation_time: string | null;
}

// New paginated analytics history types
export interface AnalyticsHistoryItem {
  analytics_id: string;
  keywords: string[];
  geo_score: number;
  visibility_tier: string;
  generated_at: string;
}

export interface AnalyticsHistoryResponse {
  analytics: AnalyticsHistoryItem[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export const getProductAnalytics = async (
  productId: string,
  accessToken: string
): Promise<any> => {
  try {
    const res = await API.get(API_ENDPOINTS.getProductAnalytics(productId), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res?.data || null;
  } catch (error) {
    return null;
  }
};

export const getAnalyticsList = async (
  productId: string,
  limit: number = 10
): Promise<AnalyticsListResponse> => {
  try {
    const res = await API.get(API_ENDPOINTS.getAnalyticsList(productId, limit));
    const data = res?.data || {};
    return {
      analytics: data.analytics || [],
      next_analytics_generation_time:
        data.next_analytics_generation_time || null,
    };
  } catch (error) {
    console.error("Failed to fetch analytics list:", error);
    return { analytics: [], next_analytics_generation_time: null };
  }
};

export const getAnalyticsTrendSummary = async (
  productId: string
): Promise<TrendRunItem[]> => {
  try {
    const res = await API.get(
      API_ENDPOINTS.getAnalyticsTrendSummary(productId)
    );
    return (res?.data?.runs as TrendRunItem[]) || [];
  } catch (error) {
    console.error("Failed to fetch analytics trend summary:", error);
    return [];
  }
};

export const getAnalyticsById = async (analyticsId: string): Promise<any> => {
  try {
    const res = await API.get(API_ENDPOINTS.getAnalyticsById(analyticsId));
    return res?.data || null;
  } catch (error) {
    console.error("Failed to fetch analytics by id:", error);
    return null;
  }
};

export const getAnalyticsHistory = async (
  productId: string,
  page: number = 1
): Promise<AnalyticsHistoryResponse> => {
  try {
    const res = await API.get(
      API_ENDPOINTS.getAnalyticsHistory(productId, page)
    );
    const data = res?.data || {};
    return {
      analytics: data.analytics || [],
      page: data.page || 1,
      page_size: data.page_size || 5,
      total_items: data.total_items || 0,
      total_pages: data.total_pages || 1,
    };
  } catch (error) {
    console.error("Failed to fetch analytics history:", error);
    return {
      analytics: [],
      page: 1,
      page_size: 5,
      total_items: 0,
      total_pages: 1,
    };
  }
};

export const regenerateAnalysis = async (
  productId: string,
  accessToken: string
): Promise<any> => {
  try {
    const res = await API.post(
      API_ENDPOINTS.regenerateAnalysis,
      { product_id: productId },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return res?.data || null;
  } catch (error) {
    console.error("Regenerate analysis error:", error);
    return null;
  }
};

export const getKeywordAnalytics = async (
  keywordId: string,
  date: string,
  accessToken: string
): Promise<any> => {
  try {
    const res = await API.get(
      API_ENDPOINTS.getKeywordAnalytics(keywordId, date),
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return res?.data || null;
  } catch (error) {
    return null;
  }
};

export const getProductsByApplication = async (
  applicationId: string,
  accessToken: string
): Promise<any> => {
  try {
    const res = await API.get(
      API_ENDPOINTS.getProductsByApplication(applicationId),
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return res?.data || null;
  } catch (error) {
    return null;
  }
};

/* =====================
   CHAT HELPERS
   ===================== */
export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

export interface ChatbotRequest {
  product_id: string;
  question: string;
}

export interface ChatUsage {
  used: number;
  limit: number;
  remaining: number;
  resets_at: string;
}

export interface ChatbotResponse {
  answer: string;
  suggested_questions: string[];
  product_id: string;
  question: string;
  timestamp: string;
  usage?: ChatUsage;
}

export interface ChatLimitErrorResponse {
  error: "daily_conversation_limit_reached";
  usage: ChatUsage;
}

export type SendChatMessageResult =
  | { ok: true; data: ChatbotResponse }
  | { ok: false; status: 429; usage: ChatUsage }
  | { ok: false; error: unknown };

export interface ChatHistory {
  id: string;
  product_id: string;
  user_id: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface ChatHistoryResponse {
  product_id: string;
  history: ChatHistory[];
  count: number;
  limit: number;
  usage?: ChatUsage;
}

export interface GetChatHistoryResult {
  messages: ChatMessage[];
  usage?: ChatUsage;
}

export const getChatHistory = async (
  productId: string,
  accessToken: string,
  limit: number = 100
): Promise<GetChatHistoryResult> => {
  try {
    const res = await API.get(API_ENDPOINTS.getChatHistory(productId, limit), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data: ChatHistoryResponse = res?.data;

    if (!data || !data.history || !Array.isArray(data.history)) {
      return { messages: [] };
    }

    const messages: ChatMessage[] = [];
    const reversedHistory = [...data.history].reverse();

    reversedHistory.forEach((item) => {
      messages.push({
        id: `${item.id}-question`,
        content: item.question,
        role: "user",
        timestamp: item.created_at || item.updated_at,
      });
      messages.push({
        id: `${item.id}-answer`,
        content: item.answer,
        role: "assistant",
        timestamp: item.updated_at || item.created_at,
      });
    });

    return {
      messages,
      usage: data.usage,
    };
  } catch (error) {
    console.error('Failed to get chat history:', error);
    return { messages: [] };
  }
};

export const sendChatMessage = async (
  question: string,
  productId: string,
  accessToken: string
): Promise<SendChatMessageResult> => {
  try {
    const requestBody: ChatbotRequest = {
      product_id: productId,
      question,
    };

    const res = await API.post(
      API_ENDPOINTS.sendChatMessage(productId),
      requestBody,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const data = res?.data;
    if (!data) return { ok: false, error: new Error("Empty response") };

    return { ok: true, data };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: ChatLimitErrorResponse };
    };
    if (
      axiosError.response?.status === 429 &&
      axiosError.response?.data?.usage
    ) {
      return {
        ok: false,
        status: 429,
        usage: axiosError.response.data.usage,
      };
    }
    console.error("Failed to send chat message:", error);
    return { ok: false, error };
  }
};

export interface ClearChatbotCacheResponse {
  success: boolean;
  message: string;
  product_id: string;
}

export const clearChatbotCache = async (
  productId: string,
  accessToken: string
): Promise<ClearChatbotCacheResponse | null> => {
  try {
    const res = await API.delete(API_ENDPOINTS.clearChatbotCache(productId), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res?.data ?? null;
  } catch (error) {
    console.error("Failed to clear chatbot cache:", error);
    return null;
  }
};

/* =====================
   DASHBOARD HELPERS
   ===================== */
export interface DashboardUser {
  id: string;
  user_id: string;
  email: string;
  name: string;
  product_website: string;
  keywords_list: string[];
  results_generated?: boolean;
  analytics_generated?: boolean;
  created_at: string;
  updated_at: string;
}

export const getDashboardUsers = async (
  accessToken?: string
): Promise<DashboardUser[]> => {
  try {
    const headers: any = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const res = await API.get(API_ENDPOINTS.dashboardUsers, { headers });
    return res?.data || [];
  } catch (error: any) {
    console.error("Failed to get dashboard users:", error);
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch dashboard users";
    throw new Error(errorMessage);
  }
};

/* =====================
   SEARCH RESULTS TYPES
   ===================== */
export interface SearchResult {
  name: string;
  rank: number;
  sources: string[];
  description: string;
  additional_fields?: Record<string, any>;
}

export interface QueryResult {
  id: string;
  query: string;
  created_at: string;
  updated_at: string;
  result: {
    gemini?: SearchResult[];
    openai?: SearchResult[];
  };
}

export interface KeywordData {
  keyword_id: string;
  keyword: string;
  results: QueryResult[];
}

export interface SearchResultsResponse {
  product_id: string;
  keyword_count: number;
  total_results: number;
  limit: number;
  keywords: KeywordData[];
}

export const getProductSearchResults = async (
  productId: string
): Promise<SearchResultsResponse> => {
  try {
    const res = await API.get(API_ENDPOINTS.getProductSearchResults(productId));
    return res.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch search results";
    throw new Error(message);
  }
};

/* =====================
   AI READINESS CHECKER
   ===================== */
export interface AIReadinessCheckResult {
  check: string;
  passed: boolean;
  detail: string;
}

export interface AIReadinessResponse {
  passed: number;
  total: number;
  results: AIReadinessCheckResult[];
}

export const checkAIReadiness = async (
  url: string
): Promise<{ data?: AIReadinessResponse; error?: string }> => {
  try {
    const res = await API.post(API_ENDPOINTS.aiReadinessCheck, { url });
    return { data: res.data };
  } catch (error: any) {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong. Please try again.";
    return { error: message };
  }
};

/* =====================
   INVITATION HELPERS
   ===================== */
export interface SendInvitationRequest {
  email: string;
  role: string;
}

export const sendInvitation = async (
  payload: SendInvitationRequest
): Promise<any> => {
  try {
    const res = await API.post(API_ENDPOINTS.sendInvitation, payload);
    return res.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to send invitation";
    throw new Error(message);
  }
};

// Invitation list types
export interface InvitationListItem {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  accepted_at?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
  };
}

export const getInvitationList = async (): Promise<InvitationListItem[]> => {
  try {
    const res = await API.get(API_ENDPOINTS.getInvitationList);
    return res?.data?.invitations || res?.data || [];
  } catch (error) {
    console.error("Failed to fetch invitation list:", error);
    return [];
  }
};

export interface AcceptInvitationRequest {
  password: string;
  first_name: string;
  last_name: string;
}

export const acceptInvitation = async (
  token: string,
  payload: AcceptInvitationRequest
): Promise<any> => {
  try {
    const encryptedPayload = {
      ...payload,
      password: encryptPassword(payload.password),
    };
    const res = await API.post(
      API_ENDPOINTS.acceptInvitation(token),
      encryptedPayload
    );
    return res.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to accept invitation";
    throw new Error(message);
  }
};
