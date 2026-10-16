import React from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Metrics } from './Metrics';
import { InteractiveMockup } from './InteractiveMockup';
import { PricingTiers } from './PricingTiers';
import { Features } from './Features';
import { TechStack } from './TechStack';
import { Faq } from './Faq';
import { Footer } from './Footer';

interface LandingViewProps {
  onNavigateToPanel: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigateToPanel }) => {
  return (
    <div className="min-h-screen bg-[#07090b] text-zinc-100 relative selection:bg-brand-gold selection:text-black">
      {/* Background Gradients & Textures */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="grid-bg background-base" />
        <div className="large-blur background-base" />
        <div className="small-blur background-base" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onNavigateToPanel={onNavigateToPanel} />
        <main className="flex-1">
          <Hero />
          <Metrics />
          <InteractiveMockup />
          <PricingTiers />
          <Features />
          <TechStack />
          <Faq />
        </main>
        <Footer onNavigateToPanel={onNavigateToPanel} />
      </div>
    </div>
  );
};
