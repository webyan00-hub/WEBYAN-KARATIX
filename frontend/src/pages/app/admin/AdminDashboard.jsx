import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, Building, Users, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    clubsCount: 0, 
    membersCount: 0, 
    activeClubs: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    
    // Récupérer le nombre total de clubs
    const { count: clubsCount, error: errClubs } = await supabase
        .from('clubs')
        .select('*', { count: 'exact', head: true });

    // Récupérer le nombre total de membres
    const { count: membersCount, error: errMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });

    // Récupérer le nombre de clubs actifs
    const { count: activeClubs, error: errActive } = await supabase
        .from('clubs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    if (!errClubs && !errMembers && !errActive) {
        setStats({ 
            clubsCount: clubsCount || 0, 
            membersCount: membersCount || 0, 
            activeClubs: activeClubs || 0 
        });
    }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Vue d'ensemble plateforme</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Building size={24}/></div>
            <div>
                <p className="text-slate-500 text-sm font-medium">Clubs totaux</p>
                <p className="text-3xl font-black">{stats.clubsCount}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><Activity size={24}/></div>
            <div>
                <p className="text-slate-500 text-sm font-medium">Clubs actifs</p>
                <p className="text-3xl font-black">{stats.activeClubs}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Users size={24}/></div>
            <div>
                <p className="text-slate-500 text-sm font-medium">Membres totaux</p>
                <p className="text-3xl font-black">{stats.membersCount}</p>
            </div>
        </div>
      </div>
    </div>
  );
}
