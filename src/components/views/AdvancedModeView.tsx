import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Ghost, Radio, Sparkles, Sliders, AlertTriangle, Crosshair } from "lucide-react";
import { GamingView } from "./GamingView";
import { DebloatView } from "./DebloatView";
import { NetworkView } from "./NetworkView";
import { MemoryView } from "./MemoryView";
import { FiveMView } from "./FiveMView";
import {
  GamingStatus,
  DebloatStatus,
  NetworkStatus,
  FiveMStatus,
} from "../../types";

export interface AdvancedModeViewProps {
  gamingStatus: GamingStatus;
  onToggleHpet: (disable: boolean) => void;
  onToggleUltimatePower: () => void;
  onToggleGameDvr: (disable: boolean) => void;
  onToggleMmcss: (enable: boolean) => void;

  debloatStatus: DebloatStatus;
  onToggleTelemetry: (disable: boolean) => void;
  onToggleCortana: (disable: boolean) => void;
  onToggleCopilot: (disable: boolean) => void;
  onUninstallBloatware: () => void;

  networkStatus: NetworkStatus;
  onToggleNagle: (disable: boolean) => void;
  onFlushDns: () => void;
  onToggleNetworkThrottling: (disable: boolean) => void;
  onToggleQosLimit?: (disable: boolean) => void;

  onCleanRam: () => void;
  onPurgeCaches: () => void;
  lastRamCleanResult?: string;
  lastCacheCleanResult?: string;
  memoryCompressionDisabled?: boolean;
  onToggleMemoryCompression?: (disable: boolean) => void;

  fivemStatus: FiveMStatus;
  onCleanFivemCache: () => void;
  onToggleFivemPriority: (enable: boolean) => void;
  lastFivemCleanResult?: string;

  loadingKeys: Record<string, boolean>;
}

type AdvancedSubTab = "gaming" | "fivem" | "debloat" | "network" | "memory";

export const AdvancedModeView: React.FC<AdvancedModeViewProps> = ({
  gamingStatus,
  onToggleHpet,
  onToggleUltimatePower,
  onToggleGameDvr,
  onToggleMmcss,
  debloatStatus,
  onToggleTelemetry,
  onToggleCortana,
  onToggleCopilot,
  onUninstallBloatware,
  networkStatus,
  onToggleNagle,
  onFlushDns,
  onToggleNetworkThrottling,
  onToggleQosLimit,
  onCleanRam,
  onPurgeCaches,
  lastRamCleanResult,
  lastCacheCleanResult,
  memoryCompressionDisabled,
  onToggleMemoryCompression,
  fivemStatus,
  onCleanFivemCache,
  onToggleFivemPriority,
  lastFivemCleanResult,
  loadingKeys,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdvancedSubTab>("gaming");

  const subTabs = [
    {
      id: "gaming" as AdvancedSubTab,
      label: "Input Lag & Gaming",
      icon: <Gamepad2 className="w-3.5 h-3.5" />,
    },
    {
      id: "fivem" as AdvancedSubTab,
      label: "FiveM & GTA V",
      icon: <Crosshair className="w-3.5 h-3.5" />,
    },
    {
      id: "debloat" as AdvancedSubTab,
      label: "Debloat & Privacidad",
      icon: <Ghost className="w-3.5 h-3.5" />,
    },
    {
      id: "network" as AdvancedSubTab,
      label: "Red & Ping",
      icon: <Radio className="w-3.5 h-3.5" />,
    },
    {
      id: "memory" as AdvancedSubTab,
      label: "Limpieza Profunda",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/90">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Modo Avanzado Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/[0.08] text-white/90 border border-white/10">
                CONFIGURACIÓN MANUAL
              </span>
            </h1>
            <p className="text-xs text-[#8B949E]">
              Elige y activa manualmente los módulos específicos que deseas aplicar en tu sistema
            </p>
          </div>
        </div>
      </div>

      {/* Warning Notice Banner */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.02] p-3.5 backdrop-blur-md">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="flex-1 text-xs leading-relaxed">
            <span className="font-semibold text-white">Aviso:</span>{" "}
            <span className="text-[#8B949E]">
              Modifica estos parámetros únicamente si sabes lo que estás haciendo. Estos ajustes aplican cambios directos en el kernel, temporizadores y registro del sistema.
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md overflow-x-auto select-none">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? "text-white"
                  : "text-[#8B949E] hover:text-[#EDEDED] hover:bg-white/[0.03]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSubTabPill"
                  className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.14] shadow-sm backdrop-blur-md"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab Content View */}
      <div className="pt-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {activeSubTab === "gaming" && (
              <GamingView
                status={gamingStatus}
                onToggleHpet={onToggleHpet}
                onToggleUltimatePower={onToggleUltimatePower}
                onToggleGameDvr={onToggleGameDvr}
                onToggleMmcss={onToggleMmcss}
                loadingKeys={loadingKeys}
              />
            )}

            {activeSubTab === "fivem" && (
              <FiveMView
                status={fivemStatus}
                onCleanCache={onCleanFivemCache}
                onTogglePriority={onToggleFivemPriority}
                loadingKeys={loadingKeys}
                lastCleanResult={lastFivemCleanResult}
              />
            )}

            {activeSubTab === "debloat" && (
              <DebloatView
                status={debloatStatus}
                onToggleTelemetry={onToggleTelemetry}
                onToggleCortana={onToggleCortana}
                onToggleCopilot={onToggleCopilot}
                onUninstallBloatware={onUninstallBloatware}
                loadingKeys={loadingKeys}
              />
            )}

            {activeSubTab === "network" && (
              <NetworkView
                status={networkStatus}
                onToggleNagle={onToggleNagle}
                onFlushDns={onFlushDns}
                onToggleNetworkThrottling={onToggleNetworkThrottling}
                onToggleQosLimit={onToggleQosLimit}
                loadingKeys={loadingKeys}
              />
            )}

            {activeSubTab === "memory" && (
              <MemoryView
                onCleanRam={onCleanRam}
                onPurgeCaches={onPurgeCaches}
                memoryCompressionDisabled={memoryCompressionDisabled}
                onToggleMemoryCompression={onToggleMemoryCompression}
                loadingKeys={loadingKeys}
                lastRamCleanResult={lastRamCleanResult}
                lastCacheCleanResult={lastCacheCleanResult}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
