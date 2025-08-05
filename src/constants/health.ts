export const HEALTH_CONSTANTS = {
  SLEEP_SCORE_THRESHOLDS: {
    POOR: 5,
    FAIR: 6,
    GOOD: 7,
    EXCELLENT: 8
  },
  MOOD_SCALE: {
    MIN: 1,
    MAX: 10,
    NEUTRAL: 5
  },
  ENERGY_SCALE: {
    MIN: 1,
    MAX: 10,
    LOW_THRESHOLD: 4,
    HIGH_THRESHOLD: 7
  },
  STRESS_SCALE: {
    MIN: 1,
    MAX: 10,
    LOW: 3,
    MODERATE: 6,
    HIGH: 8
  }
} as const;
