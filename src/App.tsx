import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { TitleBar } from "./components/layout/TitleBar";
import { Sidebar } from "./components/layout/Sidebar";
import { DashboardView } from "./components/views/DashboardView";
import { PresetsView } from "./components/views/PresetsView";
import { BenchmarkView } from "./components/views/BenchmarkView";
import { FiveMView } from "./components/views/FiveMView";
import { HispanSancionesView } from "./components/views/HispanSancionesView";
import { GamingView } from "./components/views/GamingView";
import { DebloatView } from "./components/views/DebloatView";
import { NetworkView } from "./components/views/NetworkView";
import { MemoryView } from "./components/views/MemoryView";
import { BackupView } from "./components/views/BackupView";
import { OptimizationModal, ModalStep } from "./components/ui/OptimizationModal";
import { UpdateModal } from "./components/ui/UpdateModal";
import { checkForAppUpdate, UpdateInfo } from "./services/updater";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { logOptimizationApplied } from "./services/discordLogger";
import { LoginView } from "./components/auth/LoginView";
import {
  TabType,
  AppMode,
  PresetType,
  SystemMetrics,
  GamingStatus,
  DebloatStatus,
  NetworkStatus,
  FiveMStatus,
  BackupItem,
  RestorePointItem,
  PcBenchmarkMetrics,
  FiveMBenchmarkMetrics,
  LogEntry,
} from "./types";

interface HispanConfigData {
  staff_att: string;
  discord_guild: string;
  discord_channel: string;
  always_on_top: boolean;
}

// Safe invoke wrapper for both Tauri desktop runtime and Vite browser preview
async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(cmd, args);
  } else {
    // Development / Browser mock simulation
    return new Promise((resolve) => {
      setTimeout(() => {
        if (cmd === "get_system_metrics") {
          resolve({
            cpu_usage: Math.floor(15 + Math.random() * 20),
            ram_total_mb: 32768,
            ram_used_mb: 11450 + Math.floor(Math.random() * 500),
            ram_usage_percent: 34.9,
            cpu_brand: "AMD Ryzen 9 7950X 16-Core Processor",
            cpu_cores: 32,
            os_name: "Windows 11 Pro",
            os_version: "23H2 (Build 22631.4317)",
            is_admin: true,
          } as T);
        } else if (cmd === "get_fivem_status") {
          resolve({
            is_installed: true,
            priority_active: false,
          } as T);
        } else if (cmd === "get_hispan_config") {
          resolve({
            staff_att: "Admin_Isma",
            discord_guild: "1543324125685358713",
            discord_channel: "1543324127283253270",
            always_on_top: true,
          } as T);
        } else if (cmd === "list_restore_points") {
          resolve([
            {
              id: "rp_init_01",
              description: "g0d_tweaks_Safety_Point_Initial",
              sequence_number: 42,
              created_at: "11/10/2026 01:20:00",
              status: "VSS Activo en Windows",
            },
          ] as T);
        } else if (cmd === "list_registry_backups") {
          resolve([
            {
              filename: "god_tweaks_reg_1728604800.reg",
              path: "C:\\Users\\ismae\\.god_tweaks\\backups\\god_tweaks_reg_1728604800.reg",
              size_kb: 42,
              created_at: "Hace 15 min",
            },
          ] as T);
        } else if (cmd === "get_pc_benchmark") {
          resolve({
            dpc_latency_before_us: 840,
            dpc_latency_after_us: 165,
            timer_res_before_ms: 1.0,
            timer_res_after_ms: 0.5,
            bg_processes_before: 145,
            bg_processes_after: 104,
            responsiveness_score_before: 58,
            responsiveness_score_after: 96,
            overall_improvement_percent: 48.5,
          } as T);
        } else if (cmd === "analyze_fivem_benchmark") {
          resolve({
            fps_before: 63,
            fps_after: 94,
            one_percent_low_before: 31,
            one_percent_low_after: 62,
            frame_time_before_ms: 15.8,
            frame_time_after_ms: 10.6,
            stutters_per_session_before: 16,
            stutters_per_session_after: 1,
            texture_loss_eliminated: true,
            overall_fps_boost_percent: 49.2,
            citizen_log_found: true,
          } as T);
        } else if (cmd === "clean_fivem_caches") {
          resolve({
            files_deleted: 342,
            bytes_cleared: 1548000000,
            message: "Caché de FiveM purgada: 342 archivos eliminados (~1476.3 MB liberados).",
          } as T);
        } else if (cmd === "send_command_to_fivem") {
          resolve("Comando enviado exitosamente a FiveM (simulación)." as T);
        } else if (cmd === "send_report_to_discord") {
          resolve("Reporte enviado exitosamente al canal de Discord (simulación)." as T);
        } else if (cmd.startsWith("get_")) {
          resolve({} as T);
        } else if (cmd === "clean_ram_working_set") {
          resolve({
            cleaned_processes: 124,
            total_processes: 189,
            message: "Purged RAM Working Set from 124 active processes.",
          } as T);
        } else if (cmd === "purge_shader_and_temp_caches") {
          resolve({
            files_deleted: 1420,
            bytes_cleared: 3820491024,
            paths_processed: ["C:\\AppData\\Local\\NVIDIA\\DXCache", "C:\\Temp"],
          } as T);
        } else {
          resolve(`Success: ${cmd} executed.` as T);
        }
      }, 400);
    });
  }
}

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
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
  const [pcBenchmark, setPcBenchmark] = useState<PcBenchmarkMetrics | null>(null);
  const [fivemBenchmark, setFivemBenchmark] = useState<FiveMBenchmarkMetrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});
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

  // Full-screen Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPhase, setModalPhase] = useState<"confirm" | "running" | "completed">("confirm");
  const [modalPlanTitle, setModalPlanTitle] = useState("g0d Mode eSports");
  const [modalSteps, setModalSteps] = useState<ModalStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activePipelineRunner, setActivePipelineRunner] = useState<(() => Promise<void>) | null>(null);

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

  const fetchPcBenchmark = useCallback(async () => {
    setLoading("pc_bench", true);
    try {
      const data = await safeInvoke<PcBenchmarkMetrics>("get_pc_benchmark");
      setPcBenchmark(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading("pc_bench", false);
    }
  }, []);

  const fetchFivemBenchmark = useCallback(async () => {
    setLoading("fivem_bench", true);
    try {
      const data = await safeInvoke<FiveMBenchmarkMetrics>("analyze_fivem_benchmark");
      setFivemBenchmark(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading("fivem_bench", false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchStatuses();
    fetchPcBenchmark();
    fetchFivemBenchmark();
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
  }, [fetchMetrics, fetchStatuses, fetchPcBenchmark, fetchFivemBenchmark, addLog, handleCheckForUpdates]);

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

  // Memory Handlers
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
      fetchFivemBenchmark();
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
      fetchFivemBenchmark();
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
    stepsList: { label: string; action: () => Promise<unknown> }[]
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
    void logOptimizationApplied({
      username: user?.username || "Usuario Local",
      userId: user?.id,
      planTitle: modalPlanTitle,
      appliedCount: stepsList.length,
    });
    fetchStatuses();
    fetchMetrics();
    fetchBackups();
    fetchPcBenchmark();
    fetchFivemBenchmark();
  };

  // Preset Trigger: Lite (Sin purga de caché)
  const triggerLitePlan = () => {
    const rawSteps = [
      {
        label: "Crear Punto de Restauración del Sistema (VSS)",
        action: () => safeInvoke("create_restore_point", { description: "g0d_tweaks_Lite_Plan" }),
      },
      {
        label: "Exportar Copia de Seguridad del Registro (.reg)",
        action: () => safeInvoke("export_registry_backup", { backup_name: "backup_lite" }),
      },
      {
        label: "Desactivar GameDVR y Capturas Xbox",
        action: () => safeInvoke("set_gamedvr", { disable: true }),
      },
      {
        label: "Vaciado de Caché DNS del Sistema",
        action: () => safeInvoke("flush_dns"),
      },
      {
        label: "Desactivar Telemetría Básica de Windows",
        action: () => safeInvoke("set_telemetry", { disable: true }),
      },
      {
        label: "Compactar RAM Working Set",
        action: () => safeInvoke("clean_ram_working_set"),
      },
    ];

    setModalPlanTitle("Plan Lite - Esencial");
    setModalSteps(rawSteps.map((s) => ({ label: s.label, status: "pending" })));
    setCurrentStepIndex(0);
    setActivePipelineRunner(() => () => runStepsSequentially(rawSteps));
    setModalPhase("confirm");
    setIsModalOpen(true);
  };

  // Preset Trigger: Premium (Sin purga de caché)
  const triggerPremiumPlan = () => {
    const rawSteps = [
      {
        label: "Crear Punto de Restauración del Sistema (VSS)",
        action: () => safeInvoke("create_restore_point", { description: "g0d_tweaks_Premium_Plan" }),
      },
      {
        label: "Exportar Copia de Seguridad del Registro (.reg)",
        action: () => safeInvoke("export_registry_backup", { backup_name: "backup_premium" }),
      },
      {
        label: "Inyectar Esquema de Energía 'Ultimate Performance'",
        action: () => safeInvoke("enable_ultimate_performance"),
      },
      {
        label: "Optimizar MMCSS y GPU Priority a 8",
        action: () => safeInvoke("set_mmcss_and_priority", { enable: true }),
      },
      {
        label: "Desactivar Algoritmo Nagle (TCPNoDelay = 1)",
        action: () => safeInvoke("set_nagle_algorithm", { disable: true }),
      },
      {
        label: "Anular Limitador Multimedia de Red",
        action: () => safeInvoke("set_network_throttling", { disable: true }),
      },
      {
        label: "Compactar Memoria RAM de Procesos Activos",
        action: () => safeInvoke("clean_ram_working_set"),
      },
    ];

    setModalPlanTitle("Plan Premium - Competitivo");
    setModalSteps(rawSteps.map((s) => ({ label: s.label, status: "pending" })));
    setCurrentStepIndex(0);
    setActivePipelineRunner(() => () => runStepsSequentially(rawSteps));
    setModalPhase("confirm");
    setIsModalOpen(true);
  };

  // Preset Trigger: Ultra (Sin purga de caché - Con Optimizaciones Extremas)
  const triggerUltraPlan = () => {
    const rawSteps = [
      {
        label: "Crear Punto de Restauración del Sistema (VSS)",
        action: () => safeInvoke("create_restore_point", { description: "g0d_tweaks_Ultra_Extreme" }),
      },
      {
        label: "Exportar Copia de Seguridad del Registro (.reg)",
        action: () => safeInvoke("export_registry_backup", { backup_name: "backup_ultra" }),
      },
      {
        label: "Desactivar HPET y Ticks Dinámicos (bcdedit)",
        action: () => safeInvoke("set_hpet", { disable: true }),
      },
      {
        label: "Inyectar Esquema 'Ultimate Performance' & Core Unparking",
        action: () => safeInvoke("enable_ultimate_performance"),
      },
      {
        label: "Win32PrioritySeparation=38, PowerThrottling=Off & HAGS",
        action: () => safeInvoke("set_extreme_gaming_optimizations", { enable: true }),
      },
      {
        label: "Prioridad Alta en FiveM y Subprocesos (b2699..b3095)",
        action: () => safeInvoke("set_fivem_priority", { enable: true }),
      },
      {
        label: "Optimizar MMCSS, GameDVR y Prioridad GPU a 8",
        action: () => Promise.all([
          safeInvoke("set_gamedvr", { disable: true }),
          safeInvoke("set_mmcss_and_priority", { enable: true }),
        ]),
      },
      {
        label: "Optimizar Red TCP: Nagle Desactivado & Flush DNS",
        action: () => Promise.all([
          safeInvoke("set_nagle_algorithm", { disable: true }),
          safeInvoke("set_network_throttling", { disable: true }),
          safeInvoke("flush_dns"),
        ]),
      },
      {
        label: "Debloat de Privacidad: Cortana, Copilot & Telemetría",
        action: () => Promise.all([
          safeInvoke("set_telemetry", { disable: true }),
          safeInvoke("set_cortana_and_search", { disable: true }),
          safeInvoke("set_copilot", { disable: true }),
        ]),
      },
      {
        label: "Compactar Memoria RAM de Procesos Activos",
        action: () => safeInvoke("clean_ram_working_set"),
      },
    ];

    setModalPlanTitle("Plan Ultra - Rendimiento Máximo");
    setModalSteps(rawSteps.map((s) => ({ label: s.label, status: "pending" })));
    setCurrentStepIndex(0);
    setActivePipelineRunner(() => () => runStepsSequentially(rawSteps));
    setModalPhase("confirm");
    setIsModalOpen(true);
  };

  // Preset Selection Dispatcher
  const handleSelectPreset = (preset: PresetType) => {
    if (preset === "lite") triggerLitePlan();
    else if (preset === "premium") triggerPremiumPlan();
    else if (preset === "ultra") triggerUltraPlan();
  };

  // 1-Click God Mode Suite Execution (Trigger with confirmation modal)
  const handleTriggerGodMode = () => {
    triggerUltraPlan();
  };

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
        />
        <LoginView />
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
          activeTab={activeTab === "god_mode" ? "dashboard" : activeTab}
          onTabChange={(tab) => {
            if (tab === "god_mode") {
              handleTriggerGodMode();
            } else if (tab === "hispan") {
              setAppMode("hispan");
              setActiveTab("hispan");
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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-6xl mx-auto pb-10"
            >
              {activeTab === "dashboard" && (
                <DashboardView
                  metrics={metrics}
                  logs={logs}
                  onApplyGodMode={handleTriggerGodMode}
                  isApplyingGodMode={isModalOpen && modalPhase === "running"}
                />
              )}

              {activeTab === "presets" && (
                <PresetsView
                  onSelectPreset={handleSelectPreset}
                  isRunning={isModalOpen && modalPhase === "running"}
                />
              )}

              {activeTab === "benchmark" && (
                <BenchmarkView
                  pcMetrics={pcBenchmark}
                  fivemMetrics={fivemBenchmark}
                  onRefreshPcBenchmark={fetchPcBenchmark}
                  onScanFivemLog={fetchFivemBenchmark}
                  isLoadingPc={loadingKeys["pc_bench"]}
                  isLoadingFivem={loadingKeys["fivem_bench"]}
                />
              )}

              {activeTab === "hispan" && (
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
                />
              )}

              {activeTab === "fivem" && (
                <FiveMView
                  status={fivemStatus}
                  onCleanCache={handleCleanFiveMCache}
                  onTogglePriority={handleToggleFiveMPriority}
                  loadingKeys={loadingKeys}
                  lastCleanResult={lastFiveMCleanMsg}
                />
              )}

              {activeTab === "gaming" && (
                <GamingView
                  status={gamingStatus}
                  onToggleHpet={handleToggleHpet}
                  onToggleUltimatePower={handleToggleUltimatePower}
                  onToggleGameDvr={handleToggleGameDvr}
                  onToggleMmcss={handleToggleMmcss}
                  loadingKeys={loadingKeys}
                />
              )}

              {activeTab === "debloat" && (
                <DebloatView
                  status={debloatStatus}
                  onToggleTelemetry={handleToggleTelemetry}
                  onToggleCortana={handleToggleCortana}
                  onToggleCopilot={handleToggleCopilot}
                  onUninstallBloatware={handleUninstallBloatware}
                  loadingKeys={loadingKeys}
                />
              )}

              {activeTab === "network" && (
                <NetworkView
                  status={networkStatus}
                  onToggleNagle={handleToggleNagle}
                  onFlushDns={handleFlushDns}
                  onToggleNetworkThrottling={handleToggleNetworkThrottling}
                  loadingKeys={loadingKeys}
                />
              )}

              {activeTab === "memory" && (
                <MemoryView
                  onCleanRam={handleCleanRam}
                  onPurgeCaches={handlePurgeCaches}
                  loadingKeys={loadingKeys}
                  lastRamCleanResult={lastRamMsg}
                  lastCacheCleanResult={lastCacheMsg}
                />
              )}

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
            </motion.div>
          </AnimatePresence>
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

      {/* Unclosable Full-Screen Loading & Confirmation Modal */}
      <OptimizationModal
        isOpen={isModalOpen}
        phase={modalPhase}
        planTitle={modalPlanTitle}
        currentStepIndex={currentStepIndex}
        steps={modalSteps}
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
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

