import React from "react";
import { Timer, Zap, Film, Cpu, HelpCircle } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { Badge } from "../ui/Badge";
import { GamingStatus } from "../../types";

interface GamingViewProps {
  status: GamingStatus;
  onToggleHpet: (disable: boolean) => void;
  onToggleUltimatePower: () => void;
  onToggleGameDvr: (disable: boolean) => void;
  onToggleMmcss: (enable: boolean) => void;
  loadingKeys: Record<string, boolean>;
}

export const GamingView: React.FC<GamingViewProps> = ({
  status,
  onToggleHpet,
  onToggleUltimatePower,
  onToggleGameDvr,
  onToggleMmcss,
  loadingKeys,
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Input Lag, Latencia & Gaming
        </h2>
        <p className="text-sm text-[#717680]">
          Ajustes directos a nivel de Kernel y Registro de Windows para reducir la latencia de entrada de ratón y estabilizar el frametime (1% lows).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {/* HPET (High Precision Event Timer) */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08] mt-0.5">
                <Timer className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Desactivar HPET (High Precision Event Timer)
                  </h3>
                  <Badge level="Extremo" />
                </div>
                <p className="text-xs text-[#717680] max-w-xl">
                  Fuerza el temporizador TSC del CPU y desactiva dynamic tick (bcdedit). Elimina micro-stutters y reduce la variabilidad del tiempo entre fotogramas.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={status.hpet_disabled}
              disabled={loadingKeys["hpet"]}
              onChange={(val) => onToggleHpet(val)}
            />
          </div>
        </GlassCard>

        {/* Plan Ultimate Performance */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08] mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Plan de Energía "Ultimate Performance"
                  </h3>
                  <Badge level="Gaming" />
                </div>
                <p className="text-xs text-[#717680] max-w-xl">
                  Desbloquea el perfil nativo de energía para Workstations en Windows (GUID e9a42b02). Evita el sub-escalado de estados C del procesador y desactiva el throttling térmico por software.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={status.ultimate_power_active}
              disabled={loadingKeys["power"]}
              onChange={() => onToggleUltimatePower()}
            />
          </div>
        </GlassCard>

        {/* GameDVR & Game Bar */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08] mt-0.5">
                <Film className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Deshabilitar GameDVR & Capturas en Segundo Plano
                  </h3>
                  <Badge level="Gaming" />
                </div>
                <p className="text-xs text-[#717680] max-w-xl">
                  Inhabilita AllowGameDVR y AppCaptureEnabled. Evita la codificación constante de vídeo en memoria intermedia que penaliza los FPS en GPU NVIDIA y AMD.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={status.gamedvr_disabled}
              disabled={loadingKeys["gamedvr"]}
              onChange={(val) => onToggleGameDvr(val)}
            />
          </div>
        </GlassCard>

        {/* MMCSS & SystemResponsiveness */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08] mt-0.5">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Prioridad MMCSS & SystemResponsiveness a 0
                  </h3>
                  <Badge level="Extremo" />
                </div>
                <p className="text-xs text-[#717680] max-w-xl">
                  Configura el programador multimedia Win32 para destinar el 100% de los ciclos de CPU y GPU al proceso de juego activo (GPU Priority = 8, Priority = 6, High SFIO).
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={status.mmcss_optimized}
              disabled={loadingKeys["mmcss"]}
              onChange={(val) => onToggleMmcss(val)}
            />
          </div>
        </GlassCard>
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5 text-xs text-[#717680]">
        <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span>
          Nota técnica: Todos los cambios modifican de forma directa el registro local de Windows. Se recomienda reiniciar el equipo tras aplicar cambios de temporizador (HPET).
        </span>
      </div>
    </div>
  );
};
