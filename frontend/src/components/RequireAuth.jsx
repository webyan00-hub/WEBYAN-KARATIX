import { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const [hasClub, setHasClub] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const checkPermissions = async () => {
        // Vérifier si Admin
        const { data: admin } = await supabase
          .from('system_admins')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (admin?.role === 'super_admin') {
            setIsSuperAdmin(true);
            setHasClub(true); // Autorisé à passer
            return;
        }

        // Sinon vérifier le club
        const { data, error } = await supabase
          .from('clubs')
          .select('id')
          .eq('owner_id', user.id)
          .single();
        
        setHasClub(!!data);
      };
      checkPermissions();
    }
  }, [user]);

  if (loading || hasClub === null) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  // Si l'utilisateur n'est pas admin, n'a pas de club et n'est pas déjà sur la page de création, on le redirige
  if (!isSuperAdmin && !hasClub && window.location.pathname !== '/create-club') {
    return <Navigate to="/create-club" replace />;
  }

  // Si l'utilisateur a un club, mais qu'il est sur la page de création, on le renvoie au dashboard
  if (!isSuperAdmin && hasClub && window.location.pathname === '/create-club') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
