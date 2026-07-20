import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      // Redirection vers la page de création de club après une inscription réussie
      navigate('/create-club');
    } catch (err) {
      setError(err.message || 'Inscription échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl shadow-blue-100 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center tracking-tight">Créer un compte</h1>
        <p className="text-gray-500 text-center mb-8">Rejoignez la communauté KARATIX</p>
        {error && <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">Mot de passe</label>
            <input id="password" name="password" type="password" required minLength="6" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
          </div>
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="confirmPassword">Confirmez le mot de passe</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required minLength="6" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-600/20">
            {loading ? 'Inscription…' : 'S’inscrire'}
          </button>
        </form>
        <p className="mt-8 text-sm text-center text-gray-600">Vous avez déjà un compte ? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Se connecter</Link></p>
      </div>
    </section>
  );
}
