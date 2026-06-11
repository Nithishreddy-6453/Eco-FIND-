import React from 'react';
import { 
  Compass, Footprints, Flame, Trophy, Sparkles, User as UserIcon
} from 'lucide-react';
import { User } from 'firebase/auth';
import { LifestyleData } from '../../types';

type Tab = 'dashboard' | 'score' | 'coach' | 'quests' | 'rewards' | 'profile';

interface MobileNavBarProps {
  currentUser: User | null;
  lifestyleData: LifestyleData | null;
  forceQ: boolean;
  splashEnded: boolean;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function MobileNavBar({
  currentUser,
  lifestyleData,
  forceQ,
  splashEnded,
  activeTab,
  setActiveTab,
}: MobileNavBarProps) {
  if (!currentUser || !lifestyleData || forceQ || !splashEnded) return null;

  return (
    <nav className="sm:hidden w-full bg-white border-t border-slate-150 sticky bottom-0 z-40 px-2 py-2 flex items-center justify-around shadow-lg">
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
  );
}
