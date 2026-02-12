import React, { createContext, useContext, useState, useEffect } from "react";
import {
  login as loginAPI,
  register as registerAPI,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/apiHelpers";
import { setCurrentUserId, clearCurrentUserId } from "@/results/data/analyticsData";
import { setAnalysisUserEmail, clearAnalysisUserEmail } from "@/hooks/useAnalysisState";
import { setAccessToken, getAccessToken, clearAccessToken, hasAccessToken } from "@/lib/secureTokenStore";

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
    const storedFirstName = localStorage.getItem("first_name");
    const storedApplications = localStorage.getItem("applications");
    const storedProducts = localStorage.getItem("products");
    const storedUserId = localStorage.getItem("user_id");
    
    if (storedAppId) {
      setApplicationId(storedAppId);
    }
    
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications));
    }
    
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
    
    // If we have a token in sessionStorage, restore user state
    if (hasAccessToken() && storedUserId) {
      setUser({ 
        id: storedUserId, 
        email: "",
        first_name: storedFirstName || "User", 
        last_name: "User" 
      });
      // Re-scope analytics to this user
      setCurrentUserId(storedUserId);
      setAnalysisUserEmail(storedUserId);
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

      // Token is already stored in memory by loginAPI
      // Store it again to ensure it's set (loginAPI handles this)
      if (res.access_token) {
        setAccessToken(res.access_token);
      }

      if (res.user) {
        const extendedUser = res.user as ExtendedUser;
        setUser(extendedUser);

        // Use user ID for scoping instead of email
        const userId = extendedUser.id;
        setCurrentUserId(userId);
        setAnalysisUserEmail(userId);

        // Save first name and user ID (NOT email) to localStorage
        localStorage.setItem("first_name", extendedUser.first_name);
        localStorage.setItem("user_id", userId);

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
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /* =====================
     REGISTER
     ===================== */
  const register = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    setIsLoading(true);
    try {
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

      // Save first name and user ID
      localStorage.setItem("first_name", firstName);
      if (response.user?.id) {
        localStorage.setItem("user_id", response.user.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* =====================
     LOGOUT
     ===================== */
  const logout = () => {
    clearAnalysisUserEmail();
    clearCurrentUserId();
    clearAccessToken();
    
    const sessionItems = [
      'application_id',
      'applications',
      'products',
      'first_name',
      'product_id',
      'user_id',
    ];
    
    sessionItems.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
    
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
