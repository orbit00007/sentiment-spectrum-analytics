import React, { createContext, useContext, useState, useEffect } from "react";
import {
  login as loginAPI,
  register as registerAPI,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/apiHelpers";
import { setCurrentUserId, clearCurrentUserId } from "@/results/data/analyticsData";
import { setAnalysisUserId, clearAnalysisUserId } from "@/hooks/useAnalysisState";
import { STORAGE_KEYS, getUserScopedKey } from "@/lib/storageKeys";

/* =====================
   TYPES
   ===================== */
interface Product {
  id: string;
  name: string;
  description: string;
  website: string;
  business_domain: string;
  application_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Application {
  id: string;
  user_id: string;
  company_name: string;
  project_token: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  products?: Product[];
}

interface ExtendedUser extends NonNullable<LoginResponse["user"]> {
  owned_applications?: { id: string; company_name: string; project_token: string }[];
}

interface AuthContextType {
  user: ExtendedUser | null;
  applicationId: string | null;
  applications: Application[];
  products: Product[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean | 'email_not_verified'>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =====================
   PROVIDER
   ===================== */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /* Restore state from localStorage on refresh */
  useEffect(() => {
    const storedAppId = localStorage.getItem("application_id");
    const storedToken = localStorage.getItem("access_token");
    const storedSessionId = localStorage.getItem("session_id");
    const storedFirstName = localStorage.getItem("first_name");
    const storedApplications = localStorage.getItem("applications");
    const storedProducts = localStorage.getItem("products");
    
    if (storedAppId) {
      setApplicationId(storedAppId);
    }
    
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications));
    }
    
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
    
    // If we have a token and session ID, restore user state (user is logged in)
    if (storedToken && storedSessionId) {
      const storedUserId = localStorage.getItem("user_id") || "restored";
      setUser({ 
        id: storedUserId, 
        email: "user@restored.com", 
        first_name: storedFirstName || "User", 
        last_name: "User" 
      });
      
      // Restore user ID scoping
      if (storedUserId && storedUserId !== "restored") {
        setCurrentUserId(storedUserId);
        setAnalysisUserId(storedUserId);
      }
    }
  }, []);

  /* =====================
     LOGIN
     ===================== */
  const login = async (email: string, password: string): Promise<boolean | 'email_not_verified'> => {
    setIsLoading(true);
    try {
      const res = await loginAPI({ email, password });

      // Check if email is not verified
      if (!res.access_token || res.access_token.trim() === "") {
        return 'email_not_verified';
      }

      // We have a valid response with access_token
      if (res.user) {
        const extendedUser = res.user as ExtendedUser;
        setUser(extendedUser);

        const userId = extendedUser.id || "";

        // Set user ID for analytics data mapping and analysis state scoping
        setCurrentUserId(userId);
        setAnalysisUserId(userId);

        // Save user ID and first name to localStorage
        localStorage.setItem("user_id", userId);
        localStorage.setItem("first_name", extendedUser.first_name);

        // Store applications and products from response
        const appsFromResponse = (res as any).applications || [];
        setApplications(appsFromResponse);
        localStorage.setItem("applications", JSON.stringify(appsFromResponse));

        // Extract products from applications
        const allProducts: Product[] = [];
        appsFromResponse.forEach((app: Application) => {
          if (app.products && app.products.length > 0) {
            allProducts.push(...app.products);
          }
        });
        setProducts(allProducts);
        localStorage.setItem("products", JSON.stringify(allProducts));

        // Set first_analysis flag: "1" if no products exist yet (first time user)
        const firstAnalysisKey = getUserScopedKey(STORAGE_KEYS.FIRST_ANALYSIS, userId);
        const existingFlag = localStorage.getItem(firstAnalysisKey);
        if (existingFlag === null) {
          // First time seeing this user — check if they already have products
          const isFirstAnalysis = allProducts.length === 0 ? "1" : "1";
          // Always set to "1" on first encounter; it becomes "0" when View Dashboard is clicked
          localStorage.setItem(firstAnalysisKey, isFirstAnalysis);
          console.log(`🏁 [AUTH] First analysis flag set to ${isFirstAnalysis} for user ${userId}`);
        }

        // Pick applicationId from response
        let appId: string | null = null;
        if (extendedUser.owned_applications?.length) {
          appId = extendedUser.owned_applications[0].id;
        } else if ((res as any).application?.id) {
          appId = (res as any).application.id;
        } else if (appsFromResponse.length > 0) {
          appId = appsFromResponse[0].id;
        }

        if (appId) {
          setApplicationId(appId);
        }

        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Auth context: Login error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /* =====================
     REGISTER (auto-login after success)
     ===================== */
  const register = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    setIsLoading(true);
    try {
      // Split full name on first space
      const parts = fullName.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || ' ';

      const payload: RegisterRequest = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        app_name: "My App",
      };

      const response: RegisterResponse = await registerAPI(payload);

      if (response.application?.id) {
        setApplicationId(response.application.id);
        localStorage.setItem("application_id", response.application.id);
      }

      // Save first name to localStorage
      localStorage.setItem("first_name", firstName);
          } finally {
      setIsLoading(false);
    }
  };

  /* =====================
     LOGOUT - Clear session data but preserve analytics
     ===================== */
  const logout = () => {
    // Clear user ID references (but keep user-scoped data)
    clearAnalysisUserId();
    clearCurrentUserId();
    
    // Clear only session-related items, NOT analytics data or analysis state
    const sessionItems = [
      'access_token',
      'refresh_token',
      'session_id',
      'application_id',
      'applications',
      'products',
      'first_name',
      'product_id',
      // Note: 'user_id' is kept in localStorage to help restore state on login
    ];
    
    sessionItems.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
    
    // Do NOT clear sessionStorage - analysis state is stored there per email
    // sessionStorage.clear(); // REMOVED - this was wiping analysis state
    
    // Reset state
    setUser(null);
    setApplicationId(null);
    setApplications([]);
    setProducts([]);
  };

  return (
    <AuthContext.Provider
      value={{ user, applicationId, applications, products, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =====================
   HOOK
   ===================== */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
