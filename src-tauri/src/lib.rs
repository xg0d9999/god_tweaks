pub mod commands;
pub mod utils;

use std::sync::Mutex;
use sysinfo::System;

use commands::backup::*;
use commands::debloat::*;
use commands::fivem::*;
use commands::gaming::*;
use commands::hispan::*;
use commands::memory::*;
use commands::network::*;
use commands::telemetry::*;
use commands::test_bench::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut sys = System::new_all();
    sys.refresh_all();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(TelemetryState {
            sys: Mutex::new(sys),
        })
        .invoke_handler(tauri::generate_handler![
            // Telemetry
            get_system_metrics,
            restart_as_admin,
            // Gaming
            get_gaming_status,
            set_hpet,
            enable_ultimate_performance,
            set_gamedvr,
            set_mmcss_and_priority,
            set_extreme_gaming_optimizations,
            get_pc_benchmark,
            // Debloat
            get_debloat_status,
            set_telemetry,
            set_cortana_and_search,
            set_copilot,
            uninstall_bloatware,
            // Network
            get_network_status,
            set_nagle_algorithm,
            flush_dns,
            set_network_throttling,
            // Memory
            clean_ram_working_set,
            purge_shader_and_temp_caches,
            // FiveM & GTA V
            get_fivem_status,
            clean_fivem_caches,
            set_fivem_priority,
            analyze_fivem_benchmark,
            // Backup
            create_restore_point,
            list_restore_points,
            delete_restore_point,
            export_registry_backup,
            list_registry_backups,
            delete_registry_backup,
            delete_all_registry_backups,
            // HispanLife RP Sanciones
            get_hispan_config,
            save_hispan_config,
            set_window_always_on_top,
            send_command_to_fivem,
            send_report_to_discord,
            // Test Bench
            run_test_bench,
        ])
        .run(tauri::generate_context!())
        .expect("error while running g0d tweaks application");
}
