import React from 'react';
import { Salad } from 'lucide-react';
import { LifestyleData } from '../../types';

interface DietStepProps {
  dietType: LifestyleData['dietType'];
  setDietType: (type: LifestyleData['dietType']) => void;
  localFoodPercent: number;
  setLocalFoodPercent: (pct: number) => void;
  foodWasteLevel: LifestyleData['foodWasteLevel'];
  setFoodWasteLevel: (level: LifestyleData['foodWasteLevel']) => void;
}

export function DietStep({
  dietType,
  setDietType,
  localFoodPercent,
  setLocalFoodPercent,
  foodWasteLevel,
  setFoodWasteLevel
}: DietStepProps) {
  const diets = [
    { id: 'heavy_meat', title: 'High Protein Meat Heavy', desc: 'Frequent meat portions daily' },
    { id: 'occasional_meat', title: 'Balanced Occasional', desc: 'Meat mixed with many veggies' },
    { id: 'vegetarian', title: 'Standard Vegetarian', desc: 'No animal meat, inclusive dairy' },
    { id: 'vegan', title: '100% Plant-Based Vegan', desc: 'No meat, dairy, or animal items' }
  ] as const;

  const wastes = [
    { id: 'high', title: 'High Food Waste', desc: 'Unused food thrown out regularly' },
    { id: 'medium', title: 'Moderate Waste', desc: 'Some leftovers discarded' },
    { id: 'low', title: 'Low Food Waste', desc: 'Strategic compost and zero spoils' }
  ] as const;

  return (
    <div className="space-y-5" id="step-diet">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
          <Salad className="text-emerald-500 w-5 h-5" />
          Meals & Dietary Habits
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Tell us about what and where you typically eat.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 block">Diet Type Baseline</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {diets.map((diet) => (
            <button
              key={diet.id}
              type="button"
              onClick={() => setDietType(diet.id)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                dietType === diet.id 
                  ? 'bg-emerald-50/50 border-emerald-400 text-slate-900 font-semibold' 
                  : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
              }`}
            >
              <span className="text-xs font-bold">{diet.title}</span>
              <span className="text-[9px] text-slate-400 mt-1 leading-tight">{diet.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Locally sourced supply percentage</span>
          <span className="text-emerald-600 font-bold font-mono">{localFoodPercent}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100"
          step="10"
          value={localFoodPercent}
          onChange={(e) => setLocalFoodPercent(Number(e.target.value))}
          aria-label="Percentage of food bought locally"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={localFoodPercent}
          className="w-full accent-emerald-500 bg-slate-100 h-1 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 block">Food Waste Level</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {wastes.map((waste) => (
            <button
              key={waste.id}
              type="button"
              onClick={() => setFoodWasteLevel(waste.id)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                foodWasteLevel === waste.id 
                  ? 'bg-emerald-50/50 border-emerald-400 text-slate-900 font-semibold' 
                  : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
              }`}
            >
              <span className="text-xs font-bold">{waste.title}</span>
              <span className="text-[9px] text-slate-400 mt-1 leading-tight">{waste.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
