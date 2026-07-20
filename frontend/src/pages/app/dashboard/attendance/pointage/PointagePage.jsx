import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useToast } from '../../../../../context/ToastContext';
import { attendanceService } from '../services/attendanceService';
import { useAttendance } from '../hooks/useAttendance';
import { Check, X, Lock, Save, Clock, Calendar as CalendarIcon, UserCircle } from 'lucide-react';

export default function PointagePage() {
  const { club, user } = useAuth();
  const toast = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { sessions, attendances: existingAttendances, loading: loadingAttendance, saveAttendances, updateInstance } = useAttendance(date);
  
  const [selectedSession, setSelectedSession] = useState(null);
  const [members, setMembers] = useState([]);
  const [attendances, setAttendances] = useState({});
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (club?.id) fetchMembers();
  }, [club?.id]);

  useEffect(() => {
    if (selectedSession) loadAttendanceData();
  }, [selectedSession, date, existingAttendances]);

  const fetchMembers = async () => {
    const data = await attendanceService.getActiveMembers(club.id);
    setMembers(data || []);
  };

  const loadAttendanceData = async () => {
    setLoading(true);
    const inst = await attendanceService.getOrCreateInstance(selectedSession.id, date, club.id);
    setInstance(inst);

    const attMap = {};
    existingAttendances.forEach(a => attMap[a.member_id] = a.status);
    
    members.forEach(m => {
        if (!attMap[m.id]) attMap[m.id] = 'absent';
    });
    setAttendances(attMap);
    setLoading(false);
  };

  const handleToggle = (memberId) => {
    if (instance?.is_validated) return;
    setAttendances(prev => ({
        ...prev,
        [memberId]: prev[memberId] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleValidate = async () => {
    setLoading(true);
    const now = new Date().toISOString();
    const attendanceArray = Object.entries(attendances).map(([member_id, status]) => ({ 
        member_id, 
        status,
        updated_by: user.id,
        updated_at: now
    }));
    await saveAttendances({ sessionId: selectedSession.id, attendances: attendanceArray });
    await updateInstance({ instanceId: instance.id, isValidated: true });
    setInstance(prev => ({...prev, is_validated: true}));
    setLoading(false);
    toast('Séance validée !', 'success');
  };

  const handleUnlock = async () => {
    setLoading(true);
    await updateInstance({ instanceId: instance.id, isValidated: false });
    setInstance(prev => ({...prev, is_validated: false}));
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-6 md:space-y-8 font-sans text-slate-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-slate-950">Pointage des présences</h2>
        <p className="text-sm md:text-base text-slate-500 font-medium">Gérez le suivi en temps réel des entraînements.</p>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 md:gap-6 items-center">
        <div className="flex-1 w-full">
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Sélectionner la séance</label>
            <select className="w-full p-3.5 md:p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800 text-sm md:text-base" onChange={e => {
                const s = sessions.find(sess => sess.id === e.target.value);
                setSelectedSession(s || null);
            }}>
                <option value="">Choisir un créneau...</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name} • {s.start_time.slice(0,5)}</option>)}
            </select>
        </div>
        <div className="w-full sm:w-auto">
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Date</label>
            <div className="flex items-center gap-3 bg-slate-50 p-3.5 md:p-4 rounded-2xl">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent border-none focus:ring-0 font-bold text-slate-800 text-sm md:text-base w-full" />
            </div>
        </div>
      </div>

      {selectedSession && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className='flex items-center gap-3 md:gap-4'>
                    <div className='p-2 md:p-3 bg-blue-100 text-blue-700 rounded-2xl'><Clock className="w-5 h-5 md:w-6 md:h-6"/></div>
                    <div>
                        <h3 className="font-extrabold text-lg md:text-xl tracking-tight">{selectedSession.name}</h3>
                        <p className="text-slate-500 font-mono text-xs md:text-sm">{date} • {selectedSession.start_time.slice(0,5)} - {selectedSession.end_time.slice(0,5)}</p>
                    </div>
                </div>
                {instance?.is_validated ? 
                    <button onClick={handleUnlock} className="text-red-700 bg-red-50 px-4 md:px-5 py-2 rounded-full font-black text-xs md:text-sm flex items-center gap-2 hover:bg-red-100">
                        <Lock className="w-4 h-4"/> Déverrouiller
                    </button> :
                    <span className="text-amber-700 bg-amber-50 px-4 md:px-5 py-2 rounded-full font-black text-xs md:text-sm">En cours</span>
                }
            </div>
            <div className="divide-y divide-slate-100">
                    {members.map(m => (
                        <div key={m.id} className="px-6 md:px-8 py-4 md:py-5 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                            <div className='flex items-center gap-3 md:gap-4'>
                                <UserCircle className="w-8 h-8 md:w-10 md:h-10 text-slate-300" />
                                <span className="font-bold text-sm md:text-lg">{m.last_name} {m.first_name}</span>
                            </div>
                            <button onClick={() => handleToggle(m.id)} className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${attendances[m.id] === 'present' ? 'bg-emerald-600 shadow-lg shadow-emerald-200 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                {attendances[m.id] === 'present' ? <Check className="w-6 h-6 md:w-7 md:h-7" /> : <X className="w-6 h-6 md:w-7 md:h-7" />}
                            </button>
                        </div>
                    ))}
            </div>
            {!instance?.is_validated && (
                <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50">
                    <button onClick={handleValidate} disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-sm md:text-lg hover:bg-blue-700 flex items-center justify-center gap-3 shadow-lg shadow-blue-200"><Save className="w-5 h-5 md:w-6 md:h-6" /> Valider définitivement le pointage</button>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
