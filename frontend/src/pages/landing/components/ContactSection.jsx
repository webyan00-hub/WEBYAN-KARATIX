import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, CheckCircle } from 'lucide-react';

export default function ContactSection() {
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    const form = e.target;
    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-white">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-3xl -z-10" />
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-5xl font-display font-bold text-karatix-text-h mb-6">
                Discutons de votre <span className="text-karatix-accent">projet</span>
              </h2>
              <p className="text-xl text-karatix-text leading-relaxed">
                Notre équipe est prête à vous accompagner. Envoyez-nous un message pour toute question ou pour une démonstration personnalisée.
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <Mail className="w-6 h-6 text-karatix-accent" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="font-semibold text-karatix-text-h">webyan00@gmail.com</p>
                </div>
              </div>
              <a href="https://wa.me/261324032881" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <Phone className="w-6 h-6 text-karatix-accent" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">WhatsApp</p>
                  <p className="font-semibold text-karatix-text-h">+261 32 40 328 81</p>
                  <p className="text-xs text-karatix-accent font-medium">Cliquez pour discuter</p>
                </div>
              </a>
            </div>
          </motion.div>
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 p-12 rounded-3xl border border-green-100 text-center space-y-4"
              aria-live="polite"
              role="status"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" aria-hidden="true" />
              <h3 className="text-2xl font-bold text-green-900">Message envoyé !</h3>
              <p className="text-green-700">Merci pour votre message. Nous vous répondrons dans les plus brefs délais.</p>
              <button onClick={() => setStatus('idle')} className="text-karatix-accent font-semibold hover:underline">Envoyer un autre message</button>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              action="https://formspree.io/f/xpqgbgwp"
              method="POST"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-karatix-text-h">Nom complet</label>
                  <input name="name" type="text" required className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-karatix-accent outline-none transition-all" placeholder="Jean Dupont" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-karatix-text-h">Email</label>
                  <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-karatix-accent outline-none transition-all" placeholder="jean@exemple.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-karatix-text-h">Message</label>
                <textarea name="message" rows="4" required className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-karatix-accent outline-none transition-all" placeholder="Parlez-nous de vos besoins..."></textarea>
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full flex items-center justify-center gap-2 bg-karatix-accent text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-70"
              >
                {status === 'submitting' ? 'Envoi en cours...' : (
                  <>Envoyer <Send className="w-4 h-4" aria-hidden="true" /></>
                )}
              </button>
              {status === 'error' && (
                <p className="text-red-500 text-sm text-center" role="status" aria-live="polite">Une erreur est survenue, veuillez réessayer.</p>
              )}
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}
