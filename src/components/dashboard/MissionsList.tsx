import React from 'react';

export function MissionsList() {
  const dashChallenges = [
    { title: 'Pedal Over Petrol', reward: '40 XP', co2: '-5kg', cat: 'Transport' },
    { title: 'Meatless Maverick', reward: '50 XP', co2: '-8kg', cat: 'Diet' },
    { title: 'Degree Detective', reward: '30 XP', co2: '-3kg', cat: 'Energy' }
  ];

  return (
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
  );
}
