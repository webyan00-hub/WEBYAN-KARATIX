import React, { useState, useEffect } from 'react';
import AddPaymentWizard from './components/AddPaymentWizard';
import { MemberFinancialGrid } from './components/MemberFinancialGrid';
import { useMembers } from '../members/hooks/useMembers';
import { useAuth } from '../../../../context/AuthContext';
import { usePayments } from './hooks/usePayments';
import { settingsService } from '../settings/services/settingsService';
import { Search, Users, CreditCard, Plus, WalletCards } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, tone = 'blue' }) => {
  const tones = {
    blue: 'bg-blue-600 text-white shadow-blue-200',
    slate: 'bg-white text-slate-950 shadow-slate-200',
    emerald: 'bg-emerald-500 text-white shadow-emerald-200'
  };

  return (
    <div className={`rounded-3xl border border-slate-100 p-4 shadow-lg ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[10px] font-black uppercase tracking-wide ${tone === 'slate' ? 'text-slate-400' : 'text-white/75'}`}>
            {title}
          </p>
          <p className="mt-2 break-words text-2xl font-black tracking-tight">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tone === 'slate' ? 'bg-slate-100 text-blue-600' : 'bg-white/15 text-white'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default function PaymentsPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
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
  const activeMembers = members.filter(m => m.member_status === 'active');
  const recentMembers = [...members].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
  const searchResults = members.filter(m =>
    m.first_name.toLowerCase().includes(search.toLowerCase()) ||
    m.last_name.toLowerCase().includes(search.toLowerCase())
  );
  const displayedMembers = search ? searchResults : recentMembers;
  const currency = settings?.currency || 'EUR';
  const displayCurrency = currency === 'MGA' ? 'Ar' : '€';
  const selectedInitials = selectedMember
    ? `${selectedMember.first_name?.[0] || ''}${selectedMember.last_name?.[0] || ''}`.toUpperCase()
    : '';

  return (
    <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 md:p-8 space-y-5 md:space-y-8 overflow-x-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-blue-600">Encaissements</p>
          <h2 className="mt-1 text-2xl md:text-4xl font-black tracking-tight text-slate-950">Paiements</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Suivi mensuel des cotisations membres.</p>
        </div>
        <button
          onClick={() => setIsWizardOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 md:hidden"
          aria-label="Enregistrer un paiement"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard title="Actifs" value={activeMembers.length} icon={Users} tone="slate" />
        <StatCard title="Encaissé" value={`${totalEncaissé.toLocaleString()} ${displayCurrency}`} icon={CreditCard} tone="blue" />
        <div className="col-span-2 md:col-span-1">
          <StatCard title="Membres" value={members.length} icon={WalletCards} tone="emerald" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <section className="rounded-[28px] border border-slate-100 bg-white p-3 shadow-sm">
          <div className="rounded-3xl bg-slate-50 p-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Rechercher un membre..."
                className="h-13 w-full rounded-2xl border border-transparent bg-white pl-12 pr-4 text-sm font-bold text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3 max-h-[36dvh] space-y-2 overflow-y-auto pr-1 lg:max-h-[560px]">
            {displayedMembers.length > 0 ? (
              displayedMembers.map(m => {
                const isSelected = selectedMember?.id === m.id;
                const initials = `${m.first_name?.[0] || ''}${m.last_name?.[0] || ''}`.toUpperCase();

                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`w-full rounded-3xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                        : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-950">{m.last_name.toUpperCase()} {m.first_name}</p>
                        <p className="mt-0.5 text-[11px] font-bold text-slate-400">{m.member_status === 'active' ? 'Membre actif' : 'Membre suspendu'}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-center">
                <p className="text-sm font-black text-slate-700">Aucun membre trouvé</p>
                <p className="mt-1 text-xs font-medium text-slate-400">Essayez un autre nom.</p>
              </div>
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-[28px] border border-slate-100 bg-slate-50 p-3 shadow-sm">
          {selectedMember ? (
            <div className="rounded-[24px] bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-slate-950 text-base font-black text-white">
                    {selectedInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-wide text-blue-600">Membre sélectionné</p>
                    <h3 className="mt-1 break-words text-xl font-black tracking-tight text-slate-950">
                      {selectedMember.first_name} {selectedMember.last_name.toUpperCase()}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="hidden h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 md:flex"
                >
                  <Plus className="h-4 w-4" />
                  Enregistrer
                </button>
              </div>

              <div className="mt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-950">Calendrier annuel</p>
                    <p className="text-xs font-medium text-slate-400">{new Date().getFullYear()}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                    {memberPayments.length} payé{memberPayments.length > 1 ? 's' : ''}
                  </span>
                </div>
                <MemberFinancialGrid payments={memberPayments} year={new Date().getFullYear()} onPaymentClick={() => {}} />
              </div>

              <button
                onClick={() => setIsWizardOpen(true)}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 md:hidden"
              >
                <Plus className="h-4 w-4" />
                Enregistrer
              </button>
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-950">Sélectionnez un membre</h3>
              <p className="mt-2 max-w-xs text-sm font-medium text-slate-500">Choisissez un membre dans la liste pour afficher son suivi mensuel.</p>
            </div>
          )}
        </section>
      </div>

      {isWizardOpen && <AddPaymentWizard onClose={() => setIsWizardOpen(false)} />}
    </div>
  );
}
