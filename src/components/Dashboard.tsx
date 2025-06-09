
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, Headphones, TrendingUp, Calendar, Sparkles, Activity } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, getCheckInHistory } = useApp();
  const checkInHistory = getCheckInHistory();
  const todaysCheckIn = checkInHistory.find(checkin => 
    checkin.date === new Date().toISOString().split('T')[0]
  );

  const personaColors = {
    Explorer: 'from-blue-400 to-cyan-400',
    Phoenix: 'from-orange-400 to-red-400',
    Nurturer: 'from-pink-400 to-rose-400',
    Warrior: 'from-purple-400 to-indigo-400'
  };

  const personaMessages = {
    Explorer: "Ready to discover something new about yourself today?",
    Phoenix: "You're transforming beautifully. What will you embrace today?",
    Nurturer: "Remember to pour into yourself as much as you give to others.",
    Warrior: "You're stronger than you know. What will you conquer today?"
  };

  const currentPersona = user?.persona?.type || 'Explorer';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <Card className={`bg-gradient-to-r ${personaColors[currentPersona]} text-white`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl">
                  Hello, {currentPersona} 
                </CardTitle>
                <CardDescription className="text-white/90">
                  {personaMessages[currentPersona]}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => onNavigate('checkin')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <CardTitle className="text-lg">Daily Check-In</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {todaysCheckIn ? "Update today's check-in" : "Log how you're feeling today"}
              </CardDescription>
              {todaysCheckIn && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Mood: {todaysCheckIn.mood}/10
                </div>
              )}
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => onNavigate('content')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">Learning</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Explore content curated for your journey
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => onNavigate('toolkit')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-purple-500" />
                <CardTitle className="text-lg">Self-Worth</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Audio practices for inner strength
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => onNavigate('trackers')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-lg">Health Trackers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect fitness devices for automatic tracking
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => onNavigate('insights')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <CardTitle className="text-lg">Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View your wellness patterns
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Check-Ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {checkInHistory.length > 0 ? (
                <div className="space-y-3">
                  {checkInHistory.slice(-3).reverse().map((checkin, index) => (
                    <div key={checkin.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium">{new Date(checkin.date).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Mood: {checkin.mood}/10 • Energy: {checkin.energy}/10
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-3">No check-ins yet</p>
                  <Button 
                    size="sm" 
                    onClick={() => onNavigate('checkin')}
                    className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
                  >
                    Start Your First Check-In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user?.persona?.learningPath.map((path, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">{path}</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
                onClick={() => onNavigate('content')}
              >
                Continue Learning
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
