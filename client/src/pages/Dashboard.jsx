import React, { useEffect } from 'react';
import { Activity, ShieldAlert, List } from 'lucide-react';
import { fetchStats, fetchPaginatedTransactions } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';
import StatCard from '../components/StatCard';
import LiveFeedItem from '../components/LiveFeedItem';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  // Fetch summary stats, refetches only on mount
  const { 
    data: statsData, 
    loading: statsLoading, 
    error: statsError 
  } = useFetch(fetchStats, []);

  // Fetch paginated transactions to simulate a live feed
  const fetchFeed = () => fetchPaginatedTransactions({ limit: 15 });
  const { 
    data: feedData, 
    loading: feedLoading, 
    error: feedError, 
    refetch: refetchFeed 
  } = useFetch(fetchFeed, []);

  // Set up polling interval for the live feed (e.g., every 10 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetchFeed();
    }, 10000); // 10 seconds
    return () => clearInterval(intervalId);
  }, [refetchFeed]);

  const transactions = feedData?.transactions || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-400 mt-2">Real-time fraud intelligence and system performance.</p>
      </div>

      {/* Dashboard Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Risk Exposure" 
          value={`${statsData?.globalRiskScore || 0}%`} 
          icon={AlertCircle} 
          trend="+2.1%" 
          colorClass="from-rose-500 to-red-600"
          loading={statsLoading}
        />
        <StatCard 
          title="Total Volume" 
          value={statsData?.totalTransactions?.toLocaleString() || '0'} 
          icon={CreditCard} 
          colorClass="from-blue-500 to-indigo-600"
          loading={statsLoading}
        />
        <StatCard 
          title="Fraud Detected" 
          value={statsData?.fraudsDetected?.toLocaleString() || '0'} 
          icon={Zap} 
          colorClass="from-amber-500 to-orange-600"
          loading={statsLoading}
        />
        <StatCard 
          title="Live Monitoring" 
          value={statsData?.totalLive?.toLocaleString() || '0'} 
          icon={Activity} 
          colorClass="from-emerald-500 to-teal-600"
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Threat Feed */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> Live Threat Feed
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase">System Active</span>
            </div>
          </div>

          <div className="glass-panel flex-1 min-h-[400px] flex flex-col overflow-hidden relative">
            <EmptyState 
              loading={feedLoading && transactions.length === 0} 
              error={feedError || statsError} 
              onRetry={() => { refetchFeed(); statsRefetch(); }}
              message="Awaiting live transaction stream..."
            />
            
            {transactions.length > 0 && (
              <div className="divide-y divide-white/[0.03] overflow-y-auto max-h-[600px] custom-scrollbar">
                {transactions.map((tx) => (
                  <LiveFeedItem key={tx.id} transaction={tx} />
                ))}
              </div>
            )}

            {/* Subtle loading overlay for polling updates */}
            {feedLoading && transactions.length > 0 && (
                 <div className="absolute top-2 right-4">
                     <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                     </span>
                 </div>
            )}
          </div>
        </div>

        {/* Analytics Placeholder (Chart Area) */}
        <div className="lg:col-span-2 glass-panel flex flex-col min-h-[400px]">
           <div className="p-5 border-b border-white/10">
            <h2 className="text-lg font-bold text-white tracking-wide">Threat Analytics Preview</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
             <Activity className="w-16 h-16 mb-4 opacity-50 text-cyan-400" />
             <h3 className="text-xl font-semibold text-slate-400 mb-2">Analytics Engine Initializing</h3>
             <p className="max-w-md">
                 Detailed charts and multi-dimensional analysis widgets will be integrated here into the UI stream soon.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
