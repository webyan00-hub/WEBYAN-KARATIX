import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { Plus, Trash2, Calendar as CalendarIcon, Clock, Layers } from 'lucide-react';

export default function PlanningPage() {
  const { club } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSession, setNewSession] = useState({ name: '', day_of_week: '1', start_time: '09:00', end_time: '11:00' });

  useEffect(() => {
    if (club?.id) fetchSessions();
  }, [club?.id]);

  const fetchSessions = async () => {
    setLoading(true);
    const data = await attendanceService.getSessions(club.id);
    setSessions(data);
    setLoading(false);
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    await attendanceService.createSession({ ...newSession, club_id: club.id });
    fetchSessions();
    setNewSession({ name: '', day_of_week: '1', start_time: '09:00', end_time: '11:00' });
  };

  const handleDeleteSession = async (sessionId) => {
    if (confirm('Supprimer cette séance ?')) {
        await attendanceService.deleteSession(sessionId);
        fetchSessions();
    }
  };

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-6 md:space-y-8 font-sans text-slate-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-slate-950">Planning des séances</h2>
        <p className="text-sm md:text-base text-slate-500 font-medium">Configurez les créneaux d'entraînement récurrents.</p>
      </div>

      {/* Formulaire ajout premium */}
      <form onSubmit={handleAddSession} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 md:gap-6 items-end">
        <div className="sm:col-span-2 md:col-span-2">
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Nom de la séance</label>
            <input required value={newSession.name} onChange={e => setNewSession({...newSession, name: e.target.value})} className="w-full p-3.5 md:p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800 text-sm md:text-base" placeholder="Ex: Entraînement Adulte" />
        </div>
        <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Jour</label>
            <select value={newSession.day_of_week} onChange={e => setNewSession({...newSession, day_of_week: e.target.value})} className="w-full p-3.5 md:p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800 text-sm md:text-base">
                {dayNames.map((name, i) => <option key={i} value={i}>{name}</option>)}
            </select>
        </div>
        <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Début</label>
            <input type="time" required value={newSession.start_time} onChange={e => setNewSession({...newSession, start_time: e.target.value})} className="w-full p-3.5 md:p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800 text-sm md:text-base" />
        </div>
        <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Fin</label>
            <input type="time" required value={newSession.end_time} onChange={e => setNewSession({...newSession, end_time: e.target.value})} className="w-full p-3.5 md:p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800 text-sm md:text-base" />
        </div>
        <button type="submit" className="bg-blue-600 text-white p-4 rounded-2xl font-black hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 text-sm md:text-base">
            <Plus className="w-5 h-5" /> Ajouter
        </button>
      </form>

      {/* Liste des séances premium */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-3 md:gap-4 bg-slate-50/50">
            <div className='p-2 md:p-3 bg-blue-100 text-blue-700 rounded-2xl'><Layers className="w-5 h-5 md:w-6 md:h-6"/></div>
            <h3 className="font-extrabold text-lg md:text-xl tracking-tight">Liste des créneaux programmés</h3>
        </div>
        
        {loading ? (
            <div className="p-8 md:p-12 text-center text-slate-400 font-medium">Chargement des séances...</div>
        ) : sessions.length > 0 ? (
            <div className="divide-y divide-slate-100">
                {sessions.map(s => (
                    <div key={s.id} className="px-6 md:px-8 py-4 md:py-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className='flex items-center gap-4 md:gap-6'>
                            <div className='text-center w-16 md:w-24'>
                                <span className="block font-black text-blue-700 text-lg md:text-xl">{dayNames[s.day_of_week].substring(0,3)}</span>
                            </div>
                            <div>
                                <span className="block font-bold text-base md:text-lg text-slate-900">{s.name}</span>
                                <span className="flex items-center gap-1.5 md:gap-2 text-slate-500 font-mono text-xs md:text-sm mt-0.5 md:mt-1"><Clock className="w-3.5 h-3.5 md:w-4 md:h-4"/> {s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</span>
                            </div>
                        </div>
                        <button onClick={() => handleDeleteSession(s.id)} className="p-2 md:p-3 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-8 md:p-12 text-center text-slate-500 font-medium">Aucune séance programmée.</div>
        )}
      </div>
    </div>
  );
}
