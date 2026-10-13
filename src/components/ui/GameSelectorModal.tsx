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

interface ComicGamePanel {
  id: TargetGameId;
  title: string;
  tagline: string;
  engineBadge: string;
  heroImage: string;
  logoSvg: string;
  gradientClass: string;
  glowColor: string;
  accentHex: string;
  dividerAngle: string;
  exclusiveTweaks: string[];
  hardwareHighlight: (hw: HardwareContext) => string;
}

const COMIC_PANELS: ComicGamePanel[] = [
  {
    id: "fivem",
    title: "FiveM & GTA V",
    tagline: "RAGE Engine & NUI Textures",
    engineBadge: "RAGE ENGINE & FIVEM",
    heroImage: "/games/fivem_hero.png",
    logoSvg: "/games/fivem_logo.svg",
    gradientClass: "from-[#FF9800] via-[#E65100] to-[#1A0A02]",
    glowColor: "rgba(245, 158, 11, 0.5)",
    accentHex: "#FF8A00",
    dividerAngle: "rotate-[-3.5deg]",
    exclusiveTweaks: [
      "Prioridad Alta CPU/IO en FiveM.exe, GTA5.exe y b2699..b3095",
      "Purga profunda de server-cache y memoria NUI",
      "Eliminación de pérdida de texturas y micro-congelamientos",
    ],
    hardwareHighlight: (hw) =>
      `MMCSS Priority 6 + ${hw.isNvidiaGpu ? "NVIDIA Reflex Ultra" : hw.isAmdGpu ? "Radeon Anti-Lag" : "GPU Max Clock"} | RAM ${hw.ramGb}GB ${hw.hasHighRam ? "MMAgent Off" : "Trimmed"}`,
  },
  {
    id: "fortnite",
    title: "Fortnite",
    tagline: "Unreal Engine 5 & Anti-Cheat",
    engineBadge: "UNREAL ENGINE 5",
    heroImage: "/games/fortnite_hero.png",
    logoSvg: "/games/fortnite_logo.svg",
    gradientClass: "from-[#00D2FF] via-[#A855F7] to-[#12002B]",
    glowColor: "rgba(168, 85, 247, 0.5)",
    accentHex: "#D946EF",
    dividerAngle: "rotate-[+2.6deg]",
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
    heroImage: "/games/cs2_hero.png",
    logoSvg: "/games/cs2_logo.svg",
    gradientClass: "from-[#38BDF8] via-[#1E293B] to-[#EA580C]",
    glowColor: "rgba(234, 88, 12, 0.5)",
    accentHex: "#F97316",
    dividerAngle: "rotate-[-2.2deg]",
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
    heroImage: "/games/valorant_hero.png",
    logoSvg: "/games/valorant_logo.svg",
    gradientClass: "from-[#FF4655] via-[#881337] to-[#0A0D14]",
    glowColor: "rgba(255, 70, 85, 0.5)",
    accentHex: "#FF4655",
    dividerAngle: "rotate-[0deg]",
    exclusiveTweaks: [
      "Prioridad Alta en VALORANT-Win64-Shipping (Riot Safe)",
      "Temporizador TSC de 0.5ms para respuesta de clic instantánea",
      "Desactivación de Optimizaciones de Pantalla Completa (FSO)",
    ],
    hardwareHighlight: (hw) =>
      `Zero-Jitter UDP Packets | ${hw.isAmdCpu ? "Ryzen Zen Calibrated" : hw.isIntelCpu ? "Intel SpeedShift" : "CPU Calibrated"} | Vanguard Safe`,
  },
];

// Fallback / Enhanced Inline SVG Logos for instant vector sharpness
const RenderGameLogo: React.FC<{ gameId: TargetGameId }> = ({ gameId }) => {
  switch (gameId) {
    case "fivem":
      return (
        <div className="flex items-center gap-2 drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)]">
          <svg className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0" viewBox="0 0 100 100" fill="none">
            <path
              d="M18 60 L45 15 C47 12 51 11 54 13 L68 25 C71 28 70 32 68 35 L40 78 C38 82 33 82 30 79 L16 68 C14 66 14 62 18 60 Z"
              fill="#FF6B00"
            />
            <path
              d="M48 76 L72 32 C74 29 78 29 80 31 L92 41 C94 44 94 48 91 51 L64 92 C62 95 57 95 54 92 L42 82 C40 80 40 76 48 76 Z"
              fill="#FFA31A"
            />
            <path
              d="M56 26 L64 14 C66 11 70 11 72 13 L84 23 C86 26 86 30 84 32 L76 43"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>
          <div className="flex flex-col text-left">
            <span className="text-xl md:text-2xl font-black tracking-tight text-white leading-none font-sans uppercase">
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
        <div className="flex items-center gap-2 drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)]">
          <div className="flex flex-col text-left transform -skew-x-6">
            <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-white leading-none uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              FORTNITE
            </span>
            <span className="text-[9px] md:text-[10px] font-extrabold text-[#D946EF] tracking-wider uppercase">
              BATTLE ROYALE
            </span>
          </div>
        </div>
      );

    case "cs2":
      return (
        <div className="flex items-center gap-2.5 drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)]">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[#EA580C] border border-[#F97316] flex items-center justify-center font-black text-white text-xs shadow-md">
            CS2
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs md:text-sm font-extrabold tracking-wider text-slate-200 leading-tight uppercase">
              COUNTER-STRIKE
            </span>
            <span className="text-lg md:text-xl font-black text-[#EA580C] leading-none tracking-tight">
              SOURCE 2
            </span>
          </div>
        </div>
      );

    case "valorant":
      return (
        <div className="flex items-center gap-2.5 drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)]">
          <svg className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0" viewBox="0 0 100 100" fill="none">
            <path
              d="M24 10 L58 52 C59 54 58 57 55 57 L42 57 C40 57 38 55 36 53 L20 28 C18 25 18 20 18 15 L24 10 Z"
              fill="#FF4655"
            />
            <path
              d="M76 10 L48 45 C46 47 48 50 51 50 L64 50 C66 50 68 49 70 47 L82 28 C84 25 84 20 84 15 L76 10 Z"
              fill="#FF4655"
            />
          </svg>
          <div className="flex flex-col text-left">
            <span className="text-xl md:text-2xl font-black tracking-widest text-[#FF4655] leading-none uppercase">
              VALORANT
            </span>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-300 tracking-wider uppercase">
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
  // State for hovered panel in accordion
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 overflow-hidden">
        {/* Dark Cinematic Backdrop with Heavy Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#040608]/90 backdrop-blur-xl"
        />

        {/* Grand GTA-Themed Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative w-[96vw] max-w-[1360px] h-[90vh] max-h-[880px] bg-[#07090D] border border-white/[0.12] rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col z-10"
        >
          {/* Top Bar: Title, Hardware Detection & Close */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
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
                    EDICIÓN COVER eSPORTS
                  </span>
                </div>
                <p className="text-xs text-[#8A919E]">
                  Pasa el ratón sobre un juego para enfocarlo. Las líneas divisorias irregulares y el perfil se adaptan a tu hardware.
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
          <div className="px-6 py-2 bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-transparent border-b border-white/[0.06] flex items-center justify-between text-xs">
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

          {/* MAIN COMIC PANEL ACCORDION (GTA COVER STYLE) */}
          <div
            onMouseLeave={() => setHoveredId(null)}
            className="flex-1 min-h-[460px] md:min-h-[520px] p-4 flex flex-row w-full relative overflow-hidden select-none bg-[#05070A]"
          >
            <div className="flex flex-row w-full h-full rounded-2xl border-4 border-[#07090C] overflow-hidden relative shadow-2xl bg-[#030406]">
              {COMIC_PANELS.map((game, index) => {
                const isHovered = hoveredId === game.id;
                const isAnyHovered = hoveredId !== null;

                // Dynamic accordion flex values:
                // Idle: all 4 share equal flex (1) -> 25% each
                // Hovered: focused panel expands to 3.2 (~55%), non-hovered contract to 0.65 (~15%)
                // Since index 0 is at left edge, it expands to the right!
                // Since index 3 is at right edge, it expands to the left!
                // Intermediate panels expand smoothly outwards!
                const flexStyle = isHovered
                  ? "3.2 3.2 0%"
                  : isAnyHovered
                  ? "0.65 0.65 0%"
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
                    className={`relative h-full overflow-hidden cursor-pointer group flex flex-col justify-between ${
                      !isHovered && isAnyHovered ? "brightness-75" : "brightness-100"
                    }`}
                  >
                    {/* Vibrant Game-Specific Background Gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-b ${game.gradientClass} opacity-95 transition-opacity duration-500`}
                    />

                    {/* Radial Glow Highlight on top of gradient */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at 50% 20%, ${game.glowColor} 0%, transparent 70%)`,
                      }}
                    />

                    {/* Hero Character Cutout / Artwork from user reference */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <img
                        src={game.heroImage}
                        alt={game.title}
                        className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out ${
                          isHovered ? "scale-105" : "scale-100"
                        }`}
                        style={{
                          // Soft mask fade so character seamlessly blends into bottom dark gradient
                          maskImage:
                            "linear-gradient(to bottom, black 60%, rgba(0,0,0,0.8) 75%, transparent 98%)",
                          WebkitMaskImage:
                            "linear-gradient(to bottom, black 60%, rgba(0,0,0,0.8) 75%, transparent 98%)",
                        }}
                      />
                    </div>

                    {/* Dark gradient overlay for bottom text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/55 to-transparent pointer-events-none" />

                    {/* Top Content: Transparent Logo & Engine Badge */}
                    <div className="relative z-10 p-4 md:p-6 flex flex-col items-start gap-2.5">
                      {/* Engine Tag */}
                      <div className="px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-mono font-bold tracking-widest uppercase bg-black/60 text-white/90 border border-white/15 backdrop-blur-md shadow-md">
                        {game.engineBadge}
                      </div>

                      {/* Transparent Logo (High-Res Vector or Sourced) */}
                      <div className="pt-1">
                        <RenderGameLogo gameId={game.id} />
                      </div>
                    </div>

                    {/* Bottom Area: State Dependent (Collapsed vs Expanded) */}
                    <div className="relative z-10 p-4 md:p-6 flex flex-col justify-end">
                      {/* Collapsed State Minimal Indicator (when another panel is focused) */}
                      {!isHovered && isAnyHovered && (
                        <div className="flex flex-col items-center justify-center text-center py-4">
                          <span className="text-[11px] font-black uppercase tracking-widest text-white/80 rotate-[-90deg] whitespace-nowrap mb-6">
                            {game.title}
                          </span>
                        </div>
                      )}

                      {/* Idle State (No hover yet) */}
                      {!isAnyHovered && (
                        <div className="p-3 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md space-y-1.5 transition-all">
                          <span className="text-xs font-bold text-white block">
                            {game.tagline}
                          </span>
                          <span className="text-[11px] text-[#A6ADB8] flex items-center gap-1 font-semibold">
                            Pasa el ratón para expandir <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}

                      {/* Expanded State (Hovered): Full Exclusive Tweaks + Hardware + Big Action Button */}
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="p-4 md:p-5 rounded-2xl bg-black/85 border border-white/20 backdrop-blur-xl shadow-2xl space-y-3.5"
                        >
                          {/* Title & Tagline */}
                          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                            <div>
                              <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <span>{game.title}</span>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: game.accentHex }} />
                              </h3>
                              <p className="text-xs text-slate-300 font-medium">
                                {game.tagline}
                              </p>
                            </div>

                            {/* Hardware calibration indicator */}
                            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                              <Sparkles className="w-3 h-3" />
                              <span>Perfil Calibrado</span>
                            </div>
                          </div>

                          {/* Exclusive Tweaks List */}
                          <div className="space-y-1.5 text-xs">
                            {game.exclusiveTweaks.map((tweak, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-slate-200"
                              >
                                <span
                                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0"
                                  style={{ backgroundColor: game.accentHex }}
                                >
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                                <span className="line-clamp-1">{tweak}</span>
                              </div>
                            ))}
                          </div>

                          {/* Hardware Highlight Bar */}
                          <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-cyan-300 flex items-center gap-2">
                            <Cpu className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" />
                            <span className="truncate">
                              {game.hardwareHighlight(hwContext)}
                            </span>
                          </div>

                          {/* Big Prominent Call To Action Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectGame(game.id);
                              onClose();
                            }}
                            className="w-full py-3 px-4 rounded-xl text-black font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
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

                    {/* IRREGULAR ANGLED GTA COMIC DIVIDER (Between columns) */}
                    {index < COMIC_PANELS.length - 1 && (
                      <div
                        className={`absolute top-[-15%] bottom-[-15%] right-[-5px] w-[9px] bg-[#07090D] shadow-[0_0_18px_rgba(0,0,0,0.95)] z-30 pointer-events-none transform origin-center ${game.dividerAngle}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Footer: VSS Restore Guarantee & Close Button */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/[0.08] bg-white/[0.02]">
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
                className="px-5 py-2.5 text-xs font-bold text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
