import React, { useState, useMemo } from 'react';
import { X, UserPlus, Save, CheckCircle, AlertCircle, Clock, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMembers } from '../../members/hooks/useMembers';
import { useExams } from '../hooks/useExams';

export default function ExamParticipantsModal({ isOpen, onClose, session }) {
  const { members } = useMembers();
  const { participants, participantsLoading, addParticipants, updateParticipant } = useExams(session?.id || null);
  const [editingResult, setEditingResult] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');

  const handleAddParticipant = async (member) => {
    if (!session?.id) return;
    try {
      await addParticipants([{
        session_id: session.id,
        member_id: member.id,
        grade_before: member.grade,
        status: 'pending'
      }]);
    } catch (err) {
      console.error("Erreur ajout participant:", err);
    }
  };

  const handleUpdateResult = async (participantId, data) => {
    try {
      await updateParticipant({ participantId, data });
      setEditingResult(null);
    } catch (err) {
      console.error("Erreur mise à jour résultat:", err);
    }
  };

  const statusColors = {
    passed: 'bg-emerald-50 text-emerald-700',
    failed: 'bg-rose-50 text-rose-700',
    pending: 'bg-slate-100 text-slate-600'
  };

  const statusIcons = {
    passed: CheckCircle,
    failed: AlertCircle,
    pending: Clock
  };

  // Logique de recherche et limitation des membres
  const filteredMembers = useMemo(() => {
    const available = members.filter(m => !participants.find(p => p.member_id === m.id));
    
    if (memberSearch) {
        return available.filter(m => 
            m.first_name.toLowerCase().includes(memberSearch.toLowerCase()) || 
            m.last_name.toLowerCase().includes(memberSearch.toLowerCase())
        );
    }
    // Si pas de recherche, trier par date de création (récents en premier) et prendre les 5 derniers
    return [...available].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  }, [members, participants, memberSearch]);

  return (
    <AnimatePresence>
      {isOpen && session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header - Fixed Height */}
            <div className="flex-shrink-0 px-8 py-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Évaluation</h2>
                    <p className="text-slate-500 font-bold text-sm mt-1">{session.name} • {new Date(session.exam_date).toLocaleDateString()}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Participants */}
              <section className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Participants</h3>
                  {participantsLoading ? <div className="text-slate-400 font-bold">Chargement...</div> : (
                    participants.length > 0 ? (
                      participants.map(p => {
                        const StatusIcon = statusIcons[p.status];
                        return (
                          <motion.div key={p.id} className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50">
                              <div className="flex justify-between items-center mb-4">
                                  <div className='flex items-center gap-4'>
                                      <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center font-black text-slate-500 text-sm">
                                        {p.members.first_name[0]}{p.members.last_name[0]}
                                      </div>
                                      <div>
                                          <span className="font-black text-slate-900 block">{p.members.last_name.toUpperCase()} {p.members.first_name}</span>
                                          <span className="text-xs text-slate-400 font-mono">ID: {p.members.member_number}</span>
                                      </div>
                                  </div>
                                  <span className="text-xs font-black bg-white px-3 py-1.5 rounded-full border border-slate-100">{p.grade_before}</span>
                              </div>
                              
                              {editingResult?.id === p.id ? (
                                  <div className="space-y-4 mt-5 pt-5 border-t border-slate-100">
                                      <select className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm" onChange={e => setEditingResult({...editingResult, status: e.target.value})} value={editingResult.status}>
                                          <option value="pending">En attente</option>
                                          <option value="passed">Réussi</option>
                                          <option value="failed">Échoué</option>
                                      </select>
                                      <input className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm" placeholder="Nouveau grade" onChange={e => setEditingResult({...editingResult, grade_after: e.target.value})} value={editingResult.grade_after || ''} />
                                      <textarea className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm h-20" placeholder="Observations" onChange={e => setEditingResult({...editingResult, observations: e.target.value})} value={editingResult.observations || ''} />
                                      <button onClick={() => handleUpdateResult(p.id, editingResult)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700"><Save className="w-4 h-4" /> Sauvegarder</button>
                                  </div>
                              ) : (
                                  <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100">
                                      <span className={`text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-2 ${statusColors[p.status]}`}>
                                          <StatusIcon size={14} /> {p.status === 'pending' ? 'En attente' : p.status === 'passed' ? 'Réussi' : 'Échoué'}
                                      </span>
                                      <button onClick={() => setEditingResult(p)} className="text-blue-600 font-black text-sm hover:text-blue-700">Évaluer</button>
                                  </div>
                              )}
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-slate-400 text-sm font-bold p-4 text-center border-2 border-dashed border-slate-100 rounded-2xl">Aucun participant.</div>
                    )
                  )}
              </section>

              {/* Ajouter */}
              <section className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ajouter un membre</h3>
                  
                  <div className="relative">
                      <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <input 
                        placeholder="Rechercher un membre..." 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                      />
                  </div>

                  <div className="space-y-3">
                    {filteredMembers.length > 0 ? (
                        filteredMembers.map(m => (
                          <button key={m.id} onClick={() => handleAddParticipant(m)} className="w-full flex justify-between items-center p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left">
                            <span className="text-slate-900 font-bold text-sm">{m.last_name.toUpperCase()} {m.first_name}</span>
                            <UserPlus className="w-5 h-5 text-blue-600" />
                          </button>
                        ))
                    ) : (
                        <div className="text-slate-400 text-sm font-bold p-4 text-center">Aucun membre trouvé.</div>
                    )}
                  </div>
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
