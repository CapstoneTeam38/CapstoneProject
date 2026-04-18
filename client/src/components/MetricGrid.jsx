import React from 'react';
import { Target, TrendingUp, AlertCircle, Activity } from 'lucide-react';

const MetricGrid = ({ stats }) => {
  const metrics = [
    {
      label: 'Fraud Detection Rate',
      value: `${(stats.fraudRate || 0).toFixed(2)}%`,
      icon: <Target size={18} />,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10'
    },
    {
      label: 'Total Analyzed',
      value: (stats.total || 0).toLocaleString(),
      icon: <Activity size={18} />,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    },
    {
      label: 'Anomalies Confirmed',
      value: (stats.fraudCount || 0).toLocaleString(),
      icon: <AlertCircle size={18} />,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      label: 'Legitimate Baseline',
      value: (stats.legitCount || 0).toLocaleString(),
      icon: <TrendingUp size={18} />,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="glass-panel p-5 flex items-center gap-4 border-white/5 group hover:border-white/10 transition-colors">
          <div className={`p-3 rounded-xl ${m.bgColor} ${m.color} transition-transform group-hover:scale-110`}>
            {m.icon}
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{m.label}</div>
            <div className="text-lg font-black text-white">{m.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricGrid;
