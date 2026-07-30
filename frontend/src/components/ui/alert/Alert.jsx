import React from 'react';
import { cn } from '../../../lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const alertVariants = {
  success: "bg-status-success/10 text-status-success border-status-success/20",
  warning: "bg-status-warn/10 text-status-warn border-status-warn/20",
  error: "bg-status-error/10 text-status-error border-status-error/20",
  info: "bg-action/10 text-action border-action/20",
};

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

export const Alert = ({ variant = 'info', children, className }) => {
  const Icon = icons[variant];
  return (
    <div
      className={cn(
        "flex items-center gap-spacing-md p-spacing-md rounded-radius-md border",
        alertVariants[variant],
        className
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="text-body-base">{children}</div>
    </div>
  );
};
