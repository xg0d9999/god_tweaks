import React from "react";
import {
  Gamepad2,
  Trash2,
  Cpu,
  Layers,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { ActionButton } from "../ui/ActionButton";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { FiveMStatus } from "../../types";

interface FiveMViewProps {
  status: FiveMStatus;
  onCleanCache: () => void;
  onTogglePriority: (enable: boolean) => void;
  loadingKeys: Record<string, boolean>;
  lastCleanResult?: string;
}

export const FiveMView: React.FC<FiveMViewProps> = ({
  status,
  onCleanCache,
  onTogglePriority,
  loadingKeys,
  lastCleanResult,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-white">
            FiveM & GTA V Roleplay
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/[0.08] text-white border border-white/10">
            ESPECIALIZADO
          </span>
        </div>
        <p className="text-sm text-[#717680]">
          Optimizaciones avanzadas para mitigar caídas de FPS, micro-stuttering y la pérdida de texturas ("Texture Loss") en servidores de Roleplay.
        </p>
      </div>

      {/* Installation Banner */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/[0.04] text-white border border-white/[0.08]">
            <Gamepad2 className="w-5 h-5 text-white/90" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white tracking-tight">
              Instalación de FiveM
            </div>
            <div className="text-[11px] text-[#828792]">
              {status.is_installed
                ? "Directorio local de FiveM.app detectado correctamente en AppData."
                : "No se detectó la carpeta predeterminada en AppData/Local/FiveM."}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              status.is_installed ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <span className="text-xs font-mono text-[#DCDCDC]">
            {status.is_installed ? "Instalado" : "No detectado"}
          </span>
        </div>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FiveM Cache Purge */}
        <GlassCard className="p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08]">
                <Trash2 className="w-4 h-4" />
              </div>
              <Badge level="Gaming" />
            </div>

            <h3 className="text-sm font-semibold text-white tracking-tight mb-1.5">
              Purga de Caché de Servidores & NUI
            </h3>
            <p className="text-xs text-[#828792] leading-relaxed mb-4">
              Elimina de forma selectiva <code className="font-mono text-[11px] text-white/90 bg-white/[0.05] px-1 py-0.5 rounded">server-cache</code>, <code className="font-mono text-[11px] text-white/90 bg-white/[0.05] px-1 py-0.5 rounded">server-cache-priv</code> y <code className="font-mono text-[11px] text-white/90 bg-white/[0.05] px-1 py-0.5 rounded">nui-storage</code> sin borrar tus credenciales ni configuraciones gráficas. Resuelve crasheos al entrar a servidores y texturas corruptas.
            </p>
          </div>

          <ActionButton
            variant="primary"
            size="md"
            loading={loadingKeys["fivem_clean"]}
            onClick={onCleanCache}
            icon={<Sparkles className="w-3.5 h-3.5 text-black" />}
            className="w-full"
          >
            Purgar Cachés de FiveM
          </ActionButton>
        </GlassCard>

        {/* High CPU & I/O Priority */}
        <GlassCard className="p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08]">
                <Cpu className="w-4 h-4" />
              </div>
              <Badge level="Extremo" />
            </div>

            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Prioridad Alta de CPU e E/S
              </h3>
              <ToggleSwitch
                checked={status.priority_active}
                onChange={onTogglePriority}
                disabled={loadingKeys["fivem_priority"]}
              />
            </div>

            <p className="text-xs text-[#828792] leading-relaxed">
              Inyecta en <code className="font-mono text-[11px] text-white/90 bg-white/[0.05] px-1 py-0.5 rounded">Image File Execution Options</code> para <code className="font-mono text-[11px] text-white/90 bg-white/[0.05] px-1 py-0.5 rounded">FiveM.exe</code> y <code className="font-mono text-[11px] text-white/90 bg-white/[0.05] px-1 py-0.5 rounded">GTA5.exe</code> prioridad de proceso Class 3 e I/O Priority 3, impidiendo tirones por accesos a disco o competencia de procesos secundarios.
            </p>
          </div>

          <div className="pt-4 text-[11px] font-mono text-[#717680] flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-white/60" />
            <span>Permanente hasta que desactives el interruptor.</span>
          </div>
        </GlassCard>
      </div>

      {/* Clean Result Alert */}
      {lastCleanResult && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{lastCleanResult}</span>
        </div>
      )}

      {/* Technical Texture Loss Guide */}
      <GlassCard className="p-5" hoverEffect={false}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-white/[0.04] text-white border border-white/[0.08]">
            <Layers className="w-4 h-4 text-white/80" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white tracking-tight">
              ¿Por qué se caen las texturas ("Texture Loss") en FiveM?
            </h4>
            <p className="text-[11px] text-[#717680]">
              Guía técnica y mejores prácticas para servidores de GTA RP
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#9CA3AF] pt-2">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
            <div className="text-[11px] font-medium text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              1. Extended Texture Budget
            </div>
            <p className="text-[11px] text-[#828792] leading-relaxed">
              En Ajustes de Gráficos de GTA V, sube la barra de <em>Extended Texture Budget</em> entre un 30% y un 50% para permitir a FiveM almacenar modelos pesados en VRAM sin vaciarlos bruscamente.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
            <div className="text-[11px] font-medium text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              2. Cachés corruptas de servidores
            </div>
            <p className="text-[11px] text-[#828792] leading-relaxed">
              Al entrar a distintos servidores, los assets personalizados antiguos chocan con los nuevos. Purgar la caché periódicamente soluciona el 90% de las caídas de texturas.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
            <div className="text-[11px] font-medium text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              3. Cuello de botella de disco
            </div>
            <p className="text-[11px] text-[#828792] leading-relaxed">
              La prioridad de E/S activada arriba asegura que las texturas de los vehículos que pasan a alta velocidad se lean de tu SSD antes que cualquier otra tarea en segundo plano.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
