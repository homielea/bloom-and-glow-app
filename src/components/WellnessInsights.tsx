
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Heart, Battery } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const WellnessInsights: React.FC = () => {
  const { getCheckInHistory } = useApp();
  const checkInHistory = getCheckInHistory();

  // Prepare data for charts
  const chartData = checkInHistory.slice(-7).map(checkin => ({
    date: new Date(checkin.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: checkin.mood,
    energy: checkin.energy,
    stress: checkin.stress,
    sleep: checkin.sleep,
    libido: checkin.libido
  }));

  const averages = checkInHistory.length > 0 ? {
    mood: Math.round(checkInHistory.reduce((sum, c) => sum + c.mood, 0) / checkInHistory.length * 10) / 10,
    energy: Math.round(checkInHistory.reduce((sum, c) => sum + c.energy, 0) / checkInHistory.length * 10) / 10,
    stress: Math.round(checkInHistory.reduce((sum, c) => sum + c.stress, 0) / checkInHistory.length * 10) / 10,
    sleep: Math.round(checkInHistory.reduce((sum, c) => sum + c.sleep, 0) / checkInHistory.length * 10) / 10,
    libido: Math.round(checkInHistory.reduce((sum, c) => sum + c.libido, 0) / checkInHistory.length * 10) / 10
  } : { mood: 0, energy: 0, stress: 0, sleep: 0, libido: 0 };

  const symptomCounts = checkInHistory.reduce((acc, checkin) => {
    acc[checkin.bodyTemperature] = (acc[checkin.bodyTemperature] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const symptomData = Object.entries(symptomCounts).map(([symptom, count]) => ({
    symptom: symptom.replace('-', ' '),
    count
  }));

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreDescription = (metric: string, score: number) => {
    if (score >= 7) return `Your ${metric} is in a good range`;
    if (score >= 5) return `Your ${metric} could use some attention`;
    return `Your ${metric} needs support`;
  };

  if (checkInHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
            <p className="text-muted-foreground mb-6">
              Complete a few daily check-ins to start seeing your wellness patterns and insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Wellness Insights</h1>
          <p className="text-muted-foreground">
            Understanding your patterns over the last {checkInHistory.length} check-ins
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[
            { key: 'mood', label: 'Average Mood', icon: Heart, value: averages.mood },
            { key: 'energy', label: 'Average Energy', icon: Battery, value: averages.energy },
            { key: 'stress', label: 'Average Stress', icon: TrendingUp, value: averages.stress },
            { key: 'sleep', label: 'Average Sleep', icon: Calendar, value: averages.sleep },
            { key: 'libido', label: 'Average Libido', icon: Heart, value: averages.libido }
          ].map((metric) => {
            const IconComponent = metric.icon;
            return (
              <Card key={metric.key}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    <CardDescription className="text-sm">{metric.label}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                    {metric.value}/10
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getScoreDescription(metric.key, metric.value)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trend Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Mood & Energy Trends</CardTitle>
              <CardDescription>Last 7 check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#f43f5e" 
                    strokeWidth={2}
                    name="Mood"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Energy"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sleep & Stress Patterns</CardTitle>
              <CardDescription>Last 7 check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sleep" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Sleep Quality"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stress" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Stress Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Symptom Tracking */}
        {symptomData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Temperature Symptoms</CardTitle>
              <CardDescription>Frequency of reported temperature-related symptoms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={symptomData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="symptom" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f43f5e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Insights</CardTitle>
            <CardDescription>What your data tells us about your journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {averages.mood < 5 && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Mood Support</h4>
                <p className="text-red-700 text-sm">
                  Your mood scores suggest you might benefit from additional emotional support. 
                  Consider exploring our self-worth toolkit or speaking with a healthcare provider.
                </p>
              </div>
            )}
            
            {averages.energy < 5 && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">Energy Enhancement</h4>
                <p className="text-orange-700 text-sm">
                  Low energy is common during menopause. Check out our nutrition content 
                  and consider tracking your sleep patterns more closely.
                </p>
              </div>
            )}
            
            {averages.stress > 7 && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Stress Management</h4>
                <p className="text-yellow-700 text-sm">
                  Your stress levels are elevated. Our meditation and self-compassion 
                  practices might help you find more balance.
                </p>
              </div>
            )}
            
            {averages.mood >= 7 && averages.energy >= 7 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">You're Thriving! 🌟</h4>
                <p className="text-green-700 text-sm">
                  Your mood and energy levels are strong. Keep up the great work with 
                  your self-care practices!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WellnessInsights;
