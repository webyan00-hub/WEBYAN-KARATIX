import { useQuery, useQueryClient } from '@tanstack/react-query';
import { membersService } from '../services/membersService';
import { useAuth } from '../../../../../context/AuthContext';

export const useMembers = (filters = {}) => {
  const { club } = useAuth();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading: loading, error } = useQuery({
    queryKey: ['members', club?.id, filters],
    queryFn: async () => {
        const data = await membersService.getAllMembers(club.id, filters);
        console.log("Membres reçus après filtre:", data);
        return data;
    },
    enabled: !!club?.id,
  });

  const addMember = async (memberData) => {
    // Logique de mutation (simplifiée pour cet exemple, à transformer en mutation plus tard si besoin)
    const { photo, ...dataToInsert } = memberData;
    const newMember = await membersService.addMember({
        ...dataToInsert,
        club_id: club.id,
    });

    if (photo instanceof File) {
        const filePath = await membersService.uploadMemberPhoto(photo, club.id, newMember.id);
        await membersService.updateMember(newMember.id, { photo_url: filePath });
    }
    
    queryClient.invalidateQueries(['members', club?.id]);
    return newMember;
  };

  const updateMember = async (id, memberData) => {
    const updated = await membersService.updateMember(id, memberData);
    queryClient.invalidateQueries(['members', club?.id]);
    return updated;
  };

  const deleteMember = async (id) => {
    await membersService.deleteMember(id);
    queryClient.invalidateQueries(['members', club?.id]);
  };

  return {
    members,
    loading,
    error: error?.message || null,
    addMember,
    updateMember,
    deleteMember,
    refresh: () => queryClient.invalidateQueries(['members', club?.id]),
  };
};