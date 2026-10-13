use serde::{Deserialize, Serialize};
use winreg::enums::*;
use crate::utils::registry::{enum_subkeys, get_dword, set_dword, delete_value};
use crate::utils::win32::run_hidden_cmd;

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct NetworkStatus {
    pub nagle_disabled: bool,
    pub network_throttling_disabled: bool,
    pub qos_limit_disabled: bool,
}

#[tauri::command]
pub fn get_network_status() -> Result<NetworkStatus, String> {
    let mut status = NetworkStatus::default();

    // Check NetworkThrottlingIndex
    if let Ok(val) = get_dword(
        HKEY_LOCAL_MACHINE,
        "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile",
        "NetworkThrottlingIndex",
    ) {
        status.network_throttling_disabled = val == 0xFFFFFFFF;
    }

    // Check QoS NonBestEffortLimit
    if let Ok(val) = get_dword(
        HKEY_LOCAL_MACHINE,
        "SOFTWARE\\Policies\\Microsoft\\Windows\\Psched",
        "NonBestEffortLimit",
    ) {
        status.qos_limit_disabled = val == 0;
    }

    // Check if Nagle is disabled on at least one adapter
    let interfaces_path = "SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces";
    if let Ok(subkeys) = enum_subkeys(HKEY_LOCAL_MACHINE, interfaces_path) {
        for subkey in subkeys {
            let path = format!("{interfaces_path}\\{subkey}");
            if let Ok(val) = get_dword(HKEY_LOCAL_MACHINE, &path, "TCPNoDelay") {
                if val == 1 {
                    status.nagle_disabled = true;
                    break;
                }
            }
        }
    }

    Ok(status)
}

#[tauri::command]
pub fn set_nagle_algorithm(disable: bool) -> Result<String, String> {
    let interfaces_path = "SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces";
    let subkeys = enum_subkeys(HKEY_LOCAL_MACHINE, interfaces_path)?;

    let mut configured_interfaces = 0;
    let (tcp_ack, tcp_nodelay) = if disable { (1, 1) } else { (2, 0) };

    for subkey in subkeys {
        let path = format!("{interfaces_path}\\{subkey}");
        let _ = set_dword(HKEY_LOCAL_MACHINE, &path, "TcpAckFrequency", tcp_ack);
        let _ = set_dword(HKEY_LOCAL_MACHINE, &path, "TCPNoDelay", tcp_nodelay);
        let _ = set_dword(HKEY_LOCAL_MACHINE, &path, "TcpDelAckTicks", 0);
        configured_interfaces += 1;
    }

    Ok(if disable {
        format!("Nagle's Algorithm disabled across {configured_interfaces} network adapters (TcpAckFrequency=1, TCPNoDelay=1).")
    } else {
        format!("Nagle's Algorithm restored across {configured_interfaces} adapters.")
    })
}

#[tauri::command]
pub fn flush_dns() -> Result<String, String> {
    let output = run_hidden_cmd("ipconfig /flushdns")?;
    Ok(format!("DNS Resolver Cache successfully flushed: {output}"))
}

#[tauri::command]
pub fn set_network_throttling(disable: bool) -> Result<String, String> {
    let path = "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile";
    let val = if disable { 0xFFFFFFFF } else { 10 };
    set_dword(HKEY_LOCAL_MACHINE, path, "NetworkThrottlingIndex", val)?;

    Ok(if disable {
        "Network throttling for multimedia and gaming disabled (NetworkThrottlingIndex=0xFFFFFFFF).".to_string()
    } else {
        "Default network throttling restored.".to_string()
    })
}

#[tauri::command]
pub fn set_qos_limit(disable: bool) -> Result<String, String> {
    let path = "SOFTWARE\\Policies\\Microsoft\\Windows\\Psched";
    if disable {
        set_dword(HKEY_LOCAL_MACHINE, path, "NonBestEffortLimit", 0)?;
        Ok("Límite de reserva QoS de ancho de banda eliminado (NonBestEffortLimit = 0).".to_string())
    } else {
        let _ = delete_value(HKEY_LOCAL_MACHINE, path, "NonBestEffortLimit");
        Ok("Límite de reserva QoS restaurado a valores por defecto.".to_string())
    }
}

