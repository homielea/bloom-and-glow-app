
import { DailyCheckIn, ContentItem } from '../types';
import { PredictiveInsight, CorrelationResult, PatternInsight } from './analyticsEngine';

export interface PersonalizedRecommendation {
  id: string;
  type: 'content' | 'lifestyle' | 'intervention' | 'medical';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  actionSteps: string[];
  estimatedBenefit: string;
  timeframe: string;
}

export class RecommendationEngine {
  static generateRecommendations(
    checkIns: DailyCheckIn[],
    insights: PredictiveInsight[],
    correlations: CorrelationResult[],
    patterns: PatternInsight[],
    contentLibrary: ContentItem[]
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];
    
    if (checkIns.length === 0) return recommendations;

    const recent = checkIns.slice(-7);
    const avgMood = recent.reduce((sum, c) => sum + c.mood, 0) / recent.length;
    const avgEnergy = recent.reduce((sum, c) => sum + c.energy, 0) / recent.length;
    const avgSleep = recent.reduce((sum, c) => sum + c.sleep, 0) / recent.length;
    const avgStress = recent.reduce((sum, c) => sum + c.stress, 0) / recent.length;

    // Content recommendations based on current state
    recommendations.push(...this.generateContentRecommendations(
      { avgMood, avgEnergy, avgSleep, avgStress },
      contentLibrary
    ));

    // Lifestyle recommendations based on patterns
    recommendations.push(...this.generateLifestyleRecommendations(
      { avgMood, avgEnergy, avgSleep, avgStress },
      patterns,
      correlations
    ));

    // Intervention timing recommendations
    recommendations.push(...this.generateInterventionRecommendations(
      insights,
      { avgMood, avgEnergy, avgSleep, avgStress }
    ));

    // Medical consultation recommendations
    recommendations.push(...this.generateMedicalRecommendations(
      checkIns,
      patterns
    ));

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private static generateContentRecommendations(
    currentState: { avgMood: number; avgEnergy: number; avgSleep: number; avgStress: number },
    contentLibrary: ContentItem[]
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    if (currentState.avgMood < 5) {
      recommendations.push({
        id: 'content-emotional-support',
        type: 'content',
        priority: 'high',
        title: 'Emotional Support Content',
        description: 'Explore content specifically designed to boost mood and emotional wellbeing',
        reasoning: 'Your recent mood scores suggest you could benefit from targeted emotional support',
        actionSteps: [
          'Start with "Understanding Emotional Changes in Menopause"',
          'Try the self-compassion audio exercises',
          'Read about mood stabilization techniques'
        ],
        estimatedBenefit: 'Improved mood within 1-2 weeks',
        timeframe: 'Start today, 15-20 minutes daily'
      });
    }

    if (currentState.avgEnergy < 5) {
      recommendations.push({
        id: 'content-energy-boost',
        type: 'content',
        priority: 'medium',
        title: 'Energy Enhancement Resources',
        description: 'Learn evidence-based strategies to naturally boost your energy levels',
        reasoning: 'Your energy levels have been consistently low',
        actionSteps: [
          'Review nutrition content for energy-boosting foods',
          'Learn about hormone-energy connections',
          'Explore gentle exercise recommendations'
        ],
        estimatedBenefit: 'Noticeable energy improvement in 1-3 weeks',
        timeframe: '10-15 minutes daily reading/listening'
      });
    }

    return recommendations;
  }

  private static generateLifestyleRecommendations(
    currentState: { avgMood: number; avgEnergy: number; avgSleep: number; avgStress: number },
    patterns: PatternInsight[],
    correlations: CorrelationResult[]
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    // Sleep optimization based on correlations
    const sleepCorrelation = correlations.find(c => 
      (c.metric1 === 'sleep' || c.metric2 === 'sleep') && c.significance === 'high'
    );

    if (currentState.avgSleep < 6 && sleepCorrelation) {
      recommendations.push({
        id: 'lifestyle-sleep-optimization',
        type: 'lifestyle',
        priority: 'high',
        title: 'Sleep Optimization Protocol',
        description: 'Implement a comprehensive sleep improvement strategy',
        reasoning: `Poor sleep is strongly correlated with ${sleepCorrelation.metric1 === 'sleep' ? sleepCorrelation.metric2 : sleepCorrelation.metric1} issues`,
        actionSteps: [
          'Set consistent bedtime (within 30 minutes each night)',
          'Create 30-minute wind-down routine',
          'Optimize bedroom temperature (65-68°F)',
          'Limit caffeine after 2 PM',
          'Track sleep quality in daily check-ins'
        ],
        estimatedBenefit: 'Improved overall wellbeing within 2-3 weeks',
        timeframe: 'Start tonight, maintain consistently'
      });
    }

    // Stress management
    if (currentState.avgStress > 7) {
      recommendations.push({
        id: 'lifestyle-stress-management',
        type: 'lifestyle',
        priority: 'high',
        title: 'Comprehensive Stress Reduction Plan',
        description: 'Multi-faceted approach to managing elevated stress levels',
        reasoning: 'Your stress levels are consistently high, which impacts multiple aspects of health',
        actionSteps: [
          'Practice 10-minute daily meditation',
          'Implement 4-7-8 breathing technique during stressful moments',
          'Schedule 15 minutes of outdoor time daily',
          'Create boundaries around work/personal time',
          'Use progressive muscle relaxation before bed'
        ],
        estimatedBenefit: 'Reduced stress and improved sleep within 1-2 weeks',
        timeframe: 'Daily practice, 20-30 minutes total'
      });
    }

    return recommendations;
  }

  private static generateInterventionRecommendations(
    insights: PredictiveInsight[],
    currentState: { avgMood: number; avgEnergy: number; avgSleep: number; avgStress: number }
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    // Hot flash preparation
    const hotFlashInsight = insights.find(i => i.type === 'hot-flash' && i.probability > 0.6);
    if (hotFlashInsight) {
      recommendations.push({
        id: 'intervention-hot-flash-prep',
        type: 'intervention',
        priority: 'medium',
        title: 'Hot Flash Prevention Strategy',
        description: 'Proactive measures to reduce hot flash intensity and frequency',
        reasoning: hotFlashInsight.reasoning,
        actionSteps: [
          'Keep cooling towel and water bottle ready',
          'Wear breathable, layered clothing',
          'Practice stress-reduction techniques',
          'Avoid known triggers (spicy foods, alcohol)',
          'Have self-worth toolkit ready for emotional support'
        ],
        estimatedBenefit: 'Reduced hot flash intensity and better coping',
        timeframe: 'Implement immediately, use as needed'
      });
    }

    // Self-worth toolkit timing
    if (currentState.avgMood < 5 || currentState.avgStress > 7) {
      recommendations.push({
        id: 'intervention-selfworth-timing',
        type: 'intervention',
        priority: 'high',
        title: 'Optimal Self-Worth Toolkit Usage',
        description: 'Use audio practices when they\'ll have maximum impact',
        reasoning: 'Current mood/stress patterns indicate optimal timing for intervention',
        actionSteps: [
          'Use morning affirmation audio upon waking',
          'Practice self-compassion exercise during stress peaks',
          'Listen to confidence-building content before challenging situations',
          'Use relaxation audio before sleep'
        ],
        estimatedBenefit: 'Improved emotional resilience and self-confidence',
        timeframe: 'Use 2-3 times daily during difficult periods'
      });
    }

    return recommendations;
  }

  private static generateMedicalRecommendations(
    checkIns: DailyCheckIn[],
    patterns: PatternInsight[]
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    // Check for concerning patterns
    const recentSevereSleep = checkIns.slice(-14).filter(c => c.sleep < 3).length;
    const recentSevereMood = checkIns.slice(-14).filter(c => c.mood < 3).length;
    const highStressStreak = this.getConsecutiveHighStress(checkIns.slice(-14));

    if (recentSevereSleep > 7) {
      recommendations.push({
        id: 'medical-sleep-consultation',
        type: 'medical',
        priority: 'high',
        title: 'Sleep Specialist Consultation',
        description: 'Consider professional evaluation for persistent sleep issues',
        reasoning: 'Severe sleep difficulties for over a week may require medical intervention',
        actionSteps: [
          'Document sleep patterns and symptoms',
          'Schedule appointment with healthcare provider',
          'Discuss hormone therapy options if appropriate',
          'Consider sleep study if recommended'
        ],
        estimatedBenefit: 'Professional treatment plan for better sleep',
        timeframe: 'Schedule within 1-2 weeks'
      });
    }

    if (recentSevereMood > 5 || highStressStreak > 7) {
      recommendations.push({
        id: 'medical-mental-health',
        type: 'medical',
        priority: 'high',
        title: 'Mental Health Support',
        description: 'Professional support for persistent mood challenges',
        reasoning: 'Extended periods of low mood or high stress may benefit from professional support',
        actionSteps: [
          'Consider therapy or counseling',
          'Discuss with healthcare provider about hormone impacts on mood',
          'Explore support groups for menopause',
          'Document mood patterns and triggers'
        ],
        estimatedBenefit: 'Professional strategies for mood management',
        timeframe: 'Reach out within 1 week'
      });
    }

    return recommendations;
  }

  private static getConsecutiveHighStress(checkIns: DailyCheckIn[]): number {
    let maxStreak = 0;
    let currentStreak = 0;

    for (const checkin of checkIns) {
      if (checkin.stress > 7) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return maxStreak;
  }
}
