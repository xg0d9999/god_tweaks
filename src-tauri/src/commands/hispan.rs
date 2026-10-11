use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;
use crate::utils::win32::run_hidden_powershell;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HispanConfig {
    pub staff_att: String,
    pub discord_guild: String,
    pub discord_channel: String,
    pub always_on_top: bool,
}

impl Default for HispanConfig {
    fn default() -> Self {
        Self {
            staff_att: "".to_string(),
            discord_guild: "1543324125685358713".to_string(),
            discord_channel: "1543324127283253270".to_string(),
            always_on_top: true,
        }
    }
}

fn get_config_path() -> PathBuf {
    let user_profile = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".to_string());
    let dir = PathBuf::from(user_profile).join(".god_tweaks");
    let _ = fs::create_dir_all(&dir);
    dir.join("hispan_config.json")
}

#[tauri::command]
pub fn get_hispan_config() -> Result<HispanConfig, String> {
    let path = get_config_path();
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(cfg) = serde_json::from_str::<HispanConfig>(&content) {
            return Ok(cfg);
        }
    }
    Ok(HispanConfig::default())
}

#[tauri::command]
pub fn save_hispan_config(config: HispanConfig) -> Result<String, String> {
    let path = get_config_path();
    if let Ok(content) = serde_json::to_string_pretty(&config) {
        let _ = fs::write(&path, content);
        Ok("Configuración de HispanLife guardada con éxito.".to_string())
    } else {
        Err("Error serializando configuración.".to_string())
    }
}

#[tauri::command]
pub fn set_window_always_on_top(app_handle: tauri::AppHandle, enabled: bool) -> Result<bool, String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        let _ = window.set_always_on_top(enabled);
        Ok(enabled)
    } else {
        Err("No se pudo obtener la ventana principal.".to_string())
    }
}

#[tauri::command]
pub fn send_command_to_fivem(command: String) -> Result<String, String> {
    // Eliminar la barra '/' inicial para la consola F8 y escapar comillas
    let clean_command = command.trim().trim_start_matches('/').to_string();
    let escaped_command = clean_command.replace('\'', "''");

    let ps_script = format!(
        r#"
Add-Type -AssemblyName System.Windows.Forms
$p = Get-Process | Where-Object {{ $_.MainWindowTitle -match 'FiveM' -or $_.ProcessName -match 'FiveM' -or $_.ProcessName -match 'GTAProcess' }} | Select-Object -First 1
if (-not $p) {{
    exit 2
}}

Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32Helper {{
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}}
"@

[Win32Helper]::ShowWindow($p.MainWindowHandle, 9)
[Win32Helper]::SetForegroundWindow($p.MainWindowHandle)
Start-Sleep -Milliseconds 300

# Abrir consola F8 de FiveM
[System.Windows.Forms.SendKeys]::SendWait('{{F8}}')
Start-Sleep -Milliseconds 180

# Copiar comando sin '/' al portapapeles y pegar en F8
Set-Clipboard -Value '{escaped_command}'
[System.Windows.Forms.SendKeys]::SendWait('^v')
Start-Sleep -Milliseconds 120

# Enviar Enter para ejecutar el comando
[System.Windows.Forms.SendKeys]::SendWait('{{ENTER}}')
Start-Sleep -Milliseconds 150

# Cerrar consola F8 para volver al juego
[System.Windows.Forms.SendKeys]::SendWait('{{F8}}')
exit 0
"#
    );

    match run_hidden_powershell(&ps_script) {
        Ok(_) => Ok(format!("Comando ejecutado en la consola F8 de FiveM: {clean_command}")),
        Err(e) => {
            if e.contains("exit 2") || e.contains("2") {
                Err("No se encontró ninguna ventana activa de FiveM. Asegúrate de tener el juego abierto.".to_string())
            } else {
                Err(format!("Error enviando comando a FiveM: {e}"))
            }
        }
    }
}

#[tauri::command]
pub fn send_report_to_discord(guild_id: String, channel_id: String, report_text: String) -> Result<String, String> {
    let escaped_report = report_text.replace('\'', "''");

    let ps_script = format!(
        r#"
Add-Type -AssemblyName System.Windows.Forms
$discord = Get-Process -Name 'Discord', 'DiscordCanary' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $discord) {{
    exit 3
}}

# Navegar al canal específico
Start-Process "discord://discord.com/channels/{guild_id}/{channel_id}"
Start-Sleep -Milliseconds 600

Add-Type @"
using System;
using System.Runtime.InteropServices;
public class DiscordHelper {{
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
}}
"@

[DiscordHelper]::SetForegroundWindow($discord.MainWindowHandle)
Start-Sleep -Milliseconds 400

# Pegar la plantilla
Set-Clipboard -Value '{escaped_report}'
[System.Windows.Forms.SendKeys]::SendWait('^v')
Start-Sleep -Milliseconds 100
[System.Windows.Forms.SendKeys]::SendWait('{{ENTER}}')
exit 0
"#
    );

    match run_hidden_powershell(&ps_script) {
        Ok(_) => Ok("Plantilla de sanción enviada correctamente al canal de Discord.".to_string()),
        Err(e) => {
            if e.contains("exit 3") {
                Err("Discord no está abierto. Abre Discord en segundo plano antes de enviar el reporte.".to_string())
            } else {
                Err(format!("Error interactuando con Discord: {e}"))
            }
        }
    }
}
