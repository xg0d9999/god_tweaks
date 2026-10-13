pub mod commands;
pub mod utils;
pub mod tray;

use std::sync::Mutex;
use sysinfo::System;
use tauri::Manager;

use tray::force_exit_app;
use commands::backup::*;
use commands::debloat::*;
use commands::fivem::*;
use commands::gaming::*;
use commands::hispan::*;
use commands::memory::*;
use commands::network::*;
use commands::telemetry::*;
use commands::test_bench::*;
use commands::oauth::*;
use commands::hotkey::*;
use commands::selector::*;
use commands::citizens::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut sys = System::new_all();
    sys.refresh_all();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            init_hotkey_service(app.handle().clone());
            if let Err(e) = tray::setup_system_tray(app) {
                eprintln!("Failed to setup system tray: {e}");
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    api.prevent_close();
                    let _ = window.hide();
                } else if window.label() == "game-selector" {
                    api.prevent_close();
                    let _ = window.hide();
                    if let Some(main) = window.app_handle().get_webview_window("main") {
                        let _ = main.set_focus();
                    }
                }
            }
        })
        .manage(TelemetryState {
            sys: Mutex::new(sys),
        })
        .invoke_handler(tauri::generate_handler![
            // Telemetry
            get_system_metrics,
            get_hardware_profile,
            restart_as_admin,
            start_discord_oauth,
            // Gaming
            get_gaming_status,
            set_hpet,
            enable_ultimate_performance,
            set_gamedvr,
            set_mmcss_and_priority,
            set_extreme_gaming_optimizations,
            get_pc_benchmark,
            set_visual_effects,
            set_game_priority_profile,
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
            set_qos_limit,
            // Memory
            clean_ram_working_set,
            purge_shader_and_temp_caches,
            get_memory_compression_status,
            set_memory_compression,
            // FiveM & GTA V
            get_fivem_status,
            is_fivem_running,
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
            // Global Shortcut Toggle
            get_toggle_hotkey,
            set_toggle_hotkey,
            toggle_main_window,
            // Game Selector Popup Window
            open_game_selector_window,
            close_game_selector_window,
            select_game_and_optimize,
            // System Tray Lifecycle
            force_exit_app,
            // FiveM Citizens Manager
            get_fivem_citizen_info,
            open_fivem_citizen_folder,
            force_kill_fivem_processes,
            apply_local_citizen,
            restore_vanilla_citizen,
            download_and_apply_citizen,
            delete_local_citizen,
        ])
        .run(tauri::generate_context!())
        .expect("error while running g0d tweaks application");
}
