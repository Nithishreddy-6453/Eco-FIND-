import React, { useCallback } from 'react';
import { doc, setDoc, updateDoc, writeBatch, serverTimestamp, type DocumentData } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, LifestyleData, Recommendation, ImpactLog } from '../types';
import { EcoMindAPI } from '../services/api';
import { getLevelInfo, calculateEarnedBadges } from '../utils/engagement';

interface HabitsParams {
  currentUser: User | null;
  isGuestMode: boolean;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  lifestyleData: LifestyleData | null;
  setLifestyleData: (lifestyle: LifestyleData | null) => void;
  recommendations: Recommendation[];
  setRecommendations: React.Dispatch<React.SetStateAction<Recommendation[]>>;
  impactLogs: ImpactLog[];
  setImpactLogs: React.Dispatch<React.SetStateAction<ImpactLog[]>>;
  chatMessagesCount: number;
  setIsLoading: (val: boolean) => void;
  setIsGenerating: (val: boolean) => void;
  setError: (err: string | null) => void;
}

export function useEcoMindHabits({
  currentUser, isGuestMode, userProfile, setUserProfile, lifestyleData, setLifestyleData,
  recommendations, setRecommendations, impactLogs, setImpactLogs, chatMessagesCount,
  setIsLoading, setIsGenerating, setError,
}: HabitsParams) {

  const triggerAIRecommendations = useCallback(async (lifestyle: LifestyleData) => {
    if (!currentUser) return;
    setIsGenerating(true);
    setError(null);

    try {
      const coachData = await EcoMindAPI.generatePersonalizedCoachRecommendations(lifestyle, userProfile, impactLogs);
      if (coachData.success && coachData.recommendations.length > 0) {
        const generatedRecs: Recommendation[] = coachData.recommendations.map((rec, idx) => ({
          ...rec,
          id: `rec_${Date.now()}_${idx}`,
          uid: currentUser.uid,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        if (isGuestMode) {
          localStorage.setItem('ecomind_recs', JSON.stringify(generatedRecs));
          setRecommendations(generatedRecs);
          setIsGenerating(false);
          return;
        }

        const recBaseCollectionPath = `users/${currentUser.uid}/recommendations`;
        const batch = writeBatch(db);

        // Prune old recommendations list
        for (const r of recommendations) {
          batch.delete(doc(db, 'users', currentUser.uid, 'recommendations', r.id));
        }

        generatedRecs.forEach((r) => {
          batch.set(doc(db, 'users', currentUser.uid, 'recommendations', r.id), {
            ...r,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        });

        try {
          await batch.commit();
        } catch (batchErr) {
          handleFirestoreError(batchErr, OperationType.WRITE, recBaseCollectionPath);
        }

        setRecommendations(generatedRecs);
      }
    } catch (err) {
      console.error('Trigger actions logic failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to trigger Gemini custom advice.');
    } finally {
      setIsGenerating(false);
    }
  }, [currentUser, isGuestMode, recommendations, setRecommendations, setError, setIsGenerating, userProfile, impactLogs]);

  const saveLifestyleHabits = useCallback(async (input: Omit<LifestyleData, 'uid' | 'updatedAt'>) => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);

    const finalHabits: LifestyleData = {
      ...input,
      uid: currentUser.uid,
      updatedAt: new Date().toISOString()
    };

    if (isGuestMode) {
      localStorage.setItem('ecomind_lifestyle', JSON.stringify(finalHabits));
      setLifestyleData(finalHabits);
      setIsLoading(false);
      return triggerAIRecommendations(finalHabits);
    }

    const path = `users/${currentUser.uid}/lifestyle/current`;
    const docPayload: DocumentData = {
      ...finalHabits,
      updatedAt: serverTimestamp()
    };

    try {
      const lifestyleRef = doc(db, 'users', currentUser.uid, 'lifestyle', 'current');
      try {
        await setDoc(lifestyleRef, docPayload);
      } catch (setErr) {
        handleFirestoreError(setErr, OperationType.WRITE, path);
      }

      setLifestyleData(finalHabits);
      await triggerAIRecommendations(finalHabits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update habits.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, isGuestMode, triggerAIRecommendations, setLifestyleData, setIsLoading, setError]);

  const registerSavingAccomplished = useCallback(async (rec: Recommendation) => {
    if (!currentUser || !userProfile) return;

    const logId = `log_${Date.now()}`;
    const newLog: ImpactLog = {
      id: logId,
      uid: currentUser.uid,
      recommendationId: rec.id,
      recommendationTitle: rec.title,
      category: rec.category,
      co2SavedKg: rec.co2SavedKgPerYear,
      loggedAt: new Date().toISOString()
    };

    const calculatedCo2Total = userProfile.totalCo2SavedKg + rec.co2SavedKgPerYear;
    const todayStr = new Date().toISOString().split('T')[0];
    const newStreak = userProfile.lastActiveDate !== todayStr ? userProfile.streakCount + 1 : userProfile.streakCount;

    let newXp = (userProfile.xp ?? 180) + 100;
    const newWeeklyProgress = (userProfile.weeklyProgressCo2 ?? 0) + rec.co2SavedKgPerYear;
    if ((userProfile.weeklyProgressCo2 ?? 0) < (userProfile.weeklyGoalCo2 ?? 50) && newWeeklyProgress >= (userProfile.weeklyGoalCo2 ?? 50)) {
      newXp += 150;
    }

    const levelInfo = getLevelInfo(newXp);
    const tentativeProfile: UserProfile = {
      ...userProfile,
      totalCo2SavedKg: calculatedCo2Total,
      streakCount: newStreak,
      lastActiveDate: todayStr,
      xp: newXp,
      levelName: levelInfo.name,
      weeklyProgressCo2: newWeeklyProgress
    };

    const updatedProfile: UserProfile = {
      ...tentativeProfile,
      badges: calculateEarnedBadges(tentativeProfile, [newLog, ...impactLogs], chatMessagesCount)
    };

    if (isGuestMode) {
      const updatedLogs = [newLog, ...impactLogs];
      localStorage.setItem('ecomind_logs', JSON.stringify(updatedLogs));
      localStorage.setItem('ecomind_profile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      setImpactLogs(updatedLogs);
      return;
    }

    const batch = writeBatch(db);
    batch.set(doc(db, 'users', currentUser.uid, 'impact_logs', logId), { ...newLog, loggedAt: serverTimestamp() });
    batch.update(doc(db, 'users', currentUser.uid), {
      totalCo2SavedKg: calculatedCo2Total,
      streakCount: newStreak,
      lastActiveDate: todayStr,
      xp: newXp,
      levelName: levelInfo.name,
      weeklyProgressCo2: newWeeklyProgress,
      badges: updatedProfile.badges
    });

    try {
      await batch.commit();
    } catch (batchErr) {
      handleFirestoreError(batchErr, OperationType.WRITE, `users/${currentUser.uid}/impact_logs/${logId} & users/${currentUser.uid}`);
    }

    setUserProfile(updatedProfile);
    setImpactLogs(prev => [newLog, ...prev]);
  }, [currentUser, userProfile, isGuestMode, impactLogs, chatMessagesCount, setUserProfile, setImpactLogs]);

  const updateRecommendationStatus = useCallback(async (rec: Recommendation, status: 'completed' | 'dismissed') => {
    if (!currentUser) return;

    if (isGuestMode) {
      const updatedRecs = recommendations.map(r => r.id === rec.id ? { ...r, status, updatedAt: new Date().toISOString() } : r);
      localStorage.setItem('ecomind_recs', JSON.stringify(updatedRecs));
      setRecommendations(updatedRecs);

      if (status === 'completed') {
        await registerSavingAccomplished(rec);
      }
      return;
    }

    const path = `users/${currentUser.uid}/recommendations/${rec.id}`;
    try {
      const recRef = doc(db, 'users', currentUser.uid, 'recommendations', rec.id);
      
      const updatePayload: DocumentData = {
        status,
        updatedAt: serverTimestamp()
      };

      try {
        await updateDoc(recRef, updatePayload);
      } catch (updateErr) {
        handleFirestoreError(updateErr, OperationType.UPDATE, path);
      }

      setRecommendations(prev => prev.map(r => r.id === rec.id ? { ...r, status, updatedAt: new Date().toISOString() } : r));

      if (status === 'completed') {
        await registerSavingAccomplished(rec);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error modifying recommendation action.');
    }
  }, [currentUser, isGuestMode, recommendations, registerSavingAccomplished, setRecommendations, setError]);

  return {
    saveLifestyleHabits,
    triggerAIRecommendations,
    updateRecommendationStatus,
  };
}
