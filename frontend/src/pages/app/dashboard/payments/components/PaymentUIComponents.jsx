import React from 'react';

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-karatix-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'neutral' }) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    rose: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
    neutral: 'bg-karatix-code-bg text-karatix-text ring-1 ring-inset ring-karatix-border'
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center ${variants[variant] || variants.neutral}`}>
      {children}
    </span>
  );
}
