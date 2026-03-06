import React from "react";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: string;
  className?: string;
}

const getTierStyle = (tier: string) => {
  const t = tier?.toLowerCase() || "";
  if (t === "high" || t === "positive" || t === "leading" || t === "very strong" || t === "strong")
    return "bg-[#22C55E] text-white border-none";
  if (t === "medium" || t === "neutral" || t === "moderate")
    return "bg-[#F5BE20] text-white border-none";
  if (t === "low" || t === "negative" || t === "weak" || t === "very low" || t === "absent")
    return "bg-[#F25454] text-white border-none";
  if (t === "n/a" || t === "")
    return "bg-[#94A3B8] text-white border-none";
  return "bg-[#4DA6FF] text-white border-none";
};

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, className }) => {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-bold px-2.5 py-0.5 text-[11px]",
      getTierStyle(tier),
      className
    )}>
      {tier}
    </span>
  );
};
