import { useState } from "react";
import { CheckCircle2, XCircle, Shield, Loader2, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  checkAIReadiness,
  AIReadinessCheckResult,
  AIReadinessResponse,
} from "@/apiHelpers";

// ── Label map ─────────────────────────────────────────────────────────────────

const CHECK_LABELS: Record<string, string> = {
  page_status: "Page Status",
  https: "HTTPS",
  robots_txt: "robots.txt & AI Crawler Access",
  noindex_noai: "noindex / noai Directives",
  login_wall: "Login Wall Detection",
  server_rendered: "Server-Rendered Content",
  text_density: "Text Density",
  title_meta_description: "Title & Meta Description",
  h1_heading: "H1 Heading",
  schema_markup: "Structured Schema Markup",
  canonical_tag: "Canonical Tag",
};

// ── Grouped sections ──────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "crawlability",
    label: "Crawlability & Access",
    shortLabel: "Findability",
    description: "Can AI bots find and access your page?",
    checks: ["page_status", "https", "robots_txt", "noindex_noai", "login_wall"],
    icon: "🔍",
  },
  {
    id: "content",
    label: "Content Structure",
    shortLabel: "Readability",
    description: "Is your content readable and well-structured for AI?",
    checks: ["server_rendered", "text_density"],
    icon: "📄",
  },
  {
    id: "technical_seo",
    label: "Technical SEO Signals",
    shortLabel: "Citability",
    description: "Do your technical SEO signals help AI index your page?",
    checks: ["title_meta_description", "h1_heading", "schema_markup", "canonical_tag"],
    icon: "⚙️",
  },
];

// ── Color helpers ─────────────────────────────────────────────────────────────

const getColorConfig = (pct: number) => {
  if (pct >= 82) return { stroke: "#22c55e", text: "text-green-500", label: "Strong" };
  if (pct >= 55) return { stroke: "#f59e0b", text: "text-amber-500", label: "Moderate" };
  return { stroke: "#ef4444", text: "text-red-500", label: "Needs Work" };
};

const getOverallConfig = (passed: number, total: number) => {
  const pct = total > 0 ? passed / total : 0;
  if (pct >= 0.82) return { color: "text-green-500", bar: "bg-green-500", label: "Strong" };
  if (pct >= 0.55) return { color: "text-amber-500", bar: "bg-amber-500", label: "Moderate" };
  return { color: "text-red-500", bar: "bg-red-500", label: "Needs Work" };
};

const getSectionScore = (checks: string[], results: AIReadinessCheckResult[]) => {
  const relevant = results.filter((r) => checks.includes(r.check));
  const passed = relevant.filter((r) => r.passed).length;
  const pct = relevant.length > 0 ? Math.round((passed / relevant.length) * 100) : 0;
  return { passed, total: relevant.length, pct };
};

// ── Circular progress ─────────────────────────────────────────────────────────

const CircularProgress = ({ pct, label, color }: { pct: number; label: string; color: string }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/40" />
          <circle
            cx="32" cy="32" r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
          {pct}%
        </span>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const AIReadinessContent = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(SECTIONS.map((s) => s.id))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    const res = await checkAIReadiness(trimmed);
    setIsLoading(false);
    if (res.error) setError(res.error);
    else if (res.data) setResult(res.data);
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const failedCount = result ? result.results.filter((r) => !r.passed).length : 0;
  const overallCfg = result ? getOverallConfig(result.passed, result.total) : null;

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-violet-500/20 via-violet-500/10 to-transparent border border-violet-500/20 p-4 md:p-6">
        <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-violet-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-violet-500/10 rounded-lg md:rounded-xl">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-foreground">
              AI Readiness Checker
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Find out if AI models can discover and index your web pages. Run 11
              checks across crawlability, content structure, and technical SEO signals.
            </p>
          </div>
        </div>
      </div>

      {/* ── URL input ──────────────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border p-4 md:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Enter a URL (e.g. yoursite.com/page)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading || !url.trim()} className="shrink-0">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Checking...</>
            ) : "Run Check"}
          </Button>
        </form>
      </div>

      {/* ── Error state ────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-red-500">Could Not Check This Page</p>
            <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── Summary card: score + circles + issues line ───────────────────── */}
      {result && overallCfg && (
        <div className="bg-card rounded-xl border border-border p-4 md:p-6 space-y-4">

          {/* Top row: X/Y score left, circles right */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* X/Y + progress bar */}
            <div className="flex-1 space-y-2">
              <div className="flex items-baseline gap-1">
                <span className={cn("text-4xl font-bold", overallCfg.color)}>{result.passed}</span>
                <span className="text-2xl text-muted-foreground font-semibold">/{result.total}</span>
                <span className={cn("ml-2 text-sm font-medium", overallCfg.color)}>{overallCfg.label}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden w-full max-w-xs">
                <div
                  className={cn("h-2 rounded-full transition-all duration-700", overallCfg.bar)}
                  style={{ width: `${(result.passed / result.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{result.passed} of {result.total} checks passed</p>
            </div>

            {/* Circular percentages */}
            <div className="flex items-center gap-6 md:gap-10">
              {SECTIONS.map((section) => {
                const { pct } = getSectionScore(section.checks, result.results);
                const cfg = getColorConfig(pct);
                return (
                  <CircularProgress
                    key={section.id}
                    pct={pct}
                    label={section.shortLabel}
                    color={cfg.stroke}
                  />
                );
              })}
            </div>
          </div>

          {/* Issues found line */}
          {failedCount > 0 && (
            <p className="text-sm text-muted-foreground border-t border-border pt-3">
              <span className="font-semibold text-foreground">{failedCount} {failedCount === 1 ? "issue" : "issues"} found</span>
              {" "}
            </p>
          )}
          {failedCount === 0 && (
            <p className="text-sm text-green-500 font-medium border-t border-border pt-3">
              ✓ All checks passed — your page is fully AI-ready!
            </p>
          )}
        </div>
      )}

      {/* ── Grouped results ────────────────────────────────────────────────── */}
      {result && (
        <div className="space-y-3">
          {SECTIONS.map((section) => {
            const sectionResults = result.results.filter((r) => section.checks.includes(r.check));
            if (sectionResults.length === 0) return null;

            const { passed, total, pct } = getSectionScore(section.checks, result.results);
            const cfg = getColorConfig(pct);
            const isExpanded = expandedSections.has(section.id);

            return (
              <div key={section.id} className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Section header */}
                <div
                  className="p-4 md:p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{section.icon}</span>
                    <div>
                      <p className="font-semibold text-sm md:text-base text-foreground">{section.label}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={cn("text-sm font-bold", cfg.text)}>{passed}/{total} passed</span>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                </div>

                {/* Section checks */}
                {isExpanded && (
                  <div className="border-t border-border/50 divide-y divide-border/50">
                    {sectionResults.map((item) => (
                      <div key={item.check} className="p-4 md:p-5 flex items-start gap-3 md:gap-4 hover:bg-muted/20 transition-colors">
                        <div className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5",
                          item.passed ? "bg-green-500/10" : "bg-red-500/10"
                        )}>
                          {item.passed
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                            : <XCircle className="w-4 h-4 text-red-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-sm md:text-base">
                              {CHECK_LABELS[item.check] ?? item.check}
                            </span>
                            <span className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full border",
                              item.passed
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                              {item.passed ? "Pass" : "Fail"}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIReadinessContent;