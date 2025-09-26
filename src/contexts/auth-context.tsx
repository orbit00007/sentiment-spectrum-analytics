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
    firstName: string,
    lastName: string,
    appName?: string
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
    
    console.log("AuthProvider useEffect - storedAppId:", storedAppId);
    console.log("AuthProvider useEffect - storedToken:", storedToken ? "present" : "missing");
    
    if (storedAppId) {
      setApplicationId(storedAppId);
    }
    
    // If we have a token, restore user state (user is logged in)
    if (storedToken) {
      console.log("Token found, restoring user state");
      setUser({ id: "restored", email: "user@restored.com", first_name: "User", last_name: "Restored" });
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
    firstName: string,
    lastName: string,
    appName: string = "DefaultApp"
  ) => {
    setIsLoading(true);
    try {
      const payload: RegisterRequest = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        app_name: appName,
      };

      const response: RegisterResponse = await registerAPI(payload);

      if (response.application?.id) {
        setApplicationId(response.application.id);
      }

      // Auto-login (ensures consistency with login flow)
      await login(email, password);
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
