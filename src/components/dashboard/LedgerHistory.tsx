import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { ImpactLog } from '../../types';

interface LedgerHistoryProps {
  impactLogs: ImpactLog[];
  onDismissLog: (logId: string, loggedCo2: number) => Promise<void>;
}

export function LedgerHistory({
  impactLogs,
  onDismissLog
}: LedgerHistoryProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm" id="impact-logs-ledger">
      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-3">
        <Check className="w-4 h-4 text-emerald-500" />
        <span>Ledger History</span>
      </h4>

      {impactLogs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-2.5 px-2">Recommendation</th>
                <th className="py-2.5 px-2">Category</th>
                <th className="py-2.5 px-2 text-right">Saving Equivalent</th>
                <th className="py-2.5 px-2 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50" id="impact-records-body">
              {impactLogs.map((log) => (
                <tr key={log.id} className="text-slate-700 font-medium">
                  <td className="py-2.5 px-2 font-bold text-slate-800">
                    {log.recommendationTitle}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 border border-slate-100 rounded-full font-bold uppercase">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right text-emerald-600 font-bold font-mono">
                    -{log.co2SavedKg} kg
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => onDismissLog(log.id, log.co2SavedKg)}
                      className="p-1 px-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded transition-all cursor-pointer"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
          <p className="text-[11px]">Your offset ledger is currently empty. Clear a recommendation top incentive to map saves.</p>
        </div>
      )}
    </div>
  );
}
