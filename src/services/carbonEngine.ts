import { LifestyleData, UserProfile, ImpactLog } from '../types';
import { EMISSION_FACTORS } from '../constants';
import { ContextEngine } from './contextEngine';
import { RecommendationEngine } from './recommendationEngine';
import { DecisionEngine } from './decisionEngine';

export interface CarbonBreakdown {
  transport: number;
  food: number;
  electricity: number;
  shopping: number;
  waste: number;
  total: number;
}

export interface RankedAction {
  id: string;
  title: string;
  category: 'Transport' | 'Diet' | 'Energy' | 'Consumption';
  co2SavedKgPerYear: number;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  personalizedReasoning: string;
  comparisonMetric: {
    primaryActionMetric: string;
    secondaryAlternativeMetric: string;
    primaryCo2Saved: number;
    secondaryCo2Saved: number;
  };
  actionItems: string[];
}

export interface StructuredInsight {
  biggestSource: 'transport' | 'food' | 'electricity' | 'shopping' | 'waste';
  contribution: number; // percentage
  highestImpactAction: string;
  estimatedReduction: string; // e.g., "15kg CO2/month"
}

export interface EngineResult {
  breakdown: CarbonBreakdown;
  rankedActions: RankedAction[];
  insight: StructuredInsight;
}

/**
 * Carbon Intelligence Engine: Deterministic logic for carbon footprints,
 * impact rank, and personalized structured recommendations. Delegating to formal engines.
 */
export const CarbonIntelligenceEngine = {
  /**
   * 1. Calculate carbon emissions for the 5 key categories (in kg CO2 per year).
   */
  calculateEmissions(lifestyle: Omit<LifestyleData, 'uid' | 'updatedAt'>): CarbonBreakdown {
    // Defensive normalization checks for robust input validation bounds
    const distanceVal = Math.max(0, lifestyle.distancePerDayKm || 0);
    const flightsVal = Math.max(0, lifestyle.annualFlights || 0);
    const electricityVal = Math.max(0, lifestyle.electricityKwhPerMonth || 0);
    const greenVal = Math.max(0, Math.min(100, lifestyle.greenEnergyPercent || 0));

    // A. Transportation
    const transportKmFactor = EMISSION_FACTORS.transport[lifestyle.commuteMode] ?? EMISSION_FACTORS.transport.car;
    const commuteAnnual = distanceVal * 250 * transportKmFactor;
    const flightsAnnual = flightsVal * EMISSION_FACTORS.flight;
    const transportTotal = Math.round(commuteAnnual + flightsAnnual);

    // B. Food
    const dietTypeFactor = EMISSION_FACTORS.diet[lifestyle.dietType] ?? EMISSION_FACTORS.diet.occasional_meat;
    const foodWasteFactor = EMISSION_FACTORS.foodWaste[lifestyle.foodWasteLevel] ?? EMISSION_FACTORS.foodWaste.medium;
    const foodTotal = Math.round(dietTypeFactor + foodWasteFactor);

    // C. Electricity
    const rawElectricityAnnual = electricityVal * 12 * EMISSION_FACTORS.electricityKwh;
    const greenEnergySaved = rawElectricityAnnual * (greenVal / 100);
    const electricityAnnual = Math.max(0, rawElectricityAnnual - greenEnergySaved);
    const heatingAnnual = (EMISSION_FACTORS.heating[lifestyle.heatingType] ?? EMISSION_FACTORS.heating.gas) * 12;
    const electricityTotal = Math.round(electricityAnnual + heatingAnnual);

    // D. Shopping
    const shoppingTotal = Math.round(EMISSION_FACTORS.shopping[lifestyle.shoppingHabits] ?? EMISSION_FACTORS.shopping.moderate);

    // E. Waste
    // Baseline trash emissions (250 kg CO2 / year) minus recycling offsets
    const baseWasteEmissions = 250;
    const recyclingSaved = EMISSION_FACTORS.recyclingReduction[lifestyle.recyclingLevel] ?? EMISSION_FACTORS.recyclingReduction.some;
    const wasteTotal = Math.max(10, Math.round(baseWasteEmissions - recyclingSaved));

    const total = transportTotal + foodTotal + electricityTotal + shoppingTotal + wasteTotal;

    return {
      transport: transportTotal,
      food: foodTotal,
      electricity: electricityTotal,
      shopping: shoppingTotal,
      waste: wasteTotal,
      total
    };
  },

  /**
   * 2. Identify the highest emission category.
   */
  getHighestCategory(breakdown: Omit<CarbonBreakdown, 'total'>): { category: StructuredInsight['biggestSource']; value: number } {
    const categories: { key: StructuredInsight['biggestSource']; val: number }[] = [
      { key: 'transport', val: breakdown.transport },
      { key: 'food', val: breakdown.food },
      { key: 'electricity', val: breakdown.electricity },
      { key: 'shopping', val: breakdown.shopping },
      { key: 'waste', val: breakdown.waste }
    ];

    let maxCat = categories[0];
    for (let i = 1; i < categories.length; i++) {
      if (categories[i].val > maxCat.val) {
        maxCat = categories[i];
      }
    }

    return { category: maxCat.key, value: maxCat.val };
  },

  /**
   * 3. Rank actions by impact. Delegates to RecommendationEngine.
   */
  rankActions(
    rawLifestyle: Omit<LifestyleData, 'uid' | 'updatedAt'>,
    userProfile: UserProfile | null = null,
    impactLogs: ImpactLog[] = []
  ): RankedAction[] {
    const lifestyleWithDefaults: LifestyleData = {
      ...rawLifestyle,
      uid: 'temp_user',
      updatedAt: new Date().toISOString()
    } as LifestyleData;

    // Build context
    const context = ContextEngine.buildContext(userProfile, lifestyleWithDefaults, impactLogs);
    
    // Delegate to Recommendation Engine
    const generated = RecommendationEngine.generateRecommendations(context);
    return generated.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      co2SavedKgPerYear: r.co2SavedKgPerYear,
      description: r.description,
      difficulty: r.difficulty,
      personalizedReasoning: r.personalizedReasoning,
      comparisonMetric: {
        primaryActionMetric: r.comparisonMetric.primaryActionMetric,
        secondaryAlternativeMetric: r.comparisonMetric.secondaryAlternativeMetric,
        primaryCo2Saved: r.comparisonMetric.primaryCo2Saved,
        secondaryCo2Saved: r.comparisonMetric.secondaryCo2Saved
      },
      actionItems: r.actionItems,
    }));
  },

  /**
   * 4. Compile everything and produce structured, mathematically sound insights.
   */
  process(
    lifestyle: Omit<LifestyleData, 'uid' | 'updatedAt'>,
    userProfile: UserProfile | null = null,
    impactLogs: ImpactLog[] = []
  ): EngineResult {
    const rawLifestyle: LifestyleData = {
      ...lifestyle,
      uid: 'temp_user',
      updatedAt: new Date().toISOString()
    } as LifestyleData;

    const context = ContextEngine.buildContext(userProfile, rawLifestyle, impactLogs);
    const rankedActions = this.rankActions(lifestyle, userProfile, impactLogs);
    const decision = DecisionEngine.makeDecision(context);

    // Map largest emission category to the insight biggestSource
    const breakdown = this.calculateEmissions(lifestyle);
    const highestCatObj = this.getHighestCategory(breakdown);

    return {
      breakdown,
      rankedActions,
      insight: {
        biggestSource: highestCatObj.category,
        contribution: decision.contributionPercentage,
        highestImpactAction: decision.highestImpactAction,
        estimatedReduction: `${Math.round((rankedActions[0]?.co2SavedKgPerYear || 120) / 12)}kg CO2/month`
      }
    };
  }
};
