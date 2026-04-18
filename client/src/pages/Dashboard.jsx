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

      {/* Stats Grid */}
      {statsError ? (
        <div className="glass-panel p-6"><EmptyState error={statsError} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Transactions"
            value={statsLoading ? '...' : statsData?.totalTransactions}
            icon={List}
            colorClass="from-blue-500 to-indigo-600"
            formatting="compact"
            trend={statsLoading ? null : "+12% avg"}
          />
          <StatCard
            title="Frauds Detected"
            value={statsLoading ? '...' : statsData?.fraudsDetected}
            icon={ShieldAlert}
            colorClass="from-rose-500 to-red-600"
            formatting="compact"
            trend={statsLoading ? null : "Urgent"}
          />
          <StatCard
            title="Global Risk Score"
            value={statsLoading ? '...' : (statsData?.globalRiskScore ? statsData.globalRiskScore / 100 : 0)}
            icon={Activity}
            colorClass="from-amber-500 to-orange-600"
            formatting="percentage"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Live Feed List */}
        <div className="lg:col-span-1 glass-panel flex flex-col overflow-hidden h-[600px]">
          <div className="p-5 border-b border-white/10 bg-white/[0.02]">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Feed
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {feedLoading && transactions.length === 0 ? (
              <EmptyState loading={true} />
            ) : feedError ? (
              <EmptyState error={feedError} />
            ) : transactions.length === 0 ? (
              <EmptyState message="No transactions streaming yet." />
            ) : (
              <div className="flex flex-col">
                {transactions.map(tx => (
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
