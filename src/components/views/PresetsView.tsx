import React from "react";
import { Zap, ShieldCheck, Flame, Cpu, ArrowRight, CheckCircle2, Gamepad2, Sparkles, HardDrive } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { ActionButton } from "../ui/ActionButton";
import { PresetType, HardwareProfile } from "../../types";

interface PresetsViewProps {
  onSelectPreset: (preset: PresetType) => void;
  onOpenGameSelector?: () => void;
  isRunning?: boolean;
  activePlanId?: PresetType | null;
  activePlanTitle?: string;
  hardware?: HardwareProfile | null;
}

export const PresetsView: React.FC<PresetsViewProps> = ({
  onSelectPreset,
  onOpenGameSelector,
  isRunning = false,
  activePlanId,
  activePlanTitle,
  hardware,
}) => {
  const isAmdCpu = hardware?.cpu.toLowerCase().includes("amd") || hardware?.cpu.toLowerCase().includes("ryzen");
  const isIntelCpu = hardware?.cpu.toLowerCase().includes("intel") || hardware?.cpu.toLowerCase().includes("core");
  const isNvidiaGpu = hardware?.gpu.toLowerCase().includes("nvidia") || hardware?.gpu.toLowerCase().includes("geforce") || hardware?.gpu.toLowerCase().includes("rtx");
  const ramGb = hardware?.ram_mb ? Math.round(hardware.ram_mb / 1024) : 16;

  return (
    <div className="space-y-6">
      {/* HERO UNIFICADO: CENTRO DE OPTIMIZACIÓN ADAPTATIVO */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#0F141C] via-[#0A0D12] to-[#07090C] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.06] border border-white/[0.1] text-white">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Optimización Inteligente por Hardware y Juego</span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Centro de Optimización de Sistema y Juegos
            </h2>

            <p className="text-xs text-[#959DAA] leading-relaxed">
              Detecta automáticamente las especificaciones de tu CPU, tarjeta gráfica y memoria RAM. Calibra de forma personalizada el sistema para **FiveM**, **Fortnite**, **Valorant**, **CS2** o **Modo General**.
            </p>

            {/* Hardware Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.08] text-[#D4DAE2] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>{hardware?.cpu || "CPU"}</span>
                <span className="text-[10px] text-cyan-400/90 font-sans uppercase">
                  ({isAmdCpu ? "Ryzen Zen" : isIntelCpu ? "Intel" : "CPU"})
                </span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.08] text-[#D4DAE2] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{hardware?.gpu || "GPU Dedicada"}</span>
                <span className="text-[10px] text-emerald-400/90 font-sans uppercase">
                  ({isNvidiaGpu ? "NVIDIA" : "GPU"})
                </span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.08] text-[#D4DAE2] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span>{ramGb} GB RAM</span>
                {ramGb >= 16 && (
                  <span className="text-[10px] text-purple-400 font-sans">
                    (Compresión Off)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="w-full lg:w-auto flex-shrink-0 flex flex-col items-stretch gap-2.5">
            <button
              type="button"
              disabled={isRunning}
              onClick={() => onOpenGameSelector ? onOpenGameSelector() : onSelectPreset("ultra")}
              className="px-6 py-4 rounded-xl text-sm font-extrabold text-black bg-white hover:bg-white/95 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.45)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Gamepad2 className="w-5 h-5 text-black" />
              <span>Optimizar Sistema y Juegos</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            {activePlanTitle && (
              <div className="text-center text-[11px] font-mono text-emerald-400/90 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Activo: {activePlanTitle}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PLANES COMPACTADOS DE BASE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* PLAN LITE */}
        <GlassCard className={`p-5 flex flex-col justify-between h-full relative overflow-hidden group transition-all ${
          activePlanId === "lite" ? "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.12)] bg-[#0C1210]" : ""
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08]">
                <ShieldCheck className="w-5 h-5 text-white/90" />
              </div>
              {activePlanId === "lite" ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ACTIVO</span>
                </div>
              ) : (
                <Badge level="Seguro" />
              )}
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Plan Lite
                </h3>
                <span className="text-[11px] font-mono text-[#828792]">Esencial</span>
              </div>
              <p className="text-xs text-[#828792] leading-relaxed">
                Ajustes seguros y no invasivos para equipos de uso mixto. Mejora la respuesta sin modificar componentes sensibles.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
              <ul className="space-y-1.5 text-[#9CA3AF]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                  <span>GameDVR y capturas Xbox desactivadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                  <span>Vaciado de caché DNS del sistema</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                  <span>Compactación de RAM Working Set</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-5 space-y-2">
            <ActionButton
              variant={activePlanId === "lite" ? "primary" : "secondary"}
              size="md"
              disabled={isRunning}
              onClick={() => onSelectPreset("lite")}
              icon={<ArrowRight className="w-3.5 h-3.5 text-white/70" />}
              className="w-full"
            >
              {activePlanId === "lite" ? "Plan Activo (Reaplicar)" : "Aplicar Plan Lite"}
            </ActionButton>
          </div>
        </GlassCard>

        {/* PLAN PREMIUM */}
        <GlassCard className={`p-5 flex flex-col justify-between h-full relative overflow-hidden group border-white/[0.12] bg-[#0E1013]/90 transition-all ${
          activePlanId === "premium" ? "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.12)] bg-[#0C1210]" : ""
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-white/[0.06] text-white border border-white/[0.12]">
                <Zap className="w-5 h-5 text-white" />
              </div>
              {activePlanId === "premium" ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ACTIVO</span>
                </div>
              ) : (
                <Badge level="Gaming" />
              )}
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Plan Premium
                </h3>
                <span className="text-[11px] font-mono text-white/70">Competitivo</span>
              </div>
              <p className="text-xs text-[#828792] leading-relaxed">
                Máxima estabilidad de FPS y frametime. Optimiza hilos multimedia, reserva de red QoS y pila TCP.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
              <ul className="space-y-1.5 text-[#9CA3AF]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span>Plan de energía Ultimate Performance</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span>MMCSS y GPU Priority a 8</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span>TCPNoDelay y reserva de ancho de banda QoS 0%</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-5 space-y-2">
            <ActionButton
              variant="primary"
              size="md"
              disabled={isRunning}
              onClick={() => onSelectPreset("premium")}
              icon={<Zap className="w-3.5 h-3.5 fill-[#0A0C0E] text-[#0A0C0E]" />}
              className="w-full"
            >
              {activePlanId === "premium" ? "Plan Activo (Reaplicar)" : "Aplicar Plan Premium"}
            </ActionButton>
          </div>
        </GlassCard>

        {/* PLAN ULTRA */}
        <GlassCard className={`p-5 flex flex-col justify-between h-full relative overflow-hidden group border-white/[0.14] bg-[#0A0C0E] transition-all ${
          activePlanId === "ultra" ? "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-[#0C1210]" : ""
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-white/[0.08] text-white border border-white/[0.16]">
                <Flame className="w-5 h-5 text-white" />
              </div>
              {activePlanId === "ultra" ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ACTIVO</span>
                </div>
              ) : (
                <Badge level="Extremo" />
              )}
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Plan Ultra
                </h3>
                <span className="text-[11px] font-mono text-white">eSports & Juegos</span>
              </div>
              <p className="text-xs text-[#828792] leading-relaxed">
                Optimizaciones de kernel, desaparcado total de núcleos, desactivación de compresión de RAM y prioridades de juego.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
              <ul className="space-y-1.5 text-[#9CA3AF]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span className="text-white font-medium">HPET, bcdedit y Win32PrioritySeparation = 38</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span className="text-white font-medium">Prioridades IFEO por juego (FiveM, Fortnite, etc.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span>Compresión de RAM desactivada (MMAgent)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-5 space-y-2">
            <ActionButton
              variant="primary"
              size="md"
              disabled={isRunning}
              onClick={() => onOpenGameSelector ? onOpenGameSelector() : onSelectPreset("ultra")}
              icon={<Flame className="w-3.5 h-3.5 fill-[#0A0C0E] text-[#0A0C0E]" />}
              className="w-full bg-white hover:bg-white/90 text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              {activePlanId === "ultra" ? "Personalizar Juegos" : "Calibrar con Juegos"}
            </ActionButton>
          </div>
        </GlassCard>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs text-[#828792]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Cada ejecución crea automáticamente un Punto de Restauración del Sistema (VSS) y un respaldo completo del Registro (.reg) para máxima seguridad y reversibilidad.
          </span>
        </div>
      </div>
    </div>
  );
};
