import React, { useState, useEffect } from 'react';
import { useToast } from '../../../../context/ToastContext';
import { useSettings } from './hooks/useSettings';
import { settingsService } from './services/settingsService';
import { Save, Building2, CreditCard, Clock, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const toast = useToast();
  const { settings, loading, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    monthly_tuition_price: 0,
    currency: 'EUR',
    grace_period_days: 5,
    club_name: ''
  });

  useEffect(() => {
    if (settings) {
      // Comparaison superficielle pour éviter la boucle infinie
      const hasChanged = Object.keys(settings).some(key => settings[key] !== formData[key]);
      if (hasChanged) {
        setFormData(settings);
      }
    }
  }, [settings, formData]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      toast('Paramètres enregistrés avec succès !', 'success');
    } catch (err) {
      toast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
        <input {...props} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
      </div>
    </div>
  );

  if (loading) return <div className="p-8 text-center text-slate-400 font-bold">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center mb-10">
        <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200 self-start">
            <Settings size={28} />
        </div>
        <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tighter">Paramètres</h2>
            <p className="text-sm md:text-lg text-slate-500 font-medium mt-1">Configurez l'environnement de votre club.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section Club */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-950 mb-8 flex items-center gap-2 tracking-tighter">
                <Building2 className="text-blue-600" /> Informations du Club
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Nom du Club" icon={Building2} type="text" value={formData.club_name || ''} onChange={e => setFormData({...formData, club_name: e.target.value})} />
            </div>
        </section>

        {/* Section Billing */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-950 mb-8 flex items-center gap-2 tracking-tighter">
                <CreditCard className="text-blue-600" /> Facturation & Règles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Prix Écolage" icon={CreditCard} type="number" value={formData.monthly_tuition_price} onChange={e => setFormData({...formData, monthly_tuition_price: e.target.value})} />
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Devise</label>
                    <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-600 outline-none">
                        <option value="EUR">Euro (€)</option>
                        <option value="MGA">Ariary (MGA)</option>
                    </select>
                </div>
                <InputField label="Jours de grâce" icon={Clock} type="number" value={formData.grace_period_days} onChange={e => setFormData({...formData, grace_period_days: e.target.value})} />
            </div>
        </section>

        <button type="submit" className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-3">
            <Save size={20} /> Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}
