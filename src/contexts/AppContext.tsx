
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, MenopausePersona, DailyCheckIn, QuizAnswer } from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentCheckIn: DailyCheckIn | null;
  setCurrentCheckIn: (checkIn: DailyCheckIn | null) => void;
  quizAnswers: QuizAnswer[];
  setQuizAnswers: (answers: QuizAnswer[]) => void;
  assignPersona: (answers: QuizAnswer[]) => MenopausePersona;
  saveCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'userId'>) => void;
  getCheckInHistory: () => DailyCheckIn[];
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
  const [user, setUser] = useState<User | null>(null);
  const [currentCheckIn, setCurrentCheckIn] = useState<DailyCheckIn | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('menopause-app-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const assignPersona = (answers: QuizAnswer[]): MenopausePersona => {
    // Simple logic to assign persona based on quiz answers
    const approachAnswer = answers.find(a => a.questionId === 'approach');
    
    if (approachAnswer) {
      switch (approachAnswer.value) {
        case 0: return { type: 'Explorer', description: 'You approach menopause with curiosity and openness.', learningPath: ['Understanding Hormones'], motivationalTone: 'encouraging' };
        case 1: return { type: 'Phoenix', description: 'You see menopause as a rebirth.', learningPath: ['Emotional Transformation'], motivationalTone: 'empowering' };
        case 2: return { type: 'Nurturer', description: 'You focus on caring for yourself while supporting others.', learningPath: ['Self-Care Essentials'], motivationalTone: 'gentle' };
        case 3: return { type: 'Warrior', description: 'You tackle menopause head-on with determination.', learningPath: ['Action-Oriented Solutions'], motivationalTone: 'strong' };
        default: return { type: 'Explorer', description: 'You approach menopause with curiosity and openness.', learningPath: ['Understanding Hormones'], motivationalTone: 'encouraging' };
      }
    }
    
    return { type: 'Explorer', description: 'You approach menopause with curiosity and openness.', learningPath: ['Understanding Hormones'], motivationalTone: 'encouraging' };
  };

  const saveCheckIn = (checkInData: Omit<DailyCheckIn, 'id' | 'userId'>) => {
    if (!user) return;
    
    const checkIn: DailyCheckIn = {
      ...checkInData,
      id: crypto.randomUUID(),
      userId: user.id
    };
    
    const history = getCheckInHistory();
    const newHistory = [...history, checkIn];
    localStorage.setItem('menopause-app-checkins', JSON.stringify(newHistory));
    setCurrentCheckIn(checkIn);
  };

  const getCheckInHistory = (): DailyCheckIn[] => {
    const saved = localStorage.getItem('menopause-app-checkins');
    return saved ? JSON.parse(saved) : [];
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        currentCheckIn,
        setCurrentCheckIn,
        quizAnswers,
        setQuizAnswers,
        assignPersona,
        saveCheckIn,
        getCheckInHistory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
