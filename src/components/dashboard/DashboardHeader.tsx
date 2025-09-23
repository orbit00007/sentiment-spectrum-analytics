import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, ExternalLink } from "lucide-react";

interface DashboardHeaderProps {
  brandName: string;
  brandWebsite: string;
  analysisId: string;
  createdAt: string;
  status: string;
  type: string;
  dominantSentiment?: string;
}

export const DashboardHeader = ({ brandName, brandWebsite, analysisId, createdAt, status, type, dominantSentiment }: DashboardHeaderProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-500 text-white";
      case "negative":
        return "bg-red-500 text-white";
      case "neutral":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-gradient-to-r from-brand-primary to-primary/80 p-8 rounded-lg shadow-elegant text-white mb-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{brandName}</h1>
              <p className="text-white/80">Brand Intelligence Report</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90 hover:text-white">
            <ExternalLink className="w-4 h-4" />
            <a href={brandWebsite} target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline">
              {brandWebsite}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">Report Type:</span>
            <Badge variant="secondary" className="bg-white/20 text-white capitalize">{type.replace('_', ' ')}</Badge>
            {dominantSentiment && (
              <>
                <span className="text-sm text-white/70">•</span>
                <span className="text-sm text-white/70">Sentiment:</span>
                <Badge className={`${getSentimentColor(dominantSentiment)} border-0`}>{dominantSentiment}</Badge>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            {status}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Calendar className="w-4 h-4" />
            {formatDate(createdAt)}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/20">
        <p className="text-sm text-white/70">
          Analysis ID: <span className="font-mono text-white/90">{analysisId}</span>
        </p>
      </div>
    </div>
  );
};