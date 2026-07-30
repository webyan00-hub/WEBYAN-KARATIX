import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building, ShieldAlert, LogOut, CreditCard, Menu, X, BarChart3 } from 'lucide-react';

export default function MonitoringLayout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = [
    { name: 'Vue Globale', icon: LayoutDashboard, path: '/monitoring' },
    { name: 'Gestion Clubs', icon: Building, path: '/monitoring/clubs' },
    { name: 'Abonnements', icon: CreditCard, path: '/monitoring/subscriptions' },
    { name: 'Gestion Abonnements', icon: BarChart3, path: '/monitoring/management' },
    { name: 'Logs Activité', icon: ShieldAlert, path: '/monitoring/logs' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Mobile & Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-6 flex flex-col transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:sticky md:top-0 md:h-screen`}>
        <div className="flex items-center justify-between mb-12 px-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <ShieldAlert className="text-white w-6 h-6" />
                </div>
                <h1 className="text-xl font-black text-slate-950 tracking-tight">KARATIX<span className='text-indigo-600'>.ADMIN</span></h1>
            </div>
            <button className="md:hidden p-2 text-slate-500" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
            </button>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <button onClick={() => navigate('/')} className="flex items-center gap-4 px-5 py-4 text-slate-500 hover:text-red-600 transition-colors font-bold rounded-2xl hover:bg-red-50">
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 py-5 flex items-center justify-between">
            <button className="md:hidden p-2 -ml-2 text-slate-700" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden md:block">Panel Administration</h2>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">SA</div>
        </header>
        <div className="p-4 md:p-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
