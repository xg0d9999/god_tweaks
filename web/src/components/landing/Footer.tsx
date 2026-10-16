import React from 'react';
import { Download, Heart, Lock } from 'lucide-react';

interface FooterProps {
  onNavigateToPanel?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToPanel }) => {
  const downloadUrl = "https://github.com/xg0d9999/god_tweaks/releases/download/v1.12.2/g0d.suite_1.12.2_x64-setup.exe";

  const handlePanelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToPanel) {
      onNavigateToPanel();
    } else {
      window.location.href = '/panel';
    }
  };

  return (
    <footer className="relative bg-[#050709] border-t border-white/5 pt-16 pb-12 overflow-hidden">
      {/* Specular hairline top accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pre-footer Call to Action Card */}
        <div className="relative rounded-3xl bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-8 sm:p-12 border border-white/10 text-center mb-16 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none" />

          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            ¿Listo para jugar con cero input lag?
          </h3>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            Descarga g0d suite v1.12.2 hoy mismo. Instalación limpia en menos de 10 segundos. 100% Gratuito.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={downloadUrl}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-brand-gold via-yellow-300 to-brand-gold hover:brightness-110 shadow-glow-gold transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Descarga Directa v1.12.2 (.exe)</span>
            </a>
          </div>
        </div>

        {/* Footer Links & Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-brand-gold font-bold">
              ⚡
            </div>
            <span className="font-semibold text-zinc-300">g0d suite</span>
            <span>•</span>
            <span>v1.12.2 Official Build</span>
          </div>

          <div className="flex items-center gap-6 flex-wrap justify-center text-zinc-400">
            <a href="#metricas" className="hover:text-white transition-colors">Métricas</a>
            <a href="#planes" className="hover:text-white transition-colors">Planes</a>
            <a href="#hispanlife" className="hover:text-white transition-colors">HispanLife</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a
              href="/panel"
              onClick={handlePanelClick}
              className="hover:text-brand-gold transition-colors inline-flex items-center gap-1 text-zinc-300"
            >
              <Lock className="w-3 h-3 text-brand-gold" />
              <span>Panel de Staff</span>
            </a>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-500">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>para amigos y la comunidad</span>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 text-center text-[11px] text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          Aviso legal: FiveM y Grand Theft Auto V son marcas registradas de Take-Two Interactive y Cfx.re. 
          g0d suite es un proyecto independiente de optimización de sistema operativo sin afiliación comercial directa.
        </div>
      </div>
    </footer>
  );
};
