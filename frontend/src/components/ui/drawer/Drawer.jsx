import React from 'react';
import { cn } from '../../../lib/utils';
import { X } from 'lucide-react';

export const Drawer = ({ isOpen, onClose, title, children, position = 'right' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-drawer flex">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "bg-bg-surface h-full w-full max-w-sm shadow-lg p-spacing-xl relative transition-transition-slow",
        position === 'right' ? "ml-auto" : "mr-auto"
      )}>
        <button onClick={onClose} className="absolute top-spacing-md right-spacing-md text-text-muted hover:text-text-main">
          <X className="w-5 h-5" />
        </button>
        {title && <h2 className="text-h2 mb-spacing-lg">{title}</h2>}
        {children}
      </div>
    </div>
  );
};
