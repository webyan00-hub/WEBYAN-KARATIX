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
        return data;
    },
    enabled: !!club?.id,
  });

  const addMember = async (memberData) => {
    console.log("DEBUG - Début addMember");
    const { photo, ...dataToInsert } = memberData;
    
    // On prépare l'objet d'insertion, photo_url sera mis à jour si une photo est uploadée
    let memberToCreate = { ...dataToInsert };
    
    const newMember = await membersService.addMember({
        ...memberToCreate,
        club_id: club.id,
    });

    if (photo instanceof File) {
        console.log("DEBUG - Détection fichier photo dans addMember");
        const filePath = await membersService.uploadMemberPhoto(photo, club.id, newMember.id);
        await membersService.updateMember(newMember.id, { photo_url: filePath });
    }
    
    queryClient.invalidateQueries(['members', club?.id]);
    return newMember;
  };

  const updateMember = async (id, memberData) => {
    console.log("DEBUG - Début updateMember");
    const { photo, ...dataToUpdate } = memberData;
    
    let updatePayload = { ...dataToUpdate };
    
    if (photo instanceof File) {
        console.log("DEBUG - Détection fichier photo dans updateMember");
        const filePath = await membersService.uploadMemberPhoto(photo, club.id, id);
        updatePayload.photo_url = filePath;
    }
    
    const updated = await membersService.updateMember(id, updatePayload);
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