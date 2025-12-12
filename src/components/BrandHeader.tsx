import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, Globe, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TOOLTIP_CONTENT } from "@/lib/formulas";

interface BrandHeaderProps {
  brandName: string;
  brandWebsite: string;
  brandLogo?: string;
  keywordsAnalyzed: string[];
  status: string;
  date: string;
  modelName: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-success text-success-foreground";
    case "error":
      return "bg-destructive text-destructive-foreground";
    case "processing":
      return "bg-medium-neutral text-medium-neutral-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const BrandHeader = ({
  brandName,
  brandWebsite,
  brandLogo,
  keywordsAnalyzed,
  status,
  date,
  modelName,
}: BrandHeaderProps) => {
  const formatDate = (dateString: string) => {
    // NEW: Convert UTC date to IST (Indian Standard Time) format
    // Parse the UTC date string
    const utcDate = new Date(dateString);
    
    // Convert to IST using toLocaleString with Asia/Kolkata timezone
    return utcDate.toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata", // IST timezone
      hour12: true,
    });
  };

  // Clean URL from markdown formatting
  const cleanUrl = (url: string) => {
    // Remove markdown link format [url](url) or (url) or [url]
    return url
      .replace(/^\[(.+)\]\((.+)\)$/, "$2") // [text](url) -> url
      .replace(/^\((.+)\)$/, "$1") // (url) -> url
      .replace(/^\[(.+)\]$/, "$1"); // [url] -> url
  };

  return (
    <TooltipProvider>
      <Card className="w-full max-w-full p-3 sm:p-4 md:p-5 lg:p-6 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
              {brandLogo && (
                <img 
                  src={brandLogo} 
                  alt={`${brandName} logo`}
                  className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-md object-contain bg-white p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground">{brandName}</h1>
              <Badge className={getStatusColor(status)} variant="secondary">
                {status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
              <a
                href={cleanUrl(brandWebsite)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline text-xs sm:text-sm break-all sm:break-words"
              >
                {cleanUrl(brandWebsite)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-2">
              <div className="text-xs sm:text-sm font-semibold text-foreground mb-3">
                Keywords Analyzed: {keywordsAnalyzed.length}
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {keywordsAnalyzed.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-[10px] sm:text-xs bg-secondary text-secondary-foreground">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 lg:gap-8">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                Model
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{TOOLTIP_CONTENT.brandHeader.model}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{modelName}</div>
            </div>
            
            <div>
              <div className="text-xs sm:text-sm font-semibold text-foreground mb-3">
                Analysis Date
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {formatDate(date)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
};
