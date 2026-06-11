import { UserProfile, LifestyleData, ImpactLog, UnifiedContext } from '../types';
import { calculateLifestyleEmissions } from '../constants';

export const ContextEngine = {
  /**
    * Constructs a single unified context object out of user profiles, lifestyle metrics, 
    * and history indicators with graceful defensive defaults.
    */
  buildContext(
    userProfile: UserProfile | null,
    lifestyle: LifestyleData | null,
    impactLogs: ImpactLog[] = []
  ): UnifiedContext {
    const userId = userProfile?.uid || lifestyle?.uid || 'guest_user';

    // 1. Build profile section
    const profile = {
      displayName: userProfile?.displayName || 'Eco Guardian',
      xp: userProfile?.xp || 0,
      levelName: userProfile?.levelName || 'Eco Beginner',
      streakCount: userProfile?.streakCount || 0,
      badges: userProfile?.badges || [],
      weeklyGoalCo2: userProfile?.weeklyGoalCo2 || 50,
      weeklyProgressCo2: userProfile?.weeklyProgressCo2 || 0,
    };

    // 2. Build lifestyle parameters with robust boundary sanitization (defensive coding)
    const normalizedLifestyle: UnifiedContext['lifestyle'] = {
      commuteMode: lifestyle?.commuteMode || 'car',
      distancePerDayKm: Math.max(0, lifestyle?.distancePerDayKm || 0),
      annualFlights: Math.max(0, lifestyle?.annualFlights || 0),
      dietType: lifestyle?.dietType || 'occasional_meat',
      localFoodPercent: Math.max(0, Math.min(100, lifestyle?.localFoodPercent || 0)),
      foodWasteLevel: lifestyle?.foodWasteLevel || 'medium',
      electricityKwhPerMonth: Math.max(0, lifestyle?.electricityKwhPerMonth || 0),
      greenEnergyPercent: Math.max(0, Math.min(100, lifestyle?.greenEnergyPercent || 0)),
      heatingType: lifestyle?.heatingType || 'gas',
      thermostatOffsetC: lifestyle?.thermostatOffsetC || 0,
      shoppingHabits: lifestyle?.shoppingHabits || 'moderate',
      recyclingLevel: lifestyle?.recyclingLevel || 'some',
    };

    // 3. Build progress parameters
    const historyLogs = impactLogs.map(log => ({
      recommendationTitle: log.recommendationTitle,
      co2SavedKg: log.co2SavedKg,
      loggedAt: log.loggedAt,
    }));

    const progress = {
      totalCo2SavedKg: userProfile?.totalCo2SavedKg || 0,
      completedCount: impactLogs.length,
      historyLogs,
    };

    // 4. Calculate detailed emissions using verified constants coefficients
    const emissions = calculateLifestyleEmissions(normalizedLifestyle);

    return {
      userId,
      profile,
      lifestyle: normalizedLifestyle,
      progress,
      carbonScore: {
        breakdown: {
          transport: emissions.transport,
          flights: emissions.flights,
          diet: emissions.diet,
          foodWaste: emissions.foodWaste,
          electricity: emissions.electricity,
          heating: emissions.heating,
          consumption: emissions.consumption,
          total: emissions.total,
        },
      },
    };
  }
};
