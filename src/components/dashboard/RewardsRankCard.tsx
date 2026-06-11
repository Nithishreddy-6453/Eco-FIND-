import React from 'react';
import { LevelInfo } from '../../utils/engagement';

interface RewardsRankCardProps {
  lvlInfo: LevelInfo;
  xp: number;
}

export function RewardsRankCard({ lvlInfo, xp }: RewardsRankCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
      <span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase block font-fancy">Rewards Rank</span>
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-xs font-bold text-slate-800">{lvlInfo.name}</h5>
          <p className="text-[10px] text-slate-400 mt-0.5">Level {lvlInfo.levelNum} &bull; {xp} XP</p>
        </div>
      </div>
      <div className="w-full h-1.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: `${lvlInfo.progressPercent}%` }} />
      </div>
    </div>
  );
}
