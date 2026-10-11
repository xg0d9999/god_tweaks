use std::sync::Mutex;
use std::thread;
use tauri::{AppHandle, Manager};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HotkeyConfig {
    pub hotkey: String,
}

impl Default for HotkeyConfig {
    fn default() -> Self {
        Self {
            hotkey: "Win+J".to_string(),
        }
    }
}

// Global state holding current hotkey and thread ID for wake-up
static CURRENT_HOTKEY: Mutex<Option<String>> = Mutex::new(None);
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

    pub fn start_hotkey_listener(app_handle: AppHandle, initial_hotkey: String) {
        {
            let mut cur = CURRENT_HOTKEY.lock().unwrap();
            *cur = Some(initial_hotkey);
        }

        thread::spawn(move || unsafe {
            let thread_id = GetCurrentThreadId();
            {
                let mut tid = HOTKEY_THREAD_ID.lock().unwrap();
                *tid = Some(thread_id);
            }

            // Register initial hotkey
            let initial = CURRENT_HOTKEY.lock().unwrap().clone().unwrap_or_else(|| "Win+J".to_string());
            let (mut mods, mut vk) = parse_hotkey(&initial);
            let _ = RegisterHotKey(HWND(std::ptr::null_mut()), HOTKEY_ID, mods, vk);

            let mut msg = MSG::default();
            while GetMessageW(&mut msg, HWND(std::ptr::null_mut()), 0, 0).as_bool() {
                if msg.message == WM_HOTKEY && msg.wParam.0 as i32 == HOTKEY_ID {
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
                } else if msg.message == WM_RELOAD_HOTKEY {
                    // Unregister and re-register with updated config
                    let _ = UnregisterHotKey(HWND(std::ptr::null_mut()), HOTKEY_ID);
                    let new_hotkey = CURRENT_HOTKEY.lock().unwrap().clone().unwrap_or_else(|| "Win+J".to_string());
                    let (new_mods, new_vk) = parse_hotkey(&new_hotkey);
                    mods = new_mods;
                    vk = new_vk;
                    let _ = RegisterHotKey(HWND(std::ptr::null_mut()), HOTKEY_ID, mods, vk);
                }
            }

            let _ = UnregisterHotKey(HWND(std::ptr::null_mut()), HOTKEY_ID);
        });
    }

    pub fn reload_hotkey(new_hotkey: String) {
        {
            let mut cur = CURRENT_HOTKEY.lock().unwrap();
            *cur = Some(new_hotkey);
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
    win_hotkey::reload_hotkey(clean.clone());

    Ok(format!("Atajo actualizado a: {clean}"))
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
        // Try reading saved hotkey or default to Win+J
        let saved_hotkey = "Win+J".to_string();
        win_hotkey::start_hotkey_listener(app_handle, saved_hotkey);
    }
}
