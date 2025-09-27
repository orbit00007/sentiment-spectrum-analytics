import React, { createContext, useContext, useState, useEffect } from "react";
import {
  login as loginAPI,
  register as registerAPI,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/apiHelpers";

/* =====================
   TYPES
   ===================== */
interface ExtendedUser extends NonNullable<LoginResponse["user"]> {
  owned_applications?: { id: string; company_name: string; project_token: string }[];
}

interface AuthContextType {
  user: ExtendedUser | null;
  applicationId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);

  /* Restore state from localStorage on refresh */
  useEffect(() => {
    const storedAppId = localStorage.getItem("application_id");
    const storedToken = localStorage.getItem("access_token");
    const storedFirstName = localStorage.getItem("first_name");
    
    if (storedAppId) {
      setApplicationId(storedAppId);
    }
    
    // If we have a token, restore user state (user is logged in)
    if (storedToken) {
      setUser({ 
        id: "restored", 
        email: "user@restored.com", 
        first_name: storedFirstName || "User", 
        last_name: "User" 
      });
    }
  }, []);

  /* =====================
     LOGIN
     ===================== */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await loginAPI({ email, password });

      if (res.user) {
        const extendedUser = res.user as ExtendedUser;
        setUser(extendedUser);

        // Save first name to localStorage
        localStorage.setItem("first_name", extendedUser.first_name);

        // Pick applicationId from response (apiHelpers already saves it to localStorage)
        let appId: string | null = null;
        if (extendedUser.owned_applications?.length) {
          appId = extendedUser.owned_applications[0].id;
        } else if ((res as any).application?.id) {
          appId = (res as any).application.id;
        }

        if (appId) {
          setApplicationId(appId);
        }

        console.log("Login completed successfully");
      }
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
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      const payload: RegisterRequest = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        app_name: "My Company",
      };

      const response: RegisterResponse = await registerAPI(payload);

      if (response.application?.id) {
        setApplicationId(response.application.id);
      }

      // Save first name to localStorage
      localStorage.setItem("first_name", firstName);

      // Auto-login (ensures consistency with login flow)
      await login(email, password);
      
      console.log("Registration completed successfully");
    } finally {
      setIsLoading(false);
    }
  };

  /* =====================
     LOGOUT
     ===================== */
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("application_id");
    localStorage.removeItem("first_name");
    localStorage.removeItem("keywords");
    localStorage.removeItem("keyword_count");
    localStorage.removeItem("product_id");
    setUser(null);
    setApplicationId(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, applicationId, isLoading, login, register, logout }}
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
