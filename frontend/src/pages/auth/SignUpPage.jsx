import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password);
      navigate('/create-club');
    } catch (err) {
      setError(err.message || 'Inscription échouée');
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
            <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter mb-2">Inscription</h2>
            <p className="text-sm text-[#64748B]">Rejoignez la communauté KARATIX.</p>
          </div>
        </Link>

        {/* Alertes d'erreur */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 text-sm text-status-error bg-red-50 border border-red-100 rounded-lg"
          >
            {error}
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
                name="email"
                type="email"
                required
                onChange={handleChange}
                placeholder="nom@dojo.com"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg p-3 pl-10 text-base text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-action transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg p-3 pl-10 pr-12 text-base text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-action transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="confirmPassword">
              Confirmez le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg p-3 pr-12 text-base text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-action transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-lg bg-[#0F172A] hover:bg-action text-white font-bold text-base transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Inscription…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#64748B]">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="text-[#2563EB] font-bold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </motion.section>
  );
}
