import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft } from 'lucide-react';

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
    <section className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl shadow-blue-100 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center tracking-tight">Mot de passe oublié ?</h1>
        <p className="text-gray-500 text-center mb-8">Entrez votre email pour recevoir le lien de réinitialisation.</p>
        
        {error && <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>}
        {message && <div className="mb-6 p-4 text-sm text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">{message}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            {loading ? 'Envoi…' : 'Envoyer le lien'}
          </button>
        </form>
        
        <div className="mt-8 text-center">
            <Link to="/login" className="text-sm text-gray-600 font-semibold hover:text-blue-600 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Retour à la connexion
            </Link>
        </div>
      </div>
    </section>
  );
}
