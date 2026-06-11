import React from 'react';

interface WeeklyProgressChartProps {
  weeklyProgressCo2: number | null;
  weeklyGoalCo2: number | null;
}

export function WeeklyProgressChart({
  weeklyProgressCo2,
  weeklyGoalCo2
}: WeeklyProgressChartProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
      <span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase block font-fancy">Weekly Progress Chart</span>
      
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>This week's saved co₂:</span>
          <span className="text-emerald-600 font-mono">{Math.round(weeklyProgressCo2 ?? 0)} kg / {weeklyGoalCo2 ?? 50} kg</span>
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
            { day: 'S', value: Math.max(2, Math.round(weeklyProgressCo2 ?? 4) % 15), fill: 'bg-emerald-500 animate-pulse' }
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
  );
}
