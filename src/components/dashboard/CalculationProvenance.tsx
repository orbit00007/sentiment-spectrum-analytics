import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, FileText } from "lucide-react";

interface CalculationProvenance {
  geo_formula: string;
  tier_mapping_used: string;
  absolute_thresholds: {
    high: number;
    medium_min: number;
    medium_max: number;
    low: number;
  };
  files_used: string[];
  notes: string;
}

interface CalculationProvenanceProps {
  data: CalculationProvenance;
}

export const CalculationProvenance = ({ data }: CalculationProvenanceProps) => {
  return (
    <Card className="shadow-elegant bg-white">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculation Methodology
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Formulas, thresholds, and methodology used for scoring
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium">GEO Formula</h4>
          </div>
          <Badge variant="outline" className="font-mono text-sm">
            {data.geo_formula}
          </Badge>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium">Tier Mapping & Thresholds</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mapping Type</p>
              <Badge variant="secondary">{data.tier_mapping_used}</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Absolute Thresholds</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>High:</span>
                  <Badge className="bg-green-500 text-white text-xs">{data.absolute_thresholds.high}+</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Medium:</span>
                  <Badge className="bg-yellow-500 text-white text-xs">
                    {data.absolute_thresholds.medium_min}-{data.absolute_thresholds.medium_max}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Low:</span>
                  <Badge className="bg-red-500 text-white text-xs">≤{data.absolute_thresholds.low}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium">Files Used</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            {data.files_used.length > 0 ? data.files_used.join(", ") : "No external files used"}
          </p>
        </div>

        <div className="p-3 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">{data.notes}</p>
        </div>
      </CardContent>
    </Card>
  );
};