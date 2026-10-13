use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use crate::utils::win32::run_hidden_cmd;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FiveMCitizenInfo {
    pub fivem_app_path: String,
    pub citizen_path: String,
    pub is_fivem_installed: bool,
    pub is_fivem_running: bool,
    pub active_citizen_id: Option<String>,
    pub installed_citizen_ids: Vec<String>,
    pub has_vanilla_backup: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CitizenActionResult {
    pub success: bool,
    pub message: String,
    pub active_citizen_id: Option<String>,
}

fn get_fivem_app_dir() -> PathBuf {
    let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
    PathBuf::from(&local_app_data).join("FiveM").join("FiveM.app")
}

fn get_vault_dir() -> PathBuf {
    get_fivem_app_dir().join("god_citizens_vault")
}

fn get_active_meta_file() -> PathBuf {
    get_vault_dir().join(".god_active_citizen")
}

fn check_is_fivem_running() -> bool {
    #[cfg(windows)]
    {
        use windows::Win32::System::Diagnostics::ToolHelp::{
            CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W, TH32CS_SNAPPROCESS,
        };
        use windows::Win32::Foundation::CloseHandle;

        unsafe {
            if let Ok(snapshot) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
                let mut entry = PROCESSENTRY32W {
                    dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32,
                    ..Default::default()
                };

                if Process32FirstW(snapshot, &mut entry).is_ok() {
                    loop {
                        let name = String::from_utf16_lossy(&entry.szExeFile)
                            .trim_matches(char::from(0))
                            .to_lowercase();
                        if name.contains("fivem") || name.contains("gtaprocess") {
                            let _ = CloseHandle(snapshot);
                            return true;
                        }
                        if Process32NextW(snapshot, &mut entry).is_err() {
                            break;
                        }
                    }
                }
                let _ = CloseHandle(snapshot);
            }
        }
    }
    false
}

#[tauri::command]
pub fn get_fivem_citizen_info() -> Result<FiveMCitizenInfo, String> {
    let fivem_app = get_fivem_app_dir();
    let citizen_dir = fivem_app.join("citizen");
    let vault_dir = get_vault_dir();
    let active_meta = get_active_meta_file();

    let is_fivem_installed = fivem_app.exists();
    let is_fivem_running = check_is_fivem_running();

    let active_citizen_id = if active_meta.exists() {
        fs::read_to_string(&active_meta).ok().map(|s| s.trim().to_string())
    } else {
        None
    };

    let mut installed_citizen_ids = Vec::new();
    let mut has_vanilla_backup = false;

    if vault_dir.exists() {
        if let Ok(entries) = fs::read_dir(&vault_dir) {
            for entry in entries.flatten() {
                if let Ok(file_type) = entry.file_type() {
                    if file_type.is_dir() {
                        let name = entry.file_name().to_string_lossy().to_string();
                        if name == "vanilla_rockstar" {
                            has_vanilla_backup = true;
                        } else if !name.starts_with('.') && !name.starts_with("tmp_") {
                            installed_citizen_ids.push(name);
                        }
                    }
                }
            }
        }
    }

    Ok(FiveMCitizenInfo {
        fivem_app_path: fivem_app.to_string_lossy().to_string(),
        citizen_path: citizen_dir.to_string_lossy().to_string(),
        is_fivem_installed,
        is_fivem_running,
        active_citizen_id,
        installed_citizen_ids,
        has_vanilla_backup,
    })
}

#[tauri::command]
pub fn open_fivem_citizen_folder() -> Result<(), String> {
    let fivem_app = get_fivem_app_dir();
    let citizen_dir = fivem_app.join("citizen");
    let target = if citizen_dir.exists() {
        citizen_dir
    } else {
        fivem_app
    };

    let path_str = target.to_string_lossy().to_string();
    let cmd = format!("explorer.exe \"{}\"", path_str);
    let _ = run_hidden_cmd(&cmd);
    Ok(())
}

#[tauri::command]
pub fn force_kill_fivem_processes() -> Result<String, String> {
    let _ = run_hidden_cmd("taskkill /F /IM FiveM.exe /T");
    let _ = run_hidden_cmd("taskkill /F /IM GTA5.exe /T");
    let _ = run_hidden_cmd("taskkill /F /IM FiveM_GTAProcess.exe /T");
    let _ = run_hidden_cmd("taskkill /F /IM FiveM_b3095_GTAProcess.exe /T");
    let _ = run_hidden_cmd("taskkill /F /IM FiveM_b2802_GTAProcess.exe /T");
    let _ = run_hidden_cmd("taskkill /F /IM FiveM_b2699_GTAProcess.exe /T");
    let _ = run_hidden_cmd("taskkill /F /IM FiveM_b2545_GTAProcess.exe /T");
    let _ = run_hidden_cmd("taskkill /F /IM FiveM_b2372_GTAProcess.exe /T");
    let _ = run_hidden_cmd("taskkill /F /IM FiveM_b2189_GTAProcess.exe /T");
    let _ = run_hidden_cmd("taskkill /F /IM FiveM_b2060_GTAProcess.exe /T");
    let _ = run_hidden_cmd("taskkill /F /IM FiveM_b1604_GTAProcess.exe /T");
    Ok("Procesos de FiveM finalizados correctamente.".to_string())
}

/// Recursively copies directory contents with fast robocopy / MIR
fn sync_dir_contents(src: &Path, dst: &Path) -> Result<(), String> {
    let _ = fs::create_dir_all(dst);
    let src_str = src.to_string_lossy().to_string();
    let dst_str = dst.to_string_lossy().to_string();

    // Robocopy mirror is ultra fast and multi-threaded
    let cmd = format!("robocopy \"{}\" \"{}\" /MIR /MT:16 /NFL /NDL /NJH /NJS", src_str, dst_str);
    let output = run_hidden_cmd(&cmd);

    // Robocopy exit codes: 0 = No change, 1 = Files copied, 2 = Extra files deleted, 3 = Both
    // Any code < 8 is success for Robocopy
    match output {
        Ok(_) => Ok(()),
        Err(err) => {
            if err.contains("code: Some(0)") || err.contains("code: Some(1)") || err.contains("code: Some(2)") || err.contains("code: Some(3)") {
                Ok(())
            } else {
                // Fallback to manual recursive copy if robocopy fails
                copy_dir_all(src, dst)
            }
        }
    }
}

fn copy_dir_all(src: &Path, dst: &Path) -> Result<(), String> {
    fs::create_dir_all(dst).map_err(|e| e.to_string())?;
    for entry in fs::read_dir(src).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let ty = entry.file_type().map_err(|e| e.to_string())?;
        if ty.is_dir() {
            copy_dir_all(&entry.path(), &dst.join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.join(entry.file_name())).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

fn purge_fivem_caches_internal() {
    let _ = crate::commands::fivem::clean_fivem_caches();
}

fn find_citizen_root_inside(dir: &Path) -> PathBuf {
    // 1. Direct match: dir/citizen
    let direct_citizen = dir.join("citizen");
    if direct_citizen.is_dir() {
        return direct_citizen;
    }

    // 2. Contains common or platform directly
    if dir.join("common").is_dir() || dir.join("platform").is_dir() {
        return dir.to_path_buf();
    }

    // 3. Search 2 levels deep
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let p = entry.path();
            if p.is_dir() {
                if p.file_name().map_or(false, |n| n.to_string_lossy().to_lowercase() == "citizen") {
                    return p;
                }
                if p.join("common").is_dir() || p.join("platform").is_dir() {
                    return p;
                }
                if p.join("citizen").is_dir() {
                    return p.join("citizen");
                }
            }
        }
    }

    dir.to_path_buf()
}

#[tauri::command]
pub fn apply_local_citizen(citizen_id: String, clear_cache: bool) -> Result<CitizenActionResult, String> {
    if check_is_fivem_running() {
        return Err("FiveM está en ejecución. Cierra el juego antes de aplicar el nuevo Citizen.".to_string());
    }

    let fivem_app = get_fivem_app_dir();
    let citizen_dir = fivem_app.join("citizen");
    let vault_dir = get_vault_dir();
    let preset_vault_path = vault_dir.join(&citizen_id);

    if !preset_vault_path.exists() {
        return Err(format!("El Citizen seleccionado ('{}') no se encuentra descargado en el baúl local.", citizen_id));
    }

    let preset_citizen_root = find_citizen_root_inside(&preset_vault_path);

    // Safeguard: Create Vanilla backup if it does not exist yet
    let vanilla_backup = vault_dir.join("vanilla_rockstar");
    if !vanilla_backup.exists() && citizen_dir.exists() {
        let _ = sync_dir_contents(&citizen_dir, &vanilla_backup);
    }

    // Sync preset into citizen folder
    sync_dir_contents(&preset_citizen_root, &citizen_dir)?;

    // Update active marker
    let _ = fs::create_dir_all(&vault_dir);
    let _ = fs::write(get_active_meta_file(), &citizen_id);

    if clear_cache {
        purge_fivem_caches_internal();
    }

    Ok(CitizenActionResult {
        success: true,
        message: format!("Citizen '{}' activado con éxito. ¡Listo para jugar!", citizen_id),
        active_citizen_id: Some(citizen_id),
    })
}

#[tauri::command]
pub fn restore_vanilla_citizen(clear_cache: bool) -> Result<CitizenActionResult, String> {
    if check_is_fivem_running() {
        return Err("FiveM está en ejecución. Cierra el juego antes de restaurar el Citizen original.".to_string());
    }

    let fivem_app = get_fivem_app_dir();
    let citizen_dir = fivem_app.join("citizen");
    let vault_dir = get_vault_dir();
    let vanilla_backup = vault_dir.join("vanilla_rockstar");

    if !vanilla_backup.exists() {
        return Err("No se encontró una copia de seguridad limpia de Vanilla. Revisa tu carpeta de instalación de FiveM.".to_string());
    }

    sync_dir_contents(&vanilla_backup, &citizen_dir)?;

    // Remove active meta or set to vanilla
    let _ = fs::write(get_active_meta_file(), "vanilla");

    if clear_cache {
        purge_fivem_caches_internal();
    }

    Ok(CitizenActionResult {
        success: true,
        message: "FiveM restaurado con éxito al Citizen Vanilla original de Rockstar.".to_string(),
        active_citizen_id: Some("vanilla".to_string()),
    })
}

#[tauri::command]
pub async fn download_and_apply_citizen(
    citizen_id: String,
    download_url: String,
    clear_cache: bool,
) -> Result<CitizenActionResult, String> {
    if check_is_fivem_running() {
        return Err("FiveM está en ejecución. Cierra el juego antes de descargar y aplicar el Citizen.".to_string());
    }

    let vault_dir = get_vault_dir();
    let _ = fs::create_dir_all(&vault_dir);

    let preset_vault_path = vault_dir.join(&citizen_id);
    let temp_zip_path = vault_dir.join(format!("tmp_{}.zip", citizen_id));
    let temp_extract_path = vault_dir.join(format!("tmp_extract_{}", citizen_id));

    // 1. Download archive using curl.exe
    let zip_str = temp_zip_path.to_string_lossy().to_string();
    let curl_cmd = format!("curl.exe -L -k -s -S -o \"{}\" \"{}\"", zip_str, download_url);
    
    let download_output = run_hidden_cmd(&curl_cmd);
    if let Err(e) = download_output {
        let _ = fs::remove_file(&temp_zip_path);
        return Err(format!("Error al descargar el paquete del Citizen desde la nube: {e}"));
    }

    if !temp_zip_path.exists() {
        return Err("El archivo descargado no se pudo encontrar en el disco local.".to_string());
    }

    // 2. Extract using tar.exe
    let _ = fs::create_dir_all(&temp_extract_path);
    let extract_str = temp_extract_path.to_string_lossy().to_string();
    let tar_cmd = format!("tar.exe -xf \"{}\" -C \"{}\"", zip_str, extract_str);

    let extract_output = run_hidden_cmd(&tar_cmd);
    let _ = fs::remove_file(&temp_zip_path);

    if let Err(e) = extract_output {
        let _ = fs::remove_dir_all(&temp_extract_path);
        return Err(format!("Error al descomprimir el archivo del Citizen: {e}"));
    }

    // 3. Find and normalize root
    let citizen_root = find_citizen_root_inside(&temp_extract_path);
    let _ = fs::create_dir_all(&preset_vault_path);
    sync_dir_contents(&citizen_root, &preset_vault_path)?;

    // Clean up temp extraction folder
    let _ = fs::remove_dir_all(&temp_extract_path);

    // 4. Apply to FiveM
    apply_local_citizen(citizen_id, clear_cache)
}

#[tauri::command]
pub fn delete_local_citizen(citizen_id: String) -> Result<String, String> {
    let vault_dir = get_vault_dir();
    let target = vault_dir.join(&citizen_id);
    if target.exists() {
        fs::remove_dir_all(&target).map_err(|e| format!("Error al eliminar citizen local: {e}"))?;
        Ok(format!("Citizen '{}' eliminado del almacenamiento local.", citizen_id))
    } else {
        Ok("El citizen no estaba descargado localmente.".to_string())
    }
}
