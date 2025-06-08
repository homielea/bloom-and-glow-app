
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from '../contexts/AppContext';
import OnboardingQuiz from '../components/OnboardingQuiz';
import PersonaReveal from '../components/PersonaReveal';
import Dashboard from '../components/Dashboard';
import DailyCheckIn from '../components/DailyCheckIn';
import ContentLibrary from '../components/ContentLibrary';
import SelfWorthToolkit from '../components/SelfWorthToolkit';
import WellnessInsights from '../components/WellnessInsights';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'quiz' | 'persona' | 'dashboard' | 'checkin' | 'content' | 'toolkit' | 'insights'>('welcome');
  const { user, setUser } = useApp();

  useEffect(() => {
    // Check if user exists and onboarding is complete
    if (user?.onboardingCompleted) {
      setCurrentView('dashboard');
    } else if (user) {
      setCurrentView('quiz');
    }
  }, [user]);

  const handleStartJourney = () => {
    // Create a new user
    const newUser = {
      id: crypto.randomUUID(),
      email: `user_${Date.now()}@example.com`, // In real app, this would be actual email
      onboardingCompleted: false,
      createdAt: new Date().toISOString()
    };
    
    setUser(newUser);
    localStorage.setItem('menopause-app-user', JSON.stringify(newUser));
    setCurrentView('quiz');
  };

  const handleQuizComplete = () => {
    setCurrentView('persona');
  };

  const handlePersonaComplete = () => {
    setCurrentView('dashboard');
  };

  const handleNavigate = (section: string) => {
    switch (section) {
      case 'dashboard':
        setCurrentView('dashboard');
        break;
      case 'checkin':
        setCurrentView('checkin');
        break;
      case 'content':
        setCurrentView('content');
        break;
      case 'toolkit':
        setCurrentView('toolkit');
        break;
      case 'insights':
        setCurrentView('insights');
        break;
    }
  };

  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-rose-400 to-purple-400 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl mb-2">
              Your Menopause Journey
            </CardTitle>
            <CardDescription className="text-base">
              A supportive companion for women navigating perimenopause and menopause with confidence, knowledge, and self-compassion.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-left space-y-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-sm">Personalized learning paths</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-rose-500" />
                <span className="text-sm">Daily emotional check-ins</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span className="text-sm">Self-worth building tools</span>
              </div>
            </div>
            
            <Button 
              onClick={handleStartJourney}
              className="w-full bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
            >
              Begin Your Journey
            </Button>
            
            <p className="text-xs text-muted-foreground">
              This is a supportive space created by and for women. Your privacy and emotional well-being are our priorities.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === 'quiz') {
    return <OnboardingQuiz onComplete={handleQuizComplete} />;
  }

  if (currentView === 'persona') {
    return <PersonaReveal onContinue={handlePersonaComplete} />;
  }

  if (currentView === 'checkin') {
    return <DailyCheckIn onComplete={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'content') {
    return (
      <div>
        <div className="p-4 bg-white/80 backdrop-blur-sm border-b">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('dashboard')}
          >
            ← Back to Dashboard
          </Button>
        </div>
        <ContentLibrary />
      </div>
    );
  }

  if (currentView === 'toolkit') {
    return (
      <div>
        <div className="p-4 bg-white/80 backdrop-blur-sm border-b">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('dashboard')}
          >
            ← Back to Dashboard
          </Button>
        </div>
        <SelfWorthToolkit />
      </div>
    );
  }

  if (currentView === 'insights') {
    return (
      <div>
        <div className="p-4 bg-white/80 backdrop-blur-sm border-b">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('dashboard')}
          >
            ← Back to Dashboard
          </Button>
        </div>
        <WellnessInsights />
      </div>
    );
  }

  return <Dashboard onNavigate={handleNavigate} />;
};

const Index: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
