import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMessage('Un lien de réinitialisation a été envoyé à votre adresse email.');
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] font-sans antialiased"
    >
      <div className="w-full max-w-[440px] bg-white/80 backdrop-blur-xl border border-slate-200/60 p-10 rounded-[28px] shadow-2xl shadow-blue-500/10">
        {/* Branding & En-tête */}
        <Link to="/" className="flex flex-col items-center gap-4 mb-10">
          <img src="/logo.png" alt="KARATIX" className="w-[100px] h-[100px] object-contain" />
          <div className="text-center">
            <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter mb-2">Mot de passe oublié ?</h2>
            <p className="text-sm text-[#64748B]">Entrez votre email pour recevoir le lien de réinitialisation.</p>
          </div>
        </Link>

        {/* Alertes d'état */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 text-sm text-status-error bg-red-50 border border-red-100 rounded-lg">
            {error}
          </motion.div>
        )}
        {message && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg">
            {message}
          </motion.div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="email">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@dojo.com"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg p-3 pl-10 text-base text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-action transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-lg bg-[#0F172A] hover:bg-action text-white font-bold text-base transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm">
          <Link to="/login" className="text-[#2563EB] font-bold hover:underline flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Retour à la connexion
          </Link>
        </p>
      </div>
    </motion.section>
  );
}
