import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, User, Mail, ShieldAlert, FileText, Camera } from 'lucide-react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{7,}$/;

export default function MemberModal({ isOpen, onClose, onSave, initialData = null }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: 'male',
    grade: 'Blanche',
    member_status: 'active',
    entry_date: new Date().toISOString().split('T')[0],
    photo: null,
    phone: '',
    email: '',
    address: '',
    emergency_name: '',
    emergency_phone: '',
    emergency_relationship: '',
    allergies: '',
    injuries: '',
    medical_notes: '',
    coach_notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          first_name: '',
          last_name: '',
          birth_date: '',
          gender: 'male',
          grade: 'Blanche',
          member_status: 'active',
          entry_date: new Date().toISOString().split('T')[0],
          photo: null,
          phone: '',
          email: '',
          address: '',
          emergency_name: '',
          emergency_phone: '',
          emergency_relationship: '',
          allergies: '',
          injuries: '',
          medical_notes: '',
          coach_notes: ''
        });
      }
      setStep(1);
    }
  }, [isOpen]); // Supprimé initialData ici

  if (!isOpen) return null;

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = e => setFormData({ ...formData, photo: e.target.files[0] });

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name?.trim()) newErrors.first_name = 'Prénom requis';
    if (!formData.last_name?.trim()) newErrors.last_name = 'Nom requis';
    if (!formData.birth_date) newErrors.birth_date = 'Date de naissance requise';
    if (!formData.email?.trim()) newErrors.email = 'Email requis';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Format email invalide';
    if (!formData.phone?.trim()) newErrors.phone = 'Téléphone requis';
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Format téléphone invalide';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(formData);
  };

  const steps = [
    { id: 1, name: 'Identité', icon: User },
    { id: 2, name: 'Contact', icon: Mail },
    { id: 3, name: 'Urgence', icon: ShieldAlert },
    { id: 4, name: 'Médical', icon: FileText }
  ];

  const renderInput = (name, label, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
      {errors[name] && <div className="text-red-500 text-xs mt-1">{errors[name]}</div>}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <label className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition relative">
                {formData.photo ? <img src={URL.createObjectURL(formData.photo)} className="w-full h-full rounded-full object-cover" /> : <Camera className="w-8 h-8 text-gray-400" />}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('first_name', 'Prénom')}
              {renderInput('last_name', 'Nom')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('birth_date', 'Date de naissance', 'date')}
              {renderInput('entry_date', "Date d'entrée", 'date')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
                <select name="gender" onChange={handleChange} value={formData.gender} className="w-full p-3 border border-gray-200 rounded-xl">
                  <option value="male">Masculin</option>
                  <option value="female">Féminin</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select name="grade" onChange={handleChange} value={formData.grade} className="w-full p-3 border border-gray-200 rounded-xl">
                  {['Blanche', 'Jaune', 'Orange', 'Verte', 'Bleue', 'Marron', 'Noire'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select name="member_status" onChange={handleChange} value={formData.member_status} className="w-full p-3 border border-gray-200 rounded-xl">
                <option value="active">Actif</option>
                <option value="suspended_sick">Suspendu (Maladie)</option>
                <option value="suspended_vacation">Suspendu (Vacances)</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            {renderInput('phone', 'Téléphone', 'tel')}
            {renderInput('email', 'Email')}
            {renderInput('address', 'Adresse')}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            {renderInput('emergency_name', 'Nom complet')}
            {renderInput('emergency_phone', 'Téléphone', 'tel')}
            {renderInput('emergency_relationship', 'Relation (ex: Parent)')}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
            <textarea name="allergies" onChange={handleChange} value={formData.allergies} className="w-full p-3 border border-gray-200 rounded-xl h-24" />
            <label className="block text-sm font-medium text-gray-700 mb-1">Blessures</label>
            <textarea name="injuries" onChange={handleChange} value={formData.injuries} className="w-full p-3 border border-gray-200 rounded-xl h-24" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900">{initialData ? 'Modifier le membre' : 'Nouveau Membre'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-6 h-6 text-gray-400" /></button>
        </div>
        {/* Stepper */}
        <div className="flex justify-between mb-8">
          {steps.map(s => (
            <div key={s.id} className={`flex flex-col items-center ${step >= s.id ? 'text-blue-600' : 'text-gray-300'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= s.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">{s.name}</span>
            </div>
          ))}
        </div>
        <div className="min-h-[300px]">
          {renderStep()}
        </div>
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="px-6 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 disabled:opacity-50 flex items-center gap-2"><ChevronLeft className="w-5 h-5" /> Retour</button>
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition"><ChevronRight className="w-5 h-5" /> Suivant</button>
          ) : (
            <button onClick={handleSave} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">Enregistrer</button>
          )}
        </div>
      </div>
    </div>
  );
}
