import React, { useState } from 'react';
import { cn } from '../../../lib/utils';

export const Tooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative flex items-center" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className="absolute bottom-full mb-spacing-sm px-spacing-sm py-spacing-xs bg-slate-900 text-white text-caption rounded-radius-sm z-tooltip whitespace-nowrap">
          {content}
        </div>
      )}
    </div>
  );
};
