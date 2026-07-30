import { supabase } from '../../../../../lib/supabase';

export const membersService = {
  // Calculer le statut du membre
  getMemberStatus(member) {
    const isManuallyActive = member.active;
    if (!member.last_attendance_date) {
      return isManuallyActive 
        ? { label: 'Actif', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' } 
        : { label: 'Inactif', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
    const lastAttendance = new Date(member.last_attendance_date);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const isRecentlyActive = lastAttendance > threeMonthsAgo;
    
    if (!isManuallyActive) return { label: 'Inactif', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    if (!isRecentlyActive) return { label: 'Absence', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    
    return { label: 'Actif', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  },

  // Récupérer les membres du club avec filtrage optionnel
  async getAllMembers(clubId, filters = {}) {
    let query = supabase
      .from('members')
      .select('*')
      .eq('club_id', clubId);

    if (filters.searchQuery) {
      query = query.or(`first_name.ilike.%${filters.searchQuery}%,last_name.ilike.%${filters.searchQuery}%,member_number.ilike.%${filters.searchQuery}%`);
    }
    if (filters.gradeFilter) {
      query = query.eq('grade', filters.gradeFilter);
    }
    if (filters.genderFilter) {
      query = query.ilike('gender', filters.genderFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Ajouter un nouveau membre
  async addMember(memberData) {
    // On conserve tous les champs reçus pour l'insertion
    const { data, error } = await supabase
      .from('members')
      .insert([memberData])
      .select();
      
    if (error) {
      if (error.code === '23505') {
        throw new Error('Ce membre est déjà enregistré dans votre club.');
      }
      throw error;
    }
    return data[0];
  },

  // Mettre à jour un membre
  async updateMember(id, memberData) {
    const { data, error } = await supabase
      .from('members')
      .update(memberData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // Supprimer un membre
  async deleteMember(id) {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Générer un numéro de membre
  async generateMemberNumber(clubId) {
    const { data, error } = await supabase.rpc('generate_member_number', { p_club_id: clubId });
    if (error) throw error;
    return data;
  },

  // Téléverser la photo du membre
  async uploadMemberPhoto(file, clubId, memberId) {
    console.log("DEBUG - Début upload photo pour membre:", memberId);
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file type');
    }
    // Validate file size (max 5 MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5 MB');
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${memberId}.${fileExt}`;
    const filePath = `members/${clubId}/${fileName}`;

    console.log("DEBUG - Upload vers le chemin:", filePath);

    const { error } = await supabase.storage
      .from('member-photos')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("DEBUG - Erreur upload storage:", error);
      throw error;
    }
    
    console.log("DEBUG - Upload storage réussi");
    return filePath;
  }
};
