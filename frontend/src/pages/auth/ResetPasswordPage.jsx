import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      
      toast('Mot de passe mis à jour avec succès.', 'success');
      navigate('/login');
    } catch (err) {
      toast(err.message || 'Erreur lors de la réinitialisation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl shadow-blue-100 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center tracking-tight">Nouveau mot de passe</h1>
        <p className="text-gray-500 text-center mb-8">Définissez votre nouveau mot de passe sécurisé.</p>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-8 relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[2.6rem] text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            {loading ? 'Mise à jour…' : 'Réinitialiser'}
          </button>
        </form>
      </div>
    </section>
  );
}
