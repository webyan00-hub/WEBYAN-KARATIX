import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { Plus, Trash2, Calendar as CalendarIcon, Clock, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center mb-10">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tighter">Gestion du Planning</h2>
          <p className="text-sm md:text-lg text-slate-500 font-medium mt-1">Configurez vos créneaux d'entraînement récurrents.</p>
        </div>
      </div>

      {/* Formulaire ajout premium */}
      <form onSubmit={handleAddSession} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-6 items-end">
        <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Nom de la séance</label>
            <input required value={newSession.name} onChange={e => setNewSession({...newSession, name: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Ex: Entraînement Adulte" />
        </div>
        <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Jour</label>
            <select value={newSession.day_of_week} onChange={e => setNewSession({...newSession, day_of_week: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                {dayNames.map((name, i) => <option key={i} value={i}>{name}</option>)}
            </select>
        </div>
        <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Début</label>
            <input type="time" required value={newSession.start_time} onChange={e => setNewSession({...newSession, start_time: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Fin</label>
            <input type="time" required value={newSession.end_time} onChange={e => setNewSession({...newSession, end_time: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <button type="submit" className="w-full md:col-span-1 h-[60px] md:h-[68px] bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
            <Plus size={20} /> Ajouter
        </button>
      </form>

      {/* Liste des séances premium */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
            <div className='p-3 md:p-4 bg-blue-50 text-blue-600 rounded-2xl'><Layers size={20} className="md:w-6 md:h-6"/></div>
            <h3 className="font-black text-lg md:text-xl text-slate-950">Créneaux programmés</h3>
        </div>
        
        {loading ? (
            <div className="p-12 text-center text-slate-400 font-black">Chargement...</div>
        ) : sessions.length > 0 ? (
            <div className="divide-y divide-slate-100">
                {sessions.map(s => (
                    <motion.div layout key={s.id} className="px-6 md:px-8 py-5 md:py-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className='flex items-center gap-4 md:gap-6'>
                            <div className='text-center w-16 md:w-24 p-3 md:p-5 rounded-2xl bg-slate-50 border border-slate-100'>
                                <span className="block font-black text-blue-600 text-sm md:text-lg uppercase">{dayNames[s.day_of_week].substring(0,3)}</span>
                            </div>
                            <div>
                                <span className="block font-black text-base md:text-lg text-slate-950">{s.name}</span>
                                <span className="flex items-center gap-2 text-slate-500 font-bold text-[10px] md:text-xs mt-1 font-mono"><Clock size={12}/> {s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</span>
                            </div>
                        </div>
                        <button onClick={() => handleDeleteSession(s.id)} className="p-3 text-slate-300 hover:bg-red-50 hover:text-red-600 rounded-2xl transition">
                            <Trash2 size={18} />
                        </button>
                    </motion.div>
                ))}
            </div>
        ) : (
            <div className="p-10 md:p-20 text-center text-slate-500 font-bold border-2 border-dashed border-slate-100 rounded-3xl bg-white m-4 md:m-8">Aucune séance programmée.</div>
        )}
      </div>
    </div>
  );
}
