use std::sync::Mutex;
use std::thread;
use tauri::{AppHandle, Manager, Emitter};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HotkeyConfig {
    pub hotkey: String,
    pub ticket_hotkey: Option<String>,
}

impl Default for HotkeyConfig {
    fn default() -> Self {
        Self {
            hotkey: "Win+J".to_string(),
            ticket_hotkey: Some("Win+Y".to_string()),
        }
    }
}

// Global state holding current hotkeys and thread ID for wake-up
static CURRENT_HOTKEY: Mutex<Option<String>> = Mutex::new(None);
static CURRENT_TICKET_HOTKEY: Mutex<Option<String>> = Mutex::new(None);
static HOTKEY_THREAD_ID: Mutex<Option<u32>> = Mutex::new(None);

#[cfg(windows)]
mod win_hotkey {
    use super::*;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::System::Threading::GetCurrentThreadId;
    use windows::Win32::UI::Input::KeyboardAndMouse::{
        RegisterHotKey, UnregisterHotKey, HOT_KEY_MODIFIERS, MOD_ALT, MOD_CONTROL, MOD_NOREPEAT,
        MOD_SHIFT, MOD_WIN,
    };
    use windows::Win32::UI::WindowsAndMessaging::{
        GetMessageW, PostThreadMessageW, MSG, WM_HOTKEY, WM_USER,
    };

    const HOTKEY_ID: i32 = 9999;
    const HOTKEY_TICKET_ID: i32 = 9998;
    pub const WM_RELOAD_HOTKEY: u32 = WM_USER + 101;

    fn parse_hotkey(str_val: &str) -> (HOT_KEY_MODIFIERS, u32) {
        let parts: Vec<&str> = str_val.split('+').map(|s| s.trim()).collect();
        let mut modifiers = MOD_NOREPEAT;
        let mut vk_code = 0x4Au32; // Default 'J'

        for part in &parts {
            let p_upper = part.to_uppercase();
            match p_upper.as_str() {
                "WIN" | "WINDOWS" | "SUPER" => modifiers |= MOD_WIN,
                "CTRL" | "CONTROL" => modifiers |= MOD_CONTROL,
                "ALT" => modifiers |= MOD_ALT,
                "SHIFT" => modifiers |= MOD_SHIFT,
                key => {
                    // Function keys F1 - F12
                    if key.starts_with('F') && key.len() >= 2 {
                        if let Ok(num) = key[1..].parse::<u32>() {
                            if (1..=12).contains(&num) {
                                vk_code = 0x70 + (num - 1); // VK_F1 = 0x70
                                continue;
                            }
                        }
                    }
                    // Numbers 0-9
                    if key.len() == 1 {
                        let ch = key.chars().next().unwrap();
                        if ch.is_ascii_digit() {
                            vk_code = ch as u32; // '0' is 0x30
                            continue;
                        }
                        if ch.is_ascii_alphabetic() {
                            vk_code = ch.to_ascii_uppercase() as u32; // 'A' is 0x41
                            continue;
                        }
                    }
                    if key == "SPACE" {
                        vk_code = 0x20;
                    }
                }
            }
        }

        (modifiers, vk_code)
    }

    pub fn start_hotkey_listener(app_handle: AppHandle, initial_hotkey: String, initial_ticket_hotkey: String) {
        {
            let mut cur = CURRENT_HOTKEY.lock().unwrap();
            *cur = Some(initial_hotkey);
            let mut cur_ticket = CURRENT_TICKET_HOTKEY.lock().unwrap();
            *cur_ticket = Some(initial_ticket_hotkey);
        }

        thread::spawn(move || unsafe {
            let thread_id = GetCurrentThreadId();
            {
                let mut tid = HOTKEY_THREAD_ID.lock().unwrap();
                *tid = Some(thread_id);
            }

            // Register initial toggle hotkey (Win+J)
            let initial = CURRENT_HOTKEY.lock().unwrap().clone().unwrap_or_else(|| "Win+J".to_string());
            let (mut mods, mut vk) = parse_hotkey(&initial);
            let _ = RegisterHotKey(HWND(std::ptr::null_mut()), HOTKEY_ID, mods, vk);

            // Register initial ticket audit hotkey (Win+Y)
            let initial_ticket = CURRENT_TICKET_HOTKEY.lock().unwrap().clone().unwrap_or_else(|| "Win+Y".to_string());
            let (mut ticket_mods, mut ticket_vk) = parse_hotkey(&initial_ticket);
            let _ = RegisterHotKey(HWND(std::ptr::null_mut()), HOTKEY_TICKET_ID, ticket_mods, ticket_vk);

            let mut msg = MSG::default();
            loop {
                let ret = GetMessageW(&mut msg, HWND(std::ptr::null_mut()), 0, 0);
                if ret.0 <= 0 {
                    // Si hubo un error o señal espuria, re-registrar atajos y continuar
                    thread::sleep(std::time::Duration::from_millis(150));
                    let _ = RegisterHotKey(HWND(std::ptr::null_mut()), HOTKEY_ID, mods, vk);
                    let _ = RegisterHotKey(HWND(std::ptr::null_mut()), HOTKEY_TICKET_ID, ticket_mods, ticket_vk);
                    continue;
                }

                if msg.message == WM_HOTKEY {
                    let hotkey_id = msg.wParam.0 as i32;

                    if hotkey_id == HOTKEY_ID {
                        // Toggle window minimize / restore
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let is_minimized = window.is_minimized().unwrap_or(false);
                            let is_visible = window.is_visible().unwrap_or(false);
                            let is_focused = window.is_focused().unwrap_or(false);

                            if is_visible && !is_minimized && is_focused {
                                let _ = window.minimize();
                            } else {
                                let _ = window.unminimize();
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    } else if hotkey_id == HOTKEY_TICKET_ID {
                        // Capturar ticket de Discord activo en un hilo separado para NO bloquear el listener
                        let app_handle_clone = app_handle.clone();
                        thread::spawn(move || {
                            let captured_res = crate::commands::discord_reader::capture_active_discord_ticket();
                            match captured_res {
                                Ok(ticket) => {
                                    let _ = app_handle_clone.emit("discord-ticket-captured", ticket);
                                }
                                Err(err_msg) => {
                                    let _ = app_handle_clone.emit("discord-ticket-capture-failed", err_msg);
                                }
                            }
                        });
                    }
                } else if msg.message == WM_RELOAD_HOTKEY {
                    // Unregister both and re-register with updated config
                    let _ = UnregisterHotKey(HWND(std::ptr::null_mut()), HOTKEY_ID);
                    let _ = UnregisterHotKey(HWND(std::ptr::null_mut()), HOTKEY_TICKET_ID);

                    let new_hotkey = CURRENT_HOTKEY.lock().unwrap().clone().unwrap_or_else(|| "Win+J".to_string());
                    let (new_mods, new_vk) = parse_hotkey(&new_hotkey);
                    mods = new_mods;
                    vk = new_vk;
                    let _ = RegisterHotKey(HWND(std::ptr::null_mut()), HOTKEY_ID, mods, vk);

                    let new_ticket_hotkey = CURRENT_TICKET_HOTKEY.lock().unwrap().clone().unwrap_or_else(|| "Win+Y".to_string());
                    let (new_t_mods, new_t_vk) = parse_hotkey(&new_ticket_hotkey);
                    ticket_mods = new_t_mods;
                    ticket_vk = new_t_vk;
                    let _ = RegisterHotKey(HWND(std::ptr::null_mut()), HOTKEY_TICKET_ID, ticket_mods, ticket_vk);
                }
            }
        });
    }

    pub fn reload_hotkey(new_hotkey: Option<String>, new_ticket_hotkey: Option<String>) {
        {
            if let Some(h) = new_hotkey {
                let mut cur = CURRENT_HOTKEY.lock().unwrap();
                *cur = Some(h);
            }
            if let Some(th) = new_ticket_hotkey {
                let mut cur_ticket = CURRENT_TICKET_HOTKEY.lock().unwrap();
                *cur_ticket = Some(th);
            }
        }
        if let Some(tid) = *HOTKEY_THREAD_ID.lock().unwrap() {
            unsafe {
                let _ = PostThreadMessageW(tid, WM_RELOAD_HOTKEY, windows::Win32::Foundation::WPARAM(0), windows::Win32::Foundation::LPARAM(0));
            }
        }
    }
}

#[tauri::command]
pub fn get_toggle_hotkey() -> Result<String, String> {
    let cur = CURRENT_HOTKEY.lock().unwrap();
    Ok(cur.clone().unwrap_or_else(|| "Win+J".to_string()))
}

#[tauri::command]
pub fn set_toggle_hotkey(hotkey: String) -> Result<String, String> {
    let clean = hotkey.trim().to_string();
    if clean.is_empty() {
        return Err("El atajo no puede estar vacío.".to_string());
    }

    #[cfg(windows)]
    win_hotkey::reload_hotkey(Some(clean.clone()), None);

    Ok(format!("Atajo de ventana actualizado a: {clean}"))
}

#[tauri::command]
pub fn get_ticket_hotkey() -> Result<String, String> {
    let cur = CURRENT_TICKET_HOTKEY.lock().unwrap();
    Ok(cur.clone().unwrap_or_else(|| "Win+Y".to_string()))
}

#[tauri::command]
pub fn set_ticket_hotkey(hotkey: String) -> Result<String, String> {
    let clean = hotkey.trim().to_string();
    if clean.is_empty() {
        return Err("El atajo de ticket no puede estar vacío.".to_string());
    }

    #[cfg(windows)]
    win_hotkey::reload_hotkey(None, Some(clean.clone()));

    Ok(format!("Atajo de tickets actualizado a: {clean}"))
}

#[tauri::command]
pub fn toggle_main_window(app_handle: AppHandle) -> Result<bool, String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        let is_minimized = window.is_minimized().unwrap_or(false);
        let is_visible = window.is_visible().unwrap_or(false);
        let is_focused = window.is_focused().unwrap_or(false);

        if is_visible && !is_minimized && is_focused {
            let _ = window.minimize();
            Ok(false)
        } else {
            let _ = window.unminimize();
            let _ = window.show();
            let _ = window.set_focus();
            Ok(true)
        }
    } else {
        Err("No se pudo obtener la ventana principal.".to_string())
    }
}

pub fn init_hotkey_service(app_handle: AppHandle) {
    #[cfg(windows)]
    {
        let saved_hotkey = "Win+J".to_string();
        let saved_ticket_hotkey = "Win+Y".to_string();
        win_hotkey::start_hotkey_listener(app_handle, saved_hotkey, saved_ticket_hotkey);
    }
}

