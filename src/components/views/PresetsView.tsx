import React from "react";
import { Zap, ShieldCheck, Flame, Cpu, ArrowRight } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { ActionButton } from "../ui/ActionButton";
import { PresetType } from "../../types";

interface PresetsViewProps {
  onSelectPreset: (preset: PresetType) => void;
  isRunning?: boolean;
}

export const PresetsView: React.FC<PresetsViewProps> = ({
  onSelectPreset,
  isRunning = false,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Planes de Optimización
        </h2>
        <p className="text-sm text-[#717680]">
          Perfiles calibrados para diferentes exigencias de hardware y estilo de juego. Cada perfil incluye un punto de restauración automático previo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* PLAN LITE */}
        <GlassCard className="p-5 flex flex-col justify-between h-full relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08]">
                <ShieldCheck className="w-5 h-5 text-white/90" />
              </div>
              <Badge level="Seguro" />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Plan Lite
                </h3>
                <span className="text-[11px] font-mono text-[#828792]">Esencial</span>
              </div>
              <p className="text-xs text-[#828792] leading-relaxed">
                Ajustes seguros y no invasivos para equipos de uso mixto. Mejora la respuesta general sin modificar componentes sensibles del sistema.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
              <div className="text-[11px] font-medium text-[#717680] uppercase tracking-wider">
                Ajustes incluidos
              </div>
              <ul className="space-y-2 text-[#9CA3AF]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                  <span>Desactivar GameDVR y capturas en segundo plano</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                  <span>Vaciado de caché DNS del sistema</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                  <span>Compactación de RAM Working Set</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                  <span>Desactivar telemetría diagnóstica básica</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <div className="text-[11px] text-[#717680]">
              <span className="text-white/80 font-medium">Recomendado para:</span> PCs domésticos, ofimática y juegos casuales.
            </div>
            <ActionButton
              variant="secondary"
              size="md"
              disabled={isRunning}
              onClick={() => onSelectPreset("lite")}
              icon={<ArrowRight className="w-3.5 h-3.5 text-white/70" />}
              className="w-full"
            >
              Aplicar Plan Lite
            </ActionButton>
          </div>
        </GlassCard>

        {/* PLAN PREMIUM */}
        <GlassCard className="p-5 flex flex-col justify-between h-full relative overflow-hidden group border-white/[0.12] bg-[#0E1013]/90">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.2] to-transparent pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-white/[0.06] text-white border border-white/[0.12]">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <Badge level="Gaming" />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Plan Premium
                </h3>
                <span className="text-[11px] font-mono text-white/70">Competitivo</span>
              </div>
              <p className="text-xs text-[#828792] leading-relaxed">
                Máxima estabilidad de FPS y consistencia de frametimes. Optimiza la programación de hilos multimedia y la pila TCP.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
              <div className="text-[11px] font-medium text-[#717680] uppercase tracking-wider">
                Ajustes incluidos
              </div>
              <ul className="space-y-2 text-[#9CA3AF]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span className="text-white/90">Plan de energía Ultimate Performance</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span>Afinidad MMCSS y GPU Priority a 8</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span>Desactivar algoritmo Nagle (TCPNoDelay = 1)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span>Anulación de Network Throttling</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span>Modo exclusivo FSE para juegos en pantalla completa</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <div className="text-[11px] text-[#717680]">
              <span className="text-white/80 font-medium">Recomendado para:</span> Valorant, CS2, Fortnite, Apex Legends, Warzone.
            </div>
            <ActionButton
              variant="primary"
              size="md"
              disabled={isRunning}
              onClick={() => onSelectPreset("premium")}
              icon={<Zap className="w-3.5 h-3.5 fill-[#0A0C0E] text-[#0A0C0E]" />}
              className="w-full"
            >
              Aplicar Plan Premium
            </ActionButton>
          </div>
        </GlassCard>

        {/* PLAN ULTRA */}
        <GlassCard className="p-5 flex flex-col justify-between h-full relative overflow-hidden group border-white/[0.14] bg-[#0A0C0E]">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/[0.3] to-transparent pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-white/[0.08] text-white border border-white/[0.16]">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <Badge level="Extremo" />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Plan Ultra
                </h3>
                <span className="text-[11px] font-mono text-white">eSports & FiveM</span>
              </div>
              <p className="text-xs text-[#828792] leading-relaxed">
                El ajuste definitivo para marcar un antes y un después. Inyecta optimizaciones de kernel, desaparcado total de núcleos y prioridades de proceso.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
              <div className="text-[11px] font-medium text-[#717680] uppercase tracking-wider">
                Ajustes incluidos
              </div>
              <ul className="space-y-2 text-[#9CA3AF]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span className="text-white font-medium">Desactivar HPET a nivel bootloader (bcdedit)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span className="text-white font-medium">Win32PrioritySeparation = 38 & Core Unparking</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span className="text-white font-medium">Prioridad Alta en FiveM y subprocesos (b2699..b3095)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span>Hardware Accelerated GPU Scheduling (HAGS)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span>Anulación de Power Throttling y subprocesos GameBar</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                  <span>Debloat completo: Cortana, Copilot y Telemetría</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <div className="text-[11px] text-[#717680]">
              <span className="text-white/80 font-medium">Recomendado para:</span> FiveM (GTA RP), shooters competitivos y máximo rendimiento.
            </div>
            <ActionButton
              variant="primary"
              size="md"
              disabled={isRunning}
              onClick={() => onSelectPreset("ultra")}
              icon={<Flame className="w-3.5 h-3.5 fill-[#0A0C0E] text-[#0A0C0E]" />}
              className="w-full bg-white hover:bg-white/90 text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              Aplicar Plan Ultra
            </ActionButton>
          </div>
        </GlassCard>
      </div>

      {/* Notice */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs text-[#828792]">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-white/70 flex-shrink-0" />
          <span>
            Cada plan genera automáticamente su Punto de Restauración del Sistema (VSS) y copia del registro. La purga de caché permanece exclusivamente bajo demanda en la pestaña FiveM.
          </span>
        </div>
      </div>
    </div>
  );
};
