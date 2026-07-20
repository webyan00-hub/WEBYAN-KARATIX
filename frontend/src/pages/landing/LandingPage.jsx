import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header, Footer } from './components/HeaderFooter';

const HeroSection = React.lazy(() => import('./components/HeroSection'));
const FeaturesSection = React.lazy(() => import('./components/FeaturesSection'));
const PricingSection = React.lazy(() => import('./components/PricingSection'));
const ContactSection = React.lazy(() => import('./components/ContactSection'));

export default function LandingPage() {
  return (
    <div>
      <Helmet>
        <title>KARATIX | Logiciel de gestion premium pour clubs de karaté</title>
        <meta
          name="description"
          content="Digitalisez votre club de karaté avec KARATIX. Gérez membres, paiements, présences et grades en toute simplicité avec une solution professionnelle et intuitive."
        />
        <meta name="robots" content="index,follow" />
        <meta
          name="keywords"
          content="karaté, club, dojo, gestion, logiciel, membres, paiements, présences, grades"
        />
        <link rel="canonical" href="https://www.karatix.com" />
        <link rel="alternate" hreflang="fr" href="https://www.karatix.com" />
        <meta
          property="og:title"
          content="KARATIX | Logiciel de gestion premium pour clubs de karaté"
        />
        <meta
          property="og:description"
          content="Digitalisez votre club de karaté avec KARATIX. Gérez membres, paiements, présences et grades en toute simplicité."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.karatix.com" />
        <meta property="og:image" content="https://www.karatix.com/og-image.png" />
      </Helmet>

      <Header />

      <main role="main">
        <Suspense fallback={<div className="py-24 text-center">Chargement...</div>}>
          <HeroSection />
        </Suspense>
        <Suspense fallback={<div className="py-24 text-center">Chargement...</div>}>
          <FeaturesSection />
        </Suspense>
        <Suspense fallback={<div className="py-24 text-center">Chargement...</div>}>
          <PricingSection />
        </Suspense>
        <Suspense fallback={<div className="py-24 text-center">Chargement…</div>}>
          <ContactSection />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
