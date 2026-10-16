import React from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  HardDrive,
  Terminal,
  Activity,
  CheckCircle2,
  Layers,
  ArrowRight,
  Lock,
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { ActionButton } from "../ui/ActionButton";
import { SystemMetrics, LogEntry, ActivePlanData } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface DashboardViewProps {
  metrics: SystemMetrics | null;
  logs: LogEntry[];
  activePlan: ActivePlanData | null;
  onNavigateToPresets: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  logs,
  activePlan,
  onNavigateToPresets,
}) => {
  const { userRecord } = useAuth();
  const tweaksBlocked = userRecord?.can_use_tweaks !== true;

  const cpuVal = metrics ? Math.round(metrics.cpu_usage) : 0;
  const ramPercent = metrics ? Math.round(metrics.ram_usage_percent) : 0;
  const ramUsedGb = metrics ? (metrics.ram_used_mb / 1024).toFixed(1) : "0.0";
  const ramTotalGb = metrics ? (metrics.ram_total_mb / 1024).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Hero Active Plan Status Banner (Raycast / Linear Style) */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-[#0E1013] border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        {/* Crisp top specular hairline */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            {tweaksBlocked ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/25">
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span>MÓDULO DE TWEAKS RESTRINGIDO</span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-white">
                  Optimizaciones Deshabilitadas
                </h1>
                <p className="text-xs text-[#828792] leading-relaxed">
                  Tu cuenta tiene restringido temporalmente el acceso a los planes de optimización del kernel por parte de la administración.
                </p>
              </>
            ) : activePlan ? (
              <>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>PLAN ACTIVO EN EL SISTEMA</span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                  {activePlan.title}
                </h1>
                <p className="text-xs text-[#828792] leading-relaxed">
                  {activePlan.id === "ultra"
                    ? "Perfil Ultra eSports activo en el kernel (HPET desactivado, TSC dinámico optimizado, Win32PrioritySeparation 38, prioridad FiveM y debloat completo)."
                    : activePlan.id === "premium"
                    ? "Perfil Premium Competitivo activo (Esquema Ultimate Performance inyectado, afinidad MMCSS, Nagle desactivado y QoS de red optimizado)."
                    : "Perfil Lite Esencial activo (GameDVR desactivado, DNS del sistema purgado y compactación de memoria RAM aplicada)."}
                </p>
                <div className="text-[11px] font-mono text-[#717680] pt-0.5">
                  Aplicado el {activePlan.appliedAt}
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.04] text-[#9CA3AF] border border-white/[0.08]">
                  <Layers className="w-3 h-3 text-white/70" />
                  <span>Sin Plan Asignado</span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-white">
                  Ningún Plan de Optimización Activo
                </h1>
                <p className="text-xs text-[#828792] leading-relaxed">
                  Para mejorar los FPS, reducir latencia de entrada y acelerar los tiempos de carga en FiveM y otros juegos competitivos, selecciona un plan en su apartado correspondiente.
                </p>
              </>
            )}
          </div>

          <div className="flex-shrink-0">
            {tweaksBlocked ? (
              <ActionButton
                variant="secondary"
                size="md"
                onClick={onNavigateToPresets}
                icon={<Lock className="w-3.5 h-3.5 text-rose-400" />}
              >
                Optimizaciones Bloqueadas
              </ActionButton>
            ) : activePlan ? (
              <ActionButton
                variant="secondary"
                size="md"
                onClick={onNavigateToPresets}
                icon={<Layers className="w-3.5 h-3.5 text-white/70" />}
              >
                Cambiar o Reaplicar Plan
              </ActionButton>
            ) : (
              <ActionButton
                variant="primary"
                size="md"
                onClick={onNavigateToPresets}
                icon={<ArrowRight className="w-3.5 h-3.5 text-black" />}
              >
                Ver Planes de Optimización
              </ActionButton>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry live cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU Telemetry Card */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-tight">
                  Procesador (CPU)
                </h3>
                <p className="text-[11px] text-[#717680] truncate max-w-[220px]">
                  {metrics?.cpu_brand || "Cargando hardware..."}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono font-bold tracking-tight text-white">
                {cpuVal}%
              </span>
              <p className="text-[10px] text-[#717680] font-mono">
                {metrics?.cpu_cores || 0} núcleos
              </p>
            </div>
          </div>

          <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${cpuVal}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>
        </GlassCard>

        {/* RAM Telemetry Card */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08]">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-tight">
                  Memoria RAM
                </h3>
                <p className="text-[11px] text-[#717680]">
                  {ramUsedGb} GB de {ramTotalGb} GB
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono font-bold tracking-tight text-white">
                {ramPercent}%
              </span>
              <p className="text-[10px] text-[#717680] font-mono">
                Working Set activo
              </p>
            </div>
          </div>

          <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${ramPercent}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>
        </GlassCard>
      </div>

      {/* Terminal logs feed */}
      <GlassCard className="p-5" hoverEffect={false}>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-white/90">
            <Terminal className="w-3.5 h-3.5 text-white/70" />
            <span>Registro de Operaciones del Kernel Win32</span>
          </div>
          <span className="text-[10px] text-[#717680] font-mono">
            Modo Silencioso / Elevated UAC
          </span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-2 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="py-6 text-center text-[#717680] text-xs font-sans">
              Listo para ejecutar optimizaciones en tiempo real.
            </div>
          ) : (
            logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
              >
                <span className="text-[#61656E] text-[10px] mt-0.5 whitespace-nowrap">
                  {log.timestamp}
                </span>
                {log.type === "success" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                )}
                {log.type === "info" && (
                  <Activity className="w-3.5 h-3.5 text-white/60 mt-0.5 flex-shrink-0" />
                )}
                <span
                  className={`${
                    log.type === "error"
                      ? "text-rose-400"
                      : log.type === "warning"
                      ? "text-amber-300"
                      : log.type === "success"
                      ? "text-emerald-300"
                      : "text-[#DCDCDC]"
                  } leading-relaxed text-[11px]`}
                >
                  {log.message}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};
