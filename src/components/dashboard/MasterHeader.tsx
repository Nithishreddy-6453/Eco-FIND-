import React from 'react';
import { 
  Leaf, Compass, Footprints, Flame, Trophy, Sparkles, User as UserIcon, Star 
} from 'lucide-react';
import { User } from 'firebase/auth';
import { UserProfile, LifestyleData } from '../../types';

type Tab = 'dashboard' | 'score' | 'coach' | 'quests' | 'rewards' | 'profile';

interface MasterHeaderProps {
  currentUser: User | null;
  lifestyleData: LifestyleData | null;
  forceQ: boolean;
  splashEnded: boolean;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  userProfile: UserProfile | null;
  xp: number;
}

export function MasterHeader({
  currentUser,
  lifestyleData,
  forceQ,
  splashEnded,
  activeTab,
  setActiveTab,
  userProfile,
  xp,
}: MasterHeaderProps) {
  if (!currentUser || !lifestyleData || forceQ || !splashEnded) return null;

  return (
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
            <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase mt-0.5 font-mono">Companion</span>
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
            { id: 'profile', icon: UserIcon, label: 'Profile' }
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
  );
}
