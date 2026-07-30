import React from 'react';
import { cn } from '../../../lib/utils';

export const EmptyState = ({ icon: Icon, title, description, action, className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-spacing-2xl text-center", className)}>
      {Icon && <Icon className="w-12 h-12 text-slate-400 mb-spacing-md" />}
      <h3 className="text-h3 text-text-main mb-spacing-sm">{title}</h3>
      <p className="text-body-base text-text-muted mb-spacing-lg max-w-sm">{description}</p>
      {action}
    </div>
  );
};
