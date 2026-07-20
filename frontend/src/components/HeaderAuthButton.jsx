import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HeaderAuthButton() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => navigate('/login');
  const handleLogout = () => {
    // signOut will redirect to /login automatically
    // but we can also call to signOut here if the user is on a protected route
    navigate('/login');
  };

  return (
    <div>
      {user ? (
        <button
          type="button"
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 transition"
        >
          Se déconnecter
        </button>
      ) : (
        <button
          type="button"
          onClick={handleLogin}
          className="bg-karatix-accent text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
        >
          Se connecter
        </button>
      )}
    </div>
  );
}
