import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { User as AppUser, MenopausePersona, DailyCheckIn, QuizAnswer, HealthTrackerConnection, HealthTrackerData } from '../types';
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
  getTrackerConnections: () => Promise<HealthTrackerConnection[]>;
  syncTrackerData: (connectionId: string) => Promise<HealthTrackerData[]>;
  getLatestTrackerData: (dataType: string, days?: number) => Promise<HealthTrackerData | null>;
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
    // Enhanced implementation with tracker data integration
    const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
    
    useEffect(() => {
      if (session?.user) {
        fetchCheckInHistory();
      }
    }, [session]);

    const fetchCheckInHistory = async () => {
      if (!session?.user) return;
      
      try {
        const { data, error } = await supabase
          .from('daily_checkins')
          .select('*')
          .eq('user_id', session.user.id)
          .order('date', { ascending: false })
          .limit(30);

        if (error) {
          console.error('Error fetching check-in history:', error);
          return;
        }

        const mappedCheckIns: DailyCheckIn[] = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          date: item.date,
          mood: item.mood,
          energy: item.energy,
          libido: item.libido,
          sleep: item.sleep,
          stress: item.stress,
          bodyTemperature: item.body_temperature as 'normal' | 'hot-flash' | 'night-sweats' | 'cold',
          notes: item.notes,
          moodSource: item.mood_source,
          energySource: item.energy_source,
          sleepSource: item.sleep_source,
          stressSource: item.stress_source,
          bodyTemperatureSource: item.body_temperature_source,
          trackerSleepScore: item.tracker_sleep_score,
          trackerHrv: item.tracker_hrv,
          trackerRestingHr: item.tracker_resting_hr
        }));

        setCheckIns(mappedCheckIns);
      } catch (error) {
        console.error('Error in fetchCheckInHistory:', error);
      }
    };

    return checkIns;
  };

  const getTrackerConnections = async (): Promise<HealthTrackerConnection[]> => {
    if (!session?.user) return [];
    
    try {
      const { data, error } = await supabase
        .from('health_tracker_connections')
        .select('id, provider, device_name, connected_at, last_sync_at, sync_status, sync_error_message')
        .eq('sync_status', 'active');

      if (error) {
        console.error('Error fetching tracker connections:', error);
        return [];
      }

      // Map and type-cast the data to match our interface
      const typedConnections: HealthTrackerConnection[] = (data || []).map(connection => ({
        id: connection.id,
        provider: connection.provider,
        device_name: connection.device_name || '',
        connected_at: connection.connected_at,
        last_sync_at: connection.last_sync_at,
        sync_status: connection.sync_status as 'active' | 'error' | 'disconnected',
        sync_error_message: connection.sync_error_message
      }));

      return typedConnections;
    } catch (error) {
      console.error('Error in getTrackerConnections:', error);
      return [];
    }
  };

  const syncTrackerData = async (connectionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-health-data', {
        body: { connectionId, days: 7 }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error syncing tracker data:', error);
      throw error;
    }
  };

  const getLatestTrackerData = async (dataType: string, days: number = 1) => {
    if (!session?.user) return null;
    
    try {
      const { data, error } = await supabase
        .from('health_tracker_data')
        .select(`
          *,
          health_tracker_connections!inner(user_id)
        `)
        .eq('health_tracker_connections.user_id', session.user.id)
        .eq('data_type', dataType)
        .gte('recorded_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('recorded_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching tracker data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLatestTrackerData:', error);
      return null;
    }
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
        getTrackerConnections,
        syncTrackerData,
        getLatestTrackerData,
        signOut
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
