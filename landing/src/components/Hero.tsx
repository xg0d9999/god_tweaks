import React from 'react';
import { Download, ShieldCheck, Zap, Gauge, CheckCircle2, ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const downloadUrl = "https://github.com/xg0d9999/god_tweaks/releases/download/v1.0.7/g0d.suite_1.0.7_x64-setup.exe";

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Glow Blur Layers */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[450px] h-[300px] bg-brand-cyan/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Shimmer Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900/90 border border-white/10 text-zinc-300 shadow-inner mb-8">
          <span className="flex h-2 w-2 rounded-full bg-brand-gold animate-pulse"></span>
          <span className="tracking-wide">SUITE OFICIAL v1.0.7</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 font-normal">Arquitectura Rust & Cero Inyección DLL</span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.08]">
          Optimización extrema de Windows y FiveM.{' '}
          <span className="block mt-2 bg-gradient-to-r from-brand-gold via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            100% Gratis. Sin suscripciones.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto font-normal leading-relaxed">
          Diseñado meticulosamente para jugadores competitivos de FiveM y moderadores de HispanLife. 
          Reduce la latencia DPC de tus drivers, compacta la memoria RAM en caliente y automatiza sanciones con seguridad anti-misclick.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={downloadUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-brand-gold via-yellow-300 to-brand-gold hover:brightness-110 shadow-glow-gold transition-all transform hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5 text-black stroke-[2.5]" />
            <span>Descargar g0d suite v1.0.7 (.exe)</span>
          </a>

          <a
            href="#mockup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            <span>Ver Demostración en Vivo</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Metadata sub-text */}
        <div className="mt-4 text-xs text-zinc-500 flex items-center justify-center gap-3 flex-wrap">
          <span>✓ Instalador oficial para Windows 10 & 11 (64-bit)</span>
          <span>•</span>
          <span>✓ ~14 MB de descarga directa</span>
          <span>•</span>
          <span className="text-emerald-400">✓ 100% Gratis para amigos</span>
        </div>

        {/* 3 Value Pillars */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/5">
          <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-zinc-950/40 border border-white/5">
            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-white">0 DLLs Inyectadas</h4>
              <p className="text-[11px] text-zinc-400">100% Seguro contra Anti-Cheats</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-zinc-950/40 border border-white/5">
            <div className="p-2 rounded-md bg-brand-gold/10 text-brand-gold">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-white">0.50ms HPET Timer</h4>
              <p className="text-[11px] text-zinc-400">Máxima respuesta de teclado y ratón</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-zinc-950/40 border border-white/5">
            <div className="p-2 rounded-md bg-brand-cyan/10 text-brand-cyan">
              <Gauge className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-white">Compactación de RAM</h4>
              <p className="text-[11px] text-zinc-400">Elimina el stuttering en Los Santos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
