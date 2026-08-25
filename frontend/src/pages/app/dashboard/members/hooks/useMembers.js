import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersService } from '../services/membersService';
import { useAuth } from '../../../../../context/AuthContext';

export const useMembers = (filters = {}) => {
  const { club } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['members', club?.id, filters];

  const { data: members = [], isLoading: loading, error } = useQuery({
    queryKey,
    queryFn: async () => membersService.getAllMembers(club.id, filters),
    enabled: !!club?.id,
    staleTime: 5_000,
  });

  const mutationOptions = {
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousMembers = queryClient.getQueryData(queryKey);
      return { previousMembers };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(queryKey, context.previousMembers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  };

  const addMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (memberData) => {
      const { photo, ...dataToInsert } = memberData;
      const newMember = await membersService.addMember({ ...dataToInsert, club_id: club.id });
      if (photo instanceof File) {
        const filePath = await membersService.uploadMemberPhoto(photo, club.id, newMember.id);
        return await membersService.updateMember(newMember.id, { ...newMember, photo_url: filePath });
      }
      return newMember;
    },
  });

  const updateMutation = useMutation({
    ...mutationOptions,
    mutationFn: async ({ id, memberData }) => {
      const { photo, ...dataToUpdate } = memberData;
      let updatePayload = { ...dataToUpdate };
      if (photo instanceof File) {
        const filePath = await membersService.uploadMemberPhoto(photo, club.id, id);
        updatePayload.photo_url = filePath;
      }
      return await membersService.updateMember(id, updatePayload);
    },
  });

  const deleteMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (id) => {
      return await membersService.deleteMember(id);
    },
  });

  return {
    members,
    loading,
    error: error?.message || null,
    addMember: addMutation.mutateAsync,
    updateMember: (id, memberData) => updateMutation.mutateAsync({ id, memberData }),
    deleteMember: deleteMutation.mutateAsync,
    refresh: () => queryClient.invalidateQueries({ queryKey }),
  };
};
