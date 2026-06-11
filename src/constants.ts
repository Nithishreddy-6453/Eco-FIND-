// Carbon emission conversion factors (in kg of CO2 equivalent)

export const EMISSION_FACTORS = {
  // Transport coefficients (per km)
  transport: {
    car: 0.170, // petrol car kg CO2 per km
    hybrid_car: 0.110,
    electric_car: 0.050,
    public_transport: 0.040, // average bus/train
    bike_walk: 0.000,
  },
  
  // Flights (per flight, assumed average flight impact)
  flight: 250, // average short-to-medium domestic/intl flight in kg CO2
  
  // Diet types (annual kg CO2 equivalent per person)
  diet: {
    heavy_meat: 2500, // high-meat consumption
    occasional_meat: 1700,
    vegetarian: 1200,
    vegan: 900,
  },

  // Food Waste (annual, kg CO2 equivalent baseline)
  foodWaste: {
    high: 300,
    medium: 150,
    low: 30,
  },
  
  // Electricity (per kWh depending on grid, average globally/regionally)
  electricityKwh: 0.380, // kg CO2 per kWh
  
  // Heating type baseline factors (monthly baseline comparison)
  heating: {
    gas: 180, // kg CO2/month
    coal_oil: 320,
    electric: 120,
    district_solar: 10,
    none: 0,
  },

  // Consumption footprints (annual base kg CO2)
  shopping: {
    high_consumer: 1500,
    moderate: 800,
    minimalist: 200,
  },

  recyclingReduction: {
    none: 0,
    some: 80,
    full: 200, // saved kg CO2 annually
  }
};

/**
 * Perform server or client-side calculation to estimate annual CO2 emissions of different lifestyle aspects
 */
export function calculateLifestyleEmissions(data: {
  commuteMode: string;
  distancePerDayKm: number;
  annualFlights: number;
  dietType: string;
  foodWasteLevel: string;
  electricityKwhPerMonth: number;
  greenEnergyPercent: number;
  heatingType: string;
  shoppingHabits: string;
  recyclingLevel: string;
}) {
  const tFactor = EMISSION_FACTORS.transport[data.commuteMode as keyof typeof EMISSION_FACTORS.transport] ?? EMISSION_FACTORS.transport.car;
  const transportAnnual = data.distancePerDayKm * 250 * tFactor; // assumes 250 commuting days
  const flightsAnnual = data.annualFlights * EMISSION_FACTORS.flight;

  const dietAnnual = EMISSION_FACTORS.diet[data.dietType as keyof typeof EMISSION_FACTORS.diet] ?? EMISSION_FACTORS.diet.occasional_meat;
  const foodWasteAnnual = EMISSION_FACTORS.foodWaste[data.foodWasteLevel as keyof typeof EMISSION_FACTORS.foodWaste] ?? EMISSION_FACTORS.foodWaste.medium;

  const rawElectricityAnnual = data.electricityKwhPerMonth * 12 * EMISSION_FACTORS.electricityKwh;
  const greenEnergySaved = rawElectricityAnnual * (data.greenEnergyPercent / 100);
  const electricityAnnual = Math.max(0, rawElectricityAnnual - greenEnergySaved);

  const heatingAnnual = (EMISSION_FACTORS.heating[data.heatingType as keyof typeof EMISSION_FACTORS.heating] ?? EMISSION_FACTORS.heating.gas) * 12;

  const shoppingAnnual = EMISSION_FACTORS.shopping[data.shoppingHabits as keyof typeof EMISSION_FACTORS.shopping] ?? EMISSION_FACTORS.shopping.moderate;
  const recycleSaved = EMISSION_FACTORS.recyclingReduction[data.recyclingLevel as keyof typeof EMISSION_FACTORS.recyclingReduction] ?? EMISSION_FACTORS.recyclingReduction.some;
  const consumptionAnnual = Math.max(50, shoppingAnnual - recycleSaved);

  return {
    transport: Math.round(transportAnnual),
    flights: Math.round(flightsAnnual),
    diet: Math.round(dietAnnual),
    foodWaste: Math.round(foodWasteAnnual),
    electricity: Math.round(electricityAnnual),
    heating: Math.round(heatingAnnual),
    consumption: Math.round(consumptionAnnual),
    total: Math.round(transportAnnual + flightsAnnual + dietAnnual + foodWasteAnnual + electricityAnnual + heatingAnnual + consumptionAnnual)
  };
}

export interface ChallengeCatalogItem {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  co2SavedKg: number;
  category: 'Transport' | 'Diet' | 'Energy' | 'Consumption';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: 'Daily' | 'Weekly';
  progress: number;
  target: number;
  completed: boolean;
}

export const CHALLENGES_CATALOG: ChallengeCatalogItem[] = [
  {
    id: 'ch_1',
    title: 'Pedal Over Petrol',
    description: 'Commute using active transport (bicycle, walking) instead of a gasoline car.',
    xpReward: 40,
    co2SavedKg: 5,
    category: 'Transport',
    difficulty: 'Easy',
    duration: 'Daily',
    progress: 0,
    target: 1,
    completed: false
  },
  {
    id: 'ch_2',
    title: 'The Meatless Maverick',
    description: 'Prepare and log full-day meals using vegetarian or plant-based ingredients.',
    xpReward: 50,
    co2SavedKg: 8,
    category: 'Diet',
    difficulty: 'Medium',
    duration: 'Daily',
    progress: 0,
    target: 1,
    completed: false
  },
  {
    id: 'ch_3',
    title: 'Degree Detective',
    description: 'Shift your thermostat by 1°C in your home today.',
    xpReward: 30,
    co2SavedKg: 3,
    category: 'Energy',
    difficulty: 'Easy',
    duration: 'Daily',
    progress: 0,
    target: 1,
    completed: false
  },
  {
    id: 'ch_4',
    title: 'Planted Forest Hero',
    description: 'Log 5 sustainable habits with your AI coach to level up your ecological score.',
    xpReward: 100,
    co2SavedKg: 20,
    category: 'Consumption',
    difficulty: 'Hard',
    duration: 'Weekly',
    progress: 2,
    target: 5,
    completed: false
  },
  {
    id: 'ch_5',
    title: 'Zero Scrap Chef',
    description: 'Optimize meals to avoid throwaways or compost organic waste for a full week.',
    xpReward: 80,
    co2SavedKg: 10,
    category: 'Diet',
    difficulty: 'Medium',
    duration: 'Weekly',
    progress: 4,
    target: 7,
    completed: false
  }
];
