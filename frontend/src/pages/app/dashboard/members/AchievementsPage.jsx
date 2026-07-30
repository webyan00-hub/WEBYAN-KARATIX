import React, { useState } from 'react';
import { Plus, Trash2, Trophy, Search, ChevronRight } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import { useAchievements } from './hooks/useAchievements';
import { useMembers } from './hooks/useMembers';
import AchievementModal from './components/AchievementModal';
import { motion } from 'framer-motion';

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
        toast('Palmarès modifié avec succès !', 'success');
      } else {
        await addAchievement(formData);
        toast('Palmarès ajouté avec succès !', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Supprimer cet accomplissement ?')) return;
    try {
      await deleteAchievement(id);
      toast('Supprimé avec succès', 'success');
    } catch (err) {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const filteredAchievements = achievements.filter(a => 
    (a.members?.first_name + ' ' + a.members?.last_name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center mb-10">
        <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tighter">Palmarès</h2>
            <p className="text-sm md:text-lg text-slate-500 font-medium mt-1">Suivi et célébration des accomplissements des membres.</p>
        </div>
        <button onClick={() => openModal()} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
            <Plus className="w-5 h-5"/> <span>Ajouter</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
            placeholder="Rechercher par nom de membre..."
            className="w-full pl-16 py-5 pr-6 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* List */}
      {loading ? <div className="text-center py-20 text-slate-400 font-black">Chargement...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map(a => (
            <motion.div 
                key={a.id} 
                whileHover={{ y: -4 }}
                onClick={() => openModal(a)} 
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 relative group cursor-pointer overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                    <Trophy className="w-6 h-6 text-indigo-600" />
                </div>
                <button onClick={(e) => handleDelete(e, a.id)} className="text-slate-300 hover:text-red-500 transition"><Trash2 className="w-5 h-5" /></button>
              </div>
              
              <h4 className="font-black text-xl text-slate-950 mb-2 leading-tight tracking-tighter">{a.title}</h4>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-widest">{a.achievement_type}</span>
                <span className="text-slate-400 text-xs font-medium font-mono">{new Date(a.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs">
                    {a.members?.first_name?.[0]}{a.members?.last_name?.[0]}
                </div>
                <p className="font-bold text-slate-900 text-sm">{a.members?.last_name.toUpperCase()} {a.members?.first_name}</p>
              </div>
              
              <p className="text-xs text-slate-500 leading-relaxed italic border-l-2 border-slate-200 pl-4">"{a.description}"</p>
            </motion.div>
          ))}
          {filteredAchievements.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500 font-bold border-2 border-dashed border-slate-100 rounded-3xl bg-white">
              Aucun accomplissement trouvé.
            </div>
          )}
        </div>
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
