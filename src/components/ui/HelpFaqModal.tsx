import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  X,
  Search,
  Gamepad2,
  Layers,
  ShieldCheck,
  ChevronDown,
  BookOpen,
} from "lucide-react";

interface HelpFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FaqCategory = "quickstart" | "features" | "faq" | "glossary";

interface FaqItem {
  id: string;
  category: FaqCategory;
  title: string;
  badge?: string;
  badgeColor?: string;
  summary: string;
  content: React.ReactNode;
}

export const HelpFaqModal: React.FC<HelpFaqModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>("quickstart");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "fivem-guide": true,
    "what-is": true,
  });

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const faqItems: FaqItem[] = useMemo(
    () => [
      // CATEGORÍA: GUÍA RÁPIDA (QUICKSTART)
      {
        id: "fivem-guide",
        category: "quickstart",
        title: "🎮 ¿Juegas a FiveM (GTA RP) y tienes tirones o pocos FPS?",
        badge: "Recomendado FiveM",
        badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        summary: "Sigue estos 3 sencillos pasos para duplicar tu estabilidad y eliminar el lag.",
        content: (
          <div className="space-y-3 text-xs text-[#9DA4B0] leading-relaxed">
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-white">
              <span className="font-semibold text-orange-400 block mb-1">Paso 1: Aplica el Plan para FiveM</span>
              Ve a la pestaña <strong className="text-white">Planes de Optimización</strong> en el menú lateral. Arriba verás el selector de juegos: elige <strong className="text-orange-300">FiveM</strong> y pulsa sobre el plan <strong className="text-white">Ultra</strong>. Esto ajustará el registro de Windows, apagará servicios pesados y dará prioridad máxima al juego.
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 text-white">
              <span className="font-semibold text-cyan-400 block mb-1">Paso 2: Instala un Citizen Optimizado</span>
              Ve a la pestaña <strong className="text-white">Gestor de Citizens</strong>. Un Citizen quita partículas innecesarias, niebla pesada y texturas que consumen memoria. Elige uno de los Citizens PvP o FPS Boost y pulsa <strong className="text-cyan-300">Instalar Citizen</strong>. Te dará entre 25 y 60 FPS más.
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-white">
              <span className="font-semibold text-emerald-400 block mb-1">Paso 3: Cada vez que vayas a jugar</span>
              ¡No hace falta que reconfigures todo! Cuando ya tienes tu plan activo (verás el reborde brillante), solo dale al botón <strong className="text-emerald-300">Optimizar FiveM</strong> justo antes de abrir el juego. Hará un <em>Pre-Game Boost</em> que limpia la memoria RAM y vacía la caché sin tocar lo que ya tienes optimizado.
            </div>
          </div>
        ),
      },
      {
        id: "shooter-guide",
        category: "quickstart",
        title: "🎯 ¿Juegas Shooters Competitivos (Valorant, CS2, Fortnite)?",
        badge: "Input Lag Mínimo",
        badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        summary: "Cómo reducir el retraso del ratón y mejorar el ping al disparar.",
        content: (
          <div className="space-y-3 text-xs text-[#9DA4B0] leading-relaxed">
            <p>
              En juegos donde cada milisegundo cuenta, Windows añade latencias ocultas agrupando paquetes de red y cambiando de frecuencias de CPU.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
                <span className="font-semibold text-white block mb-0.5">Plan Premium o Ultra:</span>
                Activa el plan según tu juego. Deshabilitará el <em>Algoritmo Nagle</em> (tus disparos se envían de inmediato sin esperar paquetes de red) y optimizará el temporizador TSC del procesador.
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
                <span className="font-semibold text-white block mb-0.5">Respuesta Instantánea:</span>
                Notarás que el cursor del ratón responde con mayor agilidad y la mira no tiene esa sensación de "arrastre" o flotabilidad.
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "all-purpose-guide",
        category: "quickstart",
        title: "💼 ¿Uso el PC para trabajar/estudiar y también para jugar?",
        badge: "Uso Mixto Seguro",
        badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        summary: "Si no quieres tocar nada agresivo, esto es lo que debes elegir.",
        content: (
          <div className="space-y-2 text-xs text-[#9DA4B0] leading-relaxed">
            <p>
              Si necesitas que funcionen impresoras, máquinas virtuales, herramientas de oficina o Bluetooth sin la más mínima interferencia, selecciona el plan <strong className="text-emerald-400">Lite (Básico Seguro)</strong>.
            </p>
            <p>
              El plan Lite solo desactiva la recolección de diagnósticos pesada de Windows (telemetría y Cortana) y limpia memorias residuales, garantizando un 100% de compatibilidad con cualquier software laboral o académico.
            </p>
          </div>
        ),
      },
      {
        id: "revert-guide",
        category: "quickstart",
        title: "🔄 ¿Cómo vuelvo a dejar todo como estaba si cambio de opinión?",
        badge: "Reversión 1-Clic",
        badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        summary: "Siempre tienes el control total y una copia de seguridad garantizada.",
        content: (
          <div className="space-y-2 text-xs text-[#9DA4B0] leading-relaxed">
            <p>
              Nunca tengas miedo de probar. Tienes dos formas inmediatas de deshacer cambios:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-white/90">
              <li>
                <strong>Botón Revertir en Planes</strong>: En la pestaña <em className="text-cyan-300">Planes de Optimización</em>, abajo a la derecha encontrarás el botón <strong className="text-purple-300">Restablecer Valores Predeterminados</strong>. Restaura los valores estándar de Windows al momento.
              </li>
              <li>
                <strong>Copias de Seguridad (Backup)</strong>: Antes de aplicar cualquier plan, el programa crea un Punto de Restauración de Windows (VSS) y un archivo de registro. En la pestaña <em className="text-cyan-300">Copias de Seguridad</em> puedes restaurarlo cuando quieras.
              </li>
            </ul>
          </div>
        ),
      },

      // CATEGORÍA: TODAS LAS FUNCIONES (FEATURES)
      {
        id: "what-is",
        category: "features",
        title: "⚡ ¿Qué es g0d tweaks y qué le hace a mi ordenador?",
        summary: "Explicado de manera sencilla sin palabras técnicas raras.",
        content: (
          <div className="space-y-2 text-xs text-[#9DA4B0] leading-relaxed">
            <p>
              Windows de fábrica viene cargado de servicios para recopilar datos de diagnóstico, búsquedas en segundo plano (Cortana, Bing), grabaciones de pantalla automáticas (Xbox GameDVR) y algoritmos de ahorro de energía diseñados para portátiles que le restan potencia a tu tarjeta gráfica y procesador.
            </p>
            <p className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-200">
              💡 <strong>En cristiano:</strong> g0d tweaks apaga esos programas y tareas que consumen recursos a tus espaldas, para que cuando abras un juego, el 100% de la fuerza de tu PC se dedique únicamente a darte más FPS y menos retraso.
            </p>
          </div>
        ),
      },
      {
        id: "plans-explained",
        category: "features",
        title: "📦 Planes de Optimización (Lite, Premium, Ultra)",
        summary: "Diferencia exacta entre cada plan y qué significa el borde de color activo.",
        content: (
          <div className="space-y-3 text-xs text-[#9DA4B0] leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-white">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-bold text-emerald-400 block text-sm mb-1">Lite (Seguro)</span>
                <p className="text-[11px] text-white/80">Ideal para cualquier PC de trabajo o estudio. Quita bloatware y telemetría de Windows.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <span className="font-bold text-cyan-400 block text-sm mb-1">Premium (Gaming)</span>
                <p className="text-[11px] text-white/80">Para jugadores habituales. Activa el esquema de energía Ultimate y reduce el input lag del ratón.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="font-bold text-rose-400 block text-sm mb-1">Ultra (Extremo)</span>
                <p className="text-[11px] text-white/80">Máximo rendimiento y eSports. Apaga el reloj HPET y exprime hasta el último fotograma por segundo.</p>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
              <span className="font-semibold text-white block mb-1">¿Qué es el reborde de color en el plan?</span>
              <p>
                Cuando aplicas un plan, la tarjeta se ilumina con un reborde distintivo para que sepas en todo momento qué configuración tienes puesta. Si vuelves a pulsar el botón, el programa es inteligente: no repetirá las cosas que ya están grabadas en Windows, sino que solo ejecutará la limpieza rápida temporal (Pre-Game Boost).
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "citizens-explained",
        category: "features",
        title: "🏙️ Gestor de Citizens para FiveM",
        summary: "Qué es un Citizen, por qué sube tantos FPS y cómo usarlo.",
        content: (
          <div className="space-y-3 text-xs text-[#9DA4B0] leading-relaxed">
            <p>
              Dentro de FiveM (GTA V), la carpeta <strong>Citizen</strong> contiene texturas de carreteras, efectos de partículas, reflejos del agua, sombras y niebla.
            </p>
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200">
              <span className="font-semibold text-white block mb-1">¿Por qué usar un Citizen optimizado?</span>
              Un Citizen optimizado elimina efectos visuales innecesarios (como partículas pesadas de humo o sombras excesivas) que hunden tus FPS en tiroteos o zonas pobladas de servidores de rol.
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Instalar con 1 clic</strong>: Elige el que más te guste y pulsa Instalar. El programa guarda automáticamente una copia de seguridad de tu Citizen actual por si quieres volver atrás.</li>
              <li><strong>Restaurar Vanilla</strong>: Si quieres volver al juego 100% original por defecto de GTA V, pulsa en "Restaurar Vanilla".</li>
              <li><strong>¿Por qué veo un candado?</strong>: El gestor de Citizens puede estar reservado por los administradores de la comunidad. Si ves el candado, pídele a un staff que te habilite el permiso en el panel.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "benchmarks-explained",
        category: "features",
        title: "📊 Banco de Pruebas y Reporte en PDF",
        summary: "Comprueba con números reales si la optimización ha funcionado en tu PC.",
        content: (
          <div className="space-y-2 text-xs text-[#9DA4B0] leading-relaxed">
            <p>
              El Banco de Pruebas mide los parámetros de tu ordenador antes de optimizar (latencia DPC estimada, uso de RAM, respuesta del sistema), aplica el plan Ultra y vuelve a medir para contrastar la mejora.
            </p>
            <p>
              Al finalizar la prueba, dispones de un botón para generar un <strong>Informe en PDF con diseño profesional</strong> idéntico al de la aplicación, listo para guardar o compartir.
            </p>
          </div>
        ),
      },
      {
        id: "backup-explained",
        category: "features",
        title: "🛡️ Copias de Seguridad (Backup)",
        summary: "La garantía de seguridad que protege tu sistema operativo.",
        content: (
          <div className="space-y-2 text-xs text-[#9DA4B0] leading-relaxed">
            <p>
              g0d tweaks incorpora una política de seguridad estricta: antes de que se toque cualquier clave del sistema, se genera un Punto de Restauración oficial de Windows (Volume Shadow Copy) y una copia en archivo <code>.reg</code>.
            </p>
            <p>
              Si alguna vez instalas una actualización de Windows que cause incompatibilidad o simplemente quieres dejar tu ordenador como el primer día, puedes ir a esta pestaña y restaurar cualquier punto anterior con un clic.
            </p>
          </div>
        ),
      },

      // CATEGORÍA: PREGUNTAS FRECUENTES (FAQ)
      {
        id: "faq-bans",
        category: "faq",
        title: "🛡️ ¿Me pueden banear en FiveM, Valorant o CS2 por usar esto?",
        badge: "100% Seguro",
        badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        summary: "Tranquilidad absoluta respecto a los sistemas anti-trampas.",
        content: (
          <div className="space-y-2 text-xs text-[#9DA4B0] leading-relaxed">
            <p className="text-white font-medium">
              No. Es completamente imposible que te baneen.
            </p>
            <p>
              g0d tweaks <strong>no es un cheat, ni inyecta DLLs, ni modifica la memoria en tiempo real de ningún juego</strong>. Solo optimiza los parámetros de Windows, las prioridades que el propio sistema le da a los programas y las configuraciones de red que Microsoft permite modificar. Los sistemas como Riot Vanguard, VAC o el anticheat de FiveM lo consideran software de sistema totalmente legítimo.
            </p>
          </div>
        ),
      },
      {
        id: "faq-hardware-damage",
        category: "faq",
        title: "🔥 ¿Esto puede dañar mi procesador o quemar mi gráfica?",
        badge: "Cero Riesgo Físico",
        badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        summary: "No se tocan voltajes, frecuencias de reloj ni límites térmicos.",
        content: (
          <div className="space-y-2 text-xs text-[#9DA4B0] leading-relaxed">
            <p>
              Rotundamente no. La suite no realiza overclocking de hardware, no sube los voltajes eléctricos ni altera las velocidades de los ventiladores de tus componentes.
            </p>
            <p>
              El aumento de FPS se consigue eliminando procesos basura que le roban trabajo al procesador, por lo que tus componentes trabajarán de forma más eficiente y limpia.
            </p>
          </div>
        ),
      },
      {
        id: "faq-every-startup",
        category: "faq",
        title: "⏰ ¿Tengo que abrir el programa cada vez que enciendo el PC?",
        summary: "Cuándo se queda guardado y cuándo conviene abrir la aplicación.",
        content: (
          <div className="space-y-2 text-xs text-[#9DA4B0] leading-relaxed">
            <p>
              <strong>Los cambios permanentes</strong> (como el plan de energía, la optimización de red o la desactivación de telemetría) <strong>ya quedan grabados en Windows</strong>. Aunque apagues o reinicies el PC, siguen funcionando.
            </p>
            <p>
              Sin embargo, te recomendamos abrir g0d tweaks antes de iniciar una sesión de juego larga para:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-white/90">
              <li>Vaciar la memoria RAM saturada por Chrome, Discord o programas anteriores.</li>
              <li>Limpiar cachés de shaders viejos.</li>
              <li>Dar el botón de "Optimizar" en tu juego para ponerlo en prioridad alta.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "faq-locks",
        category: "faq",
        title: "🔒 ¿Por qué tengo opciones con un candado?",
        summary: "Sistema de permisos por roles y moderación de comunidad.",
        content: (
          <div className="space-y-2 text-xs text-[#9DA4B0] leading-relaxed">
            <p>
              La suite cuenta con un sistema de seguridad conectado a Discord y Supabase. Si una opción muestra un candado (como el Gestor de Citizens o el Panel de Sanciones), significa que requiere permisos concedidos por un administrador de tu comunidad o servidor.
            </p>
            <p>
              Basta con que el administrador active tu usuario desde el Panel de Administración para que el candado desaparezca de inmediato en tiempo real sin reiniciar la aplicación.
            </p>
          </div>
        ),
      },

      // CATEGORÍA: GLOSARIO FÁCIL (GLOSSARY)
      {
        id: "term-input-lag",
        category: "glossary",
        title: "🖱️ Input Lag (Retraso de Entrada)",
        summary: "El tiempo que tarda en verse en pantalla lo que haces con el ratón o teclado.",
        content: (
          <p className="text-xs text-[#9DA4B0] leading-relaxed">
            Si disparas con el ratón y sientes que el tiro sale una fracción de segundo después, sufres de Input Lag. Nuestras optimizaciones reducen las colas de espera del sistema operativo para que el juego dibuje cada movimiento de tu mano al instante.
          </p>
        ),
      },
      {
        id: "term-stuttering",
        category: "glossary",
        title: "🛑 Stuttering (Tirones y Micro-parones)",
        summary: "Cuando el juego va a 100 FPS pero de repente se congela por medio segundo.",
        content: (
          <p className="text-xs text-[#9DA4B0] leading-relaxed">
            El stuttering casi nunca es culpa de tu tarjeta gráfica, sino de Windows intentando leer datos del disco o compactar memoria RAM mientras juegas. Al purgar la memoria y dar prioridad MMCSS a tu juego, los micro-tirones desaparecen.
          </p>
        ),
      },
      {
        id: "term-nagle",
        category: "glossary",
        title: "🌐 Algoritmo Nagle",
        summary: "Una función vieja de Windows que retrasa tus paquetes de internet.",
        content: (
          <p className="text-xs text-[#9DA4B0] leading-relaxed">
            Windows por defecto intenta agrupar pequeños paquetes de datos antes de enviarlos para ahorrar ancho de banda. En juegos competitivos esto te añade entre 10 y 30 ms de ping falso. Desactivar Nagle hace que cada bala y cada movimiento salgan a la red en el milisegundo exacto en que ocurren.
          </p>
        ),
      },
      {
        id: "term-working-set",
        category: "glossary",
        title: "🧠 Working Set de Memoria RAM",
        summary: "La memoria que los programas ya no usan pero que Windows no se atreve a liberar.",
        content: (
          <p className="text-xs text-[#9DA4B0] leading-relaxed">
            Cuando cierras un juego o una pestaña de Chrome, parte de la información se queda ocupando memoria "por si acaso". La función de vaciado del Working Set (usando la API Win32 nativa) obliga a Windows a liberar esa memoria para que tu juego tenga todo el espacio libre que necesita.
          </p>
        ),
      },
    ],
    []
  );

  // Filtrado por categoría y búsqueda
  const filteredItems = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory = item.category === activeCategory;
      if (!searchQuery.trim()) return matchesCategory;

      const q = searchQuery.toLowerCase();
      const inTitle = item.title.toLowerCase().includes(q);
      const inSummary = item.summary.toLowerCase().includes(q);
      return inTitle || inSummary;
    });
  }, [faqItems, activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl bg-[#0E1013]/95 border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Cabecera del Modal */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Centro de Ayuda & Guía para Principiantes
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    FAQ Completo
                  </span>
                </div>
                <p className="text-xs text-[#717680]">
                  Todo explicado de forma clara y sin tecnicismos para sacar el máximo provecho a tu PC.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#717680] hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de búsqueda y selector de categorías */}
          <div className="flex-shrink-0 px-6 py-3.5 border-b border-white/[0.06] bg-black/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Buscador */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680]" />
              <input
                type="text"
                placeholder="Buscar duda o función..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-[#717680] focus:outline-none focus:border-cyan-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#717680] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Pestañas de categorías */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => {
                  setActiveCategory("quickstart");
                  setSearchQuery("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === "quickstart" && !searchQuery
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-[#717680] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>¿Qué uso en mi caso?</span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory("features");
                  setSearchQuery("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === "features" && !searchQuery
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-[#717680] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Funcionalidades</span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory("faq");
                  setSearchQuery("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === "faq" && !searchQuery
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-[#717680] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Preguntas Frecuentes</span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory("glossary");
                  setSearchQuery("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === "glossary" && !searchQuery
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-[#717680] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Glosario Fácil</span>
              </button>
            </div>
          </div>

          {/* Cuerpo con Scroll de Acordeones */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Search className="w-8 h-8 text-[#717680] mb-2 opacity-50" />
                <p className="text-sm font-semibold text-white/90">No se encontraron resultados</p>
                <p className="text-xs text-[#717680] mt-1">Prueba con otra palabra clave como "FiveM", "RAM", "ban" o "planes".</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isOpen = openItems[item.id] ?? false;

                return (
                  <div
                    key={item.id}
                    className="rounded-xl bg-white/[0.02] hover:bg-white/[0.035] border border-white/[0.07] overflow-hidden transition-all shadow-sm"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full flex items-center justify-between p-4 text-left transition-colors"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-sm font-semibold text-white tracking-tight">
                            {item.title}
                          </h3>
                          {item.badge && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                item.badgeColor || "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#717680]">{item.summary}</p>
                      </div>

                      <div
                        className={`p-1 rounded-lg bg-white/[0.04] text-[#717680] transition-transform duration-200 flex-shrink-0 ${
                          isOpen ? "rotate-180 text-cyan-400 bg-cyan-500/10" : ""
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-white/[0.05] bg-black/20"
                        >
                          <div className="p-4 pt-3">{item.content}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Pie del Modal con resumen de soporte */}
          <div className="flex-shrink-0 px-6 py-3 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-xs text-[#717680]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Optimizaciones seguras garantizadas con puntos de restauración VSS.</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-all"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
