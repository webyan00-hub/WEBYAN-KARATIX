import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../../lib/utils';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, variant = 'info') => {
    const id = Date.now();
    setToasts([...toasts, { id, message, variant }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id) => {
    setToasts(toasts.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-spacing-xl right-spacing-xl z-toast flex flex-col gap-spacing-sm">
        {toasts.map(toast => (
          <div key={toast.id} className={cn(
            "flex items-center gap-spacing-md p-spacing-md rounded-radius-md border shadow-md bg-bg-surface",
            toast.variant === 'success' ? "border-status-success text-status-success" : "border-status-error text-status-error"
          )}>
            {toast.variant === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
            <button onClick={() => removeToast(toast.id)}><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
