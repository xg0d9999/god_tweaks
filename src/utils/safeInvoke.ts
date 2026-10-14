// Safe invoke wrapper for both Tauri desktop runtime and Vite browser preview
export async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
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
        } else if (cmd === "get_hardware_profile") {
          resolve({
            hwid: "HWID-SIMULATED-DEV",
            cpu: "AMD Ryzen 9 7950X 16-Core Processor",
            cpu_cores: 32,
            ram_mb: 32768,
            gpu: "NVIDIA GeForce RTX 4080",
            os: "Windows 11 Pro",
          } as unknown as T);
        } else if (cmd === "get_fivem_status") {
          resolve({
            is_installed: true,
            priority_active: false,
          } as unknown as T);
        } else if (cmd === "get_hispan_config") {
          resolve({
            staff_att: "Admin_Isma",
            discord_guild: "1543324125685358713",
            discord_channel: "1543324127283253270",
            always_on_top: true,
          } as unknown as T);
        } else if (cmd === "list_restore_points") {
          resolve([
            {
              id: "rp_init_01",
              description: "g0d_tweaks_Safety_Point_Initial",
              sequence_number: 42,
              created_at: "11/10/2026 01:20:00",
              status: "VSS Activo en Windows",
            },
          ] as unknown as T);
        } else if (cmd === "list_registry_backups") {
          resolve([
            {
              filename: "god_tweaks_reg_1728604800.reg",
              path: "C:\\Users\\ismae\\.god_tweaks\\backups\\god_tweaks_reg_1728604800.reg",
              size_kb: 42,
              created_at: "Hace 15 min",
            },
          ] as unknown as T);
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
          } as unknown as T);
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
          } as unknown as T);
        } else if (cmd === "clean_fivem_caches") {
          resolve({
            files_deleted: 342,
            bytes_cleared: 1548000000,
            message: "Caché de FiveM purgada: 342 archivos eliminados (~1476.3 MB liberados).",
          } as unknown as T);
        } else if (cmd === "send_command_to_fivem") {
          resolve("Comando enviado exitosamente a FiveM (simulación)." as unknown as T);
        } else if (cmd === "send_report_to_discord") {
          resolve("Reporte enviado exitosamente al canal de Discord (simulación)." as unknown as T);
        } else if (cmd === "run_test_bench") {
          resolve({
            timestamp: String(Math.floor(Date.now() / 1000)),
            total_tests: 10,
            passed_tests: 9,
            warning_tests: 1,
            failed_tests: 0,
            score_percent: 95.0,
            total_duration_ms: 18.5,
            items: [
              { id: "uac_elevation", name: "Privilegios UAC (Administrador)", category: "Kernel & Seguridad", status: "PASS", message: "Token SeDebugPrivilege verificado.", duration_ms: 1.2 },
              { id: "registry_io", name: "Motor de Registro Win32", category: "Kernel & Registro", status: "PASS", message: "I/O ultra-rápido verificado.", duration_ms: 0.8 },
              { id: "qpc_timer", name: "Temporizador de Alta Precisión (QPC)", category: "Latencia & Gaming", status: "PASS", message: "Resolución invariante TSC validada.", duration_ms: 0.4 },
              { id: "memory_api", name: "API de Purga de RAM (K32)", category: "Gestión de Memoria", status: "PASS", message: "Kernel de memoria Win32 operativo.", duration_ms: 2.1 },
              { id: "power_subsystem", name: "Subsistema de Energía (Powercfg)", category: "Rendimiento CPU", status: "PASS", message: "Ultimate Performance activo.", duration_ms: 3.4 },
              { id: "bcdedit_subsystem", name: "Subsistema BCDedit (HPET)", category: "Kernel & Seguridad", status: "PASS", message: "Reloj useplatformclock desactivado.", duration_ms: 2.8 },
              { id: "network_stack", name: "Pila de Red Win32 (Nagle / TCP)", category: "Red & Ping", status: "PASS", message: "TcpAckFrequency inyectado.", duration_ms: 1.5 },
              { id: "fivem_integration", name: "Instalación de FiveM / CitizenFX", category: "Gaming & FiveM", status: "PASS", message: "Cachés detectados.", duration_ms: 1.1 },
              { id: "vss_service", name: "Servicio Volume Shadow Copy (VSS)", category: "Seguridad & Respaldo", status: "PASS", message: "Servicio VSS activo para puntos de restauración.", duration_ms: 3.2 },
              { id: "updater_integrity", name: "Firma Criptográfica Minisign", category: "Kernel & Seguridad", status: "PASS", message: "Clave Ed25519 verificada.", duration_ms: 0.5 },
            ],
          } as unknown as T);
        } else if (cmd === "get_live_benchmark_snapshot") {
          resolve({
            timestamp: String(Math.floor(Date.now() / 1000)),
            ping_ms: 21.4,
            jitter_ms: 0.8,
            timer_resolution_ms: 0.5,
            ram_total_mb: 32768,
            ram_used_mb: 7420,
            ram_available_mb: 25348,
            ram_usage_percent: 22.6,
            process_count: 108,
            thread_count: 1420,
            cpu_compute_latency_us: 28.4,
            score: 98,
            hpet_disabled: true,
            ultimate_power: true,
            gamedvr_disabled: true,
            mmcss_optimized: true,
            nagle_disabled: true,
            memory_compression_disabled: true,
            network_throttling_disabled: true,
          } as unknown as T);
        } else if (cmd === "get_default_unoptimized_baseline") {
          resolve({
            timestamp: String(Math.floor(Date.now() / 1000)),
            ping_ms: 44.6,
            jitter_ms: 8.2,
            timer_resolution_ms: 1.0,
            ram_total_mb: 32768,
            ram_used_mb: 18240,
            ram_available_mb: 14528,
            ram_usage_percent: 55.6,
            process_count: 186,
            thread_count: 2480,
            cpu_compute_latency_us: 46.8,
            score: 51,
            hpet_disabled: false,
            ultimate_power: false,
            gamedvr_disabled: false,
            mmcss_optimized: false,
            nagle_disabled: false,
            memory_compression_disabled: false,
            network_throttling_disabled: false,
          } as unknown as T);
        } else if (cmd.startsWith("get_")) {
          resolve({} as unknown as T);
        } else if (cmd === "clean_ram_working_set") {
          resolve({
            cleaned_processes: 124,
            total_processes: 189,
            message: "Purged RAM Working Set from 124 active processes.",
          } as unknown as T);
        } else if (cmd === "purge_shader_and_temp_caches") {
          resolve({
            files_deleted: 1420,
            bytes_cleared: 3820491024,
            paths_processed: ["C:\\AppData\\Local\\NVIDIA\\DXCache", "C:\\Temp"],
          } as unknown as T);
        } else if (cmd === "force_exit_app") {
          resolve(undefined as unknown as T);
        } else {
          resolve(`Success: ${cmd} executed.` as unknown as T);
        }
      }, 400);
    });
  }
}
