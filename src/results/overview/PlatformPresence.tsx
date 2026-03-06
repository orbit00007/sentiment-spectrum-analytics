import { getPlatformPresence } from "@/results/data/analyticsData";
import { Globe, CheckCircle2 } from "lucide-react";

const cleanUrl = (url: string): string => {
  if (!url || typeof url !== "string") return "";
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\.([a-z]+)\1(?=\/)/gi, ".$1");
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) cleaned = "https://" + cleaned;
  return cleaned;
};

const extractDomain = (url: string): string => {
  try { return new URL(cleanUrl(url)).hostname; } catch { return ""; }
};

const faviconFromUrl = (url: string): string => {
  const domain = extractDomain(url);
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : "";
};

const autoLabel = (key: string): string => key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const PlatformPresence = () => {
  const platformPresence = getPlatformPresence();
  const platforms = Object.entries(platformPresence).map(([key, url]) => {
    const cleanedUrl = cleanUrl(url as string);
    return { key, label: autoLabel(key), icon: faviconFromUrl(cleanedUrl), status: cleanedUrl ? "present" : "missing", url: cleanedUrl };
  });
  const presentCount = platforms.filter((p) => p.status === "present").length;

  return (
    <div className="ds-card">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-ds-blue" />
          <h3 className="text-[14px] font-semibold text-ds-text">Platform Presence Summary</h3>
        </div>
        {presentCount === platforms.length ? (
          <span className="ds-badge ds-badge-positive">✓ 100% Coverage</span>
        ) : (
          <span className="text-[13px] text-ds-blue font-medium">{presentCount}/{platforms.length} Platforms</span>
        )}
      </div>
      <p className="text-[12px] text-ds-text-muted mb-3">Brand footprint on data sources used by LLMs</p>
      <div className="grid grid-cols-2 gap-2">
        {platforms.map((platform) => (
          <a key={platform.key} href={platform.url || undefined} target="_blank" rel="noopener noreferrer"
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all hover:shadow-sm ${
              platform.status === "present" ? "border-border bg-[#F0FDF4]" : "border-destructive/30 bg-[#FEF2F2]"
            }`}>
            <div className="flex items-center gap-2">
              {platform.icon && <img src={platform.icon} alt={platform.label} className="w-5 h-5 rounded-sm object-contain bg-white flex-shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
              <span className="font-medium text-[13px] text-ds-text">{platform.label}</span>
            </div>
            {platform.status === "present" ? (
              <CheckCircle2 className="w-5 h-5 text-ds-success" />
            ) : (
              <span className="text-[11px] text-ds-danger font-medium">Missing</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};
