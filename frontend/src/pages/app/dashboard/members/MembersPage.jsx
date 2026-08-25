import React, { Suspense, lazy, useMemo, useState } from 'react';
import { Search, Download, Plus, RotateCcw, Users, UserCheck, UserX } from 'lucide-react';
import { useMembers } from './hooks/useMembers';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { membersService } from './services/membersService';
import MemberTable from './components/MemberTable';
import MemberCardList from './components/MemberCardList';
import MemberModal from './components/MemberModal';
import MemberDetailsModal from './components/MemberDetailsModal';

const MembersPdfExport = lazy(() => import('./components/MembersPdfExport'));

export default function MembersPage() {
  const { club } = useAuth();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPdfExport, setShowPdfExport] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [entryDateFilter, setEntryDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { members: allMembers, loading, error, addMember, updateMember, deleteMember } = useMembers();

  const members = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return allMembers.filter((member) => {
      const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        (member.member_number?.toString() || '').includes(normalizedSearch);
      const matchesGrade = !gradeFilter || member.grade === gradeFilter;
      const matchesEntry =
        !entryDateFilter ||
        (member.entry_date && new Date(member.entry_date).getFullYear().toString() === entryDateFilter);

      return matchesSearch && matchesGrade && matchesEntry;
    });
  }, [allMembers, entryDateFilter, gradeFilter, searchQuery]);

  const stats = useMemo(() => {
    const active = allMembers.filter((member) => member.active).length;
    return {
      total: allMembers.length,
      active,
      inactive: Math.max(allMembers.length - active, 0),
    };
  }, [allMembers]);

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

  const openCreateModal = () => {
    setMemberToEdit(null);
    setIsModalOpen(true);
  };

  const handleSaveMember = async (data) => {
    setIsSaving(true);

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
    } catch (saveError) {
      toast(saveError.message, 'error');
    } finally {
      setIsSaving(false);
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
    } catch {
      toast('Erreur lors de la suppression.', 'error');
    }
  };

  if (error) return <div className="p-4 text-red-600">Erreur: {error}</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-8 space-y-5 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Membres</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-4xl">Annuaire des membres</h2>
          <p className="text-sm font-medium text-slate-500">Recherche, ajout et suivi rapide des licenciés.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          {showPdfExport ? (
            <Suspense fallback={<button className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500">Préparation...</button>}>
              <MembersPdfExport members={members} />
            </Suspense>
          ) : (
            <button
              type="button"
              onClick={() => setShowPdfExport(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Exporter
            </button>
          )}

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Nouveau
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="rounded-2xl border border-blue-500 bg-blue-600 p-3 text-white shadow-lg shadow-blue-100 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-blue-100"><Users className="h-4 w-4" /> Total</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500 bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-100 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-emerald-100"><UserCheck className="h-4 w-4" /> Actifs</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 text-white shadow-lg shadow-slate-200 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-300"><UserX className="h-4 w-4" /> Inactifs</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{stats.inactive}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_150px_auto] md:items-center">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Rechercher nom, prénom ou ID"
              value={searchQuery}
              onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <select value={gradeFilter} onChange={(event) => { setGradeFilter(event.target.value); setCurrentPage(1); }} className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50">
            <option value="">Tous les grades</option>
            {['Blanche', 'Jaune', 'Orange', 'Verte', 'Bleue', 'Marron', 'Noire'].map((grade) => <option key={grade} value={grade}>{grade}</option>)}
          </select>

          <input
            type="number"
            placeholder="Année"
            value={entryDateFilter}
            onChange={(event) => { setEntryDateFilter(event.target.value); setCurrentPage(1); }}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />

          <button onClick={resetFilters} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <RotateCcw className="h-4 w-4" /> Réinitialiser
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm font-bold text-slate-400">Chargement des membres...</div>
        ) : members.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Users className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">Aucun membre trouvé</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">Essayez de modifier les filtres ou ajoutez un nouveau membre.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <MemberTable members={currentMembers} onView={(member) => setSelectedMember(member)} />
            </div>
            <div className="md:hidden">
              <MemberCardList members={currentMembers} onView={(member) => setSelectedMember(member)} getMemberStatus={membersService.getMemberStatus} />
            </div>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40">Précédent</button>
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-xs font-black text-blue-600">Page {currentPage} / {totalPages}</div>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40">Suivant</button>
        </div>
      )}

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setMemberToEdit(null); }}
        onSave={handleSaveMember}
        initialData={memberToEdit}
        isSaving={isSaving}
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
