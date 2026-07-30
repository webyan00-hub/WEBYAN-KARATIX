import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const theme = {
  primary: '#1E3A5F',      // Navy
  accent: '#A16207',       // Gold
  foreground: '#0F172A',   // Text main
  muted: '#64748B'         // Text muted
};

const faqs = [
  {
    question: "L'essai de 14 jours est-il vraiment gratuit ?",
    answer: "Absolument. Vous bénéficiez d'un accès complet à toutes les fonctionnalités de KARATIX pendant 14 jours, sans aucun engagement et sans avoir à fournir de carte bancaire."
  },
  {
    question: "Comment le prix de mon abonnement est-il calculé ?",
    answer: "Notre tarification est équitable et dynamique. Le prix est basé sur le nombre de membres actifs dans votre Dojo. Il est automatiquement recalculé à la fin de votre essai et lors du renouvellement mensuel."
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer: "La sécurité est notre priorité absolue. Vos données sont hébergées sur des serveurs sécurisés, avec des sauvegardes automatiques quotidiennes et un chiffrement aux normes industrielles."
  },
  {
    question: "Quel type de support proposez-vous ?",
    answer: "Nous accompagnons chaque club avec une documentation détaillée et un support par email réactif pour vous assurer une prise en main rapide et sans accroc."
  }
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex justify-between items-center text-left"
      >
        <span className="text-xl font-bold tracking-tighter" style={{ color: theme.foreground }}>{question}</span>
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
          <Plus style={{ color: theme.primary }} size={24} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-lg pb-8 leading-relaxed font-medium" style={{ color: theme.muted }}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQSection() {
  return (
    <section id="faq" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black tracking-tighter mb-6" style={{ color: theme.foreground }}>
            Des questions ? Nous avons les réponses.
          </h2>
          <p className="text-xl leading-relaxed font-medium" style={{ color: theme.muted }}>
            Tout ce que vous devez savoir pour démarrer sereinement avec KARATIX.
          </p>
        </div>
        
        <div className="border-t border-slate-200">
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
