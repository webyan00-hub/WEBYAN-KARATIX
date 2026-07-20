import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Settings, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function CreateClubPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const checkClub = async () => {
      const { data } = await supabase
        .from('clubs')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      
      if (data) {
        navigate('/dashboard');
      } else {
        setChecking(false);
      }
    };
    checkClub();
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    clubName: '',
    style: '',
    address: '',
    phone: '',
    contactEmail: '',
    memberCount: '',
    foundedDate: '',
    enableBooking: false,
  });

  if (checking) {
    return <section className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></section>;
  }

  const updateForm = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const submitClub = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('clubs')
        .insert([{
            name: formData.clubName,
            style: formData.style,
            address: formData.address,
            phone: formData.phone,
            contact_email: formData.contactEmail,
            member_count: formData.memberCount,
            founded_date: formData.foundedDate,
            enable_booking: formData.enableBooking,
            owner_id: user.id,
        }]);

      if (error) throw error;
      setShowSuccess(true);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const steps = [
    { id: 1, title: 'Identité', icon: Building2 },
    { id: 2, title: 'Contact', icon: MapPin },
    { id: 3, title: 'Paramètres', icon: Settings },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50 relative">
      {showSuccess && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Club enregistré !</h3>
            <p className="text-gray-500 mb-8">Votre dojo est configuré avec succès.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition">Aller au Dashboard</button>
              <button onClick={() => navigate('/')} className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">Fermer</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="max-w-xl w-full">
        <div className="flex items-center justify-between mb-10 px-2">
            {steps.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-400 border border-gray-200'}`}>
                        <s.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${step >= s.id ? 'text-blue-600' : 'text-gray-400'}`}>{s.title}</span>
                </div>
            ))}
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-medium">{error}</div>}
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Identité du Dojo</h2>
                  <div className="space-y-6">
                    <input name="clubName" placeholder="Nom du Club" onChange={updateForm} className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 transition-all focus:outline-none" />
                    <select name="style" onChange={updateForm} className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 transition-all focus:outline-none bg-white">
                      <option value="">Choisir la discipline</option>
                      {['Shotokan', 'Goju-Ryu', 'Wado-Ryu', 'Shito-Ryu'].map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                    </select>
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Localisation</h2>
                  <div className="space-y-6">
                    <input name="address" placeholder="Adresse complète" onChange={updateForm} className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 transition-all focus:outline-none" />
                    <input name="phone" placeholder="Téléphone" onChange={updateForm} className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 transition-all focus:outline-none" />
                    <input name="contactEmail" placeholder="Email public" onChange={updateForm} className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 transition-all focus:outline-none" />
                  </div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Paramètres</h2>
                  <div className="space-y-6">
                    <select name="memberCount" onChange={updateForm} className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 transition-all focus:outline-none bg-white">
                      <option value="">Nombre de membres</option>
                      <option value="<50">Moins de 50</option>
                      <option value="50-100">50 - 100</option>
                      <option value="100+">Plus de 100</option>
                    </select>
                    <input type="date" name="foundedDate" onChange={updateForm} className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 transition-all focus:outline-none" />
                    <label className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 cursor-pointer hover:bg-gray-100 transition-all">
                      <input type="checkbox" name="enableBooking" onChange={updateForm} className="w-6 h-6 rounded-md accent-blue-600" />
                      <span className="font-semibold text-gray-700">Activer la prise de RDV en ligne</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-12 flex justify-between gap-4">
              <button onClick={handleBack} disabled={step === 1 || loading} className="flex-1 py-4 rounded-2xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition disabled:opacity-50">Précédent</button>
              <button onClick={step === 3 ? submitClub : handleNext} disabled={loading} className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 3 ? 'Terminer' : 'Suivant'}
                {!loading && step !== 3 && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
        </div>
      </div>
    </section>
  );
}
