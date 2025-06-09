import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { User as AppUser, MenopausePersona, DailyCheckIn, QuizAnswer } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface AppContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  currentCheckIn: DailyCheckIn | null;
  setCurrentCheckIn: (checkIn: DailyCheckIn | null) => void;
  quizAnswers: QuizAnswer[];
  setQuizAnswers: (answers: QuizAnswer[]) => void;
  assignPersona: (answers: QuizAnswer[]) => MenopausePersona;
  saveCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'userId'>) => Promise<void>;
  getCheckInHistory: () => DailyCheckIn[];
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCheckIn, setCurrentCheckIn] = useState<DailyCheckIn | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile from database
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        const appUser: AppUser = {
          id: profile.id,
          email: profile.email,
          onboardingCompleted: profile.onboarding_completed || false,
          createdAt: profile.created_at,
          persona: profile.persona_type ? {
            type: profile.persona_type as 'Explorer' | 'Phoenix' | 'Nurturer' | 'Warrior',
            description: profile.persona_description || '',
            learningPath: Array.isArray(profile.persona_learning_path) 
              ? profile.persona_learning_path as string[]
              : [],
            motivationalTone: profile.persona_motivational_tone || ''
          } : undefined
        };
        setUser(appUser);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignPersona = (answers: QuizAnswer[]): MenopausePersona => {
    const approachAnswer = answers.find(a => a.questionId === 'approach');
    
    if (approachAnswer) {
      switch (approachAnswer.value) {
        case 0: return { 
          type: 'Explorer', 
          description: 'You approach menopause with curiosity and openness, eager to understand every aspect of this transition.', 
          learningPath: ['Understanding Hormones', 'Body Changes Explained', 'Symptom Management'], 
          motivationalTone: 'encouraging and informative' 
        };
        case 1: return { 
          type: 'Phoenix', 
          description: 'You see menopause as a rebirth - a chance to rise stronger and more authentic than ever before.', 
          learningPath: ['Emotional Transformation', 'Reclaiming Your Power', 'Self-Worth Building'], 
          motivationalTone: 'empowering and transformative' 
        };
        case 2: return { 
          type: 'Nurturer', 
          description: 'You focus on caring for yourself while supporting others, seeking tools to maintain well-being for everyone.', 
          learningPath: ['Self-Care Essentials', 'Relationship Wellness', 'Communication Skills'], 
          motivationalTone: 'gentle and supportive' 
        };
        case 3: return { 
          type: 'Warrior', 
          description: 'You tackle menopause head-on with determination, ready to fight for your health and happiness.', 
          learningPath: ['Action-Oriented Solutions', 'Health Optimization', 'Goal Achievement'], 
          motivationalTone: 'strong and motivating' 
        };
        default: return { 
          type: 'Explorer', 
          description: 'You approach menopause with curiosity and openness.', 
          learningPath: ['Understanding Hormones'], 
          motivationalTone: 'encouraging' 
        };
      }
    }
    
    return { 
      type: 'Explorer', 
      description: 'You approach menopause with curiosity and openness.', 
      learningPath: ['Understanding Hormones'], 
      motivationalTone: 'encouraging' 
    };
  };

  const saveCheckIn = async (checkInData: Omit<DailyCheckIn, 'id' | 'userId'>) => {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: session.user.id,
          date: checkInData.date,
          mood: checkInData.mood,
          energy: checkInData.energy,
          libido: checkInData.libido,
          sleep: checkInData.sleep,
          stress: checkInData.stress,
          body_temperature: checkInData.bodyTemperature,
          notes: checkInData.notes
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving check-in:', error);
        return;
      }

      if (data) {
        const checkIn: DailyCheckIn = {
          id: data.id,
          userId: data.user_id,
          date: data.date,
          mood: data.mood,
          energy: data.energy,
          libido: data.libido,
          sleep: data.sleep,
          stress: data.stress,
          bodyTemperature: data.body_temperature as 'normal' | 'hot-flash' | 'night-sweats' | 'cold',
          notes: data.notes
        };
        setCurrentCheckIn(checkIn);
      }
    } catch (error) {
      console.error('Error in saveCheckIn:', error);
    }
  };

  const getCheckInHistory = (): DailyCheckIn[] => {
    // This will be implemented to fetch from Supabase in the future
    return [];
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        session,
        loading,
        setUser,
        currentCheckIn,
        setCurrentCheckIn,
        quizAnswers,
        setQuizAnswers,
        assignPersona,
        saveCheckIn,
        getCheckInHistory,
        signOut
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
