import React from 'react';
import { BadgeAlert, Shield } from 'lucide-react';

interface ReviewStepProps {
  baselineEmissions: {
    transport: number;
    flights: number;
    diet: number;
    foodWaste: number;
    electricity: number;
    heating: number;
    consumption: number;
    total: number;
  };
}

export function ReviewStep({ baselineEmissions }: ReviewStepProps) {
  const globalComparisonPct = Math.round((baselineEmissions.total / 4700) * 100);

  return (
    <div className="space-y-5 animate-fadeIn" id="step-review">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
          <Shield className="text-emerald-500 w-5 h-5 animate-pulse" />
          Footprint Diagnostic Complete
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Based on the comparative baseline statistics, here are your annual approximations:
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center space-y-2">
        <span className="text-[10px] text-emerald-600 font-bold tracking-widest block uppercase">Estimated Baseline Footprint</span>
        <span className="text-3xl font-extrabold text-slate-900 block font-fancy">
          {baselineEmissions.total.toLocaleString()}
        </span>
        <span className="text-[9px] font-mono text-slate-400 font-bold block tracking-wider">KG CO₂ EQUIVALENT / YEAR</span>
      </div>

      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 flex items-start gap-2.5">
        <BadgeAlert className="w-5 h-5 text-amber-650 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-amber-800 block">Baseline vs. Global Targets</span>
          <span className="text-amber-700/90 leading-relaxed font-medium block mt-0.5">
            Your current baseline is approx <span className="font-bold">{globalComparisonPct}%</span> of the sustainable limit target (4.7 tons CO₂ per person year).
          </span>
        </div>
      </div>
    </div>
  );
}
