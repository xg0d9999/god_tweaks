use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

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

#[cfg(windows)]
mod win_native {
    use windows::Win32::Foundation::{BOOL, HWND, LPARAM, HANDLE, CloseHandle};
    use windows::Win32::UI::WindowsAndMessaging::{
        EnumWindows, GetClassNameW, GetWindowTextW, GetWindowThreadProcessId, IsWindowVisible,
        SetForegroundWindow, ShowWindow, BringWindowToTop, GetForegroundWindow,
        IsIconic, SW_RESTORE, SW_SHOW,
    };
    use windows::Win32::System::Threading::GetCurrentThreadId;
    use windows::Win32::UI::Input::KeyboardAndMouse::{
        keybd_event, KEYEVENTF_KEYUP, KEYBD_EVENT_FLAGS,
    };
    use windows::Win32::System::Diagnostics::ToolHelp::{
        CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W, TH32CS_SNAPPROCESS,
    };
    use windows::Win32::System::DataExchange::{OpenClipboard, CloseClipboard, EmptyClipboard, SetClipboardData};
    use windows::Win32::System::Memory::{GlobalAlloc, GlobalLock, GlobalUnlock, GMEM_MOVEABLE};

    #[link(name = "user32")]
    extern "system" {
        fn AttachThreadInput(idattach: u32, idattachto: u32, fattach: BOOL) -> BOOL;
    }

    struct WindowFinder {
        grc_hwnd: Option<HWND>,
        fivem_title_hwnd: Option<HWND>,
        fivem_proc_hwnd: Option<HWND>,
    }

    unsafe extern "system" fn enum_windows_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
        let finder = &mut *(lparam.0 as *mut WindowFinder);

        if !IsWindowVisible(hwnd).as_bool() {
            return BOOL(1);
        }

        let mut class_buf = [0u16; 128];
        let class_len = GetClassNameW(hwnd, &mut class_buf);
        let class_name = String::from_utf16_lossy(&class_buf[..class_len as usize]);

        let mut title_buf = [0u16; 256];
        let title_len = GetWindowTextW(hwnd, &mut title_buf);
        let title = String::from_utf16_lossy(&title_buf[..title_len as usize]).to_lowercase();

        let mut pid = 0u32;
        GetWindowThreadProcessId(hwnd, Some(&mut pid));

        // 1. Rockstar Games DirectX render window class: grcWindow
        if class_name.eq_ignore_ascii_case("grcWindow") {
            finder.grc_hwnd = Some(hwnd);
            return BOOL(0); // Found the exact primary render window
        }

        // 2. Title contains FiveM or GTA V
        if title.contains("fivem") || title.contains("grand theft auto") {
            if finder.fivem_title_hwnd.is_none() {
                finder.fivem_title_hwnd = Some(hwnd);
            }
        }

        // 3. Process name contains fivem or gtaprocess
        if pid != 0 && finder.fivem_proc_hwnd.is_none() {
            if let Ok(snap) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
                let mut pe = PROCESSENTRY32W {
                    dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32,
                    ..Default::default()
                };
                if Process32FirstW(snap, &mut pe).is_ok() {
                    loop {
                        if pe.th32ProcessID == pid {
                            let len = pe.szExeFile.iter().position(|&c| c == 0).unwrap_or(pe.szExeFile.len());
                            let proc_name = String::from_utf16_lossy(&pe.szExeFile[..len]).to_lowercase();
                            if proc_name.contains("fivem") || proc_name.contains("gtaprocess") {
                                finder.fivem_proc_hwnd = Some(hwnd);
                            }
                            break;
                        }
                        if Process32NextW(snap, &mut pe).is_err() {
                            break;
                        }
                    }
                }
                let _ = CloseHandle(snap);
            }
        }

        BOOL(1)
    }

    pub fn find_fivem_window() -> Option<HWND> {
        unsafe {
            let mut finder = WindowFinder {
                grc_hwnd: None,
                fivem_title_hwnd: None,
                fivem_proc_hwnd: None,
            };

            let _ = EnumWindows(Some(enum_windows_proc), LPARAM(&mut finder as *mut _ as isize));

            finder.grc_hwnd
                .or(finder.fivem_title_hwnd)
                .or(finder.fivem_proc_hwnd)
        }
    }

    pub fn set_clipboard(text: &str) -> bool {
        let utf16: Vec<u16> = text.encode_utf16().chain(std::iter::once(0)).collect();
        let bytes_len = utf16.len() * std::mem::size_of::<u16>();

        unsafe {
            if OpenClipboard(HWND(std::ptr::null_mut())).is_err() {
                return false;
            }
            let _ = EmptyClipboard();

            let h_global = match GlobalAlloc(GMEM_MOVEABLE, bytes_len) {
                Ok(h) => h,
                Err(_) => {
                    let _ = CloseClipboard();
                    return false;
                }
            };

            let ptr = GlobalLock(h_global);
            if ptr.is_null() {
                let _ = CloseClipboard();
                return false;
            }

            std::ptr::copy_nonoverlapping(utf16.as_ptr() as *const std::ffi::c_void, ptr, bytes_len);
            let _ = GlobalUnlock(h_global);

            // 13 = CF_UNICODETEXT
            let _ = SetClipboardData(13, HANDLE(h_global.0));
            let _ = CloseClipboard();
            true
        }
    }

    pub fn force_foreground(hwnd: HWND) -> bool {
        unsafe {
            let current_tid = GetCurrentThreadId();
            let mut target_pid = 0u32;
            let target_tid = GetWindowThreadProcessId(hwnd, Some(&mut target_pid));

            let fg_hwnd = GetForegroundWindow();
            let fg_tid = if !fg_hwnd.0.is_null() {
                GetWindowThreadProcessId(fg_hwnd, None)
            } else {
                0
            };

            // Attach input queues to bypass foreground lock restrictions
            if fg_tid != 0 && fg_tid != current_tid {
                let _ = AttachThreadInput(current_tid, fg_tid, BOOL(1));
            }
            if target_tid != 0 && target_tid != current_tid {
                let _ = AttachThreadInput(current_tid, target_tid, BOOL(1));
            }

            if IsIconic(hwnd).as_bool() {
                let _ = ShowWindow(hwnd, SW_RESTORE);
            } else {
                let _ = ShowWindow(hwnd, SW_SHOW);
            }

            // Simulate Alt key: tells Windows kernel user pressed a key, granting foreground access
            keybd_event(0x12, 0x38, KEYBD_EVENT_FLAGS(0), 0);
            keybd_event(0x12, 0x38, KEYEVENTF_KEYUP, 0);

            let _ = BringWindowToTop(hwnd);
            let _ = SetForegroundWindow(hwnd);

            if fg_tid != 0 && fg_tid != current_tid {
                let _ = AttachThreadInput(current_tid, fg_tid, BOOL(0));
            }
            if target_tid != 0 && target_tid != current_tid {
                let _ = AttachThreadInput(current_tid, target_tid, BOOL(0));
            }

            std::thread::sleep(std::time::Duration::from_millis(250));

            let active = GetForegroundWindow();
            let mut active_pid = 0u32;
            GetWindowThreadProcessId(active, Some(&mut active_pid));
            active == hwnd || (target_pid != 0 && active_pid == target_pid)
        }
    }

    pub unsafe fn send_key_tap(vk: u8, scan: u8) {
        keybd_event(vk, scan, KEYBD_EVENT_FLAGS(0), 0);
        std::thread::sleep(std::time::Duration::from_millis(45));
        keybd_event(vk, scan, KEYEVENTF_KEYUP, 0);
        std::thread::sleep(std::time::Duration::from_millis(60));
    }

    pub unsafe fn send_ctrl_v() {
        // Ctrl Down
        keybd_event(0x11, 0x1D, KEYBD_EVENT_FLAGS(0), 0);
        std::thread::sleep(std::time::Duration::from_millis(30));
        // V Down
        keybd_event(0x56, 0x2F, KEYBD_EVENT_FLAGS(0), 0);
        std::thread::sleep(std::time::Duration::from_millis(40));
        // V Up
        keybd_event(0x56, 0x2F, KEYEVENTF_KEYUP, 0);
        std::thread::sleep(std::time::Duration::from_millis(30));
        // Ctrl Up
        keybd_event(0x11, 0x1D, KEYEVENTF_KEYUP, 0);
        std::thread::sleep(std::time::Duration::from_millis(60));
    }

    pub fn find_discord_window() -> Option<HWND> {
        unsafe {
            struct DiscordFinder {
                hwnd: Option<HWND>,
            }
            unsafe extern "system" fn enum_discord(hwnd: HWND, lparam: LPARAM) -> BOOL {
                let finder = &mut *(lparam.0 as *mut DiscordFinder);
                if !IsWindowVisible(hwnd).as_bool() {
                    return BOOL(1);
                }
                let mut pid = 0u32;
                GetWindowThreadProcessId(hwnd, Some(&mut pid));
                if pid != 0 {
                    if let Ok(snap) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
                        let mut pe = PROCESSENTRY32W {
                            dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32,
                            ..Default::default()
                        };
                        if Process32FirstW(snap, &mut pe).is_ok() {
                            loop {
                                if pe.th32ProcessID == pid {
                                    let len = pe.szExeFile.iter().position(|&c| c == 0).unwrap_or(pe.szExeFile.len());
                                    let proc_name = String::from_utf16_lossy(&pe.szExeFile[..len]).to_lowercase();
                                    if proc_name == "discord.exe" || proc_name == "discordcanary.exe" {
                                        finder.hwnd = Some(hwnd);
                                        let _ = CloseHandle(snap);
                                        return BOOL(0);
                                    }
                                    break;
                                }
                                if Process32NextW(snap, &mut pe).is_err() {
                                    break;
                                }
                            }
                        }
                        let _ = CloseHandle(snap);
                    }
                }
                BOOL(1)
            }

            let mut finder = DiscordFinder { hwnd: None };
            let _ = EnumWindows(Some(enum_discord), LPARAM(&mut finder as *mut _ as isize));
            finder.hwnd
        }
    }
}

#[tauri::command]
pub fn send_command_to_fivem(command: String) -> Result<String, String> {
    // 1. Eliminar cualquier barra '/' inicial (la consola F8 no usa '/')
    let clean_command = command.trim().trim_start_matches('/').to_string();

    #[cfg(windows)]
    {
        use win_native::*;

        // 2. Buscar ventana real de FiveM (grcWindow o proceso FiveM)
        let hwnd = match find_fivem_window() {
            Some(h) => h,
            None => {
                return Err("No se encontró ninguna ventana activa de FiveM. Asegúrate de tener el juego abierto.".to_string());
            }
        };

        // 3. Colocar el comando sin '/' en el portapapeles de Windows
        set_clipboard(&clean_command);

        // 4. Forzar el foco de FiveM a primer plano con bypass de Win32
        force_foreground(hwnd);
        std::thread::sleep(std::time::Duration::from_millis(250));

        // 5. Inyectar secuencia en la consola F8
        unsafe {
            // Pulsar F8 (scancode 0x42) para abrir la consola
            send_key_tap(0x77, 0x42);
            std::thread::sleep(std::time::Duration::from_millis(200));

            // Pegar comando mediante Ctrl+V
            send_ctrl_v();
            std::thread::sleep(std::time::Duration::from_millis(150));

            // Pulsar Enter (scancode 0x1C) para ejecutar el comando
            send_key_tap(0x0D, 0x1C);
            std::thread::sleep(std::time::Duration::from_millis(200));

            // Volver a pulsar F8 para cerrar la consola y devolver el control al jugador
            send_key_tap(0x77, 0x42);
        }

        Ok(format!("Comando ejecutado en la consola F8 de FiveM: {clean_command}"))
    }
    #[cfg(not(windows))]
    {
        Err("Esta función solo está disponible en Windows.".to_string())
    }
}

#[tauri::command]
pub fn send_report_to_discord(_guild_id: String, _channel_id: String, report_text: String) -> Result<String, String> {
    #[cfg(windows)]
    {
        use win_native::*;

        // Siempre copiar el reporte completo al portapapeles
        set_clipboard(&report_text);

        // Si Discord está abierto en segundo plano, enfocarlo y pegar sin abrir navegadores
        if let Some(discord_hwnd) = find_discord_window() {
            force_foreground(discord_hwnd);
            std::thread::sleep(std::time::Duration::from_millis(250));
            unsafe {
                send_ctrl_v();
                std::thread::sleep(std::time::Duration::from_millis(100));
                send_key_tap(0x0D, 0x1C);
            }
            Ok("Plantilla copiada y enviada directamente a Discord.".to_string())
        } else {
            Ok("Plantilla de sanción copiada al portapapeles. Pégala en Discord con Ctrl+V.".to_string())
        }
    }
    #[cfg(not(windows))]
    {
        Err("Esta función solo está disponible en Windows.".to_string())
    }
}
