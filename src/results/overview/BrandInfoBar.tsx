import { useState, useMemo } from "react";
import {
  getBrandName,
  getBrandWebsite,
  getModelName,
  getAnalysisKeywords,
  getBrandLogo,
  getAnalysisDate,
  getBrandMentionResponseRates,
  getBrandInfoWithLogos,
  getSearchKeywordsWithPrompts,
  getSourcesData,
  getModelDisplayName,
} from "@/results/data/analyticsData";
import { LLMIcon } from "@/results/ui/LLMIcon";
import { ExternalLink } from "lucide-react";

const BrandInfoBar = () => {
  const brandName = getBrandName();
  const brandWebsite = getBrandWebsite();
  const modelName = getModelName();
  const keywords = getAnalysisKeywords();
  const brandLogo = getBrandLogo();
  const analysisDate = getAnalysisDate();
  const brandInfo = getBrandInfoWithLogos();
  const keywordsWithPrompts = getSearchKeywordsWithPrompts();
  const sourcesData = getSourcesData();

  const models = modelName?.split(",").map((m) => m.trim()).filter(Boolean) || [];

  const brandMentionRanking = getBrandMentionResponseRates();
  const brandPosition = brandMentionRanking.findIndex((b) => b.isTestBrand) + 1;

  const isLeader = brandPosition === 1;
  const isAbsent = !brandPosition;

  const totalSources = Object.keys(sourcesData).length;
  const totalPrompts = keywordsWithPrompts.reduce((sum, kw) => sum + (kw.prompts?.length || 0), 0);

  // Format date parts
  const dateParts = useMemo(() => {
    if (!analysisDate) return { date: '', time: '' };
    const parts = analysisDate.split(',');
    if (parts.length >= 2) {
      return { date: parts.slice(0, -1).join(',').trim(), time: parts[parts.length - 1].trim() };
    }
    return { date: analysisDate, time: '' };
  }, [analysisDate]);

  if (!brandName) return null;

  return (
    <div>
      {/* Main card */}
      <div className="ds-card" style={{ borderRadius: '12px 12px 0 0', paddingBottom: '20px' }}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* LEFT */}
          <div className="flex items-start gap-4 min-w-0">
            {/* Favicon */}
            {brandLogo ? (
              <img src={brandLogo} alt={brandName}
                className="w-12 h-12 rounded-[10px] object-contain flex-shrink-0"
                style={{ border: '1px solid #E3EAF2', background: '#FFFFFF', padding: '4px' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
              />
            ) : null}
            {!brandLogo && (
              <div className="w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: '#4DA6FF', color: '#FFFFFF', fontSize: '20px', fontWeight: 700 }}>
                {brandName.charAt(0)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              {/* Row 1: Brand name + link icon + badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[22px] font-bold" style={{ color: '#1E2433' }}>{brandName}</h1>
                {brandWebsite && (
                  <a href={brandWebsite} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" style={{ color: '#737E8F' }} />
                  </a>
                )}
                {isLeader && <span className="ds-badge ds-badge-info">Market Leader</span>}
                {isAbsent && <span className="ds-badge ds-badge-neutral">Absent</span>}
              </div>

              {/* Row 2: Website URL */}
              {brandWebsite && (
                <a href={brandWebsite} target="_blank" rel="noopener noreferrer"
                  className="text-[13px] underline block mt-1" style={{ color: '#4DA6FF' }}>
                  {brandWebsite}
                </a>
              )}

              {/* Row 3: Keyword chips */}
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {keywords.map((kw: string) => (
                    <span key={kw} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ background: '#EFF3F8', color: '#4DA6FF' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="hidden md:flex flex-col items-end gap-1.5 flex-shrink-0">
            {/* Analyzed by */}
            {models.length > 0 && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] uppercase font-semibold tracking-[0.12em]" style={{ color: '#737E8F' }}>Analyzed by</span>
                <div className="flex items-center -space-x-1">
                  {models.map((model) => (
                    <div key={model} className="relative" style={{ zIndex: models.length }}>
                      <LLMIcon platform={model} size="lg" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date */}
            {analysisDate && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[13px] font-semibold" style={{ color: '#1E2433' }}>{dateParts.date}</span>
                {dateParts.time && <span className="text-[12px]" style={{ color: '#737E8F' }}>{dateParts.time}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="flex items-center gap-5 px-6 flex-wrap"
        style={{ background: '#EFF3F8', height: '36px', borderRadius: '0 0 12px 12px' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
          <span className="text-[12px]" style={{ color: '#737E8F' }}>Analysis Complete</span>
        </div>
        <span className="text-[12px]" style={{ color: '#CBD5E1' }}>·</span>
        <span className="text-[12px]" style={{ color: '#737E8F' }}>
          <strong style={{ color: '#1E2433' }}>{totalSources}</strong> sources analyzed
        </span>
        <span className="text-[12px]" style={{ color: '#CBD5E1' }}>·</span>
        <span className="text-[12px]" style={{ color: '#737E8F' }}>
          <strong style={{ color: '#1E2433' }}>{keywords.length}</strong> keywords tracked
        </span>
        <span className="text-[12px]" style={{ color: '#CBD5E1' }}>·</span>
        <span className="text-[12px]" style={{ color: '#737E8F' }}>
          <strong style={{ color: '#1E2433' }}>{brandInfo.length}</strong> competitors
        </span>
        <span className="text-[12px]" style={{ color: '#CBD5E1' }}>·</span>
        <div className="flex items-center gap-1">
          {models[0] && <LLMIcon platform={models[0]} size="sm" />}
          <span className="text-[12px]" style={{ color: '#737E8F' }}>Powered by {models.map(m => getModelDisplayName(m)).join(', ')}</span>
        </div>
      </div>
    </div>
  );
};

export default BrandInfoBar;
