
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
  value: number | string;
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
