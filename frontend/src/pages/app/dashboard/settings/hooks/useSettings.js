import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settingsService';
import { useAuth } from '../../../../../context/AuthContext';

export const useSettings = () => {
  const { club } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings = {}, isLoading: loadingSettings } = useQuery({
    queryKey: ['settings', club?.id],
    queryFn: () => settingsService.getSettings(club.id),
    enabled: !!club?.id,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => settingsService.updateSettings(club.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', club?.id]);
    },
  });

  return {
    settings,
    loading: loadingSettings,
    updateSettings: updateSettingsMutation.mutateAsync,
  };
};
