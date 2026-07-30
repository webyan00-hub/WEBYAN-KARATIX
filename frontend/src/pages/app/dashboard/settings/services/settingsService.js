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
    console.log("DEBUG - settingsService.updateSettings called with:", { clubId, settings });
    const { data, error } = await supabase
      .from('club_settings')
      .upsert({ club_id: clubId, ...settings })
      .select();

    if (error) {
        console.error("DEBUG - Supabase error in updateSettings:", error);
        throw error;
    }
    console.log("DEBUG - Supabase response in updateSettings:", data);
    return data[0];
  }
};
