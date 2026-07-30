import React from 'react';
import { cn } from '../../../lib/utils';

export const Radio = React.forwardRef(({ 
  className, 
  ...props 
}, ref) => {
  return (
    <input
      type="radio"
      ref={ref}
      className={cn(
        "w-4 h-4 border-slate-300 text-action focus:ring-action focus:ring-offset-2 transition-transition-default disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
});

Radio.displayName = "Radio";
