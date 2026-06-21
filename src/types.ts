export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  streakCount: number;
  totalCo2SavedKg: number;
  lastActiveDate: string | null;
  xp: number;
  levelName: string;
  badges: string[];
  weeklyGoalCo2: number;
  weeklyProgressCo2: number;
  completedChallengeIds: string[];
}

export interface LifestyleData {
  uid: string;
  // Transport Habits
  commuteMode: 'car' | 'public_transport' | 'bike_walk' | 'electric_car' | 'hybrid_car';
  distancePerDayKm: number; // Daily commute distance
  annualFlights: number; // Number of flights per year
  
  // Dietary Habits
  dietType: 'heavy_meat' | 'occasional_meat' | 'vegetarian' | 'vegan';
  localFoodPercent: number; // Percentage of food bought locally (0 - 100)
  foodWasteLevel: 'high' | 'medium' | 'low'; // High waste to Low waste
  
  // Home Energy
  electricityKwhPerMonth: number;
  greenEnergyPercent: number; // percentage of energy from green sources (0 - 100)
  heatingType: 'gas' | 'electric' | 'coal_oil' | 'district_solar' | 'none';
  thermostatOffsetC: number; // temperature adjustment relative to standard setup
  
  // Consumption & Waste
  shoppingHabits: 'high_consumer' | 'moderate' | 'minimalist';
  recyclingLevel: 'none' | 'some' | 'full';

  updatedAt: string;
}

export interface Recommendation {
  id: string;
  uid: string;
  title: string;
  description: string;
  category: 'Transport' | 'Diet' | 'Energy' | 'Consumption';
  co2SavedKgPerYear: number;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // The Personalized reasoning core - comparing this action directly to other parameters in user's profile
  // E.g., "Replacing two weekly car commutes with public transport saves 350kg CO2/year, which outperforms reducing home energy by 20% (140kg)."
  personalizedReasoning: string;
  
  // Structured comparison details
  comparisonMetric: {
    primaryActionMetric: string; // e.g., "Replacing 2x 20km car commutes weekly"
    secondaryAlternativeMetric: string; // e.g., "Reducing electricity usage by 20%"
    primaryCo2Saved: number;
    secondaryCo2Saved: number;
  };

  actionItems: string[]; // Steps to build/do it
  status: 'active' | 'completed' | 'dismissed';
  createdAt: string;
  updatedAt: string;

  // New challenge-alignment engine fields
  whySelected?: string;
  whyRejected?: string;
  estimatedImpact?: string;
}

export interface UnifiedContext {
  userId: string;
  profile: {
    displayName: string;
    xp: number;
    levelName: string;
    streakCount: number;
    badges: string[];
    weeklyGoalCo2: number;
    weeklyProgressCo2: number;
  };
  lifestyle: {
    commuteMode: 'car' | 'public_transport' | 'bike_walk' | 'electric_car' | 'hybrid_car';
    distancePerDayKm: number;
    annualFlights: number;
    dietType: 'heavy_meat' | 'occasional_meat' | 'vegetarian' | 'vegan';
    localFoodPercent: number;
    foodWasteLevel: 'high' | 'medium' | 'low';
    electricityKwhPerMonth: number;
    greenEnergyPercent: number;
    heatingType: 'gas' | 'electric' | 'coal_oil' | 'district_solar' | 'none';
    thermostatOffsetC: number;
    shoppingHabits: 'high_consumer' | 'moderate' | 'minimalist';
    recyclingLevel: 'none' | 'some' | 'full';
  };
  progress: {
    totalCo2SavedKg: number;
    completedCount: number;
    historyLogs: Array<{
      recommendationId?: string;
      recommendationTitle: string;
      co2SavedKg: number;
      loggedAt: string;
    }>;
  };
  carbonScore: {
    breakdown: {
      transport: number;
      flights: number;
      diet: number;
      foodWaste: number;
      electricity: number;
      heating: number;
      consumption: number;
      total: number;
    };
  };
}

export interface DecisionEngineOutput {
  largestEmissionSource: string;
  contributionPercentage: number;
  highestImpactAction: string;
  estimatedReduction: string;
  reasoning: string;
}

export interface ImpactLog {
  id: string;
  uid: string;
  recommendationId: string;
  recommendationTitle: string;
  category: 'Transport' | 'Diet' | 'Energy' | 'Consumption';
  co2SavedKg: number;
  loggedAt: string;
}

export interface CoachResponse {
  success: boolean;
  recommendations: Omit<Recommendation, 'id' | 'uid' | 'status' | 'createdAt' | 'updatedAt'>[];
}

export interface CoachChatMessage {
  id: string;
  uid: string;
  sender: 'user' | 'coach';
  text: string;
  createdAt: string;
}

