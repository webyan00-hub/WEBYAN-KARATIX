import React, { useState, useEffect } from 'react';
import AddPaymentWizard from './components/AddPaymentWizard';
import { Card } from './components/PaymentUIComponents';
import { MemberFinancialGrid } from './components/MemberFinancialGrid';
import { useMembers } from '../members/hooks/useMembers';
import { useAuth } from '../../../../context/AuthContext';
import { usePayments } from './hooks/usePayments';
import { settingsService } from '../settings/services/settingsService';
import { generateReceipt } from './services/receiptService';
import { Search, Users, CreditCard, TrendingUp, CheckCircle } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';

export default function PaymentsPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const { club } = useAuth();
  const { members } = useMembers();
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState(null);
  
  const { payments: allPayments } = usePayments();
  const { memberPayments } = usePayments(selectedMember?.id);

  useEffect(() => {
    if (club?.id) {
        settingsService.getSettings(club.id).then(setSettings);
    }
  }, [club?.id]);

  const totalEncaissé = allPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const revenusMois = allPayments.filter(p => p.billing_period === currentMonth).reduce((acc, p) => acc + Number(p.amount), 0);
  const activeMembers = members.filter(m => m.member_status === 'active');
  const coverageRate = members.length > 0 ? Math.round((activeMembers.length / members.length) * 100) : 0;
  
  const recentMembers = [...members].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4);
  const searchResults = members.filter(m => m.first_name.toLowerCase().includes(search.toLowerCase()) || m.last_name.toLowerCase().includes(search.toLowerCase()));
  const displayedMembers = search ? searchResults : recentMembers;

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

  const currency = settings?.currency || 'EUR';
  const displayCurrency = currency === 'MGA' ? 'Ar' : '€';

  const getPhotoUrl = (path) => {
    if (!path) return null;
    const { data } = supabase.storage.from('member-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center mb-10">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tighter">Gestion des Paiements</h2>
          <p className="text-sm md:text-lg text-slate-500 font-medium mt-1">Supervisez les encaissements et les abonnements.</p>
        </div>
        <button onClick={() => setIsWizardOpen(true)} className="w-full md:w-auto px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
            <span>+ Enregistrer un paiement</span>
        </button>
      </div>

      {/* Stats Adaptatives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Membres Actifs" value={activeMembers.length} icon={Users} colorClass="bg-blue-600" />
        <StatCard title="Couverture" value={`${coverageRate}%`} icon={TrendingUp} colorClass="bg-indigo-600" />
        <StatCard title="Encaissé" value={`${totalEncaissé.toLocaleString()} ${displayCurrency}`} icon={CreditCard} colorClass="bg-emerald-600" />
        <StatCard title="Revenus mois" value={`${revenusMois.toLocaleString()} ${displayCurrency}`} icon={CheckCircle} colorClass="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
            <h3 className="font-black text-slate-950 px-1 text-sm tracking-tight">{search ? 'Résultats' : '4 derniers inscrits'}</h3>
            <div className="relative">
              <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input placeholder="Rechercher..." className="w-full pl-12 pr-4 py-4 border border-slate-100 rounded-2xl bg-slate-50 font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="space-y-2">
                  {displayedMembers.map(m => (
                      <button key={m.id} onClick={() => setSelectedMember(m)} className={`w-full p-4 rounded-2xl text-left border transition-all ${selectedMember?.id === m.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                          <div className="font-black text-slate-950 text-sm">{m.last_name.toUpperCase()} {m.first_name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {m.member_number}</div>
                      </button>
                  ))}
            </div>
        </div>
        <div className="lg:col-span-3">
            {selectedMember ? (
                <Card className="h-full p-6">
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                          {selectedMember.photo_url ? (
                              <img src={getPhotoUrl(selectedMember.photo_url)} alt="Photo" className="w-16 h-16 rounded-2xl object-cover" />
                          ) : (
                              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black">{selectedMember.first_name[0]}{selectedMember.last_name[0]}</div>
                          )}
                          <div>
                              <h3 className="text-xl font-black text-slate-950 tracking-tighter">{selectedMember.first_name} {selectedMember.last_name.toUpperCase()}</h3>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">ID: {selectedMember.member_number}</p>
                          </div>
                      </div>
                      <MemberFinancialGrid payments={memberPayments} year={new Date().getFullYear()} onPaymentClick={setSelectedPayment} />
                </Card>
            ) : (
                <Card className="h-64 flex items-center justify-center text-slate-400 font-bold">Sélectionnez un membre pour voir le suivi financier.</Card>
            )}
        </div>
      </div>
      {isWizardOpen && <AddPaymentWizard onClose={() => setIsWizardOpen(false)} />}
    </div>
  );
}

