
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  Mic, 
  Send, 
  Bot, 
  User,
  AlertTriangle,
  Heart,
  Activity,
  Moon
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../contexts/AppContext';
import { AnalyticsEngine } from '../utils/analyticsEngine';
import { RecommendationEngine } from '../utils/recommendationEngine';
import VoiceInput from './VoiceInput';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  predictions?: HealthPrediction[];
  recommendations?: SmartRecommendation[];
}

interface HealthPrediction {
  type: 'symptom' | 'trend' | 'risk';
  title: string;
  probability: number;
  timeframe: string;
  confidence: 'high' | 'medium' | 'low';
  factors: string[];
  recommendations: string[];
}

interface SmartRecommendation {
  id: string;
  category: 'lifestyle' | 'medical' | 'wellness' | 'preventive';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actions: string[];
  expectedOutcome: string;
  timeline: string;
}

const AIHealthAssistant: React.FC = () => {
  const { user, getCheckInHistory, getContentLibrary } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [healthPredictions, setHealthPredictions] = useState<HealthPrediction[]>([]);
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message and generate initial predictions
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI Health Assistant. I can help you understand your health patterns, predict potential issues, and provide personalized recommendations. How can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "Analyze my recent symptoms",
        "What health trends should I watch?",
        "Give me personalized recommendations",
        "Help me prepare for my next appointment"
      ]
    };

    setMessages([welcomeMessage]);
    generateInitialPredictions();
    generateSmartRecommendations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateInitialPredictions = async () => {
    try {
      const checkIns = getCheckInHistory();
      if (checkIns.length === 0) return;

      const insights = AnalyticsEngine.generatePredictiveInsights(checkIns);
      const patterns = AnalyticsEngine.detectPatterns(checkIns);
      
      const predictions: HealthPrediction[] = [
        ...insights.map(insight => ({
          type: 'symptom' as const,
          title: `${insight.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Prediction`,
          probability: insight.probability,
          timeframe: `Next ${insight.date === new Date().toISOString().split('T')[0] ? '24 hours' : '2-3 days'}`,
          confidence: insight.confidence,
          factors: [insight.reasoning],
          recommendations: insight.recommendations
        })),
        ...patterns.map(pattern => ({
          type: 'trend' as const,
          title: pattern.pattern,
          probability: pattern.strength,
          timeframe: `${pattern.frequency} day cycle`,
          confidence: pattern.strength > 0.7 ? 'high' as const : pattern.strength > 0.4 ? 'medium' as const : 'low' as const,
          factors: [pattern.description],
          recommendations: pattern.actionItems
        }))
      ];

      setHealthPredictions(predictions);
    } catch (error) {
      // Error generating predictions - continue without predictions
    }
  };

  const generateSmartRecommendations = async () => {
    try {
      const checkIns = getCheckInHistory();
      const contentLibrary = getContentLibrary();
      
      if (checkIns.length === 0) return;

      const insights = AnalyticsEngine.generatePredictiveInsights(checkIns);
      const correlations = AnalyticsEngine.analyzeCorrelations(checkIns);
      const patterns = AnalyticsEngine.detectPatterns(checkIns);
      
      const recommendations = RecommendationEngine.generateRecommendations(
        checkIns,
        insights,
        correlations,
        patterns,
        contentLibrary
      );

      const smartRecs: SmartRecommendation[] = recommendations.map(rec => ({
        id: rec.id,
        category: rec.type === 'content' ? 'wellness' : 
                 rec.type === 'medical' ? 'medical' : 
                 rec.type === 'intervention' ? 'preventive' : 'lifestyle',
        priority: rec.priority === 'high' ? 'high' :
                 rec.priority === 'medium' ? 'medium' : 'low',
        title: rec.title,
        description: rec.description,
        actions: rec.actionSteps,
        expectedOutcome: rec.estimatedBenefit,
        timeline: rec.timeframe
      }));

      setSmartRecommendations(smartRecs);
    } catch (error) {
      // Error generating recommendations - continue without recommendations
    }
  };

  const processUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate AI processing with health context
      const response = await generateAIResponse(text);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
        predictions: response.predictions,
        recommendations: response.recommendations
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Sorry, I encountered an error processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<{
    content: string;
    suggestions?: string[];
    predictions?: HealthPrediction[];
    recommendations?: SmartRecommendation[];
  }> => {
    const checkIns = getCheckInHistory();
    const lowerInput = userInput.toLowerCase();
    
    // Health pattern analysis
    if (lowerInput.includes('analyze') || lowerInput.includes('pattern') || lowerInput.includes('trend')) {
      const correlations = AnalyticsEngine.analyzeCorrelations(checkIns);
      const patterns = AnalyticsEngine.detectPatterns(checkIns);
      
      return {
        content: `Based on your health data analysis:\n\n${correlations.map(c => 
          `• ${c.metric1} and ${c.metric2} show ${c.significance} correlation (${(c.correlation * 100).toFixed(1)}%): ${c.description}`
        ).join('\n')}\n\n${patterns.map(p => 
          `• ${p.pattern}: ${p.description}`
        ).join('\n')}`,
        suggestions: [
          "What should I do about these patterns?",
          "Predict my symptoms for tomorrow",
          "Give me specific recommendations"
        ]
      };
    }

    // Symptom prediction
    if (lowerInput.includes('predict') || lowerInput.includes('tomorrow') || lowerInput.includes('expect')) {
      const insights = AnalyticsEngine.generatePredictiveInsights(checkIns);
      
      return {
        content: "Based on your recent patterns, here are my health predictions:",
        predictions: insights.map(insight => ({
          type: 'symptom' as const,
          title: `${insight.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Risk`,
          probability: insight.probability,
          timeframe: insight.date === new Date().toISOString().split('T')[0] ? 'Next 24 hours' : 'Next 2-3 days',
          confidence: insight.confidence,
          factors: [insight.reasoning],
          recommendations: insight.recommendations
        })),
        suggestions: [
          "How can I prevent these symptoms?",
          "What lifestyle changes should I make?",
          "Should I see a doctor?"
        ]
      };
    }

    // Recommendations request
    if (lowerInput.includes('recommend') || lowerInput.includes('advice') || lowerInput.includes('help')) {
      return {
        content: "Here are my personalized health recommendations based on your data:",
        recommendations: smartRecommendations.slice(0, 3),
        suggestions: [
          "Explain these recommendations",
          "How effective will these be?",
          "What's most important to focus on?"
        ]
      };
    }

    // Default response with health insights
    const recent = checkIns.slice(-7);
    const avgMood = recent.reduce((sum, c) => sum + c.mood, 0) / recent.length;
    const avgEnergy = recent.reduce((sum, c) => sum + c.energy, 0) / recent.length;
    
    return {
      content: `I understand you're asking about: "${userInput}"\n\nBased on your recent data (last 7 days):\n• Average mood: ${avgMood.toFixed(1)}/10\n• Average energy: ${avgEnergy.toFixed(1)}/10\n\nHow can I help you improve these areas?`,
      suggestions: [
        "Analyze my symptom patterns",
        "Predict upcoming health changes",
        "Give me actionable recommendations",
        "Help me understand my data"
      ]
    };
  };

  const handleSend = () => {
    processUserMessage(inputText);
    setInputText('');
  };

  const handleVoiceTranscript = (text: string) => {
    setInputText(text);
  };

  const handleVoiceComplete = (finalText: string) => {
    setInputText(finalText);
    setIsListening(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    processUserMessage(suggestion);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
              <Brain className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">AI Health Assistant</h1>
          </div>
          <p className="text-xl text-gray-600">
            Natural language health insights, predictive modeling, and smart recommendations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat Assistant
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Health Predictions
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Smart Recommendations
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Conversational Health Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 mb-4 p-4 border rounded-lg">
                  {messages.map((message) => (
                    <div key={message.id} className="mb-4">
                      <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                          }`}>
                            {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>
                          <div className={`p-3 rounded-lg ${
                            message.type === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="whitespace-pre-line">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {message.suggestions && (
                        <div className="mt-2 flex flex-wrap gap-2 justify-start">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}

                      {message.predictions && (
                        <div className="mt-3 space-y-2">
                          {message.predictions.map((prediction, index) => (
                            <div key={index} className="p-3 border rounded-lg bg-yellow-50">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  {prediction.title}
                                </Badge>
                                <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                                  {(prediction.probability * 100).toFixed(0)}% probability
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{prediction.timeframe}</p>
                              <ul className="text-xs text-gray-500 space-y-1">
                                {prediction.recommendations.map((rec, recIndex) => (
                                  <li key={recIndex}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}

                      {message.recommendations && (
                        <div className="mt-3 space-y-2">
                          {message.recommendations.map((rec) => (
                            <div key={rec.id} className="p-3 border rounded-lg bg-green-50">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">{rec.title}</h4>
                                <Badge className={getPriorityColor(rec.priority)}>
                                  {rec.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                              <p className="text-xs text-green-600">Expected: {rec.expectedOutcome}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="flex gap-2 items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ask about your health patterns, get predictions, or request recommendations..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      className="min-h-[40px]"
                    />
                  </div>
                  <VoiceInput
                    onTranscript={handleVoiceTranscript}
                    onComplete={handleVoiceComplete}
                    className="flex-shrink-0"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={!inputText.trim() || isLoading}
                    className="h-10"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions">
            <div className="grid gap-6 md:grid-cols-2">
              {healthPredictions.map((prediction, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {prediction.title}
                      </span>
                      <Badge className={getConfidenceColor(prediction.confidence)}>
                        {prediction.confidence} confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-purple-600">
                          {(prediction.probability * 100).toFixed(0)}%
                        </span>
                        <span className="text-sm text-gray-600">{prediction.timeframe}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${prediction.probability * 100}%` }}
                        ></div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Contributing Factors:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {prediction.factors.map((factor, factorIndex) => (
                            <li key={factorIndex} className="flex items-start gap-2">
                              <span className="text-purple-500 mt-1">•</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {prediction.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">✓</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-4">
              {smartRecommendations.map((rec) => (
                <Card key={rec.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        {rec.title}
                      </span>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{rec.category}</Badge>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">{rec.description}</p>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Action Steps:</h4>
                        <ul className="space-y-2">
                          {rec.actions.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-start gap-2 text-sm">
                              <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                                {actionIndex + 1}
                              </span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Expected Outcome:</span>
                          <p className="text-green-600 mt-1">{rec.expectedOutcome}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Timeline:</span>
                          <p className="text-blue-600 mt-1">{rec.timeline}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500 mb-2">8.2/10</div>
                    <p className="text-sm text-gray-600">Based on recent patterns</p>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Mood Stability</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energy Levels</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sleep Quality</span>
                        <span className="font-medium">72%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Stress Level</span>
                      <Badge variant="destructive">High</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sleep Debt</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Energy Dips</span>
                      <Badge className="bg-green-100 text-green-800">Low</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-blue-500" />
                    Next Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">1</span>
                      <span>Focus on stress management today</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">2</span>
                      <span>Improve sleep routine this week</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">3</span>
                      <span>Schedule check-up if patterns persist</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIHealthAssistant;
