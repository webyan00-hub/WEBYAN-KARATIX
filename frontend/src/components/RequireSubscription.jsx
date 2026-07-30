import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function RequireSubscription({ children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    console.log("DEBUG - Le composant RequireSubscription est chargé !");

    async function checkSubscription() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      console.log("DEBUG - Vérification accès pour user:", user.id);
      
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();
        
      if (clubError) console.error("DEBUG - Erreur club:", clubError);
      if (!club) {
        console.log("DEBUG - Aucun club trouvé");
        setLoading(false);
        return;
      }
      
      const { data: latestPayment, error: payError } = await supabase
        .from('payment_references')
        .select('status')
        .eq('club_id', club.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (payError) console.error("DEBUG - Erreur paiement:", payError);
      
      // Accès si le dernier paiement est 'paid'
      const access = latestPayment && latestPayment.status === 'paid';
      console.log("DEBUG - Dernier paiement:", latestPayment, "Accès:", access);
      
      setHasAccess(access);
      setLoading(false);
    }
    checkSubscription();
  }, [user]);

  if (loading) return <div className="p-8">Vérification de l'accès...</div>;
  
  console.log("DEBUG - Rendu final, hasAccess:", hasAccess);
  
  if (!hasAccess) {
      console.log("DEBUG - Redirection vers payment-required");
      return <Navigate to="/dashboard/payment-required" replace />;
  }

  return <div className="require-subscription-wrapper">{children}</div>;
}
