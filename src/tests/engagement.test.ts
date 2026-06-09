import { getLevelInfo, calculateEarnedBadges } from '../utils/engagement';
import { UserProfile, ImpactLog } from '../types';

let testCount = 0;
let passCount = 0;

function assert(condition: boolean, message: string) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    const err = new Error(`Assertion failed: ${message}`);
    console.error(err.stack);
  }
}

export function runEngagementTests() {
  console.log('====================================================');
  console.log('🏃 ECO-MIND GAMIFICATION & ENGAGEMENT UNIT TESTS');
  console.log('====================================================\n');

  // Test Case 1: Level Mapping Thresholds
  console.log('Test Case 1: Level Mapping Cohorts');
  
  const level1 = getLevelInfo(120); // Eco Beginner
  assert(level1.levelNum === 1, 'XP < 200 is Level 1');
  assert(level1.name === 'Eco Beginner', 'Level 1 is Eco Beginner');
  assert(level1.progressPercent === 60, `Level 1 progress should be 60%: found ${level1.progressPercent}%`);

  const level2 = getLevelInfo(330); // Green Explorer
  assert(level2.levelNum === 2, 'XP 200-400 is Level 2');
  assert(level2.name === 'Green Explorer', 'Level 2 is Green Explorer');
  assert(level2.progressPercent === 65, 'Level 2 progress calculation works');

  const level3 = getLevelInfo(450); // Climate Warrior
  assert(level3.levelNum === 3, 'XP 400-600 is Level 3');
  assert(level3.name === 'Climate Warrior', 'Level 3 is Climate Warrior');

  const level4 = getLevelInfo(700); // Eco Hero
  assert(level4.levelNum === 4, 'XP 600-800 is Level 4');
  assert(level4.name === 'Eco Hero', 'Level 4 is Eco Hero');

  const level5 = getLevelInfo(950); // Planet Guardian (Base 5+)
  assert(level5.levelNum === 5, 'XP 800-1000 is Level 5');
  assert(level5.name === 'Planet Guardian', 'Level 5+ is Planet Guardian');

  const level7 = getLevelInfo(1250); // Planet Guardian (Level 7)
  assert(level7.levelNum === 7, 'XP 1250 is Level 7');
  assert(level7.name === 'Planet Guardian', 'Higher level is also Planet Guardian');

  // Test Case 2: Badge Allocation Integration
  console.log('\nTest Case 2: Badger Matrix Assessment');

  const emptyProfile: Partial<UserProfile> = {
    streakCount: 0,
    completedChallengeIds: [],
    xp: 0
  };
  const emptyLogs: ImpactLog[] = [];
  const noBadges = calculateEarnedBadges(emptyProfile, emptyLogs, 0);
  assert(noBadges.length === 0, 'No badges should be calculated for a fresh user profile');

  // 3-day streak => Streak King
  const streakProfile: Partial<UserProfile> = {
    ...emptyProfile,
    streakCount: 3
  };
  const streakBadges = calculateEarnedBadges(streakProfile, emptyLogs, 0);
  assert(streakBadges.includes('bdg_streak'), 'Streak of 3 days earns Streak King badge');

  // Diet Logs => Meatless Maverick
  const dietLogs: ImpactLog[] = [
    {
      id: 'log_1',
      uid: 'guest_user',
      recommendationId: 'rec_1',
      recommendationTitle: 'Vegetarian Day',
      co2SavedKg: 50,
      loggedAt: new Date().toISOString(),
      category: 'Diet'
    }
  ];
  const dietBadges = calculateEarnedBadges(emptyProfile, dietLogs, 0);
  assert(dietBadges.includes('bdg_meat'), 'Submitting diet log earns Meatless Maverick badge');

  // energy logs => Watt Saver
  const energyLogs: ImpactLog[] = [
    {
      id: 'log_2',
      uid: 'guest_user',
      recommendationId: 'rec_2',
      recommendationTitle: 'Lower Thermostat',
      co2SavedKg: 180,
      loggedAt: new Date().toISOString(),
      category: 'Energy'
    }
  ];
  const energyBadges = calculateEarnedBadges(emptyProfile, energyLogs, 0);
  assert(energyBadges.includes('bdg_energy'), 'Submitting heating/energy log earns Watt Saver badge');

  // chat coach conversations count => Chat Disciple
  const chatBadges = calculateEarnedBadges(emptyProfile, emptyLogs, 3);
  assert(chatBadges.includes('bdg_coach'), 'Engaging in chat message exchange > 3 times earns Chat Disciple badge');

  // challenges complete count => Challenge Conqueror
  const challengeProfile: Partial<UserProfile> = {
    ...emptyProfile,
    completedChallengeIds: ['ch_1', 'ch_2', 'ch_3']
  };
  const challengeBadges = calculateEarnedBadges(challengeProfile, emptyLogs, 0);
  assert(challengeBadges.includes('bdg_conqueror'), 'Completing 3+ challenges earns Challenge Conqueror badge');

  // xp >= 800 => Grand Champion Planet Guardian badge
  const grandProfile: Partial<UserProfile> = {
    ...emptyProfile,
    xp: 850
  };
  const grandBadges = calculateEarnedBadges(grandProfile, emptyLogs, 0);
  assert(grandBadges.includes('bdg_guardian'), 'Accumulating 800+ XP earns grand champion Planet Guardian badge');

  console.log('\n====================================================');
  console.log(`📊 GAMIFICATION SUMMARY: ${passCount} of ${testCount} tests passed.`);
  console.log('====================================================\n');

  if (passCount !== testCount) {
    process.exit(1);
  }
}

// Check directly if executing this test file specifically
if (process.argv[1] && process.argv[1].endsWith('engagement.test.ts')) {
  runEngagementTests();
  process.exit(0);
}
