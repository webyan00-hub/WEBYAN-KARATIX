import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Palette cohérente
const theme = {
  primary: '#1E3A5F',      // Navy
  accent: '#A16207',       // Gold
  foreground: '#0F172A',   // Text main
  muted: '#64748B'         // Text muted
};

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Connexion (signIn ne renvoie rien, elle lance une erreur si ça échoue)
      await signIn(form.email, form.password);
      
      // 2. Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // 3. Vérification rapide admin
      const isSuperAdmin = form.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;
      if (isSuperAdmin) {
        navigate('/monitoring');
        return;
      }

      // 4. Vérification status club optimisée
      const { data: club, error: clubError } = await supabase
          .from('clubs')
          .select('status')
          .eq('owner_id', user.id)
          .single();
        
      if (club?.status === 'blocked') {
           await supabase.auth.signOut();
           throw new Error('Votre club est suspendu. Veuillez contacter le support.');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Connexion échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[440px] relative z-10 bg-white border border-slate-100 p-10 rounded-[28px] shadow-2xl"
      >
        {/* Branding & En-tête */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <img src="/img/logo.png" alt="KARATIX" className="w-[80px] h-[80px] object-contain" />
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tighter mb-2" style={{ color: theme.foreground }}>Connexion</h2>
            <p className="text-sm font-medium" style={{ color: theme.muted }}>Accédez à votre espace Dojo.</p>
          </div>
        </div>

        {/* Alertes d'erreur */}
        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl font-bold">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.muted }} htmlFor="email">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.muted }} size={18} />
              <input
                id="email"
                name="email"
                type="email"
                required
                onChange={handleChange}
                placeholder="nom@dojo.com"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-base font-bold focus:outline-none focus:ring-2 transition-all"
                style={{ color: theme.foreground }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.muted }} htmlFor="password">Mot de passe</label>
              <Link to="/forgot-password" className="text-xs font-bold hover:underline" style={{ color: theme.primary }}>Oublié ?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.muted }} size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-12 text-base font-bold focus:outline-none focus:ring-2 transition-all"
                style={{ color: theme.foreground }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition"
                style={{ color: theme.muted }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-xl text-white font-bold text-base transition-all duration-300 hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: theme.primary }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-bold" style={{ color: theme.muted }}>
          Pas encore de compte ?{' '}
          <Link to="/signup" style={{ color: theme.primary }} className="hover:underline">
            Créez un compte
          </Link>
        </p>
      </motion.div>
    </motion.section>
  );
}
