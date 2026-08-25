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

const monthsList = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const filterButtonClass = (active) =>
  `h-10 rounded-xl text-xs font-black transition-all ${
    active
      ? 'bg-slate-950 text-white shadow-sm'
      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
  }`;

const fieldClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

export default function AddPaymentWizard({ onClose }) {
  const { club } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const { members } = useMembers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [settings, setSettings] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedPayments, setGeneratedPayments] = useState([]);
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

  const currentStep = steps.find(s => s.id === step);
  const progress = (step / steps.length) * 100;
  const totalAmount = wizardData.months.length * (settings?.monthly_tuition_price || 0);

  const filteredMembers = search.length > 0 ? members.filter(m =>
    (m.first_name.toLowerCase().includes(search.toLowerCase()) ||
      m.last_name.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'all' || (statusFilter === 'active' ? m.member_status === 'active' : m.member_status !== 'active'))
  ) : [];

  const selectMember = async (member) => {
    const status = await paymentsService.getMemberFinancialStatus(member.id);
    setWizardData(prev => ({
      ...prev,
      member,
      financialStatus: status,
      subscriptionId: status?.id
    }));
  };

  const resetSearch = () => {
    setSearch('');
    setStatusFilter('all');
    setWizardData(prev => ({ ...prev, member: null, financialStatus: null }));
  };

  const toggleMonth = (monthIndex) => {
    const monthStr = `${wizardData.year}-${String(monthIndex + 1).padStart(2, '0')}`;
    setWizardData(prev => ({
      ...prev,
      months: prev.months.includes(monthStr)
        ? prev.months.filter(m => m !== monthStr)
        : [...prev.months, monthStr].sort()
    }));
  };

  const handleConfirm = async () => {
    try {
      const existingPeriods = wizardData.financialStatus?.payments?.map(p => p.billing_period) || [];
      const duplicateMonths = wizardData.months.filter(m => existingPeriods.includes(m));

      if (duplicateMonths.length > 0) {
        const duplicateMonthNames = duplicateMonths.map(m => {
          const mIndex = parseInt(m.split('-')[1]) - 1;
          return monthsList[mIndex];
        });
        toast(`Erreur : Les mois suivants ont déjà été payés : ${duplicateMonthNames.join(', ')}. Veuillez corriger votre sélection.`, 'error');
        return;
      }

      const payments = wizardData.months.map(month => ({
        amount: settings?.monthly_tuition_price || 0,
        payment_method: wizardData.payment_method,
        billing_period: month
      }));

      await paymentsService.addPaymentsAtomic(club.id, wizardData.member.id, wizardData.subscriptionId, payments);
      setGeneratedPayments(payments);
      toast('Paiements enregistrés avec succès !', 'success');
      setShowSuccess(true);
    } catch (err) {
      if (err.message.includes('unique_member_payment_period')) {
        toast('Erreur : une collision a été détectée. Vérifiez que les périodes ne sont pas déjà payées.', 'warning');
      } else {
        toast("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.", 'error');
      }
    }
  };

  const renderSuccess = () => (
    <div className="flex min-h-full flex-col items-center justify-center px-2 py-8 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
        <CheckCircle className="h-10 w-10" />
      </div>
      <h3 className="text-2xl font-black tracking-tight text-slate-950">Paiement enregistré</h3>
      <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">L'encaissement est sauvegardé et prêt pour le reçu.</p>
      <div className="mt-7 grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-2">
        <button onClick={onClose} className="rounded-2xl bg-slate-100 px-5 py-3 font-black text-slate-700 transition hover:bg-slate-200">
          Fermer
        </button>
        <button
          onClick={() => {
            const receiptTotal = generatedPayments.reduce((acc, p) => acc + Number(p.amount), 0);
            const receiptData = {
              amount: receiptTotal,
              payment_date: new Date().toISOString(),
              payment_method: wizardData.payment_method,
              billing_period: wizardData.months.join(', '),
              member_name: `${wizardData.member.last_name.toUpperCase()} ${wizardData.member.first_name}`
            };
            generateReceipt(receiptData, club, settings);
          }}
          className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
        >
          Générer reçu
        </button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (showSuccess) return renderSuccess();

    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-2 shadow-inner shadow-slate-200/40">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Rechercher un membre par nom..."
                  className="h-13 w-full rounded-2xl border border-transparent bg-white pl-12 pr-12 text-sm font-bold text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={resetSearch} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-blue-600">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setStatusFilter('all')} className={filterButtonClass(statusFilter === 'all')}>Tous</button>
              <button onClick={() => setStatusFilter('active')} className={filterButtonClass(statusFilter === 'active')}>Actifs</button>
              <button onClick={() => setStatusFilter('suspended')} className={filterButtonClass(statusFilter === 'suspended')}>Suspendus</button>
            </div>

            <div className="max-h-[30dvh] space-y-2 overflow-y-auto pr-1 sm:max-h-[260px]">
              {search.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center">
                  <p className="text-sm font-black text-slate-700">Recherchez un membre</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">Tapez un nom pour démarrer l'encaissement.</p>
                </div>
              )}

              {search.length > 0 && filteredMembers.length === 0 && (
                <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                  <p className="text-sm font-black text-slate-700">Aucun membre trouvé</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">Essayez un autre nom ou changez le filtre.</p>
                </div>
              )}

              {filteredMembers.map(m => {
                const isSelected = wizardData.member?.id === m.id;
                const initials = `${m.first_name?.[0] || ''}${m.last_name?.[0] || ''}`.toUpperCase();
                return (
                  <button
                    key={m.id}
                    onClick={() => selectMember(m)}
                    className={`w-full rounded-3xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                        : 'border-slate-100 bg-white shadow-sm hover:border-blue-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-950">{m.last_name.toUpperCase()} {m.first_name}</p>
                        <p className="mt-0.5 text-[11px] font-bold text-slate-400">Membre du club</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${m.member_status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {m.member_status === 'active' ? 'ACTIF' : 'SUSPENDU'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {wizardData.member && (
              <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Sélection</p>
                    <p className="mt-1 break-words text-sm font-black text-slate-950">
                      {wizardData.member.first_name} {wizardData.member.last_name.toUpperCase()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
                    OK
                  </div>
                </div>
                <div className="mt-4 flex max-h-20 flex-wrap gap-1.5 overflow-y-auto pr-1">
                  {wizardData.financialStatus?.payments && wizardData.financialStatus.payments.length > 0 ? (
                    [...wizardData.financialStatus.payments]
                      .sort((a, b) => a.billing_period.localeCompare(b.billing_period))
                      .map(p => (
                        <span key={p.id} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                          {p.billing_period.split('-')[1]}/{p.billing_period.split('-')[0]}
                        </span>
                      ))
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Aucun historique de paiement.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="flex min-h-full flex-col justify-center space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-black tracking-tight text-slate-950">Période fiscale</h3>
              <p className="mt-2 text-sm font-medium text-slate-500">Sélectionnez l'année pour cet encaissement.</p>
            </div>
            <div className="mx-auto w-full max-w-xs rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <input
                type="number"
                value={wizardData.year}
                onChange={e => setWizardData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-5 text-center text-3xl font-black text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-950">Mois à encaisser</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">Sélectionnez une ou plusieurs périodes.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {monthsList.map((m, i) => {
                const monthStr = `${wizardData.year}-${String(i + 1).padStart(2, '0')}`;
                const isSelected = wizardData.months.includes(monthStr);
                return (
                  <button
                    key={m}
                    onClick={() => toggleMonth(i)}
                    className={`min-h-14 rounded-2xl border px-3 py-3 text-sm font-black transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'border-slate-100 bg-white text-slate-600 shadow-sm hover:border-blue-200'
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
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-950">Détails de la transaction</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">Finalisez les informations du paiement.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">Date</label>
                <input type="date" value={wizardData.payment_date} onChange={e => setWizardData(prev => ({ ...prev, payment_date: e.target.value }))} className={fieldClass} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">Méthode</label>
                <select value={wizardData.payment_method} onChange={e => setWizardData(prev => ({ ...prev, payment_method: e.target.value }))} className={fieldClass}>
                  {settings?.payment_methods?.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">Notes</label>
              <textarea placeholder="Ex: Paiement en retard, reçu donné..." value={wizardData.notes} onChange={e => setWizardData(prev => ({ ...prev, notes: e.target.value }))} className={`${fieldClass} h-28 resize-none`} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-950">Résumé final</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">Vérifiez avant validation.</p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="space-y-4 p-4">
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-400">Membre</span>
                  <span className="break-words text-sm font-black text-slate-950">{wizardData.member?.last_name.toUpperCase()} {wizardData.member?.first_name}</span>
                </div>
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-400">Mois ({wizardData.months.length})</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {wizardData.months.sort().map(m => {
                      const mIndex = parseInt(m.split('-')[1]) - 1;
                      return (
                        <span key={m} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {monthsList[mIndex]}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <span className="text-sm font-black text-slate-500">Total à encaisser</span>
                  <span className="text-3xl font-black tracking-tight text-blue-600">
                    {totalAmount} {settings?.currency || 'EUR'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[10050] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-md sm:items-center sm:p-4" onClick={onClose}>
      <div className="flex h-[calc(100dvh-0.75rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-slate-50 shadow-2xl ring-1 ring-white/40 sm:h-auto sm:max-h-[90dvh] sm:rounded-[28px]" onClick={e => e.stopPropagation()}>
        <div className="shrink-0 border-b border-slate-200/80 bg-white px-4 pb-4 pt-3 sm:px-6 sm:pt-5">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wide text-blue-600">Encaissement</p>
              <h2 className="mt-1 truncate text-xl font-black tracking-tight text-slate-950">Nouvel encaissement</h2>
              <p className="mt-1 text-xs font-bold text-slate-400">Étape {step} sur {steps.length} · {currentStep?.name}</p>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {steps.map(s => {
                const Icon = s.icon;
                const active = step >= s.id;
                return (
                  <div key={s.id} className={`flex h-9 items-center justify-center rounded-2xl transition ${active ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-300'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          {renderStepContent()}
        </div>

        {!showSuccess && (
          <div className="shrink-0 border-t border-slate-200/80 bg-white px-4 py-3 sm:px-6 sm:py-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="h-12 rounded-2xl bg-slate-100 text-sm font-black text-slate-600 transition hover:bg-slate-200 disabled:opacity-40"
              >
                Retour
              </button>
              <button
                onClick={() => step === 5 ? handleConfirm() : setStep(Math.min(5, step + 1))}
                disabled={(step === 1 && !wizardData.member) || (step === 3 && wizardData.months.length === 0)}
                className="h-12 rounded-2xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-40"
              >
                {step === 5 ? 'Confirmer' : 'Suivant'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
