
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AuthPage from './components/AuthPage';
import OnboardingQuiz from './components/OnboardingQuiz';
import PersonaReveal from './components/PersonaReveal';
import Dashboard from './components/Dashboard';
import DailyCheckIn from './components/DailyCheckIn';
import ContentLibrary from './components/ContentLibrary';
import SelfWorthToolkit from './components/SelfWorthToolkit';
import WellnessInsights from './components/WellnessInsights';
import HealthTrackers from './components/HealthTrackers';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import EnhancedPersonalization from './components/EnhancedPersonalization';
import CommunityHub from './components/CommunityHub';
import PWAPrompt from './components/PWAPrompt';

// Phase 3 imports
import IntelligentContentCuration from './components/IntelligentContentCuration';
import HealthcareIntegration from './components/HealthcareIntegration';
import AdvancedSymptomTracker from './components/AdvancedSymptomTracker';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { user, loading, currentSection, setCurrentSection } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your wellness journey...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={() => {}} />;
  }

  if (!user.onboardingCompleted) {
    return <OnboardingQuiz onComplete={() => {}} />;
  }

  if (user.onboardingCompleted && !user.persona) {
    return <PersonaReveal onContinue={() => setCurrentSection('dashboard')} />;
  }

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'checkin':
        return <DailyCheckIn onComplete={() => setCurrentSection('dashboard')} />;
      case 'content':
        return <ContentLibrary />;
      case 'toolkit':
        return <SelfWorthToolkit />;
      case 'insights':
        return <WellnessInsights />;
      case 'trackers':
        return <HealthTrackers />;
      case 'advanced-analytics':
        return <AdvancedAnalytics />;
      case 'personalization':
        return <EnhancedPersonalization />;
      case 'community':
        return <CommunityHub />;
      // Phase 3 components
      case 'intelligent-content':
        return <IntelligentContentCuration />;
      case 'healthcare-integration':
        return <HealthcareIntegration />;
      case 'advanced-symptom-tracker':
        return <AdvancedSymptomTracker />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      {renderCurrentSection()}
      <PWAPrompt />
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<AppContent />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
