import React, { useState } from 'react';
import { X, Building, Shield, ShieldOff, Users, Calendar, MapPin, Mail } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function ClubDetailsModal({ isOpen, onClose, club, onStatusChange }) {
  if (!isOpen || !club) return null;

  const toggleSuspendStatus = async () => {
    const newStatus = club.status === 'suspend' ? 'active' : 'suspend';
    const { error } = await supabase
      .from('clubs')
      .update({ status: newStatus })
      .eq('id', club.id);
    
    if (!error) {
      onStatusChange();
      onClose();
    }
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-slate-950">Détails du Club</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Building className="w-8 h-8 text-slate-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{club.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(club.status)}`}>
                {club.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl"><p className="text-slate-500">Membres</p><p className="font-bold">{club.member_count || 0}</p></div>
            <div className="p-3 bg-slate-50 rounded-xl"><p className="text-slate-500">Style</p><p className="font-bold">{club.style || 'Non défini'}</p></div>
            <div className="p-3 bg-slate-50 rounded-xl"><p className="text-slate-500">Email Admin</p><p className="font-bold truncate">{club.contact_email || 'Non défini'}</p></div>
            <div className="p-3 bg-slate-50 rounded-xl"><p className="text-slate-500">Téléphone</p><p className="font-bold">{club.phone || 'Non défini'}</p></div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-bold text-slate-500 mb-3">Informations d'abonnement</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-xl"><p className="text-blue-600">Fin essai</p><p className="font-bold">{club.trial_ends_at ? new Date(club.trial_ends_at).toLocaleDateString() : 'N/A'}</p></div>
                <div className="p-3 bg-emerald-50 rounded-xl"><p className="text-emerald-600">Fin abo</p><p className="font-bold">{club.subscription_ends_at ? new Date(club.subscription_ends_at).toLocaleDateString() : 'Non abonné'}</p></div>
                <div className="p-3 bg-slate-50 rounded-xl col-span-2"><p className="text-slate-500">Tarif mensuel</p><p className="font-bold">{club.current_tier_price?.toLocaleString()} Ar</p></div>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-xl text-sm">
            <p className="text-slate-500 mb-1">Adresse</p>
            <p className="font-bold">{club.address || 'Aucune adresse renseignée'}</p>
          </div>

          <button 
            onClick={toggleSuspendStatus}
            className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition ${club.status === 'suspend' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            {club.status === 'suspend' ? <Shield className="w-5 h-5"/> : <ShieldOff className="w-5 h-5"/>}
            {club.status === 'suspend' ? 'Réactiver le club' : 'Suspendre le club'}
          </button>
        </div>
      </div>
    </div>
  );
}
