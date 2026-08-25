import React, { useMemo, useState } from 'react';
import { Award, Medal, Plus, Search, Trash2, Trophy } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import { useAchievements } from './hooks/useAchievements';
import { useMembers } from './hooks/useMembers';
import AchievementModal from './components/AchievementModal';

export default function AchievementsPage() {
  const toast = useToast();
  const { members } = useMembers();
  const { achievements, loading, addAchievement, updateAchievement, deleteAchievement } = useAchievements();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);

  const openModal = (achievement = null) => {
    setEditingAchievement(achievement);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingAchievement) {
        await updateAchievement({ id: editingAchievement.id, formData });
        toast('Palmares modifie avec succes !', 'success');
      } else {
        await addAchievement(formData);
        toast('Palmares ajoute avec succes !', 'success');
      }
      setIsModalOpen(false);
    } catch {
      toast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDelete = async (event, id) => {
    event.stopPropagation();
    if (!confirm('Supprimer cet accomplissement ?')) return;
    try {
      await deleteAchievement(id);
      toast('Supprime avec succes', 'success');
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const filteredAchievements = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return achievements.filter((achievement) => {
      const memberName = `${achievement.members?.first_name || ''} ${achievement.members?.last_name || ''}`.toLowerCase();
      return !normalizedSearch || memberName.includes(normalizedSearch) || achievement.title?.toLowerCase().includes(normalizedSearch);
    });
  }, [achievements, searchQuery]);

  const uniqueMembers = new Set(achievements.map((achievement) => achievement.member_id)).size;

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 md:space-y-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Club</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">Palmares</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Valorisez les accomplissements et distinctions des membres.</p>
        </div>
        <button onClick={() => openModal()} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="rounded-2xl border border-blue-500 bg-blue-600 p-3 text-white shadow-lg shadow-blue-100 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-blue-100"><Trophy className="h-4 w-4" /> Total</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{achievements.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-500 bg-amber-500 p-3 text-white shadow-lg shadow-amber-100 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-amber-100"><Medal className="h-4 w-4" /> Membres</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{uniqueMembers}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 text-white shadow-lg shadow-slate-200 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-300"><Award className="h-4 w-4" /> Resultats</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{filteredAchievements.length}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Rechercher membre ou titre"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm font-black text-slate-400">Chargement...</div>
      ) : filteredAchievements.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredAchievements.map((achievement) => (
            <button key={achievement.id} onClick={() => openModal(achievement)} className="group rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Trophy className="h-5 w-5" />
                </div>
                <button onClick={(event) => handleDelete(event, achievement.id)} className="rounded-xl p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <h4 className="mt-4 line-clamp-2 text-lg font-black tracking-tight text-slate-950">{achievement.title}</h4>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">{achievement.achievement_type}</span>
                <span className="text-xs font-bold text-slate-400">{achievement.date ? new Date(achievement.date).toLocaleDateString() : '-'}</span>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-xs font-black text-slate-700 shadow-sm">
                  {achievement.members?.first_name?.[0]}{achievement.members?.last_name?.[0]}
                </div>
                <p className="min-w-0 truncate text-sm font-black text-slate-950">{achievement.members?.last_name?.toUpperCase()} {achievement.members?.first_name}</p>
              </div>
              {achievement.description && <p className="mt-4 line-clamp-2 text-sm font-medium text-slate-500">{achievement.description}</p>}
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm font-bold text-slate-500">Aucun accomplissement trouve.</div>
      )}

      <AchievementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingAchievement}
        members={members}
      />
    </div>
  );
}
