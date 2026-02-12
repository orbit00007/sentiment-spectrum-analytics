// Auth guard utility for handling JWT expiration across the app
import { clearAccessToken } from "./secureTokenStore";

export const handleUnauthorized = () => {
  // Clear in-memory token
  clearAccessToken();
  
  // Clear all auth-related localStorage
  localStorage.removeItem("application_id");
  localStorage.removeItem("first_name");
  localStorage.removeItem("keywords");
  localStorage.removeItem("keyword_count");
  localStorage.removeItem("product_id");
  localStorage.removeItem("applications");
  localStorage.removeItem("products");
  localStorage.removeItem("pending_verification_email");
  localStorage.removeItem("user_id");
  sessionStorage.removeItem("app_initialized");
  
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
