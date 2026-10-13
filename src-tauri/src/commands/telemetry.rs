use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use sysinfo::System;
use tauri::State;
use crate::utils::win32::is_elevated;

pub struct TelemetryState {
    pub sys: Mutex<System>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SystemMetrics {
    pub cpu_usage: f32,
    pub ram_total_mb: u64,
    pub ram_used_mb: u64,
    pub ram_usage_percent: f32,
    pub cpu_brand: String,
    pub cpu_cores: usize,
    pub os_name: String,
    pub os_version: String,
    pub is_admin: bool,
}

#[tauri::command]
pub fn get_system_metrics(state: State<'_, TelemetryState>) -> Result<SystemMetrics, String> {
    let mut sys = state.sys.lock().map_err(|e| e.to_string())?;
    
    // Refresh CPU and Memory data
    sys.refresh_cpu_usage();
    sys.refresh_memory();

    let cpu_usage = sys.global_cpu_usage();
    let ram_total_mb = sys.total_memory() / 1024 / 1024;
    let ram_used_mb = sys.used_memory() / 1024 / 1024;
    let ram_usage_percent = if ram_total_mb > 0 {
        (ram_used_mb as f32 / ram_total_mb as f32) * 100.0
    } else {
        0.0
    };

    let cpu_brand = sys
        .cpus()
        .first()
        .map(|c| c.name().trim().to_string())
        .unwrap_or_else(|| "Unknown CPU".to_string());
    let cpu_cores = sys.cpus().len();
    let os_name = sysinfo::System::name().unwrap_or_else(|| "Windows 11/10".to_string());
    let os_version = sysinfo::System::os_version().unwrap_or_else(|| "Pro".to_string());
    let is_admin = is_elevated();

    Ok(SystemMetrics {
        cpu_usage,
        ram_total_mb,
        ram_used_mb,
        ram_usage_percent,
        cpu_brand,
        cpu_cores,
        os_name,
        os_version,
        is_admin,
    })
}

#[tauri::command]
pub fn restart_as_admin() -> Result<(), String> {
    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_str = exe_path.to_string_lossy();
    let cmd = format!("Start-Process -FilePath '{exe_str}' -Verb RunAs");
    let _ = crate::utils::win32::run_hidden_powershell(&cmd);
    std::process::exit(0);
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HardwareProfile {
    pub hwid: String,
    pub cpu: String,
    pub cpu_cores: usize,
    pub ram_mb: u64,
    pub gpu: String,
    pub os: String,
}

#[tauri::command]
pub fn get_hardware_profile(state: State<'_, TelemetryState>) -> Result<HardwareProfile, String> {
    let mut sys = state.sys.lock().map_err(|e| e.to_string())?;
    sys.refresh_memory();

    let ram_mb = sys.total_memory() / 1024 / 1024;
    let cpu = sys
        .cpus()
        .first()
        .map(|c| c.name().trim().to_string())
        .unwrap_or_else(|| "Unknown CPU".to_string());
    let cpu_cores = sys.cpus().len();
    let os = format!(
        "{} {}",
        sysinfo::System::name().unwrap_or_else(|| "Windows".to_string()),
        sysinfo::System::os_version().unwrap_or_default()
    );

    let hwid = {
        #[cfg(windows)]
        {
            use winreg::enums::*;
            use winreg::RegKey;
            let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
            hklm.open_subkey("SOFTWARE\\Microsoft\\Cryptography")
                .and_then(|k| k.get_value::<String, _>("MachineGuid"))
                .unwrap_or_else(|_| "HWID-UNAVAILABLE".to_string())
        }
        #[cfg(not(windows))]
        {
            "HWID-NON-WINDOWS".to_string()
        }
    };

    let gpu = {
        #[cfg(windows)]
        {
            use winreg::enums::*;
            use winreg::RegKey;
            let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
            let mut detected_gpu = "NVIDIA / AMD Graphic Adapter".to_string();
            let base_path = "SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}";
            
            for index in ["0000", "0001", "0002", "0003"] {
                let subkey_path = format!("{base_path}\\{index}");
                if let Ok(key) = hklm.open_subkey(&subkey_path) {
                    if let Ok(desc) = key.get_value::<String, _>("DriverDesc") {
                        let desc_lower = desc.to_lowercase();
                        // Prefer dedicated GPU over basic/integrated
                        if desc_lower.contains("nvidia") || desc_lower.contains("geforce") || desc_lower.contains("radeon rx") {
                            detected_gpu = desc;
                            break;
                        } else if !desc.is_empty() && detected_gpu == "NVIDIA / AMD Graphic Adapter" {
                            detected_gpu = desc;
                        }
                    }
                }
            }
            detected_gpu
        }
        #[cfg(not(windows))]
        {
            "Standard GPU".to_string()
        }
    };

    Ok(HardwareProfile {
        hwid,
        cpu,
        cpu_cores,
        ram_mb,
        gpu,
        os,
    })
}

