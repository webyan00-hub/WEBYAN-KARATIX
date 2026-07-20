import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examsService } from '../services/examsService';
import { useAuth } from '../../../../../context/AuthContext';

export const useExams = (sessionId = null) => {
  const { club } = useAuth();
  const queryClient = useQueryClient();

  // Sessions
  const sessionsQuery = useQuery({
    queryKey: ['exams', club?.id],
    queryFn: () => examsService.getSessions(club.id),
    enabled: !!club?.id,
  });

  const createSessionMutation = useMutation({
    mutationFn: (sessionData) => examsService.createSession({...sessionData, club_id: club.id}),
    onSuccess: () => queryClient.invalidateQueries(['exams', club?.id]),
  });

  // Participants
  const participantsQuery = useQuery({
    queryKey: ['examParticipants', sessionId],
    queryFn: () => examsService.getParticipants(sessionId),
    enabled: !!sessionId,
  });

  const addParticipantsMutation = useMutation({
    mutationFn: (participants) => examsService.addParticipants(participants),
    onSuccess: () => queryClient.invalidateQueries(['examParticipants', sessionId]),
  });

  const updateParticipantMutation = useMutation({
    mutationFn: ({ participantId, data }) => examsService.updateParticipantResult(participantId, data),
    onSuccess: () => queryClient.invalidateQueries(['examParticipants', sessionId]),
  });

  return {
    sessions: sessionsQuery.data || [],
    sessionsLoading: sessionsQuery.isLoading,
    createSession: createSessionMutation.mutateAsync,

    participants: participantsQuery.data || [],
    participantsLoading: participantsQuery.isLoading,
    addParticipants: addParticipantsMutation.mutateAsync,
    updateParticipant: updateParticipantMutation.mutateAsync,
  };
};
