import { UnifiedContext, Recommendation } from '../types';
import { EMISSION_FACTORS } from '../constants';
import { getWhySelected, getWhyRejected } from './recommendationReasons';

export const RecommendationEngine = {
  /**
   * Generates a fully personalized, ranked list of recommendations based on the Unified Context.
   * Every recommendation contains rich explanations of why it was selected, why it might have been
   * de-prioritized compared to the peak option, expected impact, and comparative metrics.
   */
  generateRecommendations(context: UnifiedContext): Recommendation[] {
    const { lifestyle, carbonScore } = context;
    const rawRecommendations: Omit<Recommendation, 'whySelected' | 'whyRejected' | 'estimatedImpact' | 'status' | 'createdAt' | 'updatedAt' | 'uid' | 'personalizedReasoning'>[] = [];

    // --- 1. Commute Mode Recommendation ---
    if (lifestyle.commuteMode !== 'bike_walk') {
      const currentFactor = EMISSION_FACTORS.transport[lifestyle.commuteMode] ?? 0.17;
      let targetFactor = 0.04; // public transit average
      let title = 'Upgrade commuting habits to EV or public transit';
      let desc = `Transition your daily ${lifestyle.distancePerDayKm} km drive from combustion fuel modes directly to public transport or battery electric vehicles (EV).`;
      
      if (lifestyle.commuteMode === 'electric_car' || lifestyle.commuteMode === 'hybrid_car') {
        title = 'Swap electric car driving for active cycling or walking';
        targetFactor = 0;
        desc = `Replace short-trip vehicle travel with active foot-power. This eliminates lithium-ion energy grid draw and boosts healthy mobility.`;
      }

      const co2Saved = Math.round((currentFactor - targetFactor) * lifestyle.distancePerDayKm * 250);
      if (co2Saved > 30) {
        rawRecommendations.push({
          id: 'act_transport_commute',
          title,
          category: 'Transport',
          co2SavedKgPerYear: co2Saved,
          description: desc,
          difficulty: 'medium',
          actionItems: [
            'Download local public transit route plan apps & peak timetables.',
            'Locate suburban park-and-ride facilities on your commute paths.',
            'Examine EV charging incentives in your municipal area.'
          ],
          comparisonMetric: {
            primaryActionMetric: `Shifting ${lifestyle.distancePerDayKm} km of daily commuting to greener alternatives`,
            secondaryAlternativeMetric: 'Implementing standard household paper and steel recycling',
            primaryCo2Saved: co2Saved,
            secondaryCo2Saved: 80
          }
        });
      }
    }

    // --- 2. Aviation Recommendation ---
    if (lifestyle.annualFlights > 0) {
      const co2Saved = lifestyle.annualFlights * 250; // saves 250kg per flight skipped
      rawRecommendations.push({
        id: 'act_transport_flights',
        title: 'Opt for long-distance rail or virtual conferences',
        category: 'Transport',
        co2SavedKgPerYear: co2Saved,
        description: `Forgo ${lifestyle.annualFlights} of your scheduled mid-haul flights in favor of high-speed overland rail networks or digital high-definition streaming meetings.`,
        difficulty: 'easy',
        actionItems: [
          'Choose railway alternatives for any travel distances under 500 kilometers.',
          'Advocate for remote-participation options for structural workspace conferences.',
          'Plan nature vacations locally to minimize carbon-heavy flight travel.'
        ],
        comparisonMetric: {
          primaryActionMetric: `Skipping flights (currently ${lifestyle.annualFlights}/yr)`,
          secondaryAlternativeMetric: 'Transitioning to low-flush water systems',
          primaryCo2Saved: co2Saved,
          secondaryCo2Saved: 20
        }
      });
    }

    // --- 3. Dietary Habits Recommendation ---
    if (lifestyle.dietType !== 'vegan') {
      const currentDietFactor = EMISSION_FACTORS.diet[lifestyle.dietType] ?? 1700;
      const veganDietFactor = EMISSION_FACTORS.diet.vegan;
      const co2Saved = Math.round(currentDietFactor - veganDietFactor);

      rawRecommendations.push({
        id: 'act_diet_vegan',
        title: 'Transition toward a nutrient-rich organic plant-based diet',
        category: 'Diet',
        co2SavedKgPerYear: co2Saved,
        description: 'Reduce red meat or dairy dependencies to significantly shrink agricultural deforestation, crop feed margins, and livestock methane outputs.',
        difficulty: 'hard',
        actionItems: [
          'Introduce high-protein legume/bean dishes to replace standard beef portions.',
          'Utilize "Meatless Mondays" as a low-intensity launch platform.',
          'Source certified organic vegetables from regional local producers.'
        ],
        comparisonMetric: {
          primaryActionMetric: 'Transitioning completely from animal diets to plant-based meals',
          secondaryAlternativeMetric: 'Switching home lightbulbs to high-efficiency LEDs',
          primaryCo2Saved: co2Saved,
          secondaryCo2Saved: 50
        }
      });
    }

    // --- 4. Food Waste Recommendation ---
    if (lifestyle.foodWasteLevel !== 'low') {
      const currentWasteFactor = EMISSION_FACTORS.foodWaste[lifestyle.foodWasteLevel] ?? 150;
      const lowWasteFactor = EMISSION_FACTORS.foodWaste.low;
      const co2Saved = Math.round(currentWasteFactor - lowWasteFactor);

      rawRecommendations.push({
        id: 'act_food_waste',
        title: 'Audit pantry and optimize meals to eradicate waste',
        category: 'Diet',
        co2SavedKgPerYear: co2Saved,
        description: 'Eliminate organic material from rotting anaerobic landfill cells, where decomposing leftovers release active methane gas.',
        difficulty: 'easy',
        actionItems: [
          'Draw up a tight grocery plan list before visiting hypermarkets.',
          'Adopt the "First-In, First-Out" organization scheme to consume fresh items.',
          'Freeze surplus proteins and grains before expiration.'
        ],
        comparisonMetric: {
          primaryActionMetric: 'Eliminating food scraps and food trash outputs',
          secondaryAlternativeMetric: 'Unplugging electronics on standby modes',
          primaryCo2Saved: co2Saved,
          secondaryCo2Saved: 15
        }
      });
    }

    // --- 5. Green Utility Recommendation ---
    if (lifestyle.greenEnergyPercent < 100) {
      const currentElectricityAnnual = lifestyle.electricityKwhPerMonth * 12 * EMISSION_FACTORS.electricityKwh;
      const outstandingPercent = 100 - lifestyle.greenEnergyPercent;
      const co2Saved = Math.round(currentElectricityAnnual * (outstandingPercent / 100));

      if (co2Saved > 20) {
        rawRecommendations.push({
          id: 'act_energy_solar',
          title: 'Upgrade utilities contract to 100% green renewable sources',
          category: 'Energy',
          co2SavedKgPerYear: co2Saved,
          description: 'Re-align utility bills with wind, geothermal, or municipal solar plans to clean up the electrical supply feeding your home grid power lines.',
          difficulty: 'easy',
          actionItems: [
            'Scan electrical bills to check your current provider fuel source.',
            'Switch to dual-certified green renewable providers available dynamically.',
            'Join local residential renewable solar or community wind cooperatives.'
          ],
          comparisonMetric: {
            primaryActionMetric: `Covering utility draw (${lifestyle.electricityKwhPerMonth} kWh/mo) with renewable grids`,
            secondaryAlternativeMetric: 'Reducing appliance standby energy draw of consumer goods',
            primaryCo2Saved: co2Saved,
            secondaryCo2Saved: 30
          }
        });
      }
    }

    // --- 6. Heating & Temperature Sealing ---
    if (lifestyle.heatingType !== 'district_solar' && lifestyle.heatingType !== 'none') {
      const heatingAnnual = (EMISSION_FACTORS.heating[lifestyle.heatingType] ?? 180) * 12;
      const co2Saved = Math.round(heatingAnnual * 0.15); // assume 15% thermal gains

      if (co2Saved > 10) {
        rawRecommendations.push({
          id: 'act_energy_thermostat',
          title: 'Optimize thermostat setups and install window heat-seals',
          category: 'Energy',
          co2SavedKgPerYear: co2Saved,
          description: 'Lower indoor climate targets by 1.5-2°C in cold weather. Install seals on door margins to reduce fuel combustion.',
          difficulty: 'medium',
          actionItems: [
            'Program intelligent target adjustments using smart thermostats.',
            'Affix weather-strips to drafty window and door junctions.',
            'Dress in insulating layers before adjusting furnace heat targets.'
          ],
          comparisonMetric: {
            primaryActionMetric: `Draft insulating and lowering heating draw from ${lifestyle.heatingType} units`,
            secondaryAlternativeMetric: 'Washing laundry with cold water',
            primaryCo2Saved: co2Saved,
            secondaryCo2Saved: 40
          }
        });
      }
    }

    // --- 7. Minimalist Consumption Choice ---
    if (lifestyle.shoppingHabits !== 'minimalist') {
      const currentShopping = EMISSION_FACTORS.shopping[lifestyle.shoppingHabits] ?? 800;
      const minimalistShopping = EMISSION_FACTORS.shopping.minimalist;
      const co2Saved = Math.round(currentShopping - minimalistShopping);

      rawRecommendations.push({
        id: 'act_consumption_shopping',
        title: 'Cultivate a highly circular, minimalist product lifestyle',
        category: 'Consumption',
        co2SavedKgPerYear: co2Saved,
        description: 'Decrease consumption frequency of non-essential physical products. This avoids manufacturing emissions, raw mineral extractions, and global supply chains.',
        difficulty: 'medium',
        actionItems: [
          'Apply a strict 48-hour deliberation rule for discretionary goods.',
          'Utilize certified secondary or vintage marketplaces for occasional demands.',
          'Restore or patch damaged tools, devices, and garments.'
        ],
        comparisonMetric: {
          primaryActionMetric: `Reducing industrial purchases from "${lifestyle.shoppingHabits}" to minimalist level`,
          secondaryAlternativeMetric: 'Utilizing paperless billing systems',
          primaryCo2Saved: co2Saved,
          secondaryCo2Saved: 10
        }
      });
    }

    // --- 8. Recycling / Material Sorting ---
    if (lifestyle.recyclingLevel !== 'full') {
      const maxSavings = EMISSION_FACTORS.recyclingReduction.full;
      const currentSavings = EMISSION_FACTORS.recyclingReduction[lifestyle.recyclingLevel] ?? 80;
      const co2Saved = Math.round(maxSavings - currentSavings);

      if (co2Saved > 10) {
        rawRecommendations.push({
          id: 'act_waste_recycling',
          title: 'Organize high-integrity garbage sorting & garden composts',
          category: 'Consumption',
          co2SavedKgPerYear: co2Saved,
          description: 'Sort metals, pulp, and glass meticulously, and compost wet kitchen waste to maximize resource recovery.',
          difficulty: 'easy',
          actionItems: [
            'Introduce color-coded containers in your kitchen.',
            'Look up regional rules regarding problematic compound plastics.',
            'Direct household meal leftovers into backyard fertilizer composts.'
          ],
          comparisonMetric: {
            primaryActionMetric: 'Eradicating landfill sorting gaps',
            secondaryAlternativeMetric: 'Placing double-glazed frames in secondary windows',
            primaryCo2Saved: co2Saved,
            secondaryCo2Saved: 50
          }
        });
      }
    }

    // Sort immediately descending by raw potential CO2 reduction
    rawRecommendations.sort((a, b) => b.co2SavedKgPerYear - a.co2SavedKgPerYear);

    const topAction = rawRecommendations[0];

    // Enrichment mapping (Adding Explainability and Rationale logs)
    const processedRecommendations = rawRecommendations.map((rawRec, index): Recommendation => {
      const isTop = index === 0;
      const monthlySaved = Math.round(rawRec.co2SavedKgPerYear / 12);
      const estimatedImpact = `Saves ${rawRec.co2SavedKgPerYear.toLocaleString()} kg CO₂/year (approx. ${monthlySaved} kg/month)`;

      // Explain WHY this action is selected (Personalized)
      const whySelected = getWhySelected(rawRec.id, carbonScore, lifestyle);

      // Explain WHY it was rejected or why it is lower-ranked
      const whyRejected = getWhyRejected(
        isTop,
        topAction?.title || '',
        topAction?.co2SavedKgPerYear || 100,
        rawRec.title,
        rawRec.co2SavedKgPerYear
      );

      const personalizedReasoning = `${whySelected} This action is highly effective: ${estimatedImpact}. Comparing metrics, it reduces emissions significantly more than secondary activities.`;

      return {
        ...rawRec,
        uid: context.userId,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        whySelected,
        whyRejected,
        estimatedImpact,
        personalizedReasoning
      };
    });

    return processedRecommendations;
  }
};
