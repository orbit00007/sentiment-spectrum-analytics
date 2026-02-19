import { useResults } from "@/results/context/ResultsContext";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  getAIVisibilityMetrics,
  getMentionsPosition,
  getBrandMentionResponseRates,
  getSentiment,
  hasAnalyticsData,
  getBrandName,
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
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

/* ───── animated section wrapper ───── */
const AnimatedSection = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.6s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* ───── animated counter ───── */
const AnimatedNumber = ({ value, duration = 1200 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
};

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
      const timer = setTimeout(() => setAnimatedBars(true), 300);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary/5 border border-primary/20">
              <Search className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Preparing Your Analysis
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            We're crunching the numbers across AI platforms. This usually takes a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-6 lg:p-8 space-y-8">

      {/* ── Brand Info Bar ── */}
      <AnimatedSection delay={0}>
        <BrandInfoBar />
      </AnimatedSection>

      {/* ── Key Insight Banner ── */}
      {visibilityInsight && (
        <AnimatedSection delay={80}>
          <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/[0.06] via-primary/[0.03] to-transparent p-5 md:p-6">
            {/* subtle glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-display font-semibold text-primary uppercase tracking-wider mb-1">
                  Key Insight
                </p>
                <p className="text-[15px] leading-relaxed text-foreground">
                  <span className="font-semibold">{brandName}</span> ranks{" "}
                  <span className="font-bold text-primary">#{visibilityData.brandPosition}</span>{" "}
                  in AI search visibility —{" "}
                  {visibilityData.positionBreakdown.lowPosition > 50
                    ? "with clear opportunity in mid-funnel queries"
                    : "showing strong presence in AI responses"}
                </p>
                <button
                  onClick={() => navigate("/results/recommendations")}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group"
                >
                  <Zap className="w-3.5 h-3.5" />
                  View recommendations
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Main 3-Column Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* AI Visibility Card */}
        <AnimatedSection delay={140} className="h-full">
          <div className="bg-card rounded-2xl border border-border p-5 md:p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-display font-semibold text-foreground">
                  AI Visibility
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">Weighted score based on visibility frequency across major LLMs.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <TierBadge tier={visibilityData.tier} />
            </div>
            <p className="text-xs text-muted-foreground mb-4 ml-[42px]">
              How AI models perceive your brand
            </p>

            {/* Score Hero */}
            <div className="relative text-center py-6 rounded-xl mb-5 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] border border-primary/10">
              <div className="text-[11px] font-display font-medium text-muted-foreground uppercase tracking-widest mb-2">
                Visibility Score
              </div>
              <div className="text-5xl font-display font-bold text-foreground tracking-tight">
                <AnimatedNumber value={visibilityData.score} />
              </div>
            </div>

            {/* Position Breakdown */}
            <div className="space-y-3 flex-1">
              {[
                { icon: ArrowUp, label: "Top (1–3)", value: visibilityData.positionBreakdown.topPosition, color: "text-emerald-500", bg: "bg-emerald-500" },
                { icon: ArrowRight, label: "Mid (4–10)", value: visibilityData.positionBreakdown.midPosition, color: "text-amber-500", bg: "bg-amber-500" },
                { icon: ArrowDown, label: "Low (10+)", value: visibilityData.positionBreakdown.lowPosition, color: "text-red-400", bg: "bg-red-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon className={`w-3.5 h-3.5 ${item.color} flex-shrink-0`} />
                  <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.bg} transition-all duration-1000 ease-out`}
                        style={{ width: animatedBars ? `${item.value}%` : "0%" }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-10 text-right tabular-nums">
                      {item.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {visibilityInsight && (
              <p className="text-xs text-muted-foreground border-t border-border pt-3 mt-4">
                {visibilityInsight}
              </p>
            )}
          </div>
        </AnimatedSection>

        {/* Brand Mentions Card */}
        <AnimatedSection delay={220} className="h-full">
          <div className="bg-card rounded-2xl border border-border p-5 md:p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-sm font-display font-semibold text-foreground">
                  Brand Mentions
                </span>
              </div>
              <TierBadge tier={mentionsData.tier} />
            </div>
            <p className="text-xs text-muted-foreground mb-4 ml-[42px]">
              % of AI responses mentioning your brand
            </p>

            {/* Brand bars */}
            <div className="space-y-4 py-2 flex-1">
              {brandMentionRates.map((item, index) => (
                <div key={`brand-mention-${item.brand}-${index}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
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
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        item.isTestBrand ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {item.responseRate}%
                    </span>
                  </div>
                  <div
                    className="relative h-2 bg-muted rounded-full overflow-hidden cursor-pointer group"
                    onClick={() =>
                      navigate(`/results/prompts?expandAll=true&viewType=brand`)
                    }
                  >
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out ${
                        item.isTestBrand
                          ? "bg-primary"
                          : index === 0
                          ? "bg-amber-500"
                          : "bg-amber-400/60"
                      }`}
                      style={{
                        width: animatedBars ? `${item.responseRate}%` : "0%",
                        transitionDelay: `${index * 150}ms`,
                      }}
                    />
                    {/* hover shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Sentiment Card */}
        <AnimatedSection delay={300} className="h-full">
          <div className="bg-card rounded-2xl border border-border p-5 md:p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ThumbsUp className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-sm font-display font-semibold text-foreground">
                  Sentiment Analysis
                </span>
              </div>
              <TierBadge tier={sentiment.dominant_sentiment} />
            </div>
            <p className="text-xs text-muted-foreground mb-4 ml-[42px]">
              How AI models describe your brand
            </p>

            <div className="space-y-3 flex-1">
              {sentiment.summary ? (
                sentiment.summary
                  .split("\n")
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0)
                  .map((line) => line.replace(/^-\s*/, ""))
                  .map((sentence, index) => (
                    <div
                      key={`sentiment-${index}`}
                      className="p-3.5 bg-muted/40 rounded-xl border border-border/40 hover:border-border transition-colors"
                      style={{
                        animationDelay: `${index * 120 + 400}ms`,
                      }}
                    >
                      <p className="text-[13px] text-foreground/90 italic leading-relaxed">
                        "{sentence}"
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">No sentiment data available</p>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatedSection delay={100}>
          <CompetitorComparisonChart />
        </AnimatedSection>
        <AnimatedSection delay={180}>
          <BrandMentionsRadar />
        </AnimatedSection>
      </div>

      {/* ── Tables Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatedSection delay={100}>
          <LLMVisibilityTable />
        </AnimatedSection>
        <AnimatedSection delay={180}>
          <PlatformPresence />
        </AnimatedSection>
      </div>

      {/* ── Intent-Wise Scoring ── */}
      <AnimatedSection delay={100}>
        <IntentWiseScoring />
      </AnimatedSection>
    </div>
  );
};

export default OverviewContent;
