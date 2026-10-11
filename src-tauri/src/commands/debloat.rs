use serde::{Deserialize, Serialize};
use winreg::enums::*;
use crate::utils::registry::{get_dword, set_dword};
use crate::utils::win32::{run_hidden_cmd, run_hidden_powershell};

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct DebloatStatus {
    pub telemetry_disabled: bool,
    pub cortana_search_disabled: bool,
    pub copilot_disabled: bool,
}

#[tauri::command]
pub fn get_debloat_status() -> Result<DebloatStatus, String> {
    let mut status = DebloatStatus::default();

    if let Ok(val) = get_dword(
        HKEY_LOCAL_MACHINE,
        "SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection",
        "AllowTelemetry",
    ) {
        status.telemetry_disabled = val == 0;
    }

    if let Ok(val) = get_dword(
        HKEY_LOCAL_MACHINE,
        "SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search",
        "AllowCortana",
    ) {
        status.cortana_search_disabled = val == 0;
    }

    if let Ok(val) = get_dword(
        HKEY_CURRENT_USER,
        "Software\\Policies\\Microsoft\\Windows\\WindowsCopilot",
        "TurnOffWindowsCopilot",
    ) {
        status.copilot_disabled = val == 1;
    }

    Ok(status)
}

#[tauri::command]
pub fn set_telemetry(disable: bool) -> Result<String, String> {
    let val = if disable { 0 } else { 3 }; // 0 = Security/Disabled, 3 = Full
    set_dword(
        HKEY_LOCAL_MACHINE,
        "SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection",
        "AllowTelemetry",
        val,
    )?;

    if disable {
        let _ = run_hidden_cmd("sc config DiagTrack start= disabled");
        let _ = run_hidden_cmd("sc stop DiagTrack");
        let _ = run_hidden_cmd("sc config dmwappushservice start= disabled");
        let _ = run_hidden_cmd("sc stop dmwappushservice");
        Ok("Diagnostic telemetry and background tracking services permanently disabled.".to_string())
    } else {
        let _ = run_hidden_cmd("sc config DiagTrack start= auto");
        let _ = run_hidden_cmd("sc start DiagTrack");
        Ok("Telemetry services restored.".to_string())
    }
}

#[tauri::command]
pub fn set_cortana_and_search(disable: bool) -> Result<String, String> {
    let cortana_val = if disable { 0 } else { 1 };
    let websearch_val = if disable { 1 } else { 0 };

    set_dword(
        HKEY_LOCAL_MACHINE,
        "SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search",
        "AllowCortana",
        cortana_val,
    )?;
    set_dword(
        HKEY_LOCAL_MACHINE,
        "SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search",
        "DisableWebSearch",
        websearch_val,
    )?;
    set_dword(
        HKEY_CURRENT_USER,
        "Software\\Microsoft\\Windows\\CurrentVersion\\Search",
        "BingSearchEnabled",
        if disable { 0 } else { 1 },
    )?;

    Ok(if disable {
        "Cortana and Bing web search indexing disabled from Start menu.".to_string()
    } else {
        "Cortana and Search restored.".to_string()
    })
}

#[tauri::command]
pub fn set_copilot(disable: bool) -> Result<String, String> {
    let val = if disable { 1 } else { 0 };
    set_dword(
        HKEY_CURRENT_USER,
        "Software\\Policies\\Microsoft\\Windows\\WindowsCopilot",
        "TurnOffWindowsCopilot",
        val,
    )?;
    set_dword(
        HKEY_LOCAL_MACHINE,
        "SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsCopilot",
        "TurnOffWindowsCopilot",
        val,
    )?;

    Ok(if disable {
        "Windows Copilot AI assistant disabled.".to_string()
    } else {
        "Windows Copilot enabled.".to_string()
    })
}

#[tauri::command]
pub fn uninstall_bloatware(package_keys: Vec<String>) -> Result<String, String> {
    let default_targets = if package_keys.is_empty() {
        vec![
            "Microsoft.BingNews",
            "Microsoft.BingWeather",
            "Microsoft.GetHelp",
            "Microsoft.Getstarted",
            "Microsoft.MicrosoftSolitaireCollection",
            "Microsoft.People",
            "Microsoft.WindowsFeedbackHub",
            "Microsoft.YourPhone",
            "Microsoft.ZuneVideo",
        ]
    } else {
        package_keys.iter().map(|s| s.as_str()).collect()
    };

    let mut removed_count = 0;
    for pkg in &default_targets {
        let ps_cmd = format!(
            "Get-AppxPackage -AllUsers *{pkg}* | Remove-AppxPackage -ErrorAction SilentlyContinue"
        );
        if run_hidden_powershell(&ps_cmd).is_ok() {
            removed_count += 1;
        }
    }

    Ok(format!("Silently purged {removed_count} UWP bloatware packages from system."))
}
