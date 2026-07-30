import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { ChevronDown } from 'lucide-react';

export const Dropdown = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-spacing-sm w-48 bg-bg-surface rounded-radius-md shadow-md border border-slate-300 z-dropdown overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
};
