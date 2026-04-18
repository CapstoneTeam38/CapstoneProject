import React from 'react';
import { ShieldCheck } from 'lucide-react';

const BrandMark = () => (
  <div className="flex items-center gap-3 px-6 py-5">
    <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
      <ShieldCheck size={18} className="text-white" />
    </div>
    <div>
      <h1 className="text-base font-extrabold tracking-widest uppercase text-white/90 leading-none">
        NeuralGuard
      </h1>
      <span className="text-[9px] uppercase tracking-[0.25em] text-cyan-400/60 font-semibold">
        AI Fraud Intel
      </span>
    </div>
  </div>
);

export default BrandMark;
