import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Star, Trophy, CheckCircle, Clock, ChevronRight, Sparkles, Smile, ShieldCheck } from 'lucide-react';
import { CHALLENGES_CATALOG, ChallengeCatalogItem as Challenge } from '../constants';

interface ChallengesViewProps {
  streakCount: number;
  completedChallengeIds: string[];
  onAddXp: (amount: number, co2Saved: number, challengeId?: string) => void;
}

export function ChallengesView({ streakCount, completedChallengeIds, onAddXp }: ChallengesViewProps) {
  const [showCelebration, setShowCelebration] = useState<string | null>(null);
  const challenges = CHALLENGES_CATALOG;

  // Map completion state from database
  const mappedChallenges = challenges.map(ch => ({
    ...ch,
    completed: completedChallengeIds.includes(ch.id) || ch.completed,
    progress: completedChallengeIds.includes(ch.id) ? ch.target : ch.progress
  }));

  const handleComplete = (id: string, xp: number, co2: number) => {
    const matched = challenges.find(ch => ch.id === id);
    if (matched) {
      setShowCelebration(`${matched.title} cleared! (+${xp} XP!)`);
    }
    onAddXp(xp, co2, id);
    setTimeout(() => setShowCelebration(null), 2500);
  };

  const completedCount = mappedChallenges.filter(c => c.completed).length;
  const totalCount = mappedChallenges.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6 pb-6 select-none text-slate-800" id="challenges-view">
      
      {/* Top Progress Rings Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5 flex-1">
          <p className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase">Ratio Completed</p>
          <h3 className="text-lg font-fancy font-bold text-slate-900">
            {completedCount === totalCount ? "All Quests Cleared! 🌟" : "Today's Missions"}
          </h3>
          <p className="text-xs text-slate-400">
            Grow your streak with customized daily targets.
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded font-mono text-slate-550 border border-slate-100">
              {completedCount} / {totalCount} Completed
            </span>
            <span className="text-xs text-amber-500 flex items-center font-bold">
              <Flame className="w-4 h-4 fill-amber-500 mr-0.5" />
              {streakCount}d Streak
            </span>
          </div>
        </div>

        {/* Mini Active Ring */}
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="#f1f5f9"
              strokeWidth="5"
              fill="transparent"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="26"
              stroke="#10b981"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={163}
              initial={{ strokeDashoffset: 163 }}
              animate={{ strokeDashoffset: 163 - (163 * (completedCount / totalCount)) }}
              transition={{ duration: 1 }}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-emerald-600 font-mono">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Interactive Celebration toast */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase">QUEST COMPLETED</p>
              <p className="text-[11px] text-slate-600">{showCelebration}</p>
            </div>
            <div className="ml-auto text-yellow-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest Speech Bubble */}
      <div className="bg-white border border-slate-100 p-4 rounded-3xl flex items-start gap-3 shadow-sm">
        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center shrink-0">
          <Smile className="w-5 h-5" />
        </div>
        <div className="relative bg-slate-50 border border-slate-100/60 rounded-2xl p-3 text-xs text-slate-500 leading-normal">
          <span className="text-teal-600 font-bold block mb-0.5 text-[10px]">Eco Companion:</span>
          "Completing active daily quests logs genuine emission offsets. Aim for a 5-day streak!"
        </div>
      </div>

      {/* Challenges List */}
      <div className="space-y-3">
        <label className="text-xs text-slate-400 uppercase tracking-widest font-black block">Active Quests</label>

        <div className="space-y-2.5" id="quests-interactive-stack">
          {mappedChallenges.map((ch) => (
            <div
              key={ch.id}
              className={`bg-white border text-left p-4 rounded-2xl transition-all relative overflow-hidden ${
                ch.completed 
                  ? 'border-emerald-100 bg-emerald-50/10 opacity-70' 
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-1.5 items-center">
                  <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    ch.category === 'Transport' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    ch.category === 'Diet' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    ch.category === 'Energy' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-purple-50 text-purple-600 border border-purple-100'
                  }`}>
                    {ch.category}
                  </span>
                  <span className="text-[8px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded border border-slate-100 flex items-center">
                    <Clock className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                    {ch.duration}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-500" />
                    +{ch.xpReward} XP
                  </span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full font-bold font-mono">
                    -{ch.co2SavedKg}kg CO₂
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  {ch.title}
                  {ch.completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal pr-4">{ch.description}</p>
              </div>

              {/* Interactive bottom segment */}
              <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between gap-4">
                <div className="flex-1">
                  {ch.duration === 'Weekly' && !ch.completed ? (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-slate-400">
                        <span>Weekly progress:</span>
                        <span>{ch.progress} / {ch.target}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all" 
                          style={{ width: `${(ch.progress / ch.target) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-400 italic block">
                      {ch.completed ? 'Claimed' : 'Quick task'}
                    </span>
                  )}
                </div>

                {/* Confirm CTA */}
                {!ch.completed ? (
                  <button
                    onClick={() => handleComplete(ch.id, ch.xpReward, ch.co2SavedKg)}
                    className="h-7 px-3 bg-slate-900 hover:bg-emerald-500 text-white hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer"
                  >
                    <span>Check</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </button>
                ) : (
                  <span className="text-[9px] text-emerald-600 font-bold flex items-center uppercase bg-emerald-50 px-2 py-1 rounded-lg">
                    <ShieldCheck className="w-3 h-3 mr-0.5" />
                    Quest Complete
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
