import { useState, useEffect } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, LifestyleData, Recommendation, ImpactLog, CoachChatMessage } from '../types';
import { EcoMindAPI } from '../services/api';
import { getLevelInfo, calculateEarnedBadges } from '../utils/engagement';

export function useEcoMind() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lifestyleData, setLifestyleData] = useState<LifestyleData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [impactLogs, setImpactLogs] = useState<ImpactLog[]>([]);
  const [chatMessages, setChatMessages] = useState<CoachChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('ecomind_guest_active') === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load local guest files from local storage
  const loadGuestData = () => {
    setIsLoading(true);
    const mockUser = {
      uid: 'guest_user',
      displayName: 'Eco Guest',
      email: 'guest@ecomind.ai',
      photoURL: null
    } as any;
    setCurrentUser(mockUser);

    const localProfile = localStorage.getItem('ecomind_profile');
    if (localProfile) {
      const raw = JSON.parse(localProfile);
      const normalized: UserProfile = {
        ...raw,
        xp: raw.xp ?? 180,
        levelName: raw.levelName ?? 'Eco Beginner',
        badges: raw.badges ?? [],
        weeklyGoalCo2: raw.weeklyGoalCo2 ?? 50,
        weeklyProgressCo2: raw.weeklyProgressCo2 ?? 0,
        completedChallengeIds: raw.completedChallengeIds ?? []
      };
      setUserProfile(normalized);
    } else {
      const defaultProfile: UserProfile = {
        uid: 'guest_user',
        email: 'guest@ecomind.ai',
        displayName: 'Eco Guest',
        photoURL: null,
        createdAt: new Date().toISOString(),
        streakCount: 0,
        totalCo2SavedKg: 0,
        lastActiveDate: null,
        xp: 180,
        levelName: 'Eco Beginner',
        badges: [],
        weeklyGoalCo2: 50,
        weeklyProgressCo2: 0,
        completedChallengeIds: []
      };
      localStorage.setItem('ecomind_profile', JSON.stringify(defaultProfile));
      setUserProfile(defaultProfile);
    }

    const localLifestyle = localStorage.getItem('ecomind_lifestyle');
    setLifestyleData(localLifestyle ? JSON.parse(localLifestyle) : null);

    const localRecs = localStorage.getItem('ecomind_recs');
    setRecommendations(localRecs ? JSON.parse(localRecs) : []);

    const localLogs = localStorage.getItem('ecomind_logs');
    setImpactLogs(localLogs ? JSON.parse(localLogs) : []);

    const localChats = localStorage.getItem('ecomind_chats');
    setChatMessages(localChats ? JSON.parse(localChats) : [
      {
        id: 'welcome_msg',
        uid: 'guest_user',
        sender: 'coach',
        text: 'Hello! I am your AI Sustainability Coach. I evaluated your baseline parameters. Tell me, are you interested in mapping out your largest impact opportunities or comparing your custom action points?',
        createdAt: new Date().toISOString()
      }
    ]);

    setIsLoading(false);
  };

  const enableGuestMode = () => {
    setIsGuestMode(true);
    localStorage.setItem('ecomind_guest_active', 'true');
    loadGuestData();
  };

  const disableGuestMode = () => {
    setIsGuestMode(false);
    localStorage.removeItem('ecomind_guest_active');
    setCurrentUser(null);
    setUserProfile(null);
    setLifestyleData(null);
    setRecommendations([]);
    setImpactLogs([]);
    setChatMessages([]);
    setIsChatLoading(false);
  };

  // 1. Synchronize authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      setError(null);
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        setIsGuestMode(false);
        localStorage.removeItem('ecomind_guest_active');
        await syncUserProfile(firebaseUser);
      } else if (isGuestMode) {
        loadGuestData();
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setLifestyleData(null);
        setRecommendations([]);
        setImpactLogs([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isGuestMode]);

  // Sync user profile statistics, create if not present
  const syncUserProfile = async (firebaseUser: User) => {
    const parentPath = `users/${firebaseUser.uid}`;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const raw = userSnap.data();
        const data: UserProfile = {
          ...raw,
          xp: raw.xp ?? 180,
          levelName: raw.levelName ?? 'Eco Beginner',
          badges: raw.badges ?? [],
          weeklyGoalCo2: raw.weeklyGoalCo2 ?? 50,
          weeklyProgressCo2: raw.weeklyProgressCo2 ?? 0,
          completedChallengeIds: raw.completedChallengeIds ?? []
        } as UserProfile;
        setUserProfile(data);
        await fetchAssociatedUserData(firebaseUser.uid);
      } else {
        // Construct clean user profile
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: new Date().toISOString(),
          streakCount: 0,
          totalCo2SavedKg: 0,
          lastActiveDate: new Date().toISOString().split('T')[0],
          xp: 180,
          levelName: 'Eco Beginner',
          badges: [],
          weeklyGoalCo2: 50,
          weeklyProgressCo2: 0,
          completedChallengeIds: []
        };

        const freshData: DocumentData = {
          ...newProfile,
          createdAt: serverTimestamp() // align with server timestamp security requirements
        };

        try {
          await setDoc(userRef, freshData);
        } catch (setErr) {
          handleFirestoreError(setErr, OperationType.CREATE, parentPath);
        }

        setUserProfile(newProfile);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database sync failed');
      setIsLoading(false);
    }
  };

  // Fetch lifestyle habits, active recommendations and saved ledger logs
  const fetchAssociatedUserData = async (uid: string) => {
    const lifestylePath = `users/${uid}/lifestyle/current`;
    const recsPath = `users/${uid}/recommendations`;
    const logsPath = `users/${uid}/impact_logs`;

    try {
      // 1. Fetch habits
      const lifestyleRef = doc(db, 'users', uid, 'lifestyle', 'current');
      const lifestyleSnap = await getDoc(lifestyleRef);
      if (lifestyleSnap.exists()) {
        setLifestyleData(lifestyleSnap.data() as LifestyleData);
      } else {
        setLifestyleData(null);
      }

      // 2. Fetch recommendations
      const recsRef = collection(db, 'users', uid, 'recommendations');
      let recsSnap;
      try {
        recsSnap = await getDocs(recsRef);
      } catch (getErr) {
        handleFirestoreError(getErr, OperationType.LIST, recsPath);
      }
      
      const loadedRecs: Recommendation[] = [];
      recsSnap?.forEach((docSnap) => {
        const raw = docSnap.data();
        loadedRecs.push({
          ...raw,
          id: docSnap.id,
          createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt,
          updatedAt: raw.updatedAt?.toDate?.()?.toISOString() || raw.updatedAt
        } as Recommendation);
      });
      setRecommendations(loadedRecs);

      // 3. Fetch impact logs
      const logsRef = collection(db, 'users', uid, 'impact_logs');
      let logsSnap;
      try {
        logsSnap = await getDocs(logsRef);
      } catch (getErr) {
        handleFirestoreError(getErr, OperationType.LIST, logsPath);
      }

      const loadedLogs: ImpactLog[] = [];
      logsSnap?.forEach((docSnap) => {
        const raw = docSnap.data();
        loadedLogs.push({
          ...raw,
          id: docSnap.id,
          loggedAt: raw.loggedAt?.toDate?.()?.toISOString() || raw.loggedAt
        } as ImpactLog);
      });
      setImpactLogs(loadedLogs);

      // 4. Fetch coach chats
      const chatsRef = collection(db, 'users', uid, 'coach_chats');
      let chatsSnap;
      try {
        chatsSnap = await getDocs(chatsRef);
      } catch (getErr) {
        handleFirestoreError(getErr, OperationType.LIST, `users/${uid}/coach_chats`);
      }

      const loadedChats: CoachChatMessage[] = [];
      chatsSnap?.forEach((docSnap) => {
        const raw = docSnap.data();
        loadedChats.push({
          ...raw,
          id: docSnap.id,
          createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt
        } as CoachChatMessage);
      });

      // Sort by createdAt ascending safely
      loadedChats.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      if (loadedChats.length === 0) {
        const welcome: CoachChatMessage = {
          id: 'welcome_msg',
          uid: uid,
          sender: 'coach',
          text: 'Hello! I am your AI Sustainability Coach. I evaluated your baseline parameters. Tell me, are you interested in mapping out your largest impact opportunities or comparing your custom action points?',
          createdAt: new Date().toISOString()
        };
        setChatMessages([welcome]);
      } else {
        setChatMessages(loadedChats);
      }
      
    } catch (err) {
      console.error('Core user data load failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch associated user logs.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Saves or updates the user's questionnaire results
   */
  const saveLifestyleHabits = async (input: Omit<LifestyleData, 'uid' | 'updatedAt'>) => {
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
      await triggerAIRecommendations(finalHabits);
      return;
    }

    const path = `users/${currentUser.uid}/lifestyle/current`;
    const docPayload: DocumentData = {
      ...finalHabits,
      updatedAt: serverTimestamp() // Force strict system timestamp logic
    };

    try {
      const lifestyleRef = doc(db, 'users', currentUser.uid, 'lifestyle', 'current');
      try {
        await setDoc(lifestyleRef, docPayload);
      } catch (setErr) {
        handleFirestoreError(setErr, OperationType.WRITE, path);
      }

      setLifestyleData(finalHabits);
      
      // Auto-trigger recommendations regeneration when habits are successfully saved
      await triggerAIRecommendations(finalHabits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update habits.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calls local Express server with user lifestyle metrics to generate custom comparative analysis
   */
  const triggerAIRecommendations = async (lifestyle: LifestyleData) => {
    if (!currentUser) return;
    setIsGenerating(true);
    setError(null);

    try {
      const coachData = await EcoMindAPI.generatePersonalizedCoachRecommendations(lifestyle);
      if (coachData.success && coachData.recommendations.length > 0) {
        const generatedRecs: Recommendation[] = [];

        coachData.recommendations.forEach((rec, idx) => {
          const recId = `rec_${Date.now()}_${idx}`;
          const finalRec: Recommendation = {
            ...rec,
            id: recId,
            uid: currentUser.uid,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          generatedRecs.push(finalRec);
        });

        if (isGuestMode) {
          localStorage.setItem('ecomind_recs', JSON.stringify(generatedRecs));
          setRecommendations(generatedRecs);
          setIsGenerating(false);
          return;
        }

        const recBaseCollectionPath = `users/${currentUser.uid}/recommendations`;
        // Write generated outputs synchronously in a robust batch action
        const batch = writeBatch(db);

        // Prune old recommendations list
        for (const r of recommendations) {
          const oldRef = doc(db, 'users', currentUser.uid, 'recommendations', r.id);
          batch.delete(oldRef);
        }

        generatedRecs.forEach((finalRec) => {
          const docRef = doc(db, 'users', currentUser.uid, 'recommendations', finalRec.id);
          const writePayload: DocumentData = {
            ...finalRec,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          batch.set(docRef, writePayload);
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
  };

  /**
   * Complete or discard highly descriptive recommendations
   */
  const updateRecommendationStatus = async (rec: Recommendation, status: 'completed' | 'dismissed') => {
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

      // Update inside memory
      setRecommendations(prev => prev.map(r => r.id === rec.id ? { ...r, status, updatedAt: new Date().toISOString() } : r));

      // If marked compile, write the logged achievement and increment carbon saving stats
      if (status === 'completed') {
        await registerSavingAccomplished(rec);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error modifying recommendation action.');
    }
  };

  /**
   * Log an accomplishment in the ledger and atomically update User Profile total carbon savings
   */
  const registerSavingAccomplished = async (rec: Recommendation) => {
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

    // Daily streak count logic
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = userProfile.streakCount;
    if (userProfile.lastActiveDate !== todayStr) {
      newStreak += 1;
    }

    // Engagement level and weekly progress
    let newXp = (userProfile.xp ?? 180) + 100; // default 100 XP for completing a recommendation
    const newWeeklyProgress = (userProfile.weeklyProgressCo2 ?? 0) + rec.co2SavedKgPerYear;
    
    // Check if weekly goal completed
    const goalCrossed = (userProfile.weeklyProgressCo2 ?? 0) < (userProfile.weeklyGoalCo2 ?? 50) && 
                         newWeeklyProgress >= (userProfile.weeklyGoalCo2 ?? 50);
    if (goalCrossed) {
      newXp += 150; // award 150 XP bonus!
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

    // Calculate badges dynamically based on target logs
    const updatedBadges = calculateEarnedBadges(tentativeProfile, [newLog, ...impactLogs], chatMessages.length);
    
    const updatedProfile: UserProfile = {
      ...tentativeProfile,
      badges: updatedBadges
    };

    if (isGuestMode) {
      const updatedLogs = [newLog, ...impactLogs];
      localStorage.setItem('ecomind_logs', JSON.stringify(updatedLogs));
      localStorage.setItem('ecomind_profile', JSON.stringify(updatedProfile));
      
      setUserProfile(updatedProfile);
      setImpactLogs(updatedLogs);
      return;
    }

    const logPath = `users/${currentUser.uid}/impact_logs/${logId}`;
    const profilePath = `users/${currentUser.uid}`;

    // Use synchronous transaction execution to enforce atomic integrity as mandated by rule existsAfter
    const batch = writeBatch(db);

    const logRef = doc(db, 'users', currentUser.uid, 'impact_logs', logId);
    batch.set(logRef, {
      ...newLog,
      loggedAt: serverTimestamp()
    });

    const userRef = doc(db, 'users', currentUser.uid);
    batch.update(userRef, {
      totalCo2SavedKg: calculatedCo2Total,
      streakCount: newStreak,
      lastActiveDate: todayStr,
      xp: newXp,
      levelName: levelInfo.name,
      weeklyProgressCo2: newWeeklyProgress,
      badges: updatedBadges
    });

    try {
      await batch.commit();
    } catch (batchErr) {
      handleFirestoreError(batchErr, OperationType.WRITE, `${logPath} & ${profilePath}`);
    }

    setUserProfile(updatedProfile);
    setImpactLogs(prev => [newLog, ...prev]);
  };

  /**
   * Completes a quest/challenge: awards XP, adds CO2 savings, registers completed quests IDs in list
   */
  const addXpAndChallengeProgress = async (xpReward: number, co2Saved: number, challengeId?: string) => {
    if (!currentUser || !userProfile) return;

    let newXp = (userProfile.xp ?? 180) + xpReward;
    const newWeeklyProgress = (userProfile.weeklyProgressCo2 ?? 0) + co2Saved;

    // Check if weekly goal completed
    const goalCrossed = (userProfile.weeklyProgressCo2 ?? 0) < (userProfile.weeklyGoalCo2 ?? 50) && 
                         newWeeklyProgress >= (userProfile.weeklyGoalCo2 ?? 50);
    if (goalCrossed) {
      newXp += 150; // award 150 XP bonus!
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

    const updatedBadges = calculateEarnedBadges(tentativeProfile, impactLogs, chatMessages.length);

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
  };

  /**
   * Deducts XP to buy water/nutrients to grow trees (virtual gamification mechanics)
   */
  const deductXpForTree = async () => {
    if (!currentUser || !userProfile) return;

    const newXp = Math.max(0, (userProfile.xp ?? 180) - 50);
    const levelInfo = getLevelInfo(newXp);

    const tentativeProfile: UserProfile = {
      ...userProfile,
      xp: newXp,
      levelName: levelInfo.name
    };

    const updatedBadges = calculateEarnedBadges(tentativeProfile, impactLogs, chatMessages.length);

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
  };

  /**
   * Recalibrates custom weekly goal limits and zeroes active progress tracking arrays
   */
  const resetWeeklyProgress = async (newGoal: number = 50) => {
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
  };

  /**
   * Send a query to the Gemini Sustainability Coach to explain WHY our recommendations matter
   */
  const sendCoachMessage = async (text: string) => {
    if (!currentUser) return;
    setIsChatLoading(true);
    setError(null);

    const userMsgId = `msg_${Date.now()}_user`;
    const newUserMsg: CoachChatMessage = {
      id: userMsgId,
      uid: currentUser.uid,
      sender: 'user',
      text,
      createdAt: new Date().toISOString()
    };

    // Update state optimism
    setChatMessages(prev => [...prev, newUserMsg]);

    if (isGuestMode) {
      const currentLocalChatsStr = localStorage.getItem('ecomind_chats') || '[]';
      const currentLocalChats = currentLocalChatsStr !== '[]' ? JSON.parse(currentLocalChatsStr) : [
        {
          id: 'welcome_msg',
          uid: 'guest_user',
          sender: 'coach',
          text: 'Hello! I am your AI Sustainability Coach. I evaluated your baseline parameters. Tell me, are you interested in mapping out your largest impact opportunities or comparing your custom action points?',
          createdAt: new Date().toISOString()
        }
      ];
      const updatedChats = [...currentLocalChats, newUserMsg];
      localStorage.setItem('ecomind_chats', JSON.stringify(updatedChats));
    } else {
      const userMsgPath = `users/${currentUser.uid}/coach_chats/${userMsgId}`;
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'coach_chats', userMsgId), {
          ...newUserMsg,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, userMsgPath);
      }
    }

    try {
      // Build conversation window history
      const historyToSend = [...chatMessages, newUserMsg].map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      // Focus last 10 messages
      const activeHistory = historyToSend.slice(-10);

      const coachResult = await EcoMindAPI.sendCoachChatMessage(
        text,
        activeHistory,
        lifestyleData,
        userProfile,
        recommendations,
        impactLogs
      );

      const coachMsgId = `msg_${Date.now()}_coach`;
      const newCoachMsg: CoachChatMessage = {
        id: coachMsgId,
        uid: currentUser.uid,
        sender: 'coach',
        text: coachResult.text,
        createdAt: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, newCoachMsg]);

      if (isGuestMode) {
        const currentLocalChatsStr = localStorage.getItem('ecomind_chats') || '[]';
        const currentLocalChats = JSON.parse(currentLocalChatsStr);
        const updatedChats = [...currentLocalChats, newCoachMsg];
        localStorage.setItem('ecomind_chats', JSON.stringify(updatedChats));
      } else {
        const coachMsgPath = `users/${currentUser.uid}/coach_chats/${coachMsgId}`;
        try {
          await setDoc(doc(db, 'users', currentUser.uid, 'coach_chats', coachMsgId), {
            ...newCoachMsg,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, coachMsgPath);
        }
      }

    } catch (err) {
      console.error('Coaching chat failure:', err);
      // Inject standard connection trouble visual notification directly in chat
      const errorCoachMsg: CoachChatMessage = {
        id: `msg_err_${Date.now()}`,
        uid: currentUser.uid,
        sender: 'coach',
        text: `⚠️ *Connection Alert:* I had trouble communicating with my sustainability science engine. Please verify that your **GEMINI_API_KEY** is attached in the settings pane, and try sending your query again.`,
        createdAt: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorCoachMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  /**
   * Delete an existing impact log entry
   */
  const dismissImpactLog = async (logId: string, loggedCo2: number) => {
    if (!currentUser || !userProfile) return;

    const calculatedCo2Total = Math.max(0, userProfile.totalCo2SavedKg - loggedCo2);
    const updatedProfile = { ...userProfile, totalCo2SavedKg: calculatedCo2Total };

    if (isGuestMode) {
      const updatedLogs = impactLogs.filter(l => l.id !== logId);
      localStorage.setItem('ecomind_logs', JSON.stringify(updatedLogs));
      localStorage.setItem('ecomind_profile', JSON.stringify(updatedProfile));

      setUserProfile(updatedProfile);
      setImpactLogs(updatedLogs);
      return;
    }

    const path = `users/${currentUser.uid}/impact_logs/${logId}`;
    try {
      const logRef = doc(db, 'users', currentUser.uid, 'impact_logs', logId);
      try {
        await deleteDoc(logRef);
      } catch (delErr) {
        handleFirestoreError(delErr, OperationType.DELETE, path);
      }

      // Decrement statistics
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        totalCo2SavedKg: calculatedCo2Total
      });

      setUserProfile(updatedProfile);
      setImpactLogs(prev => prev.filter(l => l.id !== logId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting log item');
    }
  };

  return {
    currentUser,
    userProfile,
    lifestyleData,
    recommendations,
    impactLogs,
    isLoading,
    isGenerating,
    isGuestMode,
    error,
    chatMessages,
    isChatLoading,
    enableGuestMode,
    disableGuestMode,
    saveLifestyleHabits,
    triggerAIRecommendations,
    updateRecommendationStatus,
    dismissImpactLog,
    sendCoachMessage,
    addXpAndChallengeProgress,
    deductXpForTree,
    resetWeeklyProgress
  };
}
