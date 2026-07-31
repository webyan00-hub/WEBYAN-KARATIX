import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Eye, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function AllPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    // On joint payment_references avec clubs pour avoir le nom du club
    const { data, error } = await supabase
      .from('payment_references')
      .select(`
        reference,
        amount,
        status,
        created_at,
        clubs (name)
      `)
      .order('created_at', { ascending: false });

    if (error) toast('Erreur lors du chargement des paiements', 'error');
    else setPayments(data || []);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: "bg-emerald-100 text-emerald-700",
      pending: "bg-blue-100 text-blue-700",
      waiting: "bg-amber-100 text-amber-700",
      failed: "bg-red-100 text-red-700"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || 'bg-slate-100'}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold text-slate-950 mb-8">Historique des Paiements</h1>
      
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Club</th>
              <th className="px-8 py-4">Référence</th>
              <th className="px-8 py-4">Montant</th>
              <th className="px-8 py-4">Statut</th>
              <th className="px-8 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => (
              <tr key={p.reference} className="hover:bg-slate-50">
                <td className="px-8 py-5 font-bold">{p.clubs?.name || 'Inconnu'}</td>
                <td className="px-8 py-5 font-mono text-sm text-blue-600">{p.reference}</td>
                <td className="px-8 py-5 font-bold">{p.amount?.toLocaleString()} Ar</td>
                <td className="px-8 py-5">{getStatusBadge(p.status)}</td>
                <td className="px-8 py-5 text-sm">{new Date(p.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
