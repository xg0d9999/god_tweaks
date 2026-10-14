use tauri::{AppHandle, Emitter, Manager};
use serde_json::json;

#[tauri::command]
pub fn open_game_selector_window(app_handle: AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("game-selector") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
        Ok(())
    } else {
        #[cfg(desktop)]
        {
            let builder = tauri::WebviewWindowBuilder::new(
                &app_handle,
                "game-selector",
                tauri::WebviewUrl::default(),
            )
            .title("g0d suite - Selector de Juego")
            .inner_size(1450.0, 850.0)
            .min_inner_size(1200.0, 750.0)
            .resizable(true)
            .decorations(false)
            .transparent(false)
            .shadow(true)
            .center();

            match builder.build() {
                Ok(win) => {
                    let _ = win.show();
                    let _ = win.set_focus();
                    Ok(())
                }
                Err(e) => Err(format!("No se pudo inicializar la ventana selectora: {e}")),
            }
        }
        #[cfg(not(desktop))]
        {
            Err("No disponible en esta plataforma.".to_string())
        }
    }
}

#[tauri::command]
pub fn close_game_selector_window(app_handle: AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("game-selector") {
        let _ = window.hide();
    }
    if let Some(main) = app_handle.get_webview_window("main") {
        let _ = main.set_focus();
    }
    Ok(())
}

#[tauri::command]
pub fn select_game_and_optimize(app_handle: AppHandle, game_id: String) -> Result<(), String> {
    // 1. Hide the game selector window
    if let Some(selector) = app_handle.get_webview_window("game-selector") {
        let _ = selector.hide();
    }
    // 2. Bring the main window to front & focus
    if let Some(main) = app_handle.get_webview_window("main") {
        let _ = main.unminimize();
        let _ = main.show();
        let _ = main.set_focus();
        let _ = main.emit("trigger-game-optimization", json!({ "gameId": game_id }));
    }
    Ok(())
}
