import React from 'react';
import { fetchAnalytics } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';
import MetricGrid from '../components/MetricGrid';
import ComparisonCard from '../components/ComparisonCard';
import LineChartCard from '../components/LineChartCard';
import EmptyState from '../components/EmptyState';
import { BarChart3, Info } from 'lucide-react';

const Analytics = () => {
  const { data: analytics, loading, error } = useFetch(fetchAnalytics, []);

  if (error) {
    return (
      <EmptyState 
        title="Analytics Offline" 
        message="The statistical aggregation engine is currently unavailable. Ensure the backend services are synchronized." 
        icon="error" 
      />
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
             <BarChart3 className="text-cyan-400" /> Deep Fraud Analytics
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Multi-dimensional behavioral analysis of the fraudulent landscape. Explore volume distributions, risk density, and comparative class baselines.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl text-slate-500 text-xs font-semibold">
           <Info size={14} className="text-cyan-500" />
           Latest 24h Aggregation
        </div>
      </div>

      {loading && !analytics ? (
        <div className="space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 glass-panel animate-pulse bg-white/[0.02] border-white/5" />)}
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 glass-panel animate-pulse bg-white/[0.02] border-white/5" />
              <div className="h-96 glass-panel animate-pulse bg-white/[0.02] border-white/5" />
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-slide-up">
           {/* Summary Grid */}
           <MetricGrid stats={analytics} />

           {/* Visualization Section */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChartCard data={analytics.amountDistribution} />
              <ComparisonCard data={analytics.avgByClass} />
           </div>

           {/* Methodology Insight */}
           <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-600/10 to-transparent border border-cyan-500/10 backdrop-blur-sm">
              <h4 className="text-sm font-bold text-white mb-2">Aggregation Methodology</h4>
              <p className="text-xs leading-relaxed text-slate-400 max-w-3xl">
                The metrics displayed above are derived from an ensemble of historical Kaggle datasets and live inference streams. 
                Distributions are calculated using binned MongoDB aggregations to detect significant deviations in high-amount transaction buckets, 
                where AI model precision is historically most sensitive.
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
