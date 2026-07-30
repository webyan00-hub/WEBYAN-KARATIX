import React from 'react';
import { cn } from '../../../lib/utils';

export const Card = ({ children, className, variant = 'default' }) => {
  const variants = {
    default: "bg-bg-surface border border-slate-300 rounded-radius-md shadow-sm",
    elevated: "bg-bg-surface border border-slate-300 rounded-radius-md shadow-md",
    interactive: "bg-bg-surface border border-slate-300 rounded-radius-md shadow-sm transition-transition-default hover:shadow-md cursor-pointer",
  };

  return (
    <div className={cn(variants[variant], "p-spacing-md", className)}>
      {children}
    </div>
  );
};
