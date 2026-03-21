import { useResults } from "@/results/context/ResultsContext";
import { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  getAIVisibilityMetrics,
  getMentionsPosition,
  getBrandMentionResponseRates,
  getSentiment,
  hasAnalyticsData,
  getPromptsForPositionTier,
  getBrandName,
  getTotalPromptCount,
  getKeywordSetId,
} from "@/results/data/analyticsData";
import { LLMVisibilityTable } from "@/results/overview/LLMVisibilityTable";
import { SourceIntelligence } from "@/results/overview/SourceIntelligence";
import { CompetitorComparisonChart } from "@/results/overview/CompetitorComparisonChart";
import { BrandMentionsRadar } from "@/results/overview/BrandMentionsRadar";
import BrandInfoBar from "@/results/overview/BrandInfoBar";
import { LLMIcon } from "@/results/ui/LLMIcon";
import { IntentWiseScoring } from "@/results/overview/IntentWiseScoring";
import { TierBadge } from "@/results/ui/TierBadge";
import { toOrdinal } from "@/results/data/formulas";
import {
  Info,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Search,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  Trophy,
  Medal,
  Award,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

// Parse summary string with ● delimiters into individual points
const parseSummaryToPoints = (summary: string): string[] => {
  if (!summary) return [];
  return summary
    .replace(/\n+/g, " ")
    .split(/\s+[•●]\s+|\s-\s(?=[A-Z])/g)
    .map((s) => s.trim())
    .filter(Boolean);
};

// Resolve incoming LLM key → display name + chip style
const resolveLLMChip = (llm: string): { displayName: string; chipStyle: string } => {
  const k = llm.toLowerCase();

  if (k.includes("google-ai-overview") || k.includes("google_ai_overview") || k.includes("google ai overview")) {
    return {
      displayName: "Google AI Overview",
      chipStyle: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    };
  }
  if (k.includes("google-ai-mode") || k.includes("google_ai_mode") || k.includes("google ai mode")) {
    return {
      displayName: "Google AI Mode",
      chipStyle: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    };
  }
  if (k.includes("gemini")) {
    return {
      displayName: "Gemini",
      chipStyle: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    };
  }
  if (k.includes("chatgpt") || k.includes("openai")) {
    return {
      displayName: "ChatGPT",
      chipStyle: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    };
  }
  if (k.includes("perplexity")) {
    return {
      displayName: "Perplexity",
      chipStyle: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    };
  }
  if (k.includes("claude")) {
    return {
      displayName: "Claude",
      chipStyle: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    };
  }
  if (k.includes("grok")) {
    return {
      displayName: "Grok",
      chipStyle: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
  }
  return { displayName: llm, chipStyle: "bg-muted text-muted-foreground" };
};

const OverviewContent = () => {
  const { dataReady, analyticsVersion } = useResults();
  const [animatedBars, setAnimatedBars] = useState(false);
  const navigate = useNavigate();

  // Position tier accordion state
  const [openTier, setOpenTier] = useState<'top' | 'mid' | 'low' | null>(null);
  const [expandedTierFull, setExpandedTierFull] = useState<'top' | 'mid' | 'low' | null>(null);

  const analyticsAvailable = hasAnalyticsData();

  const visibilityData = useMemo(() => {
    if (!analyticsAvailable) {
      return {
        score: 0,
        tier: "Low",
        brandPosition: 0,
        totalBrands: 0,
        positionBreakdown: {
          topPosition: 0,
          midPosition: 0,
          lowPosition: 0,
        },
      };
    }
    return getAIVisibilityMetrics();
  }, [analyticsAvailable, analyticsVersion]);

  const tierPrompts = useMemo(() => {
    if (!analyticsAvailable) return { top: [], mid: [], low: [] };
    const brandName = getBrandName();

    const computeGrouped = (tier: 'top' | 'mid' | 'low') => {
      const raw = getPromptsForPositionTier(tier, brandName);

      const seen = new Map<string, Record<string, number>>();
      for (const p of raw) {
        if (seen.has(p.query)) {
          Object.assign(seen.get(p.query)!, p.llmRanks);
        } else {
          seen.set(p.query, { ...p.llmRanks });
        }
      }
      return Array.from(seen.entries()).map(([query, llmRanks]) => ({ query, llmRanks }));
    };

    return { top: computeGrouped('top'), mid: computeGrouped('mid'), low: computeGrouped('low') };
  }, [analyticsAvailable, analyticsVersion]);

  const mentionsData = useMemo(() => {
    if (!analyticsAvailable) {
      return {
        position: 0,
        tier: "Low",
        totalBrands: 0,
        topBrandMentions: 0,
        brandMentions: 0,
        allBrandMentions: {},
      };
    }
    return getMentionsPosition();
  }, [analyticsAvailable, analyticsVersion]);

  const brandMentionRates = useMemo(() => {
    if (!analyticsAvailable) return [];
    const rates = getBrandMentionResponseRates();
    const allBrandMentions = (getMentionsPosition().allBrandMentions ||
      {}) as Record<string, number>;

    return [...rates].sort((a, b) => {
      if (b.responseRate !== a.responseRate)
        return b.responseRate - a.responseRate;
      const aScore = allBrandMentions[a.brand] ?? 0;
      const bScore = allBrandMentions[b.brand] ?? 0;
      if (bScore !== aScore) return bScore - aScore;
      if (a.isTestBrand && !b.isTestBrand) return 1;
      if (!a.isTestBrand && b.isTestBrand) return -1;
      return 0;
    });
  }, [analyticsAvailable, analyticsVersion]);

  const sentiment = useMemo(() => {
    if (!analyticsAvailable) {
      return { dominant_sentiment: "N/A", summary: "" };
    }
    return getSentiment();
  }, [analyticsAvailable, analyticsVersion]);

  useEffect(() => {
    if (dataReady && analyticsAvailable) {
      const timer = setTimeout(() => setAnimatedBars(true), 100);
      return () => clearTimeout(timer);
    }
  }, [dataReady, analyticsAvailable]);

  const getMedalIcon = (index: number, isTestBrand: boolean) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Medal className="w-4 h-4 text-gray-400" />;
    if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />;
    return <Award className="w-4 h-4 text-muted-foreground" />;
  };

  const mentionsInsight = useMemo(() => {
    const { position, totalBrands } = mentionsData;
    if (!position || position <= 0) return null;
    if (position === 1) {
      return `Your brand is leading in brand mention score among ${totalBrands} brands.`;
    }
    return `Your brand ranked at ${toOrdinal(position)} position out of ${totalBrands} brands.`;
  }, [mentionsData]);

  const visibilityInsight = useMemo(() => {
    const { brandPosition, totalBrands } = visibilityData;
    if (!brandPosition || brandPosition <= 0 || totalBrands <= 0) return null;
    if (brandPosition === totalBrands) {
      return `Your brand has the lowest AI Visibility score among the ${totalBrands} brands compared.`;
    }
    const pct = Math.round(((totalBrands - brandPosition) / totalBrands) * 100);
    return `Your visibility score is higher than ${pct}% of brands tested for these queries.`;
  }, [visibilityData]);

  if (!dataReady || !analyticsAvailable) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Analysis Started</h2>
            <p className="text-muted-foreground">
              We are preparing your brand's comprehensive analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-6">
      {/* Brand Info Bar - Only on Overview page */}
      <BrandInfoBar />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Overall Insights
          </h1>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Comprehensive overview of your brand's AI performance.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* AI Visibility Card */}
          <div className="bg-card rounded-xl border p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">
                    AI Visibility
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        Measures how prominently your brand appears in
                        AI-generated responses. This score is calculated based
                        on your selected prompts/queries and ranked against
                        competitors.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <TierBadge tier={visibilityData.tier} />
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] gap-3 text-xs text-muted-foreground mb-3 pb-2 border-b border-border">
              <span>
                A weighted score based on where and how often your brand appears
                in AI responses across multiple LLMs
              </span>
            </div>

            <div className="border-2 border-border rounded-lg p-3 mb-4">
              <div className="text-center">
                <span className="text-xl text-muted-foreground">
                  AI Visibility Score:{" "}
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {visibilityData.score}
                </span>
              </div>
            </div>

            {/* Position Breakdown — Accordion */}
            <div className="space-y-1">
              {(
                [
                  {
                    tier: 'top' as const,
                    label: 'Top Position (Tier 1)',
                    icon: <ArrowUp className="w-4 h-4 text-emerald-500" />,
                    tooltip: 'Prompts where your brand was ranked as Tier 1 (t1) by an AI model.',
                    badgeColor: (c: number) => c > 0
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground',
                  },
                  {
                    tier: 'mid' as const,
                    label: 'Mid Position (Tier 2)',
                    icon: <ArrowRight className="w-4 h-4 text-amber-500" />,
                    tooltip: 'Prompts where your brand was ranked as Tier 2 (t2) by an AI model.',
                    badgeColor: (c: number) => c > 0
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-muted text-muted-foreground',
                  },
                  {
                    tier: 'low' as const,
                    label: 'Low Position (Tier 3)',
                    icon: <ArrowDown className="w-4 h-4 text-red-500" />,
                    tooltip: 'Prompts where your brand was ranked as Tier 3 (t3) by an AI model.',
                    badgeColor: (_c: number) => 'bg-muted text-muted-foreground',
                  },
                ] as const
              ).map(({ tier, label, icon, tooltip, badgeColor }) => {
                const count = tierPrompts[tier].length;
                const tierPct =
                  tier === "top"
                    ? visibilityData.positionBreakdown.topPosition
                    : tier === "mid"
                    ? visibilityData.positionBreakdown.midPosition
                    : visibilityData.positionBreakdown.lowPosition;
                const pct = Number.isFinite(tierPct) ? tierPct : 0;
                const pctDisplay = pct.toFixed(1).replace(/\.0$/, "");
                const isOpen = openTier === tier;
                const PREVIEW = 3;
                const isFullyExpanded = expandedTierFull === tier;
                const visiblePrompts = isFullyExpanded
                  ? tierPrompts[tier]
                  : tierPrompts[tier].slice(0, PREVIEW);
                const hasMore = count > PREVIEW;

                return (
                  <div key={tier} className="rounded-md border border-transparent hover:border-border/50 transition-colors">
                    <div
                      className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 -mx-2 transition-colors"
                      onClick={() => {
                        setOpenTier(prev => prev === tier ? null : tier);
                        setExpandedTierFull(null);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {icon}
                        <span className="text-foreground">{label}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-muted-foreground cursor-help" onClick={(e) => e.stopPropagation()} />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="text-sm">{tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${badgeColor(count)}`}>
                          {count} prompt{count !== 1 ? 's' : ''}
                        </span>
                        <span className="font-semibold text-foreground w-10 text-right">{pctDisplay}%</span>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Expanded prompt list */}
                    {isOpen && (
                      <div className="mt-2 mb-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                        {count === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">No prompts found for this tier.</p>
                        ) : (
                          <>
                            {visiblePrompts.map((p, i) => {
                              const llmEntries = Object.entries(p.llmRanks);
                              return (
                                <div key={i} className="bg-muted/60 rounded-lg border border-border p-3 flex flex-col gap-2">
                                  <div className="flex items-start gap-2">
                                    <span className="mt-0.5 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                    <p className="text-xs text-foreground leading-relaxed">{p.query}</p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1 pl-4">
                                    {llmEntries.map(([llm]) => {
                                      const { displayName, chipStyle } = resolveLLMChip(llm);
                                      return (
                                        <span key={llm} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${chipStyle}`}>
                                          {displayName}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                            {hasMore && !isFullyExpanded && (
                              <button
                                className="text-xs text-primary underline hover:opacity-80 transition-opacity"
                                onClick={() => setExpandedTierFull(tier)}
                              >
                                Show all {count} prompts ↓
                              </button>
                            )}
                            {isFullyExpanded && hasMore && (
                              <button
                                className="text-xs text-muted-foreground underline hover:opacity-80 transition-opacity"
                                onClick={() => setExpandedTierFull(null)}
                              >
                                Show less ↑
                              </button>
                            )}
                            <button
                              className="text-xs text-muted-foreground hover:text-primary transition-colors block pt-1"
                              onClick={() => navigate('/results/prompts')}
                            >
                              View All Prompts →
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {visibilityData.brandPosition > 0 && visibilityInsight && (
              <p className="text-sm text-foreground font-medium border-t pt-3 mt-4">
                {visibilityInsight}
              </p>
            )}
          </div>

          {/* Brand Mention Score Card */}
          <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                </div>
                <span className="font-semibold text-foreground">
                  Brand Mentions
                </span>
              </div>
              <TierBadge tier={mentionsData.tier} />
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] gap-3 text-xs text-muted-foreground mb-3 pb-2 border-b border-border">
              <span>% of AI responses where your brand is mentioned</span>
            </div>

            <div className="space-y-3 py-2">
              {brandMentionRates.map((item, index) => {
                return (
                  <div
                    key={`brand-mention-${item.brand}-${index}`}
                    className="grid grid-cols-[auto_1fr_auto] gap-3 items-center"
                  >
                    <div className="flex items-center gap-2 min-w-[100px]">
                      {getMedalIcon(index, item.isTestBrand)}
                      <span
                        className={`text-sm truncate ${
                          item.isTestBrand
                            ? "font-semibold text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {item.brand}
                      </span>
                    </div>

                    <div
                      className="relative h-6 bg-muted rounded overflow-hidden cursor-pointer"
                      onClick={() => {
                        navigate(`/results/prompts?expandAll=true&viewType=brand`);
                      }}
                    >
                      <div
                        className={`absolute left-0 top-0 h-full rounded transition-all duration-700 ease-out ${
                          item.isTestBrand
                            ? "bg-gradient-to-r from-primary/80 to-primary"
                            : index === 0
                            ? "bg-gradient-to-r from-amber-500 to-amber-400"
                            : "bg-gradient-to-r from-amber-600/80 to-amber-500/80"
                        }`}
                        style={{
                          width: animatedBars ? `${item.responseRate}%` : "0%",
                          transitionDelay: `${index * 150}ms`,
                        }}
                      />
                    </div>

                    <span
                      className={`text-sm font-medium min-w-[50px] text-right ${
                        item.isTestBrand ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {item.responseRate}%
                    </span>
                  </div>
                );
              })}
            </div>

            {mentionsData.position > 0 && mentionsInsight && (
              <p className="text-sm text-foreground font-medium border-t pt-3 mt-4">
                {mentionsInsight}
              </p>
            )}
          </div>

          {/* Sentiment Card */}
          <div className="bg-card rounded-xl border p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <ThumbsUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                </div>
                <span className="font-semibold text-foreground">Sentiment</span>
              </div>
              <TierBadge tier={sentiment.dominant_sentiment} />
            </div>
            <div className="grid grid-cols-[auto_1fr_auto] gap-3 text-xs text-muted-foreground mb-3 pb-2 border-b border-border">
              <span>How AI models perceives your brand</span>
            </div>
            <div className="py-2">
              <div className="space-y-2 pl-2 text-sm text-foreground leading-relaxed">
                {sentiment.summary ? (
                  parseSummaryToPoints(sentiment.summary).map((point, index) => (
                    <p key={`sentiment-${index}`} className="flex items-start gap-2">
                      <span className="text-foreground">●</span>
                      <span>{point}</span>
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground">No sentiment data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <CompetitorComparisonChart />
          <BrandMentionsRadar />
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <LLMVisibilityTable />
          <SourceIntelligence />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <IntentWiseScoring />
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;