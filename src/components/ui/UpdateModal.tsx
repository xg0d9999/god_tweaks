import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DownloadCloud,
  Sparkles,
  Loader2,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { ActionButton } from "./ActionButton";
import { UpdateInfo, installAppUpdate } from "../../services/updater";

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  onSuccessToast?: (msg: string) => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ downloaded: number; total: number | null }>({
    downloaded: 0,
    total: null,
  });

  if (!isOpen || !updateInfo) return null;

  const handleStartUpdate = async () => {
    if (!updateInfo.updateObj) return;

    setIsUpdating(true);
    try {
      await installAppUpdate(
        updateInfo.updateObj,
        (downloaded, total) => {
          setDownloadProgress({ downloaded, total });
        }
      );
    } catch (err) {
      console.error("Update install failed:", err);
      setIsUpdating(false);
    }
  };

  const percent = downloadProgress.total && downloadProgress.total > 0
    ? Math.min(100, Math.round((downloadProgress.downloaded / downloadProgress.total) * 100))
    : null;

  const downloadedMb = (downloadProgress.downloaded / (1024 * 1024)).toFixed(1);
  const totalMb = downloadProgress.total
    ? (downloadProgress.total / (1024 * 1024)).toFixed(1)
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0D0F12] border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 space-y-4"
        >
          {/* Top specular hairline */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.2] to-transparent pointer-events-none" />

          {/* Close button (only when not downloading) */}
          {!isUpdating && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-[#828792] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/[0.06] text-white border border-white/[0.1]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Actualización Disponible
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono text-[#828792] mt-0.5">
                <span>v{updateInfo.currentVersion}</span>
                <ArrowRight className="w-3 h-3 text-[#717680]" />
                <span className="text-emerald-400 font-medium">v{updateInfo.version || "1.0.1"}</span>
              </div>
            </div>
          </div>

          {/* Release Notes */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium text-[#717680] uppercase tracking-wider">
              Novedades de la versión
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-[#9CA3AF] max-h-36 overflow-y-auto space-y-1 font-mono leading-relaxed">
              {updateInfo.body ? (
                <div className="whitespace-pre-wrap">{updateInfo.body}</div>
              ) : (
                <ul className="space-y-1 list-disc list-inside">
                  <li>Nuevas optimizaciones de latencia y reducción de input lag.</li>
                  <li>Mejoras en el motor de lectura de logs de FiveM.</li>
                  <li>Correcciones de estabilidad y rendimiento en Windows 11/10.</li>
                </ul>
              )}
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-[#828792]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Paquete firmado criptográficamente con verificación SHA-256.</span>
          </div>

          {/* Downloading Progress Screen */}
          {isUpdating ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-medium flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Descargando e instalando...
                </span>
                <span className="font-mono text-[#828792]">
                  {percent !== null ? `${percent}%` : `${downloadedMb} MB`}
                  {totalMb ? ` / ${totalMb} MB` : ""}
                </span>
              </div>

              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: percent !== null ? `${percent}%` : "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <p className="text-[10px] text-center text-[#717680]">
                La aplicación se reiniciará automáticamente al terminar la descarga.
              </p>
            </div>
          ) : (
            /* Action Buttons */
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
              <ActionButton variant="ghost" size="sm" onClick={onClose}>
                Recordar más tarde
              </ActionButton>
              <ActionButton
                variant="primary"
                size="md"
                onClick={handleStartUpdate}
                icon={<DownloadCloud className="w-3.5 h-3.5 text-black" />}
              >
                Actualizar Ahora
              </ActionButton>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
