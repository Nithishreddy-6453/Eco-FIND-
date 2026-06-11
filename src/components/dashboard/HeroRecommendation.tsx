import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Recommendation } from '../../types';

interface HeroRecommendationProps {
  principalRec: Recommendation;
  onUpdateStatus: (rec: Recommendation, status: 'completed' | 'dismissed') => Promise<void>;
}

export function HeroRecommendation({
  principalRec,
  onUpdateStatus,
}: HeroRecommendationProps) {
  return (
    <motion.div 
      key={principalRec.id}
      className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden"
      id="coach-principal-card"
    >
      <div className="absolute top-6 right-6 flex gap-1.5">
        <span className="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
          {principalRec.category}
        </span>
      </div>

      <div className="space-y-2 pr-12">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
          {principalRec.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
          {principalRec.description}
        </p>
      </div>

      {/* Decision Engine Explainability Breakdown */}
      <div className="mt-5 bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-4" id="coach-decision-engine">
        <div>
          <p className="text-[9px] text-emerald-700 font-extrabold tracking-widest uppercase">Intelligent Decision Log</p>
          <h4 className="text-xs font-bold text-slate-800 mt-0.5">Multi-Stage Reasoning Explainability</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-0.5 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Estimated Impact</p>
            <p className="text-sm font-extrabold text-slate-800 font-mono">
              {principalRec.co2SavedKgPerYear.toLocaleString()} kg CO₂/yr
            </p>
            <p className="text-[9px] text-emerald-600 font-semibold font-mono">
              ≈ {Math.round(principalRec.co2SavedKgPerYear / 12)} kg/mo
            </p>
          </div>

          <div className="space-y-0.5 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs col-span-2">
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Comparison Metrics</p>
            <p className="text-[10px] text-slate-650 font-semibold leading-relaxed">
              Saves <span className="text-emerald-600 font-bold font-mono">{(principalRec.comparisonMetric?.primaryCo2Saved || principalRec.co2SavedKgPerYear).toLocaleString()} kg/yr</span> vs. only <span className="text-slate-500 font-bold font-mono">{(principalRec.comparisonMetric?.secondaryCo2Saved || 80)} kg/yr</span> with secondary alternatives.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          {principalRec.whySelected && (
            <div className="bg-white/85 border border-slate-100 rounded-xl p-3 shadow-2xs">
              <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Why This Action Is Recommended</p>
              <p className="text-slate-700 leading-relaxed font-semibold">
                {principalRec.whySelected}
              </p>
            </div>
          )}

          {principalRec.whyRejected && (
            <div className="bg-white/85 border border-slate-100 rounded-xl p-3 shadow-2xs">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Comparative Superiority Analysis</p>
              <p className="text-slate-650 leading-relaxed font-semibold">
                {principalRec.whyRejected}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions checklist */}
      <div className="mt-5 space-y-2.5">
        <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Coach Action steps:</h4>
        <div className="space-y-1.5" id="coach-action-checklist">
          {principalRec.actionItems?.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-start space-x-2.5 text-xs bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/60">
              <span className="w-4.5 h-4.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg flex items-center justify-center font-mono shrink-0">
                {idx + 1}
              </span>
              <p className="text-slate-600 font-medium leading-normal format-line-item">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 pt-5 border-t border-slate-100">
        <button
          onClick={() => onUpdateStatus(principalRec, 'completed')}
          className="flex-1 h-11 bg-emerald-500 text-white font-bold rounded-xl text-xs tracking-wide shadow-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Log Done (+{principalRec.co2SavedKgPerYear}kg CO₂)</span>
        </button>
        <button
          onClick={() => onUpdateStatus(principalRec, 'dismissed')}
          className="h-11 px-3.5 bg-slate-50 hover:bg-red-50 hover:text-red-500 border border-slate-150 rounded-xl text-[11px] text-slate-500 transition-all font-bold cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}
