import React, { useState } from 'react';
import { fetchShapExplanation } from '../api/apiClient';
import PredictionForm from '../components/PredictionForm';
import RiskGauge from '../components/RiskGauge';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import JsonDebugPanel from '../components/JsonDebugPanel';
import EmptyState from '../components/EmptyState';
import { ShieldCheck, Zap } from 'lucide-react';

const CheckTransaction = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleManualCheck = async (features) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShapExplanation(features);
      setResult(data);
    } catch (err) {
      setError('The AI service is currently unavailable. Ensure the Flask backend is operational.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-cyan-400" /> Manual Transaction Check
          </h1>
          <p className="text-slate-400 mt-2">
            Verify specific transaction parameters against our AI model to uncover hidden fraud markers and risk probabilities.
          </p>
        </div>
      </div>

      {/* Main Form Panel */}
      <div className="glass-panel p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] -mr-32 -mt-32 rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-700" />
        <PredictionForm onSubmit={handleManualCheck} loading={loading} />
      </div>

      {/* Results Display Area */}
      {error && (
        <EmptyState 
           title="Prediction Service Error" 
           message={error} 
           icon="error"
        />
      )}

      {!result && !loading && !error && (
        <div className="glass-panel p-12 border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Zap className="text-slate-600" />
            </div>
            <h3 className="text-white font-bold mb-1">Awaiting Parameters</h3>
            <p className="text-slate-500 text-sm max-w-[280px]">Enter transaction data above to trigger a real-time risk assessment.</p>
        </div>
      )}

      {loading && (
        <div className="space-y-6">
           {/* Skeleton Loaders */}
           <div className="h-64 glass-panel animate-pulse bg-white/[0.02] border-white/5" />
           <div className="h-32 glass-panel animate-pulse bg-white/[0.02] border-white/5" />
        </div>
      )}

      {result && !loading && (
        <div className="animate-slide-up space-y-8">
          {/* Top Level Summary Card */}
          <div className="glass-panel p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-white/10 shadow-2xl shadow-black/40">
            <div>
               <h2 className="text-xl font-bold text-white mb-2">Analysis Complete</h2>
               <p className="text-slate-400 text-sm leading-relaxed mb-6">
                 This transaction was processed through our neural classifier. The probability score was derived from the features provided alongside 
                 dataset-wide feature distributions.
               </p>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Inference Engine</div>
                    <div className="text-xs font-semibold text-white">XGBoost-Forest</div>
                 </div>
                 <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Confidence Score</div>
                    <div className="text-xs font-semibold text-white">High</div>
                 </div>
               </div>
            </div>

            <RiskGauge probability={result.fraudProbability} />
          </div>

          {/* Explainability Section */}
          <ExplainabilityPanel 
            shapValues={result.shapValues} 
            fraudProbability={result.fraudProbability}
          />

          {/* Technical Debug Section */}
          <JsonDebugPanel data={result} />
        </div>
      )}
    </div>
  );
};

export default CheckTransaction;
