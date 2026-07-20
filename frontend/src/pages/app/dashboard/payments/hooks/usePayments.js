import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '../services/paymentsService';
import { useAuth } from '../../../../../context/AuthContext';

export const usePayments = (memberId = null) => {
  const { club } = useAuth();
  const queryClient = useQueryClient();

  // Récupérer tous les paiements du club
  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['payments', club?.id],
    queryFn: () => paymentsService.getAllPayments(club.id),
    enabled: !!club?.id,
  });

  // Récupérer les paiements d'un membre spécifique
  const { data: memberPayments = [], isLoading: loadingMemberPayments } = useQuery({
    queryKey: ['payments', 'member', memberId],
    queryFn: () => paymentsService.getPaymentsByMember(memberId),
    enabled: !!memberId,
  });

  // Mutation pour ajouter des paiements
  const addPaymentsMutation = useMutation({
    mutationFn: (data) => paymentsService.addPaymentsAtomic(club.id, data.memberId, data.subscriptionId, data.payments),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments', club?.id]);
      if (memberId) {
        queryClient.invalidateQueries(['payments', 'member', memberId]);
      }
    },
  });

  return {
    payments,
    memberPayments,
    loading: loadingPayments || loadingMemberPayments,
    addPayments: addPaymentsMutation.mutateAsync,
  };
};
