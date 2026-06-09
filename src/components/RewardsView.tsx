import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Check, Sparkles, Sprout } from 'lucide-react';
import { getLevelInfo } from '../utils/engagement';

interface Badge {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  color: string;
  borderColor: string;
}

interface RewardsViewProps {
  xp: number;
  totalCo2Saved: number;
  userBadges?: string[];
  onDeductXpForTree: () => void;
}

export function RewardsView({ xp, totalCo2Saved, userBadges = [], onDeductXpForTree }: RewardsViewProps) {
  // Grow virtual tree status
  const [treeCount, setTreeCount] = useState<number>(() => {
    return Number(localStorage.getItem('ecomind_virtual_trees') || '1');
  });
  const [growingWaterStatus, setGrowingWaterStatus] = useState<number>(0);
  const [plantingAnimate, setPlantingAnimate] = useState<boolean>(false);

  // Compute levels dynamically using central gamification bounds
  const lvlInfo = getLevelInfo(xp);
  const level = lvlInfo.levelNum;
  const currentLevelXp = xp - lvlInfo.minXp;
  const xpRequiredForNext = lvlInfo.maxXp - lvlInfo.minXp;
  const progressPercent = lvlInfo.progressPercent;
  const activeRank = lvlInfo.name;

  // Badges grid with reduced text and crisp colors
  const badges: Badge[] = [
    {
      id: 'bdg_streak',
      title: 'Streak King',
      description: 'Logged consecutive carbon offsets for 3+ days.',
      unlocked: userBadges.includes('bdg_streak'),
      color: 'text-amber-600 bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      id: 'bdg_meat',
      title: 'Meatless Maverick',
      description: 'Successfully checked off vegetarian diet targets.',
      unlocked: userBadges.includes('bdg_meat'),
      color: 'text-emerald-600 bg-emerald-50',
      borderColor: 'border-emerald-100'
    },
    {
      id: 'bdg_energy',
      title: 'Watt Saver',
      description: 'Logged residential energy adjustments.',
      unlocked: userBadges.includes('bdg_energy'),
      color: 'text-blue-600 bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      id: 'bdg_coach',
      title: 'Chat Disciple',
      description: 'Consulted the AI Coach to map choices.',
      unlocked: userBadges.includes('bdg_coach'),
      color: 'text-purple-600 bg-purple-50',
      borderColor: 'border-purple-100'
    },
    {
      id: 'bdg_conqueror',
      title: 'Quests Conqueror',
      description: 'Cleared at least 3 active challenge tasks.',
      unlocked: userBadges.includes('bdg_conqueror'),
      color: 'text-rose-600 bg-rose-50',
      borderColor: 'border-rose-100'
    },
    {
      id: 'bdg_guardian',
      title: 'Planet Guardian',
      description: 'Grand champion status with 800+ total XP.',
      unlocked: userBadges.includes('bdg_guardian'),
      color: 'text-cyan-600 bg-cyan-50',
      borderColor: 'border-cyan-100'
    }
  ];

  const handleWaterTree = () => {
    if (growingWaterStatus >= 3) {
      // Deduct 80 XP for a real physical-adjacent plant
      if (xp >= 80) {
        onDeductXpForTree();
        setGrowingWaterStatus(0);
        const newCount = treeCount + 1;
        setTreeCount(newCount);
        localStorage.setItem('ecomind_virtual_trees', String(newCount));
        setPlantingAnimate(true);
        setTimeout(() => setPlantingAnimate(false), 2000);
      }
    } else {
      setGrowingWaterStatus(prev => prev + 1);
    }
  };

  const isDeductible = xp >= 80;

  return (
    <div className="space-y-6 pb-6 text-slate-800 select-none">
      
      {/* 1. Level progress card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 flex-1 w-full">
          <div className="flex justify-between items-baseline">
            <div>
              <p className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase font-fancy">Level {level} Progress</p>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">{activeRank}</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              {xp} total XP
            </span>
          </div>

          <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden relative border border-slate-100 mt-3">
            <motion.div 
              className="h-full bg-emerald-500"
              style={{ width: `${progressPercent}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>{currentLevelXp} / {xpRequiredForNext} XP to Level {level + 1}</span>
            <span>{progressPercent}% Cleared</span>
          </div>
        </div>

        {/* Circular display badge */}
        <div className="relative w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100/60 shrink-0 shadow-inner">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider block">Lvl</span>
            <span className="text-3xl font-black font-fancy leading-none">{level}</span>
          </div>
        </div>
      </div>

      {/* 2. Virtual Tree mini game card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block font-fancy">Virtual Forest Co2 absorbing mini</span>
            <h4 className="text-base font-bold text-slate-900 mt-0.5">Grow Real Bio-Savings</h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-md">
              Water your sprout 4 times, then invest <strong className="text-emerald-600">80 XP</strong> to mature your digital tree.
            </p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100/60 px-3 py-1 rounded-full font-bold font-mono">
            {treeCount} Grown
          </span>
        </div>

        {/* Sprout stages animation box */}
        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden h-36 border border-slate-100">
          <AnimatePresence mode="wait">
            {plantingAnimate ? (
              <motion.div 
                key="plant-celebrate"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-1.5"
              >
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Sprout className="w-6 h-6 animate-bounce" />
                </div>
                <p className="text-xs font-bold text-emerald-600 font-fancy">Sprout successfully matured! 🎉</p>
              </motion.div>
            ) : (
              <motion.div 
                key="sprout-normal"
                className="flex flex-col items-center"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <Sprout className={`transition-all duration-300 ${
                  growingWaterStatus === 0 ? 'w-8 h-8 text-slate-400' :
                  growingWaterStatus === 1 ? 'w-10 h-10 text-emerald-350' :
                  growingWaterStatus === 2 ? 'w-12 h-12 text-emerald-450' : 'w-14 h-14 text-emerald-500'
                }`} />
                <span className="text-[10px] font-mono font-bold text-slate-400 mt-2">
                  Sprout growth: {growingWaterStatus * 25}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Water levels progress ticks absolutely positioned */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div 
                key={idx} 
                className={`w-4 h-1.5 rounded-full transition-all ${
                  idx < growingWaterStatus ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {growingWaterStatus >= 4 ? (
          <button
            onClick={handleWaterTree}
            disabled={!isDeductible}
            className={`w-full h-11 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isDeductible 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Mature Sprout (Costs 80 XP)</span>
          </button>
        ) : (
          <button
            onClick={handleWaterTree}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Water sprout ({4 - growingWaterStatus} drops remaining)</span>
          </button>
        )}
      </div>

      {/* 3. Medal grid lists */}
      <div className="space-y-3">
        <label className="text-xs text-slate-400 uppercase tracking-widest font-black block">Earned Badges Matrix</label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="badges-grid-pane">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`border p-4 rounded-2xl flex items-start gap-3.5 transition-all relative overflow-hidden bg-white ${
                badge.unlocked 
                  ? 'border-emerald-100 shadow-sm' 
                  : 'border-slate-100 opacity-55'
              }`}
            >
              {/* Locked/unlocked shield visual */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                badge.unlocked ? badge.color : 'bg-slate-105 text-slate-400'
              }`}>
                <Award className="w-5 h-5" />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-bold text-slate-900">{badge.title}</h5>
                  {badge.unlocked && (
                    <span className="w-3.5 h-3.5 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
