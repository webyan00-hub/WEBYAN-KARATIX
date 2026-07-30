import React from 'react';
import { cn } from '../../../lib/utils';

export const Divider = ({ className, orientation = 'horizontal' }) => {
  return (
    <div
      className={cn(
        "bg-slate-300",
        orientation === 'horizontal' ? "w-full h-px" : "w-px h-full",
        className
      )}
    />
  );
};
