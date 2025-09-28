import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Database, Users, FileText } from "lucide-react";

interface SourceAnalysisProps {
  sources: Array<{
    category: string;
    sources: string[];
    total_citations: { Value: number };
    visibility: string;
    cited_by_models: string[];
    notes: string;
  }>;
}

const getVisibilityColor = (visibility: string) => {
  switch (visibility.toLowerCase()) {
    case 'high':
      return 'bg-success text-success-foreground';
    case 'medium':
      return 'bg-warning text-warning-foreground';
    case 'low':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'analyst platforms':
      return <Database className="h-5 w-5 text-primary" />;
    case 'review platforms':
      return <Users className="h-5 w-5 text-primary" />;
    case 'comparison blogs':
      return <FileText className="h-5 w-5 text-primary" />;
    default:
      return <FileText className="h-5 w-5 text-primary" />;
  }
};

export const SourceAnalysis = ({ sources }: SourceAnalysisProps) => {
  const chartData = sources.map(source => ({
    category: source.category,
    citations: source.total_citations.Value,
    visibility: source.visibility
  }));

  const getBarColor = (visibility: string) => {
    switch (visibility.toLowerCase()) {
      case 'high':
        return 'hsl(var(--success))';
      case 'medium':
        return 'hsl(var(--warning))';
      case 'low':
        return 'hsl(var(--destructive))';
      default:
        return 'hsl(var(--primary))';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Source Analysis</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Citation Distribution by Source Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="category" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickFormatter={(value) => value.split(' ')[0]}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }} 
              />
              <Bar 
                dataKey="citations" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.visibility)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source, index) => (
          <Card key={index} className={`border-2 ${
            source.visibility.toLowerCase() === 'high' ? 'border-success shadow-success/20 shadow-lg' :
            source.visibility.toLowerCase() === 'medium' ? 'border-warning shadow-warning/20 shadow-lg' :
            source.visibility.toLowerCase() === 'low' ? 'border-destructive shadow-destructive/20 shadow-lg' :
            'border-border'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getCategoryIcon(source.category)}
                  {source.category}
                </CardTitle>
                <Badge className={getVisibilityColor(source.visibility)} variant="secondary">
                  {source.visibility}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{source.total_citations.Value}</div>
                <div className="text-sm text-muted-foreground">Total Citations</div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Key Sources</h4>
                <div className="flex flex-wrap gap-1">
                  {source.sources.map((src, srcIndex) => (
                    <Badge key={srcIndex} variant="outline" className="text-xs">
                      {src}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Models</h4>
                <div className="flex flex-wrap gap-1">
                  {source.cited_by_models.map((model, modelIndex) => (
                    <Badge key={modelIndex} variant="secondary" className="text-xs">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{source.notes}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};