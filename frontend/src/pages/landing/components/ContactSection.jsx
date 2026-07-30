import React from 'react';
import { motion } from 'framer-motion';

const theme = {
  primary: '#1E3A5F',      // Navy
  accent: '#A16207',       // Gold
  foreground: '#0F172A',   // Text main
  muted: '#64748B'         // Text muted
};

export default function ContactSection() {
  return (
    <section id="contact" className="py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* Texte - Gauche */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-5xl font-black tracking-tighter mb-6" style={{ color: theme.foreground }}>
              Des besoins spécifiques pour votre Dojo ?
            </h2>
            <p className="text-xl leading-relaxed font-medium" style={{ color: theme.muted }}>
              Notre équipe d'experts est dédiée à la réussite de votre transformation digitale. Échangeons sur vos enjeux pour configurer la solution idéale.
            </p>
          </motion.div>

          {/* Formulaire - Droite */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-[#F8FAFC] p-10 rounded-3xl border border-slate-100 space-y-6"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.muted }}>Nom complet</label>
              <input type="text" className="w-full bg-white border border-slate-200 rounded-2xl p-4 font-bold focus:outline-none focus:ring-2 transition-all" style={{ color: theme.foreground }} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.muted }}>Email professionnel</label>
              <input type="email" className="w-full bg-white border border-slate-200 rounded-2xl p-4 font-bold focus:outline-none focus:ring-2 transition-all" style={{ color: theme.foreground }} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.muted }}>Description de votre projet</label>
              <textarea rows={4} className="w-full bg-white border border-slate-200 rounded-2xl p-4 font-bold focus:outline-none focus:ring-2 transition-all" style={{ color: theme.foreground }}></textarea>
            </div>
            <button className="w-full py-5 rounded-2xl font-bold text-lg hover:opacity-90 transition-all duration-300 shadow-lg" style={{ backgroundColor: theme.primary, color: 'white' }}>
              Envoyer ma demande
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
