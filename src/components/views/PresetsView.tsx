import { Zap, ShieldCheck, Flame, Cpu, ArrowRight, CheckCircle2, Gamepad2, HardDrive, RotateCcw } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { ActionButton } from "../ui/ActionButton";
import { PresetType, HardwareProfile, TargetGameId } from "../../types";

interface PresetsViewProps {
  onSelectPreset: (preset: PresetType) => void;
  onOpenGameSelector?: () => void;
  onRevertToDefaults?: () => void;
  isRunning?: boolean;
  activePlanId?: PresetType | null;
  activePlanTitle?: string;
  activeTargetGame?: TargetGameId | null;
  hardware?: HardwareProfile | null;
}

export const PresetsView: React.FC<PresetsViewProps> = ({
  onSelectPreset,
  onOpenGameSelector,
  onRevertToDefaults,
  isRunning = false,
  activePlanId,
  activePlanTitle,
  activeTargetGame,
  hardware,
}) => {
  const ramGb = hardware?.ram_mb ? Math.round(hardware.ram_mb / 1024) : 16;
  const isGameActive = Boolean(activeTargetGame);

  return (
    <div className="space-y-6">
      {/* HERO UNIFICADO: CENTRO DE OPTIMIZACIÓN ADAPTATIVO */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E1013]/60 shadow-[0_4px_30px_rgba(0,0,0,0.6)] p-6">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Optimización de Juegos
            </h2>
            <p className="text-xs text-[#828792]">
              Calibración adaptativa por juego. Para optimizar el PC completo, selecciona uno de los planes inferiores.
            </p>

            {/* Hardware Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 font-mono text-[11px]">
              <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.08] text-[#D4DAE2] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-white/70" />
                <span>{hardware?.cpu || "CPU"}</span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.08] text-[#D4DAE2] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{hardware?.gpu || "GPU"}</span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.08] text-[#D4DAE2] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-white/70" />
                <span>{ramGb} GB RAM</span>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="w-full lg:w-auto flex-shrink-0 flex flex-col items-stretch gap-2.5">
            <button
              type="button"
              disabled={isRunning}
              onClick={() => onOpenGameSelector ? onOpenGameSelector() : onSelectPreset("ultra")}
              className={`px-6 py-4 rounded-xl text-sm font-extrabold transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 ${
                isGameActive
                  ? "bg-white hover:bg-white/95 text-black shadow-lg"
                  : "bg-white hover:bg-white/95 text-black shadow-lg"
              }`}
            >
              <Gamepad2 className="w-5 h-5 text-black" />
              <span>{isGameActive ? `Reaplicar Boost Pre-Juego (${activeTargetGame?.toUpperCase()})` : "Optimizar Juegos"}</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            {activePlanTitle ? (
              <div className="flex items-center justify-center gap-2.5 text-[11px] font-mono">
                <div className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white font-medium flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Activo: {activePlanTitle}</span>
                </div>
                {onRevertToDefaults && (
                  <button
                    type="button"
                    onClick={onRevertToDefaults}
                    disabled={isRunning}
                    className="text-[#9CA3AF] hover:text-white underline underline-offset-2 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    title="Revertir cambios y restaurar valores predeterminados"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Revertir</span>
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* PLANES COMPACTADOS DE BASE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* PLAN LITE */}
        <GlassCard className={`p-5 flex flex-col justify-between h-full relative overflow-hidden group transition-all ${
          activePlanId === "lite"
            ? "border-emerald-500/70 shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/50 bg-[#0A1411]"
            : ""
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
              {activePlanId === "lite" ? "Reaplicar Mantenimiento" : "Aplicar Plan Lite"}
            </ActionButton>
          </div>
        </GlassCard>

        {/* PLAN PREMIUM */}
        <GlassCard className={`p-5 flex flex-col justify-between h-full relative overflow-hidden group border-white/[0.12] bg-[#0E1013]/90 transition-all ${
          activePlanId === "premium"
            ? "border-cyan-500/70 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50 bg-[#081216]"
            : ""
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-white/[0.06] text-white border border-white/[0.12]">
                <Zap className="w-5 h-5 text-white" />
              </div>
              {activePlanId === "premium" ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
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
              {activePlanId === "premium" ? "Reaplicar Boost Pre-Sesión" : "Aplicar Plan Premium"}
            </ActionButton>
          </div>
        </GlassCard>

        {/* PLAN ULTRA */}
        <GlassCard className={`p-5 flex flex-col justify-between h-full relative overflow-hidden group border-white/[0.14] bg-[#0A0C0E] transition-all ${
          activePlanId === "ultra"
            ? "border-amber-500/70 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50 bg-[#140F0A]"
            : ""
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-white/[0.08] text-white border border-white/[0.16]">
                <Flame className="w-5 h-5 text-white" />
              </div>
              {activePlanId === "ultra" ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
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
              onClick={() => onSelectPreset("ultra")}
              icon={<Flame className="w-3.5 h-3.5 fill-[#0A0C0E] text-[#0A0C0E]" />}
              className="w-full bg-white hover:bg-white/90 text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              {activePlanId === "ultra" ? "Reaplicar Boost Pre-Sesión" : "Aplicar Plan Ultra"}
            </ActionButton>
          </div>
        </GlassCard>
      </div>

      {/* RESTAURAR VALORES PREDETERMINADOS */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0A0C0E]/80 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#828792]">
            <RotateCcw className="w-4 h-4 text-white/80" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Restaurar Valores Predeterminados</span>
              {activePlanTitle && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Plan Activo
                </span>
              )}
            </h4>
            <p className="text-xs text-[#828792]">
              Revierte todos los ajustes de kernel, energía, MMCSS, GameDVR y red a la configuración de fábrica de Windows.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRevertToDefaults}
          disabled={isRunning}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-white/90 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-white/70" />
          <span>Revertir Cambios y Predeterminar</span>
        </button>
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
