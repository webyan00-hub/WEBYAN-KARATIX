import React from 'react';
import { motion } from 'framer-motion';
import { Users, CreditCard, Calendar, Award } from 'lucide-react';

const features = [
  { icon: Users, title: "Gestion des membres", description: "Suivez vos licenciés, leurs coordonnées et leur historique en un clic." },
  { icon: CreditCard, title: "Paiements simplifiés", description: "Automatisez vos encaissements et gérez vos abonnements sans effort." },
  { icon: Calendar, title: "Planning & Présences", description: "Gérez vos cours, vos événements et les présences des élèves facilement." },
  { icon: Award, title: "Suivi des grades", description: "Une gestion intuitive des passages de grades et des ceintures." },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-center text-karatix-text-h mb-16">
          Tout pour gérer votre Dojo
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-blue-50/50 border border-blue-100 hover:shadow-xl transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-karatix-accent mb-6" aria-hidden="true" />
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-karatix-text">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
