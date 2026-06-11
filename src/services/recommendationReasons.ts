import { UnifiedContext, Recommendation } from '../types';

export function getWhySelected(
  id: string,
  carbonScore: UnifiedContext['carbonScore'],
  lifestyle: UnifiedContext['lifestyle']
): string {
  switch (id) {
    case 'act_transport_commute':
      return `Your baseline shows ${carbonScore.breakdown.transport.toLocaleString()} kg CO₂/yr originating from commuting via ${lifestyle.commuteMode.replace('_', ' ')}. Upgrading this is your absolute biggest mobility lever.`;
    case 'act_transport_flights':
      return `You logged ${lifestyle.annualFlights} annual flights. Aviation is incredibly carbon-intensive; avoiding mid-to-short flights produces large immediate savings of up to ${carbonScore.breakdown.flights.toLocaleString()} kg CO₂/yr.`;
    case 'act_diet_vegan':
      return `Your ${lifestyle.dietType.replace('_', ' ')} food consumption creates ${carbonScore.breakdown.diet.toLocaleString()} kg CO₂/yr. Restructuring protein choices is your largest diet optimization step.`;
    case 'act_food_waste':
      return `Your kitchen setup has "${lifestyle.foodWasteLevel}" waste output. Eliminating this limits organic decay in anaerobic land cells.`;
    case 'act_energy_solar':
      return `Your utility consumption relies on standard grid sources. Powering your home grid completely cleans up ${carbonScore.breakdown.electricity.toLocaleString()} kg CO₂ of annual supply strain.`;
    case 'act_energy_thermostat':
      return `Your heating source (${lifestyle.heatingType}) generates ${carbonScore.breakdown.heating.toLocaleString()} kg CO₂/yr. Insulating saves direct furnace burn.`;
    case 'act_consumption_shopping':
      return `Your retail consumption profile shows a "${lifestyle.shoppingHabits}" pattern. Shifting to minimalist purchase loops prevents intense industrial fabrication.`;
    case 'act_waste_recycling':
      return `You logged "${lifestyle.recyclingLevel}" recycling levels. Meticulous sorting avoids trash incineration or carbon leaks.`;
    default:
      return 'Selected to help optimize your carbon footprint and balance daily sustainability goals.';
  }
}

export function getWhyRejected(
  isTop: boolean,
  topActionTitle: string,
  topSaved: number,
  recTitle: string,
  co2SavedKgPerYear: number
): string {
  if (isTop) {
    return 'Not deprioritized. This is selected as your absolute peak carbon leverage action because it yields the highest numeric CO₂ savings.';
  }
  const multiplier = (topSaved / co2SavedKgPerYear).toFixed(1);
  return `Deprioritized below your primary goal ("${topActionTitle}") because "${topActionTitle}" reduces carbon output by ${topSaved} kg CO₂/yr, making it ${multiplier}x more impactful than this action.`;
}
