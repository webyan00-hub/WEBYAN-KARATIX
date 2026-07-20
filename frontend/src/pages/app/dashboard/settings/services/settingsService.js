import { supabase } from '../../../../../lib/supabase';

export const settingsService = {
  // Récupérer les paramètres du club
  async getSettings(clubId) {
    const { data, error } = await supabase
      .from('club_settings')
      .select('*')
      .eq('club_id', clubId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Mettre à jour les paramètres
  async updateSettings(clubId, settings) {
    const { data, error } = await supabase
      .from('club_settings')
      .upsert({ club_id: clubId, ...settings })
      .select();

    if (error) throw error;
    return data[0];
  }
};
