import React, { useState, useEffect } from 'react';
import { useToast } from '../../../../context/ToastContext';
import { useSettings } from './hooks/useSettings';

export default function SettingsPage() {
  const toast = useToast();
  const { settings, loading, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    monthly_tuition_price: 0,
    currency: 'EUR',
    grace_period_days: 5,
    club_name: '',
    club_logo_url: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      toast('Paramètres enregistrés avec succès !', 'success');
    } catch (err) {
      toast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">Paramètres du Club</h2>
      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du Club</label>
            <input type="text" value={formData.club_name || ''} onChange={e => setFormData({...formData, club_name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prix de l'écolage</label>
            <input type="number" value={formData.monthly_tuition_price} onChange={e => setFormData({...formData, monthly_tuition_price: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Devise</label>
            <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl">
              <option value="EUR">Euro (€)</option>
              <option value="MGA">Ariary (MGA)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jours de grâce</label>
            <input type="number" value={formData.grace_period_days} onChange={e => setFormData({...formData, grace_period_days: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" />
          </div>
        </div>
        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">Enregistrer</button>
      </form>
    </div>
  );
}
