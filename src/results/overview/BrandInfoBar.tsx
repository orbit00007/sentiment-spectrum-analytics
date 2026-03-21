import { getBrandName, getBrandWebsite, getModelName, getAnalysisKeywords, getBrandLogo, getAnalysisDate } from "@/results/data/analyticsData";
import { LLMIcon } from "@/results/ui/LLMIcon";
import { ExternalLink, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import openaiIcon from "@/assets/openai-icon.svg";
import googleaioverviewIcon from "@/assets/googleaioverview.svg";
import geminiColorIcon from "@/assets/gemini-color.svg";
import perplexityIcon from "@/assets/perplexity-icon.svg";

// Map incoming model string → { label, icon }
const MODEL_MAP: Record<string, { label: string; icon: string }> = {
  openai:               { label: "ChatGPT",           icon: openaiIcon },
  chatgpt:              { label: "ChatGPT",           icon: openaiIcon },
  "google-ai-overview": { label: "Google AI Overview", icon: googleaioverviewIcon },
  "google_ai_overview": { label: "Google AI Overview", icon: googleaioverviewIcon },
  "google ai overview": { label: "Google AI Overview", icon: googleaioverviewIcon },
  "google-ai-mode":     { label: "Google AI Mode",    icon: geminiColorIcon },
  "google_ai_mode":     { label: "Google AI Mode",    icon: geminiColorIcon },
  "google ai mode":     { label: "Google AI Mode",    icon: geminiColorIcon },
  gemini:               { label: "Gemini",            icon: geminiColorIcon },
  perplexity:           { label: "Perplexity",        icon: perplexityIcon },
};

const resolveModel = (raw: string): { label: string; icon: string } => {
  const key = raw.toLowerCase().trim();
  return MODEL_MAP[key] ?? { label: raw, icon: "" };
};

const ModelIcon = ({ model }: { model: string }) => {
  const { label, icon } = resolveModel(model);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden cursor-default flex-shrink-0">
          {icon ? (
            <img src={icon} alt={label} className="w-7 h-7 object-contain" />
          ) : (
            <LLMIcon platform={model} size="lg" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="text-xs font-medium">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const BrandInfoBar = () => {
  const brandName = getBrandName();
  const brandWebsite = getBrandWebsite();
  const modelName = getModelName();
  const keywords = getAnalysisKeywords();
  const brandLogo = getBrandLogo();
  const analysisDate = getAnalysisDate();

  const models = modelName
    ?.split(",")
    .map((m) => m.trim())
    .filter(Boolean) || [];
  
  if (!brandName) return null;
  
  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Brand logo, name, website and keywords */}
        <div className="flex items-start gap-4">
          {brandLogo ? (
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-black/5 flex items-center justify-center p-2 flex-shrink-0">
              <img 
                src={brandLogo} 
                alt={brandName} 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-primary">
                {brandName.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{brandName}</h2>
            {brandWebsite && (
              <a 
                href={brandWebsite} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                <span className="truncate">{brandWebsite}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            )}
            {/* Keywords below website */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword, idx) => (
                  <Badge 
                    key={idx} 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Analysis date and models - shown on mobile below keywords */}
            <div className="flex flex-col gap-2 mt-3 md:hidden">
              {analysisDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Analyzed: {analysisDate}</span>
                </div>
              )}
              {models.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Analyzed by:</span>
                  <div className="flex items-center gap-2">
                    {models.map((model) => (
                      <ModelIcon key={model} model={model} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right on desktop: Analysis date and LLM models (hidden on mobile) */}
        <div className="hidden md:flex md:flex-col md:items-end gap-2">
          {analysisDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Analyzed: {analysisDate}</span>
            </div>
          )}
          {models.length > 0 && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground">Analyzed by</span>
              <div className="flex items-center gap-2">
                {models.map((model) => (
                  <ModelIcon key={model} model={model} />
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