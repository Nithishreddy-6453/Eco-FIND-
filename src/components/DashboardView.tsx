import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, AlertCircle, Sparkles, MessageSquare, ChevronRight, ArrowUpRight
} from 'lucide-react';
import { UserProfile, LifestyleData, Recommendation, ImpactLog, CoachChatMessage } from '../types';
import { calculateLifestyleEmissions } from '../constants';
import { CoachChat } from './CoachChat';
import { getLevelInfo } from '../utils/engagement';

// Subcomponents
import { DashboardHeader } from './dashboard/DashboardHeader';
import { CarbonScoreCard } from './dashboard/CarbonScoreCard';
import { WeeklyProgressChart } from './dashboard/WeeklyProgressChart';
import { MissionsList } from './dashboard/MissionsList';
import { LedgerHistory } from './dashboard/LedgerHistory';
import { HeroRecommendation } from './dashboard/HeroRecommendation';
import { RewardsRankCard } from './dashboard/RewardsRankCard';

interface DashboardViewProps {
  userProfile: UserProfile | null;
  lifestyleData: LifestyleData | null;
  recommendations: Recommendation[];
  impactLogs: ImpactLog[];
  chatMessages: CoachChatMessage[];
  isChatLoading: boolean;
  isGenerating: boolean;
  isGuestMode: boolean;
  onUpdateStatus: (rec: Recommendation, status: 'completed' | 'dismissed') => Promise<void>;
  onDismissLog: (logId: string, loggedCo2: number) => Promise<void>;
  onSendCoachMessage: (text: string) => Promise<void>;
  onRecalibrate: () => void;
  onLogout: () => Promise<void>;
}

export function DashboardView({
  userProfile,
  lifestyleData,
  recommendations,
  impactLogs,
  chatMessages,
  isChatLoading,
  isGenerating,
  onUpdateStatus,
  onDismissLog,
  onSendCoachMessage,
  onRecalibrate,
  onLogout
}: DashboardViewProps) {
  
  const [activeTab, setActiveTab] = useState<'recommendations' | 'chat'>('recommendations');
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);

  const activeRecommendations = recommendations.filter(r => r.status === 'active');
  const principalRec = activeRecommendations.find(r => r.id === selectedRecId) || activeRecommendations[0];
  const baselineEmissions = React.useMemo(() => {
    return lifestyleData ? calculateLifestyleEmissions(lifestyleData) : null;
  }, [lifestyleData]);

  const xp = userProfile?.xp ?? 0;
  const lvlInfo = getLevelInfo(xp);

  return (
    <div id="dashboard-ambient-container" className="space-y-6 pb-12 text-slate-800">
      
      <DashboardHeader 
        displayName={userProfile?.displayName || 'Eco Guardian'}
        levelName={userProfile?.levelName || null}
        onRecalibrate={onRecalibrate}
        onLogout={onLogout}
      />

      {/* Segmented view switcher */}
      <div className="flex gap-2 bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm" id="dashboard-segmented-tabs">
        <button
          onClick={() => setActiveTab('recommendations')}
          aria-label="List actionable recommendations"
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
            activeTab === 'recommendations' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          aria-label="Consult the AI Decision Coach"
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
            activeTab === 'chat' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Consult AI Coach</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'recommendations' ? (
          <motion.div
            key="tab-recs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Left Columns: Hero Recommendation Card */}
            <div className="md:col-span-8 space-y-6">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Top Insight
                </span>
                <span className="text-emerald-600 font-mono">Bespoke Saving Recommendation</span>
              </div>

              {isGenerating ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center space-y-3 shadow-sm">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Recalculating emission trade-offs...</p>
                </div>
              ) : principalRec ? (
                <HeroRecommendation principalRec={principalRec} onUpdateStatus={onUpdateStatus} />
              ) : (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-3 shadow-sm">
                  <AlertCircle className="w-7 h-7 text-slate-350 mx-auto" />
                  <p className="text-xs text-slate-500">All recommendations cleared! Setup new metrics to recalibrate.</p>
                  <button onClick={onRecalibrate} className="h-9 px-4 bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer">
                    Recalibrate Habits
                  </button>
                </div>
              )}

              {/* Alternative high-impact levers queue */}
              {activeRecommendations.filter(r => r.id !== principalRec?.id).length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block px-1">Other Levers</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeRecommendations.filter(r => r.id !== principalRec?.id).slice(0, 2).map((rec) => (
                      <button
                        key={rec.id} onClick={() => setSelectedRecId(rec.id)}
                        className="w-full text-left bg-white hover:bg-slate-50 border border-slate-105 rounded-2xl p-4 transition-all flex justify-between items-center group cursor-pointer"
                      >
                        <div className="space-y-1 pr-4">
                          <span className="text-[8px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase">
                            {rec.category}
                          </span>
                          <p className="text-xs font-bold text-slate-850 group-hover:text-emerald-500 transition-colors line-clamp-1">
                            {rec.title}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-350 shrink-0 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Columns: Baseline metrics, Progress, and missions */}
            <div className="md:col-span-4 space-y-6">
              <CarbonScoreCard baselineEmissions={baselineEmissions} />

              <WeeklyProgressChart 
                weeklyProgressCo2={userProfile?.weeklyProgressCo2 ?? null} 
                weeklyGoalCo2={userProfile?.weeklyGoalCo2 ?? null} 
              />

              {/* Rewards Level Progress */}
              <RewardsRankCard lvlInfo={lvlInfo} xp={xp} />

              <MissionsList />

              {/* AI Coach Quick CTA */}
              <button
                onClick={() => setActiveTab('chat')} aria-label="Direct message sustainability coach conversation"
                className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between text-left transition-all cursor-pointer shadow-sm group font-fancy"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>Talk to Coach</span>
                  </p>
                  <p className="text-[10px] text-emerald-600 leading-snug">Get customized advice based on statistics.</p>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tab-chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto"
          >
            <CoachChat chatMessages={chatMessages} isChatLoading={isChatLoading} onSendMessage={onSendCoachMessage} />
          </motion.div>
        )}
      </AnimatePresence>

      <LedgerHistory impactLogs={impactLogs} onDismissLog={onDismissLog} />

    </div>
  );
}
