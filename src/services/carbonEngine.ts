import { LifestyleData } from '../types';
import { EMISSION_FACTORS } from '../constants';

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
 * impact rank, and personalized structured recommendations.
 */
export const CarbonIntelligenceEngine = {
  /**
   * 1. Calculate carbon emissions for the 5 key categories (in kg CO2 per year).
   */
  calculateEmissions(lifestyle: Omit<LifestyleData, 'uid' | 'updatedAt'>): CarbonBreakdown {
    // A. Transportation
    const transportKmFactor = EMISSION_FACTORS.transport[lifestyle.commuteMode] ?? EMISSION_FACTORS.transport.car;
    const commuteAnnual = lifestyle.distancePerDayKm * 250 * transportKmFactor;
    const flightsAnnual = lifestyle.annualFlights * EMISSION_FACTORS.flight;
    const transportTotal = Math.round(commuteAnnual + flightsAnnual);

    // B. Food
    const dietTypeFactor = EMISSION_FACTORS.diet[lifestyle.dietType] ?? EMISSION_FACTORS.diet.occasional_meat;
    const foodWasteFactor = EMISSION_FACTORS.foodWaste[lifestyle.foodWasteLevel] ?? EMISSION_FACTORS.foodWaste.medium;
    const foodTotal = Math.round(dietTypeFactor + foodWasteFactor);

    // C. Electricity
    const rawElectricityAnnual = lifestyle.electricityKwhPerMonth * 12 * EMISSION_FACTORS.electricityKwh;
    const greenEnergySaved = rawElectricityAnnual * (lifestyle.greenEnergyPercent / 100);
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
   * 3. Rank actions by impact. Returns a list of highly focused actions ordered by custom carbon savings potential.
   */
  rankActions(lifestyle: Omit<LifestyleData, 'uid' | 'updatedAt'>): RankedAction[] {
    const rawActions: Omit<RankedAction, 'personalizedReasoning' | 'comparisonMetric'>[] = [];

    // --- TRANSPORTATION ---
    if (lifestyle.commuteMode !== 'bike_walk') {
      const currentFactor = EMISSION_FACTORS.transport[lifestyle.commuteMode] ?? 0.17;
      let targetFactor = 0.04; // public transport
      let title = '';
      let desc = '';

      if (lifestyle.commuteMode === 'car' || lifestyle.commuteMode === 'hybrid_car') {
        title = 'Upgrade commuter travel to EV or public transport';
        desc = `Shift your daily ${lifestyle.distancePerDayKm}km drive. Transitioning from combustion to an electric battery vehicle or high-efficiency metro saves substantial annual fuel burnt.`;
      } else {
        title = 'Transition from electric driving to cycling or active walking';
        targetFactor = 0;
        desc = `For your daily ${lifestyle.distancePerDayKm}km commute, switching some cycles to foot power produces active cardiovascular and complete clean benefits.`;
      }

      const co2Saved = Math.round((currentFactor - targetFactor) * lifestyle.distancePerDayKm * 250);
      if (co2Saved > 30) {
        rawActions.push({
          id: 'act_transport_commute',
          title,
          category: 'Transport',
          co2SavedKgPerYear: co2Saved,
          description: desc,
          difficulty: 'medium',
          actionItems: [
            'Download local public transit applications & check peak schedules.',
            'Locate communal park-and-ride spots on your route.',
            'Calculate localized monthly public travel transit ticket rates compared to fuel costs.'
          ]
        });
      }
    }

    if (lifestyle.annualFlights > 0) {
      rawActions.push({
        id: 'act_transport_flights',
        title: 'Opt for rail or video calls to reduce annual flights by one',
        category: 'Transport',
        co2SavedKgPerYear: 250,
        description: 'Reducing just one short-to-medium haul aviation flight has an enormous immediate offset impact compared to small lifestyle shifts.',
        difficulty: 'easy',
        actionItems: [
          'Choose direct rail journeys for trips under 400 kilometers.',
          'Consolidate business gatherings into hybrid meetings.',
          'Commit to one domestic vacation destination per year via ground transport.'
        ]
      });
    }

    // --- FOOD ---
    if (lifestyle.dietType !== 'vegan') {
      const currentDietFactor = EMISSION_FACTORS.diet[lifestyle.dietType] ?? 1700;
      const veganDietFactor = EMISSION_FACTORS.diet.vegan;
      const co2Saved = Math.round(currentDietFactor - veganDietFactor);

      rawActions.push({
        id: 'act_diet_vegan',
        title: 'Adopt a whole-food plant-based diet',
        category: 'Diet',
        co2SavedKgPerYear: co2Saved,
        description: 'Transitioning from meat diets directly scales down land conversion and methane outputs.',
        difficulty: 'hard',
        actionItems: [
          'Substitute beef or pork with protein-dense legumes, grain, and high-quality tofu.',
          'Adopt "Meatless Mondays" as a low-friction family starting challenge.',
          'Explore local farmers markets to curate diverse biological seasonal vegetables.'
        ]
      });
    }

    if (lifestyle.foodWasteLevel !== 'low') {
      const currentWasteFactor = EMISSION_FACTORS.foodWaste[lifestyle.foodWasteLevel] ?? 150;
      const lowWasteFactor = EMISSION_FACTORS.foodWaste.low;
      const co2Saved = Math.round(currentWasteFactor - lowWasteFactor);

      rawActions.push({
        id: 'act_food_waste',
        title: 'Optimize food menus to achieve zero meal waste',
        category: 'Diet',
        co2SavedKgPerYear: co2Saved,
        description: 'Limiting decomposing organic scraps in landfills directly cuts hazardous methane emissions.',
        difficulty: 'easy',
        actionItems: [
          'Draft structured meal preparation menus prior to visiting supply stores.',
          'Label and organize refrigerator items using the "First-In, First-Out" logic.',
          'Freeze supplementary surplus ingredients before they degrade.'
        ]
      });
    }

    // --- ENERGY ---
    if (lifestyle.greenEnergyPercent < 100) {
      const currentElectricityAnnual = lifestyle.electricityKwhPerMonth * 12 * EMISSION_FACTORS.electricityKwh;
      const outstandingPercent = 100 - lifestyle.greenEnergyPercent;
      const co2Saved = Math.round(currentElectricityAnnual * (outstandingPercent / 100));

      if (co2Saved > 20) {
        rawActions.push({
          id: 'act_energy_solar',
          title: 'Transition your utility supply to 100% green energy sources',
          category: 'Energy',
          co2SavedKgPerYear: co2Saved,
          description: 'Shifting electricity contracts to certified green tariffs directly prompts regional grids to install wind and solar infrastructure.',
          difficulty: 'easy',
          actionItems: [
            'Review existing electrical bills to determine your current energy blend.',
            'Search for certified green renewable utility options in municipal regulations.',
            'Compare solar purchase options or local community solar collective memberships.'
          ]
        });
      }
    }

    if (lifestyle.heatingType !== 'district_solar' && lifestyle.heatingType !== 'none') {
      const heatingAnnual = (EMISSION_FACTORS.heating[lifestyle.heatingType] ?? 180) * 12;
      const co2Saved = Math.round(heatingAnnual * 0.15);

      if (co2Saved > 10) {
        rawActions.push({
          id: 'act_energy_thermostat',
          title: 'Decrease thermostat setting and inspect household draft sealing',
          category: 'Energy',
          co2SavedKgPerYear: co2Saved,
          description: 'Lowering household heating settings by just 1-2°C during cooler months reduces fuel combustion significantly.',
          difficulty: 'medium',
          actionItems: [
            'Set thermostat temperature targets in winter to 18-20°C (68°F).',
            'Install basic self-adhesive draft sealing weather-strips alongside doorway margins.',
            'Program intelligent schedules on thermostat controls for sleep intervals.'
          ]
        });
      }
    }

    // --- CONSUMPTION & WASTE ---
    if (lifestyle.shoppingHabits !== 'minimalist') {
      const currentShoppingFactor = EMISSION_FACTORS.shopping[lifestyle.shoppingHabits] ?? 800;
      const minimalistFactor = EMISSION_FACTORS.shopping.minimalist;
      const co2Saved = Math.round(currentShoppingFactor - minimalistFactor);

      rawActions.push({
        id: 'act_consumption_shopping',
        title: 'Adopt a circular minimalist consumption lifestyle',
        category: 'Consumption',
        co2SavedKgPerYear: co2Saved,
        description: 'Reducing supply demand for brand new products halts massive industrial assembly lines and long-distance transport emissions.',
        difficulty: 'medium',
        actionItems: [
          'Enforce a strict 48-hour cooling delay period before finalizing purchase ideas.',
          'Borrow, rent, or purchase high-use machinery & items from secondhand markets.',
          'Repair household devices, garments, and tools instead of ordering immediate replacements.'
        ]
      });
    }

    if (lifestyle.recyclingLevel !== 'full') {
      const maxSavings = EMISSION_FACTORS.recyclingReduction.full;
      const currentSavings = EMISSION_FACTORS.recyclingReduction[lifestyle.recyclingLevel] ?? 80;
      const co2Saved = Math.round(maxSavings - currentSavings);

      if (co2Saved > 10) {
        rawActions.push({
          id: 'act_waste_recycling',
          title: 'Establish zero-waste municipal sorting and kitchen composting',
          category: 'Consumption',
          co2SavedKgPerYear: co2Saved,
          description: 'Correctly sorting metals, paper, glass, and composting organics keeps scrap items from being incinerated or rotting in landfills.',
          difficulty: 'easy',
          actionItems: [
            'Place separated sorting bins for food scrap organics, plastic, paper, and glass.',
            'Conduct a local municipal review to inspect exactly what material types are recyclable.',
            'Leverage household yard heaps or city organic disposal bins to compost vegetable leftovers.'
          ]
        });
      }
    }

    // Add deterministic reasoning logic & structured comparisons to fulfill models
    const fullyConfiguredActions = rawActions.map((action): RankedAction => {
      const baseAltSavings = 80; // Baseline savings of simple recycling
      const primaryMetric = action.title;
      const secondaryMetric = 'Implementing basic recycling modifications';

      const personalizedReasoning = action.co2SavedKgPerYear > baseAltSavings
        ? `Adopting "${action.title}" saves approx. ${action.co2SavedKgPerYear}kg CO2/year, which mathematically outperforms simple recycling changes (which only offset around ${baseAltSavings}kg total).`
        : `This elegant adjustment offers a comfortable ${action.co2SavedKgPerYear}kg CO2/year reduction, giving active supporting benefit matching standard recycling offsets.`;

      return {
        ...action,
        personalizedReasoning,
        comparisonMetric: {
          primaryActionMetric: primaryMetric,
          secondaryAlternativeMetric: secondaryMetric,
          primaryCo2Saved: action.co2SavedKgPerYear,
          secondaryCo2Saved: baseAltSavings
        }
      };
    });

    // Sort by largest carbon savings potential (descending)
    return fullyConfiguredActions.sort((a, b) => b.co2SavedKgPerYear - a.co2SavedKgPerYear);
  },

  /**
   * 4. Compile everything and produce structured, mathematically sound insights.
   */
  process(lifestyle: Omit<LifestyleData, 'uid' | 'updatedAt'>): EngineResult {
    const breakdown = this.calculateEmissions(lifestyle);
    const highestCatObj = this.getHighestCategory(breakdown);
    const rankedActions = this.rankActions(lifestyle);

    const highestImpact = rankedActions[0] || {
      title: 'Maintain your excellent zero-emission lifestyle habits',
      co2SavedKgPerYear: 50
    };

    const monthlySaving = Math.round(highestImpact.co2SavedKgPerYear / 12);

    const contribution = breakdown.total > 0 
      ? Math.round((highestCatObj.value / breakdown.total) * 100)
      : 0;

    const insight: StructuredInsight = {
      biggestSource: highestCatObj.category,
      contribution,
      highestImpactAction: highestImpact.title,
      estimatedReduction: `${monthlySaving}kg CO2/month`
    };

    return {
      breakdown,
      rankedActions,
      insight
    };
  }
};
