import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchPaginatedTransactions } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';
import DataTable from '../components/DataTable';
import TableToolbar from '../components/TableToolbar';

// ─── Column definitions (purely normalized field names) ─────────────────────
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
    label: 'Time',
    render: (val) => {
      const d = new Date(val);
      return isNaN(d) ? String(val) : d.toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' });
    },
  },
  {
    key: 'amount',
    label: 'Amount',
    render: (val) =>
      `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    className: 'text-right',
  },
  {
    key: 'isFraud',
    label: 'Status',
    render: (val) =>
      val ? (
        <span className="inline-flex items-center gap-1.5 text-red-400 font-semibold text-xs">
          <AlertCircle size={14} /> Fraud
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-emerald-400/70 text-xs">
          <CheckCircle size={14} /> Legit
        </span>
      ),
  },
  {
    key: 'fraudProbability',
    label: 'Risk %',
    render: (val) => {
      if (val == null) return <span className="text-slate-600">—</span>;
      const pct = (val * 100).toFixed(1);
      const color = val > 0.7 ? 'text-red-400' : val > 0.3 ? 'text-amber-400' : 'text-emerald-400/60';
      return <span className={`font-semibold text-xs ${color}`}>{pct}%</span>;
    },
    className: 'text-right',
  },
  {
    key: 'reviewed',
    label: 'Reviewed',
    render: (val) =>
      val ? (
        <span className="text-xs text-cyan-400/80">Yes</span>
      ) : (
        <span className="text-xs text-slate-600">No</span>
      ),
  },
];

// ─── CSV helper ─────────────────────────────────────────────────────────────
const exportCSV = (transactions) => {
  const headers = ['ID', 'Time', 'Amount', 'Is Fraud', 'Fraud Probability', 'Reviewed', 'Review Label', 'Notes'];
  const csvRows = [
    headers.join(','),
    ...transactions.map((tx) =>
      [
        `"${tx.id}"`,
        tx.time,
        tx.amount,
        tx.isFraud,
        tx.fraudProbability ?? '',
        tx.reviewed,
        `"${tx.reviewLabel || ''}"`,
        `"${(tx.notes || '').replace(/"/g, '""')}"`,
      ].join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `transactions_page_export.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

// ─── Page Component ─────────────────────────────────────────────────────────
const TransactionHistory = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [filter, setFilter] = useState('all');

  const fetcher = useCallback(
    () => fetchPaginatedTransactions({ page, limit, filter }),
    [page, limit, filter]
  );

  const { data, loading, error } = useFetch(fetcher, [page, limit, filter]);

  const transactions = data?.transactions || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;
  const fraudTotal = data?.fraudTotal || 0;

  const handleFilterChange = (val) => {
    setFilter(val);
    setPage(1); // reset to first page on filter change
  };

  const handleLimitChange = (val) => {
    setLimit(val);
    setPage(1); // reset to first page on limit change
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Transaction History</h1>
        <p className="text-slate-400 mt-2">
          Browse, filter, and export transaction records with server-side pagination.
        </p>
      </div>

      {/* Quick summary stats */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-slate-500">
          Total: <span className="text-white font-semibold">{total.toLocaleString()}</span>
        </span>
        <span className="text-slate-500">
          Flagged: <span className="text-red-400 font-semibold">{fraudTotal.toLocaleString()}</span>
        </span>
        <span className="text-slate-500">
          Page <span className="text-white font-semibold">{page}</span> of{' '}
          <span className="text-white font-semibold">{totalPages}</span>
        </span>
      </div>

      {/* Toolbar */}
      <TableToolbar
        filter={filter}
        onFilterChange={handleFilterChange}
        limit={limit}
        onLimitChange={handleLimitChange}
        onExport={() => exportCSV(transactions)}
      />

      {/* Data Table */}
      <DataTable
        columns={COLUMNS}
        rows={transactions}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyMessage="No transactions match the current filter."
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            id="pagination-prev"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="text-sm text-slate-500">
            Page <span className="text-white font-semibold">{page}</span> / {totalPages}
          </span>

          <button
            id="pagination-next"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
