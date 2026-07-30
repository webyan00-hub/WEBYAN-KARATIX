import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendanceService';
import { useAuth } from '../../../../../context/AuthContext';

export const useAttendance = (date, sessionId) => {
  const { club } = useAuth();
  const queryClient = useQueryClient();

  // Récupérer les séances
  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions', club?.id],
    queryFn: () => attendanceService.getSessions(club.id),
    enabled: !!club?.id,
  });

  // Récupérer les présences par date et séance
  const { data: attendances = [], isLoading: loadingAttendances, refetch } = useQuery({
    queryKey: ['attendances', club?.id, date, sessionId],
    queryFn: () => attendanceService.getAttendancesByDate(club.id, date, sessionId),
    enabled: !!club?.id && !!date && !!sessionId,
  });

  // Mutation pour sauvegarder les présences
  const saveAttendancesMutation = useMutation({
    mutationFn: (data) => attendanceService.saveAttendances(club.id, data.sessionId, date, data.attendances),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendances', club?.id, date, sessionId]);
    },
  });

  // Mutation pour valider l'instance
  const updateInstanceMutation = useMutation({
    mutationFn: (data) => attendanceService.updateInstanceValidation(data.instanceId, data.isValidated),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendances', club?.id, date, sessionId]);
    },
  });

  return {
    sessions,
    attendances,
    loading: loadingSessions || loadingAttendances,
    saveAttendances: saveAttendancesMutation.mutateAsync,
    updateInstance: updateInstanceMutation.mutateAsync,
    refetchAttendances: refetch,
  };
};
