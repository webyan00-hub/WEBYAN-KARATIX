import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { paymentsService } from './services/paymentsService';
import { settingsService } from '../settings/services/settingsService';
import { Search, RefreshCw } from 'lucide-react';

const monthLabels = {
  '01': 'Janvier',
  '02': 'Février',
  '03': 'Mars',
  '04': 'Avril',
  '05': 'Mai',
  '06': 'Juin',
  '07': 'Juillet',
  '08': 'Août',
  '09': 'Septembre',
  '10': 'Octobre',
  '11': 'Novembre',
  '12': 'Décembre'
};

export default function PaymentsHistoryPage() {
  const { club } = useAuth();
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  const [sortConfig] = useState({ key: 'payment_date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const refreshData = useCallback(() => {
    if (!club?.id) return;

    setLoading(true);
    setCurrentPage(1);
    Promise.all([
      paymentsService.getAllPayments(club.id),
      settingsService.getSettings(club.id)
    ]).then(([paymentsData, settingsData]) => {
      setPayments(paymentsData);
      setSettings(settingsData);
      setLoading(false);
    });
  }, [club?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const processedPayments = useMemo(() => {
    let filtered = payments.filter(p => {
      const normalizedSearch = search.toLowerCase();
      const matchesSearch = p.member_name?.toLowerCase().includes(normalizedSearch) || p.billing_period.includes(search);
      const matchesYear = yearFilter === 'all' || p.billing_period.startsWith(yearFilter);
      const matchesMonth = monthFilter === 'all' || p.billing_period.split('-')[1] === monthFilter;
      return matchesSearch && matchesYear && matchesMonth;
    });

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [payments, search, yearFilter, monthFilter, sortConfig]);

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [processedPayments, currentPage]);

  const totalPages = Math.ceil(processedPayments.length / itemsPerPage);
  const totalAmount = processedPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  const years = useMemo(() => [...new Set(payments.map(p => p.billing_period.split('-')[0]))].sort().reverse(), [payments]);
  const months = Object.keys(monthLabels);
  const currency = settings?.currency || 'EUR';
  const displayCurrency = currency === 'MGA' ? 'Ar' : '€';
  const averageAmount = processedPayments.length > 0 ? Math.round(totalAmount / processedPayments.length) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 md:p-8 space-y-5 md:space-y-8 overflow-x-hidden">
      <div className="flex items-start justify-between gap-3 md:items-center">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-950 tracking-tight">
            Historique des Paiements
          </h2>
          <p className="text-xs sm:text-sm md:text-lg text-slate-500 font-medium mt-1">
            Suivi complet des transactions.
          </p>
        </div>
        <button
          onClick={refreshData}
          className="shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-600 transition flex items-center justify-center"
          aria-label="Rafraîchir les paiements"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
        <div className="p-3 md:p-6 bg-white rounded-xl md:rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">
            Transactions
          </p>
          <p className="text-xl md:text-3xl font-black text-slate-950 font-mono">
            {processedPayments.length}
          </p>
        </div>
        <div className="p-3 md:p-6 bg-blue-600 rounded-xl md:rounded-3xl text-white shadow-lg shadow-blue-200">
          <p className="text-[9px] md:text-[10px] font-black text-blue-100 uppercase tracking-wide mb-1">
            Total
          </p>
          <p className="text-lg sm:text-xl md:text-3xl font-black font-mono break-words">
            {totalAmount.toLocaleString()} {displayCurrency}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 p-3 md:p-6 bg-emerald-500 rounded-xl md:rounded-3xl text-white shadow-lg shadow-emerald-200">
          <p className="text-[9px] md:text-[10px] font-black text-emerald-100 uppercase tracking-wide mb-1">
            Moyenne
          </p>
          <p className="text-lg sm:text-xl md:text-3xl font-black font-mono break-words">
            {averageAmount.toLocaleString()} {displayCurrency}
          </p>
        </div>
      </div>

      <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-2 md:gap-3">
        <div className="relative flex-grow min-w-0">
          <Search className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          <input
            placeholder="Rechercher par membre..."
            className="w-full pl-10 md:pl-14 pr-3 md:pr-6 py-3 md:py-5 bg-slate-50 border-none rounded-lg md:rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:w-auto">
          <select
            value={yearFilter}
            onChange={e => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="min-w-0 px-3 md:px-5 py-3 md:py-5 bg-slate-50 rounded-lg md:rounded-2xl font-black text-xs md:text-sm text-slate-900 border-none cursor-pointer outline-none"
          >
            <option value="all">Année</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={monthFilter}
            onChange={e => {
              setMonthFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="min-w-0 px-3 md:px-5 py-3 md:py-5 bg-slate-50 rounded-lg md:rounded-2xl font-black text-xs md:text-sm text-slate-900 border-none cursor-pointer outline-none"
          >
            <option value="all">Mois</option>
            {months.map(m => <option key={m} value={m}>{monthLabels[m]}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="md:hidden">
          {loading ? (
            <div className="p-6 text-center text-slate-400 font-black">Chargement...</div>
          ) : paginatedPayments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {paginatedPayments.map(p => {
                const [periodYear, periodMonth] = p.billing_period.split('-');
                return (
                  <article key={p.id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black text-slate-950 text-sm leading-snug break-words">
                          {p.member_name || 'N/A'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-bold mt-1">
                          {new Date(p.payment_date).toLocaleDateString('fr-FR')} · {monthLabels[periodMonth] || periodMonth} {periodYear}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-black text-slate-950 font-mono text-right">
                        {Number(p.amount).toLocaleString()} {displayCurrency}
                      </p>
                    </div>
                    {p.payment_method && (
                      <span className="inline-flex mt-3 px-2 py-1 bg-slate-50 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-wide">
                        {p.payment_method}
                      </span>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 font-bold">Aucun paiement trouvé.</div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr className="text-[10px] uppercase text-slate-400 tracking-wide font-black">
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Membre</th>
                <th className="px-6 py-5">Période</th>
                <th className="px-6 py-5">Méthode</th>
                <th className="px-6 py-5 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-black">Chargement...</td></tr>
              ) : paginatedPayments.length > 0 ? (
                paginatedPayments.map(p => {
                  const [periodYear, periodMonth] = p.billing_period.split('-');
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-5 font-bold text-slate-600 text-sm font-mono">
                        {new Date(p.payment_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-5 font-black text-slate-950 text-sm">
                        {p.member_name || 'N/A'}
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-600 text-sm">
                        {monthLabels[periodMonth] || periodMonth} {periodYear}
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-500 text-sm">
                        {p.payment_method || '-'}
                      </td>
                      <td className="px-6 py-5 text-right font-black text-slate-950 text-sm">
                        {Number(p.amount).toLocaleString()} {displayCurrency}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-bold">Aucun paiement trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-3 md:px-6 py-3 md:py-5 bg-slate-50 border-t border-slate-100 gap-2 md:gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 md:px-6 py-2 md:py-3 bg-white border border-slate-200 rounded-lg md:rounded-xl font-black text-xs md:text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-xs md:text-sm font-black text-slate-500 font-mono whitespace-nowrap">
              Page {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 md:px-6 py-2 md:py-3 bg-white border border-slate-200 rounded-lg md:rounded-xl font-black text-xs md:text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
