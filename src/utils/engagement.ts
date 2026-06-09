import { UserProfile, ImpactLog } from '../types';

export interface LevelInfo {
  levelNum: number;
  name: 'Eco Beginner' | 'Green Explorer' | 'Climate Warrior' | 'Eco Hero' | 'Planet Guardian';
  minXp: number;
  maxXp: number;
  progressPercent: number;
}

/**
 * Calculates current level number, tier name, and progress bounds from accumulated XP
 */
export function getLevelInfo(xp: number): LevelInfo {
  if (xp < 200) {
    const min = 0;
    const max = 200;
    const pct = Math.min(100, Math.round(((xp - min) / (max - min)) * 100));
    return { levelNum: 1, name: 'Eco Beginner', minXp: min, maxXp: max, progressPercent: pct };
  } else if (xp < 400) {
    const min = 200;
    const max = 400;
    const pct = Math.min(100, Math.round(((xp - min) / (max - min)) * 100));
    return { levelNum: 2, name: 'Green Explorer', minXp: min, maxXp: max, progressPercent: pct };
  } else if (xp < 600) {
    const min = 400;
    const max = 600;
    const pct = Math.min(100, Math.round(((xp - min) / (max - min)) * 100));
    return { levelNum: 3, name: 'Climate Warrior', minXp: min, maxXp: max, progressPercent: pct };
  } else if (xp < 800) {
    const min = 600;
    const max = 800;
    const pct = Math.min(100, Math.round(((xp - min) / (max - min)) * 100));
    return { levelNum: 4, name: 'Eco Hero', minXp: min, maxXp: max, progressPercent: pct };
  } else {
    // Planet Guardian is level 5 and increases indefinitely every 200 XP
    const baseLevel = 5;
    const levelsAbove = Math.floor((xp - 800) / 200);
    const min = 800 + levelsAbove * 200;
    const max = 1000 + levelsAbove * 200;
    const pct = Math.min(100, Math.round(((xp - min) / (max - min)) * 100));
    return { levelNum: baseLevel + levelsAbove, name: 'Planet Guardian', minXp: min, maxXp: max, progressPercent: pct };
  }
}

export interface BadgeCatalogItem {
  id: string;
  title: string;
  description: string;
  color: string;
  borderColor: string;
}

export const BADGE_CATALOG: BadgeCatalogItem[] = [
  {
    id: 'bdg_streak',
    title: 'Streak King',
    description: 'Maintained a consecutive carbon saving check-in streak of 3+ days.',
    color: 'text-amber-500 bg-amber-950/20',
    borderColor: 'border-amber-500/30'
  },
  {
    id: 'bdg_meat',
    title: 'Meatless Maverick',
    description: 'Successfully checked off a meatless or vegetarian dietary saving log.',
    color: 'text-emerald-400 bg-emerald-950/20',
    borderColor: 'border-emerald-500/30'
  },
  {
    id: 'bdg_energy',
    title: 'Watt Saver',
    description: 'Logged residential heating or energy saving offset achievements.',
    color: 'text-blue-400 bg-blue-950/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'bdg_coach',
    title: 'Chat Disciple',
    description: 'Engaged with the AI Sustainability Coach to verify eco decisions.',
    color: 'text-purple-400 bg-purple-950/20',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'bdg_conqueror',
    title: 'Challenge Conqueror',
    description: 'Cleared a cumulative total of 3+ daily or weekly active quests.',
    color: 'text-rose-400 bg-rose-950/20',
    borderColor: 'border-rose-500/30'
  },
  {
    id: 'bdg_guardian',
    title: 'Planet Guardian',
    description: 'Acquired grand champion level status by accumulating 800+ total XP.',
    color: 'text-cyan-400 bg-cyan-950/20',
    borderColor: 'border-cyan-500/40'
  }
];

/**
 * Audit and calculate earned badges based on user activities and history
 */
export function calculateEarnedBadges(
  profile: Partial<UserProfile>,
  logs: ImpactLog[],
  chatMessagesCount: number
): string[] {
  const earned: string[] = [];

  // 1. Streak King
  if ((profile.streakCount ?? 0) >= 3) {
    earned.push('bdg_streak');
  }

  // 2. Meatless Maverick (Has a completed log in Diet category or completed challenge with diet)
  const hasDietLog = logs.some(l => l.category === 'Diet');
  if (hasDietLog) {
    earned.push('bdg_meat');
  }

  // 3. Watt Saver (Has completed log in Energy category)
  const hasEnergyLog = logs.some(l => l.category === 'Energy');
  if (hasEnergyLog) {
    earned.push('bdg_energy');
  }

  // 4. Chat Disciple (Excluding initial welcome, user has conversation of at least 3 messages)
  if (chatMessagesCount >= 3) {
    earned.push('bdg_coach');
  }

  // 5. Challenge Conqueror
  if ((profile.completedChallengeIds ?? []).length >= 3) {
    earned.push('bdg_conqueror');
  }

  // 6. Planet Guardian
  if ((profile.xp ?? 0) >= 800) {
    earned.push('bdg_guardian');
  }

  return earned;
}
