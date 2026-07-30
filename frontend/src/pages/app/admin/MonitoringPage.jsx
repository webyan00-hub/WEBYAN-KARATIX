import React, { useState, useEffect } from 'react';
import { Users, Club, Tablet, Activity, TrendingUp, Filter, Calendar, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../../lib/supabase';

const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>
    </div>
    <p className="text-sm text-slate-500 font-medium">{title}</p>
    <p className="text-3xl font-extrabold text-slate-950 tracking-tighter mt-1">{value}</p>
  </div>
);

export default function MonitoringPage() {
  const [stats, setStats] = useState({
    totalClubs: 0,
    totalMembers: 0,
    encaissé: 0,
    prévisionnel: 0,
  });
  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6M');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // 1. Statistiques globales
      const { count: clubsCount } = await supabase.from('clubs').select('id', { count: 'exact', head: true });
      const { count: membersCount } = await supabase.from('members').select('id', { count: 'exact', head: true });
      
      // Récupérer tous les paiements pour les calculs
      const { data: allPayments } = await supabase.from('payment_references').select('amount, status, created_at, club_id');
      
      // Revenu Encaissé (payé ce mois)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const encaissé = allPayments
        ?.filter(p => p.status === 'paid' && new Date(p.created_at).getMonth() === currentMonth && new Date(p.created_at).getFullYear() === currentYear)
        .reduce((acc, p) => acc + Number(p.amount), 0) || 0;

      // Prévisionnel (Tarif théorique = somme du dernier montant payé par club)
      // On regroupe par club pour avoir le dernier paiement
      const lastPaymentsByClub = allPayments?.reduce((acc, p) => {
          if (!acc[p.club_id] || new Date(p.created_at) > new Date(acc[p.club_id].created_at)) {
              acc[p.club_id] = p;
          }
          return acc;
      }, {});
      
      const prévisionnel = Object.values(lastPaymentsByClub || {}).reduce((acc, p) => acc + Number(p.amount), 0);

      // 2. Derniers paiements
      const { data: latestPayments } = await supabase
        .from('payment_references')
        .select(`
          reference,
          amount,
          status,
          created_at,
          clubs (name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // 3. Données pour le graphique (inscriptions)
      const { data: members } = await supabase.from('members').select('created_at');
      
      const monthlyGroups = members?.reduce((acc, m) => {
        const month = new Date(m.created_at).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
      
      const formattedData = Object.keys(monthlyGroups || {}).map(month => ({
        name: month,
        inscriptions: monthlyGroups[month]
      }));

      setStats({
        totalClubs: clubsCount || 0,
        totalMembers: membersCount || 0,
        encaissé: encaissé,
        prévisionnel: prévisionnel,
      });
      setAllData(formattedData);
      setData(formattedData);
      setRecentPayments(latestPayments || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Mettre à jour le graphique selon la période (mockup simplifié pour l'exemple)
  useEffect(() => {
    setData(allData);
  }, [timeRange, allData]);

  const getStatusBadge = (status) => {
    const styles = {
      paid: "bg-emerald-100 text-emerald-700",
      pending: "bg-blue-100 text-blue-700",
      waiting: "bg-amber-100 text-amber-700",
      failed: "bg-red-100 text-red-700"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || 'bg-slate-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-950 tracking-tighter">Monitoring SaaS</h1>
          <p className="text-slate-500 mt-2 font-medium">Analyse temps réel de la plateforme</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
          {['1M', '3M', '6M', '1Y'].map((range) => (
            <button 
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${timeRange === range ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* Statistiques Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Clubs" value={stats.totalClubs} icon={Club} colorClass="bg-blue-600" trend="+2.4%" />
        <StatCard title="Total Membres" value={stats.totalMembers} icon={Users} colorClass="bg-indigo-600" trend="+12.5%" />
        <StatCard title="CA Mensuel (Réel)" value={`${stats.encaissé.toLocaleString()}`} icon={Tablet} colorClass="bg-emerald-600" trend="Encaissé" />
        <StatCard title="CA Mensuel (Prévu)" value={`${stats.prévisionnel.toLocaleString()}`} icon={TrendingUp} colorClass="bg-amber-600" trend="Théorique" />
      </div>

      {/* Graphique AreaChart Premium */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" /> Évolution des inscriptions
                </h2>
            </div>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorInscriptions" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748b', fontSize: 12}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748b', fontSize: 12}} 
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        />
                        <Area 
                            type="linear" 
                            dataKey="inscriptions" 
                            stroke="#6366f1" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorInscriptions)"
                            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Derniers Paiements */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" /> Derniers Paiements
            </h2>
            <div className="space-y-4">
                {recentPayments.map((p) => (
                    <div key={p.reference} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100">
                        <div>
                            <p className="font-bold text-sm text-slate-900">{p.clubs?.name || 'Inconnu'}</p>
                            <p className="text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-sm text-slate-950">{p.amount?.toLocaleString()} Ar</p>
                            {getStatusBadge(p.status)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
