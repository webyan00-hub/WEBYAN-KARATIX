import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap } from 'lucide-react';

const pricingTiers = [
  { id: 'free', name: 'Gratuit (Club Débutant)', members: 5, priceMGA: 0, priceEUR: 0, desc: 'Pour gérer sereinement votre dojo.' },
  { id: 'standard', name: 'Club Standard', members: 25, priceMGA: 10000, priceEUR: 10, desc: 'Idéal pour les clubs en développement.' },
  { id: 'elite', name: 'Dojo Elite', members: 50, priceMGA: 30000, priceEUR: 30, desc: 'La puissance pour les clubs actifs.' },
  { id: 'pro', name: 'Dojo Elite +', members: 100, priceMGA: 50000, priceEUR: 75, desc: 'Solution complète pour les grands clubs.' },
];

const featuresList = [
  "Création de club instantanée (Multi-club RLS)",
  "Membres, Grades et Fiche Médicale",
  "Paiements, Présences & Passage de Ceinture"
];

export default function PricingSection() {
  const [currency, setCurrency] = useState('MGA');
  const [memberTier, setMemberTier] = useState(pricingTiers[1]); // Par défaut Standard

  const handleMemberChange = (e) => {
    const val = parseInt(e.target.value);
    let tier = pricingTiers[0];
    if (val >= 100) tier = pricingTiers[3];
    else if (val >= 50) tier = pricingTiers[2];
    else if (val >= 25) tier = pricingTiers[1];
    setMemberTier(tier);
  };

  const displayPrice = () => {
    if (memberTier.priceMGA === 0) return 'Gratuit';
    return currency === 'MGA'
      ? memberTier.priceMGA.toLocaleString() + ' Ar'
      : memberTier.priceEUR + ' €';
  };

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[800px] sm:h-[800px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10" />
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-karatix-text-h mb-4 sm:mb-6">TARIFS TRANSPARENT</h2>
          <p className="text-lg sm:text-xl text-karatix-text max-w-2xl mx-auto px-2">Choisissez la taille de votre club et estimez instantanément votre tarif mensuel.</p>
        </div>
        <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 md:p-16 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Colonne Gauche: Simulateur + Fonctionnalités */}
            <div className="space-y-8 sm:space-y-10">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-6 text-karatix-text-h">Simulateur de capacité</h3>
                <div className="inline-flex bg-gray-100 p-1 rounded-full mb-6 sm:mb-8 shadow-inner overflow-hidden w-full sm:w-auto">
                  {["MGA", "EUR"].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`flex-1 px-6 sm:px-8 py-2.5 rounded-full font-bold transition-all text-sm sm:text-base ${currency === curr ? 'bg-white text-karatix-accent shadow-sm' : 'text-gray-500'}`}
                    >
                      {curr === 'MGA' ? 'Ariary (MGA)' : 'Euro (€)'}
                    </button>
                  ))}
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-900">Nombre d'élèves / pratiquants</label>
                  <input type="range" min="5" max="150" step="1" defaultValue="25" onChange={handleMemberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-karatix-accent" />
                  <div className="text-2xl sm:text-3xl font-bold text-karatix-accent">{memberTier.members} élèves</div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-karatix-text-h text-sm">Inclus dans la formule :</h4>
                {featuresList.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-blue-100 p-1 rounded-full shrink-0">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-karatix-accent" aria-hidden="true" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Colonne Droite: Résultat */}
            <AnimatePresence mode="wait">
              <motion.div
                key={memberTier.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-karatix-accent to-blue-700 p-8 sm:p-10 rounded-3xl text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden"
              >
                <Zap className="absolute top-6 right-6 w-8 h-8 sm:w-12 sm:h-12 text-white/10" aria-hidden="true" />
                <p className="font-bold uppercase tracking-widest text-white/80 text-xs mb-2">Formule idéale</p>
                <h4 className="text-2xl sm:text-3xl font-bold mb-4">{memberTier.name}</h4>
                <p className="text-blue-100 mb-6 sm:mb-8 text-sm sm:text-base max-w-[250px]">{memberTier.desc}</p>
                <div className="text-4xl sm:text-6xl font-bold mb-2">{displayPrice()}</div>
                <p className="text-blue-200 mb-6 sm:mb-10 text-sm">/ mois</p>
                <button className="w-full bg-white text-karatix-accent py-3 sm:py-4 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg text-sm sm:text-base">
                  Démarrer avec ce tarif
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="text-center text-xs text-gray-400 mt-8 sm:mt-12 font-medium">Aucune carte bancaire requise lors de l'onboarding.</p>
        </div>
      </div>
    </section>
  );
}
