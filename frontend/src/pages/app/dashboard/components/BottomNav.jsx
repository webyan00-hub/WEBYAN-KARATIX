import React, { useState } from 'react';
import { LayoutDashboard, Users, CreditCard, Clock, Menu, X, FileText, Settings, Award, Trophy, Calendar, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export default function BottomNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const primaryNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', end: true },
    { name: 'Pointage', icon: Clock, path: '/dashboard/attendance/pointage' },
    { name: 'Membres', icon: Users, path: '/dashboard/members' },
    { name: 'Paiements', icon: CreditCard, path: '/dashboard/payments' },
  ];

  const secondaryNavItems = [
    { name: 'Examens', icon: Trophy, path: '/dashboard/exams' },
    { name: 'Suivi Paiement', icon: FileText, path: '/dashboard/payments/history' },
    { name: 'Planning', icon: Calendar, path: '/dashboard/attendance/planning' },
    { name: 'Suivi Pointage', icon: FileText, path: '/dashboard/attendance/history' },
    { name: 'Palmarès', icon: Award, path: '/dashboard/members/achievements' },
    { name: 'Paramètres', icon: Settings, path: '/dashboard/settings' },
  ];

  const handleLogout = async () => {
    await signOut();
    queryClient.clear();
    navigate('/login');
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 flex justify-between items-center z-[9999] pb-safe">
        {primaryNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 p-2 transition-all ${
                isActive ? 'text-action' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-bold">{item.name}</span>
          </NavLink>
        ))}
        
        <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center gap-1.5 p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
            <Menu className="w-6 h-6" />
            <span className="text-[10px] font-bold">Menu</span>
        </button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000]" 
            />
            <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-slate-50 rounded-t-[32px] p-6 z-[10001] shadow-2xl max-h-[80vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black text-xl text-text-main">Menu principal</h3>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white rounded-full shadow-sm"><X size={20} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {secondaryNavItems.map(item => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex flex-col items-center justify-center gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-action/20 hover:shadow-md transition-all active:scale-95"
                        >
                            <div className="p-3 bg-action/10 rounded-2xl text-action">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-xs text-text-main">{item.name}</span>
                        </NavLink>
                    ))}
                    
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center gap-4 p-6 bg-white rounded-3xl border border-red-100 shadow-sm hover:border-red-200 hover:shadow-md transition-all active:scale-95 text-red-600"
                    >
                        <div className="p-3 bg-red-50 rounded-2xl">
                            <LogOut className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-xs">Déconnexion</span>
                    </button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
