use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, Manager,
};

pub fn setup_system_tray(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let handle = app.handle();

    let show_item = MenuItem::with_id(handle, "show", "Abrir g0d suite", true, None::<&str>)?;
    let hide_item = MenuItem::with_id(handle, "hide", "Minimizar a segundo plano", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(handle)?;
    let quit_item = MenuItem::with_id(handle, "quit", "Forzar cierre de g0d suite", true, None::<&str>)?;

    let menu = Menu::with_items(handle, &[&show_item, &hide_item, &separator, &quit_item])?;

    let mut builder = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("g0d suite - Optimización & Latencia")
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| {
            match event.id.as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.unminimize();
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "hide" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.hide();
                    }
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let is_visible = window.is_visible().unwrap_or(false);
                    let is_minimized = window.is_minimized().unwrap_or(false);
                    let is_focused = window.is_focused().unwrap_or(false);

                    if is_visible && !is_minimized && is_focused {
                        let _ = window.minimize();
                    } else {
                        let _ = window.unminimize();
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        });

    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    } else if let Ok(icon) = tauri::image::Image::from_app_icon_resource(32) {
        builder = builder.icon(icon);
    }

    builder.build(app)?;

    Ok(())
}

#[tauri::command]
pub fn force_exit_app(app_handle: tauri::AppHandle) {
    app_handle.exit(0);
}

