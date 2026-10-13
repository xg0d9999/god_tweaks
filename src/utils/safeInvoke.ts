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
        } else {
          resolve(`Success: ${cmd} executed.` as unknown as T);
        }
      }, 400);
    });
  }
}
