import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './components/PaymentUIComponents';
import { useAuth } from '../../../../context/AuthContext';
import { paymentsService } from './services/paymentsService';
import { settingsService } from '../settings/services/settingsService';
import { Search, FileText, ArrowUpDown, RefreshCw } from 'lucide-react';

export default function PaymentsHistoryPage() {
  const { club } = useAuth();
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  
  // États pour le tri
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

  const resetFilters = () => {
    setSearch('');
    setYearFilter('all');
    setMonthFilter('all');
    setMethodFilter('all');
    setSortConfig({ key: 'payment_date', direction: 'desc' });
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
    setCurrentPage(1);
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

  const years = [...new Set(payments.map(p => p.billing_period.split('-')[0]))].sort().reverse();
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const methods = settings?.payment_methods || [];
  const totalAmount = processedPayments.reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Historique financier</h2>
            <p className="text-slate-500 mt-1">Vue d'ensemble détaillée de tous les encaissements.</p>
        </div>
        <button onClick={refreshData} className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards Premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Transactions</p>
            <p className="text-4xl font-black text-slate-900">{processedPayments.length}</p>
        </div>
        <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-200">
            <p className="text-sm font-bold text-blue-100 uppercase tracking-wider mb-2">Montant total</p>
            <p className="text-4xl font-black">{totalAmount.toLocaleString()} {settings?.currency || 'MGA'}</p>
        </div>
        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">Moyenne transaction</p>
            <p className="text-4xl font-black text-emerald-900">{(processedPayments.length > 0 ? totalAmount / processedPayments.length : 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-grow min-w-[250px]">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input 
                placeholder="Rechercher par membre..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 border-none cursor-pointer">
            <option value="all">Année</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 border-none cursor-pointer">
            <option value="all">Mois</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 border-none cursor-pointer">
            <option value="all">Mode</option>
            {methods.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button onClick={resetFilters} className="px-4 py-3 text-sm font-bold text-slate-500 hover:text-red-600 transition">Réinitialiser</button>
      </div>

      {/* Premium Data Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Vue Mobile : Liste de Cartes */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
            {loading ? (
                <div className="p-12 text-center text-slate-400">Chargement...</div>
            ) : paginatedPayments.length > 0 ? (
                paginatedPayments.map(p => (
                    <div key={p.id} className="p-6 flex flex-col gap-2 hover:bg-slate-50/50 transition">
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-900 text-lg">{p.member_name || 'N/A'}</span>
                            <span className="font-black text-slate-900">{Number(p.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-slate-500">
                            <span>{new Date(p.payment_date).toLocaleDateString('fr-FR')}</span>
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{p.billing_period}</span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{p.payment_method}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-12 text-center text-slate-500">Aucun paiement trouvé.</div>
            )}
        </div>

        {/* Vue Desktop : Tableau Classique */}
        <div className="hidden md:block">
            <table className="w-full">
                <thead className="bg-slate-50">
                    <tr className="text-xs uppercase text-slate-400 tracking-wider">
                        <th className="px-8 py-5 text-left cursor-pointer hover:text-slate-600" onClick={() => handleSort('payment_date')}>Date <ArrowUpDown className="inline w-3 h-3 ml-1" /></th>
                        <th className="px-8 py-5 text-left">Membre</th>
                        <th className="px-8 py-5 text-left">Période</th>
                        <th className="px-8 py-5 text-right cursor-pointer hover:text-slate-600" onClick={() => handleSort('amount')}>Montant <ArrowUpDown className="inline w-3 h-3 ml-1" /></th>
                        <th className="px-8 py-5 text-left">Mode</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan="5" className="p-12 text-center text-slate-400">Chargement des données...</td></tr>
                    ) : paginatedPayments.length > 0 ? (
                        paginatedPayments.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition">
                                <td className="px-8 py-5 font-medium text-slate-600">{new Date(p.payment_date).toLocaleDateString('fr-FR')}</td>
                                <td className="px-8 py-5 font-bold text-slate-900">{p.member_name || 'N/A'}</td>
                                <td className="px-8 py-5 text-slate-600 font-mono text-xs">{p.billing_period}</td>
                                <td className="px-8 py-5 text-right font-black text-slate-900">{Number(p.amount).toLocaleString()}</td>
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{p.payment_method}</span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="p-12 text-center text-slate-500">Aucun paiement trouvé avec ces critères.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between px-8 py-4 bg-slate-50 border-t border-slate-100">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 disabled:opacity-50"
                >
                    Précédent
                </button>
                <span className="text-sm font-bold text-slate-500">Page {currentPage} sur {totalPages}</span>
                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 disabled:opacity-50"
                >
                    Suivant
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
