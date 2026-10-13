import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Cpu,
  HardDrive,
  Flame,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Check,
  Layers,
} from "lucide-react";
import { TargetGameId, HardwareProfile } from "../../types";

interface GameSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (gameId: TargetGameId) => void;
  hardware: HardwareProfile | null;
}

interface HardwareContext {
  isAmdCpu: boolean;
  isIntelCpu: boolean;
  isNvidiaGpu: boolean;
  isAmdGpu: boolean;
  ramGb: number;
  hasHighRam: boolean;
}

interface VerticalGamePanel {
  id: TargetGameId;
  title: string;
  tagline: string;
  engineBadge: string;
  characterImg: string;
  gradientClass: string;
  glowColor: string;
  accentHex: string;
  exclusiveTweaks: string[];
  hardwareHighlight: (hw: HardwareContext) => string;
}

const GAME_PANELS: VerticalGamePanel[] = [
  {
    id: "fivem",
    title: "FiveM & GTA V",
    tagline: "RAGE Engine & NUI Textures",
    engineBadge: "RAGE ENGINE & FIVEM",
    characterImg: "/fotos/fivemplayers.png",
    gradientClass: "from-amber-500/35 via-orange-600/20 to-[#140601]/90",
    glowColor: "rgba(245, 158, 11, 0.45)",
    accentHex: "#FF8A00",
    exclusiveTweaks: [
      "Prioridad Alta CPU/IO en FiveM.exe, GTA5.exe y b2699..b3095",
      "Purga profunda de server-cache y memoria de texturas NUI",
      "Eliminación de caída de texturas y micro-congelamientos",
    ],
    hardwareHighlight: (hw) =>
      `MMCSS Priority 6 + ${hw.isNvidiaGpu ? "NVIDIA Reflex Ultra" : hw.isAmdGpu ? "Radeon Anti-Lag" : "GPU Max Clock"} | RAM ${hw.ramGb}GB ${hw.hasHighRam ? "MMAgent Off" : "Trimmed"}`,
  },
  {
    id: "fortnite",
    title: "Fortnite",
    tagline: "Unreal Engine 5 & Anti-Cheat",
    engineBadge: "UNREAL ENGINE 5",
    characterImg: "/fotos/fortnite2.png",
    gradientClass: "from-sky-400/30 via-fuchsia-600/20 to-[#120026]/90",
    glowColor: "rgba(168, 85, 247, 0.45)",
    accentHex: "#D946EF",
    exclusiveTweaks: [
      "Prioridad IFEO en FortniteClient-Win64-Shipping",
      "Estabilización de 1% lows en combates de construcción",
      "Mitigación de sobrecarga DWM y Anti-Cheat (EAC / BattlEye)",
    ],
    hardwareHighlight: (hw) =>
      `${hw.isAmdCpu ? "Ryzen 3D V-Cache Tuning" : hw.isIntelCpu ? "Intel P-Core Director" : "CPU Core Affinity"} | ${hw.isNvidiaGpu ? "NVIDIA Reflex Low Latency" : "Bypass DWM Latency"}`,
  },
  {
    id: "cs2",
    title: "Counter-Strike 2",
    tagline: "Source 2 Sub-Tick Precision",
    engineBadge: "SOURCE 2 SUB-TICK",
    characterImg: "/fotos/cs22.png",
    gradientClass: "from-cyan-500/30 via-slate-800/40 to-[#ea580c]/35",
    glowColor: "rgba(234, 88, 12, 0.45)",
    accentHex: "#F97316",
    exclusiveTweaks: [
      "Prioridad de proceso y GPU en cs2.exe",
      "Sincronización sub-tick TCP sin demoras (TcpDelAckTicks = 0)",
      "Optimización de sombreadores DirectX para giros sin tirones",
    ],
    hardwareHighlight: (hw) =>
      `Sub-Tick Zero-Jitter | ${hw.isNvidiaGpu ? "NVIDIA Reflex Boost" : "Radeon Anti-Lag+"} | TSC 0.5ms High-Precision`,
  },
  {
    id: "valorant",
    title: "Valorant",
    tagline: "Riot Vanguard 100% Safe",
    engineBadge: "RIOT VANGUARD SAFE",
    characterImg: "/fotos/valorantplayer.png",
    gradientClass: "from-rose-500/35 via-red-900/25 to-[#0b0407]/90",
    glowColor: "rgba(255, 70, 85, 0.45)",
    accentHex: "#FF4655",
    exclusiveTweaks: [
      "Prioridad Alta en VALORANT-Win64-Shipping (Riot Safe)",
      "Temporizador TSC de 0.5ms para respuesta de clic instantánea",
      "Desactivación de Optimizaciones de Pantalla Completa (FSO)",
    ],
    hardwareHighlight: (hw) =>
      `Zero-Jitter UDP Packets | ${hw.isAmdCpu ? "Ryzen Zen Calibrated" : hw.isIntelCpu ? "Intel SpeedShift" : "CPU Calibrated"} | Vanguard Safe`,
  },
];

// Clean Header Logos using user files from /fotos
const GameLogoHeader: React.FC<{ gameId: TargetGameId }> = ({ gameId }) => {
  switch (gameId) {
    case "fivem":
      return (
        <div className="flex items-center gap-2.5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          <img
            src="/fotos/fivem.svg"
            alt="FiveM Logo"
            className="w-8 h-8 md:w-9 md:h-9 object-contain flex-shrink-0"
          />
          <div className="flex flex-col text-left">
            <span className="text-xl md:text-2xl font-black text-white leading-none font-sans uppercase tracking-tight">
              Five<span className="text-[#FF8A00]">M</span>
            </span>
            <span className="text-[9px] md:text-[10px] font-bold text-[#FFA726] tracking-widest uppercase">
              GTA V &amp; RP
            </span>
          </div>
        </div>
      );

    case "fortnite":
      return (
        <div className="flex items-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          <img
            src="/fotos/FortniteLogo.svg"
            alt="Fortnite Logo"
            className="h-8 md:h-9 w-auto max-w-[170px] object-contain"
          />
        </div>
      );

    case "cs2":
      return (
        <div className="flex items-center gap-2.5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          <img
            src="/fotos/cs2_logop.svg"
            alt="CS2 Logo"
            className="h-8 md:h-9 w-auto object-contain flex-shrink-0"
          />
          <div className="flex flex-col text-left">
            <span className="text-xs md:text-sm font-black tracking-wider text-slate-100 uppercase leading-none">
              COUNTER-STRIKE
            </span>
            <span className="text-base md:text-lg font-black text-[#EA580C] tracking-tight leading-none mt-0.5">
              CS2
            </span>
          </div>
        </div>
      );

    case "valorant":
      return (
        <div className="flex items-center gap-2.5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          <img
            src="/fotos/valorant.svg"
            alt="Valorant Logo"
            className="w-7 h-7 md:w-8 md:h-8 object-contain flex-shrink-0"
          />
          <div className="flex flex-col text-left">
            <span className="text-xl md:text-2xl font-black tracking-widest text-[#FF4655] leading-none uppercase">
              VALORANT
            </span>
            <span className="text-[9px] font-bold text-slate-300 tracking-wider uppercase">
              RIOT GAMES
            </span>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export const GameSelectorModal: React.FC<GameSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectGame,
  hardware,
}) => {
  // State for hovered panel in vertical accordion
  const [hoveredId, setHoveredId] = useState<TargetGameId | null>(null);

  if (!isOpen) return null;

  // Hardware helper badges
  const cpuLower = (hardware?.cpu || "").toLowerCase();
  const gpuLower = (hardware?.gpu || "").toLowerCase();

  const isAmdCpu = Boolean(cpuLower.includes("amd") || cpuLower.includes("ryzen"));
  const isIntelCpu = Boolean(cpuLower.includes("intel") || cpuLower.includes("core"));
  const isNvidiaGpu = Boolean(
    gpuLower.includes("nvidia") ||
      gpuLower.includes("geforce") ||
      gpuLower.includes("rtx") ||
      gpuLower.includes("gtx")
  );
  const isAmdGpu = Boolean(gpuLower.includes("amd") || gpuLower.includes("radeon"));
  const ramGb = hardware?.ram_mb ? Math.round(hardware.ram_mb / 1024) : 16;
  const hasHighRam = ramGb >= 16;

  const hwContext: HardwareContext = {
    isAmdCpu,
    isIntelCpu,
    isNvidiaGpu,
    isAmdGpu,
    ramGb,
    hasHighRam,
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-5 overflow-hidden">
        {/* Dark Cinematic Backdrop with Heavy Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#030507]/90 backdrop-blur-xl"
        />

        {/* Grand Format Modal Window: High theater scale */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
          className="relative w-[98vw] max-w-[1540px] h-[94vh] max-h-[920px] bg-[#07090D] border border-white/[0.14] rounded-3xl shadow-[0_0_90px_rgba(0,0,0,0.98)] overflow-hidden flex flex-col z-10"
        >
          {/* Top Bar: Title, Hardware Detection & Close */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.08] bg-white/[0.02] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.12] text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base md:text-lg font-black text-white tracking-tight font-sans uppercase">
                    CALIBRACIÓN ADAPTATIVA POR JUEGO
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30">
                    EDICIÓN PROFESIONAL
                  </span>
                </div>
                <p className="text-xs text-[#8A919E]">
                  Pasa el ratón sobre tu juego para enfocarlo. Fondos limpios sin sombras artificiales con degradados calibrados a tu equipo.
                </p>
              </div>
            </div>

            {/* Hardware Quick Badges & Close Button */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 font-mono text-[11px]">
                <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#E0E6ED] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{hardware?.cpu || "CPU"}</span>
                  <span className="text-[10px] text-cyan-400 uppercase font-sans font-bold">
                    ({isAmdCpu ? "Ryzen" : isIntelCpu ? "Intel" : "CPU"})
                  </span>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#E0E6ED] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{hardware?.gpu || "GPU"}</span>
                  <span className="text-[10px] text-emerald-400 uppercase font-sans font-bold">
                    ({isNvidiaGpu ? "NVIDIA" : isAmdGpu ? "Radeon" : "GPU"})
                  </span>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#E0E6ED] flex items-center gap-1.5">
                  <HardDrive className="w-3 h-3 text-purple-400" />
                  <span>{ramGb} GB RAM</span>
                  {hasHighRam && (
                    <span className="text-[9px] text-purple-300 font-sans">(Comp. Off)</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-[#8A919E] hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modo General Quick Strip Banner */}
          <div className="px-6 py-2 bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-transparent border-b border-white/[0.06] flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center gap-2 text-cyan-200">
              <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                ¿No juegas a ninguno de estos títulos en concreto? Puedes optimizar todo tu PC de forma global.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectGame("general");
                onClose();
              }}
              className="px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] transition-all flex items-center gap-1.5"
            >
              <span>Aplicar Modo General (Todo el PC)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* MAIN STAGE: CLEAN VERTICAL COLUMNS ACCORDION */}
          <div
            onMouseLeave={() => setHoveredId(null)}
            className="flex-1 min-h-[580px] p-4 flex flex-row w-full relative overflow-hidden select-none bg-[#05070A]"
          >
            <div className="w-full h-full rounded-2xl border-4 border-[#07090D] overflow-hidden relative shadow-2xl bg-[#030406] flex flex-row divide-x divide-white/[0.1]">
              {GAME_PANELS.map((game) => {
                const isHovered = hoveredId === game.id;
                const isAnyHovered = hoveredId !== null;

                // Balanced vertical accordion flex:
                // Idle: each gets flex 1 (25% each -> ~380px on a 1520px container)
                // Hovered: active gets flex 2.5 (~46% -> ~700px), others get flex 1 (~18% -> ~270px)
                // Straight vertical lines, perfectly symmetric and clean
                const flexStyle = isHovered
                  ? "2.5 2.5 0%"
                  : isAnyHovered
                  ? "1 1 0%"
                  : "1 1 0%";

                return (
                  <div
                    key={game.id}
                    onMouseEnter={() => setHoveredId(game.id)}
                    onClick={() => {
                      if (!isHovered) {
                        setHoveredId(game.id);
                      }
                    }}
                    style={{
                      flex: flexStyle,
                      transition:
                        "flex 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease",
                    }}
                    className={`relative h-full flex flex-col justify-between overflow-hidden cursor-pointer group ${
                      !isHovered && isAnyHovered ? "brightness-85 opacity-75" : "brightness-100 opacity-100"
                    }`}
                  >
                    {/* 1. CLEAN VERTICAL BACKGROUND GRADIENT (No distortion, pure game colors) */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-b ${game.gradientClass} transition-opacity duration-500 ${
                        isHovered ? "opacity-100" : isAnyHovered ? "opacity-45" : "opacity-85"
                      }`}
                    />

                    {/* 2. SOFT RADIAL GLOW IN THE GAME'S OWN THEME COLOR (No dirty black shadow) */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                      style={{
                        opacity: isHovered ? 0.85 : 0.35,
                        background: `radial-gradient(circle at 50% 30%, ${game.glowColor} 0%, transparent 70%)`,
                      }}
                    />

                    {/* 3. CONTENT LAYER: 100% UPRIGHT & NATURAL */}
                    <div className="relative z-10 w-full h-full flex flex-col justify-between p-5 md:p-6 overflow-hidden">
                      {/* Top: Engine Tag & Transparent Logo */}
                      <div className="flex flex-col items-start gap-2 flex-shrink-0 z-20">
                        <div className="px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-mono font-bold tracking-widest uppercase bg-black/60 text-white/90 border border-white/15 backdrop-blur-md shadow-md">
                          {game.engineBadge}
                        </div>

                        <div className="pt-1">
                          <GameLogoHeader gameId={game.id} />
                        </div>
                      </div>

                      {/* Bottom Shadow Gradient to seamlessly blend character bases */}
                      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-10" />

                      {/* Middle: Clean Character Artwork - Grounded to bottom (never floating in mid-air) */}
                      <div className="absolute inset-x-0 bottom-0 top-14 flex items-end justify-center pointer-events-none overflow-hidden z-10">
                        <img
                          src={game.characterImg}
                          alt={game.title}
                          className={`h-[85%] max-h-[510px] w-auto max-w-[92%] object-contain object-bottom transition-all duration-500 ease-out ${
                            isHovered ? "scale-105 -translate-y-1" : "scale-100"
                          }`}
                          style={{
                            maskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
                          }}
                        />
                      </div>

                      {/* Bottom Area: State Dependent (Collapsed vs Expanded Card) */}
                      <div className="relative z-20 flex flex-col justify-end flex-shrink-0">
                        {/* Non-hovered state: Clean horizontal label */}
                        {!isHovered && (
                          <div className="p-3 rounded-xl bg-black/65 border border-white/10 backdrop-blur-md space-y-0.5 transition-all">
                            <span className="text-xs font-bold text-white block truncate">
                              {game.tagline}
                            </span>
                            <span className="text-[11px] text-[#A6ADB8] flex items-center gap-1 font-semibold">
                              Pasa el ratón para enfocar <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        )}

                        {/* Hovered State: Compact, elegant glassmorphic card (Leaves character visible) */}
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22 }}
                            className="p-3.5 md:p-4 rounded-xl bg-black/85 border border-white/20 backdrop-blur-xl shadow-2xl space-y-2.5"
                          >
                            {/* Title & Tagline row */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                              <div>
                                <h3 className="text-sm md:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                                  <span>{game.title}</span>
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: game.accentHex }}
                                  />
                                </h3>
                                <p className="text-[11px] text-slate-300 font-medium">
                                  {game.tagline}
                                </p>
                              </div>

                              <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                <Sparkles className="w-3 h-3" />
                                <span>Calibrado</span>
                              </div>
                            </div>

                            {/* Tweaks List (Compact 1-line bullets) */}
                            <div className="space-y-1 text-xs">
                              {game.exclusiveTweaks.map((tweak, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 text-slate-200"
                                >
                                  <span
                                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold text-black flex-shrink-0"
                                    style={{ backgroundColor: game.accentHex }}
                                  >
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </span>
                                  <span className="truncate">{tweak}</span>
                                </div>
                              ))}
                            </div>

                            {/* Hardware Highlights Bar */}
                            <div className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10.5px] font-mono text-cyan-300 flex items-center gap-2">
                              <Cpu className="w-3 h-3 flex-shrink-0 text-cyan-400" />
                              <span className="truncate">
                                {game.hardwareHighlight(hwContext)}
                              </span>
                            </div>

                            {/* Action CTA Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectGame(game.id);
                                onClose();
                              }}
                              className="w-full py-2.5 px-4 rounded-xl text-black font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                              style={{
                                backgroundColor: game.accentHex,
                                boxShadow: `0 0 25px ${game.glowColor}`,
                              }}
                            >
                              <span>OPTIMIZAR PARA {game.id.toUpperCase()}</span>
                              <ArrowRight className="w-4 h-4 stroke-[3]" />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Footer: VSS Restore Guarantee & Close Button */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.08] bg-white/[0.02] flex-shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#8A919E]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Incluye Punto de Restauración del Sistema VSS y copia de seguridad del Registro automáticos.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#8A919E] hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectGame("general");
                  onClose();
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Optimizar Modo General (Todo el PC)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
