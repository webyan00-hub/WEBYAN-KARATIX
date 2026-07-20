import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useMembers } from './hooks/useMembers';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { membersService } from './services/membersService';
import MemberTable from './components/MemberTable';
import MemberModal from './components/MemberModal';
import MemberDetailsModal from './components/MemberDetailsModal';
import { MembersListPDF } from './components/MembersListPDF';

export default function MembersPage() {
  const { club } = useAuth();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // États de filtrage
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const { members, loading, error, addMember, updateMember, deleteMember } = useMembers({
    searchQuery,
    gradeFilter,
    genderFilter
  });

  const resetFilters = () => {
    setSearchQuery('');
    setGradeFilter('');
    setGenderFilter('');
  };

  const handleSaveMember = async (data) => {
    try {
      if (memberToEdit) {
        await updateMember(memberToEdit.id, data);
        toast('Membre modifié avec succès !', 'success');
      } else {
        const memberNumber = await membersService.generateMemberNumber(club.id);
        await addMember({ ...data, member_number: memberNumber });
        toast('Membre ajouté avec succès !', 'success');
      }
      setIsModalOpen(false);
      setMemberToEdit(null);
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  const handleEdit = (member) => {
    setMemberToEdit(member);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMember(id);
      toast('Membre supprimé.', 'success');
      setSelectedMember(null);
    } catch (err) {
      toast('Erreur lors de la suppression.', 'error');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="p-4 text-red-600">Erreur: {error}</div>;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Header (Titre + Boutons) */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-8 gap-4 text-center md:text-left">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight w-full md:w-auto">Membres</h2>
        
        <div className="flex flex-col md:flex-row w-full md:w-auto gap-3 items-center md:items-stretch">
          <PDFDownloadLink 
            document={<MembersListPDF members={members} />} 
            fileName="liste_membres.pdf"
            className="w-fit md:w-auto px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-2"
          >
            {({ loading }) => (loading ? '...' : <><Download className="w-4 h-4" /> Exporter PDF</>)}
          </PDFDownloadLink>
          <button 
            onClick={() => { setMemberToEdit(null); setIsModalOpen(true); }} 
            className="w-fit md:w-auto px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
          >
            + Ajouter membre
          </button>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center md:items-center w-full max-w-sm md:max-w-none mx-auto md:mx-0">
        <div className="relative w-full max-w-xs md:max-w-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-xs md:max-w-none md:w-auto">
          <select 
            value={gradeFilter} 
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les grades</option>
            {['Blanche', 'Jaune', 'Orange', 'Verte', 'Bleue', 'Marron', 'Noire'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select 
            value={genderFilter} 
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sexe</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>

          {(searchQuery || gradeFilter || genderFilter) && (
            <button onClick={resetFilters} className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 transition text-center w-fit mx-auto md:w-auto md:mx-0">
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <MemberTable members={members} onView={(m) => setSelectedMember(m)} />


      <MemberModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setMemberToEdit(null); }} 
        onSave={handleSaveMember}
        initialData={memberToEdit}
      />

      <MemberDetailsModal 
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}
