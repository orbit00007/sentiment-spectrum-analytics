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
  keywordsAnalyzed: string[];
  status: string;
  date: string;
  modelName: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-emerald-500 text-white";
    case "error":
      return "bg-red-500 text-white";
    case "processing":
      return "bg-yellow-500 text-white";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const BrandHeader = ({
  brandName,
  brandWebsite,
  keywordsAnalyzed,
  status,
  date,
  modelName,
}: BrandHeaderProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      <Card className="p-6 border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{brandName}</h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{TOOLTIP_CONTENT.brandHeader.brandName}</p>
                </TooltipContent>
              </Tooltip>
              <Badge className={getStatusColor(status)} variant="secondary">
                {status}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{TOOLTIP_CONTENT.brandHeader.status}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Globe className="h-4 w-4" />
              <a
                href={cleanUrl(brandWebsite)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                {cleanUrl(brandWebsite)}
                <ExternalLink className="h-3 w-3" />
              </a>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{TOOLTIP_CONTENT.brandHeader.website}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div>
              <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                Keywords Analyzed: {keywordsAnalyzed.length}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{TOOLTIP_CONTENT.brandHeader.keywords}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywordsAnalyzed.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                Model
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{TOOLTIP_CONTENT.brandHeader.model}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-sm text-muted-foreground">{modelName}</div>
            </div>
            
            <div>
              <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                Analysis Date
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{TOOLTIP_CONTENT.brandHeader.date}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(date)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
};
