import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-24 pb-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white" />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="px-3 py-1 rounded-full bg-blue-50 text-karatix-accent font-medium text-xs sm:text-sm mb-4 inline-block">
              La nouvelle ère du management Dojo
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-bold text-karatix-text-h mb-6 tracking-tight">
              Gérez votre dojo avec <span className="text-karatix-accent">précision</span>.
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-karatix-text mb-8 sm:mb-12 leading-relaxed px-2">
              KARATIX transforme la complexité administrative en une expérience fluide.
              Concentrez-vous sur l'enseignement, nous nous occupons du reste.
            </p>
            <div className="flex flex-col gap-3 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-xl shadow-blue-500/20"
              >
                Démarrer l'essai gratuit <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
