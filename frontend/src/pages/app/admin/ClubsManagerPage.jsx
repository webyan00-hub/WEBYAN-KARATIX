import React, { useState, useEffect } from 'react';
import { Building, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ClubDetailsModal from './ClubDetailsModal';

export default function ClubsManagerPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setLoading(true);
    
    // 1. Récupérer les clubs
    const { data: clubsData, error: clubsError } = await supabase
      .from('clubs')
      .select('id, name, status, style, contact_email, address, created_at, founded_date, phone, trial_ends_at, subscription_ends_at, current_tier_price');
    
    // 2. Récupérer tous les membres pour compter
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('club_id');

    if (clubsError || membersError) {
      console.error("Erreur lors du chargement :", clubsError || membersError);
    } else {
      console.log("Données clubs reçues :", clubsData);
      console.log("Données membres reçues :", membersData);
      // 3. Associer le compte réel
      const clubsWithCount = clubsData.map(club => ({
        ...club,
        member_count: membersData.filter(m => m.club_id === club.id).length
      }));
      setClubs(clubsWithCount);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
        case 'active': return 'bg-emerald-100 text-emerald-700';
        case 'suspend': return 'bg-red-100 text-red-700';
        case 'trial': return 'bg-blue-100 text-blue-700';
        case 'expired': return 'bg-amber-100 text-amber-700';
        default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) return <div className="p-8">Chargement des clubs...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-slate-950">Gestion des Clubs</h1>
      </div>

      {/* Vue Desktop : Tableau */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Club</th>
              <th className="px-8 py-4">Membres</th>
              <th className="px-8 py-4">Statut</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clubs.map((club) => (
              <tr key={club.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Building className="w-5 h-5 text-slate-500" />
                  </div>
                  <span className="font-bold text-slate-900">{club.name}</span>
                </td>
                <td className="px-8 py-5 text-sm text-slate-600">{club.member_count || 0}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(club.status)}`}>
                    {club.status?.toUpperCase() || 'INACTIF'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => setSelectedClub(club)}
                    className="flex items-center gap-2 ml-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition"
                  >
                    <Eye className="w-4 h-4"/> Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vue Mobile : Cartes */}
      <div className="md:hidden space-y-4">
        {clubs.map((club) => (
          <div key={club.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-slate-500" />
                    <span className="font-bold text-lg text-slate-900">{club.name}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(club.status)}`}>
                    {club.status?.toUpperCase() || 'INACTIF'}
                </span>
            </div>
            <button 
                onClick={() => setSelectedClub(club)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition"
            >
                <Eye className="w-4 h-4"/> Voir détails
            </button>
          </div>
        ))}
      </div>
      
      <ClubDetailsModal 
        isOpen={!!selectedClub}
        onClose={() => setSelectedClub(null)}
        club={selectedClub}
        onStatusChange={fetchClubs}
      />
    </div>
  );
}
