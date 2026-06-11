import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { LifestyleData } from '../../types';

interface ConsumptionStepProps {
  shoppingHabits: LifestyleData['shoppingHabits'];
  setShoppingHabits: (level: LifestyleData['shoppingHabits']) => void;
  recyclingLevel: LifestyleData['recyclingLevel'];
  setRecyclingLevel: (tier: LifestyleData['recyclingLevel']) => void;
}

export function ConsumptionStep({
  shoppingHabits,
  setShoppingHabits,
  recyclingLevel,
  setRecyclingLevel
}: ConsumptionStepProps) {
  const levels = [
    { id: 'minimalist', title: 'Minimalist approach', desc: 'Rare discretionary shopping' },
    { id: 'moderate', title: 'Average consumer', desc: 'Periodic regular purchases' },
    { id: 'high_consumer', title: 'Frequent shopper', desc: 'Frequent consumer acquisitions' }
  ] as const;

  const tiers = [
    { id: 'none', title: 'Minimal Recycling', desc: 'No sorting or local composting' },
    { id: 'some', title: 'Partial Sorting', desc: 'Standard plastic, paper, glass sorting' },
    { id: 'full', title: 'Comprehensive sorting', desc: 'Zero organic waste, strict compost' }
  ] as const;

  return (
    <div className="space-y-5" id="step-consumption">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
          <ShoppingBag className="text-emerald-500 w-5 h-5" />
          Consumption & Waste Logistics
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Tell us about your acquisition and recycling patterns.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 block">Shopping & Consumption Habit</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setShoppingHabits(lvl.id)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                shoppingHabits === lvl.id 
                  ? 'bg-emerald-50/50 border-emerald-400 text-slate-900 font-semibold' 
                  : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
              }`}
            >
              <span className="text-xs font-bold">{lvl.title}</span>
              <span className="text-[9px] text-slate-400 mt-1 leading-tight">{lvl.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 block">Recycling Sorting Tier</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {tiers.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setRecyclingLevel(t.id)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                recyclingLevel === t.id 
                  ? 'bg-emerald-50/50 border-emerald-400 text-slate-900 font-semibold' 
                  : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
              }`}
            >
              <span className="text-xs font-bold">{t.title}</span>
              <span className="text-[9px] text-slate-400 mt-1 leading-tight">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
