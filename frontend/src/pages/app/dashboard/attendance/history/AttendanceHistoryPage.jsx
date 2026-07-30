import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { Calendar as CalendarIcon, Clock, Layers, X, User, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AttendanceHistoryPage() {
  const { club } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    if (club?.id) fetchAttendances();
  }, [club?.id, date]);

  const fetchAttendances = async () => {
    setLoading(true);
    const data = await attendanceService.getAttendancesByDate(club.id, date, null);
    setAttendances(data);
    setLoading(false);
  };

  const groupedAttendances = attendances.reduce((acc, curr) => {
    const sessionId = curr.session_id;
    if (!acc[sessionId]) {
      acc[sessionId] = {
        name: curr.sessions?.name || 'Séance inconnue',
        start_time: curr.sessions?.start_time,
        attendances: []
      };
    }
    acc[sessionId].attendances.push(curr);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center mb-10">
        <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tighter">Historique des Présences</h2>
            <p className="text-sm md:text-lg text-slate-500 font-medium mt-1">Suivi complet et analytique des séances.</p>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 w-full md:w-auto">
            <CalendarIcon className="w-5 h-5 text-blue-600 ml-3" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent border-none focus:ring-0 font-black text-slate-900 p-3 w-full md:w-auto cursor-pointer" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-black">Chargement...</div>
      ) : Object.keys(groupedAttendances).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedAttendances).map(([sessionId, sessionData]) => (
            <motion.div 
                key={sessionId} 
                whileHover={{ y: -4 }}
                onClick={() => setSelectedSession(sessionData)} 
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
                <div className='flex items-center gap-4 mb-8'>
                    <div className='p-4 bg-slate-50 text-slate-600 rounded-2xl'><Layers className="w-6 h-6"/></div>
                    <div>
                        <h3 className="font-black text-xl text-slate-950 tracking-tighter">{sessionData.name}</h3>
                        <p className="text-slate-500 font-bold text-xs flex items-center gap-1.5 font-mono"><Clock className="w-3 h-3"/> {sessionData.start_time?.slice(0,5)}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                        <span className="block text-emerald-600 font-black text-2xl font-mono">{sessionData.attendances.filter(a => a.status === 'present').length}</span>
                        <span className="text-emerald-800 text-[10px] font-black uppercase tracking-widest">Présents</span>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-2xl">
                        <span className="block text-slate-600 font-black text-2xl font-mono">{sessionData.attendances.filter(a => a.status !== 'present').length}</span>
                        <span className="text-slate-800 text-[10px] font-black uppercase tracking-widest">Absents</span>
                    </div>
                </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-20 text-center text-slate-500 font-bold border-2 border-dashed border-slate-100 rounded-3xl bg-white">Aucun pointage enregistré pour cette date.</div>
      )}

      {selectedSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setSelectedSession(null)}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-950 text-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-slate-800"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h3 className="font-black text-xl text-white">{selectedSession.name}</h3>
                    <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-6 h-6"/></button>
                </div>
                <div className="overflow-y-auto p-4">
                    {selectedSession.attendances
                        .filter(a => a.status === 'present')
                        .map(a => (
                        <div key={a.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-900 rounded-2xl transition">
                            <div className='p-3 bg-emerald-900/30 rounded-full'><User className="w-5 h-5 text-emerald-400"/></div>
                            <span className="font-bold text-slate-100">{a.members?.last_name.toUpperCase()} {a.members?.first_name}</span>
                        </div>
                    ))}
                    {selectedSession.attendances.filter(a => a.status === 'present').length === 0 && (
                        <p className="text-center py-10 text-slate-500 font-bold">Aucun présent.</p>
                    )}
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
}
