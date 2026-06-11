import React from 'react';
import { Flame } from 'lucide-react';
import { LifestyleData } from '../../types';

interface EnergyStepProps {
  electricityKwhPerMonth: number;
  setElectricityKwhPerMonth: (val: number) => void;
  greenEnergyPercent: number;
  setGreenEnergyPercent: (pct: number) => void;
  heatingType: LifestyleData['heatingType'];
  setHeatingType: (type: LifestyleData['heatingType']) => void;
  thermostatOffsetC: number;
  setThermostatOffsetC: (offset: number) => void;
}

export function EnergyStep({
  electricityKwhPerMonth,
  setElectricityKwhPerMonth,
  greenEnergyPercent,
  setGreenEnergyPercent,
  heatingType,
  setHeatingType,
  thermostatOffsetC,
  setThermostatOffsetC
}: EnergyStepProps) {
  const heatingSystems = [
    { id: 'gas', title: 'Natural Gas Boiler', desc: 'Standard central fuel boiler' },
    { id: 'electric', title: 'Heat Pump / Electric', desc: 'Eco friendly or standard electrical' },
    { id: 'coal_oil', title: 'Coal or Fuel Oil', desc: 'Highly carbon intensive system' },
    { id: 'district_solar', title: 'District / Solar Thermal', desc: 'Shared thermal grids or clean roof panels' },
    { id: 'none', title: 'No Heating System', desc: 'Mild locations or passive buildings' }
  ] as const;

  return (
    <div className="space-y-5" id="step-energy">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
          <Flame className="text-emerald-500 w-5 h-5" />
          Home Utility & Clean Energy
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Tell us about how your household consumes energy.
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Avg monthly electric usage</span>
          <span className="text-emerald-600 font-bold font-mono">{electricityKwhPerMonth} kWh / mo</span>
        </div>
        <input 
          type="range" 
          min="50" 
          max="1500"
          step="50"
          value={electricityKwhPerMonth}
          onChange={(e) => setElectricityKwhPerMonth(Number(e.target.value))}
          aria-label="Monthly electricity usage in kilowatt hours"
          aria-valuemin={50}
          aria-valuemax={1500}
          aria-valuenow={electricityKwhPerMonth}
          className="w-full accent-emerald-500 bg-slate-100 h-1 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Renewable electric source supply</span>
          <span className="text-emerald-600 font-bold font-mono">{greenEnergyPercent}% renewable</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100"
          step="10"
          value={greenEnergyPercent}
          onChange={(e) => setGreenEnergyPercent(Number(e.target.value))}
          aria-label="Renewable energy percentage of electricity supply"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={greenEnergyPercent}
          className="w-full accent-emerald-500 bg-slate-100 h-1 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 block">Heating Utility Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {heatingSystems.map((heat) => (
            <button
              key={heat.id}
              type="button"
              onClick={() => setHeatingType(heat.id)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                heatingType === heat.id 
                  ? 'bg-emerald-50/50 border-emerald-400 text-slate-900 font-semibold' 
                  : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
              }`}
            >
              <span className="text-xs font-bold">{heat.title}</span>
              <span className="text-[9px] text-slate-400 mt-1 leading-tight">{heat.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Thermostat Adjustment Offset</span>
          <span className="text-emerald-600 font-bold font-mono">
            {thermostatOffsetC > 0 ? `+${thermostatOffsetC}` : thermostatOffsetC}°C
          </span>
        </div>
        <input 
          type="range" 
          min="-4" 
          max="4"
          step="1"
          value={thermostatOffsetC}
          onChange={(e) => setThermostatOffsetC(Number(e.target.value))}
          aria-label="Thermostat offset in degrees celsius"
          aria-valuemin={-4}
          aria-valuemax={4}
          aria-valuenow={thermostatOffsetC}
          className="w-full accent-emerald-500 bg-slate-100 h-1 rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-[10px] text-slate-400 leading-tight">
          Increasing standard summer thermostat controls or lowering winter heating targets optimizes carbon efficiency.
        </p>
      </div>
    </div>
  );
}
