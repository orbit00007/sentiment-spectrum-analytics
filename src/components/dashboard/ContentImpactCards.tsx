import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Target } from "lucide-react";

interface ContentImpactData {
  [key: string]: {
    top_3_brands: Array<{
      brand: string;
      visibility: number;
      position: number;
    }>;
    our_brand_position: {
      brand: string;
      position: number;
      visibility: number;
    };
  };
}

interface ContentImpactCardsProps {
  data: ContentImpactData;
}

export const ContentImpactCards = ({ data }: ContentImpactCardsProps) => {
  const getPositionBadge = (position: number) => {
    if (position <= 3) {
      return <Badge className="bg-success text-success-foreground">Top 3</Badge>;
    } else if (position <= 5) {
      return <Badge className="bg-warning text-warning-foreground">Top 5</Badge>;
    } else {
      return <Badge className="bg-muted text-muted-foreground">#{position}</Badge>;
    }
  };

  const getIcon = (category: string) => {
    if (category.toLowerCase().includes('review')) return Award;
    if (category.toLowerCase().includes('community')) return Target;
    return TrendingUp;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(data).map(([category, info]) => {
        const Icon = getIcon(category);
        return (
          <Card key={category} className="shadow-elegant hover:shadow-dramatic transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-brand-primary" />
                {getPositionBadge(info.our_brand_position.position)}
              </div>
              <CardTitle className="text-sm font-medium">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {info.our_brand_position.visibility}
              </div>
              <div className="text-xs text-muted-foreground">
                Position #{info.our_brand_position.position}
              </div>
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">Top performer:</div>
                <div className="text-sm font-medium">
                  {info.top_3_brands[0]?.brand} ({info.top_3_brands[0]?.visibility})
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};