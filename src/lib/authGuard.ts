// Auth guard utility for handling JWT expiration across the app
import { clearAllSecureData } from "./secureStorage";

export const handleUnauthorized = () => {
  console.log("🔒 [AUTH] Unauthorized - clearing session and redirecting to login");

  // Clear all secure storage
  clearAllSecureData();

  // Clear legacy plain localStorage keys
  const legacyKeys = [
    "keywords", "keyword_count", "product_id",
    "applications", "products",
    "pending_verification_email",
    "last_analysis_data", "last_analysis_date",
  ];
  legacyKeys.forEach(k => { try { localStorage.removeItem(k); } catch {} });
  try { sessionStorage.removeItem("app_initialized"); } catch {}

  // Redirect to login
  window.location.href = "/login";
};

export const isUnauthorizedError = (error: any): boolean => {
  if (!error) return false;
  
  // Check for 401 status
  if (error.response?.status === 401) return true;
  
  // Check for specific error messages
  const errorMessage = 
    error.response?.data?.error || 
    error.response?.data?.message || 
    error.message || 
    "";
  
  const unauthorizedMessages = [
    "invalid or expired token",
    "unauthorized",
    "jwt expired",
    "token expired",
    "invalid token",
    "not authenticated"
  ];
  
  return unauthorizedMessages.some(msg => 
    errorMessage.toLowerCase().includes(msg.toLowerCase())
  );
};
