import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { TitleBar } from "./components/layout/TitleBar";
import { Sidebar } from "./components/layout/Sidebar";
import { DashboardView } from "./components/views/DashboardView";
import { PresetsView } from "./components/views/PresetsView";
import { CitizensManagerView } from "./components/views/CitizensManagerView";
import { AdvancedModeView } from "./components/views/AdvancedModeView";
import { HispanSancionesView } from "./components/views/HispanSancionesView";
import { BackupView } from "./components/views/BackupView";
import { BenchmarkView } from "./components/views/BenchmarkView";
import { AdminPanelView } from "./components/views/AdminPanelView";
import { PermissionBlockedView } from "./components/views/PermissionBlockedView";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { OptimizationModal, ModalStep } from "./components/ui/OptimizationModal";
import { GameSelectorModal } from "./components/ui/GameSelectorModal";
import { UpdateModal } from "./components/ui/UpdateModal";
import { HotkeySettingsModal } from "./components/common/HotkeySettingsModal";
import { checkForAppUpdate, UpdateInfo } from "./services/updater";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { logOptimizationApplied } from "./services/discordLogger";
import { LoginView } from "./components/auth/LoginView";
import { safeInvoke } from "./utils/safeInvoke";
import {
  TabType,
  AppMode,
  PresetType,
  TargetGameId,
  ActivePlanData,
  SystemMetrics,
  GamingStatus,
  DebloatStatus,
  NetworkStatus,
  FiveMStatus,
  BackupItem,
  RestorePointItem,
  LogEntry,
} from "./types";

interface HispanConfigData {
  staff_att: string;
  discord_guild: string;
  discord_channel: string;
  always_on_top: boolean;
}


const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading, user, userRecord, hardware } = useAuth();
  const canUseTweaks = userRecord?.can_use_tweaks !== false;
  const canUseSanciones = userRecord?.can_use_sanciones !== false;
  const canUseCitizens = userRecord?.can_use_citizens === true;
  const isAdmin = userRecord?.is_admin === true;
  const [appMode, setAppMode] = useState<AppMode>("optimizer");
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [gamingStatus, setGamingStatus] = useState<GamingStatus>({
    hpet_disabled: false,
    ultimate_power_active: false,
    gamedvr_disabled: false,
    mmcss_optimized: false,
    extreme_tweaks_active: false,
  });
  const [debloatStatus, setDebloatStatus] = useState<DebloatStatus>({
    telemetry_disabled: false,
    cortana_search_disabled: false,
    copilot_disabled: false,
  });
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    nagle_disabled: false,
    network_throttling_disabled: false,
  });
  const [fivemStatus, setFivemStatus] = useState<FiveMStatus>({
    is_installed: false,
    priority_active: false,
  });
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePointItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});
  const [memoryCompressionDisabled, setMemoryCompressionDisabled] = useState(false);
  const [lastRamMsg, setLastRamMsg] = useState<string>();
  const [lastCacheMsg, setLastCacheMsg] = useState<string>();
  const [lastBackupMsg, setLastBackupMsg] = useState<string>();
  const [lastFiveMCleanMsg, setLastFiveMCleanMsg] = useState<string>();

  // HispanLife Moderation state
  const [staffAtt, setStaffAtt] = useState("Staff");
  const [discordGuild, setDiscordGuild] = useState("1543324125685358713");
  const [discordChannel, setDiscordChannel] = useState("1543324127283253270");
  const [alwaysOnTop, setAlwaysOnTop] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Floating Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Global Hotkey state (Win+J default)
  const [isHotkeyModalOpen, setIsHotkeyModalOpen] = useState(false);
  const [currentHotkey, setCurrentHotkey] = useState<string>(() => {
    return localStorage.getItem("god_tweaks_toggle_hotkey") || "Win+J";
  });

  useEffect(() => {
    const initHotkey = async () => {
      try {
        const saved = localStorage.getItem("god_tweaks_toggle_hotkey") || "Win+J";
        await safeInvoke("set_toggle_hotkey", { hotkey: saved });
      } catch (err) {
        console.warn("Could not register hotkey on startup:", err);
      }
    };
    initHotkey();
  }, []);

  // Full-screen Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [modalPhase, setModalPhase] = useState<"confirm" | "running" | "completed">("confirm");
  const [modalPlanTitle, setModalPlanTitle] = useState("g0d Mode eSports");
  const [isModalRevert, setIsModalRevert] = useState(false);
  const [modalSteps, setModalSteps] = useState<ModalStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activePipelineRunner, setActivePipelineRunner] = useState<(() => Promise<void>) | null>(null);
  const [activePlan, setActivePlan] = useState<ActivePlanData | null>(() => {
    try {
      const saved = localStorage.getItem("god_tweaks_active_plan");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 2800);
  }, []);

  // Auto-Updater State & Verification Logic
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const handleCheckForUpdates = useCallback(async (manual: boolean = false) => {
    if (manual) setIsCheckingUpdate(true);
    try {
      const info = await checkForAppUpdate();
      if (info && info.available) {
        setUpdateInfo(info);
        setIsUpdateModalOpen(true);
      } else if (manual) {
        showToast("Estás ejecutando la versión más reciente de g0d suite", "info");
      }
    } catch (err) {
      console.warn("Update check error:", err);
      if (manual) {
        showToast("No se pudo comprobar actualizaciones en este momento", "error");
      }
    } finally {
      if (manual) setIsCheckingUpdate(false);
    }
  }, [showToast]);

  const addLog = useCallback(
    (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
      const newEntry: LogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 50)]);
    },
    []
  );

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await safeInvoke<SystemMetrics>("get_system_metrics");
      setMetrics(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchStatuses = useCallback(async () => {
    try {
      const [g, d, n, f, b, rp, hispan] = await Promise.all([
        safeInvoke<GamingStatus>("get_gaming_status"),
        safeInvoke<DebloatStatus>("get_debloat_status"),
        safeInvoke<NetworkStatus>("get_network_status"),
        safeInvoke<FiveMStatus>("get_fivem_status"),
        safeInvoke<BackupItem[]>("list_registry_backups"),
        safeInvoke<RestorePointItem[]>("list_restore_points"),
        safeInvoke<HispanConfigData>("get_hispan_config"),
      ]);
      if (g) setGamingStatus((prev) => ({ ...prev, ...g }));
      if (d) setDebloatStatus((prev) => ({ ...prev, ...d }));
      if (n) setNetworkStatus((prev) => ({ ...prev, ...n }));
      if (f) setFivemStatus((prev) => ({ ...prev, ...f }));
      if (b) setBackups(b);
      if (rp) setRestorePoints(rp);
      safeInvoke<boolean>("get_memory_compression_status").then((res) => {
        if (typeof res === "boolean") setMemoryCompressionDisabled(res);
      }).catch(() => {});
      if (hispan) {
        if (hispan.staff_att) setStaffAtt(hispan.staff_att);
        if (hispan.discord_guild) setDiscordGuild(hispan.discord_guild);
        if (hispan.discord_channel) setDiscordChannel(hispan.discord_channel);
        setAlwaysOnTop(hispan.always_on_top);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchBackups = useCallback(async () => {
    try {
      const [list, rpList] = await Promise.all([
        safeInvoke<BackupItem[]>("list_registry_backups"),
        safeInvoke<RestorePointItem[]>("list_restore_points"),
      ]);
      if (list) setBackups(list);
      if (rpList) setRestorePoints(rpList);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchStatuses();
    addLog("g0d suite inicializado. Kernel & Hispan subsystems listos.", "info");

    // Check for updates automatically in the background on startup
    const updateTimeout = setTimeout(() => {
      handleCheckForUpdates(false);
    }, 1500);

    const interval = setInterval(fetchMetrics, 2500);
    return () => {
      clearTimeout(updateTimeout);
      clearInterval(interval);
    };
  }, [fetchMetrics, fetchStatuses, addLog, handleCheckForUpdates]);

  const setLoading = (key: string, val: boolean) => {
    setLoadingKeys((prev) => ({ ...prev, [key]: val }));
  };

  // Gaming Handlers
  const handleToggleHpet = async (disable: boolean) => {
    setLoading("hpet", true);
    try {
      const res = await safeInvoke<string>("set_hpet", { disable });
      setGamingStatus((prev) => ({ ...prev, hpet_disabled: disable }));
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("hpet", false);
    }
  };

  const handleToggleUltimatePower = async () => {
    setLoading("power", true);
    try {
      const res = await safeInvoke<string>("enable_ultimate_performance");
      setGamingStatus((prev) => ({ ...prev, ultimate_power_active: true }));
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("power", false);
    }
  };

  const handleToggleGameDvr = async (disable: boolean) => {
    setLoading("gamedvr", true);
    try {
      const res = await safeInvoke<string>("set_gamedvr", { disable });
      setGamingStatus((prev) => ({ ...prev, gamedvr_disabled: disable }));
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("gamedvr", false);
    }
  };

  const handleToggleMmcss = async (enable: boolean) => {
    setLoading("mmcss", true);
    try {
      const res = await safeInvoke<string>("set_mmcss_and_priority", { enable });
      setGamingStatus((prev) => ({ ...prev, mmcss_optimized: enable }));
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("mmcss", false);
    }
  };

  // Debloat Handlers
  const handleToggleTelemetry = async (disable: boolean) => {
    setLoading("telemetry", true);
    try {
      const res = await safeInvoke<string>("set_telemetry", { disable });
      setDebloatStatus((prev) => ({ ...prev, telemetry_disabled: disable }));
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("telemetry", false);
    }
  };

  const handleToggleCortana = async (disable: boolean) => {
    setLoading("cortana", true);
    try {
      const res = await safeInvoke<string>("set_cortana_and_search", { disable });
      setDebloatStatus((prev) => ({ ...prev, cortana_search_disabled: disable }));
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("cortana", false);
    }
  };

  const handleToggleCopilot = async (disable: boolean) => {
    setLoading("copilot", true);
    try {
      const res = await safeInvoke<string>("set_copilot", { disable });
      setDebloatStatus((prev) => ({ ...prev, copilot_disabled: disable }));
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("copilot", false);
    }
  };

  const handleUninstallBloatware = async () => {
    setLoading("bloatware", true);
    try {
      const res = await safeInvoke<string>("uninstall_bloatware", { packageKeys: [] });
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("bloatware", false);
    }
  };

  // Network Handlers
  const handleToggleNagle = async (disable: boolean) => {
    setLoading("nagle", true);
    try {
      const res = await safeInvoke<string>("set_nagle_algorithm", { disable });
      setNetworkStatus((prev) => ({ ...prev, nagle_disabled: disable }));
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("nagle", false);
    }
  };

  const handleFlushDns = async () => {
    setLoading("dns", true);
    try {
      const res = await safeInvoke<string>("flush_dns");
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("dns", false);
    }
  };

  const handleToggleNetworkThrottling = async (disable: boolean) => {
    setLoading("throttling", true);
    try {
      const res = await safeInvoke<string>("set_network_throttling", { disable });
      setNetworkStatus((prev) => ({
        ...prev,
        network_throttling_disabled: disable,
      }));
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("throttling", false);
    }
  };

  const handleToggleQosLimit = async (disable: boolean) => {
    setLoading("qos_limit", true);
    try {
      const res = await safeInvoke<string>("set_qos_limit", { disable });
      setNetworkStatus((prev) => ({
        ...prev,
        qos_limit_disabled: disable,
      }));
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("qos_limit", false);
    }
  };

  // Memory Handlers
  const handleToggleMemoryCompression = async (disable: boolean) => {
    setLoading("memory_compression", true);
    try {
      const res = await safeInvoke<string>("set_memory_compression", { disable });
      setMemoryCompressionDisabled(disable);
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("memory_compression", false);
    }
  };

  const handleCleanRam = async () => {
    setLoading("ram", true);
    try {
      const res = await safeInvoke<{ message: string }>("clean_ram_working_set");
      setLastRamMsg(res.message);
      addLog(res.message, "success");
      fetchMetrics();
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("ram", false);
    }
  };

  const handlePurgeCaches = async () => {
    setLoading("cache", true);
    try {
      const res = await safeInvoke<{ files_deleted: number; bytes_cleared: number }>(
        "purge_shader_and_temp_caches"
      );
      const mb = (res.bytes_cleared / 1024 / 1024).toFixed(1);
      const msg = `Se purgaron ${res.files_deleted} archivos residuales de sombreadores y temporales (~${mb} MB liberados).`;
      setLastCacheMsg(msg);
      addLog(msg, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("cache", false);
    }
  };

  // FiveM Handlers
  const handleCleanFiveMCache = async () => {
    setLoading("fivem_clean", true);
    try {
      const res = await safeInvoke<{ message: string }>("clean_fivem_caches");
      setLastFiveMCleanMsg(res.message);
      addLog(res.message, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("fivem_clean", false);
    }
  };

  const handleToggleFiveMPriority = async (enable: boolean) => {
    setLoading("fivem_priority", true);
    try {
      const res = await safeInvoke<string>("set_fivem_priority", { enable });
      setFivemStatus((prev) => ({ ...prev, priority_active: enable }));
      addLog(res, "success");
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("fivem_priority", false);
    }
  };

  // Backup Handlers
  const handleCreateRestorePoint = async () => {
    setLoading("restorePoint", true);
    try {
      const res = await safeInvoke<string>("create_restore_point", {
        description: "g0d_tweaks_Safety_Point",
      });
      setLastBackupMsg(res);
      addLog(res, "success");
      fetchBackups();
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("restorePoint", false);
    }
  };

  const handleExportRegistry = async () => {
    setLoading("registryBackup", true);
    try {
      const res = await safeInvoke<string>("export_registry_backup");
      setLastBackupMsg(res);
      addLog(res, "success");
      fetchBackups();
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("registryBackup", false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    try {
      const res = await safeInvoke<string>("delete_registry_backup", { filename });
      addLog(res, "success");
      fetchBackups();
    } catch (err) {
      addLog(String(err), "error");
    }
  };

  const handleDeleteAllBackups = async () => {
    setLoading("delete_all_backups", true);
    try {
      const res = await safeInvoke<string>("delete_all_registry_backups");
      addLog(res, "success");
      fetchBackups();
    } catch (err) {
      addLog(String(err), "error");
    } finally {
      setLoading("delete_all_backups", false);
    }
  };

  const handleDeleteRestorePoint = async (id: string) => {
    try {
      const res = await safeInvoke<string>("delete_restore_point", { id });
      addLog(res, "success");
      fetchBackups();
    } catch (err) {
      addLog(String(err), "error");
    }
  };

  const handleRestartAsAdmin = async () => {
    try {
      addLog("Solicitando elevación UAC para reiniciar como Administrador...", "info");
      await safeInvoke("restart_as_admin");
    } catch (e) {
      addLog(`Error al solicitar elevación UAC: ${e}`, "error");
    }
  };


  // HispanLife Moderation Handlers
  const handleCopyClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(label, "success");
    } catch {
      showToast("Error al copiar al portapapeles.", "error");
    }
  };

  const handleSendFivemCommand = async (command: string) => {
    try {
      const res = await safeInvoke<string>("send_command_to_fivem", { command });
      showToast(res, "success");
      addLog(res, "success");
    } catch (err) {
      showToast(String(err), "error");
      addLog(String(err), "error");
    }
  };

  const handleSendDiscordReport = async (guildId: string, channelId: string, text: string) => {
    try {
      const res = await safeInvoke<string>("send_report_to_discord", {
        guildId,
        channelId,
        reportText: text,
      });
      showToast(res, "success");
      addLog(res, "success");
    } catch (err) {
      showToast(String(err), "error");
      addLog(String(err), "error");
    }
  };

  const handleToggleAlwaysOnTop = async (enabled: boolean) => {
    try {
      await safeInvoke("set_window_always_on_top", { enabled });
      setAlwaysOnTop(enabled);
      await safeInvoke("save_hispan_config", {
        config: {
          staff_att: staffAtt,
          discord_guild: discordGuild,
          discord_channel: discordChannel,
          always_on_top: enabled,
        },
      });
      showToast(
        enabled ? "Ventana fijada siempre visible." : "Modo siempre visible desactivado.",
        "info"
      );
    } catch (err) {
      console.warn(err);
    }
  };

  const handleUpdateStaffAtt = async (att: string) => {
    setStaffAtt(att);
    void safeInvoke("save_hispan_config", {
      config: {
        staff_att: att,
        discord_guild: discordGuild,
        discord_channel: discordChannel,
        always_on_top: alwaysOnTop,
      },
    });
  };

  const handleUpdateDiscordConfig = async (guild: string, channel: string) => {
    setDiscordGuild(guild);
    setDiscordChannel(channel);
    void safeInvoke("save_hispan_config", {
      config: {
        staff_att: staffAtt,
        discord_guild: guild,
        discord_channel: channel,
        always_on_top: alwaysOnTop,
      },
    });
  };

  // Execution engine with progress checklist step-by-step
  const runStepsSequentially = async (
    presetId: PresetType,
    stepsList: { label: string; action: () => Promise<unknown> }[],
    targetGame?: TargetGameId,
    isPreGameBoost?: boolean
  ) => {
    setModalPhase("running");
    for (let i = 0; i < stepsList.length; i++) {
      setCurrentStepIndex(i);
      setModalSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "running" } : s
        )
      );
      try {
        await stepsList[i].action();
      } catch (err) {
        console.warn(`Step error: ${err}`);
      }
      setModalSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "completed" } : s
        )
      );
      await new Promise((r) => setTimeout(r, 450));
    }
    setModalPhase("completed");
    const planData: ActivePlanData = {
      id: presetId,
      title: modalPlanTitle,
      appliedAt: new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      targetGame,
      isPreGameBoost,
    };
    setActivePlan(planData);
    try {
      localStorage.setItem("god_tweaks_active_plan", JSON.stringify(planData));
    } catch (e) {
      console.warn("Error saving active plan:", e);
    }
    void logOptimizationApplied({
      username: user?.username || "Usuario Local",
      userId: user?.id,
      planTitle: modalPlanTitle,
      appliedCount: stepsList.length,
    });
    fetchStatuses();
    fetchMetrics();
    fetchBackups();
  };

  // Preset Trigger: Lite (Mantenimiento de sesión o incremental)
  const triggerLitePlan = () => {
    // Si ya está activo, reaplicar solo mantenimiento rápido de sesión
    if (activePlan?.id === "lite") {
      const quickSteps = [
        {
          label: "Vaciado de Caché DNS del Sistema",
          action: () => safeInvoke("flush_dns"),
        },
        {
          label: "Compactar RAM Working Set",
          action: () => safeInvoke("clean_ram_working_set"),
        },
      ];
      setModalPlanTitle("Mantenimiento Rápido: Plan Lite");
      setIsModalRevert(false);
      setModalSteps(quickSteps.map((s) => ({ label: s.label, status: "pending" })));
      setCurrentStepIndex(0);
      setActivePipelineRunner(() => () => runStepsSequentially("lite", quickSteps, undefined, true));
      setModalPhase("confirm");
      setIsModalOpen(true);
      return;
    }

    const rawSteps: { label: string; action: () => Promise<unknown> }[] = [];
    const hasAnyPlanActive = Boolean(activePlan);

    // Si no había ningún plan activo previo, crear respaldos de seguridad
    if (!hasAnyPlanActive) {
      rawSteps.push({
        label: "Crear Punto de Restauración del Sistema (VSS)",
        action: () => safeInvoke("create_restore_point", { description: "g0d_tweaks_Lite_Plan" }),
      });
      rawSteps.push({
        label: "Exportar Copia de Seguridad del Registro (.reg)",
        action: () => safeInvoke("export_registry_backup", { backup_name: "backup_lite" }),
      });
    }

    if (!gamingStatus.gamedvr_disabled) {
      rawSteps.push({
        label: "Desactivar GameDVR y Capturas Xbox",
        action: () => safeInvoke("set_gamedvr", { disable: true }),
      });
    }

    rawSteps.push({
      label: "Vaciado de Caché DNS del Sistema",
      action: () => safeInvoke("flush_dns"),
    });

    if (!debloatStatus.telemetry_disabled) {
      rawSteps.push({
        label: "Desactivar Telemetría Básica de Windows",
        action: () => safeInvoke("set_telemetry", { disable: true }),
      });
    }

    rawSteps.push({
      label: "Compactar RAM Working Set",
      action: () => safeInvoke("clean_ram_working_set"),
    });

    setModalPlanTitle("Plan Lite - Esencial");
    setIsModalRevert(false);
    setModalSteps(rawSteps.map((s) => ({ label: s.label, status: "pending" })));
    setCurrentStepIndex(0);
    setActivePipelineRunner(() => () => runStepsSequentially("lite", rawSteps, undefined, false));
    setModalPhase("confirm");
    setIsModalOpen(true);
  };

  // Preset Trigger: Premium (Boost pre-sesión o incremental)
  const triggerPremiumPlan = () => {
    // Si ya está activo, reaplicar solo boost de sesión temporal
    if (activePlan?.id === "premium") {
      const quickSteps = [
        {
          label: "Vaciado de Caché DNS del Sistema",
          action: () => safeInvoke("flush_dns"),
        },
        {
          label: "Verificar y Activar Esquema 'Ultimate Performance'",
          action: () => safeInvoke("enable_ultimate_performance"),
        },
        {
          label: "Compactar Memoria RAM de Procesos Activos",
          action: () => safeInvoke("clean_ram_working_set"),
        },
      ];
      setModalPlanTitle("Boost Pre-Sesión: Plan Premium");
      setIsModalRevert(false);
      setModalSteps(quickSteps.map((s) => ({ label: s.label, status: "pending" })));
      setCurrentStepIndex(0);
      setActivePipelineRunner(() => () => runStepsSequentially("premium", quickSteps, undefined, true));
      setModalPhase("confirm");
      setIsModalOpen(true);
      return;
    }

    const rawSteps: { label: string; action: () => Promise<unknown> }[] = [];
    const hasAnyPlanActive = Boolean(activePlan);

    if (!hasAnyPlanActive) {
      rawSteps.push({
        label: "Crear Punto de Restauración del Sistema (VSS)",
        action: () => safeInvoke("create_restore_point", { description: "g0d_tweaks_Premium_Plan" }),
      });
      rawSteps.push({
        label: "Exportar Copia de Seguridad del Registro (.reg)",
        action: () => safeInvoke("export_registry_backup", { backup_name: "backup_premium" }),
      });
    }

    if (!gamingStatus.ultimate_power_active) {
      rawSteps.push({
        label: "Inyectar Esquema de Energía 'Ultimate Performance'",
        action: () => safeInvoke("enable_ultimate_performance"),
      });
    }

    if (!gamingStatus.mmcss_optimized) {
      rawSteps.push({
        label: "Optimizar MMCSS y GPU Priority a 8",
        action: () => safeInvoke("set_mmcss_and_priority", { enable: true }),
      });
    }

    if (!networkStatus.nagle_disabled) {
      rawSteps.push({
        label: "Desactivar Algoritmo Nagle (TCPNoDelay = 1)",
        action: () => safeInvoke("set_nagle_algorithm", { disable: true }),
      });
    }

    if (!networkStatus.network_throttling_disabled) {
      rawSteps.push({
        label: "Anular Limitador Multimedia de Red",
        action: () => safeInvoke("set_network_throttling", { disable: true }),
      });
    }

    rawSteps.push({
      label: "Vaciado de Caché DNS del Sistema",
      action: () => safeInvoke("flush_dns"),
    });

    rawSteps.push({
      label: "Compactar Memoria RAM de Procesos Activos",
      action: () => safeInvoke("clean_ram_working_set"),
    });

    setModalPlanTitle("Plan Premium - Competitivo");
    setIsModalRevert(false);
    setModalSteps(rawSteps.map((s) => ({ label: s.label, status: "pending" })));
    setCurrentStepIndex(0);
    setActivePipelineRunner(() => () => runStepsSequentially("premium", rawSteps, undefined, false));
    setModalPhase("confirm");
    setIsModalOpen(true);
  };

  // Preset Trigger: Adaptativo por Juego y Hardware (Con Boost Pre-Juego e Incremental)
  const triggerAdaptiveGameOptimization = useCallback((gameId: TargetGameId) => {
    if (!canUseTweaks) {
      showToast("Acceso restringido: Permiso de optimizaciones deshabilitado.", "error");
      return;
    }

    const isAmdCpu = hardware?.cpu.toLowerCase().includes("amd") || hardware?.cpu.toLowerCase().includes("ryzen");
    const isIntelCpu = hardware?.cpu.toLowerCase().includes("intel") || hardware?.cpu.toLowerCase().includes("core");
    const isNvidiaGpu = hardware?.gpu.toLowerCase().includes("nvidia") || hardware?.gpu.toLowerCase().includes("geforce") || hardware?.gpu.toLowerCase().includes("rtx");
    const ramGb = hardware?.ram_mb ? Math.round(hardware.ram_mb / 1024) : 16;
    const hasHighRam = ramGb >= 16;

    const gameNames: Record<TargetGameId, string> = {
      general: "Sistema Completo",
      fivem: "FiveM & GTA V",
      fortnite: "Fortnite",
      valorant: "Valorant",
      cs2: "Counter-Strike 2",
    };

    const cpuLabel = isAmdCpu ? "AMD Ryzen" : isIntelCpu ? "Intel Core" : "CPU";
    const gpuLabel = isNvidiaGpu ? "NVIDIA" : "GPU";

    // 1. REAPLICAR BOOST PRE-JUEGO (Si este juego o plan ya está activo, ejecuta solo optimizaciones de sesión)
    const isSameTargetActive =
      activePlan?.targetGame === gameId ||
      (gameId === "general" && activePlan?.id === "ultra" && !activePlan?.targetGame);

    if (isSameTargetActive) {
      const rawSteps: { label: string; action: () => Promise<unknown> }[] = [];

      if (gameId === "fivem") {
        rawSteps.push({
          label: "Purga Profunda de Server-Cache y Texturas NUI (FiveM)",
          action: () => safeInvoke("clean_fivem_caches"),
        });
        rawSteps.push({
          label: "Vaciado de Caché DNS del Sistema",
          action: () => safeInvoke("flush_dns"),
        });
        rawSteps.push({
          label: "Verificar y Asegurar Esquema Ultimate Performance",
          action: () => safeInvoke("enable_ultimate_performance"),
        });
        rawSteps.push({
          label: "Compactar Memoria RAM de Procesos Activos (Working Set)",
          action: () => safeInvoke("clean_ram_working_set"),
        });
      } else if (gameId === "fortnite") {
        rawSteps.push({
          label: "Reasegurar Prioridad IFEO (FortniteClient-Win64-Shipping)",
          action: () => safeInvoke("set_game_priority_profile", { gameId: "fortnite", enable: true }),
        });
        rawSteps.push({
          label: "Vaciado de Caché DNS del Sistema",
          action: () => safeInvoke("flush_dns"),
        });
        rawSteps.push({
          label: "Verificar y Asegurar Esquema Ultimate Performance",
          action: () => safeInvoke("enable_ultimate_performance"),
        });
        rawSteps.push({
          label: "Compactar Memoria RAM de Procesos Activos (Working Set)",
          action: () => safeInvoke("clean_ram_working_set"),
        });
      } else if (gameId === "cs2") {
        rawSteps.push({
          label: "Reasegurar Prioridad IFEO y Sub-Tick Sync (cs2.exe)",
          action: () => safeInvoke("set_game_priority_profile", { gameId: "cs2", enable: true }),
        });
        rawSteps.push({
          label: "Vaciado de Caché DNS del Sistema",
          action: () => safeInvoke("flush_dns"),
        });
        rawSteps.push({
          label: "Verificar y Asegurar Esquema Ultimate Performance",
          action: () => safeInvoke("enable_ultimate_performance"),
        });
        rawSteps.push({
          label: "Compactar Memoria RAM de Procesos Activos (Working Set)",
          action: () => safeInvoke("clean_ram_working_set"),
        });
      } else if (gameId === "valorant") {
        rawSteps.push({
          label: "Reasegurar Prioridad IFEO (VALORANT-Win64-Shipping)",
          action: () => safeInvoke("set_game_priority_profile", { gameId: "valorant", enable: true }),
        });
        rawSteps.push({
          label: "Vaciado de Caché DNS del Sistema",
          action: () => safeInvoke("flush_dns"),
        });
        rawSteps.push({
          label: "Verificar y Asegurar Esquema Ultimate Performance",
          action: () => safeInvoke("enable_ultimate_performance"),
        });
        rawSteps.push({
          label: "Compactar Memoria RAM de Procesos Activos (Working Set)",
          action: () => safeInvoke("clean_ram_working_set"),
        });
      } else {
        // general
        rawSteps.push({
          label: "Vaciado de Caché DNS del Sistema",
          action: () => safeInvoke("flush_dns"),
        });
        rawSteps.push({
          label: "Verificar y Asegurar Esquema Ultimate Performance",
          action: () => safeInvoke("enable_ultimate_performance"),
        });
        rawSteps.push({
          label: "Compactar Memoria RAM de Procesos Activos (Working Set)",
          action: () => safeInvoke("clean_ram_working_set"),
        });
      }

      const title = gameId === "general"
        ? "Boost Pre-Sesión: Plan Ultra (Mantenimiento)"
        : `Boost Pre-Juego: ${gameNames[gameId]} (Sesión)`;

      setModalPlanTitle(title);
      setIsModalRevert(false);
      setModalSteps(rawSteps.map((s) => ({ label: s.label, status: "pending" })));
      setCurrentStepIndex(0);
      setActivePipelineRunner(() => () => runStepsSequentially("ultra", rawSteps, gameId, true));
      setModalPhase("confirm");
      setIsModalOpen(true);
      return;
    }

    // 2. OPTIMIZACIÓN INCREMENTAL (Si ya había otro plan activo, ejecuta solo lo que falte)
    const hasAnyPlanActive = Boolean(activePlan);
    const rawSteps: { label: string; action: () => Promise<unknown> }[] = [];

    // Respaldos solo si es la primera optimización del sistema
    if (!hasAnyPlanActive) {
      rawSteps.push({
        label: "Punto de Restauración del Sistema (VSS)",
        action: () => safeInvoke("create_restore_point", { description: `g0d_tweaks_${gameId}_Adaptive` }),
      });
      rawSteps.push({
        label: "Exportar Copia de Seguridad del Registro (.reg)",
        action: () => safeInvoke("export_registry_backup", { backup_name: `backup_${gameId}` }),
      });
    }

    // Kernel & HPET
    if (!gamingStatus.hpet_disabled) {
      rawSteps.push({
        label: "Temporizadores de Kernel & HPET (bcdedit TSC)",
        action: () => safeInvoke("set_hpet", { disable: true }),
      });
    }

    // Ultimate Performance
    if (!gamingStatus.ultimate_power_active) {
      rawSteps.push({
        label: "Plan 'Ultimate Performance' & CPU Core Unparking",
        action: () => safeInvoke("enable_ultimate_performance"),
      });
    }

    // Efectos visuales de rendimiento
    rawSteps.push({
      label: "Efectos Visuales de Rendimiento Mínimo de Windows",
      action: () => safeInvoke("set_visual_effects", { performance_mode: true }),
    });

    // MMCSS & GameDVR
    if (!gamingStatus.gamedvr_disabled || !gamingStatus.mmcss_optimized) {
      rawSteps.push({
        label: "MMCSS, Prioridad de GPU a 8 y GameDVR Off",
        action: () => Promise.all([
          safeInvoke("set_gamedvr", { disable: true }),
          safeInvoke("set_mmcss_and_priority", { enable: true }),
        ]),
      });
    }

    // Red TCP/IP y QoS
    if (!networkStatus.nagle_disabled || !networkStatus.network_throttling_disabled) {
      rawSteps.push({
        label: "Red TCP/IP: Nagle Off, Flush DNS y Reserva QoS al 0%",
        action: () => Promise.all([
          safeInvoke("set_nagle_algorithm", { disable: true }),
          safeInvoke("set_network_throttling", { disable: true }),
          safeInvoke("set_qos_limit", { disable: true }),
          safeInvoke("flush_dns"),
        ]),
      });
    }

    // Calibración extrema de CPU / Win32PrioritySeparation
    if (!gamingStatus.extreme_tweaks_active) {
      rawSteps.push({
        label: isAmdCpu
          ? "Calibración AMD Ryzen (Win32PrioritySeparation=38, PowerThrottling Off & HAGS)"
          : isIntelCpu
          ? "Calibración Intel (Thread Director para P-Cores, PowerThrottling Off & HAGS)"
          : "Win32PrioritySeparation=38, PowerThrottling Off & HAGS",
        action: () => safeInvoke("set_extreme_gaming_optimizations", { enable: true }),
      });
    }

    // Desactivar compresión de RAM (MMAgent) si tiene alta RAM
    if (hasHighRam && !memoryCompressionDisabled) {
      rawSteps.push({
        label: `Desactivar Compresión de RAM (MMAgent - Zero Stutters para ${ramGb}GB)`,
        action: () => safeInvoke("set_memory_compression", { disable: true }),
      });
    }

    // Optimizaciones específicas por juego
    if (gameId === "fivem") {
      rawSteps.push({
        label: "Prioridad Alta en FiveM.exe, GTA5.exe y Subprocesos (b2699..b3095)",
        action: () => safeInvoke("set_fivem_priority", { enable: true }),
      });
      rawSteps.push({
        label: "Purga de Caché de Servidores y NUI Storage (FiveM)",
        action: () => safeInvoke("clean_fivem_caches"),
      });
    } else if (gameId === "fortnite") {
      rawSteps.push({
        label: "Prioridad Alta en FortniteClient-Win64-Shipping (Unreal Engine 5)",
        action: () => safeInvoke("set_game_priority_profile", { gameId: "fortnite", enable: true }),
      });
    } else if (gameId === "valorant") {
      rawSteps.push({
        label: "Prioridad Alta en VALORANT-Win64-Shipping (Riot Vanguard Safe)",
        action: () => safeInvoke("set_game_priority_profile", { gameId: "valorant", enable: true }),
      });
    } else if (gameId === "cs2") {
      rawSteps.push({
        label: "Prioridad Alta en cs2.exe & Sub-tick Packet Sync (Source 2)",
        action: () => safeInvoke("set_game_priority_profile", { gameId: "cs2", enable: true }),
      });
    } else {
      // General
      if (!debloatStatus.telemetry_disabled) {
        rawSteps.push({
          label: "Debloat de Privacidad: Cortana, Copilot & Telemetría",
          action: () => Promise.all([
            safeInvoke("set_telemetry", { disable: true }),
            safeInvoke("set_cortana_and_search", { disable: true }),
            safeInvoke("set_copilot", { disable: true }),
          ]),
        });
      }
    }

    // Limpieza final de sesión DNS y RAM
    rawSteps.push({
      label: "Vaciado de Caché DNS del Sistema",
      action: () => safeInvoke("flush_dns"),
    });
    rawSteps.push({
      label: "Compactar Memoria RAM de Procesos Activos",
      action: () => safeInvoke("clean_ram_working_set"),
    });

    const title = gameId === "general"
      ? `Plan Ultra: PC Completo (${cpuLabel} + ${gpuLabel})`
      : `Plan Adaptativo: ${gameNames[gameId]} (${cpuLabel} + ${gpuLabel})`;

    setModalPlanTitle(title);
    setIsModalRevert(false);
    setModalSteps(rawSteps.map((s) => ({ label: s.label, status: "pending" })));
    setCurrentStepIndex(0);
    setActivePipelineRunner(() => () => runStepsSequentially("ultra", rawSteps, gameId, false));
    setModalPhase("confirm");
    setIsModalOpen(true);
  }, [
    canUseTweaks,
    hardware,
    showToast,
    activePlan,
    gamingStatus,
    networkStatus,
    debloatStatus,
    memoryCompressionDisabled,
  ]);

  // Open Native Independent Game Selector Window (1350x850)
  const handleOpenGameSelector = useCallback(async () => {
    if (!canUseTweaks) {
      showToast("Acceso restringido: Permiso de optimizaciones deshabilitado.", "error");
      return;
    }
    try {
      if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
        await safeInvoke("open_game_selector_window");
      } else {
        setIsGameModalOpen(true);
      }
    } catch (err) {
      console.warn("Could not open native selector window, falling back to modal:", err);
      setIsGameModalOpen(true);
    }
  }, [canUseTweaks, showToast]);

  // Listen for inter-window game optimization events from the independent selector popup window
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
      import("@tauri-apps/api/event").then(({ listen }) => {
        listen<{ gameId: TargetGameId }>("trigger-game-optimization", (event) => {
          if (event.payload?.gameId) {
            triggerAdaptiveGameOptimization(event.payload.gameId);
          }
        }).then((fn) => {
          unlisten = fn;
        });
      });
    }
    return () => {
      if (unlisten) unlisten();
    };
  }, [triggerAdaptiveGameOptimization]);

  // Preset Selection Dispatcher
  const handleSelectPreset = (preset: PresetType) => {
    if (!canUseTweaks) {
      showToast("Acceso restringido: Permiso de optimizaciones deshabilitado.", "error");
      return;
    }
    if (preset === "lite") triggerLitePlan();
    else if (preset === "premium") triggerPremiumPlan();
    else if (preset === "ultra") triggerAdaptiveGameOptimization("general");
  };

  // Revert / Restore System Defaults Pipeline
  const triggerRevertDefaultsPlan = useCallback(() => {
    if (!canUseTweaks) {
      showToast("Acceso restringido: Permiso de optimizaciones deshabilitado.", "error");
      return;
    }

    const rawSteps = [
      {
        label: "Crear Punto de Restauración del Sistema (VSS) de Seguridad",
        action: () => safeInvoke("create_restore_point", { description: "g0d_tweaks_Restore_Defaults" }),
      },
      {
        label: "Restaurar Plan de Energía Equilibrado (Windows Default)",
        action: () => safeInvoke("restore_default_power_plan"),
      },
      {
        label: "Restaurar Temporizadores de Kernel y HPET",
        action: () => safeInvoke("set_hpet", { disable: false }),
      },
      {
        label: "Restaurar Win32PrioritySeparation & CPU Throttling",
        action: () => safeInvoke("set_extreme_gaming_optimizations", { enable: false }),
      },
      {
        label: "Restaurar Planificador Multimedia MMCSS y Prioridad GPU",
        action: () => safeInvoke("set_mmcss_and_priority", { enable: false }),
      },
      {
        label: "Restaurar GameDVR y Servicios de Captura Xbox",
        action: () => safeInvoke("set_gamedvr", { disable: false }),
      },
      {
        label: "Restaurar Algoritmo de Red Nagle (TCP ACK Estándar)",
        action: () => safeInvoke("set_nagle_algorithm", { disable: false }),
      },
      {
        label: "Restaurar Límite de Reserva QoS y Throttling de Red",
        action: () => Promise.all([
          safeInvoke("set_network_throttling", { disable: false }),
          safeInvoke("set_qos_limit", { disable: false }),
        ]),
      },
      {
        label: "Restaurar Compresión de Memoria RAM (MMAgent)",
        action: () => safeInvoke("set_memory_compression", { disable: false }),
      },
      {
        label: "Restaurar Efectos Visuales Predeterminados de Windows",
        action: () => safeInvoke("set_visual_effects", { performance_mode: false }),
      },
      {
        label: "Restablecer Prioridades IFEO de Juegos (FiveM, CS2, etc.)",
        action: () => Promise.all([
          safeInvoke("set_fivem_priority", { enable: false }),
          safeInvoke("set_game_priority_profile", { gameId: "fivem", enable: false }),
          safeInvoke("set_game_priority_profile", { gameId: "fortnite", enable: false }),
          safeInvoke("set_game_priority_profile", { gameId: "valorant", enable: false }),
          safeInvoke("set_game_priority_profile", { gameId: "cs2", enable: false }),
        ]),
      },
      {
        label: "Restaurar Telemetría y Servicios del Sistema",
        action: () => Promise.all([
          safeInvoke("set_telemetry", { disable: false }),
          safeInvoke("set_cortana_and_search", { disable: false }),
          safeInvoke("set_copilot", { disable: false }),
        ]),
      },
    ];

    setModalPlanTitle("Valores Predeterminados de Windows");
    setIsModalRevert(true);
    setModalSteps(rawSteps.map((s) => ({ label: s.label, status: "pending" })));
    setCurrentStepIndex(0);
    setActivePipelineRunner(() => async () => {
      setModalPhase("running");
      for (let i = 0; i < rawSteps.length; i++) {
        setCurrentStepIndex(i);
        setModalSteps((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "running" } : s
          )
        );
        try {
          await rawSteps[i].action();
        } catch (err) {
          console.warn(`Step revert error: ${err}`);
        }
        setModalSteps((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "completed" } : s
          )
        );
        await new Promise((r) => setTimeout(r, 380));
      }
      setModalPhase("completed");
      setActivePlan(null);
      try {
        localStorage.removeItem("god_tweaks_active_plan");
      } catch (e) {
        console.warn("Error removing active plan:", e);
      }
      addLog("Valores predeterminados de Windows restaurados con éxito.", "success");
      showToast("Valores predeterminados de Windows restaurados con éxito.", "success");
      fetchStatuses();
      fetchMetrics();
      fetchBackups();
    });
    setModalPhase("confirm");
    setIsModalOpen(true);
  }, [canUseTweaks, showToast, addLog, fetchStatuses, fetchMetrics, fetchBackups]);

  // Toggle Mode Handler
  const handleToggleAppMode = (mode: AppMode) => {
    setAppMode(mode);
    if (mode === "hispan") {
      setActiveTab("hispan");
    } else {
      setActiveTab("dashboard");
    }
  };

  const appliedCount = [
    gamingStatus.hpet_disabled,
    gamingStatus.ultimate_power_active,
    gamingStatus.gamedvr_disabled,
    gamingStatus.mmcss_optimized,
    gamingStatus.extreme_tweaks_active,
    debloatStatus.telemetry_disabled,
    debloatStatus.cortana_search_disabled,
    debloatStatus.copilot_disabled,
    networkStatus.nagle_disabled,
    networkStatus.network_throttling_disabled,
    fivemStatus.priority_active,
  ].filter(Boolean).length;

  if (isAuthLoading) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07080A] text-white select-none">
        <TitleBar
          appMode={appMode}
          onToggleAppMode={handleToggleAppMode}
          onCheckUpdates={() => handleCheckForUpdates(true)}
          isCheckingUpdate={isCheckingUpdate}
        />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <img src="/favicon.png" alt="g0d suite" className="w-12 h-12 rounded-2xl animate-pulse" />
          <div className="flex items-center gap-2 text-xs font-mono text-[#828792]">
            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
            <span>Sincronizando g0d suite...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07080A]">
        <TitleBar
          appMode={appMode}
          onToggleAppMode={handleToggleAppMode}
          onCheckUpdates={() => handleCheckForUpdates(true)}
          isCheckingUpdate={isCheckingUpdate}
          currentHotkey={currentHotkey}
          onOpenHotkeySettings={() => setIsHotkeyModalOpen(true)}
        />
        <LoginView />
        <HotkeySettingsModal
          isOpen={isHotkeyModalOpen}
          onClose={() => setIsHotkeyModalOpen(false)}
          currentHotkey={currentHotkey}
          onHotkeyChange={setCurrentHotkey}
          showToast={showToast}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#08090A] text-[#EDEDED] overflow-hidden select-none">
      {/* Custom Window TitleBar with Mode Switcher & Update Check */}
      <TitleBar
        appMode={appMode}
        onToggleAppMode={handleToggleAppMode}
        onCheckUpdates={() => handleCheckForUpdates(true)}
        isCheckingUpdate={isCheckingUpdate}
        currentHotkey={currentHotkey}
        onOpenHotkeySettings={() => setIsHotkeyModalOpen(true)}
      />

      {/* Admin Elevation Warning Banner if not running elevated */}
      {metrics && !metrics.is_admin && (
        <div className="z-40 px-4 py-2 bg-[#12100A] border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-200/90">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-[11px]">
              <strong className="text-amber-300 font-medium">Permisos de Administrador Requeridos:</strong> Puntos de Restauración VSS, temporizadores HPET y claves de registro HKLM requieren privilegios elevados.
            </span>
          </div>
          <button
            onClick={handleRestartAsAdmin}
            className="flex-shrink-0 ml-4 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-medium border border-amber-500/30 transition-colors cursor-pointer"
          >
            Elevar a Administrador
          </button>
        </div>
      )}

      {/* Main app body */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Floating Collapsible Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === activeTab) return;
            if (tab === "admin") {
              setActiveTab("admin");
            } else {
              setAppMode("optimizer");
              setActiveTab(tab);
            }
          }}
          appliedCount={appliedCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="max-w-6xl mx-auto pb-10"
          >
            {activeTab === "dashboard" && (
              <DashboardView
                metrics={metrics}
                logs={logs}
                activePlan={activePlan}
                onNavigateToPresets={() => setActiveTab("presets")}
              />
            )}

            {activeTab === "presets" &&
              (!canUseTweaks ? (
                <PermissionBlockedView
                  moduleName="Planes de Optimización"
                  onBackToDashboard={() => setActiveTab("dashboard")}
                />
              ) : (
                <PresetsView
                  onSelectPreset={handleSelectPreset}
                  onOpenGameSelector={handleOpenGameSelector}
                  onRevertToDefaults={triggerRevertDefaultsPlan}
                  isRunning={isModalOpen && modalPhase === "running"}
                  activePlanId={activePlan?.id}
                  activePlanTitle={activePlan?.title}
                  activeTargetGame={activePlan?.targetGame}
                  hardware={hardware}
                />
              ))}

            {activeTab === "citizens" &&
              (!canUseCitizens ? (
                <PermissionBlockedView
                  moduleName="Gestor de Citizens"
                  reason="El acceso al Gestor de Citizens está deshabilitado para tu cuenta. Contacta con un Administrador para habilitarlo."
                  onBackToDashboard={() => setActiveTab("dashboard")}
                />
              ) : (
                <CitizensManagerView />
              ))}

            {activeTab === "advanced" &&
              (!canUseTweaks ? (
                <PermissionBlockedView
                  moduleName="Modo Avanzado"
                  onBackToDashboard={() => setActiveTab("dashboard")}
                />
              ) : (
                <AdvancedModeView
                  gamingStatus={gamingStatus}
                  onToggleHpet={handleToggleHpet}
                  onToggleUltimatePower={handleToggleUltimatePower}
                  onToggleGameDvr={handleToggleGameDvr}
                  onToggleMmcss={handleToggleMmcss}
                  debloatStatus={debloatStatus}
                  onToggleTelemetry={handleToggleTelemetry}
                  onToggleCortana={handleToggleCortana}
                  onToggleCopilot={handleToggleCopilot}
                  onUninstallBloatware={handleUninstallBloatware}
                  networkStatus={networkStatus}
                  onToggleNagle={handleToggleNagle}
                  onFlushDns={handleFlushDns}
                  onToggleNetworkThrottling={handleToggleNetworkThrottling}
                  onToggleQosLimit={handleToggleQosLimit}
                  onCleanRam={handleCleanRam}
                  onPurgeCaches={handlePurgeCaches}
                  lastRamCleanResult={lastRamMsg}
                  lastCacheCleanResult={lastCacheMsg}
                  memoryCompressionDisabled={memoryCompressionDisabled}
                  onToggleMemoryCompression={handleToggleMemoryCompression}
                  fivemStatus={fivemStatus}
                  onCleanFivemCache={handleCleanFiveMCache}
                  onToggleFivemPriority={handleToggleFiveMPriority}
                  lastFivemCleanResult={lastFiveMCleanMsg}
                  loadingKeys={loadingKeys}
                />
              ))}

            {activeTab === "backup" && (
              <BackupView
                onCreateRestorePoint={handleCreateRestorePoint}
                onExportRegistry={handleExportRegistry}
                backups={backups}
                restorePoints={restorePoints}
                onDeleteBackup={handleDeleteBackup}
                onDeleteAllBackups={handleDeleteAllBackups}
                onDeleteRestorePoint={handleDeleteRestorePoint}
                onRefreshBackups={fetchBackups}
                loadingKeys={loadingKeys}
                lastBackupMsg={lastBackupMsg}
              />
            )}

            {activeTab === "benchmark" &&
              (isAdmin ? (
                <BenchmarkView hardware={hardware} />
              ) : (
                <PermissionBlockedView
                  moduleName="Auditoría & Benchmark"
                  reason="Esta herramienta está restringida exclusivamente a administradores."
                  onBackToDashboard={() => setActiveTab("dashboard")}
                />
              ))}

            {activeTab === "hispan" &&
              (!canUseSanciones ? (
                <PermissionBlockedView
                  moduleName="HispanLife Sanciones"
                  onBackToDashboard={() => {
                    setAppMode("optimizer");
                    setActiveTab("dashboard");
                  }}
                />
              ) : (
                <HispanSancionesView
                  onCopyClipboard={handleCopyClipboard}
                  onSendFivemCommand={handleSendFivemCommand}
                  onSendDiscordReport={handleSendDiscordReport}
                  onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
                  alwaysOnTop={alwaysOnTop}
                  staffAtt={staffAtt}
                  onUpdateStaffAtt={handleUpdateStaffAtt}
                  discordGuild={discordGuild}
                  discordChannel={discordChannel}
                  onUpdateDiscordConfig={handleUpdateDiscordConfig}
                  showToast={showToast}
                  currentHotkey={currentHotkey}
                  onOpenHotkeySettings={() => setIsHotkeyModalOpen(true)}
                />
              ))}

            {activeTab === "admin" &&
              (isAdmin ? (
                <AdminPanelView />
              ) : (
                <PermissionBlockedView
                  moduleName="Panel de Administración"
                  reason="Se requieren privilegios de Administrador para acceder a esta sección."
                  onBackToDashboard={() => setActiveTab("dashboard")}
                />
              ))}
          </motion.div>
        </main>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            transition={{ duration: 0.2 }}
            className="fixed top-12 left-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#0D0F12]/95 border border-white/[0.14] shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl text-xs pointer-events-none select-none"
          >
            {toast.type === "success" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            {toast.type === "info" && (
              <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
            )}
            <span className="text-white font-medium tracking-tight">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Selector Modal */}
      <GameSelectorModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        onSelectGame={triggerAdaptiveGameOptimization}
        hardware={hardware}
        activeTargetGame={activePlan?.targetGame}
      />

      {/* Unclosable Full-Screen Loading & Confirmation Modal */}
      <OptimizationModal
        isOpen={isModalOpen}
        phase={modalPhase}
        planTitle={modalPlanTitle}
        currentStepIndex={currentStepIndex}
        steps={modalSteps}
        isRevert={isModalRevert}
        onConfirm={() => {
          if (activePipelineRunner) {
            activePipelineRunner();
          }
        }}
        onCancel={() => {
          if (modalPhase !== "running") {
            setIsModalOpen(false);
          }
        }}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />

      {/* Auto-Updater Modal Dialog */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        updateInfo={updateInfo}
      />

      {/* Global Hotkey Configuration Modal */}
      <HotkeySettingsModal
        isOpen={isHotkeyModalOpen}
        onClose={() => setIsHotkeyModalOpen(false)}
        currentHotkey={currentHotkey}
        onHotkeyChange={setCurrentHotkey}
        showToast={showToast}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

