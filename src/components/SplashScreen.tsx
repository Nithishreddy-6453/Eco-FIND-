import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Flame, Sparkles, Trophy, Heart } from 'lucide-react';

interface SplashScreenProps {
  onContinue: () => void;
}

export function SplashScreen({ onContinue }: SplashScreenProps) {
  return (
    <div className="flex flex-col items-center justify-between min-h-[600px] p-8 text-slate-800 bg-white/80 backdrop-blur rounded-3xl premium-shadow border border-slate-100 select-none relative overflow-hidden">
      
      {/* Background soft ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-4b h-48 bg-teal-50/30 rounded-full blur-2xl pointer-events-none" />
      
      {/* Top Header Row */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-550 font-mono tracking-widest uppercase">System Online</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
          <Flame className="w-3.5 h-3.5 fill-amber-500" />
          <span className="tracking-wide text-[11px]">STREAK ACTIVE</span>
        </div>
      </div>

      {/* Center Core Logo Stage */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 my-auto z-10">
        {/* Sleek Minimalist Ring Concept */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          
          <svg className="w-full h-full transform -rotate-90 absolute">
            {/* Outer CO2 Saving Ring */}
            <circle
              cx="64"
              cy="64"
              r="52"
              stroke="#f1f5f9"
              strokeWidth="7"
              fill="transparent"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="52"
              stroke="#10b981"
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={326}
              initial={{ strokeDashoffset: 326 }}
              animate={{ strokeDashoffset: 90 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>

          {/* Core App Icon */}
          <motion.div 
            initial={{ scale: 0.9, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 z-10 relative"
          >
            <Leaf className="w-8 h-8" />
          </motion.div>
        </div>

        {/* Title and descriptions */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-fancy">
            EcoMind <span className="text-emerald-500">Coach</span>
          </h1>
          <p className="text-sm text-slate-500 max-w-sm px-6 leading-relaxed">
            Beautiful gamified carbon choices guided by AI. Save offsets, live cleaner, and build atomic eco habits.
          </p>
        </div>

        {/* Metrics Features (Apple Health inspired) */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs pt-2">
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center">
            <Trophy className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-600 mt-1">XP Track</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center">
            <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            <span className="text-[10px] font-bold text-slate-600 mt-1">Health</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-600 mt-1">AI Coach</span>
          </div>
        </div>
      </div>

      {/* Launch Action Footer */}
      <div className="w-full pt-4 z-10">
        <button
          onClick={onContinue}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm tracking-wide transition-all duration-150 flex items-center justify-center gap-2 select-none cursor-pointer"
          style={{ borderRadius: '16px' }}
        >
          <span>Get Started</span>
          <span className="text-lg font-normal">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
