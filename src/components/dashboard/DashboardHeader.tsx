import React from 'react';
import { Leaf, RotateCcw, Power } from 'lucide-react';

interface DashboardHeaderProps {
  displayName: string | null;
  levelName: string | null;
  onRecalibrate: () => void;
  onLogout: () => Promise<void>;
}

export function DashboardHeader({
  displayName,
  levelName,
  onRecalibrate,
  onLogout
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm" id="dashboard-header-lockup">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
          <Leaf className="w-5.5 h-5.5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Hi, {displayName || 'Eco Guardian'}
            {levelName && (
              <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                {levelName}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">AI Coach Ready</p>
        </div>
      </div>

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
  );
}
