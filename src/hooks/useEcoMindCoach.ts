import React, { useCallback } from 'react';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, LifestyleData, Recommendation, ImpactLog, CoachChatMessage } from '../types';
import { EcoMindAPI } from '../services/api';

interface CoachParams {
  currentUser: User | null;
  isGuestMode: boolean;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  lifestyleData: LifestyleData | null;
  recommendations: Recommendation[];
  impactLogs: ImpactLog[];
  setImpactLogs: React.Dispatch<React.SetStateAction<ImpactLog[]>>;
  chatMessages: CoachChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<CoachChatMessage[]>>;
  setIsChatLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
}

export function useEcoMindCoach({
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
  setError,
}: CoachParams) {

  const sendCoachMessage = useCallback(async (text: string) => {
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

    setChatMessages(prev => [...prev, newUserMsg]);

    if (isGuestMode) {
      const currentLocalChatsStr = localStorage.getItem('ecomind_chats') || '[]';
      const currentLocalChats = currentLocalChatsStr !== '[]' ? (JSON.parse(currentLocalChatsStr) as CoachChatMessage[]) : [
        {
          id: 'welcome_msg',
          uid: 'guest_user',
          sender: 'coach' as const,
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
      const historyToSend = [...chatMessages, newUserMsg].map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

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
        const currentLocalChats = JSON.parse(currentLocalChatsStr) as CoachChatMessage[];
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
  }, [currentUser, isGuestMode, chatMessages, lifestyleData, userProfile, recommendations, impactLogs, setChatMessages, setIsChatLoading, setError]);

  const dismissImpactLog = useCallback(async (logId: string, loggedCo2: number) => {
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

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        totalCo2SavedKg: calculatedCo2Total
      });

      setUserProfile(updatedProfile);
      setImpactLogs(prev => prev.filter(l => l.id !== logId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting log item');
    }
  }, [currentUser, userProfile, isGuestMode, impactLogs, setUserProfile, setImpactLogs, setError]);

  return {
    sendCoachMessage,
    dismissImpactLog
  };
}
