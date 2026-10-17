import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Copy,
  Terminal,
  Send,
  Trash2,
  Shield,
  AlertCircle,
  Info,
  X,
  Keyboard,
  RotateCcw,
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { ActionButton } from "../ui/ActionButton";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import {
  HISPAN_INFRACTIONS,
  parsePenalty,
  calculateSanction,
} from "../../data/hispanInfractions";

interface HispanSancionesViewProps {
  onCopyClipboard: (text: string, label: string) => void;
  onSendFivemCommand: (command: string) => Promise<void>;
  onSendDiscordReport: (guildId: string, channelId: string, text: string) => Promise<void>;
  onToggleAlwaysOnTop: (enabled: boolean) => void;
  alwaysOnTop: boolean;
  staffAtt: string;
  onUpdateStaffAtt: (att: string) => void;
  discordGuild: string;
  discordChannel: string;
  onUpdateDiscordConfig?: (guild: string, channel: string) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  currentHotkey?: string;
  onOpenHotkeySettings?: () => void;
}

export const HispanSancionesView: React.FC<HispanSancionesViewProps> = ({
  onCopyClipboard,
  onSendFivemCommand,
  onSendDiscordReport,
  onToggleAlwaysOnTop,
  alwaysOnTop,
  staffAtt,
  onUpdateStaffAtt,
  discordGuild,
  discordChannel,
  onUpdateDiscordConfig,
  showToast,
  currentHotkey,
  onOpenHotkeySettings,
}) => {
  const [search, setSearch] = useState("");
  const [selections, setSelections] = useState<Record<number, "sin_reconocer" | "reconocida">>({});

  // Discord Channel Configuration Modal State
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
  const [inputGuild, setInputGuild] = useState(discordGuild);
  const [inputChannel, setInputChannel] = useState(discordChannel);
  const [inputUrl, setInputUrl] = useState("");

  useEffect(() => {
    setInputGuild(discordGuild);
    setInputChannel(discordChannel);
  }, [discordGuild, discordChannel]);

  // Modo de Baneo: Online (sqlban) vs Offline (sqlbanoffline)
  const [isOfflineBan, setIsOfflineBan] = useState<boolean>(false);

  // FiveM Live Running Detection
  const [isFivemRunning, setIsFivemRunning] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const checkFiveM = async () => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const running = await invoke<boolean>("is_fivem_running");
        if (isMounted) setIsFivemRunning(Boolean(running));
      } catch {
        if (isMounted) setIsFivemRunning(false);
      }
    };
    void checkFiveM();
    const interval = setInterval(checkFiveM, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Form Fields
  const [steamName, setSteamName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [proofs, setProofs] = useState("");
  const [extraNote, setExtraNote] = useState("");

  // Double Confirmation Modal state
  const [confirmStep, setConfirmStep] = useState<null | "first" | "second">(null);
  const [pendingActionType, setPendingActionType] = useState<"plantilla" | "jail" | "ban" | "jail_ig" | "ban_ig" | null>(null);

  // Filtered Infractions
  const filteredInfractions = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return HISPAN_INFRACTIONS;
    return HISPAN_INFRACTIONS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.id.toString() === q ||
        item.id.toString().padStart(2, "0") === q
    );
  }, [search]);

  // Calculated Sanction Result
  const result = useMemo(() => {
    return calculateSanction(selections, extraNote);
  }, [selections, extraNote]);

  const selectedCount = Object.keys(selections).length;

  // Toggle selection for an infraction
  const handleSelectOption = (id: number, mode: "sin_reconocer" | "reconocida") => {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[id] === mode) {
        delete next[id];
      } else {
        next[id] = mode;
      }
      return next;
    });
  };

  // Clear all except Staff (ATT)
  const handleClearAll = () => {
    setSelections({});
    setSteamName("");
    setPlayerId("");
    setProofs("");
    setExtraNote("");
    showToast("Formulario e infracciones restablecidos.", "info");
  };

  const handleSaveDiscordConfig = () => {
    let targetGuild = inputGuild.trim();
    let targetChannel = inputChannel.trim();

    if (inputUrl.trim()) {
      const match = inputUrl.match(/channels\/(\d+)\/(\d+)/);
      if (match) {
        targetGuild = match[1];
        targetChannel = match[2];
      }
    }

    if (!targetGuild || !targetChannel) {
      showToast("Introduce el Servidor (Guild ID) y el Canal ID.", "error");
      return;
    }

    if (onUpdateDiscordConfig) {
      onUpdateDiscordConfig(targetGuild, targetChannel);
    }
    showToast("Canal de registro de sanciones actualizado.", "success");
    setIsDiscordModalOpen(false);
    setInputUrl("");
  };

  const handleResetHispanOfficial = () => {
    const OFFICIAL_GUILD = "667478197927018530";
    const OFFICIAL_CHANNEL = "668062839990386701";
    setInputGuild(OFFICIAL_GUILD);
    setInputChannel(OFFICIAL_CHANNEL);
    setInputUrl("");
    if (onUpdateDiscordConfig) {
      onUpdateDiscordConfig(OFFICIAL_GUILD, OFFICIAL_CHANNEL);
    }
    showToast("Restablecido al canal oficial #registro-sanciones de HispanLife RP.", "success");
    setIsDiscordModalOpen(false);
  };

  // Generate Texts
  const formattedReportTemplate = useMemo(() => {
    return `>>> **Nombre de Steam:** ${steamName.trim() || "-"}
**Motivo:** ${result.motivoWithTag || "-"}
**Duración:** ${result.duracion}
**Tipo de sanción:** ${result.tipo_full}
**Pruebas:** ${proofs.trim() || "-"}`;
  }, [steamName, result, proofs]);

  const jailCommand = useMemo(() => {
    const cleanId = playerId.trim() || "ID";
    return `jail ${cleanId} ${result.jail_minutes} ${result.motivoWithTag}`;
  }, [playerId, result]);

  const banCommand = useMemo(() => {
    const cleanId = playerId.trim() || "ID";
    const days = result.perma ? -1 : result.ban_days;
    const cleanAtt = staffAtt.trim() || "Staff";
    const cmd = isOfflineBan ? "sqlbanoffline" : "sqlban";
    return `${cmd} ${cleanId} ${days} ${result.motivoWithoutTag} att:${cleanAtt}`;
  }, [playerId, result, staffAtt, isOfflineBan]);

  const validateAction = (type: "plantilla" | "jail" | "ban" | "jail_ig" | "ban_ig"): boolean => {
    if (selectedCount === 0) {
      showToast("Selecciona al menos una infracción.", "error");
      return false;
    }

    if (type === "plantilla" && !steamName.trim()) {
      showToast("Falta el Nombre de Steam.", "error");
      return false;
    }

    if ((type === "jail" || type === "jail_ig") && !playerId.trim()) {
      showToast("Falta la ID del jugador.", "error");
      return false;
    }

    if ((type === "jail" || type === "jail_ig") && result.jail_minutes <= 0) {
      showToast("La sanción no incluye Jail.", "error");
      return false;
    }

    if ((type === "ban" || type === "ban_ig") && !playerId.trim()) {
      showToast("Falta la ID del jugador.", "error");
      return false;
    }

    if ((type === "ban" || type === "ban_ig") && !result.perma && result.ban_days <= 0) {
      showToast("La sanción calculada no es Baneo.", "error");
      return false;
    }

    if ((type === "jail" || type === "ban" || type === "jail_ig" || type === "ban_ig") && !isFivemRunning) {
      showToast("FiveM no está abierto. Debes tener FiveM en ejecución para ejecutar o copiar sanciones.", "error");
      return false;
    }

    return true;
  };

  const handleTriggerAction = (type: "plantilla" | "jail" | "ban" | "jail_ig" | "ban_ig") => {
    if (!validateAction(type)) return;

    if (type === "jail") {
      onCopyClipboard(jailCommand, "Comando jail copiado al portapapeles.");
      return;
    }
    if (type === "ban") {
      onCopyClipboard(banCommand, `Comando ${isOfflineBan ? "sqlbanoffline" : "sqlban"} copiado al portapapeles.`);
      return;
    }
    if (type === "plantilla") {
      onCopyClipboard(formattedReportTemplate, "Plantilla de reporte copiada al portapapeles.");
      return;
    }

    // Para jail_ig y ban_ig, abrimos el modal de confirmación
    setPendingActionType(type);
    setConfirmStep("first");
  };

  const executeFinalAction = async (sendToDiscord: boolean) => {
    const type = pendingActionType;
    setConfirmStep(null);
    setPendingActionType(null);

    // 1. PRIMERO: Ejecutar en FiveM por consola F8
    if (type === "jail_ig") {
      await onSendFivemCommand(jailCommand);
    } else if (type === "ban_ig") {
      await onSendFivemCommand(banCommand);
    }

    // 2. SEGUNDO: Enviar reporte al canal de Discord
    if (sendToDiscord) {
      setTimeout(async () => {
        await onSendDiscordReport(discordGuild, discordChannel, formattedReportTemplate);
      }, 700);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "perma":
      case "ban":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "jail":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "ck":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "kick":
      case "aviso":
        return "text-sky-400 bg-sky-500/10 border-sky-500/20";
      case "consultar":
      case "special":
        return "text-yellow-300 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-[#828792] bg-white/[0.04] border-white/[0.08]";
    }
  };

  const getResultTypeColor = (tipo: string) => {
    if (tipo.includes("Baneo") || tipo.includes("Permanente")) return "text-rose-400";
    if (tipo.includes("Jail")) return "text-amber-400";
    if (tipo.includes("CK")) return "text-purple-400";
    if (tipo.includes("Kick") || tipo.includes("Aviso")) return "text-sky-400";
    if (tipo.includes("Consultar") || tipo.includes("Especial")) return "text-yellow-300";
    return "text-white/60";
  };

  return (
    <div className="space-y-4 select-none">
      {/* Clean Minimal Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h1 className="text-lg font-bold tracking-tight text-white">
            HispanLife · Sanciones
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white/[0.06] text-[#A0A6B2] border border-white/[0.08]">
            {selectedCount} seleccionada{selectedCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              isFivemRunning
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                : "bg-white/[0.03] text-[#828792] border-white/[0.08]"
            }`}
            title={
              isFivemRunning
                ? "FiveM detectado en memoria. Comandos directos habilitados."
                : "FiveM no detectado. Abre FiveM para habilitar Jail y Ban directos."
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isFivemRunning
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  : "bg-zinc-600"
              }`}
            />
            <span>{isFivemRunning ? "FiveM Conectado" : "FiveM Cerrado"}</span>
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: 64 Infracciones (7 Cols) */}
        <div className="lg:col-span-7 space-y-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#717680]" />
            <input
              type="text"
              placeholder="Buscar infracción (DM, PG, Bindeos, ID)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0E1013] border border-white/[0.08] focus:border-white/20 text-xs text-white placeholder-[#717680] outline-none transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-[#717680] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Infractions List with Scroll */}
          <div className="space-y-1 max-h-[550px] overflow-y-auto pr-1">
            {filteredInfractions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#717680]">
                Sin coincidencias para "{search}".
              </div>
            ) : (
              filteredInfractions.map((item) => {
                const activeMode = selections[item.id];
                const isSelected = !!activeMode;
                const parsedSin = parsePenalty(item.sin_reconocer);
                const parsedRec = parsePenalty(item.reconocida);
                const currentParsed = activeMode === "sin_reconocer" ? parsedSin : parsedRec;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-white/[0.05] border-white/[0.16] shadow-sm"
                        : "bg-white/[0.015] border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-mono text-[10px] text-[#717680] w-4 text-right flex-shrink-0">
                        {item.id}
                      </span>
                      <span className="text-xs font-medium text-white/95 truncate" title={item.name}>
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isSelected && (
                        <span
                          className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono border font-medium ${getCategoryColor(
                            currentParsed.category
                          )}`}
                        >
                          {currentParsed.shortLabel}
                        </span>
                      )}

                      <div className="flex items-center p-0.5 rounded-lg bg-black/40 border border-white/[0.08]">
                        <button
                          onClick={() => handleSelectOption(item.id, "sin_reconocer")}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                            activeMode === "sin_reconocer"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                              : "text-[#828792] hover:text-white"
                          }`}
                        >
                          Sin rec
                        </button>
                        <button
                          onClick={() => handleSelectOption(item.id, "reconocida")}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                            activeMode === "reconocida"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                              : "text-[#828792] hover:text-white"
                          }`}
                        >
                          Reconocida
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Form & Calculation (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Card: Datos */}
          <GlassCard className="p-3.5 space-y-2.5" hoverEffect={false}>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[11px] text-[#828792] mb-0.5">Steam</label>
                <input
                  type="text"
                  placeholder="Nombre de Steam"
                  value={steamName}
                  onChange={(e) => setSteamName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] focus:border-white/20 text-xs text-white placeholder-[#717680] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#828792] mb-0.5">ID</label>
                  <input
                    type="text"
                    placeholder="142"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] focus:border-white/20 text-xs text-white placeholder-[#717680] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#828792] mb-0.5">ATT</label>
                  <input
                    type="text"
                    placeholder="Tu nick"
                    value={staffAtt}
                    onChange={(e) => onUpdateStaffAtt(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] focus:border-white/20 text-xs text-white placeholder-[#717680] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#828792] mb-0.5">Pruebas</label>
                <input
                  type="text"
                  placeholder="https://medal.tv/clip/..."
                  value={proofs}
                  onChange={(e) => setProofs(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] focus:border-white/20 text-xs text-white placeholder-[#717680] outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#828792] mb-0.5">Nota extra (opcional)</label>
                <input
                  type="text"
                  placeholder="reiterado, actitud tóxica..."
                  value={extraNote}
                  onChange={(e) => setExtraNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] focus:border-white/20 text-xs text-white placeholder-[#717680] outline-none"
                />
              </div>
            </div>
          </GlassCard>

          {/* Card: RESULTADO */}
          <GlassCard className="p-3.5 space-y-2.5" hoverEffect={false}>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 font-mono text-xs">
              <span className="text-[#828792]">Jail: <strong className="text-white">{result.jail_minutes} min</strong></span>
              <span className="text-[#828792]">Ban: <strong className="text-white">{result.perma ? "PERMA" : `${result.ban_days}d`}</strong></span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className={`text-base font-bold tracking-tight ${getResultTypeColor(result.tipo_full)}`}>
                {result.tipo_full}
              </div>
              <div className="text-xs font-mono text-white/80 mt-0.5">
                Duración: <strong className="text-white">{result.duracion}</strong>
              </div>
            </div>

            {/* Specials / Warnings list */}
            {(result.notas_extra.length > 0 || result.specials.length > 0) && (
              <div className="space-y-1 text-xs">
                {result.notas_extra.map((n, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{n}</span>
                  </div>
                ))}
                {result.specials.map((s, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/90 text-[11px] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Actions */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                variant="primary"
                size="md"
                onClick={() => handleTriggerAction("plantilla")}
                icon={<Copy className="w-3.5 h-3.5 text-black" />}
              >
                Copiar Plantilla
              </ActionButton>
              <ActionButton
                variant="secondary"
                size="md"
                onClick={async () => {
                  if (!validateAction("plantilla")) return;
                  await onSendDiscordReport(discordGuild, discordChannel, formattedReportTemplate);
                }}
                icon={<Send className="w-3.5 h-3.5 text-sky-400" />}
                title="Pega la plantilla en Discord"
              >
                Enviar a Discord
              </ActionButton>
            </div>

            {/* Selector de Modo de Baneo: Online (sqlban) vs Offline (sqlbanoffline) */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
              <span className="text-[#828792] flex items-center gap-1.5 font-medium">
                <Terminal className="w-3.5 h-3.5 text-white/50" />
                <span>Modo de Baneo:</span>
              </span>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsOfflineBan(false)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                    !isOfflineBan
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                      : "text-[#828792] hover:text-white"
                  }`}
                  title="Jugador conectado en el servidor (sqlban)"
                >
                  sqlban (Online)
                </button>
                <button
                  type="button"
                  onClick={() => setIsOfflineBan(true)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                    isOfflineBan
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "text-[#828792] hover:text-white"
                  }`}
                  title="Jugador desconectado del servidor (sqlbanoffline)"
                >
                  sqlbanoffline (Offline)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => handleTriggerAction("jail")}
                icon={<Terminal className="w-3.5 h-3.5 text-white/70" />}
                className={`transition-all ${
                  isFivemRunning
                    ? "cursor-pointer"
                    : "opacity-40 cursor-not-allowed hover:bg-transparent"
                }`}
                disabled={!isFivemRunning}
                title={!isFivemRunning ? "FiveM no está abierto" : "Copiar comando jail (F8)"}
              >
                jail
              </ActionButton>
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => handleTriggerAction("ban")}
                icon={<Terminal className="w-3.5 h-3.5 text-white/70" />}
                className={`transition-all ${
                  isFivemRunning
                    ? "cursor-pointer"
                    : "opacity-40 cursor-not-allowed hover:bg-transparent"
                }`}
                disabled={!isFivemRunning}
                title={!isFivemRunning ? "FiveM no está abierto" : `Copiar comando ${isOfflineBan ? "sqlbanoffline" : "sqlban"} (F8)`}
              >
                {isOfflineBan ? "sqlbanoffline" : "sqlban"}
              </ActionButton>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => handleTriggerAction("jail_ig")}
                icon={<Send className="w-3.5 h-3.5 text-emerald-400" />}
                className={`transition-all ${
                  isFivemRunning
                    ? "hover:border-emerald-500/30 text-emerald-300 cursor-pointer"
                    : "opacity-40 cursor-not-allowed hover:bg-transparent"
                }`}
                disabled={!isFivemRunning}
                title={!isFivemRunning ? "FiveM no está abierto" : "Ejecutar Jail en FiveM por consola F8"}
              >
                Jail IG (F8)
              </ActionButton>
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => handleTriggerAction("ban_ig")}
                icon={<Send className="w-3.5 h-3.5 text-rose-400" />}
                className={`transition-all ${
                  isFivemRunning
                    ? "hover:border-rose-500/30 text-rose-300 cursor-pointer"
                    : "opacity-40 cursor-not-allowed hover:bg-transparent"
                }`}
                disabled={!isFivemRunning}
                title={!isFivemRunning ? "FiveM no está abierto" : `Ejecutar ${isOfflineBan ? "Baneo Offline (sqlbanoffline)" : "Baneo (sqlban)"} en FiveM por consola F8`}
              >
                {isOfflineBan ? "Baneo Offline (F8)" : "Baneo IG (F8)"}
              </ActionButton>
            </div>

            {!isFivemRunning && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>FiveM no está abierto. Los comandos directos (F8) están desactivados.</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleClearAll}
                className="text-xs text-[#828792] hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpiar todo</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                <button
                  onClick={() => setIsDiscordModalOpen(true)}
                  title="Configurar servidor y canal de Discord para las sanciones"
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-sky-300 hover:text-white border border-white/[0.08] cursor-pointer transition-colors"
                >
                  <Send className="w-3 h-3 text-sky-400" />
                  <span>
                    {discordGuild === "667478197927018530" && discordChannel === "668062839990386701"
                      ? "#registro-sanciones"
                      : "Canal Discord"}
                  </span>
                </button>

                {onOpenHotkeySettings && (
                  <button
                    onClick={onOpenHotkeySettings}
                    title="Configurar atajo de teclado para abrir y minimizar la app"
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-amber-300 hover:text-white border border-white/[0.08] cursor-pointer transition-colors"
                  >
                    <Keyboard className="w-3 h-3 text-amber-400" />
                    <span>Atajo: {currentHotkey || "Win+J"}</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  <span>Siempre visible</span>
                  <ToggleSwitch
                    checked={alwaysOnTop}
                    onChange={onToggleAlwaysOnTop}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal (Double Confirmation) */}
      <AnimatePresence>
        {confirmStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#0D0F12] border border-white/[0.1] shadow-2xl p-5 space-y-3.5"
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.2] to-transparent pointer-events-none" />

              {confirmStep && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Ejecutar {pendingActionType === "jail_ig" ? "Jail" : isOfflineBan ? "Baneo Offline (sqlbanoffline)" : "Baneo (sqlban)"} en FiveM (F8)
                      </h3>
                      <p className="text-[11px] text-[#828792]">
                        Se enfocará FiveM, se abrirá la consola F8 y se ejecutará el comando.
                      </p>
                    </div>
                  </div>

                  {/* Selector rápido de comando: Online (sqlban) vs Offline (sqlbanoffline) */}
                  {pendingActionType === "ban_ig" && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">Tipo de Comando de Baneo</span>
                        <span className="text-[10px] text-[#828792]">
                          {isOfflineBan ? "Jugador desconectado del servidor" : "Jugador conectado actualmente"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/50 border border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => setIsOfflineBan(false)}
                          className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                            !isOfflineBan
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                              : "text-[#828792] hover:text-white"
                          }`}
                        >
                          sqlban (Online)
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsOfflineBan(true)}
                          className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                            isOfflineBan
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                              : "text-[#828792] hover:text-white"
                          }`}
                        >
                          sqlbanoffline (Offline)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Comando IG Preview */}
                  <div className="px-3 py-2 rounded-xl bg-black/60 border border-emerald-500/30 flex items-center gap-2 font-mono text-xs">
                    <span className="text-emerald-400 font-bold">$</span>
                    <span className="text-emerald-300 font-medium tracking-wide">
                      {pendingActionType === "jail_ig" ? jailCommand : banCommand}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between text-[#828792]">
                      <span>ID Objetivo:</span>
                      <strong className="text-white font-bold">{playerId || "-"}</strong>
                    </div>
                    <div className="flex justify-between text-[#828792]">
                      <span>Steam:</span>
                      <strong className="text-white">{steamName || "-"}</strong>
                    </div>
                    <div className="flex justify-between text-[#828792]">
                      <span>Sanción:</span>
                      <strong className={getResultTypeColor(result.tipo_full)}>{result.tipo_full} ({result.duracion})</strong>
                    </div>
                    <div className="flex justify-between text-[#828792]">
                      <span>ATT:</span>
                      <strong className="text-white">{staffAtt || "Staff"}</strong>
                    </div>
                    <div className="flex justify-between text-[#828792]">
                      <span>Canal Discord:</span>
                      <strong className="text-sky-300 font-sans flex items-center gap-1">
                        <Send className="w-3 h-3 text-sky-400" />
                        {discordGuild === "667478197927018530" && discordChannel === "668062839990386701"
                          ? "#registro-sanciones (HispanLife RP)"
                          : `#canal (${discordChannel.slice(-6)})`}
                      </strong>
                    </div>
                    <div className="pt-1 border-t border-white/[0.06] text-[#828792]">
                      <span>Motivo:</span>
                      <p className="text-white font-sans mt-0.5 leading-relaxed">{result.motivoWithTag}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                    <ActionButton variant="ghost" size="sm" onClick={() => setConfirmStep(null)}>
                      Cancelar
                    </ActionButton>
                    <ActionButton
                      variant="secondary"
                      size="sm"
                      onClick={() => executeFinalAction(false)}
                      title="Ejecuta únicamente en FiveM sin enviar a Discord"
                    >
                      Solo FiveM (F8)
                    </ActionButton>
                    <ActionButton
                      variant="primary"
                      size="sm"
                      onClick={() => executeFinalAction(true)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      title="Ejecuta en FiveM por F8 y publica el reporte en Discord"
                    >
                      ⚡ FiveM + Enviar a Discord
                    </ActionButton>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Configuración de Canal de Discord */}
      <AnimatePresence>
        {isDiscordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0D0F12] border border-white/[0.1] shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Canal de Registro de Sanciones (Discord)
                  </h3>
                </div>
                <button
                  onClick={() => setIsDiscordModalOpen(false)}
                  className="p-1 rounded-lg text-[#828792] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-[#828792] leading-relaxed">
                  Configura a qué servidor y canal de Discord debe saltar la app para pegar el reporte oficial de sanción.
                </p>

                {/* Banner Canal Actual */}
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <span className="text-[10px] text-[#717680] uppercase tracking-wider font-semibold block">
                    Canal Actual Configurado
                  </span>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-white font-medium">
                      {discordGuild === "667478197927018530" && discordChannel === "668062839990386701"
                        ? "HispanLife RP · #registro-sanciones"
                        : "Canal Personalizado"}
                    </span>
                    <span className="text-emerald-400 font-bold">Activo</span>
                  </div>
                </div>

                {/* Pegar enlace rápido */}
                <div>
                  <label className="block text-[11px] text-[#828792] mb-1">
                    Pegar enlace directo de canal de Discord (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://discord.com/channels/667478197927018530/668062839990386701"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      const match = e.target.value.match(/channels\/(\d+)\/(\d+)/);
                      if (match) {
                        setInputGuild(match[1]);
                        setInputChannel(match[2]);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] focus:border-sky-500/50 text-white placeholder-[#717680] font-mono text-xs outline-none"
                  />
                </div>

                {/* Inputs manuales */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#828792] mb-1">
                      Servidor (Guild ID)
                    </label>
                    <input
                      type="text"
                      placeholder="667478197927018530"
                      value={inputGuild}
                      onChange={(e) => setInputGuild(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] focus:border-sky-500/50 text-white placeholder-[#717680] font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#828792] mb-1">
                      Canal (Channel ID)
                    </label>
                    <input
                      type="text"
                      placeholder="668062839990386701"
                      value={inputChannel}
                      onChange={(e) => setInputChannel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] focus:border-sky-500/50 text-white placeholder-[#717680] font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Botón Restablecer Oficial */}
                <button
                  type="button"
                  onClick={handleResetHispanOfficial}
                  className="w-full py-1.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-[11px] text-amber-300 hover:text-amber-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Restablecer Oficial HispanLife (#registro-sanciones)</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <ActionButton variant="ghost" size="sm" onClick={() => setIsDiscordModalOpen(false)}>
                  Cancelar
                </ActionButton>
                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={handleSaveDiscordConfig}
                  className="bg-sky-500 hover:bg-sky-400 text-black font-semibold"
                >
                  Guardar Canal
                </ActionButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
