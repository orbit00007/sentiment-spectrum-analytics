import {
  getAnalytics,
  getCompetitorData,
  getCompetitorSentiment,
  getCompetitorVisibility,
  getBrandName,
  getKeywords,
  getBrandLogo,
  getBrandInfoWithLogos,
  getSourcesData,
} from "@/results/data/analyticsData";
import { TierBadge } from "@/results/ui/TierBadge";
import { useState, useMemo, useEffect } from "react";
import {
  Trophy,
  BarChart3,
  MessageCircle,
  Layers,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mt-8 mb-4">
    <div className="ds-section-title">
      <h2 className="text-lg font-bold text-ds-text">{title}</h2>
    </div>
    <p className="ds-section-subtitle">{subtitle}</p>
  </div>
);

const CompetitorsComparisonsContent = () => {
  const analytics = getAnalytics();
  const brandName = getBrandName();
  const keywords = getKeywords();
  const competitorData = getCompetitorData();
  const competitorSentiment = getCompetitorSentiment();
  const sourcesDataRaw = getSourcesData();
  const brandInfo = getBrandInfoWithLogos();

  const sortedCompetitorData = useMemo(() => {
    const sorted = [...competitorData].sort((a, b) => {
      const totalA = a.keywordScores.reduce((sum, score) => sum + (Number(score) || 0), 0);
      const totalB = b.keywordScores.reduce((sum, score) => sum + (Number(score) || 0), 0);
      return totalB - totalA;
    });
    const primaryBrandIndex = sorted.findIndex((c) => c.name === brandName);
    if (primaryBrandIndex !== -1) {
      const primaryBrand = sorted.splice(primaryBrandIndex, 1)[0];
      sorted.push(primaryBrand);
    }
    return sorted;
  }, [competitorData, brandName]);

  const sortedCompetitorSentiment = useMemo(() => {
    const sorted = [...competitorSentiment];
    const primaryBrandIndex = sorted.findIndex((s) => s.brand === brandName);
    if (primaryBrandIndex !== -1) {
      const primaryBrand = sorted.splice(primaryBrandIndex, 1)[0];
      sorted.push(primaryBrand);
    }
    return sorted;
  }, [competitorSentiment, brandName]);

  const allBrandNames = useMemo(() => {
    const brands = competitorData.map((c) => c.name);
    const primaryBrandIndex = brands.findIndex((b) => b === brandName);
    if (primaryBrandIndex !== -1) {
      const primaryBrand = brands.splice(primaryBrandIndex, 1)[0];
      brands.push(primaryBrand);
    }
    return brands;
  }, [competitorData, brandName]);

  const sourcesData = useMemo(() => {
    if (!sourcesDataRaw || typeof sourcesDataRaw !== 'object') return [];
    return Object.entries(sourcesDataRaw).map(([sourceName, sourceData]: [string, any]) => {
      const row: any = { name: sourceName };
      if (sourceData && sourceData.mentions && typeof sourceData.mentions === 'object') {
        allBrandNames.forEach(brand => { row[`${brand}Mentions`] = sourceData.mentions[brand]?.count || 0; });
      } else {
        allBrandNames.forEach(brand => { row[`${brand}Mentions`] = 0; });
      }
      return row;
    });
  }, [sourcesDataRaw, allBrandNames]);

  // Max for heatmap
  const maxMentionValue = useMemo(() => {
    let max = 0;
    sourcesData.forEach((source: any) => {
      allBrandNames.forEach(brand => {
        const v = source[`${brand}Mentions`] || 0;
        if (v > max) max = v;
      });
    });
    return max || 3;
  }, [sourcesData, allBrandNames]);

  const getHeatmapStyle = (value: number) => {
    if (value === 0) return { bg: '#F8FAFC', text: '#CBD5E1' };
    if (value === 1) return { bg: '#DBEAFE', text: '#4DA6FF' };
    if (value === 2) return { bg: '#93C5FD', text: '#1E40AF' };
    return { bg: '#4DA6FF', text: '#FFFFFF' };
  };

  // Parse sentiment summary into chips
  const parseSentiment = (summary: string) => {
    if (!summary) return [];
    return summary.split(/[●•]|\n/).map(s => s.trim()).filter(s => s.length > 0);
  };

  const getOutlookBadge = (outlook: string) => {
    if (outlook === "Positive") return "ds-badge ds-badge-positive";
    if (outlook === "Negative") return "ds-badge ds-badge-danger";
    if (outlook === "Neutral") return "ds-badge ds-badge-warning";
    return "ds-badge ds-badge-neutral";
  };

  const maxTotal = useMemo(() => {
    return Math.max(...sortedCompetitorData.map(c => c.keywordScores.reduce((s, v) => s + (Number(v) || 0), 0)), 1);
  }, [sortedCompetitorData]);

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-6">
      {/* Header */}
      <div className="ds-card !rounded-2xl !px-6 !py-5">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center border border-[#DBEAFE] flex-shrink-0">
                <Trophy className="w-4 h-4 text-ds-blue" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ds-text-muted">Competitive Intelligence</span>
            </div>
            <h1 className="text-[32px] md:text-[48px] leading-[1.02] font-semibold tracking-[-0.02em] text-ds-text">Competitor Analysis</h1>
            <p className="text-[13px] text-ds-text-muted leading-relaxed mt-2 max-w-2xl">See who's winning the AI visibility race in your industry</p>
          </div>
          <div className="hidden md:flex items-center gap-8 flex-shrink-0 pt-2">
            <div className="text-center">
              <div className="text-[32px] font-bold text-ds-text leading-none">{competitorData.length}</div>
              <div className="text-[11px] text-ds-text-muted uppercase tracking-[0.15em] font-medium mt-1">Brands</div>
            </div>
            <div className="text-center">
              <div className="text-[32px] font-bold text-ds-text leading-none">{keywords.length}</div>
              <div className="text-[11px] text-ds-text-muted uppercase tracking-[0.15em] font-medium mt-1">Keywords</div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyword Performance Matrix */}
      <div className="ds-card overflow-hidden mt-4 !p-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-ds-blue" />
            <h3 className="text-[14px] font-semibold text-ds-text">Keyword Performance Matrix</h3>
          </div>
          <p className="text-[12px] text-ds-text-muted mt-1">Who wins each keyword battle in AI responses</p>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border" style={{ background: '#F8FAFC' }}>
                <th className="table-header text-left py-3 px-4">Brand</th>
                {keywords.map((keyword, idx) => (
                  <th key={`kw-${idx}`} className="table-header text-center py-3 px-4">
                    <span className="truncate block max-w-[120px]" title={keyword}>{keyword}</span>
                  </th>
                ))}
                <th className="table-header text-center py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedCompetitorData.map((c) => {
                const isPrimaryBrand = c.name === brandName;
                const total = c.keywordScores.reduce((sum, score) => sum + (Number(score) || 0), 0);
                return (
                  <tr key={c.name} className={`border-b border-border transition-colors ${isPrimaryBrand ? "" : "hover:bg-muted/30"}`}
                    style={isPrimaryBrand ? { background: '#EFF6FF', borderLeft: '3px solid #4DA6FF' } : {}}>
                    <td className="py-3 px-4 font-medium text-ds-text">
                      <div className="flex items-center gap-2">
                        {c.logo ? (
                          <img src={c.logo} alt={c.name} className="w-5 h-5 rounded-full object-contain bg-white" style={{ width: 20, height: 20 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        ) : (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isPrimaryBrand ? "bg-ds-blue text-white" : "bg-muted text-ds-text-muted"}`}>{c.name[0]}</div>
                        )}
                        <span className="text-[13px] font-semibold">{c.name}</span>
                      </div>
                    </td>
                    {c.keywordScores.map((score, idx) => (
                      <td key={idx} className="py-3 px-4 text-center text-[13px] text-ds-text font-medium">{score}</td>
                    ))}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`px-3 py-1 rounded-full font-semibold text-[13px] ${isPrimaryBrand ? "text-white" : "text-ds-text"}`}
                          style={{ background: isPrimaryBrand ? '#4DA6FF' : '#EFF3F8' }}>{total}</span>
                        <div className="w-16 h-1 rounded-full" style={{ background: '#EFF3F8' }}>
                          <div className="h-full rounded-full" style={{ width: `${(total / maxTotal) * 100}%`, background: isPrimaryBrand ? '#4DA6FF' : '#CBD5E1' }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Brand Perception */}
      <div className="ds-card overflow-hidden mt-4 !p-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-ds-blue" />
            <h3 className="text-[14px] font-semibold text-ds-text">AI Brand Perception</h3>
          </div>
          <p className="text-[12px] text-ds-text-muted mt-1">What AI is saying about you and your competitors</p>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border" style={{ background: '#F8FAFC' }}>
                <th className="table-header text-left py-3 px-4">Brand</th>
                <th className="table-header text-left py-3 px-4">Sentiment Summary</th>
                <th className="table-header text-center py-3 px-4">Overall Outlook</th>
              </tr>
            </thead>
            <tbody>
              {sortedCompetitorSentiment.map((sentiment) => {
                const isPrimaryBrand = sentiment.brand === brandName;
                const bullets = parseSentiment(sentiment.summary);
                return (
                  <tr key={sentiment.brand} className={`border-b border-border transition-colors ${isPrimaryBrand ? "" : "hover:bg-muted/30"}`}
                    style={isPrimaryBrand ? { background: '#EFF6FF' } : {}}>
                    <td className="py-3 px-4 font-medium text-ds-text">
                      <div className="flex items-center gap-2">
                        {sentiment.logo ? (
                          <img src={sentiment.logo} alt={sentiment.brand} className="w-5 h-5 rounded-full object-contain bg-white" style={{ width: 20, height: 20 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        ) : (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isPrimaryBrand ? "bg-ds-blue text-white" : "bg-muted text-ds-text-muted"}`}>{sentiment.brand[0]}</div>
                        )}
                        <span className="text-[13px] font-semibold">{sentiment.brand}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="flex flex-wrap gap-1">
                        {bullets.slice(0, 3).map((bullet, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: '#EFF3F8', color: '#737E8F' }}>
                            • {bullet.slice(0, 60)}{bullet.length > 60 ? '…' : ''}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={getOutlookBadge(sentiment.outlook)}>{sentiment.outlook}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source Authority Map - Heatmap */}
      {sourcesData.length > 0 && (
        <div className="ds-card overflow-hidden mt-4 !p-0">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-ds-blue" />
              <h3 className="text-[14px] font-semibold text-ds-text">Source Authority Map</h3>
            </div>
            <p className="text-[12px] text-ds-text-muted mt-1">Which content channels are driving AI recommendations</p>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border" style={{ background: '#F8FAFC' }}>
                  <th className="table-header text-left py-3 px-4 min-w-[160px]">Source</th>
                  {allBrandNames.map((brand) => {
                    const isPrimaryBrand = brand === brandName;
                    const logo = getBrandLogo(brand);
                    return (
                      <th key={brand} className={`table-header text-center py-3 px-3 min-w-[80px] ${isPrimaryBrand ? "text-ds-blue" : ""}`}
                        style={isPrimaryBrand ? { background: 'rgba(77,166,255,0.08)' } : {}}>
                        <div className="flex flex-col items-center gap-1">
                          {logo && <img src={logo} alt="" className="w-4 h-4 rounded-full object-contain bg-white" />}
                          <span className="truncate text-[10px]" title={brand}>{brand}</span>
                        </div>
                      </th>
                    );
                  })}
                  <th className="table-header text-center py-3 px-3 min-w-[60px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {sourcesData.map((source: any) => {
                  const rowTotal = allBrandNames.reduce((sum, brand) => sum + (source[`${brand}Mentions`] || 0), 0);
                  return (
                    <tr key={source.name} className="border-b border-border">
                      <td className="py-3 px-4 font-medium text-ds-text text-[12px]">{source.name}</td>
                      {allBrandNames.map((brand) => {
                        const mentions = source[`${brand}Mentions`] || 0;
                        const isPrimaryBrand = brand === brandName;
                        const style = getHeatmapStyle(mentions);
                        return (
                          <td key={brand} className="py-2 px-3 text-center" style={isPrimaryBrand ? { background: 'rgba(77,166,255,0.04)' } : {}}>
                            <div className="mx-auto w-10 h-8 rounded flex items-center justify-center text-[14px] font-bold"
                              style={{ background: style.bg, color: style.text }}>
                              {mentions}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-center">
                        <span className="text-[14px] font-bold text-ds-text">{rowTotal}</span>
                      </td>
                    </tr>
                  );
                })}
                {/* Column totals */}
                <tr style={{ background: '#F8FAFC' }}>
                  <td className="py-3 px-4 font-bold text-ds-text text-[12px] uppercase">Total</td>
                  {allBrandNames.map((brand) => {
                    const colTotal = sourcesData.reduce((sum: number, source: any) => sum + (source[`${brand}Mentions`] || 0), 0);
                    const isPrimaryBrand = brand === brandName;
                    return (
                      <td key={brand} className="py-3 px-3 text-center">
                        <span className={`text-[14px] font-bold ${isPrimaryBrand ? 'text-ds-blue' : 'text-ds-text'}`}>{colTotal}</span>
                      </td>
                    );
                  })}
                  <td className="py-3 px-3 text-center">
                    <span className="text-[14px] font-bold text-ds-text">
                      {sourcesData.reduce((sum: number, source: any) => sum + allBrandNames.reduce((s, b) => s + (source[`${b}Mentions`] || 0), 0), 0)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorsComparisonsContent;
