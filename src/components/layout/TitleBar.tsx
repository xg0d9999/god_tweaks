import React from "react";
import { RefreshCw, Keyboard } from "lucide-react";
import { AppMode } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface TitleBarProps {
  appMode?: AppMode;
  onToggleAppMode?: (mode: AppMode) => void;
  onCheckUpdates?: () => void;
  isCheckingUpdate?: boolean;
  currentHotkey?: string;
  onOpenHotkeySettings?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  appMode = "optimizer",
  onToggleAppMode,
  onCheckUpdates,
  isCheckingUpdate = false,
  currentHotkey,
  onOpenHotkeySettings,
}) => {
  const { user, userRecord } = useAuth();
  const isTweaksBlocked = userRecord?.can_use_tweaks === false;
  const isSancionesBlocked = userRecord?.can_use_sanciones === false;
  const [appVersion, setAppVersion] = React.useState("1.0.9");

  React.useEffect(() => {
    const loadVersion = async () => {
      try {
        if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
          const { getVersion } = await import("@tauri-apps/api/app");
          const v = await getVersion();
          if (v) setAppVersion(v);
        }
      } catch {}
    };
    void loadVersion();
  }, []);

  const handleClose = async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("force_exit_app");
    } catch {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().close();
      } catch {
        console.log("Window close invoked (browser preview)");
      }
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
            title="Minimizar a la bandeja de apps en segundo plano (System Tray)"
            aria-label="Minimizar a segundo plano"
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

        <div className="flex items-center gap-1.5 ml-1">
          <img src="/favicon.png" alt="logo" className="w-3.5 h-3.5 rounded-sm object-contain" />
          <span className="text-xs font-semibold text-white/90 tracking-tight">
            g0d suite
          </span>
        </div>
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
            <span className="font-mono text-[10px] tracking-tight">v{appVersion}</span>
          </button>
        )}

        {onOpenHotkeySettings && (
          <button
            onClick={onOpenHotkeySettings}
            title="Atajo global para abrir o minimizar la aplicación. Haz clic para cambiarlo."
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-[11px] text-amber-300 hover:text-white transition-all cursor-pointer"
          >
            <Keyboard className="w-3 h-3 text-amber-400" />
            <span className="font-mono text-[10px] font-bold">{currentHotkey || "Win+J"}</span>
          </button>
        )}

        {onToggleAppMode && (
          <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
            <button
              onClick={() => onToggleAppMode("optimizer")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                appMode === "optimizer"
                  ? "bg-white/[0.12] text-white border border-white/[0.16] shadow-sm"
                  : "text-[#828792] hover:text-white"
              }`}
            >
              <span>⚡ Optimizer</span>
              {isTweaksBlocked && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  BLOQUEADO
                </span>
              )}
            </button>
            <button
              onClick={() => onToggleAppMode("hispan")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                appMode === "hispan"
                  ? "bg-white/[0.12] text-white border border-white/[0.16] shadow-sm"
                  : "text-[#828792] hover:text-white"
              }`}
            >
              <span>🛡️ HispanLife Sanciones</span>
              {isSancionesBlocked && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  BLOQUEADO
                </span>
              )}
            </button>
          </div>
        )}

        {/* Discord User Pill */}
        {user && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/[0.08]" title={`Sesión activa: ${user.username}`}>
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-5 h-5 rounded-full border border-white/20 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png';
              }}
            />
            <span className="text-[11px] text-white/90 font-medium hidden md:inline truncate max-w-[110px]">
              {user.username}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
