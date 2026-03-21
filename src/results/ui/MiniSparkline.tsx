import {
  LineChart,
  Line,
  ReferenceLine,
  Dot,
  ResponsiveContainer,
} from "recharts";
import { getKeywordSetId } from "@/results/data/analyticsData";
import type { TrendRunItem } from "@/apiHelpers";

interface MiniSparklineProps {
  runs: TrendRunItem[]; // latest-first from API — we reverse to plot L→R
  metric: "geo_score" | "mention_score" | "outlook";
  color?: string;
}

const SENTIMENT_MAP: Record<string, number> = {
  Negative: 1,
  Neutral: 2,
  Positive: 3,
};

export const MiniSparkline = ({ runs, metric, color = "hsl(var(--primary))" }: MiniSparklineProps) => {
  if (runs.length === 0) return null;

  // Reverse so oldest is first (left on chart)
  const ordered = [...runs].reverse();

  const data = ordered.map((run) => ({
    value: metric === "outlook"
      ? (SENTIMENT_MAP[run.outlook] ?? 2)
      : (run[metric] as number),
    keywordSetId: getKeywordSetId(run.keywords),
    date: run.created_at,
  }));

  // Find indices where keyword set changes vs previous item
  const changeIndices = new Set<number>();
  for (let i = 1; i < data.length; i++) {
    if (data[i].keywordSetId !== data[i - 1].keywordSetId) {
      changeIndices.add(i);
    }
  }

  const currentIdx = data.length - 1;

  // Custom dot: highlight the current (rightmost) point
  const renderDot = (props: any) => {
    const { cx, cy, index } = props;
    if (index === currentIdx) {
      return <circle key={index} cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={1.5} />;
    }
    return <circle key={index} cx={cx} cy={cy} r={2} fill={color} opacity={0.4} />;
  };

  // For sentiment mode add faint reference lines
  const sentimentRefLines = metric === "outlook"
    ? [
        { y: 1, label: "Neg" },
        { y: 2, label: "Neu" },
        { y: 3, label: "Pos" },
      ]
    : [];

  return (
    <div className="w-[120px] h-[40px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          {sentimentRefLines.map((ref) => (
            <ReferenceLine
              key={ref.y}
              y={ref.y}
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeDasharray="2 2"
            />
          ))}
          {Array.from(changeIndices).map((idx) => (
            <ReferenceLine
              key={`kw-${idx}`}
              x={idx}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeOpacity={0.8}
            />
          ))}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={renderDot}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
