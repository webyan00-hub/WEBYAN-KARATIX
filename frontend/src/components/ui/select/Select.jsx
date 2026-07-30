import React from 'react';
import { cn } from '../../../lib/utils';

export const Select = React.forwardRef(({ 
  label, 
  error, 
  className, 
  children, 
  ...props 
}, ref) => {
  return (
    <div className="flex flex-col gap-spacing-sm w-full">
      {label && (
        <label className="text-body-small font-semibold text-text-main">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          "w-full px-spacing-md py-spacing-sm rounded-radius-md border border-slate-300 text-body-base bg-white transition-transition-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-status-error focus-visible:ring-status-error",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span className="text-caption text-status-error">{error}</span>
      )}
    </div>
  );
});

Select.displayName = "Select";
