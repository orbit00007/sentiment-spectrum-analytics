import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  brandName: string;
  analysisId: string;
  createdAt: string;
  status: string;
}

export const DashboardHeader = ({ brandName, analysisId, createdAt, status }: DashboardHeaderProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gradient-to-r from-brand-primary to-primary/80 p-8 rounded-lg shadow-elegant text-white mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <span className="text-2xl font-bold">AI</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Brand Intelligence</h1>
            <p className="text-white/80">Professional Analytics Suite</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
          {status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
        <div className="text-center">
          <div className="text-white/70 text-sm">Analysis ID</div>
          <div className="font-mono text-sm">{analysisId.split('-')[0]}...</div>
        </div>
        <div className="text-center">
          <div className="text-white/70 text-sm">Created</div>
          <div className="font-medium">{formatDate(createdAt)}</div>
        </div>
        <div className="text-center">
          <div className="text-white/70 text-sm">Type</div>
          <div className="font-medium">Product Analysis</div>
        </div>
      </div>
    </div>
  );
};