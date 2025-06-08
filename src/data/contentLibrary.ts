
import { ContentItem } from '../types';

export const contentLibrary: ContentItem[] = [
  {
    id: 'understanding-perimenopause',
    title: 'Understanding Perimenopause: Your Body\'s Natural Transition',
    category: 'Hormones',
    type: 'article',
    duration: '5 min read',
    description: 'Learn about the hormonal changes that begin years before menopause and how to recognize the signs.',
    content: 'Perimenopause is the transitional period leading up to menopause, typically beginning in your 40s but sometimes as early as your 30s. During this time, your ovaries gradually produce less estrogen, leading to irregular periods and various symptoms...',
    tags: ['beginner', 'hormones', 'education'],
    unlockedBy: ['Explorer', 'Warrior']
  },
  {
    id: 'hot-flash-management',
    title: 'Cooling Down: Managing Hot Flashes Naturally',
    category: 'Symptoms',
    type: 'article',
    duration: '4 min read',
    description: 'Practical strategies to reduce the frequency and intensity of hot flashes without medication.',
    content: 'Hot flashes affect up to 80% of women during menopause. While they can be disruptive, there are many natural ways to manage them effectively...',
    tags: ['symptoms', 'natural-remedies', 'practical'],
    unlockedBy: ['Explorer', 'Warrior', 'Nurturer']
  },
  {
    id: 'reclaiming-confidence',
    title: 'Reclaiming Your Confidence During Change',
    category: 'Emotional Confidence',
    type: 'audio',
    duration: '8 min',
    description: 'A guided reflection on rebuilding confidence as your body and mind transform.',
    content: 'This audio guide will help you reconnect with your inner strength and develop unshakeable confidence during this transition...',
    tags: ['confidence', 'self-worth', 'transformation'],
    unlockedBy: ['Phoenix', 'Nurturer']
  },
  {
    id: 'nutrition-for-balance',
    title: 'Eating for Hormonal Balance',
    category: 'Nutrition',
    type: 'article',
    duration: '6 min read',
    description: 'Discover foods that support hormone production and help manage menopause symptoms.',
    content: 'The right nutrition can significantly impact your menopause experience. Learn which foods to embrace and which to limit...',
    tags: ['nutrition', 'hormones', 'health'],
    unlockedBy: ['Explorer', 'Warrior', 'Nurturer']
  },
  {
    id: 'intimacy-reimagined',
    title: 'Intimacy Reimagined: Connecting with Your Sexuality',
    category: 'Sex & Libido',
    type: 'audio',
    duration: '12 min',
    description: 'Explore how intimacy can evolve and deepen during menopause.',
    content: 'Menopause doesn\'t mean the end of your sexual life - it can be the beginning of a new, more authentic chapter...',
    tags: ['intimacy', 'sexuality', 'relationships'],
    unlockedBy: ['Phoenix', 'Explorer']
  }
];
