import { supabase } from '../../../../../lib/supabase';

export const paymentsService = {
  // Verrou fonctionnel : Vérifie si le membre peut s'entraîner
  async getMemberFinancialStatus(memberId) {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*, payments(*)')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.warn("DEBUG - getMemberFinancialStatus - error:", error);
      // Retourner une structure minimale pour éviter le plantage du Wizard
      return { status: 'no-subscription', balance: 0, id: null };
    }
    
    console.log("DEBUG - getMemberFinancialStatus - subscription:", subscription);

    // Logique de calcul simple du solde
    const totalPaid = (subscription.payments || []).reduce((acc, p) => acc + Number(p.amount), 0);
    const balance = subscription.price - totalPaid;

    if (balance > 0) return { status: 'in-debt', balance, id: subscription.id };
    return { status: 'ok', balance, id: subscription.id };
  },

  // Récupérer tous les paiements (pour stats dashboard)
  async getAllPayments(clubId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, members(first_name, last_name)')
      .eq('club_id', clubId);

    if (error) {
      console.error("DEBUG - getAllPayments - error:", error);
      return [];
    }
    
    // Formater les données pour inclure member_name
    return (data || []).map(p => ({
      ...p,
      member_name: p.members ? `${p.members.first_name} ${p.members.last_name}` : 'N/A'
    }));
  },

  // Récupérer les paiements d'un membre
  async getPaymentsByMember(memberId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('member_id', memberId)
      .order('billing_period', { ascending: false });

    if (error) {
      console.error("DEBUG - getPaymentsByMember - error:", error);
      return [];
    }
    return data || [];
  },

  // Enregistrer plusieurs paiements de manière atomique
  async addPaymentsAtomic(clubId, memberId, subscriptionId, payments) {
    // subscriptionId est rendu optionnel pour le MVP
    console.log("DEBUG - Arguments RPC:", {
      p_club_id: clubId,
      p_member_id: memberId,
      p_payments: payments,
      p_subscription_id: subscriptionId || null
    });

    // Appel avec l'ordre exact attendu par PostgreSQL
    const { error } = await supabase.rpc('add_payments_atomic_v2', {
      p_club_id: clubId,
      p_member_id: memberId,
      p_payments: payments,
      p_subscription_id: subscriptionId || null
    });

    if (error) {
      console.error("DEBUG - Erreur RPC:", error);
      throw error;
    }
    return true;
  },

  // Enregistrer un paiement unique (rétrocompatibilité si nécessaire)
  async createPayment(paymentData) {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Un paiement pour cette période existe déjà pour ce membre.');
      }
      throw error;
    }
    return data[0];
  }
};
