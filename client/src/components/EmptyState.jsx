import React from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

const EmptyState = ({ 
  loading = false, 
  error = null, 
  title = null,
  message = 'No data available', 
  onRetry = null 
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-full min-h-[250px] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-cyan-500 opacity-80" />
        <p className="text-sm font-bold tracking-widest uppercase opacity-60">Synchronizing Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-full min-h-[250px] text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-white font-bold mb-2">{title || 'Connection Failure'}</h3>
        <p className="text-xs max-w-xs text-slate-500 leading-relaxed mb-6">{error}</p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all active:scale-95"
          >
            <RefreshCw size={14} className="text-cyan-400" />
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 h-full min-h-[250px] text-slate-500 text-center">
      <div className="w-16 h-16 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center mb-6">
        <span className="text-2xl grayscale opacity-30">📁</span>
      </div>
      <h3 className="text-white/80 font-bold mb-1">{title || 'No Records Found'}</h3>
      <p className="text-xs max-w-[200px] leading-relaxed">{message}</p>
    </div>
  );
};

export default EmptyState;
