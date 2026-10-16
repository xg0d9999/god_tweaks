import React, { useState } from 'react';
import { Check, Download, Zap, Shield, Sparkles, Flame, CheckCircle2 } from 'lucide-react';

export const PricingTiers: React.FC = () => {
  const [billingMode, setBillingMode] = useState<'gamer' | 'staff'>('gamer');

  const downloadUrl = "https://github.com/xg0d9999/god_tweaks/releases/download/v1.12.2/g0d.suite_1.12.2_x64-setup.exe";

  return (
    <section id="planes" className="relative py-20 md:py-32">
      {/* Background radial specular glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-brand-gold/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold tracking-widest text-brand-gold uppercase">
            PLANES DE OPTIMIZACIÓN
          </h2>
          <p className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Tres perfiles de potencia.<br />
            <span className="text-zinc-400 font-semibold">100% Gratuitos para siempre.</span>
          </p>
          <p className="mt-4 text-base text-zinc-400">
            Sin suscripciones ocultas, sin pasarelas de pago ni versiones recortadas. Diseñado por y para la comunidad.
          </p>

          {/* Mode Switcher Pill */}
          <div className="mt-8 inline-flex p-1 rounded-xl bg-zinc-900/90 border border-white/10 shadow-inner">
            <button
              onClick={() => setBillingMode('gamer')}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                billingMode === 'gamer'
                  ? 'bg-[#182222] text-white shadow-md border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🎮 Modo Jugador / eSports
            </button>
            <button
              onClick={() => setBillingMode('staff')}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                billingMode === 'staff'
                  ? 'bg-[#182222] text-white shadow-md border border-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🛡️ HispanLife Staff Edition
            </button>
          </div>
        </div>

        {/* 3 Tier Grid Cards */}
        <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3 items-stretch max-w-7xl">
          {/* CARD 1: PLAN LITE */}
          <div className="rounded-2xl bg-[#0c1013]/80 backdrop-blur-md border border-white/10 p-8 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Plan Lite</h3>
                    <span className="text-xs text-zinc-400">Básico & Seguro</span>
                  </div>
                </div>
              </div>

              {/* Price display */}
              <div className="mt-6 pb-6 border-b border-white/5">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">0 €</span>
                  <span className="text-xs text-zinc-500 font-medium">/ para siempre</span>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Ideal para laptops o equipos estándar que buscan eliminar micro-tirones sin modificar directivas críticas.
                </p>
              </div>

              {/* Features List */}
              <ul className="mt-6 space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Limpieza de caché corrupta de FiveM</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>DNS gaming optimizado (Cloudflare 1.1.1.1)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Desactivación de GameDVR y Xbox Bar</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Purga periódica de archivos temporales</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% reversible en 1 clic</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a
                href={downloadUrl}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Plan Lite</span>
              </a>
            </div>
          </div>

          {/* CARD 2: PLAN PREMIUM (FEATURED - EXACT PADDLE STYLING) */}
          <div className="relative rounded-2xl bg-[#0e1317]/90 backdrop-blur-xl border-2 border-brand-gold/60 p-8 flex flex-col justify-between shadow-glow-gold transform lg:-translate-y-2">
            {/* Halo Soft Blurs & Specular Yellow Line */}
            <div className="featured-yellow-highlight-bg" />
            <div className="featured-soft-blur-bg" />
            <div className="featured-vertical-hard-blur-bg" />

            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Plan Premium</h3>
                    <span className="text-xs text-brand-gold font-medium">Ultra Low-Latency</span>
                  </div>
                </div>

                {/* Badge Featured */}
                <div className="px-3 py-1 rounded-full border border-brand-gold/40 text-[11px] font-bold text-brand-gold bg-brand-gold/10 tracking-wide uppercase">
                  ⭐ Más Popular
                </div>
              </div>

              {/* Price display */}
              <div className="mt-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">0 €</span>
                  <span className="text-xs text-brand-gold/80 font-medium">/ 100% Gratuito</span>
                </div>
                <p className="mt-2 text-xs text-zinc-300">
                  El estándar para jugadores competitivos. Máximo rendimiento gráfico y respuesta inmediata de teclado y ratón.
                </p>
              </div>

              {/* Features List */}
              <ul className="mt-6 space-y-3.5 text-xs text-zinc-200">
                <li className="flex items-center gap-3 font-semibold text-white">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>Todo lo incluido en Plan Lite</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                  <span><strong>Compactación de RAM en tiempo real</strong> (Standby working set)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                  <span><strong>Timer QPC a 0.50ms</strong> (Reducción extrema de input lag)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>Prioridad QoS TCP/IP DSCP exclusiva para GTA V / FiveM</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>Fullscreen Exclusive (FSE) Bypass de composición DWM</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>Perfil de energía "God Tweaks Ultra Latency"</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a
                href={downloadUrl}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-brand-gold via-yellow-300 to-brand-gold hover:brightness-110 shadow-glow-gold transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Descargar Plan Premium Gratis</span>
              </a>
            </div>
          </div>

          {/* CARD 3: PLAN ULTRA (HISPANLIFE STAFF EDITION) */}
          <div className="rounded-2xl bg-[#0c1013]/80 backdrop-blur-md border border-white/10 p-8 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Plan Ultra</h3>
                    <span className="text-xs text-rose-400">HispanLife & Staff</span>
                  </div>
                </div>

                <div className="px-2.5 py-0.5 rounded-full border border-rose-500/30 text-[10px] font-bold text-rose-400 bg-rose-500/10">
                  STAFF SUITE
                </div>
              </div>

              {/* Price display */}
              <div className="mt-6 pb-6 border-b border-white/5">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">0 €</span>
                  <span className="text-xs text-zinc-500 font-medium">/ para siempre</span>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Para el equipo de moderación de HispanLife y usuarios avanzados que requieren control total de sanciones.
                </p>
              </div>

              {/* Features List */}
              <ul className="mt-6 space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-center gap-3 font-semibold text-white">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Todo lo incluido en Plan Premium</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span><strong>Panel de Sanciones HispanLife</strong> (Jail, Ban, SQL)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span><strong>Candado Anti-Misclick</strong> (requiere FiveM en ejecución)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Auditoría de sanciones con Webhook oficial de Discord</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Actualizador criptográfico automático con Minisign</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Privilegios administrativos y auto-reinicio elevado</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a
                href={downloadUrl}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Plan Ultra</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
