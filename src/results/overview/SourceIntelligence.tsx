import {
  getSourceImpactRanked,
  getBrandName,
  getBrandLogo,
} from "@/results/data/analyticsData";
import { Globe } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const cleanUrl = (url: string): string => {
  if (!url || typeof url !== "string") return "";
  let cleaned = url.trim();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = "https://" + cleaned;
  }
  return cleaned;
};

const extractDomain = (url: string): string => {
  try {
    const cleaned = cleanUrl(url);
    if (!cleaned) return "";
    return new URL(cleaned).origin;
  } catch {
    return "";
  }
};

const FAVICON_URL_TEMPLATE =
  import.meta.env.VITE_FAVICON_URL_TEMPLATE ||
  "https://www.google.com/s2/favicons?domain={domain}&sz=128";

const faviconFromUrl = (url: string): string => {
  if (!url) return "";
  const domain = extractDomain(url);
  if (!domain) return "";
  return FAVICON_URL_TEMPLATE.replace("{domain}", domain);
};

type SourceEntry = {
  name: string;
  rank: number;
  total_citations: number;
  pages_used: string[];
  favicon: string;
  mentions: Record<string, { count: number; score?: number }>;
  brandCited: boolean;
};

const TOP_DISPLAY = 5;

function SourceRow({
  source,
  brandName,
}: {
  source: SourceEntry;
  brandName: string;
}) {
  const citedBrands = Object.entries(source.mentions)
    .filter(([, m]) => (m?.count ?? 0) > 0)
    .map(([brand]) => brand);

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-all">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-border/50 flex-shrink-0">
          {source.favicon ? (
            <img
              src={source.favicon}
              alt={source.name}
              className="w-5 h-5 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Globe className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <span className="font-semibold text-sm text-foreground block truncate">
            {source.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {source.total_citations} {source.total_citations === 1 ? "citation" : "citations"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {citedBrands.length > 0 && (
          <div className="flex items-center -space-x-1.5">
            {citedBrands.map((brand) => {
              const logo = getBrandLogo(brand);
              return (
                <Tooltip key={brand}>
                  <TooltipTrigger asChild>
                    <div className="w-6 h-6 rounded-full bg-muted border-2 border-card overflow-hidden flex items-center justify-center flex-shrink-0">
                      {logo ? (
                        <img
                          src={logo}
                          alt={brand}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground truncate px-0.5">
                          {brand.slice(0, 1)}
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {brand}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
        {source.brandCited && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20">
            Brand Cited
          </span>
        )}
      </div>
    </div>
  );
}

export const SourceIntelligence = () => {
  const sourceImpactRanked = getSourceImpactRanked();
  const brandName = getBrandName();
  const [modalOpen, setModalOpen] = useState(false);

  const topSources = useMemo(() => {
    if (!sourceImpactRanked || typeof sourceImpactRanked !== "object") return [];

    const entries: SourceEntry[] = Object.entries(sourceImpactRanked).map(
      ([sourceKey, data]: [string, any]) => {
        const pages_used = data.pages_used || [];
        const total_citations = data.total_citations ?? 0;
        const rank = data.rank ?? 999;
        const mentions = data.mentions || {};
        const brandCited =
          typeof mentions[brandName] !== "undefined" &&
          (mentions[brandName]?.count ?? 0) > 0;
        const url =
          pages_used[0] ||
          (sourceKey.includes(".") ? `https://${sourceKey}` : "");
        return {
          name: sourceKey,
          rank: Number(rank),
          total_citations: Number(total_citations),
          pages_used,
          favicon: faviconFromUrl(url),
          mentions,
          brandCited,
        };
      }
    );

    return entries
      .sort((a, b) => a.rank - b.rank || b.total_citations - a.total_citations)
      .filter((e) => e.total_citations > 0 || e.pages_used.length > 0);
  }, [sourceImpactRanked, brandName]);

  if (topSources.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 md:p-6 overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Source Intelligence
          </h3>
        </div>
        <div className="py-8 text-center text-muted-foreground text-sm">
          No citation source data available yet.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Source Intelligence
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Where AI models cite information most frequently.
      </p>

      <div className="space-y-3">
        {topSources.slice(0, TOP_DISPLAY).map((source) => (
          <SourceRow key={source.name} source={source} brandName={brandName} />
        ))}
      </div>

      {topSources.length > TOP_DISPLAY && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-3 w-full text-center text-sm font-medium text-primary hover:underline"
        >
          View all ({topSources.length} sources)
        </button>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] flex flex-col gap-4 p-6">
          <DialogHeader>
            <DialogTitle>All sources</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto space-y-3 pr-2 -mr-2">
            {topSources.map((source) => (
              <SourceRow key={source.name} source={source} brandName={brandName} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
