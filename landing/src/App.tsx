import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Metrics } from './components/Metrics';
import { InteractiveMockup } from './components/InteractiveMockup';
import { PricingTiers } from './components/PricingTiers';
import { Features } from './components/Features';
import { TechStack } from './components/TechStack';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#07090b] text-zinc-100 relative selection:bg-brand-gold selection:text-black">
      {/* Background Gradients & Textures */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="grid-bg background-base" />
        <div className="large-blur background-base" />
        <div className="small-blur background-base" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <Metrics />
          <InteractiveMockup />
          <PricingTiers />
          <Features />
          <TechStack />
          <Faq />
        </main>
        <Footer />
      </div>
    </div>
  );
}
