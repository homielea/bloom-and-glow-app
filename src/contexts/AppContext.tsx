import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { DailyCheckIn, User, QuizAnswer, ContentItem, HealthTrackerConnection, HealthTrackerData } from '../types';
import { contentLibrary } from '../data/contentLibrary';
import { toast } from 'sonner';

interface AppContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  saveQuizAnswers: (answers: QuizAnswer[]) => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [checkInHistory, setCheckInHistory] = useState<DailyCheckIn[]>([]);
  const [currentSection, setCurrentSection] = useState('dashboard');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
          type: profile.persona_type,
          description: profile.persona_description || '',
          learningPath: profile.persona_learning_path || [],
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
        bodyTemperature: item.body_temperature,
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
      sync_status: data.sync_status,
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
      sync_status: item.sync_status,
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
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    saveQuizAnswers,
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
