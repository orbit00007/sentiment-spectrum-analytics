import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Calendar, Settings } from "lucide-react";

interface ModelReported {
  model_name: string;
  model_version: string;
  report_generated_at: string;
}

interface ModelInfoProps {
  data: ModelReported;
}

export const ModelInfo = ({ data }: ModelInfoProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="shadow-elegant bg-white">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Model Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI model used for this brand intelligence report
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Model Name</p>
              <p className="font-semibold">{data.model_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="w-fit">
              {data.model_version}
            </Badge>
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Generated At</p>
              <p className="font-semibold">{formatDate(data.report_generated_at)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};