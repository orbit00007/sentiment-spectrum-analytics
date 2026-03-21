import CryptoJS from "crypto-js";
import SecureStorage from "secure-web-storage";

const SECURE_STORAGE_SECRET =
  import.meta.env.VITE_SALT || "georankers-salt-2024";

const createSecureStorage = (storage: Storage) =>
  new SecureStorage(storage, {
    hash: (key: string) => CryptoJS.SHA256(`${key}${SECURE_STORAGE_SECRET}`).toString(),
    encrypt: (value: string) =>
      CryptoJS.AES.encrypt(value, SECURE_STORAGE_SECRET).toString(),
    decrypt: (value: string) =>
      CryptoJS.AES.decrypt(value, SECURE_STORAGE_SECRET).toString(CryptoJS.enc.Utf8),
  });

const secureSessionStorage = createSecureStorage(sessionStorage);
const secureLocalStorage = createSecureStorage(localStorage);

const CRITICAL_LOCAL_KEYS = [
  "session_id",
  "user_id",
  "application_id",
  "first_name",
] as const;

const ACCESS_TOKEN_KEY = "access_token";

const migrateLegacyLocalToSecureLocal = (key: string): string | null => {
  try {
    const secureValue = secureLocalStorage.getItem(key);
    if (secureValue !== null && secureValue !== undefined && secureValue !== "") {
      return String(secureValue);
    }
  } catch {
    try { secureLocalStorage.removeItem(key); } catch {}
  }

  const legacyValue = localStorage.getItem(key);
  if (legacyValue !== null) {
    secureLocalStorage.setItem(key, legacyValue);
    localStorage.removeItem(key);
    return legacyValue;
  }

  return null;
};

const migrateLegacyLocalToSecureSession = (key: string): string | null => {
  try {
    const secureValue = secureSessionStorage.getItem(key);
    if (secureValue !== null && secureValue !== undefined && secureValue !== "") {
      return String(secureValue);
    }
  } catch {
    try { secureSessionStorage.removeItem(key); } catch {}
  }

  const legacyValue = localStorage.getItem(key);
  if (legacyValue !== null) {
    secureSessionStorage.setItem(key, legacyValue);
    localStorage.removeItem(key);
    return legacyValue;
  }

  return null;
};

export const setSecureAccessToken = (token: string) => {
  secureSessionStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getSecureAccessToken = (): string => {
  return migrateLegacyLocalToSecureSession(ACCESS_TOKEN_KEY) || "";
};

export const clearSecureAccessToken = () => {
  secureSessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const setSecureSessionId = (sessionId: string) => {
  secureLocalStorage.setItem("session_id", sessionId);
};

export const getSecureSessionId = (): string => {
  return migrateLegacyLocalToSecureLocal("session_id") || "";
};

export const setSecureUserId = (userId: string) => {
  secureLocalStorage.setItem("user_id", userId);
};

export const getSecureUserId = (): string => {
  return migrateLegacyLocalToSecureLocal("user_id") || "";
};

export const setSecureApplicationId = (applicationId: string) => {
  secureLocalStorage.setItem("application_id", applicationId);
};

export const getSecureApplicationId = (): string => {
  return migrateLegacyLocalToSecureLocal("application_id") || "";
};

export const setSecureFirstName = (firstName: string) => {
  secureLocalStorage.setItem("first_name", firstName);
};

export const getSecureFirstName = (): string => {
  return migrateLegacyLocalToSecureLocal("first_name") || "";
};

export const clearSecureAuthStorage = () => {
  clearSecureAccessToken();
  CRITICAL_LOCAL_KEYS.forEach((key) => {
    secureLocalStorage.removeItem(key);
    localStorage.removeItem(key);
  });
};

// ── Product ID ──
export const setSecureProductId = (productId: string) => {
  secureLocalStorage.setItem("product_id", productId);
};

export const getSecureProductId = (): string => {
  return migrateLegacyLocalToSecureLocal("product_id") || "";
};

export const clearSecureProductId = () => {
  secureLocalStorage.removeItem("product_id");
  localStorage.removeItem("product_id");
};

// ── Keywords ──
export const setSecureKeywords = (keywords: any) => {
  secureLocalStorage.setItem("keywords", JSON.stringify(keywords));
};

export const getSecureKeywords = (): any[] => {
  try {
    const raw = migrateLegacyLocalToSecureLocal("keywords");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const clearSecureKeywords = () => {
  secureLocalStorage.removeItem("keywords");
  localStorage.removeItem("keywords");
};

// ── Keyword Count ──
export const setSecureKeywordCount = (count: string) => {
  secureLocalStorage.setItem("keyword_count", count);
};

export const getSecureKeywordCount = (): string => {
  return migrateLegacyLocalToSecureLocal("keyword_count") || "0";
};

export const clearSecureKeywordCount = () => {
  secureLocalStorage.removeItem("keyword_count");
  localStorage.removeItem("keyword_count");
};

// ── Applications (JSON) ──
export const setSecureApplications = (apps: any) => {
  secureLocalStorage.setItem("applications", JSON.stringify(apps));
};

export const getSecureApplications = (): any[] => {
  try {
    const raw = migrateLegacyLocalToSecureLocal("applications");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const clearSecureApplications = () => {
  secureLocalStorage.removeItem("applications");
  localStorage.removeItem("applications");
};

// ── Products (JSON) ──
export const setSecureProducts = (products: any) => {
  secureLocalStorage.setItem("products", JSON.stringify(products));
};

export const getSecureProducts = (): any[] => {
  try {
    const raw = migrateLegacyLocalToSecureLocal("products");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const clearSecureProducts = () => {
  secureLocalStorage.removeItem("products");
  localStorage.removeItem("products");
};

// ── Pricing Plan ──
export const setSecurePricingPlan = (plan: string) => {
  secureLocalStorage.setItem("pricing_plan", plan);
};

export const getSecurePricingPlan = (): string => {
  return migrateLegacyLocalToSecureLocal("pricing_plan") || "free";
};

export const clearSecurePricingPlan = () => {
  secureLocalStorage.removeItem("pricing_plan");
  localStorage.removeItem("pricing_plan");
};

// ── Collaborators (JSON) ──
export const setSecureCollaborators = (collaborators: any) => {
  secureLocalStorage.setItem("collaborators", JSON.stringify(collaborators));
};

export const getSecureCollaborators = (): any[] => {
  try {
    const raw = migrateLegacyLocalToSecureLocal("collaborators");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const clearSecureCollaborators = () => {
  secureLocalStorage.removeItem("collaborators");
  localStorage.removeItem("collaborators");
};

// ── User Role ──
export const setSecureUserRole = (role: string) => {
  secureLocalStorage.setItem("user_role", role);
};

export const getSecureUserRole = (): string => {
  return migrateLegacyLocalToSecureLocal("user_role") || "";
};

export const clearSecureUserRole = () => {
  secureLocalStorage.removeItem("user_role");
  localStorage.removeItem("user_role");
};

// ── Plan Expires At ──
export const setSecurePlanExpiresAt = (expiresAt: number) => {
  secureLocalStorage.setItem("plan_expires_at", expiresAt.toString());
};

export const getSecurePlanExpiresAt = (): number | null => {
  const raw = migrateLegacyLocalToSecureLocal("plan_expires_at");
  if (!raw) return null;
  const num = parseInt(raw, 10);
  return isNaN(num) ? null : num;
};

export const clearSecurePlanExpiresAt = () => {
  secureLocalStorage.removeItem("plan_expires_at");
  localStorage.removeItem("plan_expires_at");
};

// ── Email ──
export const setSecureEmail = (email: string) => {
  secureLocalStorage.setItem("user_email", email);
};

export const getSecureEmail = (): string => {
  return migrateLegacyLocalToSecureLocal("user_email") || "";
};

export const clearSecureEmail = () => {
  secureLocalStorage.removeItem("user_email");
  localStorage.removeItem("user_email");
};

// ── Last Name ──
export const setSecureLastName = (lastName: string) => {
  secureLocalStorage.setItem("last_name", lastName);
};

export const getSecureLastName = (): string => {
  return migrateLegacyLocalToSecureLocal("last_name") || "";
};

export const clearSecureLastName = () => {
  secureLocalStorage.removeItem("last_name");
  localStorage.removeItem("last_name");
};

// ── Clear all sensitive data (used on logout) ──
export const clearAllSecureData = () => {
  clearSecureAuthStorage();
  clearSecureProductId();
  clearSecureKeywords();
  clearSecureKeywordCount();
  clearSecureApplications();
  clearSecureProducts();
  clearSecurePricingPlan();
  clearSecureCollaborators();
  clearSecureUserRole();
  clearSecurePlanExpiresAt();
  clearSecureEmail();
  clearSecureLastName();
};
