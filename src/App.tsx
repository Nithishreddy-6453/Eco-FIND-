import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEcoMind } from './hooks/useEcoMind';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingQuestionnaire } from './components/OnboardingQuestionnaire';
import { DashboardView } from './components/DashboardView';
import { loginWithGoogle, logout } from './firebase/config';

// View modules
import { SplashScreen } from './components/SplashScreen';
import { CarbonScoreView } from './components/CarbonScoreView';
import { ChallengesView } from './components/ChallengesView';
import { RewardsView } from './components/RewardsView';
import { ProfileView } from './components/ProfileView';
import { CoachChat } from './components/CoachChat';

import { 
  Leaf, Award, Compass, RefreshCw, Flame, 
  Trophy, User, Sparkles, Footprints, Star
} from 'lucide-react';

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

  type Tab = 'dashboard' | 'score' | 'coach' | 'quests' | 'rewards' | 'profile';
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  interface Particle {
    id: number;
    color: string;
    left: string;
    delay: string;
  }
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
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setAuthError(err?.message || 'Google Auth cancelled.');
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
    } catch (err: any) {
      console.error('Log out failed:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogRecommendationAccomplished = async (rec: any, status: 'completed' | 'dismissed') => {
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
      
      {/* 1. Confetti celebrations layer */}
      <AnimatePresence>
        {particles.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((par) => (
              <motion.div
                key={par.id}
                className={`absolute w-2 h-2 rounded-full ${par.color}`}
                style={{ left: par.left }}
                initial={{ y: -20, rotate: 0, opacity: 1 }}
                animate={{ y: window.innerHeight + 50, rotate: 360, opacity: [1, 1, 0] }}
                transition={{ duration: 2.5, ease: 'easeOut', delay: parseFloat(par.delay) }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Decorative ambient blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 2. Unified Master Navigation Header */}
      {currentUser && lifestyleData && !forceQ && splashEnded && (
        <header className="w-full bg-white/90 backdrop-blur border-b border-slate-100 sticky top-0 z-40 px-4 py-3 sm:py-3.5 select-none shadow-sm">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-slate-900 font-fancy leading-none">
                  EcoMind AI
                </span>
                <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase mt-0.5">Companion</span>
              </div>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0" id="master-header-nav">
              {[
                { id: 'dashboard', icon: Compass, label: 'Coach' },
                { id: 'score', icon: Footprints, label: 'Score' },
                { id: 'quests', icon: Flame, label: 'Quests' },
                { id: 'rewards', icon: Trophy, label: 'Rewards' },
                { id: 'coach', icon: Sparkles, label: 'Consult' },
                { id: 'profile', icon: User, label: 'Profile' }
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`h-8 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick XP Summary widgets */}
            <div className="hidden sm:flex items-center gap-1.5" id="header-counters-row">
              <div className="bg-amber-50 border border-amber-100 text-amber-600 px-3 py-1 rounded-full flex items-center font-bold text-xs">
                <Flame className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
                <span>{userProfile?.streakCount || 0}d streak</span>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 text-yellow-600 px-3 py-1 rounded-full flex items-center font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-yellow-500 mr-0.5" />
                <span>{xp} XP</span>
              </div>
            </div>

          </div>
        </header>
      )}

      {/* 3. Central responsive viewport container */}
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
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calibrate your daily transport, meals, and utilities to establish your baseline carbon score.
                </p>
              </div>
              <OnboardingQuestionnaire
                initialData={lifestyleData}
                onSave={async (data) => {
                  await saveLifestyleHabits(data);
                  setForceQ(false);
                  triggerConfetti();
                }}
                isLoading={isGenerating}
              />
            </motion.div>
            
          ) : (
            
            /* ACTIVE VIEWPORT */
            <motion.div
              key="active-tab-container"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="min-h-[400px]"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  userProfile={userProfile}
                  lifestyleData={lifestyleData}
                  recommendations={recommendations}
                  impactLogs={impactLogs}
                  chatMessages={chatMessages}
                  isChatLoading={isChatLoading}
                  isGenerating={isGenerating}
                  isGuestMode={isGuestMode}
                  onUpdateStatus={handleLogRecommendationAccomplished}
                  onDismissLog={dismissImpactLog}
                  onSendCoachMessage={sendCoachMessage}
                  onRecalibrate={() => setForceQ(true)}
                  onLogout={handleLogout}
                />
              )}

              {activeTab === 'score' && (
                <CarbonScoreView
                  lifestyleData={lifestyleData}
                  onRecalibrate={() => setForceQ(true)}
                />
              )}

              {activeTab === 'coach' && (
                <div className="max-w-2xl mx-auto">
                  <CoachChat
                    chatMessages={chatMessages}
                    isChatLoading={isChatLoading}
                    onSendMessage={sendCoachMessage}
                  />
                </div>
              )}

              {activeTab === 'quests' && (
                <div className="max-w-2xl mx-auto">
                  <ChallengesView
                    streakCount={userProfile?.streakCount || 0}
                    completedChallengeIds={userProfile?.completedChallengeIds || []}
                    onAddXp={(amount, co2Saved, chId) => {
                      addXpAndChallengeProgress(amount, co2Saved, chId);
                      triggerConfetti();
                    }}
                  />
                </div>
              )}

              {activeTab === 'rewards' && (
                <div className="max-w-2xl mx-auto">
                  <RewardsView
                    xp={xp}
                    totalCo2Saved={userProfile?.totalCo2SavedKg || 0}
                    userBadges={userProfile?.badges || []}
                    onDeductXpForTree={async () => {
                      await deductXpForTree();
                      triggerConfetti();
                    }}
                  />
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="max-w-2xl mx-auto">
                  <ProfileView
                    userProfile={userProfile}
                    lifestyleData={lifestyleData}
                    xp={xp}
                    onRecalibrate={() => setForceQ(true)}
                    onLogout={handleLogout}
                    onResetWeeklyGoal={resetWeeklyProgress}
                  />
                </div>
              )}
            </motion.div>
            
          )}
        </AnimatePresence>
      </main>

      {/* 4. Elegant Mobile Navigation bar (Shown ONLY on small views as fallback) */}
      {currentUser && lifestyleData && !forceQ && splashEnded && (
        <nav className="sm:hidden w-full bg-white border-t border-slate-150 sticky bottom-0 z-40 px-2 py-2 flex items-center justify-around shadow-lg">
          {[
            { id: 'dashboard', icon: Compass, label: 'Coach' },
            { id: 'score', icon: Footprints, label: 'Score' },
            { id: 'quests', icon: Flame, label: 'Quests' },
            { id: 'rewards', icon: Trophy, label: 'Rewards' },
            { id: 'coach', icon: Sparkles, label: 'Consult' },
            { id: 'profile', icon: User, label: 'Profile' }
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex flex-col items-center justify-center p-1.5 cursor-pointer transition-all ${
                  isActive ? 'text-emerald-600 scale-105' : 'text-slate-400 hover:text-slate-700'
                }`}
                style={{ width: '54px' }}
              >
                <IconComp className="w-4.5 h-4.5" />
                <span className="text-[8px] font-bold mt-1 uppercase truncate w-full text-center">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Humble aesthetic project credit watermark */}
      <footer className="w-full text-center py-4 text-[10px] text-slate-400 mt-auto select-none pointer-events-none">
        EcoMind AI Carbon Decision Companion &bull; Powered by Gemini
      </footer>

    </div>
  );
}
