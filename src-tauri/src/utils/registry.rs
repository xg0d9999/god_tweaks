use winreg::enums::*;
use winreg::{RegKey, HKEY};

/// Set a DWORD value in the registry
pub fn set_dword(hkey: HKEY, path: &str, key_name: &str, value: u32) -> Result<(), String> {
    let root = RegKey::predef(hkey);
    let (key, _) = root
        .create_subkey(path)
        .map_err(|e| format!("Failed to open/create subkey {path}: {e}"))?;

    key.set_value(key_name, &value)
        .map_err(|e| format!("Failed to set DWORD value {key_name} in {path}: {e}"))?;

    Ok(())
}

/// Set a String (SZ) value in the registry
pub fn set_string(hkey: HKEY, path: &str, key_name: &str, value: &str) -> Result<(), String> {
    let root = RegKey::predef(hkey);
    let (key, _) = root
        .create_subkey(path)
        .map_err(|e| format!("Failed to open/create subkey {path}: {e}"))?;

    key.set_value(key_name, &value)
        .map_err(|e| format!("Failed to set String value {key_name} in {path}: {e}"))?;

    Ok(())
}

/// Get a DWORD value from the registry
pub fn get_dword(hkey: HKEY, path: &str, key_name: &str) -> Result<u32, String> {
    let root = RegKey::predef(hkey);
    let key = root
        .open_subkey(path)
        .map_err(|e| format!("Failed to open subkey {path}: {e}"))?;

    let val: u32 = key
        .get_value(key_name)
        .map_err(|e| format!("Failed to get DWORD value {key_name} in {path}: {e}"))?;

    Ok(val)
}

/// Get a String value from the registry
pub fn get_string(hkey: HKEY, path: &str, key_name: &str) -> Result<String, String> {
    let root = RegKey::predef(hkey);
    let key = root
        .open_subkey(path)
        .map_err(|e| format!("Failed to open subkey {path}: {e}"))?;

    let val: String = key
        .get_value(key_name)
        .map_err(|e| format!("Failed to get String value {key_name} in {path}: {e}"))?;

    Ok(val)
}

/// Delete a value from a registry key
pub fn delete_value(hkey: HKEY, path: &str, key_name: &str) -> Result<(), String> {
    let root = RegKey::predef(hkey);
    if let Ok(key) = root.open_subkey_with_flags(path, KEY_WRITE) {
        let _ = key.delete_value(key_name);
    }
    Ok(())
}

/// List all subkey names in a given path
pub fn enum_subkeys(hkey: HKEY, path: &str) -> Result<Vec<String>, String> {
    let root = RegKey::predef(hkey);
    let key = root
        .open_subkey(path)
        .map_err(|e| format!("Failed to open subkey {path}: {e}"))?;

    let subkeys = key
        .enum_keys()
        .filter_map(|k| k.ok())
        .collect();

    Ok(subkeys)
}
