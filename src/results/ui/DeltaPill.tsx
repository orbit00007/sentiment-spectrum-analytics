import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

type DeltaPillProps =
  | {
      type?: "numeric";
      current: number;
      previous: number;
      unit?: string;
    }
  | {
      type: "sentiment";
      current: string;
      previous: string;
      unit?: never;
    };

const SENTIMENT_ORDER: Record<string, number> = {
  Negative: 1,
  Neutral: 2,
  Positive: 3,
};

export const DeltaPill = (props: DeltaPillProps) => {
  if (props.type === "sentiment") {
    const cur = SENTIMENT_ORDER[props.current] ?? 0;
    const prev = SENTIMENT_ORDER[props.previous] ?? 0;

    if (cur > prev) {
      return (
        <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", "bg-emerald-500/10 text-emerald-600")}>
          <ArrowUp className="w-3 h-3" />
          Improved vs last run
        </span>
      );
    }
    if (cur < prev) {
      return (
        <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", "bg-red-500/10 text-red-600")}>
          <ArrowDown className="w-3 h-3" />
          Declined vs last run
        </span>
      );
    }
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", "bg-muted text-muted-foreground")}>
        <ArrowRight className="w-3 h-3" />
        Unchanged vs last run
      </span>
    );
  }

  const diff = props.current - props.previous;
  const unit = props.unit ?? "";

  if (diff > 0) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", "bg-emerald-500/10 text-emerald-600")}>
        <ArrowUp className="w-3 h-3" />
        +{diff}{unit} vs last run
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", "bg-red-500/10 text-red-600")}>
        <ArrowDown className="w-3 h-3" />
        {diff}{unit} vs last run
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", "bg-muted text-muted-foreground")}>
      <ArrowRight className="w-3 h-3" />
      Unchanged vs last run
    </span>
  );
};
