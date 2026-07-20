import React, { useState } from 'react';
import { Plus, Trash2, Trophy, Calendar, User, Search, X } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import { useAchievements } from './hooks/useAchievements';
import { useMembers } from './hooks/useMembers';

export default function AchievementsPage() {
  const toast = useToast();
  const { members } = useMembers();
  const { achievements, loading, addAchievement, updateAchievement, deleteAchievement } = useAchievements();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [formData, setFormData] = useState({ member_id: '', title: '', achievement_type: '', date: '', description: '' });
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const openModal = (achievement = null) => {
    if (achievement) {
      setEditingAchievement(achievement);
      setFormData({ 
          member_id: achievement.member_id, 
          title: achievement.title, 
          achievement_type: achievement.achievement_type, 
          date: achievement.date, 
          description: achievement.description || '' 
      });
      setMemberSearch(`${achievement.members?.last_name} ${achievement.members?.first_name}`);
    } else {
      setEditingAchievement(null);
      setFormData({ member_id: '', title: '', achievement_type: '', date: '', description: '' });
      setMemberSearch('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.member_id) {
        toast('Veuillez sélectionner un membre', 'error');
        return;
    }
    try {
      if (editingAchievement) {
        await updateAchievement({ id: editingAchievement.id, formData });
        toast('Palmarès modifié avec succès !', 'success');
      } else {
        await addAchievement(formData);
        toast('Palmarès ajouté avec succès !', 'success');
      }
      setFormData({ member_id: '', title: '', achievement_type: '', date: '', description: '' });
      setMemberSearch('');
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
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
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tighter">Palmarès du Club</h2>
            <p className="text-slate-600">Suivi des accomplissements des membres.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 transition">
            <Plus className="w-5 h-5"/> Ajouter accomplissement
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
            placeholder="Rechercher par nom de membre..."
            className="w-full pl-12 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? <div className="text-center py-10">Chargement...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.slice(0, 10).map(a => (
            <div key={a.id} onClick={() => openModal(a)} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="flex justify-between items-start mb-6">
                <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Trophy className="w-6 h-6" />
                </div>
                <button onClick={(e) => handleDelete(e, a.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-5 h-5" /></button>
              </div>
              <h4 className="font-extrabold text-xl text-slate-950 mb-2 leading-snug">{a.title}</h4>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">{a.achievement_type}</span>
                <span className="text-slate-400 text-xs font-medium">{new Date(a.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {a.members?.first_name[0]}{a.members?.last_name[0]}
                </div>
                <p className="text-sm font-semibold text-slate-900">{a.members?.last_name} {a.members?.first_name}</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-4">"{a.description}"</p>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
            <h3 className="text-2xl font-bold mb-6">{editingAchievement ? 'Modifier le palmarès' : 'Ajouter au palmarès'}</h3>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Membre</label>
                <input 
                  required 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" 
                  placeholder="Rechercher un membre..."
                  value={memberSearch}
                  onFocus={() => setShowMemberDropdown(true)}
                  onChange={e => {
                      setMemberSearch(e.target.value);
                      setShowMemberDropdown(true);
                      setFormData({...formData, member_id: ''});
                  }}
                />
                {showMemberDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {members
                          .filter(m => (m.first_name + ' ' + m.last_name).toLowerCase().includes(memberSearch.toLowerCase()))
                          .map(m => (
                            <div 
                                key={m.id} 
                                className="p-3 hover:bg-slate-50 cursor-pointer"
                                onClick={() => {
                                    setMemberSearch(`${m.last_name} ${m.first_name}`);
                                    setFormData({...formData, member_id: m.id});
                                    setShowMemberDropdown(false);
                                }}
                            >
                                {m.last_name} {m.first_name}
                            </div>
                        ))}
                    </div>
                )}
              </div>
              <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Titre" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Type" value={formData.achievement_type} onChange={e => setFormData({...formData, achievement_type: e.target.value})} />
              <input required type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl h-24" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
