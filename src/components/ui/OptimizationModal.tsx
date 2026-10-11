import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Zap,
} from "lucide-react";
import { ActionButton } from "./ActionButton";

export interface ModalStep {
  label: string;
  status: "pending" | "running" | "completed" | "error";
}

interface OptimizationModalProps {
  isOpen: boolean;
  phase: "confirm" | "running" | "completed";
  planTitle?: string;
  currentStepIndex: number;
  steps: ModalStep[];
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export const OptimizationModal: React.FC<OptimizationModalProps> = ({
  isOpen,
  phase,
  planTitle = "g0d Mode eSports",
  currentStepIndex,
  steps,
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 
    ? Math.min(100, Math.round(((currentStepIndex + 1) / totalSteps) * 100))
    : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#0D0F12] border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6"
        >
          {/* Subtle top specular line */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.16] to-transparent pointer-events-none" />

          {/* Phase 1: Confirmation */}
          {phase === "confirm" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/[0.04] text-white border border-white/[0.08]">
                  <ShieldCheck className="w-5 h-5 text-white/90" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white tracking-tight">
                    Confirmar Optimización
                  </h2>
                  <p className="text-xs text-[#828792]">
                    Seleccionado: <span className="text-white font-medium">{planTitle}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5 text-xs text-[#9CA3AF]">
                <div className="flex items-start gap-2 text-[#E1E4EA]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>
                    Se creará un <strong>Punto de Restauración del Sistema (VSS)</strong> de forma obligatoria antes de iniciar.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-[#E1E4EA]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>
                    Se generará una copia de seguridad del registro (.reg) en tu carpeta local.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-[#E1E4EA]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>
                    Todas las optimizaciones son reversibles en cualquier momento.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
                <ActionButton variant="ghost" size="sm" onClick={onCancel}>
                  Cancelar
                </ActionButton>
                <ActionButton
                  variant="primary"
                  size="md"
                  onClick={onConfirm}
                  icon={<Zap className="w-3.5 h-3.5 fill-[#0A0C0E] text-[#0A0C0E]" />}
                >
                  Confirmar y Optimizar
                </ActionButton>
              </div>
            </div>
          )}

          {/* Phase 2: Running Progress Screen */}
          {phase === "running" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] text-white border border-white/[0.08]">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight">
                      Optimizando Sistema...
                    </h2>
                    <p className="text-xs text-[#828792]">
                      Por favor espera, no cierres esta ventana.
                    </p>
                  </div>
                </div>
                <span className="font-mono text-sm text-white font-medium">
                  {progressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Step Checklist */}
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                {steps.map((s, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      idx === currentStepIndex
                        ? "bg-white/[0.05] border-white/[0.14] text-white"
                        : s.status === "completed"
                        ? "bg-white/[0.02] border-white/[0.04] text-[#A0A6B2]"
                        : "opacity-40 border-transparent text-[#70757E]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {s.status === "completed" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : idx === currentStepIndex ? (
                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" />
                      )}
                      <span className="truncate">{s.label}</span>
                    </div>

                    <span className="text-[10px] uppercase font-sans">
                      {s.status === "completed"
                        ? "Listo"
                        : idx === currentStepIndex
                        ? "En curso"
                        : "Pendiente"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase 3: Completed */}
          {phase === "completed" && (
            <div className="space-y-5 text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  ¡Optimización Completada con Éxito!
                </h2>
                <p className="text-xs text-[#828792] max-w-sm mx-auto leading-relaxed">
                  Se ha generado el punto de restauración y se aplicaron todas las optimizaciones de {planTitle}.
                </p>
              </div>

              <div className="pt-2">
                <ActionButton
                  variant="primary"
                  size="md"
                  onClick={onClose}
                  className="w-full"
                >
                  Entendido y Finalizar
                </ActionButton>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
