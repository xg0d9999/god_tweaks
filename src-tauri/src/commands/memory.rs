use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use crate::utils::win32::empty_all_working_sets;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RamCleanResult {
    pub cleaned_processes: u32,
    pub total_processes: u32,
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CacheCleanResult {
    pub files_deleted: usize,
    pub bytes_cleared: u64,
    pub paths_processed: Vec<String>,
}

#[tauri::command]
pub fn clean_ram_working_set() -> Result<RamCleanResult, String> {
    let (cleaned, total) = empty_all_working_sets()?;
    Ok(RamCleanResult {
        cleaned_processes: cleaned,
        total_processes: total,
        message: format!(
            "Purged RAM Working Set from {cleaned} active processes (out of {total} detected)."
        ),
    })
}

fn purge_directory(path: &Path, files_deleted: &mut usize, bytes_cleared: &mut u64) {
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let p = entry.path();
            if p.is_dir() {
                purge_directory(&p, files_deleted, bytes_cleared);
                let _ = fs::remove_dir(&p);
            } else if p.is_file() {
                if let Ok(metadata) = p.metadata() {
                    *bytes_cleared += metadata.len();
                }
                if fs::remove_file(&p).is_ok() {
                    *files_deleted += 1;
                }
            }
        }
    }
}

#[tauri::command]
pub fn purge_shader_and_temp_caches() -> Result<CacheCleanResult, String> {
    let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
    let temp_dir = std::env::var("TEMP").unwrap_or_default();

    let mut target_paths: Vec<PathBuf> = Vec::new();

    if !local_app_data.is_empty() {
        let base = Path::new(&local_app_data);
        target_paths.push(base.join("D3DSCache"));
        target_paths.push(base.join("NVIDIA").join("DXCache"));
        target_paths.push(base.join("NVIDIA").join("GLCache"));
        target_paths.push(base.join("AMD").join("DxCache"));
    }

    if !temp_dir.is_empty() {
        target_paths.push(PathBuf::from(&temp_dir));
    }

    // Windows Prefetch (requires admin)
    target_paths.push(PathBuf::from("C:\\Windows\\Prefetch"));

    let mut files_deleted = 0;
    let mut bytes_cleared = 0;
    let mut paths_processed = Vec::new();

    for path in &target_paths {
        if path.exists() {
            paths_processed.push(path.to_string_lossy().to_string());
            purge_directory(path, &mut files_deleted, &mut bytes_cleared);
        }
    }

    Ok(CacheCleanResult {
        files_deleted,
        bytes_cleared,
        paths_processed,
    })
}

#[tauri::command]
pub fn get_memory_compression_status() -> Result<bool, String> {
    let script = "try { $mc=(Get-MMAgent).MemoryCompression; if ($mc -eq $false) { 'disabled' } else { 'enabled' } } catch { 'unavailable' }";
    let output = crate::utils::win32::run_hidden_powershell(script).unwrap_or_default();
    Ok(output.trim().to_lowercase() == "disabled")
}

#[tauri::command]
pub fn set_memory_compression(disable: bool) -> Result<String, String> {
    if !crate::utils::win32::is_elevated() {
        return Err("Permisos insuficientes: Modificar la compresión de memoria (MMAgent) requiere ejecutar como Administrador.".to_string());
    }

    if disable {
        let script = "try { $mc=(Get-MMAgent).MemoryCompression; if ($mc) { Disable-MMAgent -MemoryCompression; 'OK' } else { 'ALREADY_DISABLED' } } catch { 'ERROR' }";
        let res = crate::utils::win32::run_hidden_powershell(script)?;
        if res.contains("ERROR") {
            Err("No se pudo desactivar la compresión de memoria en este sistema.".to_string())
        } else {
            Ok("Compresión de memoria RAM desactivada con éxito (MMAgent -MemoryCompression deshabilitado).".to_string())
        }
    } else {
        let script = "try { Enable-MMAgent -MemoryCompression; 'OK' } catch { 'ERROR' }";
        let res = crate::utils::win32::run_hidden_powershell(script)?;
        if res.contains("ERROR") {
            Err("No se pudo reactivar la compresión de memoria.".to_string())
        } else {
            Ok("Compresión de memoria RAM restaurada a valores por defecto de Windows.".to_string())
        }
    }
}

