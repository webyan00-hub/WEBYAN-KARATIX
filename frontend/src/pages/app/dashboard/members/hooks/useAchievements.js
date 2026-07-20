import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { achievementsService } from '../services/achievementsService';
import { useAuth } from '../../../../../context/AuthContext';

export const useAchievements = (page = 0, pageSize = 100) => {
  const { club } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ['achievements', club?.id, page, pageSize],
    queryFn: () => achievementsService.getAchievementsByClub(club.id, page, pageSize),
    enabled: !!club?.id,
  });

  const addMutation = useMutation({
    mutationFn: (data) => achievementsService.addAchievement({ ...data, club_id: club.id }),
    onSuccess: () => queryClient.invalidateQueries(['achievements', club?.id]),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => achievementsService.updateAchievement(data.id, data.formData),
    onSuccess: () => queryClient.invalidateQueries(['achievements', club?.id]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => achievementsService.deleteAchievement(id),
    onSuccess: () => queryClient.invalidateQueries(['achievements', club?.id]),
  });

  return {
    achievements: data?.data || [],
    totalCount: data?.count || 0,
    loading,
    addAchievement: addMutation.mutateAsync,
    updateAchievement: updateMutation.mutateAsync,
    deleteAchievement: deleteMutation.mutateAsync,
  };
};
