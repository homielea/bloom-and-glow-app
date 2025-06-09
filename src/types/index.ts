
export interface User {
  id: string;
  email: string;
  persona?: MenopausePersona;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface MenopausePersona {
  type: 'Explorer' | 'Phoenix' | 'Nurturer' | 'Warrior';
  description: string;
  learningPath: string[];
  motivationalTone: string;
}

export interface QuizAnswer {
  questionId: string;
  value: number | string | string[];
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string;
  mood: number; // 1-10
  energy: number; // 1-10
  libido: number; // 1-10
  sleep: number; // 1-10
  stress: number; // 1-10
  bodyTemperature: 'normal' | 'hot-flash' | 'night-sweats' | 'cold';
  notes?: string;
  moodSource?: string;
  energySource?: string;
  sleepSource?: string;
  stressSource?: string;
  bodyTemperatureSource?: string;
  trackerSleepScore?: number;
  trackerHrv?: number;
  trackerRestingHr?: number;
}

export interface ContentItem {
  id: string;
  title: string;
  category: 'Symptoms' | 'Hormones' | 'Nutrition' | 'Sex & Libido' | 'Emotional Confidence';
  type: 'article' | 'audio' | 'podcast' | 'video';
  duration?: string;
  description: string;
  content: string;
  tags: string[];
  unlockedBy?: string[];
}

export interface AudioPrompt {
  id: string;
  title: string;
  category: 'journal' | 'meditation' | 'exercise';
  duration: string;
  description: string;
  transcript: string;
}

export interface HealthTrackerConnection {
  id: string;
  provider: string;
  device_name: string;
  connected_at: string;
  last_sync_at: string | null;
  sync_status: 'active' | 'error' | 'disconnected';
  sync_error_message: string | null;
}

export interface HealthTrackerData {
  id: string;
  connection_id: string;
  data_type: string;
  recorded_date: string;
  recorded_time?: string;
  value?: number;
  metadata?: any;
  raw_data?: any;
  created_at: string;
}
