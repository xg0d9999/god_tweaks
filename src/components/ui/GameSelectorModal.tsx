import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Cpu,
  HardDrive,
  Flame,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { TargetGameId, HardwareProfile, GameProfileOption } from "../../types";

interface GameSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (gameId: TargetGameId) => void;
  hardware: HardwareProfile | null;
}

export const GAME_PROFILES: GameProfileOption[] = [
  {
    id: "general",
    name: "Optimización General (Todo el PC)",
    shortName: "Sistema Completo",
    categoryBadge: "Universal Core",
    description:
      "Ajustes profundos a nivel de Kernel de Windows, MMCSS, temporizadores de alta precisión y red TCP/IP para cualquier juego o carga pesada.",
    bgImage:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    logoText: "SYSTEM CORE",
    themeColor: "from-blue-600/25 via-cyan-600/15 to-transparent",
    glowColor: "rgba(59, 130, 246, 0.5)",
    exclusiveTweaks: [
      "Planificador multimedia MMCSS (GPU=8, Priority=6)",
      "Límite de ancho de banda QoS Psched eliminado",
      "Efectos visuales en modo de máximo rendimiento",
      "TCPNoDelay y anulación del algoritmo Nagle",
    ],
  },
  {
    id: "fivem",
    name: "FiveM & GTA V",
    shortName: "FiveM",
    categoryBadge: "RAGE Engine & NUI",
    description:
      "Prioridad de CPU/IO a todos los ejecutables de FiveM (b2699..b3095), purga de cachés locales pesadas y eliminación de pérdida de texturas.",
    bgImage:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    logoText: "FiveM",
    themeColor: "from-amber-600/30 via-orange-600/20 to-transparent",
    glowColor: "rgba(245, 158, 11, 0.5)",
    exclusiveTweaks: [
      "Prioridad Alta en FiveM.exe, GTA5.exe y b2699..b3095",
      "Prioridad de Disco E/S (IoPriority=3) y memoria (PagePriority=5)",
      "Limpieza de server-cache y almacenamiento NUI",
      "Supresión de stutter por pérdida de texturas",
    ],
  },
  {
    id: "fortnite",
    name: "Fortnite (Battle Royale)",
    shortName: "Fortnite",
    categoryBadge: "Unreal Engine 5",
    description:
      "Calibración para Unreal Engine 5. Prioridad IFEO en FortniteClient-Win64-Shipping y estabilización de fotogramas 1% lows en combates rápidos.",
    bgImage:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    logoText: "FORTNITE",
    themeColor: "from-purple-600/30 via-fuchsia-600/20 to-transparent",
    glowColor: "rgba(168, 85, 247, 0.5)",
    exclusiveTweaks: [
      "Prioridad Alta en FortniteClient-Win64-Shipping",
      "Reducción de latencia DWM en pantalla completa",
      "Mitigación de sobrecarga de Easy Anti-Cheat / BattlEye",
      "Estabilización de frametime en caídas de mapa y builds",
    ],
  },
  {
    id: "valorant",
    name: "Valorant",
    shortName: "Valorant",
    categoryBadge: "Riot Vanguard Safe",
    description:
      "100% seguro y compatible con Riot Vanguard. Prioridad de procesos y temporizador ultra estricto de 0.5ms para máxima precisión de disparo.",
    bgImage:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
    logoText: "VALORANT",
    themeColor: "from-rose-600/30 via-red-600/20 to-transparent",
    glowColor: "rgba(244, 63, 94, 0.5)",
    exclusiveTweaks: [
      "Prioridad Alta en VALORANT-Win64-Shipping (Riot Safe)",
      "Temporizador TSC de 0.5ms para respuesta de clic instantánea",
      "Anulación de Optimizaciones de Pantalla Completa (FSO)",
      "Zero-Jitter en transmisión de paquetes competitivos",
    ],
  },
  {
    id: "cs2",
    name: "Counter-Strike 2 (CS2)",
    shortName: "CS2",
    categoryBadge: "Source 2 Sub-Tick",
    description:
      "Optimización para el sistema Sub-Tick de Source 2. Prioridad en cs2.exe, sintonización de red TCP sin demoras y caché de sombreadores de Steam.",
    bgImage:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    logoText: "COUNTER-STRIKE 2",
    themeColor: "from-amber-500/30 via-yellow-600/20 to-transparent",
    glowColor: "rgba(234, 179, 8, 0.5)",
    exclusiveTweaks: [
      "Prioridad Alta de CPU e I/O en cs2.exe",
      "Sincronización sub-tick de paquetes (TcpDelAckTicks = 0)",
      "Optimización de sombreadores de Steam y DirectX",
      "Eliminación de micro-stutters al hacer strafing y giros",
    ],
  },
];

export const GameSelectorModal: React.FC<GameSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectGame,
  hardware,
}) => {
  const [selectedId, setSelectedId] = useState<TargetGameId>("general");

  if (!isOpen) return null;

  const activeGame = GAME_PROFILES.find((g) => g.id === selectedId) || GAME_PROFILES[0];

  // Helper flags for hardware
  const isAmdCpu = hardware?.cpu.toLowerCase().includes("amd") || hardware?.cpu.toLowerCase().includes("ryzen");
  const isIntelCpu = hardware?.cpu.toLowerCase().includes("intel") || hardware?.cpu.toLowerCase().includes("core");
  const isNvidiaGpu = hardware?.gpu.toLowerCase().includes("nvidia") || hardware?.gpu.toLowerCase().includes("geforce") || hardware?.gpu.toLowerCase().includes("rtx") || hardware?.gpu.toLowerCase().includes("gtx");
  const isAmdGpu = hardware?.gpu.toLowerCase().includes("amd") || hardware?.gpu.toLowerCase().includes("radeon");
  const ramGb = hardware?.ram_mb ? Math.round(hardware.ram_mb / 1024) : 16;
  const hasHighRam = ramGb >= 16;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-[#0A0D10]/95 border border-white/[0.12] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-10"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Calibración de Optimización Inteligente
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    ADAPTATIVO
                  </span>
                </div>
                <p className="text-xs text-[#8A919E]">
                  Selecciona el juego específico a optimizar o aplica el perfil universal del sistema.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A919E] hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hardware Detection Banner */}
          <div className="px-6 py-3 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#9BA3AF]">
              <Cpu className="w-3.5 h-3.5 text-white/80" />
              <span>Hardware detectado en tu PC:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              {/* CPU Badge */}
              <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#E0E6ED] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{hardware?.cpu || "CPU Multinúcleo"}</span>
                <span className="text-[10px] text-cyan-400/80 font-sans uppercase">
                  ({isAmdCpu ? "Ryzen Zen" : isIntelCpu ? "Intel Core" : "CPU"})
                </span>
              </div>

              {/* GPU Badge */}
              <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#E0E6ED] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{hardware?.gpu || "GPU Dedicada"}</span>
                <span className="text-[10px] text-emerald-400/80 font-sans uppercase">
                  ({isNvidiaGpu ? "NVIDIA" : isAmdGpu ? "AMD Radeon" : "GPU"})
                </span>
              </div>

              {/* RAM Badge */}
              <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#E0E6ED] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <HardDrive className="w-3 h-3 text-purple-400 inline" />
                <span>{ramGb} GB RAM</span>
                {hasHighRam && (
                  <span className="text-[10px] text-purple-400 font-sans">
                    (Compresión Off)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GAME_PROFILES.map((game) => {
                const isSelected = selectedId === game.id;
                return (
                  <motion.div
                    key={game.id}
                    onClick={() => setSelectedId(game.id)}
                    whileHover={{ scale: 1.02, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{
                      boxShadow: isSelected
                        ? `0 0 25px ${game.glowColor}`
                        : "0 4px 15px rgba(0,0,0,0.4)",
                    }}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border transition-all duration-300 flex flex-col justify-between min-h-[200px] group ${
                      isSelected
                        ? "border-white/50 bg-[#12161C]"
                        : "border-white/[0.1] bg-[#0E1217]/70 hover:border-white/30"
                    }`}
                  >
                    {/* Background Blur Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ backgroundImage: `url(${game.bgImage})` }}
                    />
                    {/* Dark gradient & blur overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D11] via-[#0A0D11]/80 to-[#0A0D11]/45 backdrop-blur-[6px]" />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${game.themeColor} opacity-70 group-hover:opacity-100 transition-opacity`}
                    />

                    {/* Content */}
                    <div className="relative z-10 p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                      {/* Top Row: Category badge & selection indicator */}
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wider uppercase bg-black/50 text-white/90 border border-white/10 backdrop-blur-sm">
                          {game.categoryBadge}
                        </span>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? "bg-white text-black border-white shadow-sm"
                              : "border-white/20 bg-black/40 group-hover:border-white/40"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      {/* Middle: Stylized Text Logo */}
                      <div className="pt-2">
                        <h3 className="text-xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-sans uppercase">
                          {game.logoText}
                        </h3>
                        <p className="text-xs text-[#8E96A5] line-clamp-2 mt-1 leading-relaxed">
                          {game.description}
                        </p>
                      </div>

                      {/* Bottom: Quick Tweak Highlights */}
                      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#A6ADB8]">
                        <span className="font-mono text-[10px]">
                          {game.exclusiveTweaks.length} Tweaks exclusivos
                        </span>
                        <span
                          className={`font-semibold flex items-center gap-1 transition-colors ${
                            isSelected ? "text-white" : "text-[#7B828F] group-hover:text-white"
                          }`}
                        >
                          {isSelected ? "Seleccionado" : "Elegir"}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Glow outline on selection */}
                    {isSelected && (
                      <div className="absolute inset-0 border-2 border-white/60 rounded-xl pointer-events-none" />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Detailed Inspection of Selected Game Profile */}
            <div className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <h4 className="text-sm font-semibold text-white">
                    Optimizaciones preparadas para:{" "}
                    <span className="text-white underline decoration-white/30">
                      {activeGame.name}
                    </span>
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-[#828894]">
                  Calibrado para tu {isAmdCpu ? "AMD Ryzen" : "Intel"} + {isNvidiaGpu ? "NVIDIA" : "GPU"}
                </span>
              </div>

              {/* Tweaks list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {activeGame.exclusiveTweaks.map((tweak, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/[0.05] text-[#D0D6E0]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                    <span>{tweak}</span>
                  </div>
                ))}

                {/* Hardware Exclusive Inject */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span>
                    Hardware:{" "}
                    {isAmdCpu
                      ? "Ryzen Zen Core Unparking + Win32PrioritySeparation 38"
                      : "Intel P-Core Thread Director & PowerThrottling Off"}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                  <span>
                    RAM ({ramGb}GB):{" "}
                    {hasHighRam
                      ? "Desactivar Compresión de Memoria (MMAgent - Zero Stutters)"
                      : "Compactación agresiva de RAM Working Set"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs text-[#7B828F]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Incluye punto de restauración VSS previo y backup del registro (.reg).</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#8A919E] hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectGame(selectedId);
                  onClose();
                }}
                className="px-5 py-2.5 text-xs font-bold text-black bg-white hover:bg-white/90 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Aplicar Optimización Adaptativa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
