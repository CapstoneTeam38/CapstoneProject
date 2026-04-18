import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

const EmptyState = ({ loading = false, error = null, message = 'No data available' }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full min-h-[200px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-cyan-500" />
        <p className="text-sm font-medium tracking-wide">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full min-h-[200px] text-red-400/80">
        <AlertTriangle className="w-8 h-8 mb-4 text-red-500" />
        <p className="text-sm font-medium tracking-wide mb-2">Error loading feed</p>
        <p className="text-xs max-w-sm text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full min-h-[200px] text-slate-500">
      <div className="w-12 h-12 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center mb-4">
        <span className="text-xl opacity-50">📋</span>
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default EmptyState;
