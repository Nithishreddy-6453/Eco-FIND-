import { useState, useCallback } from 'react';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  setDoc,
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, LifestyleData, Recommendation, ImpactLog, CoachChatMessage } from '../types';

const DEFAULT_GUEST_PROFILE = (uid = 'guest_user'): UserProfile => ({
  uid,
  email: uid === 'guest_user' ? 'guest@ecomind.ai' : null,
  displayName: uid === 'guest_user' ? 'Eco Guest' : null,
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
});

const DEFAULT_WELCOME_CHAT = (uid = 'guest_user'): CoachChatMessage => ({
  id: 'welcome_msg',
  uid,
  sender: 'coach',
  text: 'Hello! I am your AI Sustainability Coach. I evaluated your baseline parameters. Tell me, are you interested in mapping out your largest impact opportunities or comparing your custom action points?',
  createdAt: new Date().toISOString()
});

export function useAssociatedData() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lifestyleData, setLifestyleData] = useState<LifestyleData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [impactLogs, setImpactLogs] = useState<ImpactLog[]>([]);
  const [chatMessages, setChatMessages] = useState<CoachChatMessage[]>([]);
  
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load guest data locally from localStorage
  const loadGuestData = useCallback(() => {
    setIsLoading(true);
    const localProfile = localStorage.getItem('ecomind_profile');
    if (localProfile) {
      const raw = JSON.parse(localProfile) as UserProfile;
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
      const defaultProfile = DEFAULT_GUEST_PROFILE();
      localStorage.setItem('ecomind_profile', JSON.stringify(defaultProfile));
      setUserProfile(defaultProfile);
    }

    const lifestyleStr = localStorage.getItem('ecomind_lifestyle');
    const recsStr = localStorage.getItem('ecomind_recs');
    const logsStr = localStorage.getItem('ecomind_logs');
    const chatsStr = localStorage.getItem('ecomind_chats');

    setLifestyleData(lifestyleStr ? (JSON.parse(lifestyleStr) as LifestyleData) : null);
    setRecommendations(recsStr ? (JSON.parse(recsStr) as Recommendation[]) : []);
    setImpactLogs(logsStr ? (JSON.parse(logsStr) as ImpactLog[]) : []);
    setChatMessages(chatsStr ? (JSON.parse(chatsStr) as CoachChatMessage[]) : [DEFAULT_WELCOME_CHAT()]);

    setIsLoading(false);
  }, []);

  // Sync user profile statistics, create if not present
  const syncUserProfile = useCallback(async (uid: string, email: string | null, displayName: string | null, photoURL: string | null) => {
    const parentPath = `users/${uid}`;
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const raw = userSnap.data();
        const data: UserProfile = {
          uid,
          email: raw.email ?? email,
          displayName: raw.displayName ?? displayName,
          photoURL: raw.photoURL ?? photoURL,
          createdAt: raw.createdAt || new Date().toISOString(),
          streakCount: raw.streakCount ?? 0,
          totalCo2SavedKg: raw.totalCo2SavedKg ?? 0,
          lastActiveDate: raw.lastActiveDate ?? null,
          xp: raw.xp ?? 180,
          levelName: raw.levelName ?? 'Eco Beginner',
          badges: raw.badges ?? [],
          weeklyGoalCo2: raw.weeklyGoalCo2 ?? 50,
          weeklyProgressCo2: raw.weeklyProgressCo2 ?? 0,
          completedChallengeIds: raw.completedChallengeIds ?? []
        };
        setUserProfile(data);
        await fetchAssociatedUserData(uid);
      } else {
        const newProfile = DEFAULT_GUEST_PROFILE(uid);
        newProfile.email = email;
        newProfile.displayName = displayName;
        newProfile.photoURL = photoURL;
        newProfile.lastActiveDate = new Date().toISOString().split('T')[0];

        const freshData: DocumentData = {
          ...newProfile,
          createdAt: serverTimestamp()
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
  }, []);

  // Promise.all implementation to fetch habits, active recommendations and saved ledger logs concurrently
  const fetchAssociatedUserData = useCallback(async (uid: string) => {
    const recsPath = `users/${uid}/recommendations`;
    const logsPath = `users/${uid}/impact_logs`;
    const chatsPath = `users/${uid}/coach_chats`;

    try {
      const lifestyleRef = doc(db, 'users', uid, 'lifestyle', 'current');
      const recsRef = collection(db, 'users', uid, 'recommendations');
      const logsRef = collection(db, 'users', uid, 'impact_logs');
      const chatsRef = collection(db, 'users', uid, 'coach_chats');

      // CONCURRENT READS ACCORDING TO EFFICIENCY METRIC REQUIREMENTS
      const [lifestyleSnap, recsSnap, logsSnap, chatsSnap] = await Promise.all([
        getDoc(lifestyleRef),
        getDocs(recsRef).catch((getErr) => {
          handleFirestoreError(getErr, OperationType.LIST, recsPath);
          return null;
        }),
        getDocs(logsRef).catch((getErr) => {
          handleFirestoreError(getErr, OperationType.LIST, logsPath);
          return null;
        }),
        getDocs(chatsRef).catch((getErr) => {
          handleFirestoreError(getErr, OperationType.LIST, chatsPath);
          return null;
        })
      ]);

      setLifestyleData(lifestyleSnap?.exists() ? (lifestyleSnap.data() as LifestyleData) : null);

      const loadedRecs: Recommendation[] = recsSnap
        ? recsSnap.docs.map((docSnap) => {
            const raw = docSnap.data();
            return {
              ...raw,
              id: docSnap.id,
              createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt,
              updatedAt: raw.updatedAt?.toDate?.()?.toISOString() || raw.updatedAt
            } as Recommendation;
          })
        : [];
      setRecommendations(loadedRecs);

      const loadedLogs: ImpactLog[] = logsSnap
        ? logsSnap.docs.map((docSnap) => {
            const raw = docSnap.data();
            return {
              ...raw,
              id: docSnap.id,
              loggedAt: raw.loggedAt?.toDate?.()?.toISOString() || raw.loggedAt
            } as ImpactLog;
          })
        : [];
      setImpactLogs(loadedLogs);

      const loadedChats: CoachChatMessage[] = chatsSnap
        ? chatsSnap.docs.map((docSnap) => {
            const raw = docSnap.data();
            return {
              ...raw,
              id: docSnap.id,
              createdAt: raw.createdAt?.toDate?.()?.toISOString() || raw.createdAt
            } as CoachChatMessage;
          })
        : [];

      loadedChats.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      if (loadedChats.length === 0) {
        setChatMessages([DEFAULT_WELCOME_CHAT(uid)]);
      } else {
        setChatMessages(loadedChats);
      }

    } catch (err) {
      console.error('Unified parallel user data load failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch associated user logs.');
    } finally {
      setIsLoading(false);
    }
  }, []);


  return {
    userProfile,
    setUserProfile,
    lifestyleData,
    setLifestyleData,
    recommendations,
    setRecommendations,
    impactLogs,
    setImpactLogs,
    chatMessages,
    setChatMessages,
    isChatLoading,
    setIsChatLoading,
    isLoading,
    setIsLoading,
    isGenerating,
    setIsGenerating,
    error,
    setError,
    loadGuestData,
    syncUserProfile,
    fetchAssociatedUserData
  };
}
