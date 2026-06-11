import { UnifiedContext, DecisionEngineOutput } from '../types';
import { RecommendationEngine } from './recommendationEngine';

export const DecisionEngine = {
  /**
   * Evaluates the Unified Context to pinpoint the absolute highest carbon-saving tradeoffs,
   * isolating the largest emission group and comparing its leverage points mathematically. 
   */
  makeDecision(context: UnifiedContext): DecisionEngineOutput {
    const { breakdown } = context.carbonScore;

    // 1. Calculate emission groupings
    const transportVal = breakdown.transport + breakdown.flights;
    const dietVal = breakdown.diet + breakdown.foodWaste;
    const utilitiesVal = breakdown.electricity + breakdown.heating;
    const consumptionVal = breakdown.consumption;

    const groupings = [
      { name: 'Transport & Aviation', value: transportVal, label: 'Transportation & flights' },
      { name: 'Dietary & Waste', value: dietVal, label: 'Dietary habits & food waste' },
      { name: 'Utilities & Heating', value: utilitiesVal, label: 'Home electricity & heating' },
      { name: 'Goods Consumption', value: consumptionVal, label: 'Goods consumption & shopping' }
    ];

    // Find largest group
    groupings.sort((a, b) => b.value - a.value);
    const largestGroup = groupings[0];
    const totalEmissions = breakdown.total || 1;
    const contributionPercentage = Math.round((largestGroup.value / totalEmissions) * 100);

    // 2. Fetch recommendations from Recommendation Engine
    const recommendations = RecommendationEngine.generateRecommendations(context);
    const topRec = recommendations[0];

    const highestImpactAction = topRec 
      ? topRec.title 
      : 'Maintain your current sustainable base habits';

    const estimatedReduction = topRec 
      ? topRec.estimatedImpact || `Saves ${topRec.co2SavedKgPerYear} kg CO2/year`
      : 'Saves 50 kg CO2/year';

    // 3. Draft logical reasoning trade-offs
    const alternativeOffset = 80; // baseline recycling offset
    let multiplierVal = 1;
    if (topRec && topRec.co2SavedKgPerYear > alternativeOffset) {
      multiplierVal = Math.round((topRec.co2SavedKgPerYear / alternativeOffset) * 10) / 10;
    }

    const reasoning = `Based on your audited profile, ${largestGroup.name} represents your maximum impact sector-accounting for ${contributionPercentage}% of your total CO₂ output. Taking action here yields dramatic offsets. For instance, implementing our selected top priority "${highestImpactAction}" is estimated to save ${topRec ? topRec.co2SavedKgPerYear : 50} kg CO₂ annually. Mathematically, this single shift holds ${multiplierVal}x more leverage than general waste sorting or paper recycling alone, demonstrating why prioritizing major structural modifications outperforms small ambient adaptations.`;

    return {
      largestEmissionSource: largestGroup.name,
      contributionPercentage,
      highestImpactAction,
      estimatedReduction,
      reasoning
    };
  }
};
