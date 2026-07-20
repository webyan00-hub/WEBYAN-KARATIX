import { supabase } from '@/lib/supabase';

export const examsService = {
  // Récupérer toutes les sessions d'examen
  async getSessions(clubId) {
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('*')
      .order('exam_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Créer une nouvelle session d'examen
  async createSession(sessionData) {
    const { data, error } = await supabase
      .from('exam_sessions')
      .insert([sessionData])
      .select();
    if (error) throw error;
    return data[0];
  },

  // Récupérer les participants d'une session
  async getParticipants(sessionId) {
    const { data, error } = await supabase
      .from('exam_participants')
      .select(`
        *,
        members (first_name, last_name, member_number)
      `)
      .eq('session_id', sessionId);
    if (error) throw error;
    return data;
  },

  // Ajouter des participants à une session
  async addParticipants(participants) {
    const { data, error } = await supabase
      .from('exam_participants')
      .insert(participants)
      .select();
    if (error) throw error;
    return data;
  },

  // Mettre à jour le résultat d'un participant
  async updateParticipantResult(participantId, resultData) {
    // On retire les propriétés qui ne font pas partie de la table exam_participants
    const { members, ...dataToUpdate } = resultData;
    
    const { data, error } = await supabase
      .from('exam_participants')
      .update(dataToUpdate)
      .eq('id', participantId);
      
    if (error) throw error;
    return data;
  }
};
