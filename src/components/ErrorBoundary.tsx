import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, LogOut, ShieldAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering crash:', error, errorInfo);
  }

  private handleReset = () => {
    // Clear potentially corrupted local state
    localStorage.removeItem('ecomind_profile');
    localStorage.removeItem('ecomind_lifestyle_data');
    localStorage.removeItem('ecomind_recommendations');
    localStorage.removeItem('ecomind_impact_logs');
    window.location.reload();
  };

  private handleSimpleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div id="error-boundary-screen" className="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center p-4 select-none font-sans">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-md relative overflow-hidden">
            {/* Ambient decorative warning background */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-55 border border-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                <AlertOctagon className="w-8 h-8" />
              </div>
              
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2 font-fancy">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  Application Safeguard
                </h2>
                <p className="text-xs text-slate-450 max-w-sm">
                  An unexpected layout rendering exception or state incongruency triggered a full application safeguard shutdown.
                </p>
              </div>
            </div>

            {/* Error Message Details box */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 max-h-36 overflow-auto scrollbar-thin">
              <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest block">Error Baseline Details:</span>
              <p className="text-xs font-mono text-slate-600 whitespace-pre-wrap leading-relaxed break-all">
                {this.state.error?.message || 'Unknown layout execution failure.'}
              </p>
            </div>

            {/* Actions for recovery */}
            <div className="grid grid-cols-1 gap-2 pt-2">
              <button
                onClick={this.handleSimpleReload}
                aria-label="Reload Web Applet"
                className="w-full h-11 bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Web Applet
              </button>
              
              <button
                onClick={this.handleReset}
                aria-label="Deregister State and Restart Guest Setup"
                className="w-full h-11 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-800 border border-slate-200 active:scale-[0.98] font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Deregister State & Restart Guest Setup
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center font-mono">
              Trace: react-error-boundary-safeguard
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
