import React from "react";
import { ShieldCheck, Search, Bot, Trash2 } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { Badge } from "../ui/Badge";
import { ActionButton } from "../ui/ActionButton";
import { DebloatStatus } from "../../types";

interface DebloatViewProps {
  status: DebloatStatus;
  onToggleTelemetry: (disable: boolean) => void;
  onToggleCortana: (disable: boolean) => void;
  onToggleCopilot: (disable: boolean) => void;
  onUninstallBloatware: () => void;
  loadingKeys: Record<string, boolean>;
}

export const DebloatView: React.FC<DebloatViewProps> = ({
  status,
  onToggleTelemetry,
  onToggleCortana,
  onToggleCopilot,
  onUninstallBloatware,
  loadingKeys,
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Debloat & Privacidad Absoluta
        </h2>
        <p className="text-sm text-[#717680]">
          Elimina servicios en segundo plano de rastreo, anuncios integrados en el sistema operativo y paquetes preinstalados innecesarios.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {/* Telemetry & Tracking Services */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08] mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Desactivar Telemetría de Diagnóstico & DiagTrack
                  </h3>
                  <Badge level="Seguro" />
                </div>
                <p className="text-xs text-[#717680] max-w-xl">
                  Establece AllowTelemetry = 0 y detiene los servicios DiagTrack y dmwappushservice para impedir el envío continuo de datos a servidores de Microsoft.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={status.telemetry_disabled}
              disabled={loadingKeys["telemetry"]}
              onChange={(val) => onToggleTelemetry(val)}
            />
          </div>
        </GlassCard>

        {/* Cortana & Bing Start Search */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08] mt-0.5">
                <Search className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Desactivar Cortana & Búsquedas Bing en Inicio
                  </h3>
                  <Badge level="Seguro" />
                </div>
                <p className="text-xs text-[#717680] max-w-xl">
                  Elimina los resultados web patrocinados y el procesamiento de búsqueda de Bing al presionar la tecla Windows, haciendo la búsqueda instantánea y local.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={status.cortana_search_disabled}
              disabled={loadingKeys["cortana"]}
              onChange={(val) => onToggleCortana(val)}
            />
          </div>
        </GlassCard>

        {/* Windows Copilot */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08] mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Deshabilitar Windows Copilot AI
                  </h3>
                  <Badge level="Gaming" />
                </div>
                <p className="text-xs text-[#717680] max-w-xl">
                  Inhabilita por directiva de grupo la integración de Copilot en la barra de tareas y el explorador de archivos, liberando subprocesos de WebView2.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={status.copilot_disabled}
              disabled={loadingKeys["copilot"]}
              onChange={(val) => onToggleCopilot(val)}
            />
          </div>
        </GlassCard>

        {/* Silent UWP Bloatware Removal */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08] mt-0.5">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Desinstalación Silenciosa de Bloatware UWP
                  </h3>
                  <Badge level="Extremo" />
                </div>
                <p className="text-xs text-[#717680] max-w-xl">
                  Purga de raíz aplicaciones basura preinstaladas: Solitario, Noticias Bing, Clima, Centro de Comentarios, Enlace Móvil, Películas y TV predefinidas.
                </p>
              </div>
            </div>

            <ActionButton
              variant="secondary"
              size="sm"
              loading={loadingKeys["bloatware"]}
              onClick={() => onUninstallBloatware()}
            >
              Purgar Bloatware
            </ActionButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
