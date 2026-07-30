import React from 'react';
import { cn } from '../../../lib/utils';

export const Avatar = ({ src, alt, fallback, size = 'md', className }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-200 text-text-muted", sizes[size], className)}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-caption uppercase">{fallback}</span>
      )}
    </div>
  );
};
