import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { safeInvoke } from "../../utils/safeInvoke";

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

// Clean Header Logos using transparent files from /fotos
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
            className="h-8 md:h-9 w-auto max-w-[170px] object-contain brightness-0 invert"
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

export const GameSelectorStandaloneView: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<TargetGameId | null>(null);
  const [hardware, setHardware] = useState<HardwareProfile | null>(null);

  // Fetch hardware specifications on startup
  useEffect(() => {
    const loadHardware = async () => {
      try {
        const hw = await safeInvoke<HardwareProfile>("get_hardware_profile");
        if (hw) setHardware(hw);
      } catch (err) {
        console.warn("Could not retrieve hardware profile in selector window:", err);
      }
    };
    void loadHardware();
  }, []);

  const handleClose = async () => {
    try {
      await safeInvoke("close_game_selector_window");
    } catch {
      if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().hide();
      }
    }
  };

  const handleMinimize = async () => {
    try {
      if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().minimize();
      }
    } catch (err) {
      console.warn("Minimize error:", err);
    }
  };

  const handleSelectGame = async (gameId: TargetGameId) => {
    try {
      await safeInvoke("select_game_and_optimize", { gameId });
    } catch (err) {
      console.error("Failed to select game for optimization:", err);
    }
  };

  // Keyboard shortcut listener: Escape key closes the window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        void handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <div className="w-screen h-screen overflow-hidden bg-[#07090D] select-none flex flex-col relative border border-white/[0.12] rounded-none">
      {/* 1. TOP TITLEBAR WITH WINDOW DRAG & CONTROLS */}
      <header
        data-tauri-drag-region
        className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-[#0A0C10] flex-shrink-0 z-30"
      >
        {/* macOS Traffic Lights + App Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar ventana"
              className="group relative flex items-center justify-center w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/70 leading-none">
                ×
              </span>
            </button>
            <button
              type="button"
              onClick={handleMinimize}
              aria-label="Minimizar ventana"
              className="group relative flex items-center justify-center w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/70 leading-none -mt-0.5">
                -
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-white/[0.1]">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-black text-white tracking-tight uppercase font-sans">
                CALIBRACIÓN ADAPTATIVA POR JUEGO
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30">
                1350 × 850 INDEPENDIENTE
              </span>
            </div>
          </div>
        </div>

        {/* Center Drag Region */}
        <div data-tauri-drag-region className="flex-1 h-full mx-4" />

        {/* Right: Hardware specs badges + Close Button */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 font-mono text-[11px]">
            <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#E0E6ED] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="max-w-[150px] truncate">{hardware?.cpu || "CPU"}</span>
              <span className="text-[10px] text-cyan-400 uppercase font-sans font-bold">
                ({isAmdCpu ? "Ryzen" : isIntelCpu ? "Intel" : "CPU"})
              </span>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#E0E6ED] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="max-w-[150px] truncate">{hardware?.gpu || "GPU"}</span>
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
            onClick={handleClose}
            className="p-1.5 rounded-xl text-[#8A919E] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. MODO GENERAL QUICK STRIP BANNER */}
      <div className="px-6 py-2.5 bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-transparent border-b border-white/[0.06] flex items-center justify-between text-xs flex-shrink-0 z-20">
        <div className="flex items-center gap-2 text-cyan-200">
          <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            Pasa el cursor por encima de tu juego para enfocarlo y descubrir sus calibraciones de baja latencia.
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleSelectGame("general")}
          className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Optimizar Modo General (Todo el PC)</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3. MAIN ACCORDION STAGE: 4 STRAIGHT VERTICAL COLUMNS */}
      <div
        onMouseLeave={() => setHoveredId(null)}
        className="flex-1 min-h-0 flex flex-row w-full relative overflow-hidden select-none bg-[#040608] p-3"
      >
        <div className="w-full h-full rounded-2xl border border-white/[0.1] overflow-hidden relative shadow-2xl bg-[#030406] flex flex-row divide-x divide-white/[0.1]">
          {GAME_PANELS.map((game) => {
            const isHovered = hoveredId === game.id;
            const isAnyHovered = hoveredId !== null;

            // Straight vertical lines flex styling:
            // Idle: equal 1 flex each
            // Hover: active gets 2.5 flex (~46%), others compress smoothly to 1 (~18%)
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
                {/* Clean vertical background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${game.gradientClass} transition-opacity duration-500 ${
                    isHovered ? "opacity-100" : isAnyHovered ? "opacity-45" : "opacity-85"
                  }`}
                />

                {/* Soft radial glow in game's own accent color (no dirty black shadows) */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                  style={{
                    opacity: isHovered ? 0.85 : 0.35,
                    background: `radial-gradient(circle at 50% 30%, ${game.glowColor} 0%, transparent 70%)`,
                  }}
                />

                {/* Content layer */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between p-5 md:p-6 overflow-hidden">
                  {/* Top: Engine tag & Transparent logo */}
                  <div className="flex flex-col items-start gap-2 flex-shrink-0 z-20">
                    <div className="px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-mono font-bold tracking-widest uppercase bg-black/60 text-white/90 border border-white/15 backdrop-blur-md shadow-md">
                      {game.engineBadge}
                    </div>

                    <div className="pt-1">
                      <GameLogoHeader gameId={game.id} />
                    </div>
                  </div>

                  {/* Bottom Shadow Gradient to blend character bases */}
                  <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-10" />

                  {/* Clean Grounded Character Artwork */}
                  <div className="absolute inset-x-0 bottom-0 top-12 flex items-end justify-center pointer-events-none overflow-hidden z-10">
                    <img
                      src={game.characterImg}
                      alt={game.title}
                      className={`h-[88%] max-h-[580px] w-auto max-w-[94%] object-contain object-bottom transition-all duration-500 ease-out ${
                        isHovered ? "scale-105 -translate-y-1" : "scale-100"
                      }`}
                      style={{
                        maskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
                      }}
                    />
                  </div>

                  {/* Bottom Area: State-Dependent Details */}
                  <div className="relative z-20 flex flex-col justify-end flex-shrink-0">
                    {/* Idle card label */}
                    {!isHovered && (
                      <div className="p-3 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md space-y-0.5 transition-all">
                        <span className="text-xs font-bold text-white block truncate">
                          {game.tagline}
                        </span>
                        <span className="text-[11px] text-[#A6ADB8] flex items-center gap-1 font-semibold">
                          Pasa el ratón para enfocar <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}

                    {/* Hovered State: Glassmorphic interactive action card */}
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        className="p-4 rounded-xl bg-black/85 border border-white/20 backdrop-blur-xl shadow-2xl space-y-2.5"
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

                          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            <Sparkles className="w-3 h-3" />
                            <span>Calibrado</span>
                          </div>
                        </div>

                        {/* Exclusive Tweaks List */}
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

                        {/* Primary Optimization CTA Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleSelectGame(game.id);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl text-black font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
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

      {/* 4. BOTTOM FOOTER BAR */}
      <footer className="flex items-center justify-between px-6 py-3 border-t border-white/[0.08] bg-[#0A0C10] flex-shrink-0 z-30">
        <div className="flex items-center gap-2 text-xs text-[#8A919E]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Cada optimización crea automáticamente un Punto de Restauración del Sistema VSS y copia de seguridad del Registro.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-[#8A919E] hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            Cerrar (Esc)
          </button>

          <button
            type="button"
            onClick={() => handleSelectGame("general")}
            className="px-5 py-2 text-xs font-bold text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Optimizar Modo General (Todo el PC)</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
