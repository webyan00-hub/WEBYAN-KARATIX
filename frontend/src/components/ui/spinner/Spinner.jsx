import React from 'react';
import { cn } from '../../../lib/utils';

export const Spinner = ({ className, size = 'md' }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "border-2 border-slate-200 border-t-action rounded-full animate-spin",
        sizes[size],
        className
      )}
    />
  );
};
