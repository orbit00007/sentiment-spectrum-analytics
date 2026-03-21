// ─── Pricing Plans ─────────────────────────────────────────────────────────

export type PricingPlanName = "free" | "launch" | "grow" | "enterprise" | "agency";

const pricingPlanNames: Record<number, PricingPlanName> = {
  0: "free",
  1: "launch",
  2: "grow",
  3: "enterprise",
  4: "agency",
};

export const getPricingPlanName = (planInt: number): PricingPlanName => {
  return pricingPlanNames[planInt] || "free";
};

export const getPricingPlanInt = (planName: string): number => {
  const entry = Object.entries(pricingPlanNames).find(([, name]) => name === planName);
  return entry ? parseInt(entry[0]) : 0;
};

// ─── User Roles ────────────────────────────────────────────────────────────

export type UserRoleName = "admin" | "application" | "editor" | "viewer";

// Note: "god" (0) is internal only and never exposed on frontend
const roleNames: Record<number, string> = {
  0: "god",
  1: "admin",
  2: "application",
  3: "editor",
  4: "viewer",
};

export const getRoleName = (roleInt: number): string => {
  return roleNames[roleInt] || "viewer";
};

export const getRoleInt = (roleName: string): number => {
  const entry = Object.entries(roleNames).find(([, name]) => name === roleName);
  return entry ? parseInt(entry[0]) : 4;
};

// Frontend-visible roles (excludes "god")
export const VISIBLE_ROLES: UserRoleName[] = ["admin", "application", "editor", "viewer"];

export const ROLE_LABELS: Record<UserRoleName, string> = {
  admin: "Admin",
  application: "Application",
  editor: "Editor",
  viewer: "Viewer",
};

// ─── Plan Limits ───────────────────────────────────────────────────────────

export interface PlanLimits {
  maxKeywords: number;              // Seed Prompts
  maxAIPrompts: number;             // Overall AI Prompts Tracked
  allowedModels: string[];          // LLMs Tracked
  maxCompetitors: number;           // Competitors Tracked
  maxConversationsPerDay: number;   // GEO Agent Intelligence (per user)
  overageChargeUSD: number;         // Additional conv charge
  maxUsers: number;                 // Seats
  analyticsCooldownHrs: number;     // Prompt Run cooldown
  canExportReport: boolean;         // Report Export
  maxAnalyticsHistory: number;      // Analytics History (last N runs)
  supportChannels: string[];        // Support channels
  hasDedicatedAccountManager: boolean;
  hasDedicatedGEOSpecialist: boolean;
  hasIntegrations: boolean;         // Google Analytics, GSC (coming soon)
}

export const PLAN_LIMITS: Record<PricingPlanName, PlanLimits> = {
  free: {
    // Free trial = same features as Launch
    maxKeywords: 3,
    maxAIPrompts: 25,
    allowedModels: ["openai"],
    maxCompetitors: 3,
    maxConversationsPerDay: 10,
    overageChargeUSD: 0,
    maxUsers: 1,
    analyticsCooldownHrs: 48,
    canExportReport: false,
    maxAnalyticsHistory: 2,
    supportChannels: ["email"],
    hasDedicatedAccountManager: false,
    hasDedicatedGEOSpecialist: false,
    hasIntegrations: true,
  },
  launch: {
    maxKeywords: 3,
    maxAIPrompts: 25,
    allowedModels: ["openai"],
    maxCompetitors: 3,
    maxConversationsPerDay: 10,
    overageChargeUSD: 0.01,
    maxUsers: 1,
    analyticsCooldownHrs: 48,
    canExportReport: false,
    maxAnalyticsHistory: 2,
    supportChannels: ["email"],
    hasDedicatedAccountManager: false,
    hasDedicatedGEOSpecialist: false,
    hasIntegrations: true,
  },
  grow: {
    maxKeywords: 6,
    maxAIPrompts: 50,
    allowedModels: ["openai", "google-ai-mode", "google-ai-overview"],
    maxCompetitors: 5,
    maxConversationsPerDay: 20,
    overageChargeUSD: 0.01,
    maxUsers: 3,
    analyticsCooldownHrs: 24,
    canExportReport: true,
    maxAnalyticsHistory: 5,
    supportChannels: ["email", "slack"],
    hasDedicatedAccountManager: false,
    hasDedicatedGEOSpecialist: false,
    hasIntegrations: true,
  },
  enterprise: {
    maxKeywords: 100,
    maxAIPrompts: 1000,
    allowedModels: ["openai", "google-ai-mode", "google-ai-overview"],
    maxCompetitors: 100,
    maxConversationsPerDay: 1000,
    overageChargeUSD: 0.01,
    maxUsers: 100,
    analyticsCooldownHrs: 0,
    canExportReport: true,
    maxAnalyticsHistory: 100,
    supportChannels: ["email", "slack"],
    hasDedicatedAccountManager: true,
    hasDedicatedGEOSpecialist: true,
    hasIntegrations: true,
  },
  agency: {
    maxKeywords: 100,
    maxAIPrompts: 1000,
    allowedModels: ["openai", "google-ai-mode", "google-ai-overview"],
    maxCompetitors: 100,
    maxConversationsPerDay: 1000,
    overageChargeUSD: 0.01,
    maxUsers: 100,
    analyticsCooldownHrs: 0,
    canExportReport: true,
    maxAnalyticsHistory: 100,
    supportChannels: ["email", "slack"],
    hasDedicatedAccountManager: true,
    hasDedicatedGEOSpecialist: true,
    hasIntegrations: true,
  },
};

export const getPlanLimits = (planName: PricingPlanName): PlanLimits => {
  return PLAN_LIMITS[planName] || PLAN_LIMITS.free;
};

// ─── Journey Access Control ────────────────────────────────────────────────

interface JourneyRule {
  minRole: number; // lower = higher privilege
  minPlan: number; // lower = lower tier
  enforcePlanExpiry: boolean;
}

export const JOURNEY_REGISTRY: Record<string, JourneyRule> = {
  // Free plan (0) has same features as Launch (1), just 7-day expiry
  // So minPlan: 0 for everything except report:export (Grow/2)
  "product:create":      { minRole: 2, minPlan: 0, enforcePlanExpiry: true },
  "product:read":        { minRole: 4, minPlan: 0, enforcePlanExpiry: false },
  "product:update":      { minRole: 3, minPlan: 0, enforcePlanExpiry: true },
  "product:delete":      { minRole: 1, minPlan: 0, enforcePlanExpiry: true },
  "keyword:create":      { minRole: 3, minPlan: 0, enforcePlanExpiry: true },
  "analytics:generate":  { minRole: 3, minPlan: 0, enforcePlanExpiry: true },
  "analytics:read":      { minRole: 4, minPlan: 0, enforcePlanExpiry: false },
  "chatbot:ask":         { minRole: 4, minPlan: 0, enforcePlanExpiry: false },
  "chatbot:history":     { minRole: 4, minPlan: 0, enforcePlanExpiry: false },
  "search:generate":     { minRole: 3, minPlan: 0, enforcePlanExpiry: true },
  "admin:manage-app":    { minRole: 1, minPlan: 0, enforcePlanExpiry: false },
  "admin:invite-user":   { minRole: 1, minPlan: 0, enforcePlanExpiry: true },
  "report:export":       { minRole: 3, minPlan: 2, enforcePlanExpiry: true },
};

/**
 * Check if user has access to a specific journey.
 * Returns { allowed: true } or { allowed: false, reason: string }
 */
export const checkJourneyAccess = (
  journeyName: string,
  userRole: number,
  userPlan: number,
  planExpiresAt?: number | null
): { allowed: boolean; reason?: string } => {
  const rule = JOURNEY_REGISTRY[journeyName];
  if (!rule) return { allowed: false, reason: "Unknown journey" };

  // God role (0) bypasses everything
  if (userRole === 0) return { allowed: true };

  // Role check (lower number = higher privilege)
  if (userRole > rule.minRole) {
    const requiredRoleName = getRoleName(rule.minRole);
    return { allowed: false, reason: `This action requires at least ${requiredRoleName} role` };
  }

  // Plan check (higher number = higher tier)
  if (userPlan < rule.minPlan) {
    const requiredPlanName = getPricingPlanName(rule.minPlan);
    return { allowed: false, reason: `This feature requires at least the ${requiredPlanName} plan` };
  }

  // Plan expiry check
  if (rule.enforcePlanExpiry && planExpiresAt) {
    if (Date.now() / 1000 > planExpiresAt) {
      return { allowed: false, reason: "Your plan has expired. Please renew to continue using this feature." };
    }
  }

  return { allowed: true };
};

// ─── Next Analytics Generation Time Helper ─────────────────────────────────

/**
 * Calculate the display-friendly next generation time.
 * Cooldown rules:
 * - >= 48hrs: rounds to midnight of the target day
 * - 24hrs: rounds to next midnight
 * - < 24hrs: exact timestamp
 */
export { 
  formatNextAnalyticsTime, 
  isAnalyticsCooldownActive, 
  getAnalyticsCooldownText, 
  getNextAnalyticsAvailableAt,
  getPlanExpiryInfo,
  formatEpoch,
  formatShortDate,
  formatFullDateTime,
  formatLocalDate,
  getRelativeTime,
} from "@/lib/dateUtils";

/** @deprecated Use formatNextAnalyticsTime from dateUtils instead */
export const getNextAnalyticsTime = (nextGenerationTimestamp: string | null): Date | null => {
  if (!nextGenerationTimestamp) return null;
  const next = new Date(nextGenerationTimestamp);
  if (isNaN(next.getTime())) return null;
  return next;
};

/** @deprecated Use formatNextAnalyticsTime from dateUtils instead */
export const isAnalyticsGenerationBlocked = (nextGenerationTimestamp: string | null): boolean => {
  const next = getNextAnalyticsTime(nextGenerationTimestamp);
  if (!next) return false;
  return Date.now() < next.getTime();
};

/** @deprecated Use getAnalyticsCooldownText from dateUtils instead */
export const getTimeUntilNextAnalytics = (nextGenerationTimestamp: string | null): string | null => {
  const next = getNextAnalyticsTime(nextGenerationTimestamp);
  if (!next) return null;
  
  const diffMs = next.getTime() - Date.now();
  if (diffMs <= 0) return null;
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.ceil(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};
