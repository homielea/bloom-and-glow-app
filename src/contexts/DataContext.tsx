import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { DailyCheckIn, ContentItem, HealthTrackerConnection, HealthTrackerData, HealthTrackerTokenData } from '../types';
import { contentLibrary } from '../data/contentLibrary';
import { useAuth } from './AuthContext';

interface DataContextType {
  checkInHistory: DailyCheckIn[];
  saveCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'userId'>) => Promise<void>;
  getCheckInHistory: () => DailyCheckIn[];
  getContentLibrary: () => ContentItem[];
  connectHealthTracker: (provider: string, tokenData: HealthTrackerTokenData) => Promise<HealthTrackerConnection>;
  getHealthTrackerConnections: () => Promise<HealthTrackerConnection[]>;
  getLatestTrackerData: (dataType: string, limit?: number) => Promise<HealthTrackerData | null>;
  syncHealthData: (connectionId: string) => Promise<void>;
  loadCheckInHistory: (userId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [checkInHistory, setCheckInHistory] = useState<DailyCheckIn[]>([]);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      loadCheckInHistory(session.user.id);
    }
  }, [session?.user?.id]);

  const loadCheckInHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        const transformedData = data.map(transformDailyCheckIn);
        setCheckInHistory(transformedData);
      }
    } catch (error) {
      console.error('Error loading check-in history:', error);
    }
  };

  const transformDailyCheckIn = (dbRow: Record<string, unknown>): DailyCheckIn => ({
    id: dbRow.id as string,
    userId: dbRow.user_id as string,
    date: dbRow.date as string,
    mood: dbRow.mood as number,
    energy: dbRow.energy as number,
    libido: dbRow.libido as number,
    sleep: dbRow.sleep as number,
    stress: dbRow.stress as number,
    bodyTemperature: dbRow.body_temperature as 'normal' | 'hot-flash' | 'night-sweats' | 'cold',
    notes: dbRow.notes as string | undefined,
    moodSource: dbRow.mood_source as string | undefined,
    energySource: dbRow.energy_source as string | undefined,
    sleepSource: dbRow.sleep_source as string | undefined,
    stressSource: dbRow.stress_source as string | undefined,
    bodyTemperatureSource: dbRow.body_temperature_source as string | undefined,
    trackerSleepScore: dbRow.tracker_sleep_score as number | undefined,
    trackerHrv: dbRow.tracker_hrv as number | undefined,
    trackerRestingHr: dbRow.tracker_resting_hr as number | undefined
  });

  const saveCheckIn = async (checkIn: Omit<DailyCheckIn, 'id' | 'userId'>) => {
    if (!session?.user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: session.user.id,
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
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCheckIn = transformDailyCheckIn(data);
        setCheckInHistory(prev => [newCheckIn, ...prev]);
      }

      await loadCheckInHistory(session.user.id);
    } catch (error) {
      console.error('Error saving check-in:', error);
      throw error;
    }
  };

  const getCheckInHistory = () => checkInHistory;

  const getContentLibrary = () => contentLibrary;

  const connectHealthTracker = async (provider: string, tokenData: HealthTrackerTokenData): Promise<HealthTrackerConnection> => {
    if (!session?.user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('health_tracker_connections')
        .insert({
          user_id: session.user.id,
          provider: provider,
          device_name: tokenData.device_name || provider,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_at,
          sync_status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        provider: data.provider,
        device_name: data.device_name || provider,
        connected_at: data.connected_at,
        last_sync_at: data.last_sync_at,
        sync_status: (data.sync_status as 'active' | 'error' | 'disconnected') || 'active',
        sync_error_message: data.sync_error_message
      };
    } catch (error) {
      console.error('Error connecting health tracker:', error);
      throw error;
    }
  };

  const getHealthTrackerConnections = async (): Promise<HealthTrackerConnection[]> => {
    if (!session?.user) return [];

    try {
      const { data, error } = await supabase
        .from('health_tracker_connections')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;

      return data.map(conn => ({
        id: conn.id,
        provider: conn.provider,
        device_name: conn.device_name || conn.provider,
        connected_at: conn.connected_at,
        last_sync_at: conn.last_sync_at,
        sync_status: (conn.sync_status as 'active' | 'error' | 'disconnected') || 'active',
        sync_error_message: conn.sync_error_message
      }));
    } catch (error) {
      console.error('Error fetching health tracker connections:', error);
      return [];
    }
  };

  const getLatestTrackerData = async (dataType: string, limit = 1): Promise<HealthTrackerData | null> => {
    if (!session?.user) return null;

    try {
      const { data: connections } = await supabase
        .from('health_tracker_connections')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('sync_status', 'active');

      if (!connections?.length) return null;

      const { data, error } = await supabase
        .from('health_tracker_data')
        .select('*')
        .in('connection_id', connections.map(c => c.id))
        .eq('data_type', dataType)
        .order('recorded_date', { ascending: false })
        .limit(limit)
        .single();

      if (error) throw error;

      return data ? {
        id: data.id,
        connection_id: data.connection_id,
        data_type: data.data_type,
        recorded_date: data.recorded_date,
        recorded_time: data.recorded_time || undefined,
        value: data.value || undefined,
        metadata: data.metadata as Record<string, unknown> || undefined,
        raw_data: data.raw_data as Record<string, unknown> || undefined,
        created_at: data.created_at
      } : null;
    } catch (error) {
      console.error('Error fetching latest tracker data:', error);
      return null;
    }
  };

  const syncHealthData = async (connectionId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('health_tracker_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', connectionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error syncing health data:', error);
      throw error;
    }
  };

  const value = {
    checkInHistory,
    saveCheckIn,
    getCheckInHistory,
    getContentLibrary,
    connectHealthTracker,
    getHealthTrackerConnections,
    getLatestTrackerData,
    syncHealthData,
    loadCheckInHistory
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
