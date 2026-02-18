import { useResults } from "@/results/context/ResultsContext";
import { useEffect, useState, useMemo } from "react";
import {
  getAIVisibilityMetrics,
  getMentionsPosition,
  getBrandMentionResponseRates,
  getSentiment,
  hasAnalyticsData,
  getBrandName,
  getAIVisibilityMetrics as getVisMetrics,
} from "@/results/data/analyticsData";
import { LLMVisibilityTable } from "@/results/overview/LLMVisibilityTable";
import { PlatformPresence } from "@/results/overview/PlatformPresence";
import { CompetitorComparisonChart } from "@/results/overview/CompetitorComparisonChart";
import { BrandMentionsRadar } from "@/results/overview/BrandMentionsRadar";
import BrandInfoBar from "@/results/overview/BrandInfoBar";
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
  Trophy,
  Medal,
  Award,
  BarChart3,
  Eye,
  Lightbulb,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

const OverviewContent = () => {
  const { dataReady, analyticsVersion } = useResults();
  const [animatedBars, setAnimatedBars] = useState(false);
  const navigate = useNavigate();
  const analyticsAvailable = hasAnalyticsData();
  const brandName = getBrandName();

  const visibilityData = useMemo(() => {
    if (!analyticsAvailable) {
      return {
        score: 0,
        tier: "Low",
        brandPosition: 0,
        totalBrands: 0,
        positionBreakdown: { topPosition: 0, midPosition: 0, lowPosition: 0 },
      };
    }
    return getAIVisibilityMetrics();
  }, [analyticsAvailable, analyticsVersion]);

  const mentionsData = useMemo(() => {
    if (!analyticsAvailable) {
      return {
        position: 0, tier: "Low", totalBrands: 0,
        topBrandMentions: 0, brandMentions: 0, allBrandMentions: {},
      };
    }
    return getMentionsPosition();
  }, [analyticsAvailable, analyticsVersion]);

  const brandMentionRates = useMemo(() => {
    if (!analyticsAvailable) return [];
    return getBrandMentionResponseRates();
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
    if (isTestBrand) return <Award className="w-4 h-4 text-primary" />;
    return <Award className="w-4 h-4 text-amber-600" />;
  };

  const visibilityInsight = useMemo(() => {
    const { brandPosition, totalBrands } = visibilityData;
    if (!brandPosition || brandPosition <= 0) return null;
    if (brandPosition === 1) {
      return `Your brand is leading in AI search visibility among ${totalBrands} brands.`;
    }
    return `Your brand ranks ${toOrdinal(brandPosition)} out of ${totalBrands} brands.`;
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
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-6 space-y-6">
      {/* Brand Info Bar */}
      <BrandInfoBar />

      {/* Key Insight Banner */}
      {visibilityInsight && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">KEY INSIGHT</h3>
            <p className="text-sm text-foreground mt-0.5">
              {brandName} ranks #{visibilityData.brandPosition} in AI search visibility — {visibilityData.positionBreakdown.lowPosition > 50
                ? "with clear opportunity in mid-funnel queries"
                : "showing strong presence in AI responses"}
            </p>
            <button
              onClick={() => navigate("/results/recommendations")}
              className="text-xs text-primary font-medium mt-2 hover:underline"
            >
              View recommendations →
            </button>
          </div>
        </div>
      )}

      {/* Main 3-Column Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI Visibility Card */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">AI Visibility</span>
              <Tooltip>
                <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">Weighted score based on visibility frequency across major LLMs.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <TierBadge tier={visibilityData.tier} />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            How AI models see your brand
          </p>

          {/* Score */}
          <div className="text-center py-4 border border-border rounded-lg mb-4 bg-muted/30">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Visibility Score</div>
            <div className="text-4xl font-bold text-foreground">{visibilityData.score}</div>
          </div>

          {/* Position Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-muted-foreground">Top Position (1-3)</span>
              </div>
              <span className="font-semibold text-foreground">{visibilityData.positionBreakdown.topPosition}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-muted-foreground">Mid Position (4-10)</span>
              </div>
              <span className="font-semibold text-foreground">{visibilityData.positionBreakdown.midPosition}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ArrowDown className="w-3.5 h-3.5 text-red-500" />
                <span className="text-muted-foreground">Low Position (10+)</span>
              </div>
              <span className="font-semibold text-foreground">{visibilityData.positionBreakdown.lowPosition}%</span>
            </div>
          </div>

          {visibilityInsight && (
            <p className="text-xs text-muted-foreground border-t border-border pt-3 mt-3">
              {visibilityInsight}
            </p>
          )}
        </div>

        {/* Brand Mentions Card */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">Brand Mentions</span>
            </div>
            <TierBadge tier={mentionsData.tier} />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            % of AI responses mentioning your brand
          </p>

          {/* Brand bars */}
          <div className="space-y-3 py-2">
            {brandMentionRates.map((item, index) => (
              <div key={`brand-mention-${item.brand}-${index}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getMedalIcon(index, item.isTestBrand)}
                    <span className={`text-sm truncate ${item.isTestBrand ? "font-semibold text-primary" : "text-foreground"}`}>
                      {item.brand}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${item.isTestBrand ? "text-primary" : "text-foreground"}`}>
                    {item.responseRate}%
                  </span>
                </div>
                <div
                  className="relative h-2.5 bg-muted rounded-full overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/results/prompts?expandAll=true&viewType=brand`)}
                >
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out ${
                      item.isTestBrand
                        ? "bg-primary"
                        : index === 0 ? "bg-amber-500" : "bg-amber-400/70"
                    }`}
                    style={{
                      width: animatedBars ? `${item.responseRate}%` : "0%",
                      transitionDelay: `${index * 150}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Card */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">Sentiment Analysis</span>
            </div>
            <TierBadge tier={sentiment.dominant_sentiment} />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Qualitative perception summary from AI context
          </p>
          <div className="space-y-3">
            {sentiment.summary ? (
              sentiment.summary
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .map((line) => line.replace(/^-\s*/, ""))
                .map((sentence, index) => (
                  <div
                    key={`sentiment-${index}`}
                    className="p-3 bg-muted/30 rounded-lg border border-border/50"
                  >
                    <p className="text-sm text-foreground italic leading-relaxed">
                      "{sentence}"
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground">No sentiment data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CompetitorComparisonChart />
        <BrandMentionsRadar />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LLMVisibilityTable />
        <PlatformPresence />
      </div>

      {/* Intent-Wise Scoring */}
      <IntentWiseScoring />
    </div>
  );
};

export default OverviewContent;
