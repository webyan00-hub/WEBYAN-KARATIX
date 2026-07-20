import React, { useState, useEffect } from 'react';
import AddPaymentWizard from './components/AddPaymentWizard';
import { Card } from './components/PaymentUIComponents';
import { MemberFinancialGrid } from './components/MemberFinancialGrid';
import { useMembers } from '../members/hooks/useMembers';
import { useAuth } from '../../../../context/AuthContext';
import { usePayments } from './hooks/usePayments';
import { settingsService } from '../settings/services/settingsService';
import { generateReceipt } from './services/receiptService';
import { Search } from 'lucide-react';

export default function PaymentsPage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const { club } = useAuth();
  const { members } = useMembers();
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState(null);
  
  const { payments: allPayments, loading: loadingPayments } = usePayments();
  const { memberPayments } = usePayments(selectedMember?.id);

  useEffect(() => {
    if (club?.id) {
        settingsService.getSettings(club.id).then(setSettings);
    }
  }, [club?.id]);

  // Calcul des stats réelles
  const totalEncaissé = allPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const revenusMois = allPayments
    .filter(p => p.billing_period === currentMonth)
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.member_status === 'active').length;
  
  // Calcul du revenu attendu : membres actifs * prix mensuel
  const revenusAttendus = activeMembers * (settings?.monthly_tuition_price || 0);
  const isRevenuComplet = revenusMois >= revenusAttendus && revenusAttendus > 0;

  const coverageRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
  
  const currency = settings?.currency || 'EUR';

  const filteredMembers = members.filter(m => 
    m.first_name.toLowerCase().includes(search.toLowerCase()) ||
    m.last_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-display text-karatix-text-h tracking-tight mb-1">Paiements</h2>
          <p className="text-lg text-karatix-secondary">Suivi financier et encaissements du club.</p>
        </div>
        <button onClick={() => setIsWizardOpen(true)} className="w-full md:w-auto px-5 py-2.5 bg-karatix-accent text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
            <span>+ Nouveau Paiement</span>
        </button>
      </div>

      {/* Stats Premium */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
            <p className="text-xs font-bold uppercase text-karatix-text mb-1">Membres Actifs</p>
            <p className="text-2xl md:text-3xl font-black text-karatix-text-h">{activeMembers} <span className="text-sm font-normal text-karatix-text">/ {totalMembers}</span></p>
        </Card>
        <Card>
            <p className="text-xs font-bold uppercase text-karatix-text mb-1">Taux couverture</p>
            <p className="text-2xl md:text-3xl font-black text-karatix-accent">{coverageRate}%</p>
        </Card>
        <Card>
            <p className="text-xs font-bold uppercase text-karatix-text mb-1">Total Encaissé</p>
            <p className="text-2xl md:text-3xl font-black text-karatix-text-h">{totalEncaissé.toLocaleString()} {currency}</p>
        </Card>
        <Card>
            <p className="text-xs font-bold uppercase text-karatix-text mb-1">Revenus {currentMonth}</p>
            <p className={`text-2xl md:text-3xl font-black ${isRevenuComplet ? 'text-emerald-600' : 'text-red-600'}`}>
              {revenusMois.toLocaleString()} {currency}
            </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 lg:gap-4 relative">
        {/* Liste Membres */}
        <div className="space-y-4">
            <h3 className="font-bold text-karatix-text-h px-1">Recherche</h3>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-karatix-text" />
              <input 
                placeholder="Nom du membre..." 
                className="w-full pl-10 pr-4 py-3 border border-karatix-border rounded-xl focus:ring-2 focus:ring-karatix-accent bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {search && (
              <div className="space-y-2 h-[400px] overflow-y-auto pr-1">
                  {filteredMembers.map(m => (
                      <button 
                        key={m.id} 
                        onClick={() => setSelectedMember(m)} 
                        className={`w-full p-4 rounded-xl text-left border transition-all duration-200 group ${
                            selectedMember?.id === m.id 
                            ? 'border-karatix-accent bg-blue-50 shadow-sm' 
                            : 'border-karatix-border hover:border-karatix-accent/50 hover:bg-neutral-50'
                        }`}
                      >
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-karatix-code-bg text-karatix-text flex items-center justify-center font-bold text-sm">
                                  {m.first_name[0]}{m.last_name[0]}
                              </div>
                              <div>
                                  <div className="font-bold text-karatix-text-h group-hover:text-karatix-accent transition-colors">{m.last_name.toUpperCase()} {m.first_name}</div>
                                  <div className="text-xs text-karatix-secondary">ID: {m.member_number}</div>
                              </div>
                          </div>
                      </button>
                  ))}
                  {filteredMembers.length === 0 && (
                      <div className="p-4 text-center text-karatix-secondary text-sm">Aucun membre trouvé.</div>
                  )}
              </div>
            )}
        </div>

        {/* Suivi (Desktop: à côté, Mobile: Overlay) */}
        <div className={`
          ${selectedMember 
            ? 'fixed inset-0 z-50 bg-white/95 p-4 md:p-8 overflow-y-auto lg:static lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0 lg:block' 
            : 'hidden lg:block'
          } lg:col-span-3
        `}>
            {selectedMember ? (
                <div className="max-w-3xl lg:max-w-none mx-auto">
                  <Card className="h-full">
                      {/* Header Premium du Membre */}
                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-karatix-border">
                          <button onClick={() => setSelectedMember(null)} className="p-2 -ml-2 text-karatix-secondary hover:text-karatix-accent lg:hidden">
                            ← Retour
                          </button>
                          <div className="w-16 h-16 rounded-2xl bg-karatix-accent text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-karatix-accent/20">
                              {selectedMember.first_name[0]}{selectedMember.last_name[0]}
                          </div>
                          <div className="flex-1">
                              <h3 className="text-2xl font-display text-karatix-text-h mb-1">
                                  {selectedMember.first_name} {selectedMember.last_name.toUpperCase()}
                              </h3>
                              <p className="text-sm text-karatix-secondary">
                                   ID: {selectedMember.member_number || 'N/A'} • Membre depuis {new Date(selectedMember.entry_date).getFullYear()}
                              </p>
                          </div>
                          <div className="text-sm font-bold text-karatix-text bg-karatix-code-bg px-4 py-2 rounded-xl">
                              Année {new Date().getFullYear()}
                          </div>
                      </div>
                      
                      <MemberFinancialGrid payments={memberPayments} year={new Date().getFullYear()} onPaymentClick={setSelectedPayment} />
                  </Card>
                </div>
            ) : (
                <Card className="h-full hidden lg:flex items-center justify-center text-karatix-text py-20">
                    <p>Sélectionnez un membre pour voir son suivi financier.</p>
                </Card>
            )}
        </div>
      </div>

      {isWizardOpen && <AddPaymentWizard onClose={() => { setIsWizardOpen(false); }} />}

      {/* Modal Détails Paiement */}
      {selectedPayment && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 overflow-hidden border border-neutral-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-karatix-text-h tracking-tight">Détail du paiement</h3>
                    <p className="text-karatix-secondary mt-1">Informations de la transaction</p>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl">
                        <span className="text-sm font-medium text-neutral-500">Montant</span>
                        <span className="text-xl font-black text-karatix-text-h">{selectedPayment.amount} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl">
                        <span className="text-sm font-medium text-neutral-500">Date</span>
                        <span className="text-sm font-bold text-karatix-text-h">{new Date(selectedPayment.payment_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl">
                        <span className="text-sm font-medium text-neutral-500">Méthode</span>
                        <span className="text-sm font-bold text-karatix-text-h uppercase tracking-wide">{selectedPayment.payment_method}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl">
                        <span className="text-sm font-medium text-neutral-500">Période</span>
                        <span className="text-sm font-bold text-karatix-text-h">{selectedPayment.billing_period}</span>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button 
                      onClick={() => setSelectedPayment(null)} 
                      className="flex-1 py-3.5 bg-neutral-100 text-neutral-700 rounded-2xl font-bold hover:bg-neutral-200 transition-all duration-200"
                    >
                        Fermer
                    </button>
                    <button 
                      onClick={() => { 
                          const paymentWithMember = {
                              ...selectedPayment,
                              member_name: `${selectedMember.last_name.toUpperCase()} ${selectedMember.first_name}`
                          };
                          generateReceipt(paymentWithMember, club, settings);
                      }} 
                      className="flex-1 py-3.5 bg-karatix-accent text-white rounded-2xl font-bold hover:bg-blue-700 transition-all duration-200 active:scale-[0.98]"
                    >
                        Reçu
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

