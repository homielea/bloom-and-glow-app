
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PredictiveInsightsCard from './PredictiveInsightsCard';
import { 
  Calendar, 
  BarChart3, 
  BookOpen, 
  Heart, 
  TrendingUp, 
  Users, 
  Brain,
  Stethoscope,
  Activity,
  Lightbulb,
  Zap,
  Shield,
  MessageSquare,
  Clock,
  Target
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, getCheckInHistory } = useApp();
  const [todayCheckIn, setTodayCheckIn] = useState<any>(null);
  const [recentStats, setRecentStats] = useState({
    avgMood: 0,
    avgEnergy: 0,
    avgSleep: 0,
    streakDays: 0
  });

  useEffect(() => {
    const checkIns = getCheckInHistory();
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's check-in
    const todaysCheckIn = checkIns.find(c => c.date === today);
    setTodayCheckIn(todaysCheckIn);

    // Calculate recent stats (last 7 days)
    const recent = checkIns.slice(0, 7);
    if (recent.length > 0) {
      const avgMood = recent.reduce((sum, c) => sum + c.mood, 0) / recent.length;
      const avgEnergy = recent.reduce((sum, c) => sum + c.energy, 0) / recent.length;
      const avgSleep = recent.reduce((sum, c) => sum + c.sleep, 0) / recent.length;
      
      // Calculate streak
      let streakDays = 0;
      const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      for (let i = 0; i < sortedCheckIns.length; i++) {
        const checkInDate = new Date(sortedCheckIns[i].date);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (checkInDate.toDateString() === expectedDate.toDateString()) {
          streakDays++;
        } else {
          break;
        }
      }

      setRecentStats({ avgMood, avgEnergy, avgSleep, streakDays });
    }
  }, [getCheckInHistory]);

  const getPersonaGreeting = () => {
    if (!user?.persona) return "Welcome to your wellness journey!";
    
    const greetings = {
      Explorer: "Ready to discover new insights about your health today?",
      Phoenix: "Let's transform today's challenges into tomorrow's strengths!",
      Nurturer: "Time to nurture yourself with some self-care wisdom.",
      Warrior: "Gear up to tackle your health goals with determination!"
    };
    
    return greetings[user.persona.type] || "Welcome back to your wellness dashboard!";
  };

  const quickActions = [
    {
      title: 'Daily Check-In',
      description: todayCheckIn ? 'Update today\'s check-in' : 'Complete today\'s check-in',
      icon: <Calendar className="w-6 h-6" />,
      color: todayCheckIn ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700',
      action: () => onNavigate('checkin'),
      badge: todayCheckIn ? 'Complete' : 'Pending'
    },
    {
      title: 'AI Health Assistant',
      description: 'Get personalized health insights and predictions',
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-700',
      action: () => onNavigate('ai-assistant'),
      badge: 'New'
    },
    {
      title: 'Smart Recommendations',
      description: 'View AI-powered wellness recommendations',
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'bg-yellow-100 text-yellow-700',
      action: () => onNavigate('smart-recommendations'),
      badge: 'Personalized'
    },
    {
      title: 'Predictive Insights',
      description: 'Understand your health patterns and trends',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-pink-100 text-pink-700',
      action: () => onNavigate('predictive-model'),
      badge: 'AI-Powered'
    }
  ];

  const mainFeatures = [
    {
      title: 'Advanced Analytics',
      description: 'Deep insights into your health patterns',
      icon: <BarChart3 className="w-8 h-8" />,
      action: () => onNavigate('advanced-analytics'),
      stats: `${recentStats.streakDays} day streak`
    },
    {
      title: 'Healthcare Integration',
      description: 'Connect with your healthcare providers',
      icon: <Stethoscope className="w-8 h-8" />,
      action: () => onNavigate('healthcare-integration'),
      stats: 'Enhanced care'
    },
    {
      title: 'Symptom Tracker',
      description: 'Advanced symptom and treatment tracking',
      icon: <Activity className="w-8 h-8" />,
      action: () => onNavigate('advanced-symptom-tracker'),
      stats: 'Comprehensive'
    },
    {
      title: 'Content Curation',
      description: 'AI-curated educational content',
      icon: <BookOpen className="w-8 h-8" />,
      action: () => onNavigate('intelligent-content'),
      stats: 'Personalized'
    },
    {
      title: 'Self-Worth Toolkit',
      description: 'Audio-based confidence building',
      icon: <Heart className="w-8 h-8" />,
      action: () => onNavigate('toolkit'),
      stats: 'Audio therapy'
    },
    {
      title: 'Community Hub',
      description: 'Connect with others on similar journeys',
      icon: <Users className="w-8 h-8" />,
      action: () => onNavigate('community'),
      stats: 'Social support'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.email?.split('@')[0]}!
              </h1>
              <p className="text-lg text-gray-600 mt-2">{getPersonaGreeting()}</p>
            </div>
            {user?.persona && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-lg">
                {user.persona.type} Journey
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Average Mood (7d)</p>
                  <p className="text-3xl font-bold">{recentStats.avgMood.toFixed(1)}</p>
                </div>
                <Heart className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Average Energy (7d)</p>
                  <p className="text-3xl font-bold">{recentStats.avgEnergy.toFixed(1)}</p>
                </div>
                <Zap className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Average Sleep (7d)</p>
                  <p className="text-3xl font-bold">{recentStats.avgSleep.toFixed(1)}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Check-in Streak</p>
                  <p className="text-3xl font-bold">{recentStats.streakDays}</p>
                </div>
                <Target className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-full ${action.color}`}>
                      {action.icon}
                    </div>
                    <Badge variant={action.badge === 'Complete' ? 'default' : 'secondary'}>
                      {action.badge}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                  <Button onClick={action.action} className="w-full">
                    {action.title === 'Daily Check-In' && todayCheckIn ? 'Update' : 'Start'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Predictive Insights */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Health Insights
          </h2>
          <PredictiveInsightsCard />
        </div>

        {/* Main Features */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Health Management Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        {feature.icon}
                      </div>
                      <span>{feature.title}</span>
                    </div>
                    <Badge variant="outline">{feature.stats}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Button onClick={feature.action} variant="outline" className="w-full group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600">
                    Explore
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Today's Focus */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="w-6 h-6" />
              Today's Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Wellness Priority</h3>
                <p className="text-purple-100">
                  {todayCheckIn 
                    ? `Great job completing your check-in! Your mood is ${todayCheckIn.mood}/10 and energy is ${todayCheckIn.energy}/10.`
                    : "Start your day by completing your daily check-in to track your wellness journey."
                  }
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Recommended Action</h3>
                <p className="text-purple-100">
                  {recentStats.avgSleep < 6 
                    ? "Focus on improving sleep quality tonight - your recent sleep scores suggest this could boost your energy levels."
                    : recentStats.avgMood < 6
                    ? "Consider using the Self-Worth Toolkit today to support your emotional well-being."
                    : "You're doing great! Explore the AI Assistant for personalized insights about your health patterns."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
