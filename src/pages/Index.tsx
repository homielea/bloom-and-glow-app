
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from '../contexts/AppContext';
import OnboardingQuiz from '../components/OnboardingQuiz';
import PersonaReveal from '../components/PersonaReveal';
import Dashboard from '../components/Dashboard';
import DailyCheckIn from '../components/DailyCheckIn';
import ContentLibrary from '../components/ContentLibrary';
import SelfWorthToolkit from '../components/SelfWorthToolkit';
import WellnessInsights from '../components/WellnessInsights';
import AuthPage from '../components/AuthPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'auth' | 'quiz' | 'persona' | 'dashboard' | 'checkin' | 'content' | 'toolkit' | 'insights'>('welcome');
  const { user, session, loading } = useApp();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      setCurrentView('welcome');
    } else if (user?.onboardingCompleted) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('quiz');
    }
  }, [user, session, loading]);

  const handleStartJourney = () => {
    setCurrentView('auth');
  };

  const handleAuthSuccess = () => {
    // The useEffect will handle routing based on user state
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-rose-400 to-purple-400 rounded-full flex items-center justify-center animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading your journey...</p>
        </div>
      </div>
    );
  }

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

  if (currentView === 'auth') {
    return <AuthPage onSuccess={handleAuthSuccess} />;
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
