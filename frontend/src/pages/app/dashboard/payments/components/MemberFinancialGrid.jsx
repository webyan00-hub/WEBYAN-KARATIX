import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export function MemberFinancialGrid({ payments, year, onPaymentClick }) {
  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
  ];

  const currentMonthIndex = new Date().getMonth();

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {months.map((month, index) => {
        const monthStr = `${year}-${String(index + 1).padStart(2, '0')}`;
        const payment = payments.find(p => p.billing_period === monthStr);
        const isPaid = !!payment;
        const isCurrent = index === currentMonthIndex;

        let status = 'unpaid';
        if (isPaid) status = 'paid';
        else if (isCurrent) status = 'current';

        const config = {
          paid: {
            label: 'Payé',
            icon: CheckCircle,
            className: 'border-emerald-100 bg-emerald-50 text-emerald-700',
            badge: 'bg-emerald-100 text-emerald-700'
          },
          current: {
            label: 'En cours',
            icon: Clock,
            className: 'border-blue-100 bg-blue-50 text-blue-700',
            badge: 'bg-blue-100 text-blue-700'
          },
          unpaid: {
            label: 'Impayé',
            icon: XCircle,
            className: 'border-slate-100 bg-white text-slate-500',
            badge: 'bg-slate-100 text-slate-500'
          }
        }[status];

        const Icon = config.icon;

        return (
          <button
            key={month}
            onClick={() => isPaid && onPaymentClick(payment)}
            disabled={!isPaid}
            className={`min-h-[88px] rounded-2xl border p-3 text-left shadow-sm transition-all ${config.className} ${isPaid ? 'hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-base font-black text-slate-950">{month}</span>
              <Icon className="h-4 w-4 shrink-0" />
            </div>
            <span className={`mt-4 inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${config.badge}`}>
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
