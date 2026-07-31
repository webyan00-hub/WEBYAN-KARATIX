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
    
    // Essayer de mettre à jour d'abord
    const { data: existing, error: fetchError } = await supabase
      .from('club_settings')
      .select('id')
      .eq('club_id', clubId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let result;
    if (existing) {
        // Mise à jour
        const { data, error } = await supabase
          .from('club_settings')
          .update(settings)
          .eq('club_id', clubId)
          .select();
        if (error) throw error;
        result = data;
    } else {
        // Insertion
        const { data, error } = await supabase
          .from('club_settings')
          .insert({ club_id: clubId, ...settings })
          .select();
        if (error) throw error;
        result = data;
    }

    console.log("DEBUG - Supabase response in updateSettings:", result);
    return result[0];
  }
};
