interface SpeedometerProps {
  value: number;
  maxValue?: number;
}

export const Speedometer = ({ value, maxValue = 400 }: SpeedometerProps) => {
  // Clamp value between 0 and maxValue
  const clampedValue = Math.max(0, Math.min(value, maxValue));

  // Calculate rotation angle (-90 to 90 degrees for a 180-degree arc)
  const rotation = -90 + (clampedValue / maxValue) * 180;

  // Determine color zone
  const zoneColor =
    clampedValue < maxValue/4
      ? "hsl(var(--negative))"
      : clampedValue < maxValue/2 + maxValue
      ? "hsl(var(--warning))"
      : "hsl(var(--positive))";

  return (
    <div className="relative w-full max-w-[240px] mx-auto py-6">
      {/* Speedometer Arc */}
      <svg viewBox="0 0 200 120" className="w-full">
        <defs>
          <linearGradient
            id="speedometerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="hsl(var(--negative))" />
            <stop offset="60%" stopColor="hsl(var(--warning))" />
            <stop offset="100%" stopColor="hsl(var(--positive))" />
          </linearGradient>
        </defs>

        {/* Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#speedometerGradient)"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Needle */}
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

        {/* Center circle */}
        <circle cx="100" cy="100" r="4" fill="hsl(var(--background))" />
      </svg>

      {/* Labels */}
      <div className="absolute inset-x-0 -bottom-2 flex justify-between items-center px-6 text-sm font-medium text-muted-foreground">
        <span>0</span>
        <span className="font-bold text-foreground text-2xl">
          {clampedValue}
        </span>
        <span>{maxValue}</span>
      </div>
  
      {/* Zone Labels */}
      <div className="absolute inset-x-0 -top-2 flex justify-between px-4 text-sm font-semibold">
        <span style={{ color: "hsl(var(--negative))" }}>Low</span>
        <span style={{ color: "hsl(var(--warning))" }}>Medium</span>
        <span style={{ color: "hsl(var(--positive))" }}>High</span>
      </div>
    </div>
  );
};
