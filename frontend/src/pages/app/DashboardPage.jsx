import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, Award, Calendar, Trophy, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMembers } from './dashboard/members/hooks/useMembers';
import { usePayments } from './dashboard/payments/hooks/usePayments';
import { useAchievements } from './dashboard/members/hooks/useAchievements';
import { useAttendance } from './dashboard/attendance/hooks/useAttendance';
import { useSettings } from './dashboard/settings/hooks/useSettings';

const GRADE_COLORS = {
  Blanche: '#94a3b8',
  Jaune: '#eab308',
  Orange: '#f97316',
  Verte: '#22c55e',
  Bleue: '#2563eb',
  Marron: '#92400e',
  Noire: '#0f172a',
};

const StatCard = ({ title, value, hint, icon: Icon, tone }) => {
  const tones = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    slate: 'border-slate-200 bg-slate-950 text-white',
  };

  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[11px] font-black uppercase tracking-wide ${tone === 'slate' ? 'text-slate-300' : 'opacity-75'}`}>{title}</p>
          <p className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone === 'slate' ? 'bg-white/10' : 'bg-white/80'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className={`mt-3 text-xs font-bold ${tone === 'slate' ? 'text-slate-300' : 'opacity-75'}`}>{hint}</p>
    </div>
  );
};

const Panel = ({ title, action, children, className = '' }) => (
  <section className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 md:px-5">
      <h3 className="text-base font-black tracking-tight text-slate-950">{title}</h3>
      {action}
    </div>
    <div className="p-4 md:p-5">{children}</div>
  </section>
);

export default function DashboardPage() {
  const { members } = useMembers();
  const { payments } = usePayments();
  const { achievements } = useAchievements(0, 5);
  const { sessions } = useAttendance();
  const { settings } = useSettings();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currency = settings?.currency || 'EUR';
  const displayCurrency = currency === 'MGA' ? 'Ar' : 'EUR';

  const monthlyRevenue = useMemo(() => payments
    .filter((payment) => payment.billing_period === currentMonth)
    .reduce((acc, payment) => acc + Number(payment.amount), 0), [currentMonth, payments]);

  const activeMembers = useMemo(() => members.filter((member) => member.active).length, [members]);

  const gradeData = useMemo(() => {
    const counts = members.reduce((acc, member) => {
      acc[member.grade] = (acc[member.grade] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [members]);

  const mostPopularGrade = gradeData.length > 0
    ? [...gradeData].sort((a, b) => b.count - a.count)[0]
    : { name: 'Aucun', count: 0 };

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.created_at || b.payment_date || 0) - new Date(a.created_at || a.payment_date || 0))
    .slice(0, 4);

  const upcomingSessions = sessions.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-4 md:space-y-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Pilotage</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-4xl">Tableau de bord</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Vue claire sur les membres, paiements, seances et progression.</p>
        </div>
        <Link to="/dashboard/members" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800">
          Ouvrir les membres <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Membres" value={members.length} hint={`${activeMembers} actifs dans le club`} icon={Users} tone="blue" />
        <StatCard title="Revenus mois" value={`${monthlyRevenue.toLocaleString()} ${displayCurrency}`} hint="Encaissements du mois courant" icon={CreditCard} tone="emerald" />
        <StatCard title="Grade principal" value={mostPopularGrade.name} hint={`${mostPopularGrade.count} membre(s) concernes`} icon={Award} tone="amber" />
        <StatCard title="Palmares" value={achievements.length} hint="Dernieres distinctions suivies" icon={Trophy} tone="slate" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <Panel
          title="Progression technique"
          action={<Link to="/dashboard/members" className="text-xs font-black text-blue-600 hover:text-blue-700">Voir tout</Link>}
        >
          <div className="h-72 w-full">
            {gradeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b', fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }} />
                  <Bar dataKey="count" radius={[10, 10, 4, 4]} barSize={42}>
                    {gradeData.map((entry) => (
                      <Cell key={entry.name} fill={GRADE_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-400">Aucune donnee disponible.</div>
            )}
          </div>
        </Panel>

        <Panel
          title="Seances prevues"
          action={<Link to="/dashboard/attendance/planning" className="text-xs font-black text-blue-600 hover:text-blue-700">Planning</Link>}
        >
          <div className="space-y-3">
            {upcomingSessions.length > 0 ? upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{session.name}</p>
                  <p className="mt-0.5 text-xs font-bold text-slate-500">
                    {session.start_time?.slice(0, 5) || '--:--'} - {session.attendance_date ? new Date(session.attendance_date).toLocaleDateString() : 'A venir'}
                  </p>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-bold text-slate-400">Aucune seance planifiee.</div>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Activite paiement">
          <div className="space-y-3">
            {recentPayments.length > 0 ? recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-950">{payment.billing_period || 'Paiement'}</p>
                    <p className="text-xs font-bold text-slate-400">{payment.payment_method || 'Methode non precisee'}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-emerald-700">{Number(payment.amount || 0).toLocaleString()} {displayCurrency}</p>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-bold text-slate-400">Aucun paiement recent.</div>
            )}
          </div>
        </Panel>

        <Panel title="Signal club">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <Activity className="h-5 w-5 text-blue-700" />
              <p className="mt-3 text-2xl font-black text-slate-950">{upcomingSessions.length}</p>
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">Seances visibles</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <Users className="h-5 w-5 text-emerald-700" />
              <p className="mt-3 text-2xl font-black text-slate-950">{members.length ? Math.round((activeMembers / members.length) * 100) : 0}%</p>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Membres actifs</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
