import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const Faq: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Por qué la aplicación es 100% gratuita si parece de suscripción?",
      a: "g0d suite fue desarrollada originalmente como una herramienta privada para un grupo de amigos y el equipo de HispanLife. No creemos en cobrar suscripciones mensuales por configuraciones de rendimiento. Todo el código es limpio, auditable y de libre acceso."
    },
    {
      q: "¿Puedo recibir ban de FiveM o servidores protegidos por usar g0d suite?",
      a: "Rotundamente no. g0d suite jamás inyecta DLLs ni altera la memoria de procesos protegidos. Todas las optimizaciones actúan sobre la cola de timers de Windows (HPET), parámetros de red QoS DSCP y políticas del administrador de ventanas DWM."
    },
    {
      q: "¿Cómo funciona el candado de seguridad para el staff de HispanLife?",
      a: "La suite detecta en tiempo real si el proceso FiveM.exe o GTA5.exe está en ejecución activa. Si no estás dentro del juego, los botones de Jail, Ban y macros de consola se bloquean para impedir que envíes comandos por error en Discord o en tu escritorio."
    },
    {
      q: "¿Cómo se actualiza la aplicación cuando sale una nueva versión?",
      a: "Incorpora un sistema nativo de auto-actualización firmado con Minisign (criptografía asimétrica Ed25519). Cuando se publica una nueva release oficial en GitHub, la aplicación te notifica y se actualiza sola en segundos."
    },
    {
      q: "¿Funciona en Windows 11 24H2 y Windows 10?",
      a: "Sí, es totalmente compatible con todas las versiones de 64 bits de Windows 10 y Windows 11, incluyendo la última actualización 24H2. Los parámetros están adaptados a la gestión de hilos de los procesadores modernos (Intel P-Cores/E-Cores y AMD 3D V-Cache)."
    },
    {
      q: "¿Qué ocurre si quiero revertir algún tweak o volver a los valores de fábrica?",
      a: "Cada ajuste cuenta con un interruptor individual para desactivarse. Además, puedes restaurar los valores por defecto del sistema operativo con un solo clic en la sección de mantenimiento."
    }
  ];

  return (
    <section id="faq" className="py-20 md:py-32 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 border border-white/10 text-zinc-400 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-brand-gold" />
            <span>RESPUESTAS CLARAS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400">
            Todo lo que necesitas saber antes de instalar g0d suite en tu equipo.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-zinc-950/60 overflow-hidden transition-colors hover:border-white/20"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-200"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 transition-transform shrink-0 ${
                      isOpen ? 'transform rotate-180 text-brand-gold' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
