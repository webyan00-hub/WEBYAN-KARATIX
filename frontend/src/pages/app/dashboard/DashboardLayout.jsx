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
            <img src="/logo.png" alt="Karatix Logo" className="h-8" />
            <h1 className="font-bold text-text-main text-sm truncate max-w-[60%]">{settings?.club_name || 'KARATIX'}</h1>
        </header>

        <div className="w-full">
            {club?.status === 'suspend' && (
              <>
                {/* Mobile Version - Centered & Compact */}
                <div className="md:hidden mx-4 mt-6 bg-gradient-to-br from-amber-600 to-amber-800 p-6 rounded-2xl shadow-xl shadow-amber-200/50 flex flex-col items-center text-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-lg">Accès restreint</h3>
                        <p className="text-amber-100 text-xs mt-1">Votre club est suspendu. Renouvelez votre abonnement.</p>
                    </div>
                    <button 
                        onClick={handlePayment} 
                        className="w-full bg-white text-amber-800 hover:bg-amber-50 py-3 rounded-xl font-black text-sm transition-all shadow-md"
                    >
                        Payer maintenant
                    </button>
                </div>

                {/* Desktop Version - Horizontal & Premium */}
                <div className="hidden md:flex mx-4 mt-6 bg-gradient-to-r from-amber-600 to-amber-800 p-6 rounded-3xl shadow-lg shadow-amber-200/50 items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl shrink-0">
                            <AlertTriangle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-lg tracking-tight">Accès restreint : Renouvellement requis</h3>
                            <p className="text-amber-100 font-medium text-sm mt-0.5">Votre club est actuellement suspendu. Régularisez votre situation pour retrouver toutes les fonctionnalités.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handlePayment} 
                        className="whitespace-nowrap bg-white text-amber-700 hover:bg-amber-50 px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-md"
                    >
                        Payer maintenant
                    </button>
                </div>
              </>
            )}
            <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
