import type { ChatUsage } from "@/apiHelpers";

export type UsageStatus = "healthy" | "warning" | "critical" | "locked";

export function getUsageStatus(usage: ChatUsage | null): UsageStatus {
  if (!usage) return "healthy";
  if (usage.remaining <= 0) return "locked";
  if (usage.limit <= 0) return "critical";
  const pct = usage.remaining / usage.limit;
  if (pct <= 0.25) return "critical";
  if (pct <= 0.5) return "warning";
  return "healthy";
}

export function getUsageProgress(usage: ChatUsage | null): number {
  if (!usage || usage.limit <= 0) return 0;
  const pct = (usage.used / usage.limit) * 100;
  return Math.min(100, Math.max(0, pct));
}

export const USAGE_PROGRESS_COPY: Record<UsageStatus, { label: string; detail: string }> = {
  healthy: {
    label: "Plenty of room",
    detail: "You still have good capacity for today.",
  },
  warning: {
    label: "Getting close",
    detail: "You are moving through today's allowance.",
  },
  critical: {
    label: "Almost full",
    detail: "Only a small amount of chat capacity remains today.",
  },
  locked: {
    label: "Limit reached",
    detail: "You have used today's chat allowance.",
  },
};

export function formatResetsAt(isoString: string): string {
  const resetAt = new Date(isoString);
  if (Number.isNaN(resetAt.getTime())) return "soon";

  const now = new Date();
  const diffMs = resetAt.getTime() - now.getTime();

  const exactText = resetAt.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffMs <= 0) {
    return `at ${exactText}`;
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (totalMinutes < 1) {
    return `in <1m (${exactText})`;
  }

  if (totalHours < 1) {
    return `in ${totalMinutes}m (${exactText})`;
  }

  if (totalHours < 24) {
    if (minutes === 0) {
      return `in ${totalHours}h (${exactText})`;
    }
    return `in ${totalHours}h ${minutes}m (${exactText})`;
  }

  if (days === 1 && hours === 0) {
    return `in 1d (${exactText})`;
  }

  if (hours === 0) {
    return `in ${days}d (${exactText})`;
  }

  return `in ${days}d ${hours}h (${exactText})`;
}

export const USAGE_COPY = {
  healthy: {
    nudge: null,
    placeholder: "Ask anything about this product",
  },
  warning: {
    nudge: "You're nearing today's chat limit.",
    placeholder: "Ask anything about this product",
  },
  critical: {
    nudge: "Only a few chats left for today.",
    placeholder: "Ask anything about this product",
  },
  locked: {
    nudge: "Daily chat limit reached.",
    subtext: (resetText: string) =>
      `Chat will be available again ${resetText}`,
    placeholder: "Daily limit reached",
  },
} as const;
