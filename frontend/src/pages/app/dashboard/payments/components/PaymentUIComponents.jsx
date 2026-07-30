import React from 'react';

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'neutral' }) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    rose: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
    neutral: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center ${variants[variant] || variants.neutral}`}>
      {children}
    </span>
  );
}
