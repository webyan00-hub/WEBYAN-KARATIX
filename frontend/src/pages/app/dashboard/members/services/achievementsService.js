import { supabase } from '../../../../../lib/supabase';

export const achievementsService = {
  async getAchievementsByClub(clubId, page = 0, pageSize = 20) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('member_achievements')
      .select('*, members(first_name, last_name)', { count: 'exact' })
      .eq('club_id', clubId)
      .order('date', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data: data || [], count };
  },

  async addAchievement(achievementData) {
    const { data, error } = await supabase
      .from('member_achievements')
      .insert([achievementData])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateAchievement(id, achievementData) {
    const { data, error } = await supabase
      .from('member_achievements')
      .update(achievementData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteAchievement(achievementId) {
    const { error } = await supabase
      .from('member_achievements')
      .delete()
      .eq('id', achievementId);
    if (error) throw error;
    return true;
  }
};
