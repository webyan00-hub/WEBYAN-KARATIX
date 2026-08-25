import { supabase } from '../../../../../lib/supabase';

export const membersService = {
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

    if (!isManuallyActive) return { label: 'Inactif', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    if (lastAttendance <= threeMonthsAgo) return { label: 'Absence', color: 'bg-amber-50 text-amber-700 border-amber-200' };

    return { label: 'Actif', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  },

  async getAllMembers(clubId, filters = {}) {
    let query = supabase
      .from('members')
      .select('*')
      .eq('club_id', clubId)
      .order('last_name', { ascending: true });

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

  async updateMember(id, memberData) {
    const { data, error } = await supabase
      .from('members')
      .update(memberData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async deleteMember(id) {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async generateMemberNumber(clubId) {
    const { data, error } = await supabase.rpc('generate_member_number', { p_club_id: clubId });
    if (error) throw error;
    return data;
  },

  async uploadMemberPhoto(file, clubId, memberId) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Format photo non supporté.');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('La photo dépasse 5 MB.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${memberId}.${fileExt}`;
    const filePath = `members/${clubId}/${fileName}`;

    const { error } = await supabase.storage
      .from('member-photos')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;
    return filePath;
  },
};
