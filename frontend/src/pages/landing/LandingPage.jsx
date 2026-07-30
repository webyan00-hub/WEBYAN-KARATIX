import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header, Footer } from './components/HeaderFooter';
import HeroSection from './components/HeroSection';

const FeaturesSection = React.lazy(() => import('./components/FeaturesSection'));
const WhyKaratixSection = React.lazy(() => import('./components/WhyKaratixSection'));
const PricingSection = React.lazy(() => import('./components/PricingSection'));
const FAQSection = React.lazy(() => import('./components/FAQSection'));
const ContactSection = React.lazy(() => import('./components/ContactSection'));

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Helmet>
        <title>KARATIX | Logiciel de gestion premium pour clubs de karaté</title>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Section principale chargée immédiatement */}
        <div className="bg-white"><HeroSection /></div>
        
        {/* Sections différées */}
        <Suspense fallback={<div className="py-24 text-center">Chargement...</div>}>
          <div className="bg-[#F1F5F9]"><FeaturesSection /></div>
          <div className="bg-[#1E3A5F]"><WhyKaratixSection /></div>
          <div className="bg-white"><PricingSection /></div>
          <div className="bg-[#F1F5F9]"><FAQSection /></div>
          <div className="bg-white"><ContactSection /></div>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}