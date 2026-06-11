import React from 'react';
import { Car, Zap, Bus, Bike } from 'lucide-react';
import { LifestyleData } from '../../types';

interface TransportStepProps {
  commuteMode: LifestyleData['commuteMode'];
  setCommuteMode: (mode: LifestyleData['commuteMode']) => void;
  distancePerDayKm: number;
  setDistancePerDayKm: (dist: number) => void;
  annualFlights: number;
  setAnnualFlights: (flights: number) => void;
}

export function TransportStep({
  commuteMode,
  setCommuteMode,
  distancePerDayKm,
  setDistancePerDayKm,
  annualFlights,
  setAnnualFlights
}: TransportStepProps) {
  const modes = [
    { id: 'car', icon: Car, title: 'Petrol Engine Car', desc: 'Gasoline powered commute' },
    { id: 'hybrid_car', icon: Car, title: 'Hybrid Vehicle', desc: 'Part electric hybrid' },
    { id: 'electric_car', icon: Zap, title: 'Electric Car (EV)', desc: 'Purely battery powered' },
    { id: 'public_transport', icon: Bus, title: 'Transit Bus/Train', desc: 'Shared travel options' },
    { id: 'bike_walk', icon: Bike, desc: 'Completely carbon emissions free', title: 'Walk or Bicycle' }
  ] as const;

  return (
    <div className="space-y-5" id="step-transport">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
          <Car className="text-emerald-500 w-5 h-5" />
          Commute & Travel
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          How do you commute on a standard daily basis?
        </p>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="transport-pref-grid">
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setCommuteMode(mode.id)}
              className={`flex items-start text-left gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                commuteMode === mode.id 
                  ? 'bg-emerald-50/50 border-emerald-400 text-slate-900 font-semibold' 
                  : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
              }`}
            >
              <mode.icon className={`w-4 h-4 shrink-0 mt-0.5 ${commuteMode === mode.id ? 'text-emerald-500' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-bold">{mode.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{mode.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Commute travel length</span>
          <span className="text-emerald-600 font-bold font-mono">{distancePerDayKm} km / day</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="120"
          step="5"
          value={distancePerDayKm}
          onChange={(e) => setDistancePerDayKm(Number(e.target.value))}
          aria-label="Commute travel distance per day in kilometers"
          aria-valuemin={0}
          aria-valuemax={120}
          aria-valuenow={distancePerDayKm}
          className="w-full accent-emerald-500 bg-slate-100 h-1 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Annual aviation travel frequency</span>
          <span className="text-emerald-600 font-bold font-mono">{annualFlights} flights / year</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="15"
          step="1"
          value={annualFlights}
          onChange={(e) => setAnnualFlights(Number(e.target.value))}
          aria-label="Annual flights taken per year"
          aria-valuemin={0}
          aria-valuemax={15}
          aria-valuenow={annualFlights}
          className="w-full accent-emerald-500 bg-slate-100 h-1 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
