import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface RecommendedActionsProps {
  actions: Array<{
    category: string;
    trigger_note: string;
    items: string[];
  }>;
}

export const RecommendedActions = ({ actions }: RecommendedActionsProps) => {
  const [openBuckets, setOpenBuckets] = useState<Record<string, boolean>>({});

  const toggleBucket = (category: string) => {
    setOpenBuckets(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (!actions || actions.length === 0) {
    return (
      <Card className="card-gradient border-0">
        <CardHeader>
          <CardTitle className="text-xl">Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No high-impact actions detected from this run.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-gradient border-0 mb-8">
      <CardHeader>
        <CardTitle className="text-xl">Recommended Actions</CardTitle>
        <CardDescription>
          Strategic improvements to boost your AI search visibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action, index) => (
          <Collapsible
            key={index}
            open={openBuckets[action.category]}
            onOpenChange={() => toggleBucket(action.category)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-smooth">
                <div className="text-left">
                  <h4 className="font-semibold text-base">{action.category}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {action.trigger_note}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{action.items.length}</Badge>
                  {openBuckets[action.category] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 mt-2">
                <ul className="space-y-2">
                  {action.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};