// Shared horoscope data across the application

export interface ZodiacSign {
  id: string;
  name: string;
  dateRange: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  rulingPlanet: string;
  symbol: string;
  icon: string;
  luckyNumbers: number[];
  luckyColors: string[];
  compatibility: string[];
  traits: {
    positive: string[];
    negative: string[];
  };
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: 'aries',
    name: 'Aries',
    dateRange: 'Mar 21 - Apr 19',
    element: 'Fire',
    rulingPlanet: 'Mars',
    symbol: 'The Ram',
    icon: '/images/img_vector_black_900_01.svg',
    luckyNumbers: [1, 8, 17],
    luckyColors: ['Red', 'Orange'],
    compatibility: ['Leo', 'Sagittarius', 'Gemini'],
    traits: {
      positive: ['Courageous', 'Determined', 'Confident', 'Enthusiastic', 'Optimistic'],
      negative: ['Impatient', 'Aggressive', 'Impulsive', 'Selfish', 'Short-tempered']
    }
  },
  {
    id: 'taurus',
    name: 'Taurus',
    dateRange: 'Apr 20 - May 20',
    element: 'Earth',
    rulingPlanet: 'Venus',
    symbol: 'The Bull',
    icon: '/images/img_vector_black_900_01_34x36.svg',
    luckyNumbers: [2, 6, 9],
    luckyColors: ['Green', 'Pink'],
    compatibility: ['Virgo', 'Capricorn', 'Cancer'],
    traits: {
      positive: ['Reliable', 'Patient', 'Practical', 'Devoted', 'Stable'],
      negative: ['Stubborn', 'Possessive', 'Uncompromising', 'Materialistic']
    }
  },
  {
    id: 'gemini',
    name: 'Gemini',
    dateRange: 'May 21 - Jun 20',
    element: 'Air',
    rulingPlanet: 'Mercury',
    symbol: 'The Twins',
    icon: '/images/img_vector_black_900_01_34x32.svg',
    luckyNumbers: [5, 7, 14],
    luckyColors: ['Yellow', 'Silver'],
    compatibility: ['Libra', 'Aquarius', 'Aries'],
    traits: {
      positive: ['Gentle', 'Affectionate', 'Curious', 'Adaptable', 'Quick learner'],
      negative: ['Nervous', 'Inconsistent', 'Indecisive', 'Superficial']
    }
  },
  {
    id: 'cancer',
    name: 'Cancer',
    dateRange: 'Jun 21 - Jul 22',
    element: 'Water',
    rulingPlanet: 'Moon',
    symbol: 'The Crab',
    icon: '/images/img_vector_black_900_01_36x26.svg',
    luckyNumbers: [2, 7, 11],
    luckyColors: ['White', 'Silver'],
    compatibility: ['Scorpio', 'Pisces', 'Taurus'],
    traits: {
      positive: ['Tenacious', 'Loyal', 'Emotional', 'Sympathetic', 'Protective'],
      negative: ['Moody', 'Pessimistic', 'Suspicious', 'Manipulative']
    }
  },
  {
    id: 'leo',
    name: 'Leo',
    dateRange: 'Jul 23 - Aug 22',
    element: 'Fire',
    rulingPlanet: 'Sun',
    symbol: 'The Lion',
    icon: '/images/img_vector_black_900_01_34x40.png',
    luckyNumbers: [1, 3, 10],
    luckyColors: ['Gold', 'Orange'],
    compatibility: ['Aries', 'Sagittarius', 'Gemini'],
    traits: {
      positive: ['Creative', 'Passionate', 'Generous', 'Warm-hearted', 'Cheerful'],
      negative: ['Arrogant', 'Stubborn', 'Self-centered', 'Lazy', 'Inflexible']
    }
  },
  {
    id: 'virgo',
    name: 'Virgo',
    dateRange: 'Aug 23 - Sep 22',
    element: 'Earth',
    rulingPlanet: 'Mercury',
    symbol: 'The Virgin',
    icon: '/images/img_vector_black_900_01_34x26.svg',
    luckyNumbers: [6, 14, 18],
    luckyColors: ['Navy Blue', 'Grey'],
    compatibility: ['Taurus', 'Capricorn', 'Cancer'],
    traits: {
      positive: ['Loyal', 'Analytical', 'Kind', 'Hardworking', 'Practical'],
      negative: ['Shyness', 'Worry', 'Overly critical', 'Harsh']
    }
  },
  {
    id: 'libra',
    name: 'Libra',
    dateRange: 'Sep 23 - Oct 22',
    element: 'Air',
    rulingPlanet: 'Venus',
    symbol: 'The Scales',
    icon: '/images/img_vector_black_900_01_22x36.svg',
    luckyNumbers: [4, 6, 13],
    luckyColors: ['Blue', 'Green'],
    compatibility: ['Gemini', 'Aquarius', 'Leo'],
    traits: {
      positive: ['Cooperative', 'Diplomatic', 'Gracious', 'Fair-minded', 'Social'],
      negative: ['Indecisive', 'Avoids confrontations', 'Self-pity', 'Unreliable']
    }
  },
  {
    id: 'scorpio',
    name: 'Scorpio',
    dateRange: 'Oct 23 - Nov 21',
    element: 'Water',
    rulingPlanet: 'Mars & Pluto',
    symbol: 'The Scorpion',
    icon: '/images/img_component_2.png',
    luckyNumbers: [8, 11, 18],
    luckyColors: ['Deep Red', 'Black'],
    compatibility: ['Cancer', 'Pisces', 'Virgo'],
    traits: {
      positive: ['Resourceful', 'Brave', 'Passionate', 'Stubborn', 'True friend'],
      negative: ['Distrusting', 'Jealous', 'Secretive', 'Violent']
    }
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    dateRange: 'Nov 22 - Dec 21',
    element: 'Fire',
    rulingPlanet: 'Jupiter',
    symbol: 'The Archer',
    icon: '/images/img_vector_black_900_01_34x30.svg',
    luckyNumbers: [3, 9, 22],
    luckyColors: ['Turquoise', 'Purple'],
    compatibility: ['Aries', 'Leo', 'Libra'],
    traits: {
      positive: ['Generous', 'Idealistic', 'Great sense of humor', 'Adventurous'],
      negative: ['Promises more than deliver', 'Impatient', 'Undiplomatic']
    }
  },
  {
    id: 'capricorn',
    name: 'Capricorn',
    dateRange: 'Dec 22 - Jan 19',
    element: 'Earth',
    rulingPlanet: 'Saturn',
    symbol: 'The Goat',
    icon: '/images/img_vector_34x32.svg',
    luckyNumbers: [4, 8, 13],
    luckyColors: ['Brown', 'Black'],
    compatibility: ['Taurus', 'Virgo', 'Scorpio'],
    traits: {
      positive: ['Responsible', 'Disciplined', 'Self-control', 'Good managers'],
      negative: ['Know-it-all', 'Unforgiving', 'Condescending', 'Pessimistic']
    }
  },
  {
    id: 'aquarius',
    name: 'Aquarius',
    dateRange: 'Jan 20 - Feb 18',
    element: 'Air',
    rulingPlanet: 'Saturn & Uranus',
    symbol: 'The Water Bearer',
    icon: '/images/img_vector_black_900_01_34x28.svg',
    luckyNumbers: [4, 7, 11],
    luckyColors: ['Light Blue', 'Silver'],
    compatibility: ['Gemini', 'Libra', 'Sagittarius'],
    traits: {
      positive: ['Progressive', 'Original', 'Independent', 'Humanitarian'],
      negative: ['Runs from emotional expression', 'Temperamental', 'Aloof']
    }
  },
  {
    id: 'pisces',
    name: 'Pisces',
    dateRange: 'Feb 19 - Mar 20',
    element: 'Water',
    rulingPlanet: 'Jupiter & Neptune',
    symbol: 'The Fish',
    icon: '/images/img_vector_black_900_01_26x36.svg',
    luckyNumbers: [3, 9, 12],
    luckyColors: ['Sea Green', 'Lavender'],
    compatibility: ['Cancer', 'Scorpio', 'Taurus'],
    traits: {
      positive: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle', 'Wise'],
      negative: ['Fearful', 'Overly trusting', 'Sad', 'Desire to escape reality']
    }
  }
];

export const getZodiacById = (id: string): ZodiacSign | undefined => {
  return ZODIAC_SIGNS.find(zodiac => zodiac.id === id);
};

export const getHoroscopeCards = () => {
  return ZODIAC_SIGNS.map(zodiac => ({
    id: zodiac.id,
    icon: zodiac.icon,
    name: zodiac.name,
    dateRange: zodiac.dateRange
  }));
};

// Sample horoscope predictions (would typically come from API)
export interface HoroscopePrediction {
  general: string;
  love: string;
  career: string;
  health: string;
  finance: string;
}

export const generateHoroscopePrediction = (
  zodiacId: string, 
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
): HoroscopePrediction => {
  // This would typically fetch from an API
  // For now, we'll return sample predictions
  
  const predictions: Record<string, Record<string, HoroscopePrediction>> = {
    daily: {
      default: {
        general: "Today brings new opportunities for growth and self-discovery. Trust your instincts and take calculated risks.",
        love: "Your relationships are highlighted today. Express your feelings openly and honestly with your partner.",
        career: "Professional success is within reach. Focus on your goals and maintain good relationships with colleagues.",
        health: "Pay attention to your physical and mental well-being. Balance work with proper rest and nutrition.",
        finance: "Financial decisions made today will have long-term implications. Be cautious with investments."
      }
    },
    weekly: {
      default: {
        general: "This week emphasizes personal transformation and new beginnings. Embrace change with confidence.",
        love: "Romantic relationships flourish this week. Single? You might meet someone special at a social gathering.",
        career: "Career advancement opportunities present themselves. Your hard work is finally getting recognition.",
        health: "Focus on maintaining a healthy lifestyle. Regular exercise and proper diet are crucial this week.",
        finance: "Good week for financial planning. Consider consulting with financial advisors for investment strategies."
      }
    },
    monthly: {
      default: {
        general: "This month brings significant changes in your personal and professional life. Stay adaptable and positive.",
        love: "Love relationships undergo positive transformations. Communication improves significantly with your partner.",
        career: "Professional growth accelerates this month. New projects and responsibilities come your way.",
        health: "Health requires attention this month. Regular check-ups and preventive care are recommended.",
        finance: "Financial stability improves gradually. Avoid major expenses in the first half of the month."
      }
    },
    yearly: {
      default: {
        general: "2025 is a year of tremendous growth and achievement. Your patience and perseverance will pay off.",
        love: "Relationships reach new levels of understanding and commitment. Wedding bells might ring for some.",
        career: "Career reaches new heights with promotions and recognition. Leadership opportunities await.",
        health: "Overall health remains good with proper care. Focus on preventive measures and regular exercise.",
        finance: "Financial growth is steady throughout the year. Investment decisions prove profitable."
      }
    }
  };

  return predictions[period]?.[zodiacId] || predictions[period].default;
};