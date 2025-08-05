import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { User, MenopausePersona, QuizAnswer } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User) => void;
  setQuizAnswers: (answers: QuizAnswer[]) => void;
  assignPersona: (answers: QuizAnswer[]) => MenopausePersona;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          persona: data.persona_type ? {
            type: data.persona_type as 'Explorer' | 'Phoenix' | 'Nurturer' | 'Warrior',
            description: data.persona_description || '',
            learningPath: Array.isArray(data.persona_learning_path) ? data.persona_learning_path as string[] : [],
            motivationalTone: data.persona_motivational_tone || ''
          } : undefined,
          onboardingCompleted: data.onboarding_completed || false,
          createdAt: data.created_at
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const setQuizAnswers = async (answers: QuizAnswer[]) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('quiz_answers')
        .insert(
          answers.map(answer => ({
            user_id: session.user.id,
            question_id: answer.questionId,
            answer_value: answer.value
          }))
        );

      if (error) throw error;
    } catch (error) {
    }
  };

  const assignPersona = (answers: QuizAnswer[]): MenopausePersona => {
    const scores = {
      Explorer: 0,
      Phoenix: 0,
      Nurturer: 0,
      Warrior: 0
    };

    answers.forEach(answer => {
      if (typeof answer.value === 'number') {
        if (answer.questionId === 'symptoms') {
          if (answer.value >= 7) scores.Phoenix += 2;
          else if (answer.value >= 5) scores.Warrior += 1;
          else scores.Nurturer += 1;
        }
        if (answer.questionId === 'approach') {
          if (answer.value >= 8) scores.Explorer += 2;
          else if (answer.value >= 6) scores.Phoenix += 1;
          else scores.Nurturer += 1;
        }
      }
    });

    const topPersona = Object.entries(scores).reduce((a, b) => 
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
    )[0] as 'Explorer' | 'Phoenix' | 'Nurturer' | 'Warrior';

    const personas = {
      Explorer: {
        type: 'Explorer' as const,
        description: 'You embrace change and seek new approaches to wellness.',
        learningPath: ['research', 'experimentation', 'data-tracking'],
        motivationalTone: 'curious'
      },
      Phoenix: {
        type: 'Phoenix' as const,
        description: 'You rise from challenges stronger and more resilient.',
        learningPath: ['transformation', 'strength-building', 'recovery'],
        motivationalTone: 'empowering'
      },
      Nurturer: {
        type: 'Nurturer' as const,
        description: 'You prioritize care for yourself and others.',
        learningPath: ['self-care', 'community', 'gentle-approaches'],
        motivationalTone: 'supportive'
      },
      Warrior: {
        type: 'Warrior' as const,
        description: 'You face challenges head-on with determination.',
        learningPath: ['action-oriented', 'goal-setting', 'achievement'],
        motivationalTone: 'motivating'
      }
    };

    return personas[topPersona];
  };

  const value = {
    user,
    session,
    loading,
    setUser,
    setQuizAnswers,
    assignPersona
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
