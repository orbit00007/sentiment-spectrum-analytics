// api.tsx
export const BASE_URL = import.meta.env.VITE_BASE_URL;

export const API_ENDPOINTS = {
  // Auth
  login: `${BASE_URL}/users/login`,
  register: `${BASE_URL}/users/register-with-app`,

  // Products
  createProductWithKeywords: `${BASE_URL}/products/with-keywords`,

  // Analytics
  getKeywordAnalytics: (keywordId: string, date: string) =>
    `${BASE_URL}/analytics/keywords/${keywordId}?date=${date}`,

  getProductAnalytics: (productId: string, date: string) =>
    `${BASE_URL}/products/analytics/${productId}`,

  // Product by Application ID
  getProductsByApplication: (applicationId: string) =>
    `${BASE_URL}/products/application/${applicationId}`
};
