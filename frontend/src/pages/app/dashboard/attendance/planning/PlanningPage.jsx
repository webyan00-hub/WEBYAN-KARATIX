import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { CalendarDays, Clock, Layers, Plus, Trash2 } from 'lucide-react';

const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function PlanningPage() {
  const { club } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSession, setNewSession] = useState({ name: '', day_of_week: '1', start_time: '09:00', end_time: '11:00' });

  const fetchSessions = async () => {
    setLoading(true);
    const data = await attendanceService.getSessions(club.id);
    setSessions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (club?.id) fetchSessions();
  }, [club?.id]);

  const handleAddSession = async (event) => {
    event.preventDefault();
    await attendanceService.createSession({ ...newSession, club_id: club.id });
    setNewSession({ name: '', day_of_week: '1', start_time: '09:00', end_time: '11:00' });
    fetchSessions();
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Supprimer cette seance ?')) return;
    await attendanceService.deleteSession(sessionId);
    fetchSessions();
  };

  const sortedSessions = useMemo(() => [...sessions].sort((a, b) => {
    if (Number(a.day_of_week) !== Number(b.day_of_week)) return Number(a.day_of_week) - Number(b.day_of_week);
    return String(a.start_time).localeCompare(String(b.start_time));
  }), [sessions]);

  const totalHours = sessions.reduce((acc, session) => {
    const [startH, startM] = session.start_time?.split(':').map(Number) || [0, 0];
    const [endH, endM] = session.end_time?.split(':').map(Number) || [0, 0];
    return acc + Math.max(((endH * 60 + endM) - (startH * 60 + startM)) / 60, 0);
  }, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 md:space-y-6 md:px-8 md:py-8">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-blue-600">Presence</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">Planning</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">Configurez les creneaux recurrents du club.</p>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="rounded-2xl border border-blue-500 bg-blue-600 p-3 text-white shadow-lg shadow-blue-100 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-blue-100"><Layers className="h-4 w-4" /> Creneaux</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{sessions.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500 bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-100 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-emerald-100"><Clock className="h-4 w-4" /> Heures</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 text-white shadow-lg shadow-slate-200 md:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-300"><CalendarDays className="h-4 w-4" /> Jours</div>
          <p className="mt-2 text-2xl font-black md:text-3xl">{new Set(sessions.map((session) => session.day_of_week)).size}</p>
        </div>
      </div>

      <form onSubmit={handleAddSession} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_140px_140px_auto] md:items-end">
          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">Nom</label>
            <input required value={newSession.name} onChange={(event) => setNewSession({ ...newSession, name: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50" placeholder="Ex: Entrainement adulte" />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">Jour</label>
            <select value={newSession.day_of_week} onChange={(event) => setNewSession({ ...newSession, day_of_week: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50">
              {dayNames.map((name, index) => <option key={name} value={index}>{name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">Debut</label>
            <input type="time" required value={newSession.start_time} onChange={(event) => setNewSession({ ...newSession, start_time: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50" />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">Fin</label>
            <input type="time" required value={newSession.end_time} onChange={(event) => setNewSession({ ...newSession, end_time: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50" />
          </div>
          <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">
          <h3 className="text-base font-black text-slate-950">Creneaux programmes</h3>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm font-black text-slate-400">Chargement...</div>
        ) : sortedSessions.length > 0 ? (
          <div className="grid gap-3 bg-slate-50/70 p-3 md:grid-cols-2 xl:grid-cols-3">
            {sortedSessions.map((session) => (
              <article key={session.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">{session.name}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">{dayNames[session.day_of_week]}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteSession(session.id)} className="rounded-xl p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
                  {session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="m-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm font-bold text-slate-500">Aucune seance programmee.</div>
        )}
      </div>
    </div>
  );
}
