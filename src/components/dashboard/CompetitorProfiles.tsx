import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CompetitorProfile {
  brand_name: string;
  ai_description: string;
  ai_sentiment: string;
  sources: string[];
  evidence_snippets: string[];
}

interface CompetitorProfilesProps {
  data: CompetitorProfile[];
}

export const CompetitorProfiles = ({ data }: CompetitorProfilesProps) => {
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <Badge className="bg-green-500 text-white">Positive</Badge>;
      case "negative":
        return <Badge className="bg-red-500 text-white">Negative</Badge>;
      case "neutral":
        return <Badge className="bg-gray-500 text-white">Neutral</Badge>;
      default:
        return <Badge variant="outline">{sentiment}</Badge>;
    }
  };

  const getBrandInitials = (brandName: string) => {
    return brandName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBrandColor = (brandName: string) => {
    const colors = [
      "bg-purple-500", "bg-blue-500", "bg-green-500", 
      "bg-orange-500", "bg-red-500", "bg-pink-500",
      "bg-indigo-500", "bg-teal-500"
    ];
    const index = brandName.length % colors.length;
    return colors[index];
  };

  return (
    <Card className="shadow-elegant bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Competitor Profiles</CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-generated brand descriptions and sentiment analysis
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((competitor, index) => (
            <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <Avatar className="w-12 h-12">
                <AvatarFallback className={`${getBrandColor(competitor.brand_name)} text-white font-semibold`}>
                  {getBrandInitials(competitor.brand_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{competitor.brand_name}</h3>
                    {competitor.brand_name === "Kommunicate" && (
                      <Badge className="bg-brand-primary text-white text-xs">Our Brand</Badge>
                    )}
                  </div>
                  {getSentimentBadge(competitor.ai_sentiment)}
                </div>
                
                <p className="text-sm text-muted-foreground">{competitor.ai_description}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Sources:</span> {competitor.sources.join(", ")}
                  </div>
                </div>
                
                {competitor.evidence_snippets.length > 0 && (
                  <div className="mt-2 p-2 bg-muted/20 rounded text-xs">
                    <span className="font-medium">Key Evidence: </span>
                    {competitor.evidence_snippets[0]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};