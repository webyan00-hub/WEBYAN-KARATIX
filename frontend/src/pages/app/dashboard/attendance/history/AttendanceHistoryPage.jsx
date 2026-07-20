import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Filter, Layers } from 'lucide-react';

export default function AttendanceHistoryPage() {
  const { club } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (club?.id) fetchAttendances();
  }, [club?.id, date]);

  const fetchAttendances = async () => {
    setLoading(true);
    const data = await attendanceService.getAttendancesByDate(club.id, date);
    setAttendances(data);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-6 md:space-y-8 font-sans text-slate-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-slate-950">Historique des présences</h2>
        <p className="text-sm md:text-base text-slate-500 font-medium">Visualisez le suivi détaillé des entraînements.</p>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-full">
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Choisir la date d'audit</label>
            <div className="flex items-center gap-3 bg-slate-50 p-3.5 md:p-4 rounded-2xl">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent border-none focus:ring-0 font-bold text-slate-800 text-sm md:text-base w-full" />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-3 md:gap-4 bg-slate-50/50">
            <div className='p-2 md:p-3 bg-blue-100 text-blue-700 rounded-2xl'><Layers className="w-5 h-5 md:w-6 md:h-6"/></div>
            <h3 className="font-extrabold text-lg md:text-xl tracking-tight">Enregistrements du {new Date(date).toLocaleDateString('fr-FR')}</h3>
        </div>

        {loading ? (
            <div className="p-8 md:p-12 text-center text-slate-400 font-medium">Analyse des données en cours...</div>
        ) : attendances.length > 0 ? (
            <div className="divide-y divide-slate-100">
                {attendances.map(a => (
                    <div key={a.id} className="px-6 md:px-8 py-4 md:py-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className='flex items-center gap-4 md:gap-6'>
                            <div className='text-center w-24 md:w-32'>
                                <span className="block font-bold text-slate-900 text-sm md:text-base">{a.sessions?.name}</span>
                                <span className="text-slate-500 font-mono text-[10px] md:text-xs"><Clock className="w-3 h-3 inline"/> {a.sessions?.start_time.slice(0,5)}</span>
                            </div>
                            <div>
                                <span className="block font-black text-base md:text-lg text-slate-950">{a.members?.last_name} {a.members?.first_name}</span>
                            </div>
                        </div>
                        
                        {a.status === 'present' ? 
                            <span className="inline-flex items-center gap-1.5 md:gap-2 text-emerald-700 bg-emerald-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest"><CheckCircle className="w-3 h-3 md:w-4 md:h-4"/> Présent</span> :
                            <span className="inline-flex items-center gap-1.5 md:gap-2 text-red-700 bg-red-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest"><XCircle className="w-3 h-3 md:w-4 md:h-4"/> Absent</span>
                        }
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-10 md:p-16 text-center text-slate-500 font-medium bg-slate-50/50">Aucun pointage enregistré pour cette date.</div>
        )}
      </div>
    </div>
  );
}
