import {
  getAnalytics, getCompetitorData, getCompetitorSentiment, getBrandName, getKeywords, getBrandLogo, getBrandInfoWithLogos, getSourcesData,
} from "@/results/data/analyticsData";
import { TierBadge } from "@/results/ui/TierBadge";
import { useState, useMemo } from "react";
import { Trophy, BarChart3, MessageCircle, Layers } from "lucide-react";

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mt-8 mb-4">
    <div className="ds-section-title"><h2>{title}</h2></div>
    <p className="ds-section-subtitle">{subtitle}</p>
  </div>
);

const CompetitorsComparisonsContent = () => {
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
    const idx = sorted.findIndex((c) => c.name === brandName);
    if (idx !== -1) { const brand = sorted.splice(idx, 1)[0]; sorted.push(brand); }
    return sorted;
  }, [competitorData, brandName]);

  const sortedCompetitorSentiment = useMemo(() => {
    const sorted = [...competitorSentiment];
    const idx = sorted.findIndex((s) => s.brand === brandName);
    if (idx !== -1) { const brand = sorted.splice(idx, 1)[0]; sorted.push(brand); }
    return sorted;
  }, [competitorSentiment, brandName]);

  const allBrandNames = useMemo(() => {
    const brands = competitorData.map((c) => c.name);
    const idx = brands.findIndex((b) => b === brandName);
    if (idx !== -1) { const brand = brands.splice(idx, 1)[0]; brands.push(brand); }
    return brands;
  }, [competitorData, brandName]);

  const sourcesData = useMemo(() => {
    if (!sourcesDataRaw || typeof sourcesDataRaw !== 'object') return [];
    return Object.entries(sourcesDataRaw).map(([sourceName, sourceData]: [string, any]) => {
      const row: any = { name: sourceName };
      if (sourceData?.mentions) {
        allBrandNames.forEach(brand => { row[`${brand}Mentions`] = sourceData.mentions[brand]?.count || 0; });
      } else {
        allBrandNames.forEach(brand => { row[`${brand}Mentions`] = 0; });
      }
      return row;
    });
  }, [sourcesDataRaw, allBrandNames]);

  const getHeatmapStyle = (value: number) => {
    if (value === 0) return { bg: '#F8FAFC', text: '#CBD5E1' };
    if (value === 1) return { bg: '#DBEAFE', text: '#3B82F6' };
    if (value === 2) return { bg: '#93C5FD', text: '#1E40AF' };
    return { bg: '#4DA6FF', text: '#FFFFFF' };
  };

  const parseSentiment = (summary: string) => {
    if (!summary) return [];
    return summary.split(/[●•\-]|\n/).map(s => s.trim()).filter(s => s.length > 0);
  };

  const getOutlookBadge = (outlook: string) => {
    if (outlook === "Positive") return "ds-badge ds-badge-positive";
    if (outlook === "Negative") return "ds-badge ds-badge-danger";
    if (outlook === "Neutral") return "ds-badge ds-badge-warning";
    return "ds-badge ds-badge-neutral";
  };

  const maxTotal = useMemo(() => Math.max(...sortedCompetitorData.map(c => c.keywordScores.reduce((s, v) => s + (Number(v) || 0), 0)), 1), [sortedCompetitorData]);

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-6">
      {/* Header */}
      <div className="ds-card">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <h1 className="text-[32px] font-bold" style={{ color: '#1E2433' }}>Competitor Analysis</h1>
            <p className="text-[13px] leading-relaxed mt-2 max-w-2xl" style={{ color: '#737E8F' }}>See who's winning the AI visibility race in your industry</p>
          </div>
          <div className="hidden md:flex items-center gap-8 flex-shrink-0 pt-2">
            <div className="text-center">
              <div className="text-[32px] font-bold leading-none" style={{ color: '#1E2433', fontVariantNumeric: 'tabular-nums' }}>{competitorData.length}</div>
              <div className="text-[11px] uppercase tracking-[0.15em] font-medium mt-1" style={{ color: '#737E8F' }}>Brands</div>
            </div>
            <div className="text-center">
              <div className="text-[32px] font-bold leading-none" style={{ color: '#1E2433', fontVariantNumeric: 'tabular-nums' }}>{keywords.length}</div>
              <div className="text-[11px] uppercase tracking-[0.15em] font-medium mt-1" style={{ color: '#737E8F' }}>Keywords</div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyword Performance Matrix */}
      <SectionHeader title="Keyword Performance Matrix" subtitle="Who wins each keyword battle in AI responses" />
      <div className="ds-card overflow-hidden mt-4" style={{ padding: 0 }}>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E3EAF2' }}>
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
                const isPrimary = c.name === brandName;
                const total = c.keywordScores.reduce((sum, score) => sum + (Number(score) || 0), 0);
                return (
                  <tr key={c.name} className="transition-colors"
                    style={{
                      borderBottom: '1px solid #E3EAF2',
                      ...(isPrimary ? { background: '#EFF6FF', borderLeft: '3px solid #4DA6FF' } : {}),
                    }}
                    onMouseEnter={(e) => { if (!isPrimary) e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={(e) => { if (!isPrimary) e.currentTarget.style.background = ''; }}>
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        {c.logo ? (
                          <img src={c.logo} alt={c.name} className="w-5 h-5 rounded-full object-contain bg-white" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        ) : (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={isPrimary ? { background: '#4DA6FF', color: '#FFFFFF' } : { background: '#EFF3F8', color: '#737E8F' }}>{c.name[0]}</div>
                        )}
                        <span className="text-[13px] font-semibold" style={{ color: '#1E2433' }}>{c.name}</span>
                      </div>
                    </td>
                    {c.keywordScores.map((score, idx) => (
                      <td key={idx} className="py-3 px-4 text-center text-[14px] font-semibold" style={{ color: '#1E2433' }}>{score}</td>
                    ))}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="px-3 py-1 rounded-full font-semibold text-[13px]"
                          style={{ background: isPrimary ? '#4DA6FF' : '#EFF3F8', color: isPrimary ? '#FFFFFF' : '#737E8F' }}>{total}</span>
                        <div className="w-16 h-1 rounded-full" style={{ background: '#EFF3F8' }}>
                          <div className="h-full rounded-full" style={{ width: `${(total / maxTotal) * 100}%`, background: isPrimary ? '#4DA6FF' : '#CBD5E1' }} />
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
      <SectionHeader title="AI Brand Perception" subtitle="What AI is saying about you and your competitors" />
      <div className="ds-card overflow-hidden mt-4" style={{ padding: 0 }}>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E3EAF2' }}>
                <th className="table-header text-left py-3 px-4">Brand</th>
                <th className="table-header text-left py-3 px-4">Sentiment Summary</th>
                <th className="table-header text-center py-3 px-4">Overall Outlook</th>
              </tr>
            </thead>
            <tbody>
              {sortedCompetitorSentiment.map((sentiment) => {
                const isPrimary = sentiment.brand === brandName;
                const bullets = parseSentiment(sentiment.summary);
                return (
                  <tr key={sentiment.brand} className="transition-colors"
                    style={{ borderBottom: '1px solid #E3EAF2', ...(isPrimary ? { background: '#EFF6FF' } : {}) }}
                    onMouseEnter={(e) => { if (!isPrimary) e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={(e) => { if (!isPrimary) e.currentTarget.style.background = ''; }}>
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        {sentiment.logo ? (
                          <img src={sentiment.logo} alt={sentiment.brand} className="w-5 h-5 rounded-full object-contain bg-white" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        ) : (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={isPrimary ? { background: '#4DA6FF', color: '#FFFFFF' } : { background: '#EFF3F8', color: '#737E8F' }}>{sentiment.brand[0]}</div>
                        )}
                        <span className="text-[13px] font-semibold" style={{ color: '#1E2433' }}>{sentiment.brand}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="flex flex-wrap gap-1">
                        {bullets.slice(0, 3).map((bullet, i) => (
                          <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
                            style={{ background: '#EFF3F8', color: '#737E8F' }}>
                            {bullet.slice(0, 60)}{bullet.length > 60 ? '…' : ''}
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
        <>
          <SectionHeader title="Source Authority Map" subtitle="Which content channels are driving AI recommendations" />
          <div className="ds-card overflow-hidden mt-4" style={{ padding: 0 }}>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E3EAF2' }}>
                    <th className="table-header text-left py-3 px-4 min-w-[160px]" style={{ color: '#1E2433', fontWeight: 600, fontSize: '13px' }}>Source</th>
                    {allBrandNames.map((brand) => {
                      const isPrimary = brand === brandName;
                      const logo = getBrandLogo(brand);
                      return (
                        <th key={brand} className="table-header text-center py-3 px-3 min-w-[80px]"
                          style={isPrimary ? { background: 'rgba(77,166,255,0.08)' } : {}}>
                          <div className="flex flex-col items-center gap-1">
                            {logo && <img src={logo} alt="" className="w-4 h-4 rounded-full object-contain bg-white" />}
                            <span className="truncate text-[10px]" style={{ color: isPrimary ? '#4DA6FF' : '#737E8F' }} title={brand}>{brand}</span>
                          </div>
                        </th>
                      );
                    })}
                    <th className="table-header text-center py-3 px-3 min-w-[60px]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sourcesData.map((source: any, rowIdx: number) => {
                    const rowTotal = allBrandNames.reduce((sum, brand) => sum + (source[`${brand}Mentions`] || 0), 0);
                    return (
                      <tr key={source.name} style={{ borderBottom: '1px solid #E3EAF2' }}>
                        <td className="py-3 px-4 font-semibold text-[13px]" style={{ color: '#1E2433' }}>{source.name}</td>
                        {allBrandNames.map((brand) => {
                          const mentions = source[`${brand}Mentions`] || 0;
                          const isPrimary = brand === brandName;
                          const style = getHeatmapStyle(mentions);
                          return (
                            <td key={brand} className="py-2 px-3 text-center" style={isPrimary ? { background: 'rgba(77,166,255,0.04)' } : {}}>
                              <div className="mx-auto rounded flex items-center justify-center text-[14px] font-bold transition-all hover:outline hover:outline-2"
                                style={{ width: '48px', height: '44px', background: style.bg, color: style.text, outlineColor: '#4DA6FF', outlineOffset: '-2px' }}>
                                {mentions}
                              </div>
                            </td>
                          );
                        })}
                        <td className="py-2 px-3 text-center" style={{ background: '#F4F6F9' }}>
                          <span className="text-[14px] font-bold" style={{ color: '#1E2433' }}>{rowTotal}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Column totals */}
                  <tr style={{ background: '#F4F6F9', borderTop: '1px solid #E3EAF2' }}>
                    <td className="py-3 px-4 font-bold text-[12px] uppercase" style={{ color: '#1E2433' }}>Total</td>
                    {allBrandNames.map((brand) => {
                      const colTotal = sourcesData.reduce((sum: number, source: any) => sum + (source[`${brand}Mentions`] || 0), 0);
                      const isPrimary = brand === brandName;
                      return (
                        <td key={brand} className="py-3 px-3 text-center">
                          <span className="text-[14px] font-bold" style={{ color: isPrimary ? '#4DA6FF' : '#1E2433' }}>{colTotal}</span>
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-center">
                      <span className="text-[14px] font-bold" style={{ color: '#1E2433' }}>
                        {sourcesData.reduce((sum: number, source: any) => sum + allBrandNames.reduce((s, b) => s + (source[`${b}Mentions`] || 0), 0), 0)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompetitorsComparisonsContent;
