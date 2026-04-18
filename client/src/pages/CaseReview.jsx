import React, { useState, useEffect } from 'react';
import { fetchCases, submitCaseReview } from '../api/apiClient';
import { useFetch } from '../hooks/useFetch';
import CaseCard from '../components/CaseCard';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { Briefcase, Filter } from 'lucide-react';

const CaseReview = () => {
  const { data: initialCases, loading, error, refetch } = useFetch(fetchCases, []);
  const [localCases, setLocalCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  // Sync initial fetch to local state for optimistic updates
  useEffect(() => {
    if (initialCases) {
      setLocalCases(initialCases);
    }
  }, [initialCases]);

  const handleReviewTrigger = (caseId, action) => {
    setSelectedCase(caseId);
    setActiveAction(action);
    setIsModalOpen(true);
  };

  const handleConfirmResolution = async (notes) => {
    const caseId = selectedCase;
    const label = activeAction;

    // Optimistic Update
    setLocalCases(prev => prev.map(c => 
      c.id === caseId 
        ? { ...c, reviewed: true, reviewLabel: label, notes: notes } 
        : c
    ));
    
    setIsModalOpen(false);

    try {
      await submitCaseReview(caseId, { 
        label: label, 
        notes: notes 
      });
      // Verification sync via background refetch
      refetch();
    } catch (err) {
      console.error("Resolution failed:", err);
      // Rollback on absolute failure
      refetch();
    }
  };

  const pendingCount = localCases.filter(c => !c.reviewed).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
             <Briefcase size={12} className="text-cyan-400" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Security Operations Console</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Case Review Queue</h1>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            Investigate flagged anomalies and finalize fraud resolutions. Your actions directly update the global threat intelligence baseline.
          </p>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Open Investigations</div>
              <div className="text-2xl font-black text-white">{pendingCount} <span className="text-sm font-medium text-slate-500 opacity-60">/ {localCases.length}</span></div>
           </div>
           <button className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-slate-500 hover:text-white transition-all">
              <Filter size={18} />
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading && localCases.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="h-64 glass-panel animate-pulse bg-white/[0.02] border-white/5" />
           ))}
        </div>
      ) : error ? (
        <EmptyState 
           title="Connection Error" 
           message="We couldn't reach the intelligence server. Please ensure the backend services are running." 
           icon="error"
        />
      ) : localCases.length === 0 ? (
        <EmptyState 
          title="Queue Empty" 
          message="No anomalous cases require manual review at this moment. Good job!" 
          icon="success" 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localCases.map((caseData) => (
            <CaseCard 
              key={caseData.id} 
              caseData={caseData} 
              onReview={handleReviewTrigger}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal Overlay */}
      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmResolution}
        actionType={activeAction}
      />
    </div>
  );
};

export default CaseReview;
