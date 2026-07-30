import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from './settings/hooks/useSettings';
import { useToast } from '../../../context/ToastContext';
import { LayoutDashboard, Users, Calendar, CreditCard, FileText, Settings, LogOut, Menu, X, AlertTriangle, Award, Clock, Trophy } from 'lucide-react';
import { paymentService } from './payments/services/paymentService';
import BottomNav from './components/BottomNav';

import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export default function DashboardLayout() {
  const { signOut, club } = useAuth();
  const { settings } = useSettings();
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ... (handlePayment, useEffect restent identiques)
  const handlePayment = async () => {
    try {
        if (!club || !club.id) {
            toast('Erreur: Club non trouvé', 'error');
            return;
        }
        const sessionData = await paymentService.createPaymentSession(10000, club.id, `SUB-${club.id}-${Date.now()}`);
        const link = sessionData.paymentLink || (sessionData.data && sessionData.data.paymentLink);
        if (link) { window.location.href = link; } else { toast('Erreur lors de la création de la session de paiement', 'error'); }
    } catch (err) {
        toast('Erreur lors du paiement', 'error');
    }
  };

  useEffect(() => {
    const checkClubStatus = async () => {
      if (club) {
        const { data: latestClub } = await supabase.from('clubs').select('status').eq('id', club.id).single();
        if (latestClub && latestClub.status === 'blocked') {
           await signOut(); queryClient.clear(); navigate('/login'); toast('Votre club a été bloqué.', 'error');
        }
      }
    };
    checkClubStatus();
    const interval = setInterval(checkClubStatus, 60000);
    return () => clearInterval(interval);
  }, [club, navigate, signOut, queryClient, toast]);

  const navItems = [
    { name: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Membres', icon: Users, path: '/dashboard/members' },
    { name: 'Paiement', icon: CreditCard, path: '/dashboard/payments' },
    { name: 'Suivi Paiement', icon: FileText, path: '/dashboard/payments/history' },
    { name: 'Planning', icon: Calendar, path: '/dashboard/attendance/planning' },
    { name: 'Pointage', icon: Clock, path: '/dashboard/attendance/pointage' },
    { name: 'Suivi Pointage', icon: FileText, path: '/dashboard/attendance/history' },
    { name: 'Palmarès', icon: Award, path: '/dashboard/members/achievements' },
    { name: 'Examen', icon: Trophy, path: '/dashboard/exams' },
    { name: 'Paramètres', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-bg-app flex">
      {/* Sidebar Desktop */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 p-6 flex flex-col transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 hidden md:flex`}>
        <div className="flex items-center gap-4 mb-12 px-2">
            <h1 className="text-xl font-black text-slate-950 tracking-tighter truncate leading-tight">{settings?.club_name || 'KARATIX'}</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-action'
                    : 'text-text-muted hover:bg-slate-50 hover:text-text-main'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <button onClick={async () => { await signOut(); queryClient.clear(); navigate('/login'); }} className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-red-600 transition-colors">
          <LogOut className="w-5 h-5" /> Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <header className="bg-white border-b border-slate-100 py-4 px-4 flex items-center justify-between sticky top-0 z-40 md:hidden">
            <img src="/img/Logo.png" alt="Karatix Logo" className="h-8" />
            <h1 className="font-bold text-text-main text-sm truncate max-w-[60%]">{settings?.club_name || 'KARATIX'}</h1>
        </header>

        <div className="p-4 md:p-8">
            {club?.status === 'suspend' && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-xl shadow-sm">
                <p className="text-sm text-amber-700 font-medium">Votre club est suspendu. <button onClick={handlePayment} className="font-bold underline">Payer maintenant</button></p>
              </div>
            )}
            <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
