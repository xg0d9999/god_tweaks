import React from "react";
import { Wifi, RefreshCw, Gauge } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { Badge } from "../ui/Badge";
import { ActionButton } from "../ui/ActionButton";
import { NetworkStatus } from "../../types";

interface NetworkViewProps {
  status: NetworkStatus;
  onToggleNagle: (disable: boolean) => void;
  onFlushDns: () => void;
  onToggleNetworkThrottling: (disable: boolean) => void;
  onToggleQosLimit?: (disable: boolean) => void;
  loadingKeys: Record<string, boolean>;
}

export const NetworkView: React.FC<NetworkViewProps> = ({
  status,
  onToggleNagle,
  onFlushDns,
  onToggleNetworkThrottling,
  onToggleQosLimit,
  loadingKeys,
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Red, TCP & Optimización de Ping
        </h2>
        <p className="text-sm text-[#717680]">
          Optimiza la pila TCP/IP de Windows para priorizar paquetes de juegos competitivos en tiempo real y eliminar la acumulación de búferes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {/* Nagle Algorithm */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08] mt-0.5">
                <Wifi className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Desactivar Algoritmo Nagle (TCP NoDelay)
                  </h3>
                  <Badge level="Extremo" />
                </div>
                <p className="text-xs text-[#717680] max-w-xl">
                  Inyecta TcpAckFrequency = 1, TCPNoDelay = 1 y TcpDelAckTicks = 0 en los adaptadores de red. Envía paquetes TCP al instante sin esperar confirmaciones en lote (ACKs), reduciendo el jitter y ping en partidas.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={status.nagle_disabled}
              disabled={loadingKeys["nagle"]}
              onChange={(val) => onToggleNagle(val)}
            />
          </div>
        </GlassCard>

        {/* Network Throttling Index */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08] mt-0.5">
                <Gauge className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Desactivar Throttling de Red Multimedia
                  </h3>
                  <Badge level="Gaming" />
                </div>
                <p className="text-xs text-[#717680] max-w-xl">
                  Fija NetworkThrottlingIndex en 0xFFFFFFFF (desactivado). Windows por defecto limita el tráfico de red de aplicaciones no multimedia al 10% cuando detecta audio o vídeo.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={status.network_throttling_disabled}
              disabled={loadingKeys["throttling"]}
              onChange={(val) => onToggleNetworkThrottling(val)}
            />
          </div>
        </GlassCard>

        {/* QoS Bandwidth Limit (Psched) */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08] mt-0.5">
                <Wifi className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Eliminar Reserva de Ancho de Banda QoS (Psched)
                  </h3>
                  <Badge level="Gaming" />
                </div>
                <p className="text-xs text-[#717680] max-w-xl">
                  Inyecta NonBestEffortLimit = 0 en las directivas de red. Windows por defecto reserva hasta un 20% del ancho de banda total para paquetes y servicios del sistema.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={!!status.qos_limit_disabled}
              disabled={loadingKeys["qos_limit"]}
              onChange={(val) => onToggleQosLimit && onToggleQosLimit(val)}
            />
          </div>
        </GlassCard>

        {/* Flush DNS */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-white/80 border border-white/[0.08] mt-0.5">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Vaciado Inmediato de Caché DNS
                  </h3>
                  <Badge level="Seguro" />
                </div>
                <p className="text-xs text-[#717680] max-w-xl">
                  Purga la caché del solucionador DNS de Windows (ipconfig /flushdns) para resolver problemas de conectividad con servidores de emparejamiento (matchmaking).
                </p>
              </div>
            </div>

            <ActionButton
              variant="secondary"
              size="sm"
              loading={loadingKeys["dns"]}
              onClick={() => onFlushDns()}
            >
              Vaciar DNS
            </ActionButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
