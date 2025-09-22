import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface ModelOutput {
  query: string;
  snippet: string;
  mention_positions: Array<{
    brand: string;
    first_position_index: number;
  }>;
  sources_mentioned: string[];
}

interface ModelOutputsProps {
  data: ModelOutput[];
}

export const ModelOutputs = ({ data }: ModelOutputsProps) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) {
      return <Badge className="bg-green-500 text-white">1st</Badge>;
    } else if (position === 2) {
      return <Badge className="bg-yellow-500 text-white">2nd</Badge>;
    } else {
      return <Badge className="bg-orange-500 text-white">{position}th</Badge>;
    }
  };

  return (
    <Card className="shadow-elegant bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Raw Model Outputs</CardTitle>
        <p className="text-sm text-muted-foreground">
          Direct AI model responses showing brand mentions and positioning
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((output, index) => (
            <Collapsible key={index} className="border rounded-lg">
              <CollapsibleTrigger
                onClick={() => toggleItem(index)}
                className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{output.query}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {output.mention_positions.map((mention, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">{mention.brand}:</span>
                        {getPositionBadge(mention.first_position_index)}
                      </div>
                    ))}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openItems.has(index) ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-4 pb-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Model Response:</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/20 rounded">
                      {output.snippet}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Sources Referenced:</h4>
                    <div className="flex flex-wrap gap-1">
                      {output.sources_mentioned.map((source, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};