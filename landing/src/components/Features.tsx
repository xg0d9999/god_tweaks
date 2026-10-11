import React from 'react';
import { ShieldCheck, Lock, Webhook, RefreshCw, SlidersHorizontal, Cpu } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section id="hispanlife" className="relative py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-widest text-brand-gold uppercase">
            ARQUITECTURA & CARACTERÍSTICAS
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Diseñado para ganar tiroteos.<br />
            Pensado para moderar sin fallos.
          </p>
          <p className="mt-4 text-sm sm:text-base text-zinc-400">
            Cada ajuste ha sido verificado en entornos de producción para no interferir con los sistemas anti-cheat de FiveM ni la integridad de Windows.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-7 rounded-2xl bg-zinc-950/70 border border-white/10 hover:border-brand-gold/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">0% Riesgo de Ban (Zero DLL Injection)</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                A diferencia de optimizadores sospechosos, g0d suite jamás inyecta DLLs en la memoria de FiveM ni en procesos de GTA V. Todos los cambios se aplican a nivel de directivas de Windows, registros de kernel y QPC multimedia.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-emerald-400 font-medium">
              ✓ Compatible con EAC, BattlEye & Cfx.re
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-7 rounded-2xl bg-zinc-950/70 border border-white/10 hover:border-rose-500/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Candado Inteligente de Sanciones</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Si no tienes FiveM abierto, los botones de Jail, Ban y macros se bloquean automáticamente. Esto erradica por completo los clics erróneos en el escritorio o en chats de Discord de terceros.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-rose-400 font-medium">
              ✓ Prevención activa de sanciones accidentales
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-7 rounded-2xl bg-zinc-950/70 border border-white/10 hover:border-violet-500/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
                <Webhook className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Auditoría Automática con Discord</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Canal oficial de registro fijado en la configuración. Las sanciones generan un embed automático con Discord vinculado, Steam ID, motivo y fecha exacta para mantener la transparencia en el equipo de staff.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-violet-400 font-medium">
              ✓ Webhook directo con canal inalterable
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-7 rounded-2xl bg-zinc-950/70 border border-white/10 hover:border-brand-cyan/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan mb-6">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Actualizador Firmado con Minisign</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Cada nueva versión se publica en GitHub Releases con firma criptográfica. La aplicación detecta actualizaciones en segundo plano, las descarga de forma segura y las aplica con un solo clic.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-brand-cyan font-medium">
              ✓ Criptografía SHA-256 de extremo a extremo
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-7 rounded-2xl bg-zinc-950/70 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Modo Avanzado Simplificado</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                El sidebar se mantiene limpio y accesible. Ajustes de input lag, debloat de Windows, privacidad de telemetría y ping de red se encuentran en una sección avanzada dedicada para los entusiastas del hardware.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-emerald-400 font-medium">
              ✓ Interfaz minimalista de alta ergonomía
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-7 rounded-2xl bg-zinc-950/70 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Compactación de RAM en Segundo Plano</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Monitorea constantemente la memoria ocupada por procesos secundarios de Windows y la purga sin congelar la pantalla. Maximiza la memoria disponible para las texturas ultra de FiveM.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-amber-400 font-medium">
              ✓ Hasta 4 GB de memoria recuperada
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
