import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEcoMind } from './hooks/useEcoMind';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingQuestionnaire } from './components/OnboardingQuestionnaire';
import { DashboardView } from './components/DashboardView';
import { loginWithGoogle, logout } from './firebase/config';
import { Recommendation } from './types';

// Custom subcomponents
import { ParticleLayer } from './components/dashboard/ParticleLayer';
import { MasterHeader } from './components/dashboard/MasterHeader';
import { MobileNavBar } from './components/dashboard/MobileNavBar';

// View modules
import { SplashScreen } from './components/SplashScreen';
import { CarbonScoreView } from './components/CarbonScoreView';
import { ChallengesView } from './components/ChallengesView';
import { RewardsView } from './components/RewardsView';
import { ProfileView } from './components/ProfileView';
import { CoachChat } from './components/CoachChat';

import { RefreshCw } from 'lucide-react';

type Tab = 'dashboard' | 'score' | 'coach' | 'quests' | 'rewards' | 'profile';

interface Particle {
  id: number;
  color: string;
  left: string;
  delay: string;
}

export default function App() {
  const {
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
    updateRecommendationStatus,
    dismissImpactLog,
    sendCoachMessage,
    addXpAndChallengeProgress,
    deductXpForTree,
    resetWeeklyProgress
  } = useEcoMind();

  const [forceQ, setForceQ] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const [splashEnded, setSplashEnded] = useState<boolean>(() => {
    return localStorage.getItem('ecomind_splash_dismissed') === 'true';
  });

  const xp = userProfile?.xp ?? 0;
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [particles, setParticles] = useState<Particle[]>([]);

  const triggerConfetti = () => {
    const colors = ['bg-emerald-400', 'bg-yellow-400', 'bg-blue-400', 'bg-purple-400', 'bg-rose-400'];
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: Date.now() + i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      console.error('Sign in failed:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setAuthError(errMsg || 'Google Auth cancelled.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setForceQ(false);
    setAuthLoading(true);
    setActiveTab('dashboard');
    try {
      if (isGuestMode) {
        disableGuestMode();
      } else {
        await logout();
      }
    } catch (err: unknown) {
      console.error('Log out failed:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogRecommendationAccomplished = async (rec: Recommendation, status: 'completed' | 'dismissed') => {
    try {
      await updateRecommendationStatus(rec, status);
      if (status === 'completed') {
        triggerConfetti();
      }
    } catch (err) {
      console.error("Failed status updates:", err);
    }
  };

  return (
    <div id="ecomind-app-shell" className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center justify-start select-none overflow-x-hidden relative font-sans">
      
      {/* Confetti celebrations layer */}
      <ParticleLayer particles={particles} />

      {/* Decorative ambient blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Unified Master Navigation Header */}
      <MasterHeader
        currentUser={currentUser}
        lifestyleData={lifestyleData}
        forceQ={forceQ}
        splashEnded={splashEnded}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        xp={xp}
      />

      {/* Central responsive viewport container */}
      <main className="w-full max-w-5xl px-4 py-6 sm:py-9 flex-1" id="ecomind-master-viewport">
        <AnimatePresence mode="wait">

          {/* SPLASH VIEW */}
          {!splashEnded ? (
            <motion.div
              key="splash-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <SplashScreen onContinue={() => {
                setSplashEnded(true);
                localStorage.setItem('ecomind_splash_dismissed', 'true');
              }} />
            </motion.div>
          ) : isLoading && !authLoading ? (
            
            /* LOADER VIEW */
            <motion.div
              key="system-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px] space-y-3"
            >
              <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                Assembling ecology criteria...
              </p>
            </motion.div>
            
          ) : !currentUser ? (
            
            /* AUTH SHELF */
            <motion.div
              key="auth-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AuthScreen
                onGoogleSignIn={handleGoogleSignIn}
                onContinueGuest={enableGuestMode}
                isLoading={authLoading}
                error={authError || error}
              />
            </motion.div>
            
          ) : (lifestyleData === null || forceQ) ? (
            
            /* ONBOARDING QUESTIONNAIRE */
            <motion.div
              key="onboarding-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="text-center space-y-1.5 mb-6 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-slate-950">Setup Eco Profile</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Calibrate your daily transport, meals, and utilities to establish baseline carbon score.</p>
              </div>
              <OnboardingQuestionnaire
                initialData={lifestyleData}
                onSave={async (data) => { await saveLifestyleHabits(data); setForceQ(false); triggerConfetti(); }}
                isLoading={isGenerating}
              />
            </motion.div>
          ) : (
            <motion.div
              key="active-tab-container" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }} className="min-h-[400px]"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  userProfile={userProfile} lifestyleData={lifestyleData}
                  recommendations={recommendations} impactLogs={impactLogs}
                  chatMessages={chatMessages} isChatLoading={isChatLoading}
                  isGenerating={isGenerating} isGuestMode={isGuestMode}
                  onUpdateStatus={handleLogRecommendationAccomplished}
                  onDismissLog={dismissImpactLog} onSendCoachMessage={sendCoachMessage}
                  onRecalibrate={() => setForceQ(true)} onLogout={handleLogout}
                />
              )}

              {activeTab === 'score' && (
                <CarbonScoreView lifestyleData={lifestyleData} onRecalibrate={() => setForceQ(true)} />
              )}

              {activeTab === 'coach' && (
                <div className="max-w-2xl mx-auto">
                  <CoachChat chatMessages={chatMessages} isChatLoading={isChatLoading} onSendMessage={sendCoachMessage} />
                </div>
              )}

              {activeTab === 'quests' && (
                <div className="max-w-2xl mx-auto">
                  <ChallengesView
                    streakCount={userProfile?.streakCount || 0}
                    completedChallengeIds={userProfile?.completedChallengeIds || []}
                    onAddXp={(amount, co2Saved, chId) => { addXpAndChallengeProgress(amount, co2Saved, chId); triggerConfetti(); }}
                  />
                </div>
              )}

              {activeTab === 'rewards' && (
                <div className="max-w-2xl mx-auto">
                  <RewardsView
                    xp={xp} totalCo2Saved={userProfile?.totalCo2SavedKg || 0}
                    userBadges={userProfile?.badges || []}
                    onDeductXpForTree={async () => { await deductXpForTree(); triggerConfetti(); }}
                  />
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="max-w-2xl mx-auto">
                  <ProfileView
                    userProfile={userProfile} lifestyleData={lifestyleData} xp={xp}
                    onRecalibrate={() => setForceQ(true)} onLogout={handleLogout}
                    onResetWeeklyGoal={resetWeeklyProgress}
                  />
                </div>
              )}
            </motion.div>
            
          )}
        </AnimatePresence>
      </main>

      {/* Elegant Mobile Navigation bar */}
      <MobileNavBar
        currentUser={currentUser}
        lifestyleData={lifestyleData}
        forceQ={forceQ}
        splashEnded={splashEnded}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Humble aesthetic project credit watermark */}
      <footer className="w-full text-center py-4 text-[10px] text-slate-400 mt-auto select-none pointer-events-none">
        EcoMind AI Carbon Decision Companion &bull; Powered by Gemini
      </footer>

    </div>
  );
}
