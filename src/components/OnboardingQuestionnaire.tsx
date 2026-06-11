import React, { useState } from 'react';
import { Leaf, ArrowRight, ArrowLeft } from 'lucide-react';
import { LifestyleData } from '../types';
import { calculateLifestyleEmissions } from '../constants';

// Subcomponents
import { TransportStep } from './onboarding/TransportStep';
import { DietStep } from './onboarding/DietStep';
import { EnergyStep } from './onboarding/EnergyStep';
import { ConsumptionStep } from './onboarding/ConsumptionStep';
import { ReviewStep } from './onboarding/ReviewStep';

interface OnboardingQuestionnaireProps {
  onSave: (data: Omit<LifestyleData, 'uid' | 'updatedAt'>) => Promise<void>;
  initialData?: LifestyleData | null;
  isLoading?: boolean;
}

type StepType = 'transport' | 'diet' | 'energy' | 'consumption' | 'review';

export function OnboardingQuestionnaire({ onSave, initialData }: OnboardingQuestionnaireProps) {
  const [step, setStep] = useState<StepType>('transport');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form states matching LifestyleData specification with exact key pairings
  const [commuteMode, setCommuteMode] = useState<LifestyleData['commuteMode']>(initialData?.commuteMode || 'car');
  const [distancePerDayKm, setDistancePerDayKm] = useState<number>(initialData?.distancePerDayKm ?? 20);
  const [annualFlights, setAnnualFlights] = useState<number>(initialData?.annualFlights ?? 2);
  const [dietType, setDietType] = useState<LifestyleData['dietType']>(initialData?.dietType || 'occasional_meat');
  const [localFoodPercent, setLocalFoodPercent] = useState<number>(initialData?.localFoodPercent ?? 30);
  const [foodWasteLevel, setFoodWasteLevel] = useState<LifestyleData['foodWasteLevel']>(initialData?.foodWasteLevel || 'medium');
  const [electricityKwhPerMonth, setElectricityKwhPerMonth] = useState<number>(initialData?.electricityKwhPerMonth ?? 250);
  const [greenEnergyPercent, setGreenEnergyPercent] = useState<number>(initialData?.greenEnergyPercent ?? 10);
  const [heatingType, setHeatingType] = useState<LifestyleData['heatingType']>(initialData?.heatingType || 'gas');
  const [thermostatOffsetC, setThermostatOffsetC] = useState<number>(initialData?.thermostatOffsetC ?? 0);
  const [shoppingHabits, setShoppingHabits] = useState<LifestyleData['shoppingHabits']>(initialData?.shoppingHabits || 'moderate');
  const [recyclingLevel, setRecyclingLevel] = useState<LifestyleData['recyclingLevel']>(initialData?.recyclingLevel || 'some');

  const baselineEmissions = React.useMemo(() => {
    return calculateLifestyleEmissions({
      commuteMode,
      distancePerDayKm,
      annualFlights,
      dietType,
      foodWasteLevel,
      electricityKwhPerMonth,
      greenEnergyPercent,
      heatingType,
      shoppingHabits,
      recyclingLevel
    });
  }, [
    commuteMode, distancePerDayKm, annualFlights, dietType,
    foodWasteLevel, electricityKwhPerMonth, greenEnergyPercent,
    heatingType, shoppingHabits, recyclingLevel
  ]);

  const handleNext = () => {
    if (step === 'transport') setStep('diet');
    else if (step === 'diet') setStep('energy');
    else if (step === 'energy') setStep('consumption');
    else if (step === 'consumption') setStep('review');
  };

  const handleBack = () => {
    if (step === 'diet') setStep('transport');
    else if (step === 'energy') setStep('diet');
    else if (step === 'consumption') setStep('energy');
    else if (step === 'review') setStep('consumption');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        commuteMode,
        distancePerDayKm,
        annualFlights,
        dietType,
        localFoodPercent,
        foodWasteLevel,
        electricityKwhPerMonth,
        greenEnergyPercent,
        heatingType,
        thermostatOffsetC,
        shoppingHabits,
        recyclingLevel
      });
    } catch (err) {
      console.error('Failed to register onboard preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-3xl shadow-sm p-6 sm:p-7 space-y-6" id="onboarding-modal-panel">
      
      {/* Upper Brand lockup */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
          <Leaf className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">EcoMind Companion</h2>
          <p className="text-[10px] text-emerald-600 font-bold tracking-wider font-mono uppercase">Diagnostic Baseline Onboarding</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 'transport' && (
          <TransportStep 
            commuteMode={commuteMode} setCommuteMode={setCommuteMode}
            distancePerDayKm={distancePerDayKm} setDistancePerDayKm={setDistancePerDayKm}
            annualFlights={annualFlights} setAnnualFlights={setAnnualFlights}
          />
        )}

        {step === 'diet' && (
          <DietStep 
            dietType={dietType} setDietType={setDietType}
            localFoodPercent={localFoodPercent} setLocalFoodPercent={setLocalFoodPercent}
            foodWasteLevel={foodWasteLevel} setFoodWasteLevel={setFoodWasteLevel}
          />
        )}

        {step === 'energy' && (
          <EnergyStep 
            electricityKwhPerMonth={electricityKwhPerMonth} setElectricityKwhPerMonth={setElectricityKwhPerMonth}
            greenEnergyPercent={greenEnergyPercent} setGreenEnergyPercent={setGreenEnergyPercent}
            heatingType={heatingType} setHeatingType={setHeatingType}
            thermostatOffsetC={thermostatOffsetC} setThermostatOffsetC={setThermostatOffsetC}
          />
        )}

        {step === 'consumption' && (
          <ConsumptionStep 
            shoppingHabits={shoppingHabits} setShoppingHabits={setShoppingHabits}
            recyclingLevel={recyclingLevel} setRecyclingLevel={setRecyclingLevel}
          />
        )}

        {step === 'review' && (
          <ReviewStep baselineEmissions={baselineEmissions} />
        )}

        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
          {step !== 'transport' ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 h-11 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 rounded-xl border border-slate-150 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step !== 'review' ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 h-11 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 h-11 bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isSaving ? 'Compiling profile...' : 'Launch Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
