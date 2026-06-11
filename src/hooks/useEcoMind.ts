import { useEffect } from 'react';
import { useAuthListener } from './useAuthListener';
import { useAssociatedData } from './useAssociatedData';
import { useEcoMindGamification } from './useEcoMindGamification';
import { useEcoMindHabits } from './useEcoMindHabits';
import { useEcoMindCoach } from './useEcoMindCoach';

export function useEcoMind() {
  const {
    currentUser,
    isGuestMode,
    authLoading,
    enableGuestMode,
    disableGuestMode
  } = useAuthListener();

  const {
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
    syncUserProfile
  } = useAssociatedData();

  // Unified loading orchestrator
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (currentUser) {
      if (isGuestMode) {
        loadGuestData();
      } else {
        syncUserProfile(currentUser.uid, currentUser.email, currentUser.displayName, currentUser.photoURL);
      }
    } else {
      setUserProfile(null);
      setLifestyleData(null);
      setRecommendations([]);
      setImpactLogs([]);
      setIsLoading(false);
    }
  }, [currentUser, authLoading, isGuestMode, loadGuestData, syncUserProfile, setUserProfile, setLifestyleData, setRecommendations, setImpactLogs, setIsLoading]);

  // Decoupled sub-hook for gamification mechanics
  const {
    addXpAndChallengeProgress,
    deductXpForTree,
    resetWeeklyProgress
  } = useEcoMindGamification({
    currentUser,
    userProfile,
    setUserProfile,
    isGuestMode,
    impactLogs,
    chatMessagesCount: chatMessages.length,
    setError
  });

  // Decoupled sub-hook for lifestyle metrics & dynamic recommendations
  const {
    saveLifestyleHabits,
    triggerAIRecommendations,
    updateRecommendationStatus
  } = useEcoMindHabits({
    currentUser,
    isGuestMode,
    userProfile,
    setUserProfile,
    lifestyleData,
    setLifestyleData,
    recommendations,
    setRecommendations,
    impactLogs,
    setImpactLogs,
    chatMessagesCount: chatMessages.length,
    setIsLoading,
    setIsGenerating,
    setError
  });

  // Decoupled sub-hook for virtual coach chat guidance & ledger log deletions
  const {
    sendCoachMessage,
    dismissImpactLog
  } = useEcoMindCoach({
    currentUser,
    isGuestMode,
    userProfile,
    setUserProfile,
    lifestyleData,
    recommendations,
    impactLogs,
    setImpactLogs,
    chatMessages,
    setChatMessages,
    setIsChatLoading,
    setError
  });

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
