import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button/Button';

// Palette cohérente
const theme = {
  primary: '#1E3A5F',      // Navy
  accent: '#A16207',       // Gold
  foreground: '#0F172A',   // Text main
  muted: '#64748B'         // Text muted
};

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-40 pb-32 px-6 overflow-hidden bg-white">
      <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 font-bold text-xs uppercase tracking-widest" style={{ borderColor: theme.primary + '20', color: theme.primary }}>
            Gestion de Dojo Nouvelle Génération
          </span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-8 md:mb-10"
          style={{ color: theme.foreground }}
        >
          L'excellence opérationnelle pour votre <span style={{ color: theme.primary }}>Dojo</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl leading-relaxed mb-10 md:mb-12 max-w-2xl font-medium"
          style={{ color: theme.muted }}
        >
          Automatisez la complexité administrative et sublimez votre enseignement avec notre plateforme SaaS conçue pour la performance et l'élégance.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button 
            size="lg" 
            className="h-14 px-10 text-lg font-bold rounded-full shadow-lg transition-all duration-300" 
            style={{ backgroundColor: theme.primary }}
            onClick={() => navigate('/signup')}
          >
            Commencer l'essai gratuit
          </Button>
          <a 
            href="#features" 
            className="h-14 px-10 text-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 rounded-full inline-flex items-center justify-center font-bold"
            style={{ color: theme.foreground }}
          >
            En savoir plus
          </a>
        </motion.div>
      </div>
    </section>
  );
}
