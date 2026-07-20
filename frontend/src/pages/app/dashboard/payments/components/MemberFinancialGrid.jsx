import React from 'react';
import { Badge } from './PaymentUIComponents';

export function MemberFinancialGrid({ payments, year, onPaymentClick }) {
  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
  ];

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
      {months.map((month, index) => {
        const monthStr = `${year}-${String(index + 1).padStart(2, '0')}`;
        const payment = payments.find(p => p.billing_period === monthStr);
        const isPaid = !!payment;
        
        return (
          <button 
            key={month}
            onClick={() => isPaid && onPaymentClick(payment)}
            disabled={!isPaid}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
              isPaid 
                ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 cursor-pointer' 
                : 'bg-rose-50 border-rose-200 cursor-default'
            }`}
          >
            <span className="text-xs font-bold text-neutral-500 mb-1">{month}</span>
            <Badge variant={isPaid ? 'emerald' : 'rose'}>
              {isPaid ? 'Payé' : 'À payer'}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
