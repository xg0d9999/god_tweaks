import React, { useState } from "react";
import {
  Shield,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RefreshCw,
  FolderOpen,
  History,
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { ActionButton } from "../ui/ActionButton";
import { BackupItem, RestorePointItem } from "../../types";

interface BackupViewProps {
  onCreateRestorePoint: () => void;
  onExportRegistry: () => void;
  backups: BackupItem[];
  restorePoints: RestorePointItem[];
  onDeleteBackup: (filename: string) => void;
  onDeleteAllBackups: () => void;
  onDeleteRestorePoint: (id: string) => void;
  onRefreshBackups: () => void;
  loadingKeys: Record<string, boolean>;
  lastBackupMsg?: string;
}

export const BackupView: React.FC<BackupViewProps> = ({
  onCreateRestorePoint,
  onExportRegistry,
  backups,
  restorePoints,
  onDeleteBackup,
  onDeleteAllBackups,
  onDeleteRestorePoint,
  onRefreshBackups,
  loadingKeys,
  lastBackupMsg,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<"restorePoints" | "registry">("restorePoints");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Seguridad, Respaldo & Restauración
        </h2>
        <p className="text-sm text-[#717680]">
          Mecanismos de protección obligatorios antes de realizar cualquier ajuste masivo en Windows. Puedes revertir en cualquier momento al estado anterior.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Windows Restore Point */}
        <GlassCard className="p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08]">
                <Shield className="w-4 h-4" />
              </div>
              <Badge level="Seguro" />
            </div>

            <h3 className="text-sm font-semibold text-white tracking-tight mb-1.5">
              Punto de Restauración del Sistema (VSS)
            </h3>
            <p className="text-xs text-[#828792] leading-relaxed mb-4">
              Invoca el cmdlet <code className="font-mono text-[11px] text-white/90 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">Checkpoint-Computer</code> a través del servicio Volume Shadow Copy de Windows. Crea una instantánea íntegra del estado de arranque y los controladores.
            </p>
          </div>

          <ActionButton
            variant="primary"
            size="md"
            loading={loadingKeys["restorePoint"]}
            onClick={onCreateRestorePoint}
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-black" />}
            className="w-full"
          >
            Crear Punto de Restauración
          </ActionButton>
        </GlassCard>

        {/* Registry Backup */}
        <GlassCard className="p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08]">
                <FileArchive className="w-4 h-4" />
              </div>
              <Badge level="Seguro" />
            </div>

            <h3 className="text-sm font-semibold text-white tracking-tight mb-1.5">
              Exportar Copia de Seguridad del Registro (.reg)
            </h3>
            <p className="text-xs text-[#828792] leading-relaxed mb-4">
              Exporta una instantánea de las ramas <code className="font-mono text-[11px] text-white/90 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">SystemProfile</code> y <code className="font-mono text-[11px] text-white/90 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">GameConfigStore</code> en un archivo .reg con marca de tiempo en tu carpeta local para reversión inmediata con 2 clics.
            </p>
          </div>

          <ActionButton
            variant="secondary"
            size="md"
            loading={loadingKeys["registryBackup"]}
            onClick={onExportRegistry}
            icon={<FileArchive className="w-3.5 h-3.5 text-white/70" />}
            className="w-full"
          >
            Exportar Registro (.reg)
          </ActionButton>
        </GlassCard>
      </div>

      {lastBackupMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{lastBackupMsg}</span>
        </div>
      )}

      {/* Tabs Selector for Stored Backups */}
      <GlassCard className="p-5" hoverEffect={false}>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
          {/* Subtabs Pill Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <button
              onClick={() => setSelectedSubTab("restorePoints")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSubTab === "restorePoints"
                  ? "bg-white/[0.1] text-white border border-white/[0.12] shadow-sm"
                  : "text-[#828792] hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Puntos de Restauración VSS ({restorePoints.length})</span>
            </button>
            <button
              onClick={() => setSelectedSubTab("registry")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSubTab === "registry"
                  ? "bg-white/[0.1] text-white border border-white/[0.12] shadow-sm"
                  : "text-[#828792] hover:text-white"
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Copias del Registro ({backups.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshBackups}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#828792] hover:text-white transition-colors cursor-pointer"
              title="Actualizar lista"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {selectedSubTab === "registry" && backups.length > 0 && (
              <button
                onClick={onDeleteAllBackups}
                disabled={loadingKeys["delete_all_backups"]}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-medium border border-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                <span>Borrar Todas</span>
              </button>
            )}
          </div>
        </div>

        {/* Restore Points Subtab View */}
        {selectedSubTab === "restorePoints" && (
          <div>
            {restorePoints.length === 0 ? (
              <div className="py-8 text-center text-[#717680] text-xs">
                No hay puntos de restauración registrados todavía. Se registrarán automáticamente al pulsar "Crear Punto de Restauración" o al aplicar cualquier plan.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {restorePoints.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/[0.04] text-emerald-400 border border-white/[0.06]">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white/95">
                          {item.description}
                        </div>
                        <div className="text-[10px] font-mono text-[#717680] flex items-center gap-2 mt-0.5">
                          <span className="text-emerald-400/90 font-medium">{item.status}</span>
                          <span>•</span>
                          <span>{item.created_at}</span>
                          {item.sequence_number && (
                            <>
                              <span>•</span>
                              <span>Seq: #{item.sequence_number}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteRestorePoint(item.id)}
                      className="p-1.5 rounded-lg bg-transparent hover:bg-rose-500/20 text-[#717680] hover:text-rose-300 transition-colors cursor-pointer"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Registry Backups Subtab View */}
        {selectedSubTab === "registry" && (
          <div>
            {backups.length === 0 ? (
              <div className="py-8 text-center text-[#717680] text-xs">
                No hay copias de seguridad de registro guardadas aún. Se generarán automáticamente al ejecutar optimizaciones o al pulsar "Exportar Registro".
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {backups.map((item) => (
                  <div
                    key={item.filename}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/[0.04] text-white/70 border border-white/[0.06]">
                        <FileArchive className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-white/90">
                          {item.filename}
                        </div>
                        <div className="text-[10px] font-mono text-[#717680] flex items-center gap-2">
                          <span>{item.size_kb} KB</span>
                          <span>•</span>
                          <span>{item.created_at}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteBackup(item.filename)}
                      className="p-1.5 rounded-lg bg-transparent hover:bg-rose-500/20 text-[#717680] hover:text-rose-300 transition-colors cursor-pointer"
                      title="Eliminar esta copia de seguridad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-[#717680] space-y-1">
          <p className="font-medium text-amber-300/90">
            Recomendación de arquitectura g0d tweaks
          </p>
          <p>
            El modo "1-Click God Mode" y los planes de optimización ejecutan de forma automática la creación del punto de restauración y el respaldo del registro antes de aplicar cualquier optimización de kernel o red.
          </p>
        </div>
      </div>
    </div>
  );
};
