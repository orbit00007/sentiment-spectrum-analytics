import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, Globe } from "lucide-react";

interface BrandHeaderProps {
  brandName: string;
  brandWebsite: string;
  keywordsAnalyzed: number;
  status: string;
  date: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-success text-success-foreground";
    case "processing":
      return "bg-warning text-warning-foreground";
    case "failed":
      return "bg-destructive text-destructive-foreground";
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

  return (
    <Card className="pt-6 border-0 shadow-none">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Brand Name : {brandName}</h1>
            <Badge className={getStatusColor(status)} variant="secondary">
              Status : {status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Globe className="h-4 w-4" />
            <h3> Brand Website : </h3>
            <a
              href={brandWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              {brandWebsite}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold">
              <span className="text-foreground">Keywords Analyzed: </span>
              <span className="text-primary">
                {localStorage.getItem("keyword_count")}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-foreground">
              Analysis Date
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(date)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
