import { LifestyleData } from '../types';

/**
 * Enterprise-grade validation schemas for runtime request sanitization.
 */
export const LifestyleSchema = {
  validate(data: unknown): LifestyleData {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid payload shape: Expected an object.');
    }

    const d = data as Record<string, unknown>;

    // Type checking with explicit bounds and default fallbacks
    const uid = typeof d.uid === 'string' ? d.uid : '';
    const commuteMode = typeof d.commuteMode === 'string' ? d.commuteMode : 'car';
    const distancePerDayKm = Math.max(0, Math.min(1000, Number(d.distancePerDayKm ?? 0)));
    const annualFlights = Math.max(0, Math.min(100, Number(d.annualFlights ?? 0)));
    const dietType = typeof d.dietType === 'string' ? d.dietType : 'occasional_meat';
    const localFoodPercent = Math.max(0, Math.min(100, Number(d.localFoodPercent ?? 0)));
    const foodWasteLevel = typeof d.foodWasteLevel === 'string' ? d.foodWasteLevel : 'medium';
    const electricityKwhPerMonth = Math.max(0, Math.min(10000, Number(d.electricityKwhPerMonth ?? 0)));
    const greenEnergyPercent = Math.max(0, Math.min(100, Number(d.greenEnergyPercent ?? 0)));
    const heatingType = typeof d.heatingType === 'string' ? d.heatingType : 'electric';
    const thermostatOffsetC = Math.max(-10, Math.min(10, Number(d.thermostatOffsetC ?? 0)));
    const shoppingHabits = typeof d.shoppingHabits === 'string' ? d.shoppingHabits : 'moderate';
    const recyclingLevel = typeof d.recyclingLevel === 'string' ? d.recyclingLevel : 'some';
    const updatedAt = typeof d.updatedAt === 'string' ? d.updatedAt : new Date().toISOString();

    return {
      uid,
      commuteMode: commuteMode as LifestyleData['commuteMode'],
      distancePerDayKm,
      annualFlights,
      dietType: dietType as LifestyleData['dietType'],
      localFoodPercent,
      foodWasteLevel: foodWasteLevel as LifestyleData['foodWasteLevel'],
      electricityKwhPerMonth,
      greenEnergyPercent,
      heatingType: heatingType as LifestyleData['heatingType'],
      thermostatOffsetC,
      shoppingHabits: shoppingHabits as LifestyleData['shoppingHabits'],
      recyclingLevel: recyclingLevel as LifestyleData['recyclingLevel'],
      updatedAt
    };
  }
};
