import React, { useState, useEffect } from 'react';
import { User, Calendar, CheckCircle, CreditCard, FileText, X, Search, RotateCcw } from 'lucide-react';
import { useAuth } from '../../../../../context/AuthContext';
import { useMembers } from '../../members/hooks/useMembers';
import { paymentsService } from '../services/paymentsService';
import { settingsService } from '../../settings/services/settingsService';
import { generateReceipt } from '../services/receiptService';
import { useToast } from '../../../../../context/ToastContext';

const steps = [
  { id: 1, name: 'Membre', icon: User },
  { id: 2, name: 'Année', icon: Calendar },
  { id: 3, name: 'Mois', icon: CheckCircle },
  { id: 4, name: 'Détails', icon: CreditCard },
  { id: 5, name: 'Résumé', icon: FileText }
];

export default function AddPaymentWizard({ onClose }) {
  const { club } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const { members } = useMembers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [settings, setSettings] = useState(null);
  const [wizardData, setWizardData] = useState({
    member: null,
    financialStatus: null,
    year: new Date().getFullYear(),
    months: [],
    payment_method: 'Espèces',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (club?.id) {
        settingsService.getSettings(club.id).then(setSettings);
    }
  }, [club?.id]);

  const filteredMembers = search.length > 0 ? members.filter(m => 
    (m.first_name.toLowerCase().includes(search.toLowerCase()) ||
     m.last_name.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'all' || (statusFilter === 'active' ? m.member_status === 'active' : m.member_status !== 'active'))
  ) : [];

  const selectMember = async (member) => {
    const status = await paymentsService.getMemberFinancialStatus(member.id);
    console.log("DEBUG - selectMember - status reçu:", status);
    setWizardData(prev => ({ 
        ...prev, 
        member, 
        financialStatus: status, 
        subscriptionId: status?.id 
    }));
    console.log("DEBUG - selectMember - wizardData après set:", { ...wizardData, member, financialStatus: status, subscriptionId: status?.id });
  };

  const resetSearch = () => {
    setSearch('');
    setStatusFilter('all');
    setWizardData(prev => ({ ...prev, member: null, financialStatus: null }));
  };

  const monthsList = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const toggleMonth = (monthIndex) => {
    const monthStr = `${wizardData.year}-${String(monthIndex + 1).padStart(2, '0')}`;
    setWizardData(prev => ({
        ...prev,
        months: prev.months.includes(monthStr) 
            ? prev.months.filter(m => m !== monthStr)
            : [...prev.months, monthStr].sort()
    }));
  };

  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedPayments, setGeneratedPayments] = useState([]);

  const handleConfirm = async () => {
    try {
        // Liste des périodes déjà payées
        const existingPeriods = wizardData.financialStatus?.payments?.map(p => p.billing_period) || [];
        
        // Filtrer les mois sélectionnés pour exclure les doublons
        const validMonths = wizardData.months.filter(m => !existingPeriods.includes(m));
        
        if (validMonths.length === 0) {
            toast("Tous les mois sélectionnés ont déjà été payés.", 'warning');
            return;
        }

        if (validMonths.length < wizardData.months.length) {
            toast(`Certains mois ont été ignorés car ils ont déjà été payés.`, 'info');
        }

        const payments = validMonths.map(month => ({
            amount: settings.monthly_tuition_price,
            payment_method: wizardData.payment_method,
            billing_period: month
        }));

        await paymentsService.addPaymentsAtomic(club.id, wizardData.member.id, wizardData.subscriptionId, payments);
        
        setGeneratedPayments(payments); 
        
        toast('Paiements enregistrés avec succès !', 'success');
        setShowSuccess(true);
    } catch (err) {
        if (err.message.includes('unique_member_payment_period')) {
            toast("Erreur : Une collision a été détectée. Veuillez vérifier que les périodes ne sont pas déjà payées.", 'warning');
        } else {
            toast("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.", 'error');
        }
    }
  };

  const renderStepContent = () => {
    if (showSuccess) {
        return (
            <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Paiement enregistré !</h3>
                <p className="text-slate-500">Le paiement a été ajouté avec succès.</p>
                <div className="flex gap-3 justify-center mt-6">
                    <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">Fermer</button>
                    <button 
                        onClick={() => {
                            const totalAmount = generatedPayments.reduce((acc, p) => acc + Number(p.amount), 0);
                            const receiptData = {
                                amount: totalAmount,
                                payment_date: new Date().toISOString(),
                                payment_method: wizardData.payment_method,
                                billing_period: wizardData.months.join(', '),
                                member_name: `${wizardData.member.last_name.toUpperCase()} ${wizardData.member.first_name}`
                            };
                            generateReceipt(receiptData, club, settings);
                        }} 
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                    >
                        Générer reçu
                    </button>
                </div>
            </div>
        );
    }

    switch (step) {
      case 1: 
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                placeholder="Rechercher un membre par nom..." 
                className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={resetSearch} className="absolute right-3 top-3 text-slate-400 hover:text-blue-600">
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2 text-sm">
                <button onClick={() => setStatusFilter('all')} className={`px-4 py-1.5 rounded-full ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100'}`}>Tous</button>
                <button onClick={() => setStatusFilter('active')} className={`px-4 py-1.5 rounded-full ${statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-slate-100'}`}>Actifs</button>
                <button onClick={() => setStatusFilter('suspended')} className={`px-4 py-1.5 rounded-full ${statusFilter === 'suspended' ? 'bg-amber-600 text-white' : 'bg-slate-100'}`}>Suspendus</button>
            </div>

            <div className="max-h-[250px] overflow-y-auto space-y-2">
              {filteredMembers.map(m => (
                <button key={m.id} onClick={() => selectMember(m)} className={`w-full p-4 rounded-xl text-left border transition-all ${wizardData.member?.id === m.id ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-200 border-slate-100'}`}>
                    <div className="flex justify-between items-center">
                        <span className="font-bold">{m.last_name.toUpperCase()} {m.first_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${m.member_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {m.member_status === 'active' ? 'ACTIF' : 'SUSPENDU'}
                        </span>
                    </div>
                </button>
              ))}
            </div>

            {wizardData.member && (
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm mt-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Historique des paiements</p>
                    <p className="font-black text-slate-900">{wizardData.member.first_name} {wizardData.member.last_name.toUpperCase()}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {wizardData.financialStatus?.payments && wizardData.financialStatus.payments.length > 0 ? (
                        wizardData.financialStatus.payments
                            .sort((a, b) => a.billing_period.localeCompare(b.billing_period))
                            .map(p => (
                                <span key={p.id} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                                    {p.billing_period.split('-')[1]}/{p.billing_period.split('-')[0]}
                                </span>
                            ))
                    ) : (
                        <span className="text-xs text-slate-400 italic">Aucun historique.</span>
                    )}
                </div>
              </div>
            )}
          </div>
        );
      case 2: 
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900">Période fiscale</h3>
                    <p className="text-sm text-slate-500">Sélectionnez l'année pour cet encaissement.</p>
                </div>
                <div className="flex justify-center">
                    <input 
                        type="number" 
                        value={wizardData.year} 
                        onChange={e => setWizardData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                        className="w-32 text-center text-2xl font-black py-4 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                    />
                </div>
            </div>
        );
      case 3: 
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900">Sélection des mois</h3>
                    <p className="text-sm text-slate-500">Cliquez sur les mois pour les activer/désactiver.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {monthsList.map((m, i) => {
                        const monthStr = `${wizardData.year}-${String(i + 1).padStart(2, '0')}`;
                        const isSelected = wizardData.months.includes(monthStr);
                        return (
                            <button 
                                key={m}
                                onClick={() => toggleMonth(i)}
                                className={`p-4 rounded-xl border-2 text-sm font-black transition-all duration-200 ${
                                    isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' 
                                    : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600'
                                }`}
                            >
                                {m}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
      case 4: 
        return (
            <div className="space-y-6">
                <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Détails de la transaction</h3>
                    <p className="text-sm text-slate-500">Configurez les informations relatives au paiement.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                        <input type="date" value={wizardData.payment_date} onChange={e => setWizardData(prev => ({...prev, payment_date: e.target.value}))} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Méthode</label>
                        <select value={wizardData.payment_method} onChange={e => setWizardData(prev => ({...prev, payment_method: e.target.value}))} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition">
                            {settings?.payment_methods?.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Notes</label>
                    <textarea placeholder="Ex: Paiement en retard, reçu donné..." value={wizardData.notes} onChange={e => setWizardData(prev => ({...prev, notes: e.target.value}))} className="w-full p-4 border-2 border-slate-100 rounded-xl h-28 focus:border-blue-500 transition" />
                </div>
            </div>
        );
      case 5: 
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-xl font-black text-slate-900">Résumé final</h3>
                    <p className="text-sm text-slate-500">Vérifiez les informations avant validation.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                        <span className="text-slate-500 font-bold">Membre</span> 
                        <span className="font-black text-slate-900">{wizardData.member?.last_name.toUpperCase()} {wizardData.member?.first_name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                        <span className="text-slate-500 font-bold">Mois ({wizardData.months.length})</span> 
                        <div className="flex flex-wrap gap-1 justify-end">
                            {wizardData.months.sort().map((m, index) => {
                                const mIndex = parseInt(m.split('-')[1]) - 1;
                                return (
                                    <React.Fragment key={m}>
                                        <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-slate-200">
                                            {monthsList[mIndex]}
                                        </span>
                                        {index < wizardData.months.length - 1 && <span className="text-slate-400 font-bold"> / </span>}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-slate-500 font-bold text-lg">Total à encaisser</span> 
                        <span className="text-3xl font-black text-blue-600">{wizardData.months.length * (settings?.monthly_tuition_price || 0)} {settings?.currency || 'EUR'}</span>
                    </div>
                </div>
            </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900">Nouvel Encaissement</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-6 h-6 text-gray-400" /></button>
        </div>
        
        {/* Stepper */}
        <div className="flex justify-between mb-8 border-b pb-4">
          {steps.map(s => (
            <div key={s.id} className={`flex flex-col items-center ${step >= s.id ? 'text-blue-600' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step >= s.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold">{s.name}</span>
            </div>
          ))}
        </div>

        <div className="min-h-[200px]">
          {renderStepContent()}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="px-4 py-2 bg-gray-100 rounded-xl font-bold text-gray-600">Retour</button>
          <button onClick={() => step === 5 ? handleConfirm() : setStep(Math.min(5, step + 1))} disabled={step === 1 && !wizardData.member} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50">{step === 5 ? 'Confirmer' : 'Suivant'}</button>
        </div>
      </div>
    </div>
  );
}
