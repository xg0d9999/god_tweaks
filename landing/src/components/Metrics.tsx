import React from 'react';
import { TrendingUp, Cpu, Gauge, Zap, ArrowUpRight } from 'lucide-react';

export const Metrics: React.FC = () => {
  return (
    <section id="metricas" className="relative py-20 bg-[#06080a] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-widest text-brand-cyan uppercase">
            BANCO DE PRUEBAS & TELEMETRÍA
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Resultados medibles en situaciones de tiroteo real.
          </p>
          <p className="mt-4 text-sm sm:text-base text-zinc-400">
            Medido en servidores de 300+ jugadores con scripts pesados de MLOs y vehículos custom.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat 1 */}
          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>FPS MÍNIMOS (1% LOWS)</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-4 text-4xl font-black text-emerald-400 font-mono tracking-tight">
                +48.6%
              </div>
              <div className="mt-2 text-xs text-zinc-300 font-medium">
                Sin micro-stuttering en Legion Square
              </div>
              <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed">
                El pacing de fotogramas se mantiene uniforme incluso con decenas de jugadores y explosiones simultáneas.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Windows Stock: ~58 FPS</span>
              <span className="text-emerald-400 font-bold">g0d suite: 88 FPS</span>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-white/10 hover:border-brand-gold/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>DPC DRIVER LATENCY</span>
                <span className="p-1.5 rounded-lg bg-brand-gold/10 text-brand-gold">
                  <Zap className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-4 text-4xl font-black text-brand-gold font-mono tracking-tight">
                -81.4%
              </div>
              <div className="mt-2 text-xs text-zinc-300 font-medium">
                Respuesta inmediata en GPU y teclado
              </div>
              <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed">
                Desactiva interrupciones residuales en dxgkrnl.sys y ndis.sys para que tus inputs lleguen antes que los del rival.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Windows Stock: 1,180 µs</span>
              <span className="text-brand-gold font-bold">g0d suite: 185 µs</span>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-white/10 hover:border-brand-cyan/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>TIMER RESOLUTION</span>
                <span className="p-1.5 rounded-lg bg-brand-cyan/10 text-brand-cyan">
                  <Gauge className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-4 text-4xl font-black text-brand-cyan font-mono tracking-tight">
                0.50 ms
              </div>
              <div className="mt-2 text-xs text-zinc-300 font-medium">
                Bloqueo QPC de alta precisión
              </div>
              <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed">
                Windows por defecto consulta eventos cada 15.6ms. g0d suite lo fija a 0.500ms exactos para polling de ratón 1000-8000Hz.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Windows Stock: 15.6 ms</span>
              <span className="text-brand-cyan font-bold">g0d suite: 0.50 ms</span>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-white/10 hover:border-violet-500/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                <span>STANDBY RAM COMPACT</span>
                <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
                  <Cpu className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-4 text-4xl font-black text-violet-400 font-mono tracking-tight">
                -3.4 GB
              </div>
              <div className="mt-2 text-xs text-zinc-300 font-medium">
                Compresión sin caídas de framerate
              </div>
              <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed">
                Vacía la lista de páginas en espera de Windows antes de que se llene, impidiendo tirones al cargar nuevas texturas.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Consumo previo: 8.8 GB</span>
              <span className="text-violet-400 font-bold">Liberado: 5.4 GB</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
