
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, BarChart, Bar } from 'recharts';
import { Brain, TrendingUp, Lightbulb, AlertTriangle, Download, Target, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { AnalyticsEngine, PredictiveInsight, CorrelationResult, PatternInsight } from '../utils/analyticsEngine';
import { RecommendationEngine, PersonalizedRecommendation } from '../utils/recommendationEngine';
import { contentLibrary } from '../data/contentLibrary';

const AdvancedAnalytics: React.FC = () => {
  const { getCheckInHistory } = useApp();
  const checkInHistory = getCheckInHistory();
  const [selectedTab, setSelectedTab] = useState('insights');

  const analytics = useMemo(() => {
    if (checkInHistory.length < 7) return null;

    const correlations = AnalyticsEngine.analyzeCorrelations(checkInHistory);
    const predictions = AnalyticsEngine.generatePredictiveInsights(checkInHistory);
    const patterns = AnalyticsEngine.detectPatterns(checkInHistory);
    const recommendations = RecommendationEngine.generateRecommendations(
      checkInHistory,
      predictions,
      correlations,
      patterns,
      contentLibrary
    );

    return { correlations, predictions, patterns, recommendations };
  }, [checkInHistory]);

  const exportHealthReport = () => {
    if (!analytics) return;

    const report = {
      generatedAt: new Date().toISOString(),
      period: `${checkInHistory.length} days`,
      correlations: analytics.correlations,
      predictions: analytics.predictions,
      patterns: analytics.patterns,
      recommendations: analytics.recommendations.slice(0, 5)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (checkInHistory.length < 7) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Advanced Analytics Loading</h2>
            <p className="text-muted-foreground mb-6">
              Complete at least 7 daily check-ins to unlock advanced analytics, correlations, and predictive insights.
            </p>
            <div className="text-sm text-muted-foreground">
              Progress: {checkInHistory.length}/7 check-ins completed
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCorrelationColor = (correlation: number) => {
    const intensity = Math.abs(correlation);
    if (intensity > 0.7) return '#ef4444';
    if (intensity > 0.4) return '#f97316';
    return '#84cc16';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
            <p className="text-muted-foreground">
              AI-powered insights from {checkInHistory.length} days of data
            </p>
          </div>
          <Button onClick={exportHealthReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Predictive Insights
                  </CardTitle>
                  <CardDescription>
                    AI predictions based on your patterns and current trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.predictions.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.predictions.map((insight, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span className="font-medium capitalize">
                                {insight.type.replace('-', ' ')} Prediction
                              </span>
                            </div>
                            <Badge variant="outline">
                              {Math.round(insight.probability * 100)}% probability
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {insight.reasoning}
                          </p>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Recommendations:</div>
                            {insight.recommendations.map((rec, i) => (
                              <div key={i} className="text-sm text-muted-foreground ml-4">
                                • {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No specific predictions available. Continue tracking for more insights.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="correlations" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Correlation Analysis</CardTitle>
                  <CardDescription>
                    How different wellness metrics influence each other
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.correlations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="metric1" 
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis domain={[-1, 1]} />
                      <Tooltip 
                        formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, 'Correlation']}
                        labelFormatter={(label) => `${label} correlation`}
                      />
                      <Bar dataKey="correlation" fill="#8884d8">
                        {analytics.correlations.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getCorrelationColor(entry.correlation)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Correlation Insights</CardTitle>
                  <CardDescription>Key relationships in your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.correlations.map((corr, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {corr.metric1} ↔ {corr.metric2}
                          </span>
                          <Badge className={
                            corr.significance === 'high' ? 'bg-red-100 text-red-800' :
                            corr.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {corr.significance}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{corr.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Detected Patterns
                </CardTitle>
                <CardDescription>
                  Recurring patterns in your wellness journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.patterns.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.patterns.map((pattern, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{pattern.pattern}</h4>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              Strength: {Math.round(pattern.strength * 100)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Frequency: {pattern.frequency}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {pattern.description}
                        </p>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Suggested Actions:</div>
                          {pattern.actionItems.map((action, i) => (
                            <div key={i} className="text-sm text-muted-foreground ml-4">
                              • {action}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No significant patterns detected yet. Continue tracking for more insights.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>
                  AI-generated suggestions tailored to your patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recommendations.slice(0, 8).map((rec) => (
                    <div key={rec.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          <h4 className="font-medium">{rec.title}</h4>
                        </div>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3 italic">
                        Why: {rec.reasoning}
                      </p>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Action Steps:</div>
                        {rec.actionSteps.map((step, i) => (
                          <div key={i} className="text-sm text-muted-foreground ml-4">
                            {i + 1}. {step}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-between text-xs text-muted-foreground">
                        <span>Expected benefit: {rec.estimatedBenefit}</span>
                        <span>Timeframe: {rec.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
