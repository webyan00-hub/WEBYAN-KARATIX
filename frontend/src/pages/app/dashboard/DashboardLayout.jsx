import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from './settings/hooks/useSettings';
import { LayoutDashboard, Users, Calendar, CreditCard, FileText, Settings, LogOut, Menu, X, Bell, ChevronDown, Award, Clock, Trophy } from 'lucide-react';

import { useQueryClient } from '@tanstack/react-query';

export default function DashboardLayout() {
  const { signOut } = useAuth();
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Membre', icon: Users, path: '/dashboard/members' },
    { name: 'Paiement', icon: CreditCard, path: '/dashboard/payments' },
    { name: 'Historique', icon: FileText, path: '/dashboard/payments/history' },
    { name: 'Planning', icon: Calendar, path: '/dashboard/attendance/planning' },
    { name: 'Pointage', icon: Clock, path: '/dashboard/attendance/pointage' },
    { name: 'Suivi', icon: FileText, path: '/dashboard/attendance/history' },
    { name: 'Palmarès', icon: Award, path: '/dashboard/members/achievements' },
    { name: 'Examen', icon: Trophy, path: '/dashboard/exams' },
    { name: 'Paramètre', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 p-6 flex flex-col transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center gap-2 mb-10 px-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">{(settings?.club_name || 'K')[0]}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight truncate">{settings?.club_name || 'KARATIX'}</h1>
            <button className="md:hidden ml-auto" onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard' || item.path === '/dashboard/payments'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <button onClick={async () => { 
            await signOut(); 
            queryClient.clear();
            navigate('/login'); 
          }} className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 transition-colors">
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="bg-white border-b border-gray-100 py-4 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}><Menu className="w-6 h-6 text-gray-700" /></button>
          </div>
          {/* User Profile */}
        </header>

        <div className="p-4 md:p-8">
            <Outlet /> {/* Les pages enfants (MembersPage, etc.) s'afficheront ici */}
        </div>
      </main>
    </div>
  );
}
