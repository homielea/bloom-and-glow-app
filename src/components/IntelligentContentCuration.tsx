
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Play, CheckCircle, Clock, Star, TrendingUp, Brain } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ContentItem } from '../types';
import { toast } from 'sonner';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  progress: number;
  content: ContentItem[];
  prerequisites?: string[];
  learningOutcomes: string[];
}

interface ContentRecommendation {
  item: ContentItem;
  score: number;
  reason: string;
  urgency: 'high' | 'medium' | 'low';
}

const IntelligentContentCuration: React.FC = () => {
  const { getCheckInHistory, user } = useApp();
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
  const [contentProgress, setContentProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateIntelligentRecommendations();
    loadLearningModules();
  }, []);

  const generateIntelligentRecommendations = () => {
    const checkIns = getCheckInHistory();
    const recentCheckIns = checkIns.slice(-7);
    
    if (recentCheckIns.length === 0) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    // Analyze user patterns
    const avgMood = recentCheckIns.reduce((sum, c) => sum + c.mood, 0) / recentCheckIns.length;
    const avgEnergy = recentCheckIns.reduce((sum, c) => sum + c.energy, 0) / recentCheckIns.length;
    const avgSleep = recentCheckIns.reduce((sum, c) => sum + c.sleep, 0) / recentCheckIns.length;
    const avgStress = recentCheckIns.reduce((sum, c) => sum + c.stress, 0) / recentCheckIns.length;

    // Generate AI-powered recommendations
    const mockRecommendations: ContentRecommendation[] = [];

    if (avgMood < 5) {
      mockRecommendations.push({
        item: {
          id: 'mood-boost-guide',
          title: 'Natural Mood Enhancement Strategies',
          category: 'Emotional Confidence',
          type: 'article',
          duration: '8 min read',
          description: 'Evidence-based techniques to naturally improve mood during menopause',
          content: 'Comprehensive guide to mood enhancement...',
          tags: ['mood', 'natural-remedies', 'evidence-based'],
          unlockedBy: ['Explorer', 'Phoenix']
        },
        score: 0.95,
        reason: 'Your recent mood scores suggest this content could provide immediate relief',
        urgency: 'high'
      });
    }

    if (avgEnergy < 5) {
      mockRecommendations.push({
        item: {
          id: 'energy-optimization',
          title: 'Energy Restoration Protocol',
          category: 'Symptoms',
          type: 'audio',
          duration: '12 min',
          description: 'Guided practice to restore natural energy levels',
          content: 'Audio guide for energy restoration...',
          tags: ['energy', 'restoration', 'guided-practice'],
          unlockedBy: ['Warrior', 'Phoenix']
        },
        score: 0.88,
        reason: 'Based on your energy patterns, this practice could help restore vitality',
        urgency: 'medium'
      });
    }

    if (avgSleep < 6) {
      mockRecommendations.push({
        item: {
          id: 'sleep-optimization',
          title: 'Sleep Architecture & Menopause',
          category: 'Symptoms',
          type: 'article',
          duration: '10 min read',
          description: 'Understanding and optimizing sleep during hormonal transitions',
          content: 'Detailed guide to sleep optimization...',
          tags: ['sleep', 'optimization', 'science-based'],
          unlockedBy: ['Explorer', 'Warrior']
        },
        score: 0.92,
        reason: 'Poor sleep quality detected - this could significantly improve your rest',
        urgency: 'high'
      });
    }

    setRecommendations(mockRecommendations);
    setLoading(false);
  };

  const loadLearningModules = () => {
    const mockModules: LearningModule[] = [
      {
        id: 'hormones-101',
        title: 'Understanding Hormonal Changes',
        description: 'A comprehensive introduction to how hormones change during menopause',
        difficulty: 'beginner',
        estimatedTime: '45 minutes',
        progress: 60,
        content: [],
        learningOutcomes: [
          'Understand the hormonal transition process',
          'Recognize symptoms and their causes',
          'Learn when to seek medical support'
        ]
      },
      {
        id: 'nutrition-mastery',
        title: 'Nutrition for Hormonal Balance',
        description: 'Advanced nutritional strategies for optimal health during menopause',
        difficulty: 'intermediate',
        estimatedTime: '2 hours',
        progress: 25,
        content: [],
        prerequisites: ['hormones-101'],
        learningOutcomes: [
          'Master hormone-supporting nutrition',
          'Create personalized meal plans',
          'Understand supplement needs'
        ]
      },
      {
        id: 'advanced-symptom-management',
        title: 'Advanced Symptom Management',
        description: 'Sophisticated approaches to managing complex menopause symptoms',
        difficulty: 'advanced',
        estimatedTime: '3 hours',
        progress: 0,
        content: [],
        prerequisites: ['hormones-101', 'nutrition-mastery'],
        learningOutcomes: [
          'Implement advanced management strategies',
          'Integrate multiple treatment approaches',
          'Optimize quality of life outcomes'
        ]
      }
    ];

    setLearningModules(mockModules);
  };

  const startContent = (item: ContentItem) => {
    setCurrentContent(item);
    toast.success(`Started: ${item.title}`);
  };

  const markContentComplete = (contentId: string) => {
    setContentProgress(prev => ({ ...prev, [contentId]: 100 }));
    toast.success('Content completed! Great job!');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <Brain className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
            <h2 className="text-xl font-semibold mb-2">Analyzing Your Learning Needs</h2>
            <p className="text-gray-600">AI is personalizing your content recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gradient-to-r from-purple-400 to-indigo-400 text-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl">Intelligent Learning Hub</CardTitle>
                <CardDescription className="text-white/90">
                  AI-powered content recommendations tailored to your current needs
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
            <TabsTrigger value="modules">Learning Modules</TabsTrigger>
            <TabsTrigger value="progress">Progress & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <Card key={rec.item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-5 h-5 text-purple-500" />
                            <CardTitle className="text-lg">{rec.item.title}</CardTitle>
                            <Badge className={getUrgencyColor(rec.urgency)}>
                              {rec.urgency} priority
                            </Badge>
                          </div>
                          <CardDescription>{rec.item.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{Math.round(rec.score * 100)}%</span>
                          </div>
                          <Badge variant="outline">{rec.item.duration}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">AI Insight:</span> {rec.reason}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => startContent(rec.item)}
                            className="bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Learning
                          </Button>
                          <Button variant="outline">
                            Save for Later
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Getting to Know You</h3>
                    <p className="text-gray-600 mb-4">
                      Complete a few daily check-ins so our AI can provide personalized recommendations
                    </p>
                    <Button className="bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500">
                      Complete Today's Check-In
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <div className="grid gap-4">
              {learningModules.map((module) => (
                <Card key={module.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <Badge className={getDifficultyColor(module.difficulty)}>
                            {module.difficulty}
                          </Badge>
                        </div>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">{module.estimatedTime}</div>
                        <div className="text-sm font-medium">{module.progress}% complete</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={module.progress} className="w-full" />
                      
                      {module.prerequisites && (
                        <div>
                          <p className="text-sm font-medium mb-2">Prerequisites:</p>
                          <div className="flex gap-2">
                            {module.prerequisites.map((prereq) => (
                              <Badge key={prereq} variant="outline">{prereq}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium mb-2">Learning Outcomes:</p>
                        <ul className="text-sm space-y-1">
                          {module.learningOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <Button className="bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500">
                          {module.progress > 0 ? 'Continue' : 'Start'} Module
                        </Button>
                        <Button variant="outline">
                          <Clock className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Learning Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Content Completed</span>
                      <span className="font-medium">12 items</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Time Invested</span>
                      <span className="font-medium">4.5 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Engagement Score</span>
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Adaptive Difficulty</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Based on your engagement and comprehension, we've optimized your content difficulty level.
                    </p>
                    <Badge className="bg-blue-100 text-blue-800">
                      Current Level: Intermediate
                    </Badge>
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

export default IntelligentContentCuration;
