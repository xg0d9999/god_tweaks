use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CapturedDiscordTicket {
    pub channel_name: String,
    pub transcript: String,
    pub source: String,
    pub timestamp: String,
}

#[cfg(windows)]
mod win_reader {
    use std::thread::sleep;
    use std::time::Duration;
    use windows::Win32::Foundation::{BOOL, HGLOBAL, HWND, LPARAM, POINT, RECT};
    use windows::Win32::System::DataExchange::{
        CloseClipboard, EmptyClipboard, GetClipboardData, IsClipboardFormatAvailable, OpenClipboard,
    };
    use windows::Win32::System::Memory::{GlobalLock, GlobalUnlock};
    use windows::Win32::System::Threading::{
        OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows::Win32::System::ProcessStatus::GetModuleBaseNameW;
    use windows::Win32::UI::Input::KeyboardAndMouse::{
        SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, INPUT_MOUSE, KEYBDINPUT, KEYBD_EVENT_FLAGS,
        KEYEVENTF_KEYUP, MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_LEFTUP, MOUSEINPUT, VIRTUAL_KEY,
        VK_CONTROL, VK_ESCAPE,
    };
    use windows::Win32::UI::WindowsAndMessaging::{
        BringWindowToTop, EnumWindows, GetCursorPos, GetForegroundWindow,
        GetWindowRect, GetWindowTextW, GetWindowThreadProcessId, IsIconic, IsWindowVisible,
        SetCursorPos, SetForegroundWindow, ShowWindow, SW_RESTORE, SW_SHOW,
    };

    const CF_UNICODETEXT: u32 = 13;
    const VK_KEY_A: VIRTUAL_KEY = VIRTUAL_KEY(0x41);
    const VK_KEY_C: VIRTUAL_KEY = VIRTUAL_KEY(0x43);
    const VK_MENU: VIRTUAL_KEY = VIRTUAL_KEY(0x12);      // Alt
    const VK_LWIN: VIRTUAL_KEY = VIRTUAL_KEY(0x5B);
    const VK_RWIN: VIRTUAL_KEY = VIRTUAL_KEY(0x5C);
    const VK_SHIFT_KEY: VIRTUAL_KEY = VIRTUAL_KEY(0x10);
    const VK_KEY_Y: VIRTUAL_KEY = VIRTUAL_KEY(0x59);
    const VK_PAGE_UP: VIRTUAL_KEY = VIRTUAL_KEY(0x21);

    struct WindowCandidate {
        hwnd: HWND,
        title: String,
        proc_name: String,
        area: i32,
    }

    pub fn find_discord_window() -> Option<(HWND, String, String)> {
        unsafe {
            let foreground = GetForegroundWindow();
            let mut candidates: Vec<WindowCandidate> = Vec::new();
            let ptr = &mut candidates as *mut Vec<WindowCandidate>;

            unsafe extern "system" fn enum_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
                if !IsWindowVisible(hwnd).as_bool() {
                    return BOOL(1);
                }

                let mut rect = RECT::default();
                if GetWindowRect(hwnd, &mut rect).is_err() {
                    return BOOL(1);
                }
                let width = rect.right - rect.left;
                let height = rect.bottom - rect.top;
                if width < 300 || height < 200 {
                    return BOOL(1);
                }

                let mut pid: u32 = 0;
                GetWindowThreadProcessId(hwnd, Some(&mut pid));
                if pid == 0 {
                    return BOOL(1);
                }

                let mut proc_name = String::new();
                if let Ok(proc_handle) = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) {
                    let mut name_buf = [0u16; 260];
                    let n_len = GetModuleBaseNameW(proc_handle, None, &mut name_buf);
                    if n_len > 0 {
                        proc_name = String::from_utf16_lossy(&name_buf[..n_len as usize]);
                    }
                    let _ = windows::Win32::Foundation::CloseHandle(proc_handle);
                }

                let mut title_buf = [0u16; 512];
                let len = GetWindowTextW(hwnd, &mut title_buf);
                let title = if len > 0 {
                    String::from_utf16_lossy(&title_buf[..len as usize])
                } else {
                    String::new()
                };

                let proc_lower = proc_name.to_lowercase();
                let title_lower = title.to_lowercase();

                let is_discord_proc = proc_lower.contains("discord");
                let is_discord_title = title_lower.contains("discord");

                if is_discord_proc || is_discord_title {
                    let list = &mut *(lparam.0 as *mut Vec<WindowCandidate>);
                    let area = width * height;
                    list.push(WindowCandidate {
                        hwnd,
                        title,
                        proc_name,
                        area,
                    });
                }

                BOOL(1)
            }

            let _ = EnumWindows(Some(enum_proc), LPARAM(ptr as isize));

            if candidates.is_empty() {
                // Comprobación de respaldo en ventana actual
                let (f_hwnd, f_title, f_proc) = get_active_window_info();
                if f_proc.to_lowercase().contains("discord") || f_title.to_lowercase().contains("discord") {
                    return Some((f_hwnd, f_title, f_proc));
                }
                return None;
            }

            for c in &candidates {
                if c.hwnd == foreground {
                    return Some((c.hwnd, c.title.clone(), c.proc_name.clone()));
                }
            }

            candidates.sort_by(|a, b| b.area.cmp(&a.area));
            let best = &candidates[0];
            Some((best.hwnd, best.title.clone(), best.proc_name.clone()))
        }
    }

    pub fn get_active_window_info() -> (HWND, String, String) {
        unsafe {
            let hwnd = GetForegroundWindow();
            if hwnd.0.is_null() {
                return (HWND(std::ptr::null_mut()), String::new(), String::new());
            }

            let mut title_buf = [0u16; 512];
            let len = GetWindowTextW(hwnd, &mut title_buf);
            let title = if len > 0 {
                String::from_utf16_lossy(&title_buf[..len as usize])
            } else {
                String::new()
            };

            let mut pid: u32 = 0;
            GetWindowThreadProcessId(hwnd, Some(&mut pid));
            let mut proc_name = String::new();

            if pid > 0 {
                if let Ok(proc_handle) = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) {
                    let mut name_buf = [0u16; 260];
                    let n_len = GetModuleBaseNameW(proc_handle, None, &mut name_buf);
                    if n_len > 0 {
                        proc_name = String::from_utf16_lossy(&name_buf[..n_len as usize]);
                    }
                    let _ = windows::Win32::Foundation::CloseHandle(proc_handle);
                }
            }

            (hwnd, title, proc_name)
        }
    }

    pub fn focus_window(hwnd: HWND) {
        unsafe {
            if hwnd.0.is_null() {
                return;
            }

            if IsIconic(hwnd).as_bool() {
                let _ = ShowWindow(hwnd, SW_RESTORE);
            } else {
                let _ = ShowWindow(hwnd, SW_SHOW);
            }

            // Desbloqueo seguro de foreground en Windows (toque de Alt sin interferir con colas de mensajes)
            send_single_key(VK_MENU);

            let _ = BringWindowToTop(hwnd);
            let _ = SetForegroundWindow(hwnd);
        }
    }

    pub fn release_all_modifier_keys() {
        unsafe {
            let keys = [
                VK_LWIN,
                VK_RWIN,
                VK_CONTROL,
                VK_MENU,
                VK_SHIFT_KEY,
                VK_KEY_Y,
            ];
            for k in keys {
                let input = INPUT {
                    r#type: INPUT_KEYBOARD,
                    Anonymous: INPUT_0 {
                        ki: KEYBDINPUT {
                            wVk: k,
                            wScan: 0,
                            dwFlags: KEYEVENTF_KEYUP,
                            time: 0,
                            dwExtraInfo: 0,
                        },
                    },
                };
                SendInput(&[input], std::mem::size_of::<INPUT>() as i32);
            }
        }
    }

    pub fn read_clipboard_text() -> Option<String> {
        unsafe {
            if IsClipboardFormatAvailable(CF_UNICODETEXT).is_err() {
                return None;
            }

            if OpenClipboard(HWND(std::ptr::null_mut())).is_err() {
                return None;
            }

            let handle_res = GetClipboardData(CF_UNICODETEXT);
            let text = if let Ok(handle) = handle_res {
                let hglobal = HGLOBAL(handle.0);
                let ptr = GlobalLock(hglobal);
                if !ptr.is_null() {
                    let wide_slice = std::slice::from_raw_parts(
                        ptr as *const u16,
                        wcslen(ptr as *const u16),
                    );
                    let s = String::from_utf16_lossy(wide_slice);
                    let _ = GlobalUnlock(hglobal);
                    Some(s)
                } else {
                    None
                }
            } else {
                None
            };

            let _ = CloseClipboard();
            text
        }
    }

    pub fn clear_clipboard() {
        unsafe {
            if OpenClipboard(HWND(std::ptr::null_mut())).is_ok() {
                let _ = EmptyClipboard();
                let _ = CloseClipboard();
            }
        }
    }

    unsafe fn wcslen(mut ptr: *const u16) -> usize {
        let mut len = 0;
        while *ptr != 0 {
            len += 1;
            ptr = ptr.add(1);
        }
        len
    }

    unsafe fn send_key_combo(mod_key: VIRTUAL_KEY, key: VIRTUAL_KEY) {
        let inputs = [
            INPUT {
                r#type: INPUT_KEYBOARD,
                Anonymous: INPUT_0 {
                    ki: KEYBDINPUT {
                        wVk: mod_key,
                        wScan: 0,
                        dwFlags: KEYBD_EVENT_FLAGS(0),
                        time: 0,
                        dwExtraInfo: 0,
                    },
                },
            },
            INPUT {
                r#type: INPUT_KEYBOARD,
                Anonymous: INPUT_0 {
                    ki: KEYBDINPUT {
                        wVk: key,
                        wScan: 0,
                        dwFlags: KEYBD_EVENT_FLAGS(0),
                        time: 0,
                        dwExtraInfo: 0,
                    },
                },
            },
            INPUT {
                r#type: INPUT_KEYBOARD,
                Anonymous: INPUT_0 {
                    ki: KEYBDINPUT {
                        wVk: key,
                        wScan: 0,
                        dwFlags: KEYEVENTF_KEYUP,
                        time: 0,
                        dwExtraInfo: 0,
                    },
                },
            },
            INPUT {
                r#type: INPUT_KEYBOARD,
                Anonymous: INPUT_0 {
                    ki: KEYBDINPUT {
                        wVk: mod_key,
                        wScan: 0,
                        dwFlags: KEYEVENTF_KEYUP,
                        time: 0,
                        dwExtraInfo: 0,
                    },
                },
            },
        ];
        SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);
    }

    unsafe fn send_single_key(key: VIRTUAL_KEY) {
        let inputs = [
            INPUT {
                r#type: INPUT_KEYBOARD,
                Anonymous: INPUT_0 {
                    ki: KEYBDINPUT {
                        wVk: key,
                        wScan: 0,
                        dwFlags: KEYBD_EVENT_FLAGS(0),
                        time: 0,
                        dwExtraInfo: 0,
                    },
                },
            },
            INPUT {
                r#type: INPUT_KEYBOARD,
                Anonymous: INPUT_0 {
                    ki: KEYBDINPUT {
                        wVk: key,
                        wScan: 0,
                        dwFlags: KEYEVENTF_KEYUP,
                        time: 0,
                        dwExtraInfo: 0,
                    },
                },
            },
        ];
        SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);
    }

    unsafe fn mouse_click(x: i32, y: i32) {
        let _ = SetCursorPos(x, y);
        sleep(Duration::from_millis(40));

        let click_inputs = [
            INPUT {
                r#type: INPUT_MOUSE,
                Anonymous: INPUT_0 {
                    mi: MOUSEINPUT {
                        dx: 0,
                        dy: 0,
                        mouseData: 0,
                        dwFlags: MOUSEEVENTF_LEFTDOWN,
                        time: 0,
                        dwExtraInfo: 0,
                    },
                },
            },
            INPUT {
                r#type: INPUT_MOUSE,
                Anonymous: INPUT_0 {
                    mi: MOUSEINPUT {
                        dx: 0,
                        dy: 0,
                        mouseData: 0,
                        dwFlags: MOUSEEVENTF_LEFTUP,
                        time: 0,
                        dwExtraInfo: 0,
                    },
                },
            },
        ];
        SendInput(&click_inputs, std::mem::size_of::<INPUT>() as i32);
    }

    unsafe fn mouse_drag(from_x: i32, from_y: i32, to_x: i32, to_y: i32) {
        let _ = SetCursorPos(from_x, from_y);
        sleep(Duration::from_millis(50));

        let down_input = [INPUT {
            r#type: INPUT_MOUSE,
            Anonymous: INPUT_0 {
                mi: MOUSEINPUT {
                    dx: 0,
                    dy: 0,
                    mouseData: 0,
                    dwFlags: MOUSEEVENTF_LEFTDOWN,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        }];
        SendInput(&down_input, std::mem::size_of::<INPUT>() as i32);
        sleep(Duration::from_millis(60));

        let _ = SetCursorPos(to_x, to_y);
        sleep(Duration::from_millis(80));

        let up_input = [INPUT {
            r#type: INPUT_MOUSE,
            Anonymous: INPUT_0 {
                mi: MOUSEINPUT {
                    dx: 0,
                    dy: 0,
                    mouseData: 0,
                    dwFlags: MOUSEEVENTF_LEFTUP,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        }];
        SendInput(&up_input, std::mem::size_of::<INPUT>() as i32);
        sleep(Duration::from_millis(60));
    }

    pub fn scrape_discord_messages(hwnd: HWND) -> Result<String, String> {
        unsafe {
            // 1. Asegurar foco absoluto en Discord
            focus_window(hwnd);
            sleep(Duration::from_millis(160));

            // 2. Liberar físicamente cualquier tecla modificadora pulsada (Win, Ctrl, Alt)
            release_all_modifier_keys();
            sleep(Duration::from_millis(80));

            // 3. Obtener dimensiones y calcular cuadrante del canal de mensajes
            let mut rect = RECT::default();
            if GetWindowRect(hwnd, &mut rect).is_err() {
                return Err("No se pudo obtener las dimensiones de la ventana de Discord.".to_string());
            }

            let width = rect.right - rect.left;
            let height = rect.bottom - rect.top;

            let chat_x = rect.left + (width * 52) / 100;
            let chat_y = rect.top + (height * 48) / 100;

            // Guardar posición original del ratón del usuario
            let mut orig_cursor = POINT::default();
            let _ = GetCursorPos(&mut orig_cursor);

            // =========================================================================
            // ESTRATEGIA 1: Clic central en área de mensajes + Ctrl + A + Ctrl + C
            // =========================================================================
            clear_clipboard();
            mouse_click(chat_x, chat_y);
            sleep(Duration::from_millis(90));

            send_key_combo(VK_CONTROL, VK_KEY_A);
            sleep(Duration::from_millis(120));

            send_key_combo(VK_CONTROL, VK_KEY_C);
            sleep(Duration::from_millis(150));

            let mut text = read_clipboard_text().unwrap_or_default();

            // =========================================================================
            // ESTRATEGIA 2: Si el foco estaba en la caja de texto inferior, desenfocar
            // con Escape, saltar a mensajes con Page Up y volver a intentar
            // =========================================================================
            if text.trim().len() < 15 {
                send_single_key(VK_ESCAPE);
                sleep(Duration::from_millis(50));
                send_single_key(VK_PAGE_UP);
                sleep(Duration::from_millis(60));

                mouse_click(chat_x, chat_y);
                sleep(Duration::from_millis(70));

                clear_clipboard();
                send_key_combo(VK_CONTROL, VK_KEY_A);
                sleep(Duration::from_millis(120));
                send_key_combo(VK_CONTROL, VK_KEY_C);
                sleep(Duration::from_millis(150));

                text = read_clipboard_text().unwrap_or_default();
            }

            // =========================================================================
            // ESTRATEGIA 3: Selección por arrastre físico del ratón sobre los mensajes
            // =========================================================================
            if text.trim().len() < 15 {
                clear_clipboard();
                let drag_from_x = rect.left + 350;
                let drag_from_y = rect.top + 160;
                let drag_to_x = rect.left + (width * 65) / 100;
                let drag_to_y = rect.bottom - 130;

                mouse_drag(drag_from_x, drag_from_y, drag_to_x, drag_to_y);
                send_key_combo(VK_CONTROL, VK_KEY_C);
                sleep(Duration::from_millis(160));

                text = read_clipboard_text().unwrap_or_default();
            }

            // Limpieza final de interfaz: deseleccionar texto con Escape y devolver cursor
            send_single_key(VK_ESCAPE);
            let _ = SetCursorPos(orig_cursor.x, orig_cursor.y);

            let clean_text = text.trim().to_string();
            if clean_text.len() >= 15 {
                Ok(clean_text)
            } else {
                Err("No se pudieron extraer mensajes del canal de Discord. Comprueba que el ticket tenga mensajes.".to_string())
            }
        }
    }
}

#[tauri::command]
pub fn capture_active_discord_ticket() -> Result<CapturedDiscordTicket, String> {
    #[cfg(windows)]
    {
        // 1. Localizar ventana de Discord
        let (discord_hwnd, window_title, proc_name) = match win_reader::find_discord_window() {
            Some(w) => w,
            None => {
                return Err("No se encontró ninguna ventana de Discord abierta. Abre Discord en el canal del ticket y vuelve a pulsar Win+Y.".to_string());
            }
        };

        // 2. Extraer nombre del canal desde el título de la ventana
        let mut channel_name = "ticket-soporte".to_string();
        if let Some(pos) = window_title.find('-') {
            let prefix = window_title[..pos].trim();
            if !prefix.is_empty() {
                channel_name = prefix.trim_start_matches('#').to_string();
            }
        } else if let Some(pos) = window_title.find('|') {
            let prefix = window_title[..pos].trim();
            if !prefix.is_empty() {
                channel_name = prefix.trim_start_matches('#').to_string();
            }
        }

        // 3. Enfocar Discord y scrappear todo el historial del canal activo
        let transcript = win_reader::scrape_discord_messages(discord_hwnd)?;

        // 4. Si el título era genérico ("Discord"), intentar extraer el canal desde el transcript
        if channel_name == "ticket-soporte" || channel_name.to_lowercase() == "discord" {
            for line in transcript.lines().take(20) {
                if let Some(hash_pos) = line.find('#') {
                    let sub = &line[hash_pos + 1..];
                    let clean_ch: String = sub.chars().take_while(|c| c.is_alphanumeric() || *c == '-' || *c == '_').collect();
                    if clean_ch.len() >= 3 {
                        channel_name = clean_ch;
                        break;
                    }
                }
            }
        }

        Ok(CapturedDiscordTicket {
            channel_name,
            transcript,
            source: format!("auto_scrape ({})", proc_name),
            timestamp: chrono_now_string(),
        })
    }

    #[cfg(not(windows))]
    {
        Err("La lectura directa de Discord solo está disponible en Windows.".to_string())
    }
}

fn chrono_now_string() -> String {
    let now = std::time::SystemTime::now();
    let duration = now.duration_since(std::time::UNIX_EPOCH).unwrap_or_default();
    let secs = duration.as_secs();
    let hours = (secs / 3600) % 24;
    let mins = (secs / 60) % 60;
    let seconds = secs % 60;
    format!("{:02}:{:02}:{:02}", hours, mins, seconds)
}
