import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
} from "recharts";
import { getKeywords, getBrandName, getCompetitorData } from "@/results/data/analyticsData";
import { Target, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useResults } from "@/results/context/ResultsContext";

export const BrandMentionsRadar = () => {
  const { analyticsVersion } = useResults();
  const keywords = getKeywords();
  const brandName = getBrandName();
  const competitorDataList = getCompetitorData();
  const [selectedKeyword, setSelectedKeyword] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const allBrands = useMemo(() => competitorDataList.map((c) => c.name), [competitorDataList, analyticsVersion]);

  const chartData = useMemo(() => {
    return allBrands.map((brand) => {
      const competitor = competitorDataList.find((c) => c.name === brand);
      if (!competitor) return { brand, score: 0 };
      if (selectedKeyword === "all") return { brand, score: competitor.keywordScores.reduce((sum, s) => sum + s, 0) };
      const idx = keywords.indexOf(selectedKeyword);
      return { brand, score: idx >= 0 ? competitor.keywordScores[idx] || 0 : 0 };
    });
  }, [allBrands, competitorDataList, selectedKeyword, keywords, analyticsVersion]);

  const maxScore = Math.max(...chartData.map((d) => d.score), 1);

  const insight = useMemo(() => {
    const brandData = chartData.find((d) => d.brand === brandName);
    if (!brandData) return { main: `${brandName} is not visible`, sub: "No mentions detected." };
    const sorted = [...chartData].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex((d) => d.brand === brandName) + 1;
    if (brandData.score === 0) return { main: `${brandName} has no measurable authority`, sub: "Not referenced in this keyword set." };
    if (rank === 1) return { main: `${brandName} leads in AI mentions`, sub: "Strong authority across key areas." };
    if (rank <= 3) return { main: `${brandName} ranks #${rank} overall`, sub: "Competitive but not leading." };
    return { main: `${brandName} ranks #${rank}`, sub: "Limited visibility vs leaders." };
  }, [chartData, brandName]);

  return (
    <div className="ds-card">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-ds-warning" />
          <h3 className="text-[14px] font-semibold text-ds-text">Mention Distribution</h3>
        </div>
        <div className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium text-ds-text border border-border hover:bg-muted transition-colors" style={{ background: '#F8FAFC' }}>
            <span className="max-w-[100px] truncate">{selectedKeyword === "all" ? "All Keywords" : selectedKeyword}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-elevated z-50 max-h-52 overflow-y-auto">
              <button onClick={() => { setSelectedKeyword("all"); setIsDropdownOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted transition-colors ${selectedKeyword === "all" ? "bg-muted text-ds-blue font-medium" : "text-ds-text"}`}>
                All Keywords
              </button>
              {keywords.map((kw, idx) => (
                <button key={idx} onClick={() => { setSelectedKeyword(kw); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted transition-colors ${selectedKeyword === kw ? "bg-muted text-ds-blue font-medium" : "text-ds-text"}`}>
                  {kw}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="text-[12px] text-ds-text-muted mb-3">Topic authority across key categories</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
            <PolarGrid stroke="#E3EAF2" />
            <PolarAngleAxis dataKey="brand" tick={({ x, y, payload }) => {
              const isBrand = payload.value === brandName;
              return (<text x={x} y={y} fill={isBrand ? "#4DA6FF" : "#737E8F"} fontSize={10} fontWeight={isBrand ? 600 : 400} textAnchor="middle" dominantBaseline="middle">
                {payload.value.length > 10 ? payload.value.substring(0, 10) + "…" : payload.value}
              </text>);
            }} />
            <PolarRadiusAxis angle={90} domain={[0, maxScore]} tick={{ fill: "#737E8F", fontSize: 9 }} />
            <Radar name="Score" dataKey="score" stroke="#4DA6FF" fill="#4DA6FF" fillOpacity={0.2} strokeWidth={2} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E3EAF2", borderRadius: "8px", fontSize: 12 }} formatter={(value: number) => [value, "Mentions"]} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg p-3 mt-2" style={{ background: '#EFF3F8', borderLeft: '3px solid #4DA6FF' }}>
        <p className="text-[13px] font-semibold text-ds-text">{insight.main}</p>
        <p className="text-[12px] text-ds-text-muted">{insight.sub}</p>
      </div>
    </div>
  );
};
