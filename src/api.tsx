// api.tsx
export const BASE_URL = import.meta.env.VITE_BASE_URL;

export const API_ENDPOINTS = {
  // Auth
  login: `${BASE_URL}/api/v1/users/login-with-app`,
  register: `${BASE_URL}/api/v1/users/register-with-app`,
  forgotPassword: `${BASE_URL}/api/v1/users/forgot-password`,
  resetPassword: `${BASE_URL}/api/v1/users/reset-password`,
  verifyEmail: `${BASE_URL}/api/v1/users/verify-email`,
  logout: `${BASE_URL}/api/v1/users/logout`,

  // Products
  createProductWithKeywords: `${BASE_URL}/api/v1/products/with-keywords`,
  onboardingSuggestions: `${BASE_URL}/api/v1/products/onboarding-suggestions`,
  generateWithKeywords: `${BASE_URL}/api/v1/products/generate/with-keywords`,
  regenerateAnalysis: `${BASE_URL}/api/v1/products/generate/result-and-analytics`,
  createProduct: `${BASE_URL}/api/v1/products`,

  // Onboarding
  onboardingData: `${BASE_URL}/api/v1/onboarding/data`,
  onboardingSelections: `${BASE_URL}/api/v1/onboarding/selections`,

  // Analytics
  getKeywordAnalytics: (keywordId: string, date: string) =>
    `${BASE_URL}/api/v1/analytics/keywords/${keywordId}?date=${date}`,

  getProductAnalytics: (productId: string) =>
    `${BASE_URL}/api/v1/products/analytics/${productId}`,

  // Analytics history
  getAnalyticsList: (productId: string, limit: number = 10) =>
    `${BASE_URL}/api/v1/analytics/product/${productId}/list?limit=${limit}`,

  getAnalyticsById: (analyticsId: string) =>
    `${BASE_URL}/api/v1/analytics/${analyticsId}`,

  getAnalyticsTrendSummary: (productId: string) =>
    `${BASE_URL}/api/v1/analytics/product/${productId}/trend`,

  // Product by Application ID
  getProductsByApplication: (applicationId: string) =>
    `${BASE_URL}/api/v1/products/application/${applicationId}`,

  // Chatbot endpoints
  getChatHistory: (productId: string, limit: number = 100) =>
    `${BASE_URL}/api/v1/products/chatbot/history/${productId}?limit=${limit}`,
  sendChatMessage: (productId: string) =>
    `${BASE_URL}/api/v1/products/chatbot/${productId}`,
  clearChatbotCache: (productId: string) =>
    `${BASE_URL}/api/v1/products/chatbot/${productId}/cache`,

  // Dashboard
  dashboardUsers: `${BASE_URL}/api/v1/dashboard/users`,

  getProductSearchResults: (productId: string) =>
    `${BASE_URL}/api/v1/products/search/${productId}`,

  // Invitations
  sendInvitation: `${BASE_URL}/api/v1/invitations`,
  getInvitationList: `${BASE_URL}/api/v1/invitations`,
  acceptInvitation: (token: string) =>
    `${BASE_URL}/api/v1/users/invitations/accept/${token}`,

  // Analytics History (paginated)
  getAnalyticsHistory: (productId: string, page: number = 1) =>
    `${BASE_URL}/api/v1/analytics/product/${productId}/history?page=${page}`,

  // Tools
  aiReadinessCheck: `${BASE_URL}/api/v1/tools/ai-readiness-check`,
};
