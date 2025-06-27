import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { DailyCheckIn, User, QuizAnswer, ContentItem, HealthTrackerConnection, HealthTrackerData, MenopausePersona } from '../types';
import { contentLibrary } from '../data/contentLibrary';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';

interface AppContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  saveQuizAnswers: (answers: QuizAnswer[]) => Promise<void>;
  setQuizAnswers: (answers: QuizAnswer[]) => void;
  assignPersona: (answers: QuizAnswer[]) => MenopausePersona;
  setUser: (user: User) => void;
  saveCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'userId'>) => Promise<void>;
  getCheckInHistory: () => DailyCheckIn[];
  getContentLibrary: () => ContentItem[];
  connectHealthTracker: (provider: string, tokenData: any) => Promise<HealthTrackerConnection>;
  getHealthTrackerConnections: () => Promise<HealthTrackerConnection[]>;
  getLatestTrackerData: (dataType: string, limit?: number) => Promise<HealthTrackerData | null>;
  syncHealthData: (connectionId: string) => Promise<void>;
  currentSection: string;
  setCurrentSection: (section: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInHistory, setCheckInHistory] = useState<DailyCheckIn[]>([]);
  const [currentSection, setCurrentSection] = useState('dashboard');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCheckInHistory([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const userData: User = {
        id: profile.id,
        email: profile.email,
        onboardingCompleted: profile.onboarding_completed,
        createdAt: profile.created_at,
        persona: profile.persona_type ? {
          type: profile.persona_type as 'Explorer' | 'Phoenix' | 'Nurturer' | 'Warrior',
          description: profile.persona_description || '',
          learningPath: Array.isArray(profile.persona_learning_path) ? profile.persona_learning_path as string[] : [],
          motivationalTone: profile.persona_motivational_tone || ''
        } : undefined
      };

      setUser(userData);
      
      if (userData.onboardingCompleted) {
        await loadCheckInHistory(userId);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const loadCheckInHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;

      const checkIns: DailyCheckIn[] = data.map(item => ({
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

      setCheckInHistory(checkIns);
    } catch (error) {
      console.error('Error loading check-in history:', error);
    }
  };

  const assignPersona = (answers: QuizAnswer[]): MenopausePersona => {
    // Simple persona assignment logic based on answers
    const scoreMap = { Explorer: 0, Phoenix: 0, Nurturer: 0, Warrior: 0 };
    
    answers.forEach(answer => {
      if (typeof answer.value === 'number') {
        if (answer.value >= 8) scoreMap.Explorer += 1;
        else if (answer.value >= 6) scoreMap.Phoenix += 1;
        else if (answer.value >= 4) scoreMap.Nurturer += 1;
        else scoreMap.Warrior += 1;
      }
    });

    const topPersona = Object.entries(scoreMap).reduce((a, b) => scoreMap[a[0] as keyof typeof scoreMap] > scoreMap[b[0] as keyof typeof scoreMap] ? a : b)[0] as 'Explorer' | 'Phoenix' | 'Nurturer' | 'Warrior';

    const personaDescriptions = {
      Explorer: "You're curious and eager to learn about your changing body. You approach menopause as a journey of discovery.",
      Phoenix: "You see menopause as a transformation - an opportunity to rise stronger and embrace this new phase of life.",
      Nurturer: "You prioritize caring for yourself and others, finding strength in community and gentle self-compassion.",
      Warrior: "You face menopause head-on with determination, ready to fight for your health and well-being."
    };

    const learningPaths = {
      Explorer: ["Understanding hormonal changes", "Exploring natural remedies", "Learning about nutrition"],
      Phoenix: ["Embracing life transitions", "Building resilience", "Creating new routines"],
      Nurturer: ["Self-care practices", "Building support networks", "Mindfulness techniques"],
      Warrior: ["Managing symptoms effectively", "Advocating for your health", "Strength training basics"]
    };

    return {
      type: topPersona,
      description: personaDescriptions[topPersona],
      learningPath: learningPaths[topPersona],
      motivationalTone: "supportive"
    };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setCurrentSection('dashboard');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const saveQuizAnswers = async (answers: QuizAnswer[]) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('quiz_answers')
      .insert(
        answers.map(answer => ({
          user_id: user.id,
          question_id: answer.questionId,
          answer_value: answer.value
        }))
      );

    if (error) throw error;
  };

  const setQuizAnswers = (answers: QuizAnswer[]) => {
    // This is used for local state management during onboarding
    console.log('Quiz answers set:', answers);
  };

  const saveCheckIn = async (checkIn: Omit<DailyCheckIn, 'id' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');

    // Check if check-in already exists for today
    const { data: existing } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', checkIn.date)
      .single();

    if (existing) {
      // Update existing check-in
      const { error } = await supabase
        .from('daily_checkins')
        .update({
          mood: checkIn.mood,
          energy: checkIn.energy,
          libido: checkIn.libido,
          sleep: checkIn.sleep,
          stress: checkIn.stress,
          body_temperature: checkIn.bodyTemperature,
          notes: checkIn.notes,
          mood_source: checkIn.moodSource,
          energy_source: checkIn.energySource,
          sleep_source: checkIn.sleepSource,
          stress_source: checkIn.stressSource,
          body_temperature_source: checkIn.bodyTemperatureSource,
          tracker_sleep_score: checkIn.trackerSleepScore,
          tracker_hrv: checkIn.trackerHrv,
          tracker_resting_hr: checkIn.trackerRestingHr
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Create new check-in
      const { error } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: user.id,
          date: checkIn.date,
          mood: checkIn.mood,
          energy: checkIn.energy,
          libido: checkIn.libido,
          sleep: checkIn.sleep,
          stress: checkIn.stress,
          body_temperature: checkIn.bodyTemperature,
          notes: checkIn.notes,
          mood_source: checkIn.moodSource,
          energy_source: checkIn.energySource,
          sleep_source: checkIn.sleepSource,
          stress_source: checkIn.stressSource,
          body_temperature_source: checkIn.bodyTemperatureSource,
          tracker_sleep_score: checkIn.trackerSleepScore,
          tracker_hrv: checkIn.trackerHrv,
          tracker_resting_hr: checkIn.trackerRestingHr
        });

      if (error) throw error;
    }

    // Reload check-in history
    await loadCheckInHistory(user.id);
  };

  const getCheckInHistory = () => checkInHistory;
  const getContentLibrary = () => contentLibrary;

  const connectHealthTracker = async (provider: string, tokenData: any): Promise<HealthTrackerConnection> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('health_tracker_connections')
      .insert({
        user_id: user.id,
        provider,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenData.expires_at ? new Date(tokenData.expires_at).toISOString() : null,
        device_id: tokenData.device_id,
        device_name: tokenData.device_name || provider
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      provider: data.provider,
      device_name: data.device_name,
      connected_at: data.connected_at,
      last_sync_at: data.last_sync_at,
      sync_status: data.sync_status as 'active' | 'error' | 'disconnected',
      sync_error_message: data.sync_error_message
    };
  };

  const getHealthTrackerConnections = async (): Promise<HealthTrackerConnection[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('health_tracker_connections')
      .select('id, provider, device_name, connected_at, last_sync_at, sync_status, sync_error_message')
      .eq('user_id', user.id)
      .order('connected_at', { ascending: false });

    if (error) {
      console.error('Error fetching tracker connections:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      provider: item.provider,
      device_name: item.device_name,
      connected_at: item.connected_at,
      last_sync_at: item.last_sync_at,
      sync_status: item.sync_status as 'active' | 'error' | 'disconnected',
      sync_error_message: item.sync_error_message
    }));
  };

  const getLatestTrackerData = async (dataType: string, limit: number = 1): Promise<HealthTrackerData | null> => {
    if (!user) return null;

    // First get user's connections
    const { data: connections } = await supabase
      .from('health_tracker_connections')
      .select('id')
      .eq('user_id', user.id);

    if (!connections || connections.length === 0) return null;

    const connectionIds = connections.map(c => c.id);

    const { data, error } = await supabase
      .from('health_tracker_data')
      .select('*')
      .in('connection_id', connectionIds)
      .eq('data_type', dataType)
      .order('recorded_date', { ascending: false })
      .order('recorded_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching tracker data:', error);
      return null;
    }

    if (!data || data.length === 0) return null;

    const item = data[0];
    return {
      id: item.id,
      connection_id: item.connection_id,
      data_type: item.data_type,
      recorded_date: item.recorded_date,
      recorded_time: item.recorded_time,
      value: item.value,
      metadata: item.metadata,
      raw_data: item.raw_data,
      created_at: item.created_at
    };
  };

  const syncHealthData = async (connectionId: string): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('sync-health-data', {
        body: { connectionId }
      });

      if (error) throw error;
      toast.success('Health data sync started');
    } catch (error) {
      console.error('Error syncing health data:', error);
      toast.error('Failed to sync health data');
    }
  };

  const value: AppContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    saveQuizAnswers,
    setQuizAnswers,
    assignPersona,
    setUser,
    saveCheckIn,
    getCheckInHistory,
    getContentLibrary,
    connectHealthTracker,
    getHealthTrackerConnections,
    getLatestTrackerData,
    syncHealthData,
    currentSection,
    setCurrentSection
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
