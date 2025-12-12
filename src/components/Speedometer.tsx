import { safeNumber } from "@/lib/formulas";

interface SpeedometerProps {
  value: number;
  maxValue?: number;
  color?: string;
  showSubtext?: boolean;
  competitorCount?: number;
  topBrandScore?: number;
  topBrandName?: string;
  isPercentile?: boolean;
}

export const Speedometer = ({
  value,
  maxValue = 100,
  color,
  showSubtext = false,
  competitorCount,
  topBrandScore,
  topBrandName,
  isPercentile = true,
}: SpeedometerProps) => {
  const safeValue = safeNumber(value, 0);
  const safeMaxValue = safeNumber(maxValue, 100);

  const clampedValue = Math.max(0, Math.min(safeValue, safeMaxValue));
  const rotation = safeNumber(-90 + (clampedValue / safeMaxValue) * 180, -90);

  // Use provided color or derive from value
  const zoneColor = color || (
    clampedValue >= 80
      ? "hsl(var(--success))"
      : clampedValue >= 40
      ? "hsl(var(--medium-neutral))"
      : "hsl(var(--destructive))"
  );

  return (
    <div className="w-full max-w-[140px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[240px] mx-auto py-4 lg:py-6 flex flex-col items-center gap-2">

      {/* ---- Low / Medium / High ABOVE the gauge ---- */}
      <div className="w-full flex justify-between px-3 sm:px-4 text-[9px] sm:text-[10px] lg:text-sm font-semibold">
        <span style={{ color: "hsl(var(--destructive))" }}>Low</span>
        <span style={{ color: "hsl(var(--medium-neutral))" }}>Medium</span>
        <span style={{ color: "hsl(var(--success))" }}>High</span>
      </div>

      {/* ---- Gauge ---- */}
      <svg viewBox="0 0 200 120" className="w-full">
        <defs>
          <linearGradient
            id="percentileGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="hsl(0, 84%, 60%)" />
            <stop offset="20%" stopColor="hsl(25, 95%, 53%)" />
            <stop offset="40%" stopColor="hsl(38, 92%, 50%)" />
            <stop offset="55%" stopColor="hsl(48, 96%, 53%)" />
            <stop offset="70%" stopColor="hsl(84, 81%, 44%)" />
            <stop offset="85%" stopColor="hsl(142, 71%, 45%)" />
            <stop offset="100%" stopColor="hsl(142, 76%, 36%)" />
          </linearGradient>
        </defs>

        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#percentileGradient)"
          strokeWidth="20"
          strokeLinecap="round"
        />

        <g transform={`rotate(${rotation} 100 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke={zoneColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="6" fill={zoneColor} />
        </g>

        <circle cx="100" cy="100" r="4" fill="hsl(var(--background))" />
      </svg>

      {/* ---- Numbers below the gauge ---- */}
      <div className="w-full flex justify-between items-center px-4 sm:px-6 text-[10px] sm:text-xs lg:text-sm font-medium text-muted-foreground">
        <span>0</span>
        <span className="font-bold text-foreground text-lg sm:text-xl lg:text-2xl">
          {Math.round(clampedValue)}
        </span>
        <span>{isPercentile ? 100 : safeMaxValue}</span>
      </div>

      {/* ---- Subtext section ---- */}
      {showSubtext && (
        <div className="text-center mt-2 space-y-1">
          <p className="text-xs sm:text-sm text-muted-foreground">
            You are ahead of{" "}
            <span className="font-semibold text-foreground">
              {Math.round(clampedValue)}%
            </span>{" "}
            of the brands in this comparison
          </p>

          {competitorCount !== undefined && (
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Based on Visibility score across{" "}
              <span className="font-semibold text-primary">
                {competitorCount}
              </span>{" "}
              brands
            </p>
          )}

          {topBrandScore !== undefined && topBrandName && (
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Top Brand:{" "}
              <span className="font-semibold text-primary">{topBrandName}</span>
              <br />
              Top Brand's Total Mentions:{" "}
              <span className="font-semibold text-primary">
                {topBrandScore}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
