import React from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  HardDrive,
  Zap,
  Terminal,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { ActionButton } from "../ui/ActionButton";
import { SystemMetrics, LogEntry } from "../../types";

interface DashboardViewProps {
  metrics: SystemMetrics | null;
  logs: LogEntry[];
  onApplyGodMode: () => void;
  isApplyingGodMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  logs,
  onApplyGodMode,
  isApplyingGodMode,
}) => {
  const cpuVal = metrics ? Math.round(metrics.cpu_usage) : 0;
  const ramPercent = metrics ? Math.round(metrics.ram_usage_percent) : 0;
  const ramUsedGb = metrics ? (metrics.ram_used_mb / 1024).toFixed(1) : "0.0";
  const ramTotalGb = metrics ? (metrics.ram_total_mb / 1024).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Hero 1-Click God Mode Banner (Raycast / Linear Style) */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-[#0E1013] border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        {/* Crisp top specular hairline */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.04] text-[#9CA3AF] border border-white/[0.08]">
              <Zap className="w-3 h-3 text-white/70" />
              <span>Perfil eSports Unificado</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Activar God Mode
            </h1>
            <p className="text-xs text-[#828792] leading-relaxed">
              Crea un punto de restauración automático de seguridad, optimiza el temporizador TSC del CPU (bcdedit), inyecta el plan de máximo rendimiento y activa el algoritmo Nagle en la pila TCP/IP.
            </p>
          </div>

          <ActionButton
            variant="primary"
            size="md"
            onClick={onApplyGodMode}
            loading={isApplyingGodMode}
            icon={<Zap className="w-3.5 h-3.5 fill-[#0A0C0E] text-[#0A0C0E]" />}
            className="flex-shrink-0"
          >
            Optimizar Todo en 1 Clic
          </ActionButton>
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
