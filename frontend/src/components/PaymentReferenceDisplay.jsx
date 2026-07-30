import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle } from 'lucide-react';

export default function PaymentReferenceDisplay({ clubId }) {
  const [ref, setRef] = useState(null);

  useEffect(() => {
    async function fetchLatestRef() {
      // On cherche la dernière référence payée pour ce club
      const { data } = await supabase
        .from('payment_references')
        .select('reference')
        .eq('club_id', clubId)
        .eq('status', 'paid') 
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (data) setRef(data.reference);
    }
    fetchLatestRef();
  }, [clubId]);

  if (!ref) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-emerald-900">Paiement confirmé</h3>
        <p className="text-sm text-slate-500 mt-2">Votre référence d'abonnement :</p>
        <p className="text-3xl font-black text-emerald-950 mt-1 tracking-wider">{ref}</p>
    </div>
  );
}
