import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useToast } from '../../../../../context/ToastContext';
import { attendanceService } from '../services/attendanceService';
import { useAttendance } from '../hooks/useAttendance';
import { Check, Clock, Lock, Search, Unlock, Users, X } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (club?.id) fetchMembers();
  }, [club?.id]);

  useEffect(() => {
    if (selectedSession) loadAttendanceData();
  }, [selectedSession, date, existingAttendances, members]);

  const fetchMembers = async () => {
    const data = await attendanceService.getActiveMembers(club.id);
    setMembers(data || []);
  };

  const loadAttendanceData = async () => {
    setLoading(true);
    const inst = await attendanceService.getOrCreateInstance(selectedSession.id, date, club.id);
    setInstance(inst);

    const attMap = {};
    existingAttendances.forEach((attendance) => { attMap[attendance.member_id] = attendance.status; });
    members.forEach((member) => { if (!attMap[member.id]) attMap[member.id] = 'absent'; });
    setAttendances(attMap);
    setLoading(false);
  };

  const handleToggle = (memberId) => {
    if (instance?.is_validated) return;
    setAttendances((current) => ({
      ...current,
      [memberId]: current[memberId] === 'present' ? 'absent' : 'present',
    }));
  };

  const handleValidate = async () => {
    if (!selectedSession || !instance) return;
    setLoading(true);
    const now = new Date().toISOString();
    const attendanceArray = Object.entries(attendances).map(([member_id, status]) => ({
      member_id,
      status,
      updated_by: user.id,
      updated_at: now,
    }));
    await saveAttendances({ sessionId: selectedSession.id, attendances: attendanceArray });
    await updateInstance({ instanceId: instance.id, isValidated: true });
    setInstance((current) => ({ ...current, is_validated: true }));
    setLoading(false);
    toast('Seance validee !', 'success');
  };

  const handleUnlock = async () => {
    setLoading(true);
    await updateInstance({ instanceId: instance.id, isValidated: false });
    setInstance((current) => ({ ...current, is_validated: false }));
    setLoading(false);
  };

  const presentCount = Object.values(attendances).filter((status) => status === 'present').length;
  const totalCount = members.length;
  const absentCount = Math.max(totalCount - presentCount, 0);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return members.filter((member) => {
      const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
      return !normalizedSearch || fullName.includes(normalizedSearch);
    });
  }, [members, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 md:space-y-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Presence</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">Pointage</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Cochez les presents rapidement, puis validez la seance.</p>
        </div>
        {selectedSession && (
          instance?.is_validated ? (
            <button onClick={handleUnlock} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 text-sm font-black text-red-700 transition hover:bg-red-100">
              <Lock className="h-4 w-4" /> Deverrouiller
            </button>
          ) : (
            <span className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-amber-50 px-4 text-sm font-black text-amber-700">
              <Unlock className="h-4 w-4" /> En cours
            </span>
          )
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[180px_1fr]">
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50" />
          <select
            value={selectedSession?.id || ''}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            onChange={(event) => {
              const session = sessions.find((item) => item.id === event.target.value);
              setSelectedSession(session || null);
            }}
          >
            <option value="">Selectionner une seance...</option>
            {sessions.map((session) => <option key={session.id} value={session.id}>{session.name} - {session.start_time?.slice(0, 5)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="rounded-2xl border border-blue-500 bg-blue-600 p-3 text-white shadow-lg shadow-blue-100 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-blue-100"><Users className="h-4 w-4" /> Membres</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{totalCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500 bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-100 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-emerald-100"><Check className="h-4 w-4" /> Presents</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{presentCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 text-white shadow-lg shadow-slate-200 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-300"><X className="h-4 w-4" /> Absents</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{absentCount}</p>
        </div>
      </div>

      {!selectedSession ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500">Choisissez une seance pour demarrer le pointage.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-white p-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Rechercher un membre" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm font-black text-slate-400">Chargement...</div>
          ) : (
            <div className="grid gap-3 bg-slate-50/70 p-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredMembers.map((member) => {
                const isPresent = attendances[member.id] === 'present';
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleToggle(member.id)}
                    className={`grid grid-cols-[1fr_auto] items-center gap-3 rounded-3xl border p-4 text-left shadow-sm transition-all ${isPresent ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-white hover:border-blue-200'}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">{member.last_name?.toUpperCase()} {member.first_name}</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">{isPresent ? 'Present' : 'Absent'}</p>
                    </div>
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isPresent ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                      {isPresent ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {!instance?.is_validated && (
            <div className="sticky bottom-0 border-t border-slate-100 bg-white p-3">
              <button onClick={handleValidate} disabled={loading} className="h-12 w-full rounded-2xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60">
                Valider le pointage
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
