import { CarbonIntelligenceEngine } from '../services/carbonEngine';
import { LifestyleData } from '../types';

let testCount = 0;
let passCount = 0;

function assert(condition: boolean, message: string) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

function runTests() {
  console.log('====================================================');
  console.log('🏃 ECO-MIND CARBON INTELLIGENCE ENGINE UNIT TESTS');
  console.log('====================================================\n');

  // Test Case 1: Heavy Footprint User (Petrol Car, Heavy Meat, High consumption)
  console.log('Test Case 1: High Emission Lifestyle Profile');
  const heavyUser: Omit<LifestyleData, 'uid' | 'updatedAt'> = {
    commuteMode: 'car',
    distancePerDayKm: 100, // 100 km daily commute
    annualFlights: 8,      // 8 flights
    dietType: 'heavy_meat',
    localFoodPercent: 10,
    foodWasteLevel: 'high',
    electricityKwhPerMonth: 800,
    greenEnergyPercent: 0,
    heatingType: 'coal_oil', // extremely heavy
    thermostatOffsetC: 0,
    shoppingHabits: 'high_consumer',
    recyclingLevel: 'none'
  };

  const heavyResult = CarbonIntelligenceEngine.process(heavyUser);

  // Assert calculations are strictly numeric and positive
  assert(heavyResult.breakdown.total > 0, 'Total carbon emissions should be greater than zero');
  assert(heavyResult.breakdown.transport > 3000, `Transport should represent a high carbon footprint: ${heavyResult.breakdown.transport} kg`);
  assert(heavyResult.breakdown.food > 2500, `Food emissions with heavy meat and waste should be high: ${heavyResult.breakdown.food} kg`);
  
  // Assert biggest source identification
  assert(
    heavyResult.insight.biggestSource === 'transport' || heavyResult.insight.biggestSource === 'electricity',
    `Biggest source should be mathematically identified. Found: ${heavyResult.insight.biggestSource}`
  );

  // Assert percentages
  assert(heavyResult.insight.contribution > 0 && heavyResult.insight.contribution <= 100, `Contribution percentage must be between 1% and 100%: ${heavyResult.insight.contribution}%`);

  // Assert actions are ranked (descending)
  let isSorted = true;
  for (let i = 0; i < heavyResult.rankedActions.length - 1; i++) {
    if (heavyResult.rankedActions[i].co2SavedKgPerYear < heavyResult.rankedActions[i+1].co2SavedKgPerYear) {
      isSorted = false;
    }
  }
  assert(isSorted, 'Recommended actions must be returned in descending order of CO2 saved');

  // Test Case 2: Clean Eco-Warrior Profile (Biking, Vegan, renewable energy, minimalist shopper)
  console.log('\nTest Case 2: Ultra-low Emission Eco-Warrior Profile');
  const ecoUser: Omit<LifestyleData, 'uid' | 'updatedAt'> = {
    commuteMode: 'bike_walk',
    distancePerDayKm: 5,
    annualFlights: 0,
    dietType: 'vegan',
    localFoodPercent: 90,
    foodWasteLevel: 'low',
    electricityKwhPerMonth: 100,
    greenEnergyPercent: 100, // 100% solar supply offset
    heatingType: 'none',
    thermostatOffsetC: 0,
    shoppingHabits: 'minimalist',
    recyclingLevel: 'full'
  };

  const ecoResult = CarbonIntelligenceEngine.process(ecoUser);

  assert(ecoResult.breakdown.transport === 0, 'Transport emissions for walking/biking should be zero');
  assert(ecoResult.breakdown.total < heavyResult.breakdown.total, `Clean lifestyle total (${ecoResult.breakdown.total}kg) should be orders of magnitude lower than heavy lifestyle total (${heavyResult.breakdown.total}kg)`);
  assert(ecoResult.rankedActions.length < heavyResult.rankedActions.length, 'Already low carbon profile should yield fewer recommendation upgrades');

  // Validate format constraints
  console.log('\nTest Case 3: Structured Insight Output Schema Matching');
  assert(typeof ecoResult.insight.biggestSource === 'string', 'biggestSource must be a string');
  assert(typeof ecoResult.insight.contribution === 'number', 'contribution must be a number');
  assert(typeof ecoResult.insight.highestImpactAction === 'string', 'highestImpactAction must be a string');
  assert(ecoResult.insight.estimatedReduction.includes('kg CO2/month'), `estimatedReduction must match desired text template. Found: "${ecoResult.insight.estimatedReduction}"`);

  console.log('\n====================================================');
  console.log(`📊 UNIT TEST SUMMARY: ${passCount} of ${testCount} tests passed.`);
  console.log('====================================================\n');

  if (passCount !== testCount) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Check if running from shell or script execution
runTests();
