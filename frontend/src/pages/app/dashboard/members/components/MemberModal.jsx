import React, { useState, useEffect } from 'react';
import { X, User, Phone, AlertTriangle, Stethoscope, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../../context/ToastContext';

export default function MemberModal({ isOpen, onClose, onSave, initialData = null }) {
  const toast = useToast();  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', birth_date: '', gender: 'male', grade: 'Blanche',
    entry_date: new Date().toISOString().split('T')[0], phone: '', email: '', address: '',
    emergency_name: '', emergency_phone: '', emergency_relationship: '',
    allergies: '', injuries: '', medical_notes: '', photo: null
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData(initialData || {
        first_name: '', last_name: '', birth_date: '', gender: 'male', grade: 'Blanche',
        entry_date: new Date().toISOString().split('T')[0], phone: '', email: '', address: '',
        emergency_name: '', emergency_phone: '', emergency_relationship: '',
        allergies: '', injuries: '', medical_notes: '', photo: null
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = e => setFormData({ ...formData, photo: e.target.files[0] });

  const steps = [
    { title: 'Identité', icon: User },
    { title: 'Contact', icon: Phone },
    { title: 'Urgence', icon: AlertTriangle },
    { title: 'Santé', icon: Stethoscope }
  ];

  const inputClass = "w-full bg-bg-surface border border-slate-200 rounded-lg p-3.5 focus:ring-2 focus:ring-action focus:border-transparent outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-text-main mb-2";

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden shadow-sm">
                    {formData.photo ? (
                        <img src={URL.createObjectURL(formData.photo)} className="w-full h-full object-cover" />
                    ) : (
                        <Camera className="text-slate-400" size={24} />
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="text-sm">
                    <p className="font-bold text-text-main">Photo du membre</p>
                    <p className="text-text-muted text-xs">PNG, JPG max 5MB</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div><label className={labelClass}>Nom</label><input name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Prénom</label><input name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div><label className={labelClass}>Date d'entrée</label><input type="date" name="entry_date" value={formData.entry_date} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>Date de naissance</label><input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div>
                    <label className={labelClass}>Sexe</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                        <option value="male">Masculin</option>
                        <option value="female">Féminin</option>
                        <option value="other">Autre</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Grade</label>
                    <select name="grade" value={formData.grade} onChange={handleChange} className={inputClass}>
                        {['Blanche', 'Jaune', 'Orange', 'Verte', 'Bleue', 'Marron', 'Noire'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Statut</label>
                    <select name="member_status" value={formData.member_status} onChange={handleChange} className={inputClass}>
                        <option value="active">Actif</option>
                        <option value="suspended_sick">Malade</option>
                        <option value="vacation">Vacances</option>
                    </select>
                </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div><label className={labelClass}>Email</label><input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Téléphone</label><input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Adresse</label><textarea name="address" value={formData.address} onChange={handleChange} className={`${inputClass} h-24`} /></div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div><label className={labelClass}>Nom du contact</label><input name="emergency_name" value={formData.emergency_name} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Téléphone urgence</label><input name="emergency_phone" value={formData.emergency_phone} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Lien de parenté</label><input name="emergency_relationship" value={formData.emergency_relationship} onChange={handleChange} className={inputClass} /></div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div><label className={labelClass}>Allergies</label><textarea name="allergies" value={formData.allergies} onChange={handleChange} className={`${inputClass} h-24`} /></div>
            <div><label className={labelClass}>Blessures</label><textarea name="injuries" value={formData.injuries} onChange={handleChange} className={`${inputClass} h-24`} /></div>
            <div><label className={labelClass}>Notes médicales</label><textarea name="medical_notes" value={formData.medical_notes} onChange={handleChange} className={`${inputClass} h-24`} /></div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="bg-white rounded-2xl w-full max-w-[800px] shadow-2xl flex flex-col max-h-[90vh] my-auto"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-text-main tracking-tight flex items-center gap-3">
              <User className="text-action" size={24} />
              {initialData ? 'Modifier membre' : 'Nouveau membre'}
            </h2>
            <p className="text-text-muted text-sm">Ajoutez les informations essentielles du pratiquant.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-text-muted" /></button>
        </div>

        <div className="px-8 pt-8 pb-4">
            <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Étape {currentStep} sur 4</span>
                <span className="text-[10px] font-bold text-action uppercase tracking-wider">{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <div className="flex gap-2 mb-8">
                {[1,2,3,4].map(step => (
                    <div key={step} className={`h-1 flex-1 rounded-full ${currentStep >= step ? 'bg-action' : 'bg-slate-100'}`} />
                ))}
            </div>
            <div className="flex justify-between">
                {steps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep === i + 1 ? 'bg-action text-white' : currentStep > i + 1 ? 'bg-blue-100 text-action' : 'bg-slate-100 text-text-muted'}`}>
                            {React.createElement(step.icon, { size: 12 })}
                        </div>
                        <span className={`text-[10px] font-bold ${currentStep === i + 1 ? 'text-text-main' : 'text-text-muted'}`}>{step.title}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="px-8 py-4 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-8 border-t border-slate-100 flex justify-between items-center bg-slate-50 rounded-b-2xl">
          <button 
            disabled={currentStep === 1} 
            onClick={() => setCurrentStep(currentStep - 1)} 
            className="px-8 py-3 font-bold text-black border border-slate-200 bg-white hover:bg-slate-50 rounded-xl disabled:opacity-30 transition-all flex items-center gap-2"
          >
            <ChevronLeft size={20} /> Retour
          </button>
          {currentStep < 4 ? (
            <button onClick={() => setCurrentStep(currentStep + 1)} className="px-8 py-3 font-bold text-black bg-slate-200 hover:bg-slate-300 rounded-xl shadow-md transition-all flex items-center gap-2">
              Continuer <ChevronRight size={20} />
            </button>
          ) : (
            <button onClick={() => onSave(formData)} className="px-8 py-3 font-bold text-black bg-slate-200 hover:bg-slate-300 rounded-xl shadow-md transition-all">
              Enregistrer
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
