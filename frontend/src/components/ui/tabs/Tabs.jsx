import React, { useState } from 'react';
import { cn } from '../../../lib/utils';

export const Tabs = ({ tabs, children }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div>
      <div className="flex border-b border-slate-300 mb-spacing-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-spacing-md py-spacing-sm text-body-base font-semibold border-b-2 transition-transition-default",
              activeTab === tab.id
                ? "border-action text-action"
                : "border-transparent text-text-muted hover:text-text-main"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{children[activeTab]}</div>
    </div>
  );
};
