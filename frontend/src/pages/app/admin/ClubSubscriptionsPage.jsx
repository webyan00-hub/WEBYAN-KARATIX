import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { CreditCard, CheckCircle, AlertCircle, XCircle, Clock, Eye, History, Search, Filter } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export default function ClubSubscriptionsPage() {
  const toast = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchSubscriptions() {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_references')
        .select(`
          id,
          reference,
          amount,
          status,
          created_at,
          clubs (name, address)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast('Erreur lors du chargement des abonnements', 'error');
      } else {
        setSubscriptions(data || []);
      }
      setLoading(false);
    }
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    async function fetchAuditLogs() {
      if (!selectedPayment) return;
      setLoadingAudit(true);
      const { data, error } = await supabase
        .from('payment_audit_logs')
        .select('*')
        .eq('payment_reference_id', selectedPayment.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast('Erreur lors du chargement de l\'historique', 'error');
      } else {
        setAuditLogs(data || []);
      }
      setLoadingAudit(false);
    }
    fetchAuditLogs();
  }, [selectedPayment]);

  // Logique de filtrage
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesSearch = 
        sub.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.clubs?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchTerm, statusFilter]);

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
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || 'bg-slate-100'}`}>
        <Icon className="w-3 h-3"/> {status || 'inconnu'}
      </span>
    );
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-950">Abonnements Clubs</h1>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher par référence ou club..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Club</th>
              <th className="px-8 py-4">Montant</th>
              <th className="px-8 py-4">Statut</th>
              <th className="px-8 py-4">Date</th>
              <th className="px-8 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSubscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/50">
                <td className="px-8 py-5 font-bold text-slate-900">{sub.clubs?.name || 'Inconnu'}</td>
                <td className="px-8 py-5 text-sm font-medium text-slate-700">{sub.amount?.toLocaleString()} Ar</td>
                <td className="px-8 py-5">{getStatusBadge(sub.status)}</td>
                <td className="px-8 py-5 text-sm text-slate-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                <td className="px-8 py-5">
                  <button 
                    onClick={() => setSelectedPayment(sub)}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-4 h-4"/> Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Détails */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-extrabold mb-6">Détails du paiement</h2>
            <div className="space-y-4 text-sm mb-8">
              <p><span className="font-bold text-slate-500">Club:</span> {selectedPayment.clubs?.name}</p>
              <p><span className="font-bold text-slate-500">Référence PAPI:</span> {selectedPayment.reference}</p>
              <p><span className="font-bold text-slate-500">Montant:</span> {selectedPayment.amount?.toLocaleString()} Ar</p>
              <p><span className="font-bold text-slate-500">Statut:</span> {getStatusBadge(selectedPayment.status)}</p>
              <p><span className="font-bold text-slate-500">Date:</span> {new Date(selectedPayment.created_at).toLocaleString()}</p>
            </div>
            
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><History className="w-5 h-5"/> Historique des modifications</h3>
            {loadingAudit ? (
                <p>Chargement de l'historique...</p>
            ) : auditLogs.length > 0 ? (
                <div className="space-y-2">
                    {auditLogs.map((log) => (
                        <div key={log.id} className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="font-bold">{new Date(log.created_at).toLocaleString()}</p>
                            <p>{log.old_status} → {log.new_status}</p>
                            <p className="text-slate-500 italic">{log.reason}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500">Aucun historique disponible.</p>
            )}

            <button 
              onClick={() => setSelectedPayment(null)}
              className="mt-8 w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
