
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Lightbulb, 
  Target, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  Star, 
  Filter,
  Search,
  Calendar,
  Bell,
  Heart,
  Brain,
  Zap,
  Shield,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../contexts/AppContext';
import { RecommendationEngine, PersonalizedRecommendation } from '../utils/recommendationEngine';
import { AnalyticsEngine } from '../utils/analyticsEngine';

interface RecommendationFilter {
  type: string[];
  priority: string[];
  category: string[];
}

interface RecommendationFeedback {
  recommendationId: string;
  rating: number;
  helpful: boolean;
  followed: boolean;
  notes: string;
}

const SmartRecommendationEngine: React.FC = () => {
  const { user, getCheckInHistory, getContentLibrary } = useApp();
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [filters, setFilters] = useState<RecommendationFilter>({
    type: [],
    priority: [],
    category: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<PersonalizedRecommendation | null>(null);
  const [feedback, setFeedback] = useState<{ [key: string]: RecommendationFeedback }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recommendations, filters, searchTerm, showCompleted]);

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const checkIns = getCheckInHistory();
      const contentLibrary = getContentLibrary();
      
      if (checkIns.length === 0) {
        setRecommendations([]);
        return;
      }

      const insights = AnalyticsEngine.generatePredictiveInsights(checkIns);
      const correlations = AnalyticsEngine.analyzeCorrelations(checkIns);
      const patterns = AnalyticsEngine.detectPatterns(checkIns);
      
      const generatedRecommendations = RecommendationEngine.generateRecommendations(
        checkIns,
        insights,
        correlations,
        patterns,
        contentLibrary
      );

      // Add some additional smart recommendations
      const enhancedRecommendations = [
        ...generatedRecommendations,
        ...generateContextualRecommendations(checkIns, insights, patterns)
      ];

      setRecommendations(enhancedRecommendations);
    } catch (error) {
      toast.error('Failed to generate recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const generateContextualRecommendations = (checkIns: any[], insights: any[], patterns: any[]): PersonalizedRecommendation[] => {
    const contextualRecs: PersonalizedRecommendation[] = [];
    
    // Time-based recommendations
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      contextualRecs.push({
        id: 'morning-routine',
        type: 'lifestyle',
        priority: 'medium',
        title: 'Optimize Your Morning Routine',
        description: 'Start your day with intention to support better menopause symptoms management',
        reasoning: 'Morning routines set the tone for hormone regulation throughout the day',
        actionSteps: [
          'Drink a glass of water upon waking',
          'Practice 5 minutes of deep breathing',
          'Eat a protein-rich breakfast',
          'Take morning supplements if prescribed'
        ],
        estimatedBenefit: 'Improved energy and mood stability',
        timeframe: 'Start today, benefits within 1 week'
      });
    }

    // Weather-based recommendations (simulated)
    contextualRecs.push({
      id: 'seasonal-adjustment',
      type: 'lifestyle',
      priority: 'low',
      title: 'Seasonal Wellness Adjustment',
      description: 'Adapt your routine for current seasonal changes affecting menopause symptoms',
      reasoning: 'Seasonal changes can impact hormone fluctuations and symptom severity',
      actionSteps: [
        'Adjust room temperature for comfort',
        'Modify clothing layers strategy',
        'Consider light therapy if needed',
        'Update hydration goals for season'
      ],
      estimatedBenefit: 'Better adaptation to seasonal symptom changes',
      timeframe: 'Implement over next few days'
    });

    // Social recommendations
    contextualRecs.push({
      id: 'social-connection',
      type: 'lifestyle',
      priority: 'medium',
      title: 'Strengthen Social Connections',
      description: 'Maintain supportive relationships that positively impact mental health during menopause',
      reasoning: 'Social support is crucial for managing menopause-related mood changes',
      actionSteps: [
        'Schedule regular check-ins with friends/family',
        'Join a menopause support group',
        'Plan social activities you enjoy',
        'Share your experience with trusted individuals'
      ],
      estimatedBenefit: 'Improved emotional well-being and reduced isolation',
      timeframe: 'Start this week, ongoing benefits'
    });

    return contextualRecs;
  };

  const applyFilters = () => {
    let filtered = recommendations.filter(rec => {
      // Apply type filter
      if (filters.type.length > 0 && !filters.type.includes(rec.type)) {
        return false;
      }
      
      // Apply priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(rec.priority)) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm && !rec.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !rec.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply completion filter
      const isCompleted = feedback[rec.id]?.followed || false;
      if (!showCompleted && isCompleted) {
        return false;
      }
      
      return true;
    });

    setFilteredRecommendations(filtered);
  };

  const handleFilterChange = (filterType: keyof RecommendationFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const handleFeedback = (recommendationId: string, feedbackData: Partial<RecommendationFeedback>) => {
    setFeedback(prev => ({
      ...prev,
      [recommendationId]: {
        ...prev[recommendationId],
        recommendationId,
        ...feedbackData
      } as RecommendationFeedback
    }));
    
    if (feedbackData.followed) {
      toast.success('Great job following through on this recommendation!');
    }
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lifestyle': return <Heart className="w-4 h-4" />;
      case 'medical': return <Shield className="w-4 h-4" />;
      case 'content': return <Brain className="w-4 h-4" />;
      case 'intervention': return <Zap className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const renderRecommendationCard = (rec: PersonalizedRecommendation) => {
    const recFeedback = feedback[rec.id];
    const isCompleted = recFeedback?.followed || false;
    
    return (
      <Card key={rec.id} className={`transition-all duration-200 hover:shadow-md ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTypeIcon(rec.type)}
              <span className={isCompleted ? 'line-through text-gray-500' : ''}>{rec.title}</span>
            </div>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(rec.priority)}>
                {rec.priority}
              </Badge>
              <Badge variant="secondary">{rec.type}</Badge>
              {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">{rec.description}</p>
            
            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
              <strong>Why this helps:</strong> {rec.reasoning}
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Action Steps:</h4>
              <ul className="space-y-1">
                {rec.actionSteps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex items-start gap-2 text-sm">
                    <span className="bg-purple-100 text-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                      {stepIndex + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm p-3 bg-gray-50 rounded">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Expected Outcome:</span>
                </div>
                <p className="text-green-600">{rec.estimatedBenefit}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Timeline:</span>
                </div>
                <p className="text-blue-600">{rec.timeframe}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant={isCompleted ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFeedback(rec.id, { followed: !isCompleted })}
                >
                  {isCompleted ? 'Completed' : 'Mark Complete'}
                </Button>
                
                {recFeedback?.rating && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= recFeedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRecommendation(rec)}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white">
            <Lightbulb className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Smart Recommendation Engine</h1>
        </div>
        <p className="text-xl text-gray-600">
          Personalized, AI-powered recommendations for your menopause journey
        </p>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">My Recommendations</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="settings">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search recommendations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateRecommendations()}
                      disabled={isLoading}
                    >
                      Refresh
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={showCompleted}
                        onCheckedChange={setShowCompleted}
                      />
                      <span className="text-sm">Show completed</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-4 flex-wrap">
                  <div className="flex gap-2">
                    <span className="text-sm font-medium">Priority:</span>
                    {['high', 'medium', 'low'].map(priority => (
                      <Badge
                        key={priority}
                        variant={filters.priority.includes(priority) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleFilterChange('priority', priority)}
                      >
                        {priority}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <span className="text-sm font-medium">Type:</span>
                    {['lifestyle', 'medical', 'content', 'intervention'].map(type => (
                      <Badge
                        key={type}
                        variant={filters.type.includes(type) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleFilterChange('type', type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating personalized recommendations...</p>
              </div>
            ) : filteredRecommendations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No recommendations found</h3>
                  <p className="text-gray-500">Try adjusting your filters or check back after more health data is collected.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredRecommendations.map(renderRecommendationCard)}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Completion Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Recommendations:</span>
                    <span className="font-bold text-2xl">{recommendations.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completed:</span>
                    <span className="font-bold text-2xl text-green-600">
                      {Object.values(feedback).filter(f => f.followed).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Success Rate:</span>
                    <span className="font-bold text-2xl text-blue-600">
                      {recommendations.length > 0 
                        ? Math.round((Object.values(feedback).filter(f => f.followed).length / recommendations.length) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.values(feedback)
                    .filter(f => f.followed)
                    .slice(-5)
                    .map((f, index) => {
                      const rec = recommendations.find(r => r.id === f.recommendationId);
                      return (
                        <div key={index} className="flex items-center gap-3 p-2 bg-green-50 rounded">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{rec?.title || 'Unknown recommendation'}</span>
                        </div>
                      );
                    })}
                  {Object.values(feedback).filter(f => f.followed).length === 0 && (
                    <p className="text-gray-500 text-sm">No completed recommendations yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Recommendation Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Notification Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">Daily Recommendations</span>
                        <p className="text-sm text-gray-600">Get new recommendations daily</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">Urgent Alerts</span>
                        <p className="text-sm text-gray-600">Immediate notifications for high-priority recommendations</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Recommendation Focus</h3>
                  <div className="grid gap-2">
                    {['Symptom Management', 'Lifestyle Optimization', 'Preventive Care', 'Mental Health'].map(focus => (
                      <div key={focus} className="flex items-center justify-between">
                        <span>{focus}</span>
                        <Switch />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Personalization Level</h3>
                  <p className="text-sm text-gray-600 mb-3">How specific should recommendations be to your situation?</p>
                  <div className="flex gap-2">
                    {['General', 'Moderate', 'Highly Specific'].map(level => (
                      <Badge key={level} variant="outline" className="cursor-pointer">
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartRecommendationEngine;
