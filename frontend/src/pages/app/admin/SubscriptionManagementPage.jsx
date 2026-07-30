import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { BarChart3, Users, DollarSign, RefreshCw, Search, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

export default function SubscriptionManagementPage() {
  const [stats, setStats] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres pour le suivi opérationnel
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tariffFilter, setTariffFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  async function fetchData() {
    setLoading(true);
    
    // 1. Récupération des stats (Vue SQL)
    const { data: statsData } = await supabase.from('vw_revenus_par_tarif').select('*');
    setStats(statsData || []);

    // 2. Récupération des données brutes pour le suivi opérationnel
    const { data: subData } = await supabase
      .from('payment_references')
      .select(`
        id,
        reference,
        amount,
        status,
        created_at,
        clubs (name)
      `)
      .order('created_at', { ascending: false });

    setSubscriptions(subData || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const subDate = new Date(sub.created_at);
      const matchesSearch = sub.clubs?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      
      // Logique de filtre tarifaire
      let matchesTariff = true;
      if (tariffFilter === '10000') matchesTariff = sub.amount === 10000;
      else if (tariffFilter === '20000') matchesTariff = sub.amount === 20000;
      else if (tariffFilter === '35000') matchesTariff = sub.amount === 35000;
      
      // Logique de filtre de date
      let matchesDate = true;
      if (startDate) matchesDate = matchesDate && subDate >= new Date(startDate);
      if (endDate) matchesDate = matchesDate && subDate <= new Date(endDate);
      
      return matchesSearch && matchesStatus && matchesTariff && matchesDate;
    });
  }, [subscriptions, searchTerm, statusFilter, tariffFilter, startDate, endDate]);

  const getStatusBadge = (status) => {
    const styles = {
      paid: "bg-emerald-100 text-emerald-700",
      pending: "bg-blue-100 text-blue-700",
      waiting: "bg-amber-100 text-amber-700",
      failed: "bg-red-100 text-red-700"
    };
    const icons = {
      paid: CheckCircle,
      pending: Clock,
      waiting: AlertCircle,
      failed: XCircle
    };
    const Icon = icons[status] || Clock;
    return (
      <span className={`flex w-fit items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || 'bg-slate-100'}`}>
        <Icon className="w-3 h-3"/> {status || 'inconnu'}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-950">Gestion des Abonnements</h1>
        <button onClick={fetchData} className="p-2 text-slate-500 hover:text-slate-900 transition">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Reporting par tarif */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {loading ? (
          <p>Chargement des statistiques...</p>
        ) : stats.length > 0 ? (
          stats.map((stat) => (
            <div key={stat.palier_tarif} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">{stat.palier_tarif}</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500 flex items-center gap-2"><Users className="w-4 h-4"/> Effectif</span>
                <span className="text-2xl font-black">{stat.effectif_clubs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Revenu</span>
                <span className="text-xl font-bold text-emerald-600">{stat.revenu_total?.toLocaleString()} Ar</span>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-3 text-center text-slate-500">Aucune donnée de paiement disponible.</p>
        )}
      </div>

      {/* Suivi opérationnel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <h2 className="text-xl font-bold mb-6">Suivi opérationnel</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher un club..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <input type="date" className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <select 
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none"
            value={tariffFilter}
            onChange={(e) => setTariffFilter(e.target.value)}
          >
            <option value="all">Tous les tarifs</option>
            <option value="10000">10 000 Ar</option>
            <option value="20000">20 000 Ar</option>
            <option value="35000">35 000 Ar</option>
          </select>
          <select 
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="paid">Payé</option>
            <option value="pending">En attente</option>
            <option value="waiting">En attente (PAPI)</option>
            <option value="failed">Échoué</option>
          </select>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-4 py-3">Club</th>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSubscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-4 font-bold">{sub.clubs?.name || 'Inconnu'}</td>
                <td className="px-4 py-4 font-mono text-sm text-blue-600">{sub.reference}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{sub.amount?.toLocaleString()} Ar</td>
                <td className="px-4 py-4">{getStatusBadge(sub.status)}</td>
                <td className="px-4 py-4 text-sm text-slate-500">{new Date(sub.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
