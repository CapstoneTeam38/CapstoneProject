import React from 'react';
import { ShieldAlert } from 'lucide-react';

const AlertBadge = ({ count = 0, label = "Active Alerts" }) => {
  const hasAlerts = count > 0;

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border ${hasAlerts ? 'bg-red-500/[0.05] border-red-500/20' : 'bg-white/[0.02] border-white/5'}`}>
      <div className="relative flex items-center justify-center">
        {hasAlerts ? (
          <>
            <span className="absolute inline-flex w-3 h-3 bg-red-400 rounded-full opacity-75 animate-ping"></span>
            <span className="relative inline-flex w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </>
        ) : (
          <ShieldAlert size={16} className="text-slate-500" />
        )}
      </div>
      <div className="flex flex-col">
        <span className={`text-xs font-semibold uppercase tracking-wider ${hasAlerts ? 'text-red-400' : 'text-slate-500'}`}>
          {label}
        </span>
        {hasAlerts && (
          <span className="text-sm font-bold text-white leading-none">
            {count.toLocaleString()} <span className="font-medium text-slate-400 text-xs ml-0.5">Critical</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default AlertBadge;
