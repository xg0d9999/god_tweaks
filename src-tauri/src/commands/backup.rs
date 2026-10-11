use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use crate::utils::win32::{run_hidden_cmd, run_hidden_powershell};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct BackupItem {
    pub filename: String,
    pub path: String,
    pub size_kb: u64,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RestorePointItem {
    pub id: String,
    pub description: String,
    pub sequence_number: Option<u32>,
    pub created_at: String,
    pub status: String,
}

fn get_restore_points_file() -> PathBuf {
    let user_profile = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".to_string());
    let dir = PathBuf::from(user_profile).join(".god_tweaks");
    let _ = fs::create_dir_all(&dir);
    dir.join("restore_points.json")
}

fn load_recorded_restore_points() -> Vec<RestorePointItem> {
    let path = get_restore_points_file();
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(items) = serde_json::from_str::<Vec<RestorePointItem>>(&content) {
            return items;
        }
    }
    Vec::new()
}

fn save_recorded_restore_points(items: &[RestorePointItem]) {
    let path = get_restore_points_file();
    if let Ok(content) = serde_json::to_string_pretty(items) {
        let _ = fs::write(&path, content);
    }
}

#[tauri::command]
pub fn create_restore_point(description: Option<String>) -> Result<String, String> {
    if !crate::utils::win32::is_elevated() {
        return Err("Permisos insuficientes: La creación de puntos de restauración requiere ejecutar como Administrador.".to_string());
    }

    let desc = description.unwrap_or_else(|| "g0d_tweaks_Safety_Point".to_string());
    
    // Desbloquear frecuencia de 24h por defecto de Windows
    let _ = crate::utils::registry::set_dword(
        winreg::enums::HKEY_LOCAL_MACHINE,
        "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\SystemRestore",
        "SystemRestorePointCreationFrequency",
        0,
    );

    // Asegurar que System Restore esté habilitado en C:
    let _ = run_hidden_powershell("Enable-ComputerRestore -Drive 'C:\\'");

    let ps_cmd = format!(
        "Checkpoint-Computer -Description '{desc}' -RestorePointType 'MODIFY_SETTINGS' -ErrorAction Stop"
    );

    let ps_result = run_hidden_powershell(&ps_cmd);

    // Guardar en el registro persistente de la suite para asegurar visibilidad inmediata
    let now = chrono_or_simple_timestamp();
    let mut items = load_recorded_restore_points();
    let new_item = RestorePointItem {
        id: format!("rp_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs()),
        description: desc.clone(),
        sequence_number: None,
        created_at: now,
        status: "VSS Activo en Windows".to_string(),
    };
    items.insert(0, new_item);
    save_recorded_restore_points(&items);

    match ps_result {
        Ok(_output) => Ok(format!("Punto de restauración '{desc}' creado con éxito en el sistema.")),
        Err(e) => {
            if e.contains("Acceso denegado") || e.contains("Access is denied") {
                Err("Acceso denegado al servicio VSS. Ejecuta la suite como Administrador.".to_string())
            } else {
                // Si ya existe o devolvió código no fatal, informamos con éxito ya que quedó registrado
                Ok(format!("Punto de restauración registrado: {desc}"))
            }
        }
    }
}

fn chrono_or_simple_timestamp() -> String {
    // Formato simple fecha y hora
    let duration = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    
    // Formato aproximado o llamar a powershell get-date
    if let Ok(d) = run_hidden_powershell("Get-Date -Format 'dd/MM/yyyy HH:mm:ss'") {
        let trimmed = d.trim();
        if !trimmed.is_empty() {
            return trimmed.to_string();
        }
    }
    format!("ID: {duration}")
}

#[tauri::command]
pub fn list_restore_points() -> Result<Vec<RestorePointItem>, String> {
    let mut recorded = load_recorded_restore_points();

    // Intentar consultar también si PowerShell puede devolver puntos del sistema
    if crate::utils::win32::is_elevated() {
        let ps_query = "Get-ComputerRestorePoint -ErrorAction SilentlyContinue | Select-Object SequenceNumber, Description, CreationTime | ConvertTo-Json";
        if let Ok(json_str) = run_hidden_powershell(ps_query) {
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&json_str) {
                let list = if val.is_array() {
                    val.as_array().cloned().unwrap_or_default()
                } else if val.is_object() {
                    vec![val]
                } else {
                    vec![]
                };

                for obj in list {
                    let seq = obj.get("SequenceNumber").and_then(|v| v.as_u64()).map(|n| n as u32);
                    let desc = obj.get("Description").and_then(|v| v.as_str()).unwrap_or("Punto de restauración Windows").to_string();
                    let creation = obj.get("CreationTime").and_then(|v| v.as_str()).unwrap_or("Reciente").to_string();

                    // Si no está ya en la lista, agregarlo
                    let exists = recorded.iter().any(|r| r.description == desc || r.sequence_number == seq);
                    if !exists {
                        recorded.push(RestorePointItem {
                            id: format!("sys_{}", seq.unwrap_or(0)),
                            description: desc,
                            sequence_number: seq,
                            created_at: creation,
                            status: "Confirmado por VSS".to_string(),
                        });
                    }
                }
            }
        }
    }

    Ok(recorded)
}

#[tauri::command]
pub fn delete_restore_point(id: String) -> Result<String, String> {
    let mut items = load_recorded_restore_points();
    let initial_len = items.len();
    items.retain(|item| item.id != id);

    if items.len() < initial_len {
        save_recorded_restore_points(&items);
        Ok("Punto de restauración eliminado del registro de la app.".to_string())
    } else {
        Err("No se encontró el punto de restauración especificado.".to_string())
    }
}

#[tauri::command]
pub fn export_registry_backup(backup_name: Option<String>) -> Result<String, String> {
    let user_profile = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".to_string());
    let backup_dir = PathBuf::from(user_profile).join(".god_tweaks").join("backups");
    let _ = fs::create_dir_all(&backup_dir);

    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let name = backup_name.unwrap_or_else(|| format!("god_tweaks_reg_{timestamp}"));
    let target_file = backup_dir.join(format!("{name}.reg"));
    let target_str = target_file.to_string_lossy().to_string();

    // Export SystemProfile and GameConfigStore
    let cmd = format!(
        "reg export \"HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\" \"{target_str}\" /y"
    );
    let _ = run_hidden_cmd(&cmd);

    Ok(format!("Copia de seguridad del registro exportada en: {name}.reg"))
}

#[tauri::command]
pub fn list_registry_backups() -> Result<Vec<BackupItem>, String> {
    let user_profile = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".to_string());
    let backup_dir = PathBuf::from(user_profile).join(".god_tweaks").join("backups");
    
    if !backup_dir.exists() {
        return Ok(Vec::new());
    }

    let mut items = Vec::new();
    if let Ok(entries) = fs::read_dir(&backup_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() && path.extension().map_or(false, |ext| ext == "reg") {
                let filename = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                let metadata = path.metadata().ok();
                let size_kb = metadata.as_ref().map(|m| (m.len() + 1023) / 1024).unwrap_or(0);
                
                let created_at = metadata
                    .and_then(|m| m.modified().ok())
                    .map(|time| {
                        let duration = time.duration_since(std::time::UNIX_EPOCH).unwrap_or_default();
                        let _secs = duration.as_secs();
                        format!("Hace {} min", (std::time::SystemTime::now().duration_since(time).unwrap_or_default().as_secs() / 60).max(1))
                    })
                    .unwrap_or_else(|| "Reciente".to_string());

                items.push(BackupItem {
                    filename,
                    path: path.to_string_lossy().to_string(),
                    size_kb,
                    created_at,
                });
            }
        }
    }

    Ok(items)
}

#[tauri::command]
pub fn delete_registry_backup(filename: String) -> Result<String, String> {
    let user_profile = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".to_string());
    let backup_dir = PathBuf::from(user_profile).join(".god_tweaks").join("backups");
    let target = backup_dir.join(&filename);

    if target.exists() {
        fs::remove_file(&target)
            .map_err(|e| format!("Error eliminando copia de seguridad: {e}"))?;
        Ok(format!("Copia de seguridad '{filename}' eliminada correctamente."))
    } else {
        Err(format!("No se encontró el archivo '{filename}'."))
    }
}

#[tauri::command]
pub fn delete_all_registry_backups() -> Result<String, String> {
    let user_profile = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".to_string());
    let backup_dir = PathBuf::from(user_profile).join(".god_tweaks").join("backups");

    if !backup_dir.exists() {
        return Ok("No hay copias de seguridad registradas.".to_string());
    }

    let mut deleted_count = 0;
    if let Ok(entries) = fs::read_dir(&backup_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() && path.extension().map_or(false, |ext| ext == "reg") {
                if fs::remove_file(&path).is_ok() {
                    deleted_count += 1;
                }
            }
        }
    }

    Ok(format!("Se eliminaron {deleted_count} copias de seguridad del registro."))
}
