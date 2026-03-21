// Auth context — provides authentication state to the entire app
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  login as loginAPI,
  register as registerAPI,
  logout as logoutAPI,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/apiHelpers";
import {
  setCurrentUserId,
  clearCurrentUserId,
} from "@/results/data/analyticsData";
import {
  setAnalysisUserId,
  clearAnalysisUserId,
} from "@/hooks/useAnalysisState";
import { STORAGE_KEYS, getUserScopedKey } from "@/lib/storageKeys";
import {
  getSecureAccessToken,
  getSecureSessionId,
  getSecureApplicationId,
  getSecureFirstName,
  setSecureUserId,
  setSecureFirstName,
  setSecureApplicationId,
  getSecureUserId,
  clearSecureAuthStorage,
  setSecureApplications,
  getSecureApplications,
  setSecureProducts,
  getSecureProducts,
  setSecurePricingPlan,
  getSecurePricingPlan,
  setSecureCollaborators,
  getSecureCollaborators,
  clearAllSecureData,
  setSecureUserRole,
  getSecureUserRole,
  setSecurePlanExpiresAt,
  getSecurePlanExpiresAt,
  setSecureEmail,
  getSecureEmail,
  setSecureLastName,
  getSecureLastName,
} from "@/lib/secureStorage";
import { decodeAccessToken, DecodedTokenInfo } from "@/lib/jwtDecode";
import { getPricingPlanName, type PricingPlanName } from "@/lib/plans";

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
  owned_applications?: {
    id: string;
    company_name: string;
    project_token: string;
  }[];
}

interface Collaborator {
  id: string;
  application_id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  };
}

interface AuthContextType {
  user: ExtendedUser | null;
  applicationId: string | null;
  applications: Application[];
  products: Product[];
  pricingPlan: PricingPlanName;
  collaborators: Collaborator[];
  userRole: string;
  userRoleInt: number;
  planInt: number;
  planExpiresAt: number | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<boolean | "email_not_verified">;
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
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pricingPlan, setPricingPlan] = useState<PricingPlanName>("free");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [userRole, setUserRole] = useState<string>("viewer");
  const [userRoleInt, setUserRoleInt] = useState<number>(4);
  const [planInt, setPlanInt] = useState<number>(0);
  const [planExpiresAt, setPlanExpiresAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /* Restore state from localStorage on refresh */
  useEffect(() => {
    const storedAppId = getSecureApplicationId();
    const storedToken = getSecureAccessToken();
    const storedSessionId = getSecureSessionId();
    const storedFirstName = getSecureFirstName();
    const storedApplications = getSecureApplications();
    const storedProducts = getSecureProducts();

    if (storedAppId) setApplicationId(storedAppId);
    if (storedApplications.length > 0) setApplications(storedApplications);
    if (storedProducts.length > 0) setProducts(storedProducts);

    // Restore pricing plan and collaborators
    const storedPlan = getSecurePricingPlan();
    if (storedPlan) setPricingPlan(storedPlan as PricingPlanName);
    const storedCollabs = getSecureCollaborators();
    if (storedCollabs.length > 0) setCollaborators(storedCollabs);

    // Restore role and plan from secure storage
    const storedRole = getSecureUserRole();
    if (storedRole) {
      setUserRole(storedRole);
      // Convert back to int for access checks
      const roleMap: Record<string, number> = {
        god: 0,
        admin: 1,
        application: 2,
        editor: 3,
        viewer: 4,
      };
      setUserRoleInt(roleMap[storedRole] ?? 4);
    }
    const storedPlanExpiry = getSecurePlanExpiresAt();
    if (storedPlanExpiry) setPlanExpiresAt(storedPlanExpiry);

    // Try to decode current token for plan/role info
    if (storedToken) {
      const decoded = decodeAccessToken(storedToken);
      if (decoded) {
        setUserRoleInt(decoded.roleInt);
        setUserRole(decoded.roleName);
        setPlanInt(decoded.planInt);
        setPricingPlan(decoded.planName as PricingPlanName);
        if (decoded.planExpiresAt) setPlanExpiresAt(decoded.planExpiresAt);
      }
    }

    // If we have a token and session ID, restore user state
    if (storedToken && storedSessionId) {
      const storedUserId = getSecureUserId() || "restored";
      // Decode JWT to get real email and user info
      const decoded = decodeAccessToken(storedToken);
      const restoredEmail = decoded?.email || getSecureEmail() || "";
      const restoredLastName = getSecureLastName() || "";
      setUser({
        id: storedUserId,
        email: restoredEmail,
        first_name: storedFirstName || "User",
        last_name: restoredLastName || "",
      });

      if (storedUserId && storedUserId !== "restored") {
        setCurrentUserId(storedUserId);
        setAnalysisUserId(storedUserId);
      }
    }
  }, []);

  /* =====================
     LOGIN
     ===================== */
  const login = async (
    email: string,
    password: string
  ): Promise<boolean | "email_not_verified"> => {
    setIsLoading(true);
    try {
      const res = await loginAPI({ email, password });

      // Check if email is not verified
      if (!res.access_token || res.access_token.trim() === "") {
        return "email_not_verified";
      }

      // Decode JWT to extract role, plan, expiry
      const decoded = decodeAccessToken(res.access_token);
      if (decoded) {
        setUserRoleInt(decoded.roleInt);
        setUserRole(decoded.roleName);
        setPlanInt(decoded.planInt);
        setPricingPlan(decoded.planName as PricingPlanName);
        setPlanExpiresAt(decoded.planExpiresAt);

        // Persist role and plan
        setSecureUserRole(decoded.roleName);
        setSecurePricingPlan(decoded.planName);
        if (decoded.planExpiresAt)
          setSecurePlanExpiresAt(decoded.planExpiresAt);
      }

      if (res.user) {
        const extendedUser = res.user as ExtendedUser;
        setUser(extendedUser);

        const userId = extendedUser.id || "";

        setCurrentUserId(userId);
        setAnalysisUserId(userId);
        setSecureUserId(userId);
        setSecureFirstName(extendedUser.first_name);
        setSecureLastName(extendedUser.last_name || "");
        setSecureEmail(extendedUser.email || "");

        // Store applications and products from response
        const appsFromResponse = (res as any).applications || [];
        setApplications(appsFromResponse);
        setSecureApplications(appsFromResponse);

        // Extract products from applications
        const allProducts: Product[] = [];
        appsFromResponse.forEach((app: Application) => {
          if (app.products && app.products.length > 0) {
            allProducts.push(...app.products);
          }
        });
        setProducts(allProducts);
        setSecureProducts(allProducts);

        // Extract collaborators from first application
        const collabs = appsFromResponse[0]?.collaborators || [];
        setCollaborators(collabs);
        setSecureCollaborators(collabs);

        // Set first_analysis flag
        const firstAnalysisKey = getUserScopedKey(
          STORAGE_KEYS.FIRST_ANALYSIS,
          userId
        );
        const existingFlag = localStorage.getItem(firstAnalysisKey);
        if (existingFlag === null) {
          localStorage.setItem(firstAnalysisKey, "1");
          console.log(`🏁 [AUTH] First analysis flag set for user ${userId}`);
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

        // Override with JWT applicationId if available
        if (decoded?.applicationId) {
          appId = decoded.applicationId;
        }

        if (appId) {
          setApplicationId(appId);
          setSecureApplicationId(appId);
        }

        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Auth context: Login error:", error);
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
      const parts = fullName.trim().split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ") || " ";

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
        setSecureApplicationId(response.application.id);
      }

      setSecureFirstName(firstName);
    } finally {
      setIsLoading(false);
    }
  };

  /* =====================
     LOGOUT
     ===================== */
  const logout = () => {
    // Capture tokens BEFORE clearing storage so the API call can use them
    const accessToken = getSecureAccessToken();
    const sessionId = getSecureSessionId();

    // Call backend logout endpoint with captured tokens
    if (accessToken) {
      logoutAPI(accessToken, sessionId).catch((err) => {
        console.warn(
          "Backend logout failed (session may already be expired):",
          err
        );
      });
    }

    clearAnalysisUserId();
    clearCurrentUserId();
    clearAllSecureData();

    const sessionItems = [
      "refresh_token",
      "pending_verification_email",
      "access_token",
      "session_id",
      "application_id",
      "first_name",
      "user_id",
      "product_id",
      "keywords",
      "keyword_count",
      "applications",
      "products",
    ];

    sessionItems.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });

    setUser(null);
    setApplicationId(null);
    setApplications([]);
    setProducts([]);
    setPricingPlan("free");
    setCollaborators([]);
    setUserRole("viewer");
    setUserRoleInt(4);
    setPlanInt(0);
    setPlanExpiresAt(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        applicationId,
        applications,
        products,
        pricingPlan,
        collaborators,
        userRole,
        userRoleInt,
        planInt,
        planExpiresAt,
        isLoading,
        login,
        register,
        logout,
      }}
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
