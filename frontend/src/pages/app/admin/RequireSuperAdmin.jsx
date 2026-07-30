import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function RequireSuperAdmin({ children }) {
  const { user, loading: authLoading } = useAuth();
  
  if (authLoading) return <div>Vérification des accès...</div>;

  // Rediriger vers login si non connecté, ou vers dashboard si pas admin
  if (!user) return <Navigate to="/login" replace />;
  
  const isSuperAdmin = user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}
