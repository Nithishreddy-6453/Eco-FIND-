import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, Bus, Bike, Zap, Flame, Compass, 
  ChevronRight, ChevronLeft, Salad, ShoppingBag, 
  Sparkles, Scale 
} from 'lucide-react';
import { LifestyleData } from '../types';
import { calculateLifestyleEmissions } from '../constants';

interface OnboardingQuestionnaireProps {
  initialData: LifestyleData | null;
  onSave: (data: Omit<LifestyleData, 'uid' | 'updatedAt'>) => Promise<void>;
  isLoading: boolean;
}

type Steps = 'transport' | 'diet' | 'energy' | 'consumption' | 'review';

export function OnboardingQuestionnaire({ initialData, onSave, isLoading }: OnboardingQuestionnaireProps) {
  const [step, setStep] = useState<Steps>('transport');
  
  // Local questionnaire state
  const [commuteMode, setCommuteMode] = useState<LifestyleData['commuteMode']>(initialData?.commuteMode || 'car');
  const [distancePerDayKm, setDistancePerDayKm] = useState<number>(initialData?.distancePerDayKm ?? 15);
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

  // Interactive Live Calculated footprint preview
  const [liveEmissions, setLiveEmissions] = useState({
    transport: 0,
    flights: 0,
    diet: 0,
    foodWaste: 0,
    electricity: 0,
    heating: 0,
    consumption: 0,
    total: 0
  });

  useEffect(() => {
    const calculated = calculateLifestyleEmissions({
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
    setLiveEmissions(calculated);
  }, [
    commuteMode, distancePerDayKm, annualFlights,
    dietType, localFoodPercent, foodWasteLevel,
    electricityKwhPerMonth, greenEnergyPercent, heatingType, thermostatOffsetC,
    shoppingHabits, recyclingLevel
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

  const handleSubmit = async () => {
    const rawData: Omit<LifestyleData, 'uid' | 'updatedAt'> = {
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
    };
    await onSave(rawData);
  };

  return (
    <div id="questionnaire-card-container" className="w-full max-w-xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden select-none text-slate-850">
      
      {/* Top stage progress bar */}
      <div className="flex items-center justify-between mb-4 text-xs text-slate-500 font-mono tracking-wide">
        <span className="text-emerald-600 font-semibold uppercase flex items-center gap-1.5 font-fancy">
          <Compass className="w-4 h-4 text-emerald-500" />
          Onboarding
        </span>
        <span className="font-bold">
          {step === 'transport' && 'Step 1 of 5'}
          {step === 'diet' && 'Step 2 of 5'}
          {step === 'energy' && 'Step 3 of 5'}
          {step === 'consumption' && 'Step 4 of 5'}
          {step === 'review' && 'Ready'}
        </span>
      </div>

      <div className="w-full h-1.5 bg-slate-50 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ 
            width: 
              step === 'transport' ? '20%' : 
              step === 'diet' ? '40%' : 
              step === 'energy' ? '60%' : 
              step === 'consumption' ? '80%' : '100%' 
          }}
        />
      </div>

      {/* Main steps contents */}
      <div className="min-h-[280px]">
        <AnimatePresence mode="wait">
          {step === 'transport' && (
            <motion.div
              key="transport-step"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
              id="step-transport"
            >
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                  <Car className="text-emerald-500 w-5 h-5" />
                  Commute & Travel
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  How do you commute on a standard daily basis?
                </p>
              </div>

              {/* Commute Selector */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="transport-pref-grid">
                  {[
                    { id: 'car', icon: Car, title: 'Petrol Engine Car', desc: 'Gasoline powered commute' },
                    { id: 'hybrid_car', icon: Car, title: 'Hybrid Vehicle', desc: 'Part electric hybrid' },
                    { id: 'electric_car', icon: Zap, title: 'Electric Car (EV)', desc: 'Purely battery powered' },
                    { id: 'public_transport', icon: Bus, title: 'Transit Bus/Train', desc: 'Shared travel options' },
                    { id: 'bike_walk', icon: Bike, desc: 'Completely carbon emissions free', title: 'Walk or Bicycle' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setCommuteMode(mode.id as any)}
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

              {/* Distance Slider */}
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

              {/* Flights */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Annual flights taken</span>
                  <span className="text-emerald-600 font-bold font-mono">{annualFlights} trips</span>
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

            </motion.div>
          )}

          {step === 'diet' && (
            <motion.div
              key="diet-step"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
              id="step-diet"
            >
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                  <Salad className="text-emerald-500 w-5 h-5" />
                  Dietary Profile
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Food and meals output is a high component of personal carbon generation.
                </p>
              </div>

              {/* Diet types */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="diet-pref-grid">
                  {[
                    { id: 'heavy_meat', title: 'Frequent Meat Eater', desc: 'Meals focus on beef, poultry daily' },
                    { id: 'occasional_meat', title: 'Balanced Occasional', desc: 'Meat mixed with many veggies' },
                    { id: 'vegetarian', title: 'Pure Vegetarian', desc: 'Dairy but no meats, fish or poultry' },
                    { id: 'vegan', title: 'Vegan Diet', desc: 'No animal products or derived goods' }
                  ].map((diet) => (
                    <button
                      key={diet.id}
                      onClick={() => setDietType(diet.id as any)}
                      className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        dietType === diet.id 
                          ? 'bg-emerald-50/50 border-emerald-400 text-slate-900 font-semibold' 
                          : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold">{diet.title}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{diet.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Food waste */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold">Food waste levels</label>
                <div className="flex gap-2">
                  {[
                    { id: 'high', label: 'Spills & throws' },
                    { id: 'medium', label: 'Average' },
                    { id: 'low', label: 'Almost Zero' }
                  ].map((waste) => (
                    <button
                      key={waste.id}
                      type="button"
                      onClick={() => setFoodWasteLevel(waste.id as any)}
                      className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                        foodWasteLevel === waste.id 
                          ? 'bg-emerald-50/50 border-emerald-400 text-emerald-600 font-semibold text-xs' 
                          : 'bg-white border-slate-100 text-slate-500 text-xs hover:border-slate-200'
                      }`}
                    >
                      <span>{waste.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Local food */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Locally sourced items</span>
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

            </motion.div>
          )}

          {step === 'energy' && (
            <motion.div
              key="energy-step"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
              id="step-energy"
            >
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                  <Flame className="text-emerald-500 w-5 h-5" />
                  Home Energy Setup
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Utilities play an essential role in your overall carbon score coefficient.
                </p>
              </div>

              {/* Electricity Monthly Usage */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Electricity used monthly</span>
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

              {/* Green Energy slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Renewable energy backing</span>
                  <span className="text-emerald-600 font-bold font-mono">{greenEnergyPercent}% solar</span>
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

              {/* Heating Source selectors */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold">Home heating device</label>
                <div className="grid grid-cols-2 gap-2" id="heating-pref-grid">
                  {[
                    { id: 'gas', label: 'Gas Boiler' },
                    { id: 'electric', label: 'Electric Heat Pump' },
                    { id: 'coal_oil', label: 'Fuel/Coal Burner' },
                    { id: 'district_solar', label: 'District Geothermal' },
                    { id: 'none', label: 'No Heating system' }
                  ].map((heat) => (
                    <button
                      key={heat.id}
                      type="button"
                      onClick={() => setHeatingType(heat.id as any)}
                      aria-label={`Select heating source: ${heat.label}`}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        heatingType === heat.id 
                          ? 'bg-emerald-50 border-emerald-400 text-slate-900 font-semibold' 
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <p>{heat.label}</p>
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {step === 'consumption' && (
            <motion.div
              key="consumption-step"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
              id="step-consumption"
            >
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                  <ShoppingBag className="text-emerald-500 w-5 h-5" />
                  Consumption Habits
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  How often do you purchase new items and recycle sorting packets?
                </p>
              </div>

              {/* Shopping habits */}
              <div className="space-y-2">
                <div className="space-y-2" id="shopping-pref-stack">
                  {[
                    { id: 'high_consumer', title: 'Frequent Shopper', desc: 'Frequent new purchases/e-commerce weekly' },
                    { id: 'moderate', title: 'Moderate / Standard', desc: 'Buy replacement items only' },
                    { id: 'minimalist', title: 'Minimalist Life', desc: 'Extremely sparse purchases' }
                  ].map((shop) => (
                    <button
                      key={shop.id}
                      onClick={() => setShoppingHabits(shop.id as any)}
                      className={`w-full flex items-start text-left gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        shoppingHabits === shop.id 
                          ? 'bg-emerald-50/50 border-emerald-400 text-slate-900 font-semibold' 
                          : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${shoppingHabits === shop.id ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <div>
                        <p className="text-xs font-bold">{shop.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{shop.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recycling levels */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold">Recycling Habits</label>
                <div className="flex gap-2">
                  {[
                    { id: 'none', label: 'Minimal' },
                    { id: 'some', label: 'Sort cardboard/bottles' },
                    { id: 'full', label: 'Strict organic compost' }
                  ].map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setRecyclingLevel(level.id as any)}
                      className={`flex-1 py-2.5 px-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                        recyclingLevel === level.id 
                          ? 'bg-emerald-50/50 border-emerald-400 text-emerald-600 font-semibold' 
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <span>{level.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {step === 'review' && (
            <motion.div
              key="review-step"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
              id="step-review"
            >
              <div className="text-center space-y-1.5">
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1">
                  <Scale className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Baseline Assessment</h3>
                <p className="text-xs text-slate-400">
                  Ready to calculate your base carbon stats.
                </p>
              </div>

              {/* Calculated emissions summary layout */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3.5">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Core score estimate:</span>
                  <span className="text-base font-bold text-emerald-600 font-mono">
                    {liveEmissions.total.toLocaleString()} kg CO₂ / yr
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Travel:
                    </span>
                    <span className="font-mono font-bold">{(liveEmissions.transport + liveEmissions.flights).toLocaleString()} kg</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Food & Waste:
                    </span>
                    <span className="font-mono font-bold">{(liveEmissions.diet + liveEmissions.foodWaste).toLocaleString()} kg</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Home Energy:
                    </span>
                    <span className="font-mono font-bold">{(liveEmissions.electricity + liveEmissions.heating).toLocaleString()} kg</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      Consumption:
                    </span>
                    <span className="font-mono font-bold">{(liveEmissions.consumption).toLocaleString()} kg</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-150 rounded-xl p-3 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    AI will compile a highly bespoke action plan targeting your heaviest sectors.
                  </p>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Button navigation section */}
      <div className="flex justify-between items-center pt-5 border-t border-slate-100 mt-5">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 'transport' || isLoading}
          aria-label="Previous onboarding questionnaire step"
          className="flex items-center justify-center gap-1 h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {step === 'review' ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            aria-label="Confirm baseline questionnaire and build personalized coaching strategy"
            className="flex items-center justify-center gap-1.5 h-10 px-5 text-xs font-bold rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all cursor-pointer disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Build Strategy</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next onboarding questionnaire step"
            className="flex items-center justify-center gap-1 h-10 px-4 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
}
