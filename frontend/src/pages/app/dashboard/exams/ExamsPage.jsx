import React, { useState } from 'react';
import { Plus, Calendar, UserCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { motion } from 'framer-motion';
import ExamSessionModal from './components/ExamSessionModal';
import ExamParticipantsModal from './components/ExamParticipantsModal';
import { useExams } from './hooks/useExams';

const ExamLiveCard = ({ session, onClick }) => {
  const progress = 75; // Simulation dynamique

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="p-3 bg-slate-50 rounded-2xl">
          <Calendar className="w-6 h-6 text-slate-600" />
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] uppercase font-black tracking-widest rounded-full">
          À venir
        </span>
      </div>
      
      <h3 className="text-xl font-black text-slate-950 tracking-tighter mb-2">{session.name}</h3>
      <p className="text-xs text-slate-500 mb-8 flex items-center gap-2 font-bold">
        <UserCheck className="w-4 h-4 text-slate-400" /> Examinateur : {session.examiner_name}
      </p>
      
      <div className="space-y-2 mb-8">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
           <span>Avancement</span>
           <span>{progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div className="h-full bg-blue-600" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
        </div>
      </div>
      
      <button 
        onClick={() => onClick(session)}
        className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
      >
        Gérer les inscrits <ChevronRight size={16} />
      </button>
    </motion.div>
  );
};

export default function ExamsPage() {
  const { club } = useAuth();
  const { sessions, sessionsLoading } = useExams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center mb-10">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tighter">Passage de grade</h2>
          <p className="text-sm md:text-lg text-slate-500 font-medium mt-1">Organisez et suivez les sessions de passage de grade.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)} 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
            <Plus className="w-5 h-5" /> <span>Nouvelle Session</span>
        </button>
      </div>

      {/* Liste des Sessions */}
      {sessionsLoading ? (
        <div className="text-center py-20 text-slate-400 font-black">Chargement...</div>
      ) : (
        <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Sessions programmées</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map(session => (
                <ExamLiveCard key={session.id} session={session} onClick={setSelectedSession} />
              ))}
              {sessions.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-500 font-bold border-2 border-dashed border-slate-100 rounded-3xl bg-white">
                  Aucune session de passage de grade programmée pour le moment.
                </div>
              )}
            </div>
        </div>
      )}

      <ExamSessionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={() => {}} clubId={club?.id} />
      <ExamParticipantsModal isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} session={selectedSession} />   
    </div>
  );
}
