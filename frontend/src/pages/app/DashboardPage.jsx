import React from 'react';
import { Users, CreditCard, Trophy, Calendar, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMembers } from './dashboard/members/hooks/useMembers';
import { usePayments } from './dashboard/payments/hooks/usePayments';
import { useAchievements } from './dashboard/members/hooks/useAchievements';
import { useAttendance } from './dashboard/attendance/hooks/useAttendance';
import { useSettings } from './dashboard/settings/hooks/useSettings';

// Palette de couleurs pour les grades
const GRADE_COLORS = {
  'Blanche': '#f8fafc',
  'Jaune': '#fef08a',
  'Orange': '#fdba74',
  'Verte': '#4ade80',
  'Bleue': '#60a5fa',
  'Marron': '#a16207',
  'Noire': '#0f172a',
};

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color.bg} ${color.text}`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
    <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
    <p className="text-3xl font-black text-slate-950">{value}</p>
    {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
  </div>
);

export default function DashboardPage() {
  const { members } = useMembers();
  const { payments } = usePayments();
  const { achievements } = useAchievements(0, 5);
  const { sessions } = useAttendance();
  const { settings } = useSettings();

  // Calculs statistiques
  const totalMembers = members.length;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyRevenue = payments
    .filter(p => p.billing_period === currentMonth)
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const currency = settings?.currency || 'EUR';
  const formattedRevenue = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(monthlyRevenue);

  const gradeCounts = members.reduce((acc, m) => {
    acc[m.grade] = (acc[m.grade] || 0) + 1;
    return acc;
  }, {});
  
  const gradeData = Object.entries(gradeCounts).map(([name, count]) => ({ name, count }));
  const mostPopularGrade = gradeData.length > 0 ? gradeData.sort((a, b) => b.count - a.count)[0] : { name: 'Aucun', count: 0 };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
        <div className="flex justify-between items-end">
            <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tighter">Tableau de bord</h2>
                <p className="text-slate-600 text-base md:text-lg">Vue d'ensemble de votre club</p>
            </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard title="Total Membres" value={totalMembers} subtext="Enregistrés" icon={Users} color={{bg: 'bg-blue-50', text: 'text-blue-600'}} />
            <StatCard title="Revenu Mensuel" value={formattedRevenue} subtext={`Pour ${new Date().toLocaleString('fr-FR', { month: 'long' })}`} icon={CreditCard} color={{bg: 'bg-emerald-50', text: 'text-emerald-600'}} />
            <StatCard title="Grade Principal" value={mostPopularGrade.name} subtext={`${mostPopularGrade.count} membres`} icon={Award} color={{bg: 'bg-amber-50', text: 'text-amber-600'}} />
            <StatCard title="Palmarès" value={achievements.length} subtext="Accomplissements" icon={Trophy} color={{bg: 'bg-indigo-50', text: 'text-indigo-600'}} />
        </div>

        {/* Charts & Details */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[350px]">
                <h3 className="text-lg md:text-xl font-bold mb-6 md:mb-8">Répartition des membres par grade</h3>
                <div className="h-64 md:h-80 w-full">
                    {gradeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {gradeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.name] || '#64748b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">Aucune donnée disponible.</div>
                    )}
                </div>
            </div>

            {/* Prochaines Séances */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg md:text-xl font-bold mb-6">Séances prévues</h3>
                <div className="space-y-4">
                    {sessions.slice(0, 4).map(s => (
                        <div key={s.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="p-2.5 md:p-3 bg-white rounded-xl text-blue-600"><Calendar className="w-5 h-5" /></div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm md:text-base">{s.name}</p>
                                <p className="text-[10px] md:text-xs text-slate-500">{s.start_time.slice(0,5)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}
