
export const quizQuestions = [
  {
    id: 'symptoms',
    question: 'Which symptoms are you experiencing most?',
    type: 'multiple',
    options: [
      'Hot flashes or night sweats',
      'Irregular periods',
      'Mood swings or irritability',
      'Sleep difficulties',
      'Brain fog or memory issues',
      'Weight gain',
      'Low libido',
      'Vaginal dryness'
    ]
  },
  {
    id: 'mood',
    question: 'How would you describe your current emotional state?',
    type: 'slider',
    range: { min: 1, max: 10 },
    labels: { 1: 'Struggling', 10: 'Thriving' }
  },
  {
    id: 'libido',
    question: 'How has your interest in intimacy changed?',
    type: 'slider',
    range: { min: 1, max: 10 },
    labels: { 1: 'Significantly decreased', 10: 'Same or increased' }
  },
  {
    id: 'body_image',
    question: 'How comfortable do you feel in your changing body?',
    type: 'slider',
    range: { min: 1, max: 10 },
    labels: { 1: 'Very uncomfortable', 10: 'Very comfortable' }
  },
  {
    id: 'self_worth',
    question: 'How connected do you feel to your sense of self-worth?',
    type: 'slider',
    range: { min: 1, max: 10 },
    labels: { 1: 'Lost connection', 10: 'Strongly connected' }
  },
  {
    id: 'approach',
    question: 'What best describes your approach to this transition?',
    type: 'single',
    options: [
      'I want to learn everything I can about what\'s happening',
      'I see this as a chance to reinvent myself',
      'I focus on caring for myself while supporting others',
      'I tackle challenges head-on with determination'
    ]
  }
];
