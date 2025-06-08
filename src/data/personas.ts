
import { MenopausePersona } from '../types';

export const menopausePersonas: Record<string, MenopausePersona> = {
  Explorer: {
    type: 'Explorer',
    description: 'You approach menopause with curiosity and openness. You want to understand every aspect of this transition and are eager to learn about your changing body.',
    learningPath: ['Understanding Hormones', 'Body Changes Explained', 'Symptom Management', 'Nutrition for Balance'],
    motivationalTone: 'encouraging and informative'
  },
  Phoenix: {
    type: 'Phoenix',
    description: 'You see menopause as a rebirth - a chance to rise stronger and more authentic. You\'re ready to embrace this new chapter with power and grace.',
    learningPath: ['Emotional Transformation', 'Reclaiming Your Power', 'Self-Worth Building', 'Confidence Boosters'],
    motivationalTone: 'empowering and transformative'
  },
  Nurturer: {
    type: 'Nurturer',
    description: 'You focus on caring for yourself while supporting others. You want tools to maintain your well-being while being there for your loved ones.',
    learningPath: ['Self-Care Essentials', 'Relationship Wellness', 'Communication Skills', 'Boundary Setting'],
    motivationalTone: 'gentle and supportive'
  },
  Warrior: {
    type: 'Warrior',
    description: 'You tackle menopause head-on with determination. You want practical solutions and are ready to fight for your health and happiness.',
    learningPath: ['Action-Oriented Solutions', 'Health Optimization', 'Stress Management', 'Goal Achievement'],
    motivationalTone: 'strong and motivating'
  }
};
