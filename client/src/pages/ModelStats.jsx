import React from 'react';
import { fetchModelStats } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';
import EmptyState from '../components/EmptyState';
import { Cpu, CheckCircle2, AlertCircle, BarChart, Info, Layers } from 'lucide-react';

const PerformanceTile = ({ label, value, description, colorClass }) => (
  <div className="glass-panel p-6 border-white/5 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-5 blur-[40px] -mr-12 -mt-12 rounded-full pointer-events-none group-hover:opacity-10 transition-opacity`} />
    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</div>
    <div className={`text-3xl font-black mb-2 ${colorClass.replace('bg-', 'text-')}`}>
      {(value * 100).toFixed(2)}%
    </div>
    <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
  </div>
);

const ModelStats = () => {
  const { data: stats, loading, error } = useFetch(fetchModelStats, null);

  if (error) {
    return (
      <EmptyState 
        title="Model Engine Offline" 
        message="Could not retrieve neural metrics. Ensure the ML service is operational." 
        icon="error" 
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
             <Cpu size={12} className="text-cyan-400" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Inference Core V2.4</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Model Performance Stats</h1>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            Technical audit of the fraud detection classifier. These metrics represent the model's historical reliability and feature influence weights.
          </p>
        </div>

        {stats && (
          <div className="text-right">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Model Architecture</div>
             <div className="text-xs font-bold text-white px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                {stats.modelName}
             </div>
          </div>
        )}
      </div>

      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[...Array(4)].map((_, i) => <div key={i} className="h-40 glass-panel animate-pulse bg-white/[0.02] border-white/5" />)}
        </div>
      ) : (
        <div className="space-y-8 animate-slide-up">
          {/* Metrics Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PerformanceTile 
              label="Overall Accuracy" 
              value={stats.metrics.accuracy} 
              description="Percentage of total predictions that were correct (Fraud + Legitimate)."
              colorClass="bg-cyan-500"
            />
            <PerformanceTile 
              label="Precision Score" 
              value={stats.metrics.precision} 
              description="Reliability of fraud flags. High precision means fewer false alarms."
              colorClass="bg-emerald-500"
            />
            <PerformanceTile 
              label="Recall Score" 
              value={stats.metrics.recall} 
              description="The ability to catch fraud. High recall means fewer missed attacks."
              colorClass="bg-amber-500"
            />
            <PerformanceTile 
              label="F1 Calibration" 
              value={stats.metrics.f1} 
              description="Balanced harmonic mean of precision and recall for safe operations."
              colorClass="bg-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Confusion Matrix Section */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                 <Layers size={16} className="text-cyan-400" />
                 <h3 className="text-xs font-bold uppercase tracking-widest text-white/90">Confusion Matrix</h3>
              </div>
              <div className="glass-panel p-1 grid grid-cols-2 gap-1 bg-white/[0.01]">
                {/* Visual Grid representing binary classification outcomes */}
                <div className="p-6 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-tl-xl text-center">
                  <div className="text-[9px] font-bold text-emerald-500 uppercase mb-1">True Negative</div>
                  <div className="text-lg font-black text-white">{stats.metrics.confusion_matrix[0][0].toLocaleString()}</div>
                </div>
                <div className="p-6 bg-rose-500/[0.03] border border-rose-500/10 rounded-tr-xl text-center">
                  <div className="text-[9px] font-bold text-rose-500 uppercase mb-1">False Positive</div>
                  <div className="text-lg font-black text-white">{stats.metrics.confusion_matrix[0][1].toLocaleString()}</div>
                </div>
                <div className="p-6 bg-rose-500/[0.03] border border-rose-500/10 rounded-bl-xl text-center">
                  <div className="text-[9px] font-bold text-rose-500 uppercase mb-1">False Negative</div>
                  <div className="text-lg font-black text-white">{stats.metrics.confusion_matrix[1][0].toLocaleString()}</div>
                </div>
                <div className="p-6 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-br-xl text-center">
                  <div className="text-[9px] font-bold text-emerald-500 uppercase mb-1">True Positive</div>
                  <div className="text-lg font-black text-white">{stats.metrics.confusion_matrix[1][1].toLocaleString()}</div>
                </div>
              </div>
              <div className="flex gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-500 italic">
                 <Info size={14} className="shrink-0 text-slate-600" />
                 This matrix represents the raw test set distribution used during final model validation.
              </div>
            </div>

            {/* Feature Importance Rankings */}
            <div className="lg:col-span-2 space-y-4">
               <div className="flex items-center gap-2 mb-2">
                 <BarChart size={16} className="text-cyan-400" />
                 <h3 className="text-xs font-bold uppercase tracking-widest text-white/90">Top Influence Vectors</h3>
               </div>
               <div className="glass-panel p-6 space-y-5">
                 {stats.featureImportance.map((feat, i) => (
                   <div key={i} className="space-y-2">
                     <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-slate-400 uppercase tracking-widest">{feat.feature}</span>
                        <span className="font-mono text-cyan-400">{(feat.importance * 100).toFixed(2)}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                           style={{ width: `${feat.importance * 100}%` }}
                        />
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Training Origin Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-white/[0.03] to-transparent border border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                   <CheckCircle2 className="text-emerald-500" />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-white">Validation Set Confirmed</h4>
                   <p className="text-xs text-slate-500">Dataset Origin: {stats.trainedOn}</p>
                </div>
             </div>
             <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Inference Threshold</div>
                <div className="text-sm font-black text-white">{(stats.metrics.threshold * 100).toFixed(1)}%</div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelStats;
