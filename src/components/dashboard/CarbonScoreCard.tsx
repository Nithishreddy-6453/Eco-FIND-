import React from 'react';

interface CarbonScoreCardProps {
  baselineEmissions: {
    transport: number;
    flights: number;
    diet: number;
    foodWaste: number;
    electricity: number;
    heating: number;
    consumption: number;
    total: number;
  } | null;
}

export function CarbonScoreCard({ baselineEmissions }: CarbonScoreCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3" id="baseline-footprint-panel">
      <div className="flex justify-between items-baseline">
        <span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase block font-fancy">Carbon Score Card</span>
        <span className="text-[8px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold font-mono">1 Yr Est</span>
      </div>

      {baselineEmissions ? (
        <div className="space-y-3">
          <div className="text-center py-2">
            <span className="text-2xl font-bold text-slate-900 font-fancy">{baselineEmissions.total.toLocaleString()}</span>
            <span className="text-[10px] font-mono font-bold text-slate-400 block tracking-wider mt-0.5">KG CO₂ / YR</span>
          </div>

          <div className="space-y-2 border-t border-slate-50 pt-3">
            {[
              { label: 'Transport', val: baselineEmissions.transport + baselineEmissions.flights, pct: Math.min(100, Math.round(((baselineEmissions.transport + baselineEmissions.flights) / baselineEmissions.total) * 100)), bg: 'bg-blue-400' },
              { label: 'Food', val: baselineEmissions.diet + baselineEmissions.foodWaste, pct: Math.min(100, Math.round(((baselineEmissions.diet + baselineEmissions.foodWaste) / baselineEmissions.total) * 100)), bg: 'bg-emerald-400' },
              { label: 'Energy', val: baselineEmissions.electricity + baselineEmissions.heating, pct: Math.min(100, Math.round(((baselineEmissions.electricity + baselineEmissions.heating) / baselineEmissions.total) * 100)), bg: 'bg-amber-400' },
              { label: 'Shopping', val: baselineEmissions.consumption, pct: Math.min(100, Math.round((baselineEmissions.consumption / baselineEmissions.total) * 100)), bg: 'bg-purple-400' }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-550">
                  <span className="font-medium">{item.label}</span>
                  <span className="font-mono font-bold">{item.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                  <div className={`h-full ${item.bg}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-4">No parameters calculated.</p>
      )}
    </div>
  );
}
