import React, { useState } from 'react';
import { X, MessageSquare, ShieldCheck, ShieldAlert } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, actionType }) => {
  const [notes, setNotes] = useState('');
  
  if (!isOpen) return null;

  const isFraud = actionType === 'FRAUD';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md p-8 relative shadow-2xl shadow-black">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isFraud ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
            {isFraud ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isFraud ? 'Confirm Fraudulent Activity' : 'Mark as False Positive'}
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            {isFraud 
              ? 'This action will escalate the transaction and mark it as confirmed fraud in the system.' 
              : 'This action will dismiss the alert and return the transaction to the legitimate ledger.'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <MessageSquare size={12} /> Analyst Investigation Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide evidence or reasoning for this resolution..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white h-32 focus:outline-none focus:border-cyan-500/50 resize-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-white/5 bg-white/[0.02] text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(notes);
                setNotes('');
              }}
              className={`w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] ${isFraud ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'}`}
            >
              Finalize Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
