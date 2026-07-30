import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useToast } from '../../../../../context/ToastContext';
import { attendanceService } from '../services/attendanceService';
import { useAttendance } from '../hooks/useAttendance';
import { Check, X, Lock, Unlock, Clock, Calendar as CalendarIcon, Search, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PointagePage() {
  const { club, user } = useAuth();
  const toast = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState(null);
  const { sessions, attendances: existingAttendances, saveAttendances, updateInstance } = useAttendance(date, selectedSession?.id);
  const [members, setMembers] = useState([]);
  const [attendances, setAttendances] = useState({});
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('summary'); 
  const [searchQuery, setSearchQuery] = useState('');

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

  const presentCount = Object.values(attendances).filter(s => s === 'present').length;
  const totalCount = members.length;
  const absentCount = totalCount - presentCount;

  const filteredMembers = members.filter(m => 
    (m.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (m.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center mb-10">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tighter">Gestion du Pointage</h2>
          <p className="text-sm md:text-lg text-slate-500 font-medium mt-1">Suivi des présences en temps réel.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full sm:w-auto bg-white border border-slate-100 rounded-2xl p-4 md:p-5 font-black text-slate-900 outline-none shadow-sm focus:ring-2 focus:ring-blue-500" />
            <select className="w-full sm:w-auto p-4 md:p-5 bg-white border border-slate-100 rounded-2xl font-black text-slate-900 outline-none shadow-sm focus:ring-2 focus:ring-blue-500 cursor-pointer" onChange={e => {
                const s = sessions.find(sess => sess.id === e.target.value);
                setSelectedSession(s || null);
                setView('summary');
            }}>
                <option value="">Sélectionner une séance...</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name} • {s.start_time.slice(0,5)}</option>)}
            </select>
        </div>
      </div>

      {selectedSession && view === 'summary' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className='flex justify-between items-start mb-8'>
                <div>
                    <h3 className="font-black text-2xl md:text-3xl text-slate-950 tracking-tighter">{selectedSession.name}</h3>
                    <p className="text-slate-500 font-bold text-xs flex items-center gap-1.5 mt-2 font-mono"><Clock className="w-3 h-3"/> {date} • {selectedSession.start_time.slice(0,5)}</p>
                </div>
                {instance?.is_validated ? 
                    <button onClick={handleUnlock} className="text-red-600 bg-red-50 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-red-100 transition text-sm">
                        <Lock size={16}/> Verrouillé
                    </button> :
                    <span className="text-amber-700 bg-amber-50 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-black text-sm">En cours</span>
                }
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mb-8">
                <div className="bg-emerald-50 p-6 md:p-8 rounded-3xl border border-emerald-100">
                    <p className="text-emerald-700 text-[10px] font-black uppercase tracking-widest">Présents</p>
                    <p className="text-emerald-950 text-4xl md:text-5xl font-black mt-2 font-mono">{presentCount}</p>
                </div>
                <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Absents</p>
                    <p className="text-slate-950 text-4xl md:text-5xl font-black mt-2 font-mono">{absentCount}</p>
                </div>
            </div>

            {!instance?.is_validated && (
                <button onClick={() => setView('form')} className="w-full bg-blue-600 text-white p-6 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200">
                    Gérer le pointage
                </button>
            )}
        </motion.div>
      )}

      {selectedSession && view === 'form' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
            <div className='flex items-center gap-4 border-b border-slate-100 pb-8'>
                <button onClick={() => setView('summary')} className='text-slate-500 font-black hover:text-slate-900'>&larr; Retour</button>
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input type="text" placeholder="Rechercher un membre..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto pr-2">
                {filteredMembers.map(m => (
                    <div key={m.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                        <div className='flex items-center gap-4'>
                            <div className='p-3 bg-white rounded-full'><Users className="w-5 h-5 text-slate-400"/></div>
                            <span className="font-bold text-slate-900">{m.last_name.toUpperCase()} {m.first_name}</span>
                        </div>
                        <button onClick={() => handleToggle(m.id)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${attendances[m.id] === 'present' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white border-2 border-slate-200 text-slate-300'}`}>
                            {attendances[m.id] === 'present' ? <Check size={28} /> : <X size={28} />}
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={handleValidate} disabled={loading} className="w-full bg-blue-600 text-white p-6 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200">
                Valider le pointage
            </button>
        </motion.div>
      )}
    </div>
  );
}
