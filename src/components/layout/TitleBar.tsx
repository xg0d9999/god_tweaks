import React from "react";
import { RefreshCw } from "lucide-react";
import { AppMode } from "../../types";

interface TitleBarProps {
  appMode?: AppMode;
  onToggleAppMode?: (mode: AppMode) => void;
  onCheckUpdates?: () => void;
  isCheckingUpdate?: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  appMode = "optimizer",
  onToggleAppMode,
  onCheckUpdates,
  isCheckingUpdate = false,
}) => {
  const handleClose = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().close();
    } catch {
      console.log("Window close invoked (browser preview)");
    }
  };

  const handleMinimize = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().minimize();
    } catch {
      console.log("Window minimize invoked (browser preview)");
    }
  };

  const handleMaximize = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().toggleMaximize();
    } catch {
      console.log("Window maximize invoked (browser preview)");
    }
  };

  return (
    <header
      data-tauri-drag-region
      className="relative z-50 flex items-center justify-between h-10 px-4 bg-[#08090A] border-b border-white/[0.08] select-none"
    >
      {/* macOS Traffic Lights (Window Controls) & Clean Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            aria-label="Cerrar ventana"
            className="group relative flex items-center justify-center w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/70 leading-none">
              ×
            </span>
          </button>
          <button
            onClick={handleMinimize}
            aria-label="Minimizar ventana"
            className="group relative flex items-center justify-center w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/70 leading-none -mt-0.5">
              -
            </span>
          </button>
          <button
            onClick={handleMaximize}
            aria-label="Maximizar ventana"
            className="group relative flex items-center justify-center w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[7px] font-bold text-black/70 leading-none">
              +
            </span>
          </button>
        </div>

        <span className="text-xs font-semibold text-white/90 tracking-tight">
          g0d tweaks
        </span>
      </div>

      {/* Center Drag Region */}
      <div data-tauri-drag-region className="flex-1 h-full" />

      {/* Right: Update Indicator & Mode Switcher */}
      <div className="flex items-center gap-2">
        {onCheckUpdates && (
          <button
            onClick={onCheckUpdates}
            disabled={isCheckingUpdate}
            title="Buscar actualizaciones automáticas"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-[11px] text-[#828792] hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3 h-3 text-[#717680] ${
                isCheckingUpdate ? "animate-spin text-white" : ""
              }`}
            />
            <span className="font-mono text-[10px] tracking-tight">v1.0.0</span>
          </button>
        )}

        {onToggleAppMode && (
          <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
            <button
              onClick={() => onToggleAppMode("optimizer")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                appMode === "optimizer"
                  ? "bg-white/[0.12] text-white border border-white/[0.16] shadow-sm"
                  : "text-[#828792] hover:text-white"
              }`}
            >
              ⚡ Optimizer
            </button>
            <button
              onClick={() => onToggleAppMode("hispan")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                appMode === "hispan"
                  ? "bg-white/[0.12] text-white border border-white/[0.16] shadow-sm"
                  : "text-[#828792] hover:text-white"
              }`}
            >
              🛡️ HispanLife Sanciones
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
