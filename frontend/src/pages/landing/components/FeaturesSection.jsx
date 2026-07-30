import React from 'react';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, CreditCard, Award } from 'lucide-react';

const theme = {
  primary: '#1E3A5F',      // Navy
  accent: '#A16207',       // Gold
  foreground: '#0F172A',   // Text main
  muted: '#64748B'         // Text muted
};

const features = [
  {
    title: "Gestion des Membres",
    description: "Centralisez vos membres, leurs profils, leurs grades et leur historique dans une seule plateforme intuitive.",
    icon: Users,
  },
  {
    title: "Pointage & Présence",
    description: "Suivez les présences en temps réel et identifiez rapidement l'assiduité de vos élèves pour mieux accompagner leur progression.",
    icon: CalendarCheck,
  },
  {
    title: "Abonnements Automatisés",
    description: "Automatisez les cotisations, suivez les paiements et sécurisez les revenus de votre club sans gestion manuelle.",
    icon: CreditCard,
  },
  {
    title: "Examen, Grades & Palmarès",
    description: "Suivez la progression de chaque élève, gérez les passages de grades et valorisez chaque réussite au sein de votre dojo.",
    icon: Award,
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6 border-y border-slate-200">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-bold text-xs uppercase tracking-[0.2em] mb-4 block"
            style={{ color: theme.primary }}
          >
            LEVIER DE PERFORMANCE
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black tracking-tighter mb-6"
            style={{ color: theme.foreground }}
          >
            L'excellence opérationnelle pour votre Dojo.
          </motion.h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl mb-6 md:mb-8" style={{ backgroundColor: theme.primary + '10' }}>
                <feature.icon size={28} md:size={32} style={{ color: theme.primary }} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 tracking-tighter" style={{ color: theme.foreground }}>{feature.title}</h3>
              <p className="text-base md:text-lg leading-relaxed font-medium" style={{ color: theme.muted }}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
