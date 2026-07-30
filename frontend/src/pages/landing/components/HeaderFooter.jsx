import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button/Button';
import { ChevronDown, Sparkles, CreditCard, HelpCircle, Users, Calendar, Wallet, Trophy, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Palette cohérente basée sur le design system
const theme = {
  primary: '#1E3A5F',      // Navy
  accent: '#A16207',       // Gold
  foreground: '#0F172A',   // Text main
  muted: '#64748B'         // Text muted
};

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-[1000] bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="KARATIX" className="w-[50px] h-[50px] object-contain" />
          <span className="text-2xl font-display font-black tracking-tighter" style={{ color: theme.foreground }}>
            KARAT<span style={{ color: theme.primary }}>IX</span>
          </span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          <a href="#features" className="text-sm font-bold transition-colors duration-200 py-4 whitespace-nowrap" style={{ color: theme.muted }} onMouseOver={(e) => e.target.style.color = theme.primary}>Fonctionnalités</a>
          <a href="#tarifs" className="text-sm font-bold transition-colors duration-200 py-4 whitespace-nowrap" style={{ color: theme.muted }} onMouseOver={(e) => e.target.style.color = theme.primary}>Tarifs</a>
          <a href="#pourquoi" className="text-sm font-bold transition-colors duration-200 py-4 whitespace-nowrap" style={{ color: theme.muted }} onMouseOver={(e) => e.target.style.color = theme.primary}>Pourquoi KARATIX</a>
        </div>

        {/* Navigation Actions */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6 whitespace-nowrap">
          <Link to="/login" className="text-sm font-bold transition-colors duration-200" style={{ color: theme.muted }}>
            Connexion
          </Link>
          <Button 
            size="sm" 
            className="text-white px-5 xl:px-6 py-2.5 text-sm font-bold rounded-full shadow-lg transition-all duration-300"
            style={{ backgroundColor: theme.primary }}
          >
            Essayer gratuitement
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} style={{ color: theme.foreground }} /> : <Menu size={24} style={{ color: theme.foreground }} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4"
          >
            <a href="#features" className="block text-sm font-bold" style={{ color: theme.foreground }} onClick={() => setIsOpen(false)}>Fonctionnalités</a>
            <a href="#tarifs" className="block text-sm font-bold" style={{ color: theme.foreground }} onClick={() => setIsOpen(false)}>Tarifs</a>
            <a href="#pourquoi" className="block text-sm font-bold" style={{ color: theme.foreground }} onClick={() => setIsOpen(false)}>Pourquoi KARATIX</a>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
              <Link to="/login" className="text-sm font-bold text-center py-3" style={{ color: theme.muted }} onClick={() => setIsOpen(false)}>Connexion</Link>
              <Button size="lg" className="w-full text-white font-bold rounded-full" style={{ backgroundColor: theme.primary }} onClick={() => setIsOpen(false)}>Essayer gratuitement</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="pt-20 pb-10 px-6" style={{ backgroundColor: theme.primary }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="flex flex-col gap-4">
            <span className="text-xl font-display font-black tracking-tighter" style={{ color: '#FFFFFF' }}>
              KARAT<span style={{ color: '#60A5FA' }}>IX</span>
            </span>
            <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
              L'écosystème intelligent dédié à l'excellence opérationnelle de votre Dojo.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: '#60A5FA' }}>Produit</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-sm transition-colors hover:text-white" style={{ color: theme.muted }}>Fonctionnalités</a></li>
              <li><a href="#tarifs" className="text-sm transition-colors hover:text-white" style={{ color: theme.muted }}>Tarifs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: '#60A5FA' }}>Gestion Dojo</h4>
            <ul className="space-y-4">
              <li className="text-sm" style={{ color: theme.muted }}>Membres</li>
              <li className="text-sm" style={{ color: theme.muted }}>Pointage</li>
              <li className="text-sm" style={{ color: theme.muted }}>Abonnements</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: '#60A5FA' }}>Légal</h4>
            <ul className="space-y-4">
              <li className="text-sm" style={{ color: theme.muted }}>Mentions légales</li>
              <li className="text-sm" style={{ color: theme.muted }}>CGU / CGV</li>
              <li className="text-sm" style={{ color: theme.muted }}>Confidentialité</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex justify-center">
          <p className="text-xs font-light" style={{ color: theme.muted }}>
            &copy; {new Date().getFullYear()} KARATIX. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
