import React from 'react';
import { Users, CreditCard, Award, Calendar, Trophy, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMembers } from './dashboard/members/hooks/useMembers';
import { usePayments } from './dashboard/payments/hooks/usePayments';
import { useAchievements } from './dashboard/members/hooks/useAchievements';
import { useAttendance } from './dashboard/attendance/hooks/useAttendance';
import { useSettings } from './dashboard/settings/hooks/useSettings';
import { Card } from './dashboard/payments/components/PaymentUIComponents';

const GRADE_COLORS = {
  'Blanche': '#94a3b8',
  'Jaune': '#facc15',
  'Orange': '#fb923c',
  'Verte': '#4ade80',
  'Bleue': '#60a5fa',
  'Marron': '#a16207',
  'Noire': '#0F172A',
};

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
          <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <p className="text-sm text-slate-500 font-medium">{title}</p>
    <p className="text-3xl font-extrabold text-slate-950 tracking-tighter mt-1">{value}</p>
  </div>
);

export default function DashboardPage() {
  const { members } = useMembers();
  const { payments } = usePayments();
  const { achievements } = useAchievements(0, 5);
  const { sessions } = useAttendance();
  const { settings } = useSettings();

  const totalMembers = members.length;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyRevenue = payments
    .filter(p => p.billing_period === currentMonth)
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const currency = settings?.currency || 'EUR';
  const displayCurrency = currency === 'MGA' ? 'Ar' : '€';
  const formattedRevenue = `${monthlyRevenue.toLocaleString()} ${displayCurrency}`;

  const gradeCounts = members.reduce((acc, m) => {
    acc[m.grade] = (acc[m.grade] || 0) + 1;
    return acc;
  }, {});
  
  const gradeData = Object.entries(gradeCounts).map(([name, count]) => ({ name, count }));
  const mostPopularGrade = gradeData.length > 0 ? gradeData.sort((a, b) => b.count - a.count)[0] : { name: 'Aucun', count: 0 };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
        <div className="flex justify-between items-center mb-10">
            <div>
                <h2 className="text-4xl font-black text-slate-950 tracking-tighter">Tableau de bord</h2>
                <p className="text-lg text-slate-500 font-medium">Vue d'ensemble et pilotage de votre activité.</p>
            </div>
        </div>
        
        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Membres" value={totalMembers} icon={Users} colorClass="bg-blue-600" />
            <StatCard title="Revenus mois" value={formattedRevenue} icon={CreditCard} colorClass="bg-emerald-600" />
            <StatCard title="Grade Principal" value={mostPopularGrade.name} icon={Award} colorClass="bg-amber-600" />
            <StatCard title="Palmarès" value={achievements.length} icon={Trophy} colorClass="bg-indigo-600" />
        </div>

        {/* Bento Grid Main */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Chart */}
            <Card className="xl:col-span-2 p-8">
                <h3 className="text-xl font-bold text-text-main mb-8">Progression technique des membres</h3>
                <div className="h-72 w-full">
                    {gradeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#64748B'}} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#64748B'}} />
                                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                                    {gradeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.name] || '#64748b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-muted">Aucune donnée disponible.</div>
                    )}
                </div>
            </Card>

            {/* Prochaines Séances */}
            <Card className="p-8 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-text-main">Séances prévues</h3>
                    <button className="text-action text-sm font-bold flex items-center gap-1 hover:underline">Voir tout <ArrowRight size={14} /></button>
                </div>
                <div className="space-y-4 flex-1">
                    {sessions.slice(0, 4).map(s => (
                        <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-action shadow-sm border border-slate-100">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-text-main">{s.name}</p>
                                <p className="text-sm text-text-muted">{s.start_time.slice(0,5)} • {s.attendance_date ? new Date(s.attendance_date).toLocaleDateString() : 'À venir'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
  );
}
