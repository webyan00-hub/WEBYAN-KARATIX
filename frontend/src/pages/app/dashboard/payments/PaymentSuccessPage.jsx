import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPaymentDetails() {
      // On cherche la dernière référence payée pour ce club
      const { data, error } = await supabase
        .from('payment_references')
        .select(`
          reference,
          amount,
          clubs (name)
        `)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) setPaymentData(data);
      setLoading(false);
    }
    fetchPaymentDetails();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement de votre reçu...</div>;

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
        <h1 className="text-2xl font-extrabold text-slate-950 mb-2">Paiement réussi !</h1>
        <p className="text-slate-600 mb-8">Votre abonnement a été activé avec succès.</p>

        <div className="space-y-4 text-left bg-slate-50 p-6 rounded-2xl">
          <div className="flex justify-between">
            <span className="text-slate-500">Club</span>
            <span className="font-bold text-slate-900">{paymentData?.clubs?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Montant</span>
            <span className="font-bold text-slate-900">{paymentData?.amount?.toLocaleString()} Ar</span>
          </div>
          <div className="flex justify-between border-t pt-4">
            <span className="text-slate-500">Référence</span>
            <span className="font-bold text-blue-600 tracking-widest">{paymentData?.reference}</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-8 w-full flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
        >
          Retour au tableau de bord <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
