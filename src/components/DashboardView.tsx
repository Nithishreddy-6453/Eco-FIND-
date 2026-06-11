import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, Leaf, RotateCcw, Power, CheckCircle, 
  Trash2, Award, Compass, TrendingUp, AlertCircle, 
  ChevronRight, Check, Sparkles, Footprints, MessageSquare, Star, ArrowUpRight
} from 'lucide-react';
import { UserProfile, LifestyleData, Recommendation, ImpactLog, CoachChatMessage } from '../types';
import { calculateLifestyleEmissions } from '../constants';
import { CoachChat } from './CoachChat';
import { getLevelInfo } from '../utils/engagement';

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
  isGuestMode,
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

  // Level progression metrics
  const xp = userProfile?.xp ?? 0;
  const lvlInfo = getLevelInfo(xp);

  // Hardcode 3 compact challenges for dashboard list
  const dashChallenges = [
    { title: 'Pedal Over Petrol', reward: '40 XP', co2: '-5kg', cat: 'Transport' },
    { title: 'Meatless Maverick', reward: '50 XP', co2: '-8kg', cat: 'Diet' },
    { title: 'Degree Detective', reward: '30 XP', co2: '-3kg', cat: 'Energy' }
  ];

  return (
    <div id="dashboard-ambient-container" className="space-y-6 pb-12 text-slate-800">
      
      {/* Header controls (Fast profile and controls) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm" id="dashboard-header-lockup">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Leaf className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Hi, {userProfile?.displayName || 'Eco Guardian'}
              {userProfile?.levelName && (
                <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  {userProfile.levelName}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">AI Coach Ready</p>
          </div>
        </div>

        {/* Header interactive controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onRecalibrate}
            title="Recalibrate"
            aria-label="Recalibrate carbon footprint baseline values"
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-slate-500 hover:text-slate-850 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onLogout}
            title="Sign Out"
            aria-label="Logout user session"
            className="p-2 bg-slate-50 hover:bg-red-50 hover:text-red-500 border border-slate-200/60 rounded-xl text-slate-500 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segmented view switcher */}
      <div className="flex gap-2 bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm" id="dashboard-segmented-tabs">
        <button
          onClick={() => setActiveTab('recommendations')}
          aria-label="List actionable recommendations"
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
            activeTab === 'recommendations'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          aria-label="Consult the AI Decision Coach"
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
            activeTab === 'chat'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Consult AI Coach</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'recommendations' ? (
          <motion.div
            key="tab-recs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* 1. Hero Card: Top Insight (Spans 8 columns on large, otherwise 12) */}
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
                <motion.div 
                  key={principalRec.id}
                  className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden"
                  id="coach-principal-card"
                >
                  <div className="absolute top-6 right-6 flex gap-1.5">
                    <span className="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      {principalRec.category}
                    </span>
                  </div>

                  <div className="space-y-2 pr-12">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                      {principalRec.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                      {principalRec.description}
                    </p>
                  </div>

                  {/* Decision Engine Explainability Breakdown */}
                  <div className="mt-5 bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-4" id="coach-decision-engine">
                    <div>
                      <p className="text-[9px] text-emerald-700 font-extrabold tracking-widest uppercase">Intelligent Decision Log</p>
                      <h4 className="text-xs font-bold text-slate-800 mt-0.5">Multi-Stage Reasoning Explainability</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-0.5 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Estimated Impact</p>
                        <p className="text-sm font-extrabold text-slate-800 font-mono">
                          {principalRec.co2SavedKgPerYear.toLocaleString()} kg CO₂/yr
                        </p>
                        <p className="text-[9px] text-emerald-600 font-semibold font-mono">
                          ≈ {Math.round(principalRec.co2SavedKgPerYear / 12)} kg/mo
                        </p>
                      </div>

                      <div className="space-y-0.5 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs col-span-2">
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Comparison Metrics</p>
                        <p className="text-[10px] text-slate-650 font-semibold leading-relaxed">
                          Saves <span className="text-emerald-600 font-bold font-mono">{(principalRec.comparisonMetric?.primaryCo2Saved || principalRec.co2SavedKgPerYear).toLocaleString()} kg/yr</span> vs. only <span className="text-slate-500 font-bold font-mono">{(principalRec.comparisonMetric?.secondaryCo2Saved || 80)} kg/yr</span> with secondary alternatives like basic household sorting.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {principalRec.whySelected && (
                        <div className="bg-white/85 border border-slate-100 rounded-xl p-3 shadow-2xs">
                          <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Why This Action Is Recommended</p>
                          <p className="text-slate-700 leading-relaxed font-semibold">
                            {principalRec.whySelected}
                          </p>
                        </div>
                      )}

                      {principalRec.whyRejected && (
                        <div className="bg-white/85 border border-slate-100 rounded-xl p-3 shadow-2xs">
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Comparative Superiority Analysis</p>
                          <p className="text-slate-650 leading-relaxed font-semibold">
                            {principalRec.whyRejected}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions list */}
                  <div className="mt-5 space-y-2.5">
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Coach Action steps:</h4>
                    <div className="space-y-1.5" id="coach-action-checklist">
                      {principalRec.actionItems?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 text-xs bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/60">
                          <span className="w-4.5 h-4.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg flex items-center justify-center font-mono shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-slate-600 font-medium leading-normal format-line-item">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions log checkout bar */}
                  <div className="mt-6 flex items-center gap-2 pt-5 border-t border-slate-100">
                    <button
                      onClick={() => onUpdateStatus(principalRec, 'completed')}
                      className="flex-1 h-11 bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-xs tracking-wide shadow-sm hover:bg-emerald-650 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Log Done (+{principalRec.co2SavedKgPerYear}kg CO₂)</span>
                    </button>
                    <button
                      onClick={() => onUpdateStatus(principalRec, 'dismissed')}
                      className="h-11 px-3.5 bg-slate-50 hover:bg-red-50 hover:text-red-500 border border-slate-150 rounded-xl text-[11px] text-slate-500 transition-all font-bold cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-3 shadow-sm">
                  <AlertCircle className="w-7 h-7 text-slate-350 mx-auto" />
                  <p className="text-xs text-slate-500">All recommendations cleared! Setup new metrics to recalibrate.</p>
                  <button 
                    onClick={onRecalibrate}
                    className="h-9 px-4 bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Recalibrate Habits
                  </button>
                </div>
              )}

              {/* 1.5 Alternative high-impact levers queue cards */}
              {activeRecommendations.filter(r => r.id !== principalRec?.id).length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block px-1">Other Levers</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeRecommendations.filter(r => r.id !== principalRec?.id).slice(0, 2).map((rec) => (
                      <button
                        key={rec.id}
                        onClick={() => setSelectedRecId(rec.id)}
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

            {/* 2. Right Columns: Carbon Score Card, Progress, Challenges, Rewards (Spans 4 columns on large) */}
            <div className="md:col-span-4 space-y-6">
              
              {/* Carbon Score Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3" id="baseline-footprint-panel">
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase block font-fancy">Carbon Score Card</span>
                  <span className="text-[8px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold font-mono">1 Yr Est</span>
                </div>

                {baselineEmissions ? (
                  <div className="space-y-3">
                    <div className="text-center py-2">
                      <span className="text-2xl font-bold text-slate-900 font-fancy">{baselineEmissions.total.toLocaleString()}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block tracking-wider mt-0.5">KG CO₂ / YR</span>
                    </div>

                    {/* Impact Breakdown */}
                    <div className="space-y-2 border-t border-slate-50 pt-3">
                      {[
                        { label: 'Transport', val: baselineEmissions.transport + baselineEmissions.flights, pct: Math.min(100, Math.round(((baselineEmissions.transport + baselineEmissions.flights) / baselineEmissions.total) * 100)), bg: 'bg-blue-400' },
                        { label: 'Food', val: baselineEmissions.diet + baselineEmissions.foodWaste, pct: Math.min(100, Math.round(((baselineEmissions.diet + baselineEmissions.foodWaste) / baselineEmissions.total) * 100)), bg: 'bg-emerald-400' },
                        { label: 'Energy', val: baselineEmissions.electricity + baselineEmissions.heating, pct: Math.min(100, Math.round(((baselineEmissions.electricity + baselineEmissions.heating) / baselineEmissions.total) * 100)), bg: 'bg-amber-400' },
                        { label: 'Shopping', val: baselineEmissions.consumption, pct: Math.min(100, Math.round((baselineEmissions.consumption / baselineEmissions.total) * 100)), bg: 'bg-purple-400' }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-550">
                            <span className="font-medium">{item.label}</span>
                            <span className="font-mono font-bold">{item.pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                            <div className={`h-full ${item.bg}`} style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No parameters calculated.</p>
                )}
              </div>

              {/* Weekly Progress with horizontal mini chart representation */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
                <span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase block font-fancy">Weekly Progress Chart</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>This week's saved co₂:</span>
                    <span className="text-emerald-600 font-mono">{Math.round(userProfile?.weeklyProgressCo2 ?? 0)} kg / {userProfile?.weeklyGoalCo2 ?? 50} kg</span>
                  </div>

                  {/* Small Bar columns chart */}
                  <div className="h-12 flex items-end justify-between px-2 pt-1 gap-2 border-b border-rose-50" id="weekly-mini-bars-chart">
                    {[
                      { day: 'M', value: 8, fill: 'bg-emerald-300' },
                      { day: 'T', value: 12, fill: 'bg-emerald-300' },
                      { day: 'W', value: 3, fill: 'bg-emerald-300' },
                      { day: 'T', value: 15, fill: 'bg-emerald-400' },
                      { day: 'F', value: 7, fill: 'bg-emerald-400' },
                      { day: 'S', value: 18, fill: 'bg-emerald-500 shadow-sm' },
                      { day: 'S', value: Math.max(2, Math.round(userProfile?.weeklyProgressCo2 ?? 4) % 15), fill: 'bg-emerald-500 animate-pulse' }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className={`w-full rounded-t-sm ${bar.fill}`} 
                          style={{ height: `${Math.max(10, Math.min(100, (bar.value / 20) * 100))}%`, minHeight: '6px' }} 
                        />
                        <span className="text-[8px] text-slate-400 font-mono font-bold">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rewards Level Progress */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
                <span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase block font-fancy">Rewards Rank</span>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{lvlInfo.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Level {lvlInfo.levelNum} &bull; {xp} XP</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100">
                    <Star className="w-4 h-4 fill-yellow-500" />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${lvlInfo.progressPercent}%` }} />
                </div>
              </div>

              {/* Challenges 3 compact cards */}
              <div className="space-y-2">
                <span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase block px-1">Today's Missions</span>
                <div className="space-y-2">
                  {dashChallenges.map((ch, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-3 flex justify-between items-center shadow-inner">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{ch.title}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{ch.cat}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-emerald-600 font-bold block">{ch.co2}</span>
                        <span className="text-[8px] bg-slate-50 text-slate-500 px-1 py-0.5 rounded border border-slate-100">{ch.reward}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Coach Entry Point (Helpful card redirection CTA) */}
              <button
                onClick={() => setActiveTab('chat')}
                aria-label="Direct message sustainability coach conversation"
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
            key="tab-chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto"
          >
            <CoachChat
              chatMessages={chatMessages}
              isChatLoading={isChatLoading}
              onSendMessage={onSendCoachMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accomplished ledger table with lighter visual tones */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm" id="impact-logs-ledger">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-3">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Ledger History</span>
        </h4>

        {impactLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2.5 px-2">Recommendation</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2 text-right">Saving Equivalent</th>
                  <th className="py-2.5 px-2 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50" id="impact-records-body">
                {impactLogs.map((log) => (
                  <tr key={log.id} className="text-slate-700 font-medium">
                    <td className="py-2.5 px-2 font-bold text-slate-800">
                      {log.recommendationTitle}
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 border border-slate-100 rounded-full font-bold uppercase">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right text-emerald-600 font-bold font-mono">
                      -{log.co2SavedKg} kg
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <button
                        onClick={() => onDismissLog(log.id, log.co2SavedKg)}
                        className="p-1 px-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded transition-all cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-[11px]">Your offset ledger is currently empty. Clear a recommendation top incentive to map saves.</p>
          </div>
        )}
      </div>

    </div>
  );
}
