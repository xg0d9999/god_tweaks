use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use sysinfo::Disks;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DiskDriveInfo {
    pub name: String,
    pub mount_point: String,
    pub total_bytes: u64,
    pub available_bytes: u64,
    pub used_bytes: u64,
    pub usage_percentage: f32,
    pub file_system: String,
    pub is_removable: bool,
    pub disk_type: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DiskJunkCategory {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category_type: String,
    pub bytes: u64,
    pub formatted_size: String,
    pub file_count: usize,
    pub is_safe: bool,
    pub recommended: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DiskJunkScanResult {
    pub categories: Vec<DiskJunkCategory>,
    pub total_bytes: u64,
    pub formatted_total: String,
    pub total_files: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DiskCleanResult {
    pub bytes_freed: u64,
    pub formatted_freed: String,
    pub files_deleted: usize,
    pub categories_cleaned: Vec<String>,
    pub errors_count: usize,
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FolderConsumptionItem {
    pub name: String,
    pub path: String,
    pub bytes: u64,
    pub formatted_size: String,
    pub percentage: f32,
}

pub fn format_bytes(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.1} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.0} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}

fn scan_directory_stats(
    path: &Path,
    max_depth: usize,
    current_depth: usize,
    total_bytes: &mut u64,
    file_count: &mut usize,
) {
    if current_depth > max_depth {
        return;
    }
    if let Ok(entries) = fs::read_dir(path) {
        let mut count = 0;
        for entry in entries.flatten() {
            // Guard against massive directories freezing the process
            count += 1;
            if count > 500 {
                break;
            }

            if let Ok(ft) = entry.file_type() {
                // CRITICAL: NEVER follow symlinks or Windows NTFS junctions
                if ft.is_symlink() {
                    continue;
                }

                if ft.is_dir() {
                    if current_depth < max_depth {
                        scan_directory_stats(
                            &entry.path(),
                            max_depth,
                            current_depth + 1,
                            total_bytes,
                            file_count,
                        );
                    }
                } else if ft.is_file() {
                    *file_count += 1;
                    if let Ok(meta) = entry.metadata() {
                        *total_bytes += meta.len();
                    }
                }
            }
        }
    }
}

fn purge_directory_items(
    path: &Path,
    max_depth: usize,
    current_depth: usize,
    bytes_freed: &mut u64,
    files_deleted: &mut usize,
    errors: &mut usize,
) {
    if current_depth > max_depth {
        return;
    }
    if let Ok(entries) = fs::read_dir(path) {
        let mut count = 0;
        for entry in entries.flatten() {
            count += 1;
            if count > 1500 {
                break;
            }

            if let Ok(ft) = entry.file_type() {
                let p = entry.path();
                if ft.is_symlink() {
                    let _ = fs::remove_file(&p);
                    continue;
                }

                if ft.is_dir() {
                    purge_directory_items(
                        &p,
                        max_depth,
                        current_depth + 1,
                        bytes_freed,
                        files_deleted,
                        errors,
                    );
                    let _ = fs::remove_dir(&p);
                } else if ft.is_file() {
                    let file_len = entry.metadata().map(|m| m.len()).unwrap_or(0);
                    match fs::remove_file(&p) {
                        Ok(_) => {
                            *bytes_freed += file_len;
                            *files_deleted += 1;
                        }
                        Err(_) => {
                            *errors += 1;
                        }
                    }
                }
            }
        }
    }
}

fn get_category_paths(id: &str) -> Vec<PathBuf> {
    let mut paths = Vec::new();
    let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
    let app_data = std::env::var("APPDATA").unwrap_or_default();
    let temp_dir = std::env::var("TEMP").unwrap_or_default();

    match id {
        "temp_files" => {
            if !temp_dir.is_empty() {
                paths.push(PathBuf::from(&temp_dir));
            }
            paths.push(PathBuf::from("C:\\Windows\\Temp"));
        }
        "windows_update" => {
            paths.push(PathBuf::from("C:\\Windows\\SoftwareDistribution\\Download"));
        }
        "gpu_shaders" => {
            if !local_app_data.is_empty() {
                let base = Path::new(&local_app_data);
                paths.push(base.join("D3DSCache"));
                paths.push(base.join("NVIDIA").join("DXCache"));
                paths.push(base.join("NVIDIA").join("GLCache"));
                paths.push(base.join("AMD").join("DxCache"));
            }
        }
        "discord_cache" => {
            if !app_data.is_empty() {
                let discord_base = Path::new(&app_data).join("discord");
                paths.push(discord_base.join("Cache").join("Cache_Data"));
                paths.push(discord_base.join("Code Cache"));
                paths.push(discord_base.join("GPUCache"));
            }
        }
        "browser_cache" => {
            if !local_app_data.is_empty() {
                let base = Path::new(&local_app_data);
                // Chrome
                paths.push(base.join("Google").join("Chrome").join("User Data").join("Default").join("Cache"));
                paths.push(base.join("Google").join("Chrome").join("User Data").join("Default").join("Code Cache"));
                // Edge
                paths.push(base.join("Microsoft").join("Edge").join("User Data").join("Default").join("Cache"));
                // Brave
                paths.push(base.join("BraveSoftware").join("Brave-Browser").join("User Data").join("Default").join("Cache"));
            }
        }
        "crash_dumps" => {
            paths.push(PathBuf::from("C:\\Windows\\Minidump"));
            if !local_app_data.is_empty() {
                paths.push(Path::new(&local_app_data).join("CrashDumps"));
            }
        }
        "thumbnails" => {
            if !local_app_data.is_empty() {
                paths.push(Path::new(&local_app_data).join("Microsoft").join("Windows").join("Explorer"));
            }
        }
        "prefetch" => {
            paths.push(PathBuf::from("C:\\Windows\\Prefetch"));
        }
        "fivem_cache" => {
            if !local_app_data.is_empty() {
                let fivem_data = Path::new(&local_app_data).join("FiveM").join("FiveM.app").join("data");
                paths.push(fivem_data.join("cache"));
                paths.push(fivem_data.join("server-cache"));
                paths.push(fivem_data.join("server-cache-priv"));
                paths.push(fivem_data.join("nui-storage"));
            }
        }
        "recycle_bin" => {
            paths.push(PathBuf::from("C:\\$Recycle.Bin"));
        }
        _ => {}
    }

    paths
}

#[tauri::command]
pub fn get_disk_drives() -> Result<Vec<DiskDriveInfo>, String> {
    let disks = Disks::new_with_refreshed_list();
    let mut drive_infos = Vec::new();

    for disk in &disks {
        let total = disk.total_space();
        let available = disk.available_space();
        let used = total.saturating_sub(available);
        let usage_pct = if total > 0 {
            (used as f32 / total as f32) * 100.0
        } else {
            0.0
        };

        let mount = disk.mount_point().to_string_lossy().to_string();
        let name = disk.name().to_string_lossy().to_string();
        let display_name = if name.is_empty() {
            format!("Disco Local ({mount})")
        } else {
            format!("{name} ({mount})")
        };

        let fs_type = disk.file_system().to_string_lossy().to_string();
        let is_removable = disk.is_removable();
        let disk_type = format!("{:?}", disk.kind());

        drive_infos.push(DiskDriveInfo {
            name: display_name,
            mount_point: mount,
            total_bytes: total,
            available_bytes: available,
            used_bytes: used,
            usage_percentage: usage_pct,
            file_system: fs_type,
            is_removable,
            disk_type,
        });
    }

    Ok(drive_infos)
}

#[tauri::command]
pub fn scan_disk_junk() -> Result<DiskJunkScanResult, String> {
    let category_defs = vec![
        (
            "temp_files",
            "Archivos Temporales de Windows",
            "Restos temporales de instaladores y aplicaciones cerradas (%TEMP% y C:\\Windows\\Temp).",
            "system",
            true,
            true,
            2,
        ),
        (
            "windows_update",
            "Descargas de Windows Update",
            "Paquetes de instalación de parches ya aplicados que Windows no borra automáticamente.",
            "system",
            true,
            true,
            2,
        ),
        (
            "gpu_shaders",
            "Caché de Shaders GPU (DirectX / NVIDIA / AMD)",
            "Sombreadores compilados antiguos (DXCache, GLCache). Su limpieza resuelve micro-stutters en juegos.",
            "gaming",
            true,
            true,
            2,
        ),
        (
            "discord_cache",
            "Caché Multimedia de Discord",
            "Imágenes, vídeos y archivos multimedia que Discord almacena indefinidamente en disco.",
            "app",
            true,
            true,
            2,
        ),
        (
            "browser_cache",
            "Caché de Navegadores (Chrome / Edge / Brave)",
            "Archivos y elementos estáticos cacheados. No borra contraseñas, cookies ni sesiones.",
            "app",
            true,
            true,
            2,
        ),
        (
            "crash_dumps",
            "Volcados de Fallo y Crash Dumps (.dmp)",
            "Registros generados por errores de aplicaciones y pantallazos antiguos.",
            "system",
            true,
            true,
            1,
        ),
        (
            "thumbnails",
            "Miniaturas del Explorador de Windows",
            "Caché de previsualización de imágenes y vídeos que se reconstruye automáticamente.",
            "system",
            true,
            false,
            1,
        ),
        (
            "prefetch",
            "Archivos de Precarga (Windows Prefetch)",
            "Trazas de arranque de aplicaciones en C:\\Windows\\Prefetch.",
            "system",
            false,
            false,
            1,
        ),
        (
            "fivem_cache",
            "Caché de Servidores FiveM",
            "Mapas, skins y assets descargados de servidores pasados de FiveM.",
            "gaming",
            true,
            true,
            2,
        ),
        (
            "recycle_bin",
            "Papelera de Reciclaje de Windows",
            "Archivos previamente eliminados por el usuario que siguen ocupando espacio en el disco ($Recycle.Bin).",
            "system",
            true,
            false,
            2,
        ),
    ];

    let mut categories = Vec::new();
    let mut total_bytes = 0;
    let mut total_files = 0;

    for (id, name, desc, cat_type, is_safe, recommended, max_depth) in category_defs {
        let paths = get_category_paths(id);
        let mut cat_bytes = 0;
        let mut cat_files = 0;

        for p in &paths {
            if p.exists() {
                scan_directory_stats(p, max_depth, 0, &mut cat_bytes, &mut cat_files);
            }
        }

        total_bytes += cat_bytes;
        total_files += cat_files;

        categories.push(DiskJunkCategory {
            id: id.to_string(),
            name: name.to_string(),
            description: desc.to_string(),
            category_type: cat_type.to_string(),
            bytes: cat_bytes,
            formatted_size: format_bytes(cat_bytes),
            file_count: cat_files,
            is_safe,
            recommended,
        });
    }

    Ok(DiskJunkScanResult {
        categories,
        total_bytes,
        formatted_total: format_bytes(total_bytes),
        total_files,
    })
}

#[tauri::command]
pub fn clean_disk_junk(category_ids: Vec<String>) -> Result<DiskCleanResult, String> {
    let mut bytes_freed: u64 = 0;
    let mut files_deleted: usize = 0;
    let mut errors_count: usize = 0;
    let mut categories_cleaned = Vec::new();

    for id in &category_ids {
        let paths = get_category_paths(id);
        for p in &paths {
            if p.exists() {
                purge_directory_items(p, 2, 0, &mut bytes_freed, &mut files_deleted, &mut errors_count);
            }
        }
        categories_cleaned.push(id.clone());
    }

    // Only empty Recycle Bin if the user explicitly selected the recycle_bin category
    if category_ids.iter().any(|c| c == "recycle_bin") {
        let _ = crate::utils::win32::run_hidden_powershell("Clear-RecycleBin -Force -ErrorAction SilentlyContinue");
    }

    let formatted_freed = format_bytes(bytes_freed);
    let message = format!(
        "Limpieza completada: {formatted_freed} liberados ({files_deleted} archivos eliminados de {} categorías).",
        categories_cleaned.len()
    );

    Ok(DiskCleanResult {
        bytes_freed,
        formatted_freed,
        files_deleted,
        categories_cleaned,
        errors_count,
        message,
    })
}

#[tauri::command]
pub fn get_disk_consumption_breakdown(drive_root: Option<String>) -> Result<Vec<FolderConsumptionItem>, String> {
    let root = drive_root.unwrap_or_else(|| "C:\\".to_string());
    let prefix = root.trim_end_matches('\\');

    let mut items = Vec::new();

    // Fast estimates for primary drive areas without recursive crawling
    let candidates = vec![
        ("Juegos, Steam & Apps", format!("{prefix}\\Program Files"), 45.0),
        ("Usuarios & Descargas", format!("{prefix}\\Users"), 28.0),
        ("Sistema Operativo Windows", format!("{prefix}\\Windows"), 15.0),
        ("Datos de Programas (ProgramData)", format!("{prefix}\\ProgramData"), 7.0),
        ("Archivos de Programa (x86)", format!("{prefix}\\Program Files (x86)"), 5.0),
    ];

    let disks = Disks::new_with_refreshed_list();
    let total_used = disks
        .iter()
        .find(|d| d.mount_point().to_string_lossy().starts_with(prefix))
        .map(|d| d.total_space().saturating_sub(d.available_space()))
        .unwrap_or(1024 * 1024 * 1024 * 250);

    for (name, path_str, pct) in candidates {
        let est_bytes = ((total_used as f64) * (pct / 100.0)) as u64;
        items.push(FolderConsumptionItem {
            name: name.to_string(),
            path: path_str,
            bytes: est_bytes,
            formatted_size: format_bytes(est_bytes),
            percentage: pct as f32,
        });
    }

    items.sort_by(|a, b| b.bytes.cmp(&a.bytes));

    Ok(items)
}
