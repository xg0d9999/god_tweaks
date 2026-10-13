import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X, Check, RotateCcw, Power } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface HotkeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string, type: "success" | "error" | "info") => void;
  currentHotkey: string;
  onHotkeyChange: (newHotkey: string) => void;
}

const PRESET_HOTKEYS = [
  { label: "Win + J (Por Defecto)", value: "Win+J", desc: "Recomendado, no interfiere con FiveM" },
  { label: "Ctrl + Shift + J", value: "Ctrl+Shift+J", desc: "Clásico para combinaciones de 3 teclas" },
  { label: "Alt + J", value: "Alt+J", desc: "Acceso rápido con el pulgar" },
  { label: "F9", value: "F9", desc: "Tecla única de función" },
  { label: "F10", value: "F10", desc: "Tecla única de función" },
  { label: "Ctrl + Alt + G", value: "Ctrl+Alt+G", desc: "Ideal para gaming sin choques" },
  { label: "Win + H", value: "Win+H", desc: "Rápido con la tecla Windows" },
];

export const HotkeySettingsModal: React.FC<HotkeySettingsModalProps> = ({
  isOpen,
  onClose,
  showToast,
  currentHotkey,
  onHotkeyChange,
}) => {
  const [selectedHotkey, setSelectedHotkey] = useState(currentHotkey || "Win+J");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);

  useEffect(() => {
    setSelectedHotkey(currentHotkey || "Win+J");
  }, [currentHotkey]);

  // Handle key recording when user wants custom keys
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const keys: string[] = [];
      if (e.metaKey || e.key === "Meta") keys.push("Win");
      if (e.ctrlKey) keys.push("Ctrl");
      if (e.altKey) keys.push("Alt");
      if (e.shiftKey) keys.push("Shift");

      const keyName = e.key.toUpperCase();
      if (!["CONTROL", "ALT", "SHIFT", "META"].includes(keyName)) {
        keys.push(keyName);
        const finalHotkey = keys.join("+");
        setSelectedHotkey(finalHotkey);
        setIsRecording(false);
      } else {
        setRecordedKeys(keys);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording]);

  const handleApply = async () => {
    try {
      await invoke("set_toggle_hotkey", { hotkey: selectedHotkey });
      localStorage.setItem("god_tweaks_toggle_hotkey", selectedHotkey);
      onHotkeyChange(selectedHotkey);
      if (showToast) {
        showToast(`Atajo global actualizado a [${selectedHotkey}]`, "success");
      }
      onClose();
    } catch (err) {
      if (showToast) {
        showToast(`Error al configurar atajo: ${String(err)}`, "error");
      }
    }
  };

  const handleResetDefault = () => {
    setSelectedHotkey("Win+J");
    setIsRecording(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0D0F12] border border-white/[0.1] shadow-2xl p-5 space-y-4"
          >
            {/* Specular top hairline */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Atajo Global de Apertura / Minimizado</h3>
                  <p className="text-[11px] text-[#828792]">Abre y oculta la suite desde cualquier juego</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[#828792] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Active Hotkey Banner */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#717680] font-semibold uppercase tracking-wider block">
                  Atajo Activo
                </span>
                <div className="mt-1 flex items-center gap-1.5 font-mono text-base font-bold text-amber-400">
                  {selectedHotkey.split("+").map((k, i) => (
                    <React.Fragment key={i}>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] text-white">
                        {k}
                      </span>
                      {i < selectedHotkey.split("+").length - 1 && <span className="text-[#717680]">+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setIsRecording(!isRecording);
                  setRecordedKeys([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isRecording
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.1]"
                }`}
              >
                {isRecording ? "Presiona teclas..." : "Grabar personalizado"}
              </button>
            </div>

            {isRecording && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 text-center animate-in fade-in">
                Presiona la combinación de teclas en tu teclado (ej: <kbd className="px-1 py-0.5 bg-black/40 rounded">Win</kbd> + <kbd className="px-1 py-0.5 bg-black/40 rounded">J</kbd>)
                {recordedKeys.length > 0 && (
                  <div className="mt-1 font-mono font-bold text-white">
                    Detectado: {recordedKeys.join(" + ")} ...
                  </div>
                )}
              </div>
            )}

            {/* Presets List */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#717680] uppercase tracking-wider px-1">
                Atajos Preconfigurados Populares
              </span>

              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {PRESET_HOTKEYS.map((preset) => {
                  const isSelected = selectedHotkey === preset.value;
                  return (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setSelectedHotkey(preset.value);
                        setIsRecording(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/30 text-white"
                          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-[#828792] hover:text-white"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{preset.label}</span>
                          {preset.value === "Win+J" && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#717680] mt-0.5">{preset.desc}</p>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Background Apps / System Tray Section */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-tight">
                    Apps en Segundo Plano de Windows (System Tray)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  ACTIVO
                </span>
              </div>
              <p className="text-[11px] text-[#828792] leading-relaxed">
                g0d suite permanece activo en la bandeja del sistema junto al reloj. Puedes hacer clic izquierdo para abrir/ocultar, o hacer clic derecho para <strong className="text-rose-400 font-medium">Forzar cierre</strong>.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await invoke("force_exit_app");
                  } catch {
                    window.close();
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <Power className="w-3.5 h-3.5 text-rose-400" />
                <span>Forzar cierre de la aplicación ahora</span>
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <button
                onClick={handleResetDefault}
                className="text-xs text-[#828792] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer Win+J</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#828792] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 transition-all cursor-pointer shadow-md"
                >
                  Guardar Atajo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
