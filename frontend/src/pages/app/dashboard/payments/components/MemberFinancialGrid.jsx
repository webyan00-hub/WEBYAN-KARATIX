import React from 'react';

export function MemberFinancialGrid({ payments, year, onPaymentClick }) {
  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
  ];
  
  const currentMonthIndex = new Date().getMonth();

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
      {months.map((month, index) => {
        const monthStr = `${year}-${String(index + 1).padStart(2, '0')}`;
        const payment = payments.find(p => p.billing_period === monthStr);
        const isPaid = !!payment;
        const isCurrent = index === currentMonthIndex;
        
        let status = 'unpaid';
        if (isPaid) status = 'paid';
        else if (isCurrent) status = 'current';

        const styles = {
            paid: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            unpaid: 'bg-rose-50 border-rose-200 text-rose-700',
            current: 'bg-purple-50 border-purple-200 text-purple-700'
        };

        return (
          <button 
            key={month}
            onClick={() => isPaid && onPaymentClick(payment)}
            disabled={!isPaid}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${styles[status]} ${isPaid ? 'hover:border-emerald-400 cursor-pointer' : 'cursor-default'}`}
          >
            <span className="text-xs font-bold text-neutral-500 mb-2">{month}</span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isPaid ? 'bg-emerald-100' : isCurrent ? 'bg-purple-100' : 'bg-rose-100'}`}>
              {status === 'paid' ? 'Payé' : status === 'current' ? 'En cours' : 'Impayé'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
