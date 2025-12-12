import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getAnalytics,
  getCompetitorNames,
  getBrandName,
  getBrandInfoWithLogos,
} from "@/results/data/analyticsData";
import { Layers, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";

const competitorColors = [
  "hsl(142, 40%, 60%)",  // soft green
  "hsl(45, 70%, 65%)",   // soft yellow
  "hsl(258, 55%, 70%)",  // soft purple
  "hsl(0, 65%, 70%)",    // soft red
  "hsl(28, 65%, 65%)"    // soft amber
];

export const SourceMentionsChart = () => {
  const analytics = getAnalytics();
  const brandName = getBrandName();
  const competitorNames = getCompetitorNames();
  const brandInfo = getBrandInfoWithLogos();

  // Assign color to each brand
  const brandColors = useMemo(() => {
    const map: Record<string, string> = {};
    let index = 0;
    competitorNames.forEach((brand) => {
      map[brand] =
        brand === brandName
          ? "hsl(var(--primary))"
          : competitorColors[index++ % competitorColors.length];
    });
    return map;
  }, [competitorNames, brandName]);

  // Extract source names
  const sourcesData = analytics?.sources_and_content_impact;

  const sources = useMemo(() => {
    if (!sourcesData?.rows) return [];
    return sourcesData.rows.map((row: any[]) => row[0] as string);
  }, [sourcesData]);

  const [selectedSource, setSelectedSource] = useState("All Sources");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Build chart data (sum or per source)
  const chartData = useMemo(() => {
    if (!sourcesData?.rows || !sourcesData?.header) return [];
    const header = sourcesData.header;

    const getMentionIndex = (brand: string) =>
      header.indexOf(`${brand} Mentions`);

    // ALL SOURCES → sum
    if (selectedSource === "All Sources") {
      const totals: Record<string, number> = {};
      competitorNames.forEach((brand) => (totals[brand] = 0));

      sourcesData.rows.forEach((row) => {
        competitorNames.forEach((brand) => {
          const idx = getMentionIndex(brand);
          const value = idx !== -1 ? Number(row[idx] ?? 0) : 0;
          totals[brand] += value;
        });
      });      

      return competitorNames.map((brand) => ({
        brand,
        mentions: totals[brand],
        logo: brandInfo.find((b) => b.brand === brand)?.logo || "",
        isBrand: brand === brandName,
        color: brandColors[brand],
      }));
    }

    // SPECIFIC SOURCE → single row
    const row = sourcesData.rows.find((r) => r[0] === selectedSource);
    if (!row) return [];

    return competitorNames.map((brand) => {
      const idx = getMentionIndex(brand);
      return {
        brand,
        mentions: idx !== -1 ? row[idx] ?? 0 : 0,
        logo: brandInfo.find((b) => b.brand === brand)?.logo || "",
        isBrand: brand === brandName,
        color: brandColors[brand],
      };
    });
  }, [
    selectedSource,
    sourcesData,
    competitorNames,
    brandName,
    brandInfo,
    brandColors,
  ]);

  const allSources = ["All Sources", ...sources];

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Source Mentions
          </h3>
        </div>

        {/* Source Dropdown */}
        <div className="relative w-full max-w-xs">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg text-sm font-medium text-foreground transition-colors w-full"
          >
            <span className="truncate">{selectedSource}</span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />

              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 w-full min-w-[200px] max-h-[280px] overflow-y-auto py-1">
                {allSources.map((source) => (
                  <button
                    key={source}
                    onClick={() => {
                      setSelectedSource(source);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm whitespace-normal hover:bg-muted transition-colors ${
                      selectedSource === source
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground"
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-6">
        Brand mentions by source category
      </p>

      {/* Chart */}
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              horizontal
              vertical={false}
            />

            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />

            <YAxis
              type="category"
              dataKey="brand"
              stroke="hsl(var(--muted-foreground))"
              tickLine={false}
              axisLine={false}
              width={150}
              fontSize={12}
              tick={({ x, y, payload }) => {
                const item = chartData.find((d) => d.brand === payload.value);
                return (
                  <g transform={`translate(${x},${y})`}>
                    <foreignObject x={-130} y={-12} width={130} height={24}>
                      <div className="flex items-center gap-2 justify-end">
                        {item?.logo && (
                          <img
                            src={item.logo}
                            alt={item.brand}
                            className="w-5 h-5 rounded-full bg-white object-contain"
                          />
                        )}
                        <span
                          className={`text-xs truncate ${
                            item?.isBrand
                              ? "text-primary font-semibold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item?.brand}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
              }}
              formatter={(v) => [`${v} mentions`, ""]}
              labelFormatter={(label) => (
                <span className="font-semibold">{label}</span>
              )}
            />

            <Bar dataKey="mentions" barSize={28} radius={[0, 6, 6, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-border">
        {chartData.map((item) => (
          <div key={item.brand} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span
              className={`text-xs ${
                item.isBrand
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {item.brand}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
