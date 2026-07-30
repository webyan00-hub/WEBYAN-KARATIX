import React, { useState } from 'react';
import { Search, Download, Plus, Filter, Users, UserPlus } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useMembers } from './hooks/useMembers';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { membersService } from './services/membersService';
import MemberTable from './components/MemberTable';
import MemberCardList from './components/MemberCardList';
import MemberModal from './components/MemberModal';
import MemberDetailsModal from './components/MemberDetailsModal';
import { MembersListPDF } from './components/MembersListPDF';
import { motion } from 'framer-motion';

export default function MembersPage() {
  const { club } = useAuth();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [entryDateFilter, setEntryDateFilter] = useState('');

  const { members: allMembers, loading, error, addMember, updateMember, deleteMember } = useMembers();

  const members = allMembers.filter((m) => {
    const matchesSearch =
      (m.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (m.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (m.member_number?.toString() || '').includes(searchQuery);
    const matchesGrade = gradeFilter === '' || m.grade === gradeFilter;
    const matchesEntry = entryDateFilter === '' || 
        (m.entry_date && new Date(m.entry_date).getFullYear().toString() === entryDateFilter);
    return matchesSearch && matchesGrade && matchesEntry;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 10;
  const totalPages = Math.ceil(members.length / membersPerPage);
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = members.slice(indexOfFirstMember, indexOfLastMember);

  const resetFilters = () => {
    setSearchQuery('');
    setGradeFilter('');
    setEntryDateFilter('');
    setCurrentPage(1);
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

  if (error) return <div className="p-4 text-red-600">Erreur: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center mb-10">
        <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tighter">Annuaire des membres</h2>
            <p className="text-sm md:text-lg text-slate-500 font-medium mt-1">Gérez vos licenciés rapidement.</p>
        </div>
        <div className="flex gap-3">
          <PDFDownloadLink 
            document={<MembersListPDF members={members} />} 
            fileName="liste_membres.pdf"
            className="flex-1 md:flex-none px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold text-xs hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-sm"
          >
            {({ loading }) => (loading ? '...' : <><Download className="w-4 h-4" /> Exporter</>)}
          </PDFDownloadLink>
          <button 
            onClick={() => { setMemberToEdit(null); setIsModalOpen(true); }} 
            className="flex-1 md:flex-none px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <Plus className="w-4 h-4" /> <span>Nouveau</span>
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-grow min-w-[250px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
                type="text"
                placeholder="Rechercher par nom ou ID..."
                value={searchQuery}
                onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-2xl font-bold outline-none"
            />
        </div>
        
        <select value={gradeFilter} onChange={(e) => {setGradeFilter(e.target.value); setCurrentPage(1);}} className="px-6 py-5 bg-slate-50 border-none rounded-2xl font-black text-sm text-slate-900 outline-none">
            <option value="">Tous les grades</option>
            {['Blanche', 'Jaune', 'Orange', 'Verte', 'Bleue', 'Marron', 'Noire'].map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        
        <input type="number" placeholder="Année entrée" value={entryDateFilter} onChange={(e) => {setEntryDateFilter(e.target.value); setCurrentPage(1);}} className="px-6 py-5 bg-slate-50 border-none rounded-2xl font-black text-sm text-slate-900 outline-none w-40" />

        <button onClick={resetFilters} className="px-6 py-5 text-sm font-black text-slate-400 hover:text-red-600 transition">Réinitialiser</button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
            <div className="p-20 text-center text-slate-400 font-black">Chargement des membres...</div>
        ) : (
            <>
                <div className="hidden md:block">
                    <MemberTable members={currentMembers} onView={(m) => setSelectedMember(m)} />
                </div>
                <div className="md:hidden">
                    <MemberCardList members={currentMembers} onView={(m) => setSelectedMember(m)} getMemberStatus={membersService.getMemberStatus} />
                </div>
            </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-8">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="w-full md:w-auto px-6 py-4 bg-white border border-slate-200 rounded-xl font-black text-sm hover:bg-slate-50 disabled:opacity-50 transition shadow-sm">Précédent</button>
            <div className="px-6 py-4 bg-slate-100 rounded-xl text-sm font-black text-blue-600 font-mono shadow-inner">Page {currentPage} / {totalPages}</div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="w-full md:w-auto px-6 py-4 bg-white border border-slate-200 rounded-xl font-black text-sm hover:bg-slate-50 disabled:opacity-50 transition shadow-sm">Suivant</button>
        </div>
      )}

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
