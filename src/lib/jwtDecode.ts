import { jwtDecode } from "jwt-decode";
import { getPricingPlanName, getRoleName } from "./plans";

export interface JWTPayload {
  user_id: string;
  email: string;
  application_id?: string;
  role: number;          // int role level
  pricing_plan: number;  // int pricing plan
  plan_expires_at?: number | null; // unix timestamp
  exp: number;
  nbf: number;
  iat: number;
}

export interface DecodedTokenInfo {
  userId: string;
  email: string;
  roleInt: number;
  roleName: string;
  planInt: number;
  planName: string;
  planExpiresAt: number | null;
  applicationId: string;
  expiresAt: number;
}

export const decodeAccessToken = (token: string): DecodedTokenInfo | null => {
  try {
    const payload = jwtDecode<JWTPayload>(token);
    
    return {
      userId: payload.user_id || "",
      email: payload.email || "",
      roleInt: payload.role ?? 4,
      roleName: getRoleName(payload.role ?? 4),
      planInt: payload.pricing_plan ?? 0,
      planName: getPricingPlanName(payload.pricing_plan ?? 0),
      planExpiresAt: payload.plan_expires_at || null,
      applicationId: payload.application_id || "",
      expiresAt: payload.exp || 0,
    };
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};
