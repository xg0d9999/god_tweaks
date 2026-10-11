import React from "react";
import { Sparkles, Trash2, Cpu, HardDrive } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { ActionButton } from "../ui/ActionButton";

interface MemoryViewProps {
  onCleanRam: () => void;
  onPurgeCaches: () => void;
  loadingKeys: Record<string, boolean>;
  lastRamCleanResult?: string;
  lastCacheCleanResult?: string;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  onCleanRam,
  onPurgeCaches,
  loadingKeys,
  lastRamCleanResult,
  lastCacheCleanResult,
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Gestión de Memoria RAM & Basura
        </h2>
        <p className="text-xs text-[#828792]">
          Llamadas nativas directas a la API de Win32 para compactar la memoria y limpiar de forma segura acumulaciones residuales de sombreadores de GPU.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RAM Working Set Purge */}
        <GlassCard className="p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08]">
                <Cpu className="w-4 h-4" />
              </div>
              <Badge level="Seguro" />
            </div>

            <h3 className="text-sm font-semibold text-white tracking-tight mb-1.5">
              Vaciado de Working Set de RAM (Win32)
            </h3>
            <p className="text-xs text-[#828792] leading-relaxed mb-4">
              Invoca la función de bajo nivel <code className="font-mono text-[11px] text-white/90 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">K32EmptyWorkingSet</code> sobre todos los procesos del sistema. Transfiere páginas no críticas a la memoria en espera y compacta la RAM activa al instante.
            </p>

            {lastRamCleanResult && (
              <div className="p-2.5 mb-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-emerald-300">
                {lastRamCleanResult}
              </div>
            )}
          </div>

          <ActionButton
            variant="secondary"
            size="md"
            loading={loadingKeys["ram"]}
            onClick={() => onCleanRam()}
            icon={<Sparkles className="w-3.5 h-3.5 text-white/70" />}
            className="w-full"
          >
            Vaciar Working Set de RAM
          </ActionButton>
        </GlassCard>

        {/* Shader Caches & Temp Purge */}
        <GlassCard className="p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08]">
                <HardDrive className="w-4 h-4" />
              </div>
              <Badge level="Gaming" />
            </div>

            <h3 className="text-sm font-semibold text-white tracking-tight mb-1.5">
              Purga de Caché de Shaders DirectX / GPU
            </h3>
            <p className="text-xs text-[#828792] leading-relaxed mb-4">
              Elimina los archivos de sombreadores desactualizados en carpetas NVIDIA (<code className="font-mono text-[11px] text-white/90 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">DXCache, GLCache</code>), AMD (<code className="font-mono text-[11px] text-white/90 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">DxCache</code>), D3DSCache y %TEMP%.
            </p>

            {lastCacheCleanResult && (
              <div className="p-2.5 mb-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-emerald-300">
                {lastCacheCleanResult}
              </div>
            )}
          </div>

          <ActionButton
            variant="secondary"
            size="md"
            loading={loadingKeys["cache"]}
            onClick={() => onPurgeCaches()}
            icon={<Trash2 className="w-3.5 h-3.5 text-white/70" />}
            className="w-full"
          >
            Purgar Shaders & Temporales
          </ActionButton>
        </GlassCard>
      </div>
    </div>
  );
};
