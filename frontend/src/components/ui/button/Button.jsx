import React from 'react';
import { cn } from '../../../lib/utils';

const buttonVariants = {
  primary: "bg-action text-white hover:opacity-90",
  secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300",
  outline: "border-2 border-action text-action hover:bg-action/10",
  danger: "bg-status-error text-white hover:opacity-90",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = React.forwardRef(({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  isDisabled = false, 
  className, 
  children, 
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "rounded-radius-md font-semibold transition-transition-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = "Button";
