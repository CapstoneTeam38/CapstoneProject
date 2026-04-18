import React, { useState } from 'react';
import { Send, Calculator } from 'lucide-react';

const PredictionForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    amount: '',
    time: '1',
    v14: '0'
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!formData.amount || isNaN(formData.amount)) newErrors.amount = "Valid amount is required";
    if (!formData.time || isNaN(formData.time)) newErrors.time = "Numeric time offset is required";
    if (!formData.v14 || isNaN(formData.v14)) newErrors.v14 = "Numeric V14 component required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        amount: parseFloat(formData.amount),
        time: parseFloat(formData.time),
        v14: parseFloat(formData.v14)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
             Transaction Amount ($)
          </label>
          <input
            type="text"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g. 99.99"
            className={`w-full bg-white/[0.03] border ${errors.amount ? 'border-rose-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all`}
          />
          {errors.amount && <p className="text-[10px] text-rose-400 font-medium">{errors.amount}</p>}
        </div>

        {/* Time Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
             Time Offset (Seconds)
          </label>
          <input
            type="text"
            name="time"
            value={formData.time}
            onChange={handleChange}
            placeholder="Seconds since epoch start"
            className={`w-full bg-white/[0.03] border ${errors.time ? 'border-rose-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all`}
          />
          {errors.time && <p className="text-[10px] text-rose-400 font-medium">{errors.time}</p>}
        </div>

        {/* V14 Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
             Anonymized Component V14
          </label>
          <input
            type="text"
            name="v14"
            value={formData.v14}
            onChange={handleChange}
            placeholder="Model variance factor"
            className={`w-full bg-white/[0.03] border ${errors.v14 ? 'border-rose-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all`}
          />
          {errors.v14 && <p className="text-[10px] text-rose-400 font-medium">{errors.v14}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full relative group bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98] overflow-hidden"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Calculator size={18} className="text-cyan-200" />
            <span>Generate Risk Prediction</span>
          </>
        )}
        
        {/* Subtle Shine Effect */}
        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
      </button>
    </form>
  );
};

export default PredictionForm;
