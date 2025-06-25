
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Zap, TrendingUp, Calendar } from 'lucide-react';
import { PredictiveInsight } from '../utils/analyticsEngine';

interface PredictiveInsightsCardProps {
  insights: PredictiveInsight[];
  onViewDetails: () => void;
}

const PredictiveInsightsCard: React.FC<PredictiveInsightsCardProps> = ({ 
  insights, 
  onViewDetails 
}) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'hot-flash': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'energy-dip': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'sleep-quality': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'stress-spike': return <TrendingUp className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Predictive Insights
          </CardTitle>
          <CardDescription>
            AI predictions for your wellness patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              Continue tracking to unlock predictive insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const highPriorityInsights = insights.filter(i => i.confidence === 'high').slice(0, 2);
  const displayInsights = highPriorityInsights.length > 0 ? highPriorityInsights : insights.slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Predictive Insights
        </CardTitle>
        <CardDescription>
          AI predictions for the next 24-48 hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayInsights.map((insight, index) => (
          <div key={index} className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.type)}
                <span className="text-sm font-medium capitalize">
                  {insight.type.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getConfidenceColor(insight.confidence)}>
                  {insight.confidence}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round(insight.probability * 100)}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {insight.reasoning}
            </p>
            <div className="text-xs">
              <span className="font-medium">Top recommendation: </span>
              <span className="text-muted-foreground">
                {insight.recommendations[0]}
              </span>
            </div>
          </div>
        ))}
        
        {insights.length > 2 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewDetails}
            className="w-full"
          >
            View All Insights ({insights.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictiveInsightsCard;
