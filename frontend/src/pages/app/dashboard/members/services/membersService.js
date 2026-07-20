import { supabase } from '../../../../../lib/supabase';

export const membersService = {
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
      query = query.eq('gender', filters.genderFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Ajouter un nouveau membre
  async addMember(memberData) {
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

    const { error } = await supabase.storage
      .from('member-photos')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;
    return filePath;
  }
};
