import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { paymentsService } from './services/paymentsService';
import { settingsService } from '../settings/services/settingsService';
import { CreditCard, RefreshCw, Search, TrendingUp, Wallet } from 'lucide-react';

const monthLabels = {
  '01': 'Janvier',
  '02': 'Fevrier',
  '03': 'Mars',
  '04': 'Avril',
  '05': 'Mai',
  '06': 'Juin',
  '07': 'Juillet',
  '08': 'Aout',
  '09': 'Septembre',
  '10': 'Octobre',
  '11': 'Novembre',
  '12': 'Decembre',
};

export default function PaymentsHistoryPage() {
  const { club } = useAuth();
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const refreshData = useCallback(() => {
    if (!club?.id) return;

    setLoading(true);
    setCurrentPage(1);
    Promise.all([
      paymentsService.getAllPayments(club.id),
      settingsService.getSettings(club.id),
    ]).then(([paymentsData, settingsData]) => {
      setPayments(paymentsData || []);
      setSettings(settingsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [club?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const processedPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return payments
      .filter((payment) => {
        const matchesSearch =
          !normalizedSearch ||
          payment.member_name?.toLowerCase().includes(normalizedSearch) ||
          payment.billing_period?.includes(normalizedSearch);
        const matchesYear = yearFilter === 'all' || payment.billing_period?.startsWith(yearFilter);
        const matchesMonth = monthFilter === 'all' || payment.billing_period?.split('-')[1] === monthFilter;

        return matchesSearch && matchesYear && matchesMonth;
      })
      .sort((a, b) => new Date(b.payment_date || 0) - new Date(a.payment_date || 0));
  }, [monthFilter, payments, search, yearFilter]);

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, processedPayments]);

  const totalPages = Math.ceil(processedPayments.length / itemsPerPage);
  const totalAmount = processedPayments.reduce((acc, payment) => acc + Number(payment.amount || 0), 0);
  const averageAmount = processedPayments.length > 0 ? Math.round(totalAmount / processedPayments.length) : 0;
  const years = useMemo(() => [...new Set(payments.map((payment) => payment.billing_period?.split('-')[0]).filter(Boolean))].sort().reverse(), [payments]);
  const currency = settings?.currency || 'EUR';
  const displayCurrency = currency === 'MGA' ? 'Ar' : 'EUR';

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 md:space-y-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Paiements</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">Suivi de paiement</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Historique clair des encaissements et periodes reglees.</p>
        </div>
        <button
          onClick={refreshData}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="rounded-2xl border border-blue-500 bg-blue-600 p-3 text-white shadow-lg shadow-blue-100 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-blue-100"><CreditCard className="h-4 w-4" /> Transactions</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{processedPayments.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500 bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-100 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-emerald-100"><Wallet className="h-4 w-4" /> Total</div>
          <p className="mt-2 text-lg font-black md:text-3xl">{totalAmount.toLocaleString()} {displayCurrency}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 text-white shadow-lg shadow-slate-200 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-300"><TrendingUp className="h-4 w-4" /> Moyenne</div>
          <p className="mt-2 text-lg font-black md:text-3xl">{averageAmount.toLocaleString()} {displayCurrency}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_170px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Rechercher membre ou periode"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }}
            />
          </div>
          <select value={yearFilter} onChange={(event) => { setYearFilter(event.target.value); setCurrentPage(1); }} className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50">
            <option value="all">Toutes annees</option>
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <select value={monthFilter} onChange={(event) => { setMonthFilter(event.target.value); setCurrentPage(1); }} className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50">
            <option value="all">Tous les mois</option>
            {Object.keys(monthLabels).map((month) => <option key={month} value={month}>{monthLabels[month]}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="md:hidden">
          {loading ? (
            <div className="p-8 text-center text-sm font-black text-slate-400">Chargement...</div>
          ) : paginatedPayments.length > 0 ? (
            <div className="grid gap-3 bg-slate-50/70 p-3">
              {paginatedPayments.map((payment) => {
                const [periodYear, periodMonth] = payment.billing_period?.split('-') || [];
                return (
                  <article key={payment.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-950">{payment.member_name || 'N/A'}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{monthLabels[periodMonth] || periodMonth} {periodYear}</p>
                      </div>
                      <p className="text-right text-sm font-black text-emerald-700">{Number(payment.amount || 0).toLocaleString()} {displayCurrency}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">{payment.payment_method || 'Methode'}</span>
                      <span className="text-xs font-bold text-slate-400">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('fr-FR') : '-'}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-sm font-bold text-slate-500">Aucun paiement trouve.</div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Membre</th>
                <th className="px-5 py-4">Periode</th>
                <th className="px-5 py-4">Methode</th>
                <th className="px-5 py-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-black">Chargement...</td></tr>
              ) : paginatedPayments.length > 0 ? paginatedPayments.map((payment) => {
                const [periodYear, periodMonth] = payment.billing_period?.split('-') || [];
                return (
                  <tr key={payment.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-mono text-sm font-bold text-slate-600">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="px-5 py-4 text-sm font-black text-slate-950">{payment.member_name || 'N/A'}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-600">{monthLabels[periodMonth] || periodMonth} {periodYear}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-500">{payment.payment_method || '-'}</td>
                    <td className="px-5 py-4 text-right text-sm font-black text-emerald-700">{Number(payment.amount || 0).toLocaleString()} {displayCurrency}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-bold">Aucun paiement trouve.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-slate-100 bg-slate-50 px-3 py-3 md:px-5">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 disabled:opacity-40">Precedent</button>
            <span className="text-xs font-black text-slate-500">Page {currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 disabled:opacity-40">Suivant</button>
          </div>
        )}
      </div>
    </div>
  );
}
