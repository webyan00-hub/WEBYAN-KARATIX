import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { paymentsService } from './services/paymentsService';
import { settingsService } from '../settings/services/settingsService';
import { Search, RefreshCw, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentsHistoryPage() {
  const { club } = useAuth();
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  
  const [sortConfig, setSortConfig] = useState({ key: 'payment_date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (club?.id) {
        refreshData();
    }
  }, [club?.id]);

  const refreshData = () => {
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
  };

  const processedPayments = useMemo(() => {
    let filtered = payments.filter(p => {
        const matchesSearch = p.member_name?.toLowerCase().includes(search.toLowerCase()) || p.billing_period.includes(search);
        const matchesYear = yearFilter === 'all' || p.billing_period.startsWith(yearFilter);
        const matchesMonth = monthFilter === 'all' || p.billing_period.split('-')[1] === monthFilter;
        const matchesMethod = methodFilter === 'all' || p.payment_method === methodFilter;
        return matchesSearch && matchesYear && matchesMonth && matchesMethod;
    });

    filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
    return filtered;
  }, [payments, search, yearFilter, monthFilter, methodFilter, sortConfig]);

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [processedPayments, currentPage]);

  const totalPages = Math.ceil(processedPayments.length / itemsPerPage);

  const totalAmount = processedPayments.reduce((acc, p) => acc + Number(p.amount), 0);

  const years = useMemo(() => [...new Set(payments.map(p => p.billing_period.split('-')[0]))].sort().reverse(), [payments]);
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const currency = settings?.currency || 'EUR';
  const displayCurrency = currency === 'MGA' ? 'Ar' : '€';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
        <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tighter">Historique des Paiements</h2>
            <p className="text-sm md:text-lg text-slate-500 font-medium mt-1">Suivi complet des transactions.</p>
        </div>
        <button onClick={refreshData} className="w-full md:w-auto p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-600 transition flex items-center justify-center">
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards Mobile-First */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transactions</p>
            <p className="text-3xl font-black text-slate-950 font-mono">{processedPayments.length}</p>
        </div>
        <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-200">
            <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Montant total</p>
            <p className="text-3xl font-black font-mono">{totalAmount.toLocaleString()} {displayCurrency}</p>
        </div>
        <div className="p-6 bg-emerald-500 rounded-3xl text-white shadow-lg shadow-emerald-200">
            <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1">Moyenne</p>
            <p className="text-3xl font-black font-mono">{(processedPayments.length > 0 ? Math.round(totalAmount / processedPayments.length) : 0).toLocaleString()} {displayCurrency}</p>
        </div>
      </div>

      {/* Filter Bar Mobile-First */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
                placeholder="Rechercher par membre..." 
                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <div className="flex gap-2">
            <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="flex-1 px-6 py-5 bg-slate-50 rounded-2xl font-black text-sm text-slate-900 border-none cursor-pointer outline-none">
                <option value="all">Année</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="flex-1 px-6 py-5 bg-slate-50 rounded-2xl font-black text-sm text-slate-900 border-none cursor-pointer outline-none">
                <option value="all">Mois</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
        </div>
      </div>

      {/* Table responsive */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                    <tr className="text-[10px] uppercase text-slate-400 tracking-widest font-black">
                        <th className="px-6 py-5">Date</th>
                        <th className="px-6 py-5">Membre</th>
                        <th className="px-6 py-5 text-right">Montant</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan="3" className="p-10 text-center text-slate-400 font-black">Chargement...</td></tr>
                    ) : paginatedPayments.length > 0 ? (
                        paginatedPayments.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition">
                                <td className="px-6 py-5 font-bold text-slate-600 text-sm font-mono">{new Date(p.payment_date).toLocaleDateString('fr-FR')}</td>
                                <td className="px-6 py-5 font-black text-slate-950 text-sm">{p.member_name || 'N/A'}</td>
                                <td className="px-6 py-5 text-right font-black text-slate-950 text-sm">{Number(p.amount).toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="3" className="p-10 text-center text-slate-500 font-bold">Aucun paiement trouvé.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-center px-6 py-5 bg-slate-50 border-t border-slate-100 gap-4">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="w-full md:w-auto px-6 py-3 bg-white border border-slate-200 rounded-xl font-black text-sm hover:bg-slate-50 disabled:opacity-50">Précédent</button>
                <span className="text-sm font-black text-slate-500 font-mono">Page {currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="w-full md:w-auto px-6 py-3 bg-white border border-slate-200 rounded-xl font-black text-sm hover:bg-slate-50 disabled:opacity-50">Suivant</button>
            </div>
        )}
      </div>
    </div>
  );
}
