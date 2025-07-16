
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Heart, Moon, Zap, Brain, Calendar, ChevronRight, Activity, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '../contexts/AppContext';
import { DailyCheckIn } from '../types';
import { AnalyticsEngine, PredictiveInsight } from '../utils/analyticsEngine';
import PredictiveInsightsCard from './PredictiveInsightsCard';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

// Transform database row to DailyCheckIn interface
const transformDailyCheckIn = (dbRow: any): DailyCheckIn => ({
  id: dbRow.id,
  userId: dbRow.user_id,
  date: dbRow.date,
  mood: dbRow.mood,
  energy: dbRow.energy,
  libido: dbRow.libido,
  sleep: dbRow.sleep,
  stress: dbRow.stress,
  bodyTemperature: dbRow.body_temperature,
  notes: dbRow.notes,
  moodSource: dbRow.mood_source,
  energySource: dbRow.energy_source,
  sleepSource: dbRow.sleep_source,
  stressSource: dbRow.stress_source,
  bodyTemperatureSource: dbRow.body_temperature_source,
  trackerSleepScore: dbRow.tracker_sleep_score,
  trackerHrv: dbRow.tracker_hrv,
  trackerRestingHr: dbRow.tracker_resting_hr,
});

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useApp();

  useEffect(() => {
    if (session?.user?.id) {
      loadCheckIns();
    }
  }, [session?.user?.id]);

  const loadCheckIns = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;

      if (data) {
        const transformedData = data.map(transformDailyCheckIn);
        setCheckIns(transformedData);
        
        // Generate predictive insights
        const insights = AnalyticsEngine.generatePredictiveInsights(transformedData);
        setPredictiveInsights(insights);
      }
    } catch (error) {
      console.error('Error loading check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAverageScore = (metric: keyof Pick<DailyCheckIn, 'mood' | 'energy' | 'sleep' | 'stress'>) => {
    if (checkIns.length === 0) return 0;
    const recent = checkIns.slice(0, 7);
    return Math.round(recent.reduce((sum, checkin) => sum + checkin[metric], 0) / recent.length);
  };

  const getTrendDirection = (metric: keyof Pick<DailyCheckIn, 'mood' | 'energy' | 'sleep' | 'stress'>) => {
    if (checkIns.length < 14) return 'stable';
    
    const recent = checkIns.slice(0, 7);
    const previous = checkIns.slice(7, 14);
    
    const recentAvg = recent.reduce((sum, checkin) => sum + checkin[metric], 0) / recent.length;
    const previousAvg = previous.reduce((sum, checkin) => sum + checkin[metric], 0) / previous.length;
    
    const difference = recentAvg - previousAvg;
    if (Math.abs(difference) < 0.5) return 'stable';
    return difference > 0 ? 'up' : 'down';
  };

  const handleViewDetails = () => {
    onNavigate('predictive-model');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Loading your wellness dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = checkIns
    .slice(0, 14)
    .reverse()
    .map(checkin => ({
      date: new Date(checkin.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: checkin.mood,
      energy: checkin.energy,
      sleep: checkin.sleep,
      stress: 10 - checkin.stress
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Wellness Dashboard</h1>
            <p className="text-muted-foreground">
              Track your journey and discover insights about your health patterns.
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={() => onNavigate('checkin')}
              className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Daily Check-in
            </Button>
            <Button 
              onClick={() => onNavigate('trackers')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Health Tracking
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Mood</CardTitle>
              <Heart className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">{getAverageScore('mood')}/10</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className={`h-3 w-3 mr-1 ${
                  getTrendDirection('mood') === 'up' ? 'text-green-600' : 
                  getTrendDirection('mood') === 'down' ? 'text-red-600 rotate-180' : 'text-gray-600'
                }`} />
                <span className="capitalize">{getTrendDirection('mood')} this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Energy</CardTitle>
              <Zap className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">{getAverageScore('energy')}/10</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className={`h-3 w-3 mr-1 ${
                  getTrendDirection('energy') === 'up' ? 'text-green-600' : 
                  getTrendDirection('energy') === 'down' ? 'text-red-600 rotate-180' : 'text-gray-600'
                }`} />
                <span className="capitalize">{getTrendDirection('energy')} this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Sleep</CardTitle>
              <Moon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">{getAverageScore('sleep')}/10</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className={`h-3 w-3 mr-1 ${
                  getTrendDirection('sleep') === 'up' ? 'text-green-600' : 
                  getTrendDirection('sleep') === 'down' ? 'text-red-600 rotate-180' : 'text-gray-600'
                }`} />
                <span className="capitalize">{getTrendDirection('sleep')} this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Calm</CardTitle>
              <Brain className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">{10 - getAverageScore('stress')}/10</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className={`h-3 w-3 mr-1 ${
                  getTrendDirection('stress') === 'down' ? 'text-green-600' : 
                  getTrendDirection('stress') === 'up' ? 'text-red-600 rotate-180' : 'text-gray-600'
                }`} />
                <span className="capitalize">
                  {getTrendDirection('stress') === 'down' ? 'up' : 
                   getTrendDirection('stress') === 'up' ? 'down' : 'stable'} this week
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Insights */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Wellness Trend Chart */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Wellness Trends</CardTitle>
              <CardDescription>Your mood, energy, sleep, and stress patterns over the past 2 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} name="Mood" />
                  <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energy" />
                  <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} name="Sleep" />
                  <Line type="monotone" dataKey="stress" stroke="#10b981" strokeWidth={2} name="Calm" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Predictive Insights */}
          <div className="space-y-4">
            <PredictiveInsightsCard 
              insights={predictiveInsights}
              onViewDetails={handleViewDetails}
            />
            
            {/* Advanced Health Tracking CTA */}
            <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <Activity className="w-12 h-12 mx-auto text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Advanced Health Tracking</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Connect wearables for real-time monitoring and deeper insights
                    </p>
                  </div>
                  <Button 
                    onClick={() => onNavigate('trackers')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Explore Features
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to support your wellness journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => onNavigate('content')}
              >
                <div className="text-left">
                  <div className="font-medium">Explore Content</div>
                  <div className="text-sm text-muted-foreground">Educational resources & guidance</div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => onNavigate('community')}
              >
                <div className="text-left">
                  <div className="font-medium">Join Community</div>
                  <div className="text-sm text-muted-foreground">Connect with others</div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => onNavigate('insights')}
              >
                <div className="text-left">
                  <div className="font-medium">View Insights</div>
                  <div className="text-sm text-muted-foreground">Detailed analytics</div>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
