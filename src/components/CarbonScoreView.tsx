import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Footprints, Info, TreePine, Lightbulb, Plane, RefreshCw, Sparkles, Scale } from 'lucide-react';
import { LifestyleData } from '../types';
import { calculateLifestyleEmissions } from '../constants';

interface CarbonScoreViewProps {
  lifestyleData: LifestyleData | null;
  onRecalibrate: () => void;
}

export function CarbonScoreView({ lifestyleData, onRecalibrate }: CarbonScoreViewProps) {
  const [showFormulaInfo, setShowFormulaInfo] = useState<boolean>(false);
  const baselineEmissions = lifestyleData ? calculateLifestyleEmissions(lifestyleData) : null;

  if (!baselineEmissions) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Footprints className="w-12 h-12 text-slate-400 animate-bounce" />
        <h3 className="text-base font-bold text-slate-800">No Footprint Data</h3>
        <p className="text-xs text-slate-400 max-w-xs">
          Please complete the onboarding setup to calculate your baseline stats.
        </p>
        <button
          onClick={onRecalibrate}
          className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl"
        >
          Initialize Baseline
        </button>
      </div>
    );
  }

  // Calculate comparisons
  const equivalentTrees = Math.round(baselineEmissions.total / 22); // tree absorbs ~22kg/yr
  const equivalentFlights = (baselineEmissions.total / 900).toFixed(1); // flight passengers ~900kg
  const equivalentBulbs = Math.round((baselineEmissions.total / 0.15)); // bulb hour ~0.15kg

  const isBelowAverage = baselineEmissions.total < 9000;
  const averageValue = 9000;
  const userPercentOfAverage = Math.min(100, Math.round((baselineEmissions.total / averageValue) * 100));

  return (
    <div className="space-y-6 pb-6 select-none text-slate-800" id="carbon-score-view">
      
      {/* 1. Upper Main Score Circle Shield */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center relative overflow-hidden shadow-sm">
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Computed Footprint</p>
        
        {/* Apple Fitness Glowing Ring Score modified for Light Background */}
        <div className="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="68"
              stroke="#f1f5f9"
              strokeWidth="9"
              fill="transparent"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="68"
              stroke="url(#carbonScoreGradient)"
              strokeWidth="9"
              fill="transparent"
              strokeDasharray={427}
              initial={{ strokeDashoffset: 427 }}
              animate={{ strokeDashoffset: 427 - (427 * Math.min(1, baselineEmissions.total / 18000)) }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="carbonScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" /> {/* Emerald */}
                <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Big Metrics Display */}
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-slate-900 font-fancy">
              {baselineEmissions.total.toLocaleString()}
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider font-mono">
              KG CO₂E / YR
            </span>
            <span className={`text-[8px] px-2 py-0.5 rounded-full mt-2 font-bold ${
              isBelowAverage ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {isBelowAverage ? 'Eco Efficient' : 'Heavy Footprint'}
            </span>
          </div>
        </div>

        {/* Global target average baseline */}
        <div className="space-y-1.5 max-w-sm mx-auto">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase">
            <span>Global target average: 9,000 kg</span>
            <span>{userPercentOfAverage}% of limit</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isBelowAverage ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${userPercentOfAverage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Math formula helper dropdown */}
      {showFormulaInfo && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 p-4 rounded-2xl text-xs text-slate-500 space-y-2 shadow-sm"
        >
          <p className="font-bold text-slate-800 flex items-center gap-1.5 font-fancy">
            <Scale className="w-4 h-4 text-emerald-500" />
            Standard Coefficients
          </p>
          <p className="leading-relaxed text-[11px]">
            Your score matches standard global metrics: Commute (~0.18kg/km), flights (~900kg passenger/voyage), meat diet (~2,500kg annual) vs plant diets.
          </p>
        </motion.div>
      )}

      {/* Category Breakdown (High Contrast Activity Bars) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm">
        <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Category breakdown
        </h4>

        <div className="space-y-3.5">
          {[
            { 
              label: 'Transport & Air', 
              value: baselineEmissions.transport + baselineEmissions.flights, 
              tag: 'EV / Transit / Flight',
              percentage: Math.round(((baselineEmissions.transport + baselineEmissions.flights) / baselineEmissions.total) * 100), 
              color: 'bg-blue-450', 
              text: 'text-blue-500' 
            },
            { 
              label: 'Dietary Habits', 
              value: baselineEmissions.diet + baselineEmissions.foodWaste, 
              tag: 'Proteins / Waste',
              percentage: Math.round(((baselineEmissions.diet + baselineEmissions.foodWaste) / baselineEmissions.total) * 100), 
              color: 'bg-emerald-450', 
              text: 'text-emerald-500' 
            },
            { 
              label: 'Electricity & Heating', 
              value: baselineEmissions.electricity + baselineEmissions.heating, 
              tag: 'Thermostat / Grid',
              percentage: Math.round(((baselineEmissions.electricity + baselineEmissions.heating) / baselineEmissions.total) * 100), 
              color: 'bg-amber-450', 
              text: 'text-amber-500' 
            },
            { 
              label: 'Goods Consumption', 
              value: baselineEmissions.consumption, 
              tag: 'Recycling / Shopping',
              percentage: Math.round((baselineEmissions.consumption / baselineEmissions.total) * 100), 
              color: 'bg-purple-450', 
              text: 'text-purple-500' 
            }
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-800">{item.label}</span>
                  <span className="text-[10px] text-slate-400 font-medium ml-1.5">({item.tag})</span>
                </div>
                <div className="text-right flex items-baseline gap-1.5 font-mono">
                  <span className="font-bold text-slate-700 text-xs">
                    {item.value.toLocaleString()} kg
                  </span>
                  <span className={`text-[10px] font-bold ${item.text}`}>{item.percentage}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-50 border border-slate-100/50 rounded-full overflow-hidden">
                <div className={`h-full ${item.color || 'bg-emerald-550'}`} style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tangible Equivalency Comparisons */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm">
        <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          Interactive Environmental Equivalency
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-3 text-center flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center scale-95">
              <TreePine className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Trees Absorption</p>
              <p className="text-xs font-bold text-slate-800 font-mono">{equivalentTrees} mature / yr</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-3 text-center flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center scale-95">
              <Plane className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Plane Flights</p>
              <p className="text-xs font-bold text-slate-800 font-mono">{equivalentFlights} voyages</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-3 text-center flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center scale-95">
              <Lightbulb className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Lightbulb Hours</p>
              <p className="text-xs font-bold text-slate-800 font-mono">{equivalentBulbs.toLocaleString()} hrs</p>
            </div>
          </div>
        </div>

        <button
          onClick={onRecalibrate}
          className="w-full h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200/65 rounded-xl text-xs font-bold text-slate-650 hover:text-slate-800 transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalibrate Baselines</span>
        </button>
      </div>

    </div>
  );
}
