import React, { useState } from 'react';
import { Plus, Calendar, UserCheck } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { Card } from '../payments/components/PaymentUIComponents';
import ExamSessionModal from './components/ExamSessionModal';
import ExamParticipantsModal from './components/ExamParticipantsModal';
import { useExams } from './hooks/useExams';

export default function ExamsPage() {
  const { club } = useAuth();
  const { sessions, sessionsLoading } = useExams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tighter mb-1">Examens</h2>
          <p className="text-base md:text-lg text-slate-600">Gestion des passages de grade du club.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full md:w-auto px-5 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
        >
            <Plus className="w-5 h-5" /> <span>Nouvelle Session</span>
        </button>
      </div>

      {sessionsLoading ? (
        <div className="text-center py-10">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <Card key={session.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Calendar className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-full">{new Date(session.exam_date).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{session.name}</h3>
              <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
                <UserCheck className="w-4 h-4" /> Examinateur : {session.examiner_name}
              </p>
              <button 
                onClick={() => setSelectedSession(session)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
              >
                Gérer les participants
              </button>
            </Card>
          ))}
          {sessions.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500">
              Aucune session d'examen programmée.
            </div>
          )}
        </div>
      )}

      <ExamSessionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ExamParticipantsModal isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} session={selectedSession} />
    </div>
  );
}
