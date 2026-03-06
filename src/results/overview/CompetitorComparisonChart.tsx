import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { getBrandInfoWithLogos, getBrandName } from "@/results/data/analyticsData";
import { TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";
import { useResults } from "@/results/context/ResultsContext";

type ViewMode = "geo_score" | "mentions";

const competitorColors = ["#22C55E", "#F5BE20", "#F25454", "#A78BFA", "#FB923C", "#22D3EE"];

export const CompetitorComparisonChart = () => {
  const { analyticsVersion } = useResults();
  const [viewMode, setViewMode] = useState<ViewMode>("geo_score");
  const brandInfo = getBrandInfoWithLogos();
  const brandName = getBrandName();

  const brandColors = useMemo(() => {
    const map: Record<string, string> = {};
    let colorIndex = 0;
    brandInfo.forEach((b) => {
      map[b.brand] = b.brand === brandName ? "#4DA6FF" : competitorColors[colorIndex++ % competitorColors.length];
    });
    return map;
  }, [brandInfo, brandName, analyticsVersion]);

  const sortedBrands = useMemo(() => {
    const myBrand = brandInfo.find(b => b.brand === brandName);
    const competitors = brandInfo.filter(b => b.brand !== brandName);
    return myBrand ? [myBrand, ...competitors] : competitors;
  }, [brandInfo, brandName, analyticsVersion]);

  const chartData = useMemo(() => {
    return sortedBrands.map((brand) => ({
      name: brand.brand, value: viewMode === "geo_score" ? brand.geo_score : brand.mention_count,
      geoScore: brand.geo_score, mentionCount: brand.mention_count, logo: brand.logo,
      isBrand: brand.brand === brandName, color: brandColors[brand.brand],
      geoTier: brand.geo_tier, outlook: brand.outlook,
    }));
  }, [sortedBrands, viewMode, brandName, brandColors, analyticsVersion]);

  const maxValue = useMemo(() => Math.max(...chartData.map((d) => d.value), 1), [chartData]);

  return (
    <div className="ds-card">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-ds-blue" />
          <h3 className="text-[14px] font-semibold text-ds-text">Competitive Landscape</h3>
        </div>
        <div className="flex items-center gap-0.5 rounded-full p-0.5 border border-border" style={{ background: '#F8FAFC' }}>
          {(["geo_score", "mentions"] as ViewMode[]).map((mode) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-2.5 py-1 text-[12px] font-medium rounded-full transition-all ${
                viewMode === mode ? "bg-card text-ds-text shadow-sm" : "text-ds-text-muted hover:text-ds-text"
              }`}>
              {mode === "geo_score" ? "AI Visibility Score" : "Mentions"}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[12px] text-ds-text-muted mb-4">How you stack up against competitors in AI search results</p>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3EAF2" />
            <XAxis type="number" stroke="#737E8F" axisLine={false} tickLine={false} domain={[0, maxValue]} fontSize={11} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} stroke="#737E8F" fontSize={11} width={110}
              tick={({ x, y, payload }) => {
                const brand = chartData.find((b) => b.name === payload.value);
                return (
                  <g transform={`translate(${x},${y})`}>
                    <foreignObject x={-105} y={-10} width={105} height={20}>
                      <div className="flex items-center gap-1.5 justify-end">
                        {brand?.logo && <img src={brand.logo} alt={payload.value} className="w-4 h-4 rounded-full bg-white object-contain" />}
                        <span className={`text-[11px] truncate ${brand?.isBrand ? "text-ds-blue font-semibold" : "text-ds-text-muted"}`}>
                          {payload.value}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              }}
            />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E3EAF2", borderRadius: 8, fontSize: 12 }}
              formatter={(value, name, props) => {
                const data = props.payload;
                return [<div className="space-y-0.5 text-[12px]"><div>Score: <strong>{data.geoScore}</strong></div><div>Mentions: <strong>{data.mentionCount}</strong></div></div>, null];
              }}
              labelFormatter={(label) => <span className="font-semibold text-[12px]">{label}</span>}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
