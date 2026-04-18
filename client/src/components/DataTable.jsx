import React from 'react';
import EmptyState from './EmptyState';

/**
 * Column definition shape:
 *   { key: string, label: string, render?: (value, row) => ReactNode, className?: string }
 */
const DataTable = ({ 
  columns = [], 
  rows = [], 
  loading = false, 
  error = null, 
  emptyMessage = 'No records found',
  onRetry = null
}) => {
  if (loading && rows.length === 0) {
    return (
      <div className="glass-panel border-white/5 overflow-hidden">
        <EmptyState loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel border-white/5 overflow-hidden">
        <EmptyState error={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <div className="glass-panel border-white/5 overflow-hidden">
        <EmptyState message={emptyMessage} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="glass-panel border-white/5 overflow-hidden relative shadow-2xl shadow-black/20">
      {/* Subtle loading overlay when refetching with existing data */}
      {loading && rows.length > 0 && (
        <div className="absolute top-3 right-4 z-10">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
          </span>
        </div>
      )}

      {/* A11y: Wrapping table in a focusable region with horizontal scroll support */}
      <div 
        className="overflow-x-auto custom-scrollbar"
        tabIndex="0"
        role="region"
        aria-label="Transaction Ledger Table"
      >
        <table className="w-full text-left min-w-[800px] border-separate border-spacing-0">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 border-b border-white/5 ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {rows.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="group hover:bg-white/[0.02] transition-colors focus-within:bg-white/[0.04] outline-none"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 py-4 text-sm text-slate-300 font-medium ${col.className || ''}`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
