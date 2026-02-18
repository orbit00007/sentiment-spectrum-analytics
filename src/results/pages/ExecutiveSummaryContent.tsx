import { getTierColorVar, toOrdinal } from "@/results/data/formulas";
import { TierBadge } from "@/results/ui/TierBadge";
import {
  getExecutiveSummary,
  getAnalysisDate,
  getBrandName,
  getAIVisibilityMetrics,
  getBrandInfoWithLogos,
  getSentiment,
  getMentionsPosition,
} from "@/results/data/analyticsData";
import {
  CheckCircle2,
  XCircle,
  Target,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Users,
  ArrowDown,
  Sparkles,
  Calendar,
  BarChart3,
  MessageSquare,
  FileText,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const ExecutiveSummaryContent = () => {
  const navigate = useNavigate();
  const visibilityData = getAIVisibilityMetrics();
  const brandInfo = getBrandInfoWithLogos();
  const executiveSummary = getExecutiveSummary();
  const sentiment = getSentiment();
  const mentionsData = getMentionsPosition();
  const analysisDate = getAnalysisDate();
  const brandName = getBrandName();

  const getBrandLogo = (brandName: string) => {
    const cleanName = brandName.replace(/\s*\(GEO \d+\)/, "");
    const brand = brandInfo.find((b) => b.brand === cleanName);
    return brand?.logo;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Executive Summary</h1>
          {analysisDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="w-4 h-4" />
              <span>Reporting Period: {analysisDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">AI Visibility Index</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-foreground">{visibilityData.score}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. Sentiment</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-foreground">{sentiment.dominant_sentiment}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Brand Position</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-foreground">#{visibilityData.brandPosition}</span>
                <span className="text-sm text-muted-foreground">of {visibilityData.totalBrands}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Strategic Narrative + Key Takeaways */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Narrative */}
          <div className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">AI Strategic Narrative</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-foreground leading-relaxed italic border-l-2 border-primary pl-4">
                {executiveSummary.brand_score_and_tier}
              </p>
              {executiveSummary.conclusion && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {executiveSummary.conclusion}
                </p>
              )}
            </div>
          </div>

          {/* Key Takeaways Sidebar */}
          <div className="lg:w-[280px] bg-muted/30 border-t lg:border-t-0 lg:border-l border-border p-6">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">KEY TAKEAWAYS</h3>
            <div className="space-y-3">
              {executiveSummary.strengths?.slice(0, 2).map((strength, idx) => (
                <div key={`s-${idx}`} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground leading-relaxed">{strength}</p>
                </div>
              ))}
              {executiveSummary.weaknesses?.slice(0, 1).map((weakness, idx) => (
                <div key={`w-${idx}`} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground leading-relaxed">{weakness}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="font-semibold text-foreground">Strengths</h3>
          </div>
          <div className="space-y-2">
            {executiveSummary.strengths?.map((strength, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-green-500/20 text-green-500 text-[10px] font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm text-foreground leading-relaxed">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-red-500/10 rounded-lg">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="font-semibold text-foreground">Weaknesses</h3>
          </div>
          <div className="space-y-2">
            {executiveSummary.weaknesses?.map((weakness, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 text-[10px] font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm text-foreground leading-relaxed">{weakness}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitor Positioning */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Competitive Positioning</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Leaders */}
          <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/15">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-green-500" />
              <h4 className="font-semibold text-green-600 text-sm">Leaders</h4>
            </div>
            <div className="space-y-2">
              {executiveSummary.competitor_positioning.leaders.map((leader, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-card/60 rounded-lg">
                  {getBrandLogo(leader.name) && (
                    <img src={getBrandLogo(leader.name)} alt="" className="w-6 h-6 rounded-full object-contain bg-white flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-xs">{leader.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{leader.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mid-Tier */}
          <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/15">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <h4 className="font-semibold text-amber-600 text-sm">Mid-Tier</h4>
            </div>
            <div className="space-y-2">
              {executiveSummary.competitor_positioning.mid_tier.map((brand, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-card/60 rounded-lg">
                  {getBrandLogo(brand.name) && (
                    <img src={getBrandLogo(brand.name)} alt="" className="w-6 h-6 rounded-full object-contain bg-white flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-xs">{brand.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{brand.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Laggards */}
          <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/15">
            <div className="flex items-center gap-2 mb-3">
              <ArrowDown className="w-4 h-4 text-red-500" />
              <h4 className="font-semibold text-red-600 text-sm">Laggards</h4>
            </div>
            <div className="space-y-2">
              {executiveSummary.competitor_positioning.laggards.map((brand, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-card/60 rounded-lg">
                  {getBrandLogo(brand.name) && (
                    <img src={getBrandLogo(brand.name)} alt="" className="w-6 h-6 rounded-full object-contain bg-white flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-xs">{brand.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{brand.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Boardroom Actions */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Recommended Boardroom Actions</h3>
          </div>
          <button
            onClick={() => navigate("/results/recommendations")}
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            View Action Center <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {executiveSummary.prioritized_actions?.map((action, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium">{action}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummaryContent;
