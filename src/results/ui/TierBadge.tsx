import React from "react";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: string;
  className?: string;
}

const getTierStyle = (tier: string) => {
  const t = tier?.toLowerCase() || "";
  if (t === "high" || t === "positive" || t === "leading" || t === "very strong" || t === "strong")
    return "ds-badge-positive";
  if (t === "medium" || t === "neutral" || t === "moderate")
    return "ds-badge-warning";
  if (t === "low" || t === "negative" || t === "weak" || t === "very low" || t === "absent")
    return "ds-badge-danger";
  if (t === "n/a" || t === "")
    return "ds-badge-neutral";
  return "ds-badge-info";
};

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, className }) => {
  return (
    <span className={cn("ds-badge", getTierStyle(tier), className)}>
      {tier}
    </span>
  );
};
