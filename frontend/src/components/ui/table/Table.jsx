import React from 'react';
import { cn } from '../../../lib/utils';

export const Table = ({ headers, children }) => {
  return (
    <div className="overflow-x-auto rounded-radius-md border border-slate-300">
      <table className="w-full text-left text-body-small">
        <thead className="bg-slate-50 border-b border-slate-300">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-spacing-md py-spacing-sm font-semibold text-text-muted">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">{children}</tbody>
      </table>
    </div>
  );
};
