import React from 'react';
import { cn } from '../../../lib/utils';

const badgeVariants = {
  neutral: "bg-slate-100 text-slate-800",
  success: "bg-status-success/10 text-status-success",
  warning: "bg-status-warn/10 text-status-warn",
  danger: "bg-status-error/10 text-status-error",
};

export const Badge = ({ variant = 'neutral', className, children, ...props }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-radius-sm text-caption font-semibold",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
