import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

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
      await signIn(form.email, form.password);
      
      // Récupérer explicitement l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      // Vérifier si c'est un Super Admin
      const { data: admin } = await supabase
        .from('system_admins')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (admin && admin.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Connexion échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl shadow-blue-100 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center tracking-tight">Connexion</h1>
        <p className="text-gray-500 text-center mb-8">Accédez à votre espace KARATIX</p>
        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="password">
                Mot de passe
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 font-semibold hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength="6"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-600/20"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            Créez-en un
          </Link>
        </p>
      </div>
    </section>
  );
}
