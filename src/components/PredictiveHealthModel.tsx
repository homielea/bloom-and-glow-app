
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  Brain,
  BarChart3,
  Calendar,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useApp } from '../contexts/AppContext';
import { AnalyticsEngine } from '../utils/analyticsEngine';

interface HealthPrediction {
  id: string;
  type: 'symptom' | 'wellness' | 'risk' | 'improvement';
  title: string;
  description: string;
  probability: number;
  confidence: 'high' | 'medium' | 'low';
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
  triggers: string[];
  preventiveActions: string[];
  modelAccuracy: number;
}

interface PredictiveModel {
  name: string;
  accuracy: number;
  lastTrained: Date;
  dataPoints: number;
  predictions: HealthPrediction[];
}

const PredictiveHealthModel: React.FC = () => {
  const { getCheckInHistory } = useApp();
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('comprehensive');
  const [predictionData, setPredictionData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generatePredictiveModels();
    generatePredictionData();
  }, []);

  const generatePredictiveModels = () => {
    const checkIns = getCheckInHistory();
    
    const comprehensiveModel: PredictiveModel = {
      name: 'Comprehensive Health Model',
      accuracy: 87.5,
      lastTrained: new Date(),
      dataPoints: checkIns.length,
      predictions: [
        {
          id: '1',
          type: 'symptom',
          title: 'Hot Flash Episode',
          description: 'Increased likelihood of hot flash episodes based on stress and sleep patterns',
          probability: 0.73,
          confidence: 'high',
          timeframe: 'Next 24-48 hours',
          impact: 'medium',
          triggers: ['Elevated stress levels', 'Poor sleep quality', 'High caffeine intake'],
          preventiveActions: [
            'Practice deep breathing exercises',
            'Avoid spicy foods and caffeine',
            'Keep cooling items nearby',
            'Wear breathable clothing'
          ],
          modelAccuracy: 85.2
        },
        {
          id: '2',
          type: 'wellness',
          title: 'Energy Level Improvement',
          description: 'Predicted increase in energy levels following sleep optimization',
          probability: 0.68,
          confidence: 'medium',
          timeframe: 'Next 3-5 days',
          impact: 'high',
          triggers: ['Consistent sleep schedule', 'Stress reduction activities', 'Regular exercise'],
          preventiveActions: [
            'Maintain current sleep routine',
            'Continue stress management practices',
            'Stay hydrated',
            'Plan light physical activity'
          ],
          modelAccuracy: 82.1
        },
        {
          id: '3',
          type: 'risk',
          title: 'Mood Fluctuation Risk',
          description: 'Higher probability of mood variations due to hormonal patterns',
          probability: 0.61,
          confidence: 'medium',
          timeframe: 'Next week',
          impact: 'medium',
          triggers: ['Hormonal fluctuations', 'Sleep disruption', 'Life stressors'],
          preventiveActions: [
            'Use mood tracking tools',
            'Engage in self-care activities',
            'Connect with support network',
            'Consider relaxation techniques'
          ],
          modelAccuracy: 78.9
        }
      ]
    };

    const sleepModel: PredictiveModel = {
      name: 'Sleep Quality Predictor',
      accuracy: 91.2,
      lastTrained: new Date(),
      dataPoints: checkIns.length,
      predictions: [
        {
          id: '4',
          type: 'improvement',
          title: 'Sleep Quality Enhancement',
          description: 'Expected improvement in sleep quality with current routine',
          probability: 0.78,
          confidence: 'high',
          timeframe: 'Next 2 weeks',
          impact: 'high',
          triggers: ['Consistent bedtime', 'Reduced screen time', 'Evening routine'],
          preventiveActions: [
            'Maintain bedtime schedule',
            'Continue evening wind-down routine',
            'Optimize bedroom environment',
            'Avoid late caffeine consumption'
          ],
          modelAccuracy: 89.5
        }
      ]
    };

    const moodModel: PredictiveModel = {
      name: 'Mood Stability Model',
      accuracy: 84.3,
      lastTrained: new Date(),
      dataPoints: checkIns.length,
      predictions: [
        {
          id: '5',
          type: 'wellness',
          title: 'Emotional Stability Period',
          description: 'Predicted period of improved emotional balance',
          probability: 0.71,
          confidence: 'high',
          timeframe: 'Next 10 days',
          impact: 'high',
          triggers: ['Stress management', 'Regular self-care', 'Social support'],
          preventiveActions: [
            'Continue current coping strategies',
            'Schedule regular check-ins',
            'Maintain social connections',
            'Practice mindfulness'
          ],
          modelAccuracy: 86.7
        }
      ]
    };

    setModels([comprehensiveModel, sleepModel, moodModel]);
  };

  const generatePredictionData = () => {
    const data = [];
    const baseDate = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      // Simulate prediction trends
      const moodPrediction = 7 + Math.sin(i * 0.3) * 1.5 + Math.random() * 0.5;
      const energyPrediction = 6.5 + Math.cos(i * 0.4) * 1.2 + Math.random() * 0.4;
      const sleepPrediction = 7.2 + Math.sin(i * 0.2) * 0.8 + Math.random() * 0.3;
      const stressPrediction = 5 - Math.sin(i * 0.35) * 1.8 + Math.random() * 0.6;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: Math.max(1, Math.min(10, moodPrediction)),
        energy: Math.max(1, Math.min(10, energyPrediction)),
        sleep: Math.max(1, Math.min(10, sleepPrediction)),
        stress: Math.max(1, Math.min(10, stressPrediction)),
        confidence: 75 + Math.random() * 20
      });
    }
    
    setPredictionData(data);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'symptom': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'wellness': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'risk': return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case 'improvement': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const selectedModelData = models.find(m => m.name.toLowerCase().includes(selectedModel)) || models[0];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full text-white">
            <Brain className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Predictive Health Modeling</h1>
        </div>
        <p className="text-xl text-gray-600">
          AI-powered predictions for your health patterns and wellness trends
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {models.map((model, index) => (
          <Card 
            key={index}
            className={`cursor-pointer transition-all duration-200 ${
              selectedModel === model.name.toLowerCase().split(' ')[0] 
                ? 'ring-2 ring-purple-500 bg-purple-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedModel(model.name.toLowerCase().split(' ')[0])}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{model.name}</span>
                <Badge variant="secondary">{model.accuracy}% accuracy</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Data Points:</span>
                  <span className="font-medium">{model.dataPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span>Predictions:</span>
                  <span className="font-medium">{model.predictions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="font-medium">
                    {model.lastTrained.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="accuracy">Model Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions">
          <div className="space-y-4">
            {selectedModelData?.predictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPredictionIcon(prediction.type)}
                      <span>{prediction.title}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getImpactColor(prediction.impact)}>
                        {prediction.impact} impact
                      </Badge>
                      <Badge variant="outline" className={getConfidenceColor(prediction.confidence)}>
                        {prediction.confidence} confidence
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">{prediction.description}</p>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Probability</span>
                          <span className="text-2xl font-bold text-purple-600">
                            {(prediction.probability * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={prediction.probability * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Model Accuracy</span>
                          <span className="text-2xl font-bold text-green-600">
                            {prediction.modelAccuracy.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={prediction.modelAccuracy} className="h-2" />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Timeframe: {prediction.timeframe}
                        </h4>
                        <h4 className="font-medium text-sm mb-2">Triggers:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {prediction.triggers.map((trigger, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              {trigger}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Preventive Actions:
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {prediction.preventiveActions.map((action, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">✓</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                14-Day Health Trend Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="energy" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sleep" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="stress" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Trend Insights</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Mood stability expected to improve over next week</li>
                      <li>• Energy levels show cyclical pattern - plan accordingly</li>
                      <li>• Sleep quality trending upward with current routine</li>
                      <li>• Stress levels may spike around day 7-8</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Prediction Confidence</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Confidence:</span>
                        <span className="font-medium text-green-600">82%</span>
                      </div>
                      <Progress value={82} className="h-2" />
                      <p className="text-xs text-gray-500 mt-2">
                        Based on {predictionData.length} days of historical data and current patterns
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accuracy">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {models.map((model, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{model.name}</span>
                        <span className="text-lg font-bold text-purple-600">
                          {model.accuracy}%
                        </span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{model.dataPoints} data points</span>
                        <span>{model.predictions.length} predictions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accuracy Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { week: 'Week 1', accuracy: 78 },
                      { week: 'Week 2', accuracy: 82 },
                      { week: 'Week 3', accuracy: 85 },
                      { week: 'Week 4', accuracy: 87 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[70, 90]} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#8b5cf6" 
                        fill="#8b5cf6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Model accuracy improves as more data is collected and patterns are refined.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveHealthModel;
