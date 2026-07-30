import React from 'react';
import { motion } from 'framer-motion';

const theme = {
  primary: '#1E3A5F',      // Navy
  accent: '#A16207',       // Gold
  foreground: '#0F172A',   // Text main
  muted: '#64748B'         // Text muted
};

const pricingPlans = [
  { name: "Starter", price: "10 000 Ar", members: "1-30 membres" },
  { name: "Professional", price: "20 000 Ar", members: "31-70 membres", popular: true },
  { name: "Business", price: "35 000 Ar", members: "71-150 membres" },
  { name: "Enterprise", price: "50 000 Ar", members: "150+ membres" }
];

export default function PricingSection() {
  return (
    <section id="tarifs" className="py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black tracking-tighter mb-6" style={{ color: theme.foreground }}>
            Des tarifs adaptés à votre échelle.
          </h2>
          <p className="text-xl leading-relaxed font-medium" style={{ color: theme.muted }}>
            Commencez gratuitement, puis choisissez la formule correspondant à la taille de votre Dojo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`p-6 md:p-10 rounded-3xl border ${plan.popular ? 'border-2 shadow-xl' : 'border'}`}
              style={{ 
                borderColor: plan.popular ? theme.accent : '#E2E8F0',
                backgroundColor: 'white'
              }}
              >
              {plan.popular && (
                <div className="text-[10px] md:text-xs font-bold px-3 md:px-4 py-1 rounded-full inline-block mb-4 md:mb-6 uppercase tracking-widest" style={{ backgroundColor: theme.accent, color: 'white' }}>
                  Recommandé
                </div>
              )}
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ color: theme.muted }}>{plan.name}</h3>
              <div className="text-3xl md:text-4xl font-black mb-4 md:mb-6" style={{ color: theme.foreground }}>{plan.price}</div>
              <p className="font-bold text-xs md:text-sm mb-2" style={{ color: theme.foreground }}>{plan.members}</p>
              </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
