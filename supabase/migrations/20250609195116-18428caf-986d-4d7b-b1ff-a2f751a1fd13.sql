
-- Create health tracker connections table
CREATE TABLE public.health_tracker_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('fitbit', 'oura', 'apple_health', 'google_fit', 'garmin')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  device_id TEXT,
  device_name TEXT,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'error', 'disconnected')),
  sync_error_message TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider, device_id)
);

-- Create health tracker data table for raw data storage
CREATE TABLE public.health_tracker_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.health_tracker_connections(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('sleep', 'heart_rate', 'temperature', 'hrv', 'activity', 'stress')),
  recorded_date DATE NOT NULL,
  recorded_time TIMESTAMP WITH TIME ZONE,
  value NUMERIC,
  metadata JSONB DEFAULT '{}',
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for health_tracker_data
CREATE INDEX health_tracker_data_lookup_idx ON public.health_tracker_data(connection_id, data_type, recorded_date);

-- Create sync status tracking table
CREATE TABLE public.health_tracker_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.health_tracker_connections(id) ON DELETE CASCADE,
  sync_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sync_completed_at TIMESTAMP WITH TIME ZONE,
  records_synced INTEGER DEFAULT 0,
  sync_status TEXT NOT NULL CHECK (sync_status IN ('running', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add data source tracking to daily_checkins
ALTER TABLE public.daily_checkins 
ADD COLUMN mood_source TEXT DEFAULT 'manual' CHECK (mood_source IN ('manual', 'tracker')),
ADD COLUMN energy_source TEXT DEFAULT 'manual' CHECK (energy_source IN ('manual', 'tracker')),
ADD COLUMN sleep_source TEXT DEFAULT 'manual' CHECK (sleep_source IN ('manual', 'tracker')),
ADD COLUMN stress_source TEXT DEFAULT 'manual' CHECK (stress_source IN ('manual', 'tracker')),
ADD COLUMN body_temperature_source TEXT DEFAULT 'manual' CHECK (body_temperature_source IN ('manual', 'tracker')),
ADD COLUMN tracker_sleep_score NUMERIC,
ADD COLUMN tracker_hrv NUMERIC,
ADD COLUMN tracker_resting_hr NUMERIC;

-- Enable RLS on all new tables
ALTER TABLE public.health_tracker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_tracker_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_tracker_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for health_tracker_connections
CREATE POLICY "Users can view their own tracker connections" 
  ON public.health_tracker_connections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracker connections" 
  ON public.health_tracker_connections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracker connections" 
  ON public.health_tracker_connections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracker connections" 
  ON public.health_tracker_connections 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for health_tracker_data
CREATE POLICY "Users can view their own tracker data" 
  ON public.health_tracker_data 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.health_tracker_connections 
    WHERE id = connection_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own tracker data" 
  ON public.health_tracker_data 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.health_tracker_connections 
    WHERE id = connection_id AND user_id = auth.uid()
  ));

-- Create RLS policies for health_tracker_sync_logs
CREATE POLICY "Users can view their own sync logs" 
  ON public.health_tracker_sync_logs 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.health_tracker_connections 
    WHERE id = connection_id AND user_id = auth.uid()
  ));

CREATE POLICY "System can manage sync logs" 
  ON public.health_tracker_sync_logs 
  FOR ALL 
  USING (true);
