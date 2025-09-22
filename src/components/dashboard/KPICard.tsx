import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  description?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export const KPICard = ({ 
  title, 
  value, 
  badge, 
  badgeVariant = "default", 
  description, 
  icon: Icon,
  trend = "neutral" 
}: KPICardProps) => {
  const getBadgeStyles = () => {
    switch (badgeVariant) {
      case "destructive":
        return "bg-danger text-danger-foreground";
      case "secondary":
        return "bg-success text-success-foreground";
      case "outline":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <Card className="shadow-elegant hover:shadow-dramatic transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {badge && (
            <Badge className={getBadgeStyles()}>
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};