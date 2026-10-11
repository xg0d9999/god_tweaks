// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(linker_messages)]

fn main() {
    #[cfg(windows)]
    {
        use god_tweaks_lib::utils::win32::{is_elevated, run_hidden_powershell};

        // Forzar siempre ejecución con permisos de Administrador nada más abrir la app
        if !is_elevated() {
            let args: Vec<String> = std::env::args().collect();
            // Prevenir loops si el usuario cancela el diálogo UAC explícitamente
            if !args.iter().any(|arg| arg == "--no-elevate") {
                if let Ok(exe_path) = std::env::current_exe() {
                    let exe_str = exe_path.to_string_lossy();
                    let remaining_args = if args.len() > 1 {
                        args[1..].join(" ")
                    } else {
                        String::new()
                    };

                    let ps_command = if remaining_args.is_empty() {
                        format!("Start-Process -FilePath '{exe_str}' -Verb RunAs")
                    } else {
                        format!("Start-Process -FilePath '{exe_str}' -ArgumentList '{remaining_args}' -Verb RunAs")
                    };

                    let _ = run_hidden_powershell(&ps_command);
                    std::process::exit(0);
                }
            }
        }
    }

    god_tweaks_lib::run();
}
