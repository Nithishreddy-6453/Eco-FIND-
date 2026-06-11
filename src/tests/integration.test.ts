import { CarbonIntelligenceEngine } from '../services/carbonEngine';
import { getLevelInfo, calculateEarnedBadges } from '../utils/engagement';
import { LifestyleData, UserProfile, ImpactLog } from '../types';

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

function runIntegrationTests() {
  console.log('====================================================');
  console.log('🏃 ECO-MIND AI END-TO-END INTEGRATION TESTS');
  console.log('====================================================\n');

  // Integration Test Case 1: Full Onboarding and Carbon Calculation Integration
  console.log('Test Case 1: Onboarding Calculation & Action Recommendation Integration');
  
  const initialLifestyle: Omit<LifestyleData, 'uid' | 'updatedAt'> = {
    commuteMode: 'hybrid_car',
    distancePerDayKm: 30,
    annualFlights: 2,
    dietType: 'occasional_meat',
    localFoodPercent: 40,
    foodWasteLevel: 'medium',
    electricityKwhPerMonth: 300,
    greenEnergyPercent: 20,
    heatingType: 'gas',
    thermostatOffsetC: 0,
    shoppingHabits: 'moderate',
    recyclingLevel: 'some'
  };

  const results = CarbonIntelligenceEngine.process(initialLifestyle);

  assert(results.breakdown.total > 0, 'Processed total carbon emissions is computed.');
  assert(results.breakdown.transport > 0, 'Transport carbon emissions are non-zero for hybrid car travel.');
  assert(results.breakdown.food > 0, 'Food emissions are computed.');
  assert(results.rankedActions.length > 0, 'Dynamic recommendations are correctly compiled.');
  assert(results.rankedActions[0].co2SavedKgPerYear >= results.rankedActions[results.rankedActions.length - 1].co2SavedKgPerYear, 'Recommendations are sorted by highest impact.');

  // Integration Test Case 2: Workflow Progression (Logging Completed Actions, Earning XP, Leveling and Badges)
  console.log('\nTest Case 2: Progression Integration (XP, Levels, and Badge Rewards)');
  
  // Start with a base profile
  const user: UserProfile = {
    uid: 'test_integration_user',
    email: 'integration@test.ecomind',
    displayName: 'Eco Practitioner',
    photoURL: null,
    createdAt: new Date().toISOString(),
    streakCount: 5, // 5-day active streak
    totalCo2SavedKg: 0,
    lastActiveDate: new Date().toISOString(),
    xp: 0,
    levelName: 'Eco Beginner',
    badges: [],
    weeklyGoalCo2: 50,
    weeklyProgressCo2: 0,
    completedChallengeIds: []
  };

  const simulatedHistoryLogs: ImpactLog[] = [];

  // Log recommendation completion simulation
  const targetRecommendation = results.rankedActions[0];
  const co2ToSave = targetRecommendation.co2SavedKgPerYear;
  const xpAwarded = 150; // default action award

  // Mutate state simulation
  const updatedUser = {
    ...user,
    totalCo2SavedKg: user.totalCo2SavedKg + co2ToSave,
    xp: user.xp + xpAwarded
  };

  // Log to history
  simulatedHistoryLogs.push({
    id: 'log_integration_1',
    uid: user.uid,
    recommendationId: targetRecommendation.id,
    recommendationTitle: targetRecommendation.title,
    category: targetRecommendation.category,
    co2SavedKg: co2ToSave,
    loggedAt: new Date().toISOString()
  });

  const levelInfo = getLevelInfo(updatedUser.xp);
  assert(levelInfo.levelNum === 1, `Level should remain Level 1 (Beginner) at 150 XP: got level ${levelInfo.levelNum}`);
  assert(updatedUser.totalCo2SavedKg === co2ToSave, `Cumulative total saved matches expected ${co2ToSave} kg: got ${updatedUser.totalCo2SavedKg}`);

  // Award another 300 XP
  const upgradedUser = {
    ...updatedUser,
    xp: updatedUser.xp + 300
  };

  const upgradedLevelInfo = getLevelInfo(upgradedUser.xp);
  assert(upgradedLevelInfo.levelNum === 3, `Level is expected to climb to 3 at 450 XP: got ${upgradedLevelInfo.levelNum}`);
  assert(upgradedLevelInfo.name === 'Climate Warrior', `Level 3 name matches Climate Warrior: got "${upgradedLevelInfo.name}"`);

  // Compute Badges based on interactive progression elements
  const badgesEarned = calculateEarnedBadges(upgradedUser, simulatedHistoryLogs, 4);
  assert(badgesEarned.includes('bdg_streak'), 'Streak check satisfies "bdg_streak" badge criteria.');
  assert(badgesEarned.includes('bdg_coach'), 'Engaging with coach on 4 chat comments satisfies "bdg_coach" badge criteria.');

  // Integration Test Case 3: Boundary Safety & Input Normalization (Security/Robustness validation)
  console.log('\nTest Case 3: Defensive Boundary Validation & Clamping checks');

  const negativeLifestyle: Omit<LifestyleData, 'uid' | 'updatedAt'> = {
    commuteMode: 'car',
    distancePerDayKm: -50, // Invalid negative distance
    annualFlights: -5,     // Invalid negative flights count
    dietType: 'vegan',
    localFoodPercent: 120, // Over 100% boundary
    foodWasteLevel: 'low',
    electricityKwhPerMonth: -100, // Negative usage
    greenEnergyPercent: 150, // Over 100% boundary
    heatingType: 'none',
    thermostatOffsetC: -2,
    shoppingHabits: 'minimalist',
    recyclingLevel: 'full'
  };

  const normalizedResult = CarbonIntelligenceEngine.process(negativeLifestyle);

  assert(normalizedResult.breakdown.total >= 0, 'Total emissions remain strictly non-negative despite dirty inputs.');
  assert(normalizedResult.breakdown.transport === 0, 'Transport emissions are normalized to 0 due to clamp on negative distances/flights.');
  assert(normalizedResult.insight.contribution <= 100, 'Contributions are capped correctly within a valid 100% percentage ceiling.');

  console.log('\n====================================================');
  console.log(`📊 INTEGRATION TEST SUMMARY: ${passCount} of ${testCount} tests passed.`);
  console.log('====================================================\n');

  if (passCount !== testCount) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Check shell trigger
runIntegrationTests();
