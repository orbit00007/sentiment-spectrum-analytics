import { getPlatformPresence } from "@/results/data/analyticsData";
import { Globe, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from "lucide-react";

// Extract base domain from full URL
const extractDomain = (url: string): string => {
  try {
    return new URL(url).origin; // example: https://reddit.com
  } catch {
    return ""; // invalid or empty
  }
};

// Generate favicon link dynamically
const faviconFromUrl = (url: string): string => {
  if (!url) return "";
  const domain = extractDomain(url);
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${domain}&size=64`;
};

// Auto-generate labels by formatting keys
const autoLabel = (key: string): string => {
  return key
    .replace(/_/g, " ")     // product_hunt → product hunt
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Product Hunt
};

export const PlatformPresence = () => {
  const platformPresence = getPlatformPresence();

  // Build dynamic platform entries
  const platforms = Object.entries(platformPresence).map(([key, url]) => ({
    key,
    label: autoLabel(key),
    icon: faviconFromUrl(url as string),
    url: url as string,
    status: url ? "present" : "missing"
  }));

  const presentCount = platforms.filter(p => p.status === "present").length;
  const totalCount = platforms.length;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Platform Presence Summary</h3>
        </div>
        <span className="text-sm text-muted-foreground">{presentCount}/{totalCount} platforms</span>
      </div>

      <p className="text-xs text-muted-foreground mb-4">Brand presence on key AI-relevant platforms</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {platforms.map((platform) => (
          <div 
            key={platform.key}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              platform.status === "present" 
                ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10" 
                : "border-red-500/20 bg-red-500/5"
            }`}
          >

            {/* ICON + LABEL */}
            <div className="flex items-center gap-2">
              <img
                src={platform.icon}
                alt={platform.label}
                className="w-5 h-5 rounded-full object-contain bg-white flex-shrink-0"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <span className="font-medium text-sm text-foreground">{platform.label}</span>
            </div>

            {/* LINK OR MISSING ICON */}
            {platform.url ? (
              <a 
                href={platform.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
