import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { CalendarDays, Check, Clock, Layers, User, X } from 'lucide-react';

export default function AttendanceHistoryPage() {
  const { club } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchAttendances = async () => {
    setLoading(true);
    const data = await attendanceService.getAttendancesByDate(club.id, date, null);
    setAttendances(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (club?.id) fetchAttendances();
  }, [club?.id, date]);

  const groupedAttendances = useMemo(() => attendances.reduce((acc, attendance) => {
    const sessionId = attendance.session_id;
    if (!acc[sessionId]) {
      acc[sessionId] = {
        name: attendance.sessions?.name || 'Seance inconnue',
        start_time: attendance.sessions?.start_time,
        attendances: [],
      };
    }
    acc[sessionId].attendances.push(attendance);
    return acc;
  }, {}), [attendances]);

  const sessions = Object.entries(groupedAttendances);
  const presentCount = attendances.filter((attendance) => attendance.status === 'present').length;
  const absentCount = attendances.length - presentCount;

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 md:space-y-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Presence</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">Suivi de pointage</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Controle des presences par date et par seance.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-10 rounded-xl bg-slate-50 px-3 text-sm font-black text-slate-900 outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="rounded-2xl border border-blue-500 bg-blue-600 p-3 text-white shadow-lg shadow-blue-100 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-blue-100"><Layers className="h-4 w-4" /> Seances</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{sessions.length}</p>
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

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm font-black text-slate-400">Chargement...</div>
      ) : sessions.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map(([sessionId, sessionData]) => {
            const sessionPresent = sessionData.attendances.filter((attendance) => attendance.status === 'present').length;
            const sessionAbsent = sessionData.attendances.length - sessionPresent;
            return (
              <button key={sessionId} onClick={() => setSelectedSession(sessionData)} className="rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{sessionData.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-500"><Clock className="h-3.5 w-3.5" /> {sessionData.start_time?.slice(0, 5) || '--:--'}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                    <p className="text-xl font-black text-emerald-700">{sessionPresent}</p>
                    <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Presents</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3 text-center">
                    <p className="text-xl font-black text-slate-700">{sessionAbsent}</p>
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Absents</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm font-bold text-slate-500">Aucun pointage enregistre pour cette date.</div>
      )}

      {selectedSession && (
        <div className="fixed inset-0 z-[10050] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-md sm:items-center sm:p-4" onClick={() => setSelectedSession(null)}>
          <div className="flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wide text-blue-600">Details</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">{selectedSession.name}</h3>
              </div>
              <button onClick={() => setSelectedSession(null)} className="rounded-2xl bg-slate-100 p-2 text-slate-500"><X className="h-5 w-5" /></button>
            </div>
            <div className="overflow-y-auto bg-slate-50/70 p-3">
              {selectedSession.attendances.map((attendance) => {
                const isPresent = attendance.status === 'present';
                return (
                  <div key={attendance.id} className="mb-2 flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isPresent ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        <User className="h-5 w-5" />
                      </div>
                      <p className="truncate text-sm font-black text-slate-950">{attendance.members?.last_name?.toUpperCase()} {attendance.members?.first_name}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${isPresent ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {isPresent ? 'Present' : 'Absent'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
