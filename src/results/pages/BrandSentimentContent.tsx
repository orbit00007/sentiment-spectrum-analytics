import { TierBadge } from "@/results/ui/TierBadge";
import { getCompetitorSentiment, getBrandName, getSentiment, getBrandLogo } from "@/results/data/analyticsData";
import { ThumbsUp } from "lucide-react";
import { useMemo } from "react";
import ReactMarkdown from 'react-markdown';

const BrandSentimentContent = () => {
  const brandName = getBrandName();
  const sentiment = getSentiment();
  const brandLogo = getBrandLogo();
  const competitorSentiment = getCompetitorSentiment();

  const outlookOrder = { 'Positive': 0, 'Neutral': 1, 'Negative': 2 };
  const sortedSentiment = useMemo(() => {
    return [...competitorSentiment].sort((a, b) =>
      (outlookOrder[a.outlook as keyof typeof outlookOrder] || 2) - (outlookOrder[b.outlook as keyof typeof outlookOrder] || 2)
    );
  }, [competitorSentiment]);

  const getOutlookBadge = (outlook: string) => {
    if (outlook === "Positive") return "ds-badge ds-badge-positive";
    if (outlook === "Negative") return "ds-badge ds-badge-danger";
    if (outlook === "Neutral") return "ds-badge ds-badge-warning";
    return "ds-badge ds-badge-neutral";
  };

  return (
    <div className="w-full mx-auto px-5 md:px-10 py-6">
      {/* Header */}
      <div className="ds-card !rounded-2xl !px-6 !py-5">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                <ThumbsUp className="w-4 h-4 text-ds-success" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ds-text-muted">Perception Analysis</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[32px] md:text-[48px] leading-[1.02] font-semibold tracking-[-0.02em] text-ds-text">Brand Sentiment</h1>
              <TierBadge tier={sentiment.dominant_sentiment} className="text-[13px] px-3 py-1 font-semibold rounded-md translate-y-[-4px]" />
            </div>
            <p className="text-[13px] text-ds-text-muted leading-relaxed mt-2 max-w-2xl">Comprehensive sentiment analysis across the competitive landscape</p>
          </div>
        </div>
      </div>

      {/* Primary Brand Sentiment */}
      <div className="ds-card mt-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="w-12 h-12 rounded-full object-contain bg-white shadow-md" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: '#4DA6FF' }}>{brandName[0]}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-[14px] font-semibold text-ds-text">{brandName} Sentiment Overview</h3>
              <TierBadge tier={sentiment.dominant_sentiment} />
            </div>
            <div className="text-ds-text-muted text-[13px] leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-ds-text">
              <ReactMarkdown>{sentiment.summary}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {['Positive', 'Neutral', 'Negative'].map(sentimentType => {
          const matchingBrands = competitorSentiment.filter(c => c.outlook === sentimentType);
          const count = matchingBrands.length;
          const colors: Record<string, { bg: string; border: string }> = {
            'Positive': { bg: '#F0FDF4', border: '#BBF7D0' },
            'Neutral': { bg: '#F8FAFC', border: '#E3EAF2' },
            'Negative': { bg: '#FEF2F2', border: '#FECACA' },
          };
          const c = colors[sentimentType];
          return (
            <div key={sentimentType} className="ds-card" style={{ background: c.bg, borderColor: c.border }}>
              <div className="flex items-center justify-between mb-4">
                <TierBadge tier={sentimentType} />
                <span className="text-[32px] font-bold text-ds-text leading-none">{count}</span>
              </div>
              <p className="text-[12px] text-ds-text-muted mb-3">Brands with {sentimentType.toLowerCase()} outlook</p>
              <div className="flex flex-wrap gap-2">
                {matchingBrands.map(item => (
                  <div key={item.brand} className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full bg-card border ${item.brand === brandName ? 'border-ds-blue text-ds-blue' : 'border-border text-ds-text'}`}>
                    {item.logo && <img src={item.logo} alt={item.brand} className="w-4 h-4 rounded-full object-contain bg-white" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                    <span className="font-medium">{item.brand}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Brands Table */}
      <div className="ds-card overflow-hidden mt-4 !p-0">
        <div className="p-6 border-b border-border">
          <h3 className="text-[14px] font-semibold text-ds-text">Competitor Sentiment Analysis</h3>
          <p className="text-[12px] text-ds-text-muted mt-1">Detailed breakdown by brand (sorted by outlook)</p>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th className="table-header text-left py-3 px-4">Brand</th>
                <th className="table-header text-left py-3 px-4 hidden md:table-cell">Sentiment Summary</th>
                <th className="table-header text-center py-3 px-4">Outlook</th>
              </tr>
            </thead>
            <tbody>
              {sortedSentiment.map((item, index) => {
                const isPrimaryBrand = item.brand === brandName;
                return (
                  <tr key={index} className={`border-b border-border transition-colors ${isPrimaryBrand ? '' : 'hover:bg-muted/30'}`}
                    style={isPrimaryBrand ? { background: '#EFF6FF' } : {}}>
                    <td className={`py-3 px-4 font-medium ${isPrimaryBrand ? 'text-ds-blue' : 'text-ds-text'}`}>
                      <div className="flex items-center gap-3">
                        {item.logo ? (
                          <img src={item.logo} alt={item.brand} className="w-6 h-6 rounded-full object-contain bg-white shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isPrimaryBrand ? 'bg-ds-blue text-white' : 'bg-muted text-ds-text-muted'}`}>{item.brand[0]}</div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-[13px]">{item.brand}</span>
                          <span className="text-[11px] text-ds-text-muted md:hidden line-clamp-1">{item.summary.slice(0, 50)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-ds-text-muted max-w-md hidden md:table-cell">
                      <div className="prose prose-xs max-w-none text-ds-text-muted prose-p:my-0.5 prose-ul:my-0.5 prose-li:my-0 prose-strong:text-ds-text line-clamp-3">
                        <ReactMarkdown>{item.summary}</ReactMarkdown>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <span className={getOutlookBadge(item.outlook)}>{item.outlook}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BrandSentimentContent;
