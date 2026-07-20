import { supabase } from '../../../../../lib/supabase';

export const subscriptionsService = {
  // Créer un nouvel abonnement
  async createSubscription(subData) {
    // Validation serveur des dates
    if (new Date(subData.start_date) >= new Date(subData.end_date)) {
      throw new Error("La date de fin doit être postérieure à la date de début.");
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subData])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Récupérer l'abonnement actif d'un membre
  async getActiveSubscription(memberId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('member_id', memberId)
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};
