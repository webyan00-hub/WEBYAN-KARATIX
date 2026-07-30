import React, { useState, useEffect } from 'react';
import { X, Trophy, User, Calendar, FileText, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AchievementModal({ isOpen, onClose, onSave, initialData = null, members }) {
  const [formData, setFormData] = useState({ member_id: '', title: '', achievement_type: '', date: '', description: '' });
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ 
          member_id: initialData.member_id, 
          title: initialData.title, 
          achievement_type: initialData.achievement_type, 
          date: initialData.date, 
          description: initialData.description || '' 
        });
        const m = members.find(m => m.id === initialData.member_id);
        setMemberSearch(m ? `${m.last_name} ${m.first_name}` : '');
      } else {
        setFormData({ member_id: '', title: '', achievement_type: '', date: '', description: '' });
        setMemberSearch('');
      }
    }
  }, [isOpen, initialData, members]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-3xl w-full max-w-[600px] shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tighter">{initialData ? 'Modifier le palmarès' : 'Ajouter au palmarès'}</h2>
                <p className="text-slate-500 text-sm mt-1">Gérez les accomplissements de vos membres.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 flex-1 overflow-y-auto space-y-6">
            <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Membre</label>
                <div className="relative">
                    <input 
                      required 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" 
                      placeholder="Rechercher un membre..."
                      value={memberSearch}
                      onFocus={() => setShowMemberDropdown(true)}
                      onChange={e => {
                          setMemberSearch(e.target.value);
                          setShowMemberDropdown(true);
                          setFormData(prev => ({...prev, member_id: ''}));
                      }}
                    />
                    <ChevronDown className="absolute right-4 top-4 text-slate-400" size={20} />
                </div>
                {showMemberDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2">
                        {members
                          .filter(m => (m.first_name + ' ' + m.last_name).toLowerCase().includes(memberSearch.toLowerCase()))
                          .map(m => (
                            <button key={m.id} type="button" className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-900" onClick={() => {
                                setMemberSearch(`${m.last_name} ${m.first_name}`);
                                setFormData(prev => ({...prev, member_id: m.id}));
                                setShowMemberDropdown(false);
                            }}>
                                {m.last_name} {m.first_name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Titre</label><input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" placeholder="Ex: Champion National 2026" value={formData.title} onChange={e => setFormData(prev => ({...prev, title: e.target.value}))} /></div>
            
            <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Type</label><input required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" placeholder="Ex: Compétition" value={formData.achievement_type} onChange={e => setFormData(prev => ({...prev, achievement_type: e.target.value}))} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Date</label><input required type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.date} onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} /></div>
            </div>

            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Description</label><textarea className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold h-28" placeholder="Détails de l'accomplissement..." value={formData.description} onChange={e => setFormData(prev => ({...prev, description: e.target.value}))} /></div>

            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-200">
                Enregistrer
            </button>
        </form>
      </motion.div>
    </div>
  );
}
