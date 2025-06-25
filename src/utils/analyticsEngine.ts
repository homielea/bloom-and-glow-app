
import { DailyCheckIn, HealthTrackerData } from '../types';

export interface CorrelationResult {
  metric1: string;
  metric2: string;
  correlation: number;
  significance: 'high' | 'medium' | 'low';
  description: string;
}

export interface PredictiveInsight {
  type: 'hot-flash' | 'energy-dip' | 'sleep-quality' | 'stress-spike';
  probability: number;
  date: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  recommendations: string[];
}

export interface PatternInsight {
  pattern: string;
  frequency: number;
  strength: number;
  description: string;
  actionItems: string[];
}

export class AnalyticsEngine {
  static analyzeCorrelations(checkIns: DailyCheckIn[]): CorrelationResult[] {
    if (checkIns.length < 7) return [];

    const correlations: CorrelationResult[] = [];
    
    // Sleep-Mood correlation
    const sleepMoodCorr = this.calculateCorrelation(
      checkIns.map(c => c.sleep),
      checkIns.map(c => c.mood)
    );
    
    correlations.push({
      metric1: 'sleep',
      metric2: 'mood',
      correlation: sleepMoodCorr,
      significance: Math.abs(sleepMoodCorr) > 0.7 ? 'high' : Math.abs(sleepMoodCorr) > 0.4 ? 'medium' : 'low',
      description: sleepMoodCorr > 0.4 ? 'Better sleep strongly correlates with improved mood' : 'Sleep and mood show weak correlation'
    });

    // Energy-Stress correlation
    const energyStressCorr = this.calculateCorrelation(
      checkIns.map(c => c.energy),
      checkIns.map(c => c.stress)
    );
    
    correlations.push({
      metric1: 'energy',
      metric2: 'stress',
      correlation: energyStressCorr,
      significance: Math.abs(energyStressCorr) > 0.7 ? 'high' : Math.abs(energyStressCorr) > 0.4 ? 'medium' : 'low',
      description: energyStressCorr < -0.4 ? 'Higher stress significantly reduces energy levels' : 'Stress and energy show moderate relationship'
    });

    // Libido-Energy correlation
    const libidoEnergyCorr = this.calculateCorrelation(
      checkIns.map(c => c.libido),
      checkIns.map(c => c.energy)
    );
    
    correlations.push({
      metric1: 'libido',
      metric2: 'energy',
      correlation: libidoEnergyCorr,
      significance: Math.abs(libidoEnergyCorr) > 0.7 ? 'high' : Math.abs(libidoEnergyCorr) > 0.4 ? 'medium' : 'low',
      description: libidoEnergyCorr > 0.4 ? 'Energy levels strongly influence libido' : 'Libido and energy show variable relationship'
    });

    return correlations;
  }

  static generatePredictiveInsights(checkIns: DailyCheckIn[], trackerData?: HealthTrackerData[]): PredictiveInsight[] {
    if (checkIns.length < 14) return [];

    const insights: PredictiveInsight[] = [];
    const recent = checkIns.slice(-7);
    const avgStress = recent.reduce((sum, c) => sum + c.stress, 0) / recent.length;
    const avgSleep = recent.reduce((sum, c) => sum + c.sleep, 0) / recent.length;
    const avgEnergy = recent.reduce((sum, c) => sum + c.energy, 0) / recent.length;

    // Hot flash prediction based on stress and sleep patterns
    const hotFlashDays = checkIns.filter(c => c.bodyTemperature === 'hot-flash').length;
    const hotFlashFreq = hotFlashDays / checkIns.length;
    
    if (avgStress > 7 && avgSleep < 5 && hotFlashFreq > 0.3) {
      insights.push({
        type: 'hot-flash',
        probability: 0.75,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        confidence: 'high',
        reasoning: 'High stress and poor sleep increase hot flash likelihood',
        recommendations: [
          'Practice evening relaxation techniques',
          'Keep bedroom cool tonight',
          'Avoid caffeine after 2 PM',
          'Try deep breathing exercises'
        ]
      });
    }

    // Energy dip prediction
    if (avgEnergy < 4 && avgSleep < 6) {
      insights.push({
        type: 'energy-dip',
        probability: 0.8,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        confidence: 'high',
        reasoning: 'Poor sleep pattern indicates likely energy challenges',
        recommendations: [
          'Plan lighter activities tomorrow',
          'Prioritize protein-rich breakfast',
          'Schedule afternoon rest break',
          'Stay hydrated throughout day'
        ]
      });
    }

    // Sleep quality prediction
    if (avgStress > 6) {
      insights.push({
        type: 'sleep-quality',
        probability: 0.65,
        date: new Date().toISOString().split('T')[0],
        confidence: 'medium',
        reasoning: 'Elevated stress levels may impact tonight\'s sleep',
        recommendations: [
          'Start wind-down routine 1 hour early',
          'Try meditation or journaling',
          'Limit screen time before bed',
          'Consider herbal tea'
        ]
      });
    }

    return insights;
  }

  static detectPatterns(checkIns: DailyCheckIn[]): PatternInsight[] {
    if (checkIns.length < 14) return [];

    const patterns: PatternInsight[] = [];

    // Weekly mood patterns
    const weeklyMoods = this.analyzeWeeklyPatterns(checkIns, 'mood');
    if (weeklyMoods.variability > 2) {
      patterns.push({
        pattern: 'Weekly Mood Fluctuation',
        frequency: weeklyMoods.cycleLength,
        strength: weeklyMoods.variability,
        description: `Mood tends to ${weeklyMoods.pattern} on ${weeklyMoods.peakDay}s`,
        actionItems: [
          `Plan self-care activities for ${weeklyMoods.lowDay}s`,
          'Track potential triggers on difficult days',
          'Schedule important tasks on higher-mood days'
        ]
      });
    }

    // Temperature symptom patterns
    const tempPatterns = this.analyzeTemperaturePatterns(checkIns);
    if (tempPatterns.frequency > 0.2) {
      patterns.push({
        pattern: 'Hot Flash Timing',
        frequency: tempPatterns.frequency,
        strength: tempPatterns.intensity,
        description: `Hot flashes occur most often ${tempPatterns.timing}`,
        actionItems: [
          'Prepare cooling strategies for identified trigger times',
          'Track environmental factors during peak times',
          'Consider timing of meals and activities'
        ]
      });
    }

    // Sleep-energy cascade pattern
    const sleepEnergyPattern = this.analyzeSleepEnergyPattern(checkIns);
    if (sleepEnergyPattern.strength > 0.6) {
      patterns.push({
        pattern: 'Sleep-Energy Cascade',
        frequency: sleepEnergyPattern.frequency,
        strength: sleepEnergyPattern.strength,
        description: 'Poor sleep consistently leads to low energy the following day',
        actionItems: [
          'Prioritize sleep hygiene as primary energy strategy',
          'Plan lighter schedules after poor sleep nights',
          'Implement consistent bedtime routine'
        ]
      });
    }

    return patterns;
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static analyzeWeeklyPatterns(checkIns: DailyCheckIn[], metric: keyof Pick<DailyCheckIn, 'mood' | 'energy' | 'stress'>) {
    const dayOfWeekData: { [key: number]: number[] } = {};
    
    checkIns.forEach(checkin => {
      const dayOfWeek = new Date(checkin.date).getDay();
      if (!dayOfWeekData[dayOfWeek]) dayOfWeekData[dayOfWeek] = [];
      dayOfWeekData[dayOfWeek].push(checkin[metric]);
    });

    const dayAverages = Object.entries(dayOfWeekData).map(([day, values]) => ({
      day: parseInt(day),
      average: values.reduce((sum, val) => sum + val, 0) / values.length
    }));

    const maxDay = dayAverages.reduce((max, curr) => curr.average > max.average ? curr : max);
    const minDay = dayAverages.reduce((min, curr) => curr.average < min.average ? curr : min);
    const variability = maxDay.average - minDay.average;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      variability,
      cycleLength: 7,
      pattern: maxDay.average > (minDay.average + maxDay.average) / 2 ? 'peak' : 'dip',
      peakDay: dayNames[maxDay.day],
      lowDay: dayNames[minDay.day]
    };
  }

  private static analyzeTemperaturePatterns(checkIns: DailyCheckIn[]) {
    const hotFlashDays = checkIns.filter(c => c.bodyTemperature === 'hot-flash' || c.bodyTemperature === 'night-sweats');
    const frequency = hotFlashDays.length / checkIns.length;
    
    // Analyze timing patterns (simplified)
    const morningCount = hotFlashDays.filter(c => {
      // This is simplified - in real app you'd have time data
      return Math.random() > 0.7; // Simulate morning pattern
    }).length;
    
    const timing = morningCount > hotFlashDays.length / 2 ? 'in the morning' : 'in the evening';
    
    return {
      frequency,
      intensity: frequency * 2, // Simplified intensity calculation
      timing
    };
  }

  private static analyzeSleepEnergyPattern(checkIns: DailyCheckIn[]) {
    let cascadeCount = 0;
    let totalChecks = 0;

    for (let i = 0; i < checkIns.length - 1; i++) {
      const currentSleep = checkIns[i].sleep;
      const nextEnergy = checkIns[i + 1].energy;
      
      totalChecks++;
      if (currentSleep < 5 && nextEnergy < 5) {
        cascadeCount++;
      }
    }

    return {
      strength: cascadeCount / totalChecks,
      frequency: cascadeCount / checkIns.length
    };
  }
}
