import React from 'react';
import EmptyState from './EmptyState';

/**
 * Column definition shape:
 *   { key: string, label: string, render?: (value, row) => ReactNode, className?: string }
 */
const DataTable = ({ columns = [], rows = [], loading = false, error = null, emptyMessage = 'No records found' }) => {
  if (loading && rows.length === 0) {
    return (
      <div className="glass-panel">
        <EmptyState loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel">
        <EmptyState error={error} />
      </div>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <div className="glass-panel">
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden relative">
      {/* Subtle loading overlay when refetching with existing data */}
      {loading && rows.length > 0 && (
        <div className="absolute top-3 right-4 z-10">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
          </span>
        </div>
      )}

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-3.5 text-sm text-slate-300 whitespace-nowrap ${col.className || ''}`}
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
