import React, { useState, useCallback, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  BarChart3,
  Database,
  X,
} from 'lucide-react';
import { uploadDatasetFile } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';

const UploadDataset = () => {
  const { user } = useAuth();
  const storageKey = `lastUploadResult_${user?._id || 'anonymous'}`;

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  /* ── Drag & Drop handlers ─────────────────────────────────────────────── */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setError(null);
      setResults(null);
    } else {
      setError('Please upload a valid .csv file.');
    }
  }, []);

  const handleBrowse = useCallback((e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setResults(null);
    }
  }, []);

  /* ── Upload logic ─────────────────────────────────────────────────────── */
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResults(null);
    try {
      const data = await uploadDatasetFile(file);
      setResults(data);
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (err) {
      const msg =
        err.response?.data?.error || err.message || 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
    setError(null);
    localStorage.removeItem(storageKey);
    if (inputRef.current) inputRef.current.value = '';
  };

  /* ── Helper: format file size ─────────────────────────────────────────── */
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Dataset</h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload a CSV file of transactions to run through the fraud detection model.
        </p>
      </div>

      {/* ── Drop Zone ─────────────────────────────────────────────────────── */}
      {!results && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Drop CSV file here or click to browse"
          className={`
            glass-panel relative cursor-pointer group
            flex flex-col items-center justify-center gap-4
            rounded-2xl border-2 border-dashed
            py-16 px-6 transition-all duration-300
            ${
              dragOver
                ? 'border-cyan-400 bg-cyan-500/[0.06] shadow-[0_0_40px_rgba(6,182,212,0.15)]'
                : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
            }
          `}
        >
          {/* Animated icon */}
          <div
            className={`
              w-16 h-16 rounded-2xl flex items-center justify-center
              transition-all duration-300
              ${
                dragOver
                  ? 'bg-cyan-500/20 scale-110'
                  : 'bg-white/[0.06] group-hover:bg-white/10 group-hover:scale-105'
              }
            `}
          >
            <UploadCloud
              size={30}
              className={`transition-colors duration-300 ${
                dragOver ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
              }`}
            />
          </div>

          <div className="text-center">
            <p className="text-slate-200 font-medium">
              {dragOver ? 'Drop your file here' : 'Drag & drop your CSV file'}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              or <span className="text-cyan-400 underline underline-offset-2">browse files</span>
            </p>
          </div>
          <p className="text-slate-600 text-[11px]">
            Supports .csv files •  Must include an "Amount" column
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleBrowse}
            className="hidden"
            aria-hidden="true"
          />
        </div>
      )}

      {/* ── Selected File Card ────────────────────────────────────────────── */}
      {file && !results && (
        <div className="glass-panel rounded-xl p-4 flex items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
            <FileSpreadsheet size={20} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            aria-label="Remove file"
            className="text-slate-500 hover:text-red-400 transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Error Banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
          <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-300 font-medium">Upload Error</p>
            <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="text-red-400/60 hover:text-red-300 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Upload Button ─────────────────────────────────────────────────── */}
      {file && !results && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`
            w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide
            flex items-center justify-center gap-2
            transition-all duration-300
            ${
              uploading
                ? 'bg-cyan-700/40 text-cyan-300/60 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.01] active:scale-[0.99]'
            }
          `}
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing transactions…
            </>
          ) : (
            <>
              <UploadCloud size={18} />
              Run Fraud Analysis
            </>
          )}
        </button>
      )}

      {/* ── Results Panel ─────────────────────────────────────────────────── */}
      {results && (
        <div className="space-y-5 animate-fade-in">
          {/* Success header */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 size={20} className="text-emerald-400" />
            <div>
              <p className="text-sm text-emerald-300 font-semibold">Analysis Complete</p>
              <p className="text-xs text-emerald-400/70 mt-0.5">
                Your dataset has been evaluated by the fraud detection model.
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Rows */}
            <div className="glass-panel rounded-xl p-5 flex flex-col items-center text-center group hover:bg-white/[0.04] transition-colors">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Database size={20} className="text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {results.totalRows?.toLocaleString() ?? '—'}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">
                Total Rows
              </p>
            </div>

            {/* Frauds Detected */}
            <div className="glass-panel rounded-xl p-5 flex flex-col items-center text-center group hover:bg-white/[0.04] transition-colors">
              <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShieldAlert size={20} className="text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {results.fraudsDetected?.toLocaleString() ?? '—'}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">
                Frauds Detected
              </p>
            </div>

            {/* Fraud Rate */}
            <div className="glass-panel rounded-xl p-5 flex flex-col items-center text-center group hover:bg-white/[0.04] transition-colors">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BarChart3 size={20} className="text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {results.fraudRate != null ? `${results.fraudRate}%` : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">
                Fraud Rate
              </p>
            </div>
          </div>

          {/* Fraud-rate severity bar */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Threat Level</span>
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  (results.fraudRate ?? 0) > 10
                    ? 'text-red-400'
                    : (results.fraudRate ?? 0) > 3
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {(results.fraudRate ?? 0) > 10
                  ? 'High Risk'
                  : (results.fraudRate ?? 0) > 3
                  ? 'Moderate'
                  : 'Low Risk'}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  (results.fraudRate ?? 0) > 10
                    ? 'bg-gradient-to-r from-red-500 to-rose-400'
                    : (results.fraudRate ?? 0) > 3
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-emerald-500 to-green-400'
                }`}
                style={{ width: `${Math.min(results.fraudRate ?? 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Upload another */}
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl font-medium text-sm text-slate-400 border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/[0.03] transition-all duration-200"
          >
            Upload Another Dataset
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadDataset;
