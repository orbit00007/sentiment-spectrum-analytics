import { useState } from "react";
import {
  getBrandName,
  getBrandWebsite,
  getModelName,
  getAnalysisKeywords,
  getBrandLogo,
  getAnalysisDate,
  getBrandMentionResponseRates,
} from "@/results/data/analyticsData";

import { LLMIcon } from "@/results/ui/LLMIcon";
import { Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BrandInfoBar = () => {
  const brandName = getBrandName();
  const brandWebsite = getBrandWebsite();
  const modelName = getModelName();
  const keywords = getAnalysisKeywords();
  const brandLogo = getBrandLogo();
  const analysisDate = getAnalysisDate();
  const [showTooltip, setShowTooltip] = useState(false);

  const models =
    modelName
      ?.split(",")
      .map((m) => m.trim())
      .filter(Boolean) || [];

  if (!brandName) return null;

  const brandMentionRanking = getBrandMentionResponseRates();
  const brandPosition =
    brandMentionRanking.findIndex((b) => b.isTestBrand) + 1;

  let badgeLabel = "";
  let badgeClass = "";

  if (!brandPosition) {
    badgeLabel = "Absent";
    badgeClass = "bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEF2F2]";
  } else if (brandPosition === 1) {
    badgeLabel = "Market Leader";
    badgeClass = "bg-[#10B981] text-white hover:bg-[#10B981]";
  } else if (brandPosition >= 2 && brandPosition <= 4) {
    badgeLabel = "Strong";
    badgeClass = "bg-[#F59E0B] text-white hover:bg-[#F59E0B]";
  } else {
    badgeLabel = "Emerging";
    badgeClass = "";
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EEF1F5] px-6 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-8">

        {/* LEFT SIDE */}
        <div className="min-w-0">

          {/* Top label row */}
          <div className="flex items-center gap-2 mb-1.5">
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={brandName}
                className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-xl object-contain bg-[#F9FAFB] border border-[#E5E7EB] p-1.5 flex-shrink-0"
              />
            ) : (
              <div className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-xl bg-[#EFF6FF] flex items-center justify-center border border-[#DBEAFE] flex-shrink-0">
                <span className="text-[18px] font-bold text-[#3B82F6]">
                  {brandName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                AI Visibility Analysis
              </span>
            </div>
          </div>

          {/* Brand name — clickable, with hover tooltip showing website URL */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative inline-block">
              {brandWebsite ? (
                <a
                  href={brandWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="group inline-flex items-end gap-2"
                >
                  <h1 className="text-[48px] leading-[1.02] font-semibold tracking-[-0.02em] text-[#1F2937] group-hover:text-[#3B82F6] transition-colors duration-150 cursor-pointer">
                    {brandName}
                  </h1>
                  <ExternalLink className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#3B82F6] transition-colors mb-3 flex-shrink-0" />
                </a>
              ) : (
                <h1 className="text-[48px] leading-[1.02] font-semibold tracking-[-0.02em] text-[#1F2937]">
                  {brandName}
                </h1>
              )}

              {/* Hover tooltip — website URL preview */}
              {showTooltip && brandWebsite && (
                <div className="absolute left-0 top-full mt-1.5 z-50 pointer-events-none">
                  <div className="flex items-center gap-2 bg-[#1F2937] text-white text-[12px] px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                    <div className="w-4 h-4 rounded-sm bg-white/10 flex items-center justify-center flex-shrink-0">
                      <ExternalLink className="w-2.5 h-2.5" />
                    </div>
                    <span className="font-medium">{brandWebsite}</span>
                    <span className="text-white/40 text-[10px]">↗</span>
                  </div>
                  {/* Arrow */}
                  <div className="absolute left-4 -top-1 w-2 h-2 bg-[#1F2937] rotate-45 rounded-sm" />
                </div>
              )}
            </div>

            <Badge
              className={`${badgeClass} text-[13px] px-3 py-1 font-semibold rounded-md translate-y-[-4px]`}
            >
              {badgeLabel}
            </Badge>
          </div>

          {/* Keywords — small rounded pill badges */}
          {keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {keywords.map((keyword: string) => (
                <Badge
                  key={keyword}
                  className="inline-flex items-center h-6 px-2.5 rounded-full text-[12px] border border-[#DBEAFE]"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE — date on top, analyzed by + icons below */}
        <div className="hidden md:flex flex-col items-end gap-4 flex-shrink-0 pt-1">

          {analysisDate && (
            <div className="flex items-center gap-1.5 text-[14px] text-[#6B7280]">
              <Calendar className="w-4 h-4" />
              <span>Analyzed on {analysisDate}</span>
            </div>
          )}

          {models.length > 0 && (
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[11px] text-[#9CA3AF] uppercase tracking-[0.15em] font-medium">
                Analyzed by
              </span>
              <div className="flex items-center gap-2">
                {models.map((model) => (
                  <LLMIcon key={model} platform={model} size="lg" />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BrandInfoBar;