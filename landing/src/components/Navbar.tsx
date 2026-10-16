import React, { useState } from 'react';
import { Download, Menu, X, Lock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const downloadUrl = "https://github.com/xg0d9999/god_tweaks/releases/download/v1.12.2/g0d.suite_1.12.2_x64-setup.exe";

  return (
    <header className="relative z-50 w-full">
      {/* Top Notification Announcement Bar */}
      <div className="bg-[#0b1013] border-b border-white/5 py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-zinc-300">v1.12.2 Lanzamiento Oficial:</span>
            <span className="text-zinc-400 hidden sm:inline">Optimizador FiveM con actualizador firmado & panel HispanLife</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-zinc-400">
            <span>Windows 10 / 11 64-bit</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 font-medium">100% Gratuito</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 flex items-center justify-center shadow-lg group-hover:border-brand-gold/40 transition-colors">
              <span className="text-brand-gold font-black text-lg tracking-wider">⚡</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                  g0d suite
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                  v1.12.2
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 tracking-wide">ULTRA LOW-LATENCY</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#metricas" className="hover:text-white transition-colors">Métricas</a>
            <a href="#mockup" className="hover:text-white transition-colors">App en Vivo</a>
            <a href="#planes" className="hover:text-white transition-colors">Planes Gratis</a>
            <a href="#hispanlife" className="hover:text-white transition-colors">HispanLife Staff</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://hispansanciones.vercel.app"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 transition-all hover:border-white/20"
              title="Acceso exclusivo para Staff y Moderación"
            >
              <Lock className="w-3.5 h-3.5 text-brand-gold" />
              <span>Acceso Staff</span>
            </a>

            <a
              href={downloadUrl}
              className="relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-brand-gold via-yellow-300 to-brand-gold hover:brightness-110 shadow-glow-gold transition-all transform hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Descargar .EXE</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <a
              href="https://hispansanciones.vercel.app"
              className="p-2 rounded-lg text-xs font-semibold text-zinc-300 bg-zinc-900 border border-white/10 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-brand-gold" />
              <span>Staff</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 pb-6 border-t border-white/10 flex flex-col gap-4 text-sm font-medium text-zinc-300 bg-background-card/95 backdrop-blur-xl p-4 rounded-xl border">
            <a href="#metricas" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-gold">Métricas</a>
            <a href="#mockup" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-gold">App en Vivo</a>
            <a href="#planes" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-gold">Planes de Optimización</a>
            <a href="#hispanlife" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-gold">HispanLife Staff</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-brand-gold">Preguntas Frecuentes</a>
            <div className="pt-2 flex flex-col gap-3">
              <a
                href={downloadUrl}
                className="w-full text-center py-3 rounded-lg text-xs font-bold text-black bg-brand-gold"
              >
                Descargar v1.12.2 (.exe)
              </a>
              <a
                href="https://hispansanciones.vercel.app"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 border border-white/10 flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-brand-gold" />
                <span>Panel de Staff (hispansanciones)</span>
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
