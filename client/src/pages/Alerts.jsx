import React, { useMemo } from 'react';
import { fetchPaginatedTransactions, fetchStats } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';
import DataTable from '../components/DataTable';
import AlertBadge from '../components/AlertBadge';
import { AlertCircle } from 'lucide-react';

const COLUMNS = [
  {
    key: 'id',
    label: 'Transaction ID',
    render: (val) => (
      <span className="font-mono text-xs text-slate-400 truncate max-w-[140px] inline-block" title={val}>
        {val}
      </span>
    ),
  },
  {
    key: 'time',
    label: 'Time Detected',
    render: (val) => {
      const d = new Date(val);
      return isNaN(d) ? String(val) : d.toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' });
    },
  },
  {
    key: 'amount',
    label: 'Risk Exposure',
    render: (val) =>
      `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    className: 'text-right',
  },
  {
    key: 'fraudProbability',
    label: 'Risk Probability',
    render: (val) => {
      if (val == null) return <span className="text-slate-600">—</span>;
      const pct = (val * 100).toFixed(1);
      // Alerts are inherently high risk, apply warning stylization natively
      return (
        <div className="flex items-center justify-end gap-2 text-red-400 font-bold bg-red-400/[0.05] px-2 py-0.5 rounded border border-red-500/10 w-fit ml-auto">
           {pct}% <AlertCircle size={12} className="opacity-80" />
        </div>
      );
    },
    className: 'text-right',
  },
  {
    key: 'reviewed',
    label: 'Investigation Action Required',
    render: (val) =>
      val ? (
        <span className="text-xs font-medium px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded">Reviewed</span>
      ) : (
        <span className="text-xs font-semibold px-2 py-1 bg-amber-500/10 text-amber-400 rounded animate-pulse">Pending Review</span>
      ),
  },
];

const Alerts = () => {
  // Grab the overall global stats primarily just to fuel the active badge count accurately
  const { data: statsData } = useFetch(fetchStats, []);

  // Fetch only anomalies natively. We fetch a broader subset locally (e.g. 100)
  // to ensure aggressive real-time sorting hits true high-priority records
  const { data: alertData, loading, error } = useFetch(
    () => fetchPaginatedTransactions({ page: 1, limit: 100, filter: 'fraud' }),
    []
  );

  // Derive the active sorted array on the frontend
  const activeAlerts = useMemo(() => {
    const records = alertData?.transactions || [];
    
    // Sort identically off the normalized `fraudProbability` float (descending)
    return [...records].sort((a, b) => (b.fraudProbability || 0) - (a.fraudProbability || 0));
  }, [alertData]);

  const activeFraudCount = statsData?.fraudsDetected || 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Structural Header Mapping */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
               Live Threat Alerts
           </h1>
           <p className="text-slate-400 mt-2 max-w-lg">
             Immediate operational queuing exclusively mapped to high-risk transactions requiring active analytical investigation or manual clearance.
           </p>
        </div>
        
        {/* Dynamic badge mapping */}
        <div className="pt-1">
           <AlertBadge count={activeFraudCount} label="Anomalies Found" />
        </div>
      </div>

      {/* Main Table Interface (reuses the existing flexible DataTable prop architecture) */}
      <div className="shadow-2xl shadow-red-500/5">
        <DataTable
          columns={COLUMNS}
          rows={activeAlerts}
          loading={loading}
          error={error}
          onRetry={refetch}
          emptyMessage="System cleared! No high-risk threats detected currently."
        />
      </div>
    </div>
  );
};

export default Alerts;
