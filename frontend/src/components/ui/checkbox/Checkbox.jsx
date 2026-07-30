import React from 'react';
import { cn } from '../../../lib/utils';

export const Checkbox = React.forwardRef(({ 
  className, 
  ...props 
}, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "w-4 h-4 rounded-radius-sm border-slate-300 text-action focus:ring-action focus:ring-offset-2 transition-transition-default disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";
