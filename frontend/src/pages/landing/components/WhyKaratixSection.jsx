import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, TrendingUp } from 'lucide-react';

const theme = {
  primary: '#1E3A5F',      // Navy
  accent: '#A16207',       // Gold
  foreground: '#FFFFFF',   // White
  muted: '#CBD5E1'         // Slate-300
};

const solutions = [
  { title: "Données sécurisées", description: "Protégez vos informations avec des sauvegardes automatiques.", icon: ShieldCheck },
  { title: "Processus automatisés", description: "Gagnez du temps sur vos tâches administratives.", icon: Zap },
  { title: "Pilotage stratégique", description: "Prenez des décisions éclairées grâce aux données.", icon: TrendingUp },
];

export default function WhyKaratixSection() {
  return (
    <section id="pourquoi" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black tracking-tighter mb-6"
            style={{ color: theme.foreground }}
          >
            Fini la gestion artisanale, <br />
            passez à l'ère de la sérénité.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl mx-auto leading-relaxed max-w-2xl font-medium"
            style={{ color: theme.muted }}
          >
            Le temps passé sur l'administratif est du temps volé à votre enseignement. Voici pourquoi nous avons conçu KARATIX.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solutions.map((sol, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-10 rounded-3xl border border-white/10"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl mb-8" style={{ backgroundColor: theme.accent + '20' }}>
                <sol.icon size={32} style={{ color: theme.accent }} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tighter" style={{ color: theme.foreground }}>{sol.title}</h3>
              <p className="text-lg leading-relaxed font-medium" style={{ color: theme.muted }}>{sol.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
