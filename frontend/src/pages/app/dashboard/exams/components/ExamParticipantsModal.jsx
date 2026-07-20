import React, { useState } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { useMembers } from '../../members/hooks/useMembers';
import { useExams } from '../hooks/useExams';

export default function ExamParticipantsModal({ isOpen, onClose, session }) {
  const { members } = useMembers();
  const { participants, participantsLoading, addParticipants, updateParticipant } = useExams(session?.id);
  const [editingResult, setEditingResult] = useState(null);

  const handleAddParticipant = async (member) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 p-6 md:p-8 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">Évaluation: {session.name}</h2>
            <p className="text-slate-400 text-xs md:text-sm">Organisée le {new Date(session.exam_date).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition"><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="space-y-4 mb-8 md:mb-10">
          {participantsLoading ? <div className="text-slate-400">Chargement...</div> : (
            participants.map(p => (
              <div key={p.id} className="p-4 md:p-5 border border-slate-700 rounded-2xl bg-slate-800/50">
                  <div className="flex justify-between items-center mb-4">
                      <div className='flex items-center gap-3'>
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs md:text-sm">
                              {p.members.first_name[0]}{p.members.last_name[0]}
                          </div>
                          <div>
                              <span className="font-bold text-white block text-sm md:text-base">{p.members.last_name.toUpperCase()} {p.members.first_name}</span>
                              <span className="text-[10px] md:text-xs text-slate-400 font-mono">ID: {p.members.member_number}</span>
                          </div>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold bg-slate-700 text-slate-300 px-3 py-1 rounded-full">{p.grade_before}</span>
                  </div>
                  
                  {editingResult?.id === p.id ? (
                      <div className="space-y-3 mt-4 pt-4 border-t border-slate-700">
                          <select className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-sm" onChange={e => setEditingResult({...editingResult, status: e.target.value})} value={editingResult.status}>
                              <option value="pending">En attente</option>
                              <option value="passed">Réussi</option>
                              <option value="failed">Échoué</option>
                          </select>
                          <input className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-sm" placeholder="Nouveau grade" onChange={e => setEditingResult({...editingResult, grade_after: e.target.value})} value={editingResult.grade_after || ''} />
                          <textarea className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-sm h-20" placeholder="Observations" onChange={e => setEditingResult({...editingResult, observations: e.target.value})} value={editingResult.observations || ''} />
                          <button onClick={() => handleUpdateResult(p.id, editingResult)} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 text-sm"><Save className="w-4 h-4" /> Sauvegarder évaluation</button>
                      </div>
                  ) : (
                      <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl">
                          <span className={`text-[10px] md:text-xs font-bold px-3 py-1 rounded-full ${p.status === 'passed' ? 'bg-emerald-900 text-emerald-300' : p.status === 'failed' ? 'bg-red-900 text-red-300' : 'bg-slate-700 text-slate-300'}`}>
                              {p.status === 'pending' ? 'En attente' : p.status === 'passed' ? 'Réussi' : 'Échoué'}
                          </span>
                          <button onClick={() => setEditingResult(p)} className="text-blue-400 font-bold text-xs md:text-sm hover:text-blue-300">Évaluer</button>
                      </div>
                  )}
              </div>
            ))
          )}
        </div>

        <div>
          <h3 className="text-base md:text-lg font-bold text-white mb-4">Ajouter des membres</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {members.filter(m => !participants.find(p => p.member_id === m.id)).map(m => (
              <button key={m.id} onClick={() => handleAddParticipant(m)} className="w-full flex justify-between items-center p-3 md:p-4 border border-slate-700 rounded-2xl hover:bg-slate-800 transition">
                <span className="text-white font-medium text-sm md:text-base">{m.last_name.toUpperCase()} {m.first_name}</span>
                <UserPlus className="w-5 h-5 text-blue-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
