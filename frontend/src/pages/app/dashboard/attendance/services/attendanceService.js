import { supabase } from '../../../../../lib/supabase';

export const attendanceService = {
  // --- Gestion des Séances (Sessions) ---
  
  async getSessions(clubId) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('club_id', clubId)
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;
    return data || [];
  },

  async createSession(sessionData) {
    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select();

    if (error) throw error;
    return data[0];
  },

  async deleteSession(sessionId) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    return true;
  },

  // Récupérer les membres actifs du club
  async getActiveMembers(clubId) {
    const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name')
        .eq('club_id', clubId)
        .eq('active', true);
    if (error) throw error;
    return data || [];
  },

  // Gestion des Instances de séance
  async getOrCreateInstance(sessionId, date, clubId) {
    let { data: inst, error } = await supabase
        .from('session_instances')
        .select('*')
        .eq('session_id', sessionId)
        .eq('instance_date', date)
        .single();
        
    if (error && error.code !== 'PGRST116') throw error;

    if (!inst) {
        const { data: newInst, error: insertError } = await supabase
            .from('session_instances')
            .insert([{ session_id: sessionId, instance_date: date, club_id: clubId }])
            .select()
            .single();
        if (insertError) throw insertError;
        inst = newInst;
    }
    return inst;
  },

  async updateInstanceValidation(instanceId, isValidated) {
    const { error } = await supabase
        .from('session_instances')
        .update({ is_validated: isValidated })
        .eq('id', instanceId);
    if (error) throw error;
    return true;
  },

  // --- Gestion des Présences (Attendances) ---

  async saveAttendances(clubId, sessionId, date, attendances) {
    // attendances est un tableau d'objets : { member_id: uuid, status: 'present' | 'absent' }
    
    // Pour simplifier, on supprime les existantes pour cette séance et cette date, puis on réinsère
    const { error: deleteError } = await supabase
      .from('attendances')
      .delete()
      .eq('club_id', clubId)
      .eq('session_id', sessionId)
      .eq('attendance_date', date);

    if (deleteError) throw deleteError;

    const records = attendances.map(a => ({
      club_id: clubId,
      session_id: sessionId,
      attendance_date: date,
      member_id: a.member_id,
      status: a.status
    }));

    const { error: insertError } = await supabase
      .from('attendances')
      .insert(records);

    if (insertError) throw insertError;
    return true;
  },

  async getAttendancesByDate(clubId, date) {
    const { data, error } = await supabase
      .from('attendances')
      .select('*, members(first_name, last_name), sessions(name, start_time)')
      .eq('club_id', clubId)
      .eq('attendance_date', date);

    if (error) throw error;
    return data || [];
  },

  // Calcul du statut actif/inactif (3 mois sans présence)
  async getMemberLastAttendance(clubId, memberId) {
    const { data, error } = await supabase
      .from('attendances')
      .select('attendance_date')
      .eq('club_id', clubId)
      .eq('member_id', memberId)
      .eq('status', 'present')
      .order('attendance_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = pas de résultat (ok)
    return data ? data.attendance_date : null;
  }
};
