import { useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../firebase/config';
import { UserProfile, ImpactLog } from '../types';
import { getLevelInfo, calculateEarnedBadges } from '../utils/engagement';

interface GamificationParams {
  currentUser: User | null;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  isGuestMode: boolean;
  impactLogs: ImpactLog[];
  chatMessagesCount: number;
  setError: (err: string | null) => void;
}

export function useEcoMindGamification({
  currentUser,
  userProfile,
  setUserProfile,
  isGuestMode,
  impactLogs,
  chatMessagesCount,
  setError,
}: GamificationParams) {
  const addXpAndChallengeProgress = useCallback(async (xpReward: number, co2Saved: number, challengeId?: string) => {
    if (!currentUser || !userProfile) return;

    let newXp = (userProfile.xp ?? 180) + xpReward;
    const newWeeklyProgress = (userProfile.weeklyProgressCo2 ?? 0) + co2Saved;

    const goalCrossed = (userProfile.weeklyProgressCo2 ?? 0) < (userProfile.weeklyGoalCo2 ?? 50) && 
                         newWeeklyProgress >= (userProfile.weeklyGoalCo2 ?? 50);
    if (goalCrossed) {
      newXp += 150;
    }

    const updatedChallenges = [...(userProfile.completedChallengeIds ?? [])];
    if (challengeId && !updatedChallenges.includes(challengeId)) {
      updatedChallenges.push(challengeId);
    }

    const levelInfo = getLevelInfo(newXp);

    const tentativeProfile: UserProfile = {
      ...userProfile,
      xp: newXp,
      levelName: levelInfo.name,
      weeklyProgressCo2: newWeeklyProgress,
      completedChallengeIds: updatedChallenges,
      totalCo2SavedKg: userProfile.totalCo2SavedKg + co2Saved
    };

    const updatedBadges = calculateEarnedBadges(tentativeProfile, impactLogs, chatMessagesCount);

    const updatedProfile: UserProfile = {
      ...tentativeProfile,
      badges: updatedBadges
    };

    if (isGuestMode) {
      localStorage.setItem('ecomind_profile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        xp: updatedProfile.xp,
        levelName: updatedProfile.levelName,
        weeklyProgressCo2: updatedProfile.weeklyProgressCo2,
        completedChallengeIds: updatedProfile.completedChallengeIds,
        totalCo2SavedKg: updatedProfile.totalCo2SavedKg,
        badges: updatedProfile.badges
      });
      setUserProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating challenge progression.');
    }
  }, [currentUser, userProfile, isGuestMode, impactLogs, chatMessagesCount, setUserProfile, setError]);

  const deductXpForTree = useCallback(async () => {
    if (!currentUser || !userProfile) return;

    const newXp = Math.max(0, (userProfile.xp ?? 180) - 50);
    const levelInfo = getLevelInfo(newXp);

    const tentativeProfile: UserProfile = {
      ...userProfile,
      xp: newXp,
      levelName: levelInfo.name
    };

    const updatedBadges = calculateEarnedBadges(tentativeProfile, impactLogs, chatMessagesCount);

    const updatedProfile: UserProfile = {
      ...tentativeProfile,
      badges: updatedBadges
    };

    if (isGuestMode) {
      localStorage.setItem('ecomind_profile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        xp: updatedProfile.xp,
        levelName: updatedProfile.levelName,
        badges: updatedProfile.badges
      });
      setUserProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating tree reward purchase.');
    }
  }, [currentUser, userProfile, isGuestMode, impactLogs, chatMessagesCount, setUserProfile, setError]);

  const resetWeeklyProgress = useCallback(async (newGoal: number = 50) => {
    if (!currentUser || !userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      weeklyGoalCo2: newGoal,
      weeklyProgressCo2: 0
    };

    if (isGuestMode) {
      localStorage.setItem('ecomind_profile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        weeklyGoalCo2: newGoal,
        weeklyProgressCo2: 0
      });
      setUserProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rewriting weekly limit parameters.');
    }
  }, [currentUser, userProfile, isGuestMode, setUserProfile, setError]);

  return {
    addXpAndChallengeProgress,
    deductXpForTree,
    resetWeeklyProgress
  };
}
