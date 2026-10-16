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
    use windows::Win32::Foundation::{BOOL, HWND, LPARAM, HANDLE, RECT, CloseHandle};
    use windows::Win32::UI::WindowsAndMessaging::{
        EnumWindows, GetClassNameW, GetWindowTextW, GetWindowThreadProcessId, IsWindowVisible,
        SetForegroundWindow, ShowWindow, BringWindowToTop, GetForegroundWindow, GetWindowRect,
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

    #[derive(Debug, Clone, Copy, PartialEq, Eq)]
    pub enum DiscordFlavor {
        Canary,
        PTB,
        Stable,
    }

    impl DiscordFlavor {
        pub fn display_name(&self) -> &'static str {
            match self {
                DiscordFlavor::Canary => "Discord Canary",
                DiscordFlavor::PTB => "Discord PTB",
                DiscordFlavor::Stable => "Discord",
            }
        }

        pub fn folder_name(&self) -> &'static str {
            match self {
                DiscordFlavor::Canary => "DiscordCanary",
                DiscordFlavor::PTB => "DiscordPTB",
                DiscordFlavor::Stable => "Discord",
            }
        }

        pub fn exe_name(&self) -> &'static str {
            match self {
                DiscordFlavor::Canary => "DiscordCanary.exe",
                DiscordFlavor::PTB => "DiscordPTB.exe",
                DiscordFlavor::Stable => "Discord.exe",
            }
        }

        pub fn matches_proc(&self, proc_name: &str) -> bool {
            let p = proc_name.to_lowercase();
            match self {
                DiscordFlavor::Canary => p == "discordcanary.exe" || p == "discordcanary",
                DiscordFlavor::PTB => p == "discordptb.exe" || p == "discordptb",
                DiscordFlavor::Stable => p == "discord.exe" || p == "discord",
            }
        }
    }

    pub fn get_discord_executable_path(flavor: DiscordFlavor) -> Option<std::path::PathBuf> {
        let local = std::env::var("LOCALAPPDATA").ok()?;
        let dir = std::path::PathBuf::from(&local).join(flavor.folder_name());

        // 1. Ejecutable directo en la raíz de la carpeta
        let root_exe = dir.join(flavor.exe_name());
        if root_exe.exists() {
            return Some(root_exe);
        }

        // 2. Ejecutable dentro de la versión más reciente app-1.0.xxxx
        if let Ok(entries) = std::fs::read_dir(&dir) {
            let mut app_dirs: Vec<std::path::PathBuf> = entries
                .filter_map(|e| e.ok())
                .map(|e| e.path())
                .filter(|p| p.is_dir() && p.file_name().map_or(false, |n| n.to_string_lossy().starts_with("app-")))
                .collect();
            app_dirs.sort();
            if let Some(latest) = app_dirs.last() {
                let app_exe = latest.join(flavor.exe_name());
                if app_exe.exists() {
                    return Some(app_exe);
                }
            }
        }

        None
    }

    pub fn detect_target_discord() -> DiscordFlavor {
        let mut canary_running = false;
        let mut ptb_running = false;
        let mut stable_running = false;

        unsafe {
            if let Ok(snap) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
                let mut pe = PROCESSENTRY32W {
                    dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32,
                    ..Default::default()
                };
                if Process32FirstW(snap, &mut pe).is_ok() {
                    loop {
                        let len = pe.szExeFile.iter().position(|&c| c == 0).unwrap_or(pe.szExeFile.len());
                        let proc_name = String::from_utf16_lossy(&pe.szExeFile[..len]).to_lowercase();
                        if proc_name == "discordcanary.exe" || proc_name == "discordcanary" {
                            canary_running = true;
                        } else if proc_name == "discordptb.exe" || proc_name == "discordptb" {
                            ptb_running = true;
                        } else if proc_name == "discord.exe" || proc_name == "discord" {
                            stable_running = true;
                        }
                        if Process32NextW(snap, &mut pe).is_err() {
                            break;
                        }
                    }
                }
                let _ = CloseHandle(snap);
            }
        }

        // Si Canary tiene una ventana visible activa, prioridad absoluta a Canary
        if canary_running && find_discord_window_for_flavor(DiscordFlavor::Canary).is_some() {
            return DiscordFlavor::Canary;
        }
        if ptb_running && find_discord_window_for_flavor(DiscordFlavor::PTB).is_some() {
            return DiscordFlavor::PTB;
        }
        if stable_running && find_discord_window_for_flavor(DiscordFlavor::Stable).is_some() {
            return DiscordFlavor::Stable;
        }

        // Si uno de los clientes está en ejecución
        if canary_running && !stable_running {
            return DiscordFlavor::Canary;
        }
        if ptb_running && !stable_running {
            return DiscordFlavor::PTB;
        }
        if stable_running && !canary_running {
            return DiscordFlavor::Stable;
        }
        if canary_running {
            return DiscordFlavor::Canary;
        }

        // Si ninguno está en ejecución, verificar cuál está instalado en disco
        let local = std::env::var("LOCALAPPDATA").unwrap_or_default();
        if !local.is_empty() {
            let canary_exe = std::path::PathBuf::from(&local).join("DiscordCanary").join("DiscordCanary.exe");
            let stable_exe = std::path::PathBuf::from(&local).join("Discord").join("Discord.exe");
            if canary_exe.exists() && !stable_exe.exists() {
                return DiscordFlavor::Canary;
            }
            if stable_exe.exists() && !canary_exe.exists() {
                return DiscordFlavor::Stable;
            }
            if canary_exe.exists() {
                return DiscordFlavor::Canary;
            }
        }

        DiscordFlavor::Stable
    }

    pub fn open_discord_channel(flavor: DiscordFlavor, guild_id: &str, channel_id: &str) {
        use std::os::windows::process::CommandExt;

        let deep_link = format!("discord:///channels/{guild_id}/{channel_id}");

        match flavor {
            DiscordFlavor::Canary => {
                // IMPORTANTE: NO invocar 'start discord://' porque Windows asocia discord:// a Discord.exe (Stable).
                // En su lugar, ejecutamos DiscordCanary.exe directamente con '--url'.
                // Si Canary ya está abierto, Electron captura el segundo argumento mediante single-instance y navega de inmediato.
                if let Some(exe) = get_discord_executable_path(DiscordFlavor::Canary) {
                    let _ = std::process::Command::new(&exe)
                        .args(["--url", "--", &deep_link])
                        .creation_flags(0x08000000)
                        .spawn();
                } else {
                    let canary_uri = format!("discordcanary:///channels/{guild_id}/{channel_id}");
                    let _ = std::process::Command::new("cmd")
                        .args(["/C", "start", "", &canary_uri])
                        .creation_flags(0x08000000)
                        .spawn();
                }
            }
            DiscordFlavor::PTB => {
                if let Some(exe) = get_discord_executable_path(DiscordFlavor::PTB) {
                    let _ = std::process::Command::new(&exe)
                        .args(["--url", "--", &deep_link])
                        .creation_flags(0x08000000)
                        .spawn();
                } else {
                    let ptb_uri = format!("discordptb:///channels/{guild_id}/{channel_id}");
                    let _ = std::process::Command::new("cmd")
                        .args(["/C", "start", "", &ptb_uri])
                        .creation_flags(0x08000000)
                        .spawn();
                }
            }
            DiscordFlavor::Stable => {
                if let Some(exe) = get_discord_executable_path(DiscordFlavor::Stable) {
                    let _ = std::process::Command::new(&exe)
                        .args(["--url", "--", &deep_link])
                        .creation_flags(0x08000000)
                        .spawn();
                } else {
                    let _ = std::process::Command::new("cmd")
                        .args(["/C", "start", "", &deep_link])
                        .creation_flags(0x08000000)
                        .spawn();
                }
            }
        }
    }

    pub fn find_discord_window_for_flavor(flavor: DiscordFlavor) -> Option<HWND> {
        unsafe {
            struct DiscordFinder {
                best_hwnd: Option<HWND>,
                max_area: i32,
                flavor: DiscordFlavor,
            }
            unsafe extern "system" fn enum_discord(hwnd: HWND, lparam: LPARAM) -> BOOL {
                let finder = &mut *(lparam.0 as *mut DiscordFinder);
                if !IsWindowVisible(hwnd).as_bool() {
                    return BOOL(1);
                }
                let mut pid = 0u32;
                GetWindowThreadProcessId(hwnd, Some(&mut pid));
                if pid == 0 {
                    return BOOL(1);
                }

                if let Ok(snap) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
                    let mut pe = PROCESSENTRY32W {
                        dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32,
                        ..Default::default()
                    };
                    if Process32FirstW(snap, &mut pe).is_ok() {
                        loop {
                            if pe.th32ProcessID == pid {
                                let len = pe.szExeFile.iter().position(|&c| c == 0).unwrap_or(pe.szExeFile.len());
                                let proc_name = String::from_utf16_lossy(&pe.szExeFile[..len]);
                                
                                // Emparejamiento estricto: solo coincide con el proceso del flavor deseado
                                if finder.flavor.matches_proc(&proc_name) {
                                    let mut rect = RECT::default();
                                    if GetWindowRect(hwnd, &mut rect).is_ok() {
                                        let width = rect.right - rect.left;
                                        let height = rect.bottom - rect.top;
                                        let area = width * height;
                                        // Ventana primaria real: width > 300, height > 200 y mayor área
                                        if width > 300 && height > 200 && area > finder.max_area {
                                            finder.max_area = area;
                                            finder.best_hwnd = Some(hwnd);
                                        }
                                    }
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
                BOOL(1)
            }

            let mut finder = DiscordFinder { best_hwnd: None, max_area: 0, flavor };
            let _ = EnumWindows(Some(enum_discord), LPARAM(&mut finder as *mut _ as isize));
            finder.best_hwnd
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
pub fn send_report_to_discord(guild_id: String, channel_id: String, report_text: String) -> Result<String, String> {
    #[cfg(windows)]
    {
        use win_native::*;

        // 1. Detectar qué variante de Discord (Canary, PTB o Stable) está en uso
        let target_flavor = detect_target_discord();

        // 2. Colocar el reporte completo en el portapapeles de Windows
        set_clipboard(&report_text);

        // 3. Navegar específicamente el cliente detectado hacia el canal correspondiente
        let g = guild_id.trim();
        let c = channel_id.trim();
        if !g.is_empty() && !c.is_empty() {
            open_discord_channel(target_flavor, g, c);
        }

        // 4. Pausa prudencial para permitir que Discord renderice el canal en el DOM
        std::thread::sleep(std::time::Duration::from_millis(900));

        // 5. Buscar estrictamente la ventana del Discord objetivo (hasta 3 intentos)
        let mut discord_hwnd = find_discord_window_for_flavor(target_flavor);
        if discord_hwnd.is_none() {
            std::thread::sleep(std::time::Duration::from_millis(450));
            discord_hwnd = find_discord_window_for_flavor(target_flavor);
        }
        if discord_hwnd.is_none() {
            std::thread::sleep(std::time::Duration::from_millis(600));
            discord_hwnd = find_discord_window_for_flavor(target_flavor);
        }

        if let Some(hwnd) = discord_hwnd {
            force_foreground(hwnd);
            std::thread::sleep(std::time::Duration::from_millis(350));
            unsafe {
                // Pegar plantilla con Ctrl+V en la caja de texto del canal
                send_ctrl_v();
                std::thread::sleep(std::time::Duration::from_millis(150));
                // Pulsar Enter para enviar el mensaje
                send_key_tap(0x0D, 0x1C);
            }
            Ok(format!("Plantilla de sanción enviada correctamente a {} en el canal de sanciones.", target_flavor.display_name()))
        } else {
            Ok(format!("Plantilla copiada al portapapeles y canal abierto en {}. Pégala con Ctrl+V si no se envió automáticamente.", target_flavor.display_name()))
        }
    }
    #[cfg(not(windows))]
    {
        Err("Esta función solo está disponible en Windows.".to_string())
    }
}
