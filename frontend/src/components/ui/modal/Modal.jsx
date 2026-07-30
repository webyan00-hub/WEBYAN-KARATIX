import React from 'react';
import { cn } from '../../../lib/utils';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-spacing-md bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-bg-surface rounded-radius-lg shadow-lg w-full max-w-lg p-spacing-xl relative">
        <button onClick={onClose} className="absolute top-spacing-md right-spacing-md text-text-muted hover:text-text-main">
          <X className="w-5 h-5" />
        </button>
        {title && <h2 className="text-h2 mb-spacing-lg">{title}</h2>}
        {children}
      </div>
    </div>
  );
};
