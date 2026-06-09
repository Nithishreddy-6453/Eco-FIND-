import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Star, Award, RotateCcw, Power, TreePine, Sparkles } from 'lucide-react';
import { UserProfile, LifestyleData } from '../types';

interface ProfileViewProps {
  userProfile: UserProfile | null;
  lifestyleData: LifestyleData | null;
  xp: number;
  onRecalibrate: () => void;
  onLogout: () => Promise<void>;
  onResetWeeklyGoal?: (newGoal: number) => Promise<void>;
}

interface Avatar {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

export function ProfileView({ userProfile, lifestyleData, xp, onRecalibrate, onLogout, onResetWeeklyGoal }: ProfileViewProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(() => {
    return localStorage.getItem('ecomind_profile_avatar') || 'panda';
  });

  const avatars: Avatar[] = [
    { id: 'panda', name: 'Solar Panda', emoji: '🐼', desc: 'Enjoys solar energy grids.' },
    { id: 'fox', name: 'Wind Fox', emoji: '🦊', desc: 'Inspired by thermal currents.' },
    { id: 'penguin', name: 'Ice Penguin', emoji: '🐧', desc: 'Protects fragile ice blocks.' },
    { id: 'koala', name: 'Leafy Koala', emoji: '🐨', desc: 'Loves fresh organic diets.' }
  ];

  const handleSelectAvatar = (id: string) => {
    setSelectedAvatar(id);
    localStorage.setItem('ecomind_profile_avatar', id);
  };

  const activeAvatarObj = avatars.find(a => a.id === selectedAvatar) || avatars[0];
  const totalTrees = Number(localStorage.getItem('ecomind_virtual_trees') || '1');
  const level = Math.floor(xp / 100) + 1;

  return (
    <div className="space-y-6 pb-6 select-none text-slate-800" id="profile-view">
      
      {/* 1. Header Hero Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 text-center relative overflow-hidden shadow-sm">
        <div className="absolute top-3 left-3 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-mono text-emerald-600 font-bold">
          LEVEL {level}
        </div>

        {/* Emojis with floating transition */}
        <div className="relative w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto my-3 text-4xl shadow-inner">
          <motion.span 
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            {activeAvatarObj.emoji}
          </motion.span>
          <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-5.5 h-5.5 rounded-full flex items-center justify-center text-white scale-90">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900">{userProfile?.displayName || 'Eco Guardian'}</h3>
        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{activeAvatarObj.name}</p>
        <p className="text-xs text-slate-400 mt-1 italic">"{activeAvatarObj.desc}"</p>
      </div>

      {/* 2. Weekly target check */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Weekly Saver Target</span>
            <span className="text-xs text-slate-400">Claim +150 XP on completion.</span>
          </div>
          <span className="text-xs bg-slate-50 font-mono text-emerald-650 border border-slate-100 px-2.5 py-1 rounded-lg font-bold">
            Target: {userProfile?.weeklyGoalCo2 ?? 50} kg
          </span>
        </div>

        {/* Weekly Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 font-semibold">
            <span>Weekly Savings Progress:</span>
            <span className="text-emerald-600 font-mono">
              {Math.round(userProfile?.weeklyProgressCo2 ?? 0)} / {userProfile?.weeklyGoalCo2 ?? 50} kg
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
            <motion.div 
              className="h-full bg-emerald-500" 
              style={{ width: `${Math.min(100, Math.round(((userProfile?.weeklyProgressCo2 ?? 0) / (userProfile?.weeklyGoalCo2 ?? 50)) * 100))}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.round(((userProfile?.weeklyProgressCo2 ?? 0) / (userProfile?.weeklyGoalCo2 ?? 50)) * 100))}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            {(userProfile?.weeklyProgressCo2 ?? 0) >= (userProfile?.weeklyGoalCo2 ?? 50) 
              ? 'Goal Met! +150 XP logged.' 
              : `${Math.max(0, Math.round((userProfile?.weeklyGoalCo2 ?? 50) - (userProfile?.weeklyProgressCo2 ?? 0)))} kg offsets required.`}
          </p>
        </div>

        {/* Change Weekly Goal Buttons */}
        {onResetWeeklyGoal && (
          <div className="pt-3 border-t border-slate-50 flex flex-col space-y-2">
            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Configure goal weight:</span>
            <div className="flex items-center gap-1.5">
              {[30, 50, 80].map((goal) => (
                <button
                  key={goal}
                  onClick={() => onResetWeeklyGoal(goal)}
                  className={`flex-1 h-9 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    (userProfile?.weeklyGoalCo2 ?? 50) === goal 
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-600 font-semibold' 
                      : 'bg-white border-slate-150 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {goal === 30 ? 'Mild (30kg)' : goal === 50 ? 'Moderate (50kg)' : 'Hard (80kg)'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Choose Avatar companion */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-3 shadow-sm">
        <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Choose companion
        </h4>

        <div className="grid grid-cols-4 gap-2">
          {avatars.map((av) => (
            <button
              key={av.id}
              onClick={() => handleSelectAvatar(av.id)}
              className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                selectedAvatar === av.id 
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-600 font-semibold' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
              }`}
            >
              <span className="text-2xl">{av.emoji}</span>
              <p className="text-[8px] font-bold mt-1 tracking-tight text-center truncate w-full">{av.name.split(' ')[1]}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Stats Grid */}
      <div className="grid grid-cols-2 gap-3" id="profile-stats-grid">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-amber-500/10" />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase font-mono">My Streak</p>
            <p className="text-sm font-bold text-slate-800 font-mono">{userProfile?.streakCount || 0} Days</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase font-mono font-bold">Total CO₂ saved</p>
            <p className="text-sm font-bold text-emerald-600 font-mono">{userProfile?.totalCo2SavedKg || 0} kg</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 bg-yellow-50 text-yellow-500 rounded-xl flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-yellow-500/10" />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase font-mono">Total Points</p>
            <p className="text-sm font-bold text-slate-800 font-mono">{xp} XP</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 bg-green-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <TreePine className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase font-mono">Trees Grown</p>
            <p className="text-sm font-bold text-slate-800 font-mono">{totalTrees} Trees</p>
          </div>
        </div>
      </div>

      {/* 5. Utility Controls */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-2 shadow-sm">
        <button
          onClick={onRecalibrate}
          className="w-full h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-650 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-emerald-500" />
          <span>Recalibrate Habit baseline</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full h-10 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200/60 text-slate-500 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Power className="w-4 h-4 text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );
}
