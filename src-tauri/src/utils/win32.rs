use std::os::windows::process::CommandExt;
use std::process::Command;

#[cfg(windows)]
use windows::Win32::Foundation::{CloseHandle, HANDLE};
#[cfg(windows)]
use windows::Win32::Security::{GetTokenInformation, TokenElevation, TOKEN_ELEVATION, TOKEN_QUERY};
#[cfg(windows)]
use windows::Win32::System::ProcessStatus::K32EmptyWorkingSet;
#[cfg(windows)]
use windows::Win32::System::Threading::{
    GetCurrentProcess, OpenProcess, OpenProcessToken, PROCESS_QUERY_INFORMATION, PROCESS_SET_QUOTA,
};
#[cfg(windows)]
use windows::Win32::System::Diagnostics::ToolHelp::{
    CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W, TH32CS_SNAPPROCESS,
};

const CREATE_NO_WINDOW: u32 = 0x08000000;

/// Check if current process has Administrator privileges
pub fn is_elevated() -> bool {
    #[cfg(windows)]
    unsafe {
        let mut token_handle: HANDLE = HANDLE::default();
        if OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut token_handle).is_ok() {
            let mut elevation = TOKEN_ELEVATION { TokenIsElevated: 0 };
            let mut returned_len = 0;
            let success = GetTokenInformation(
                token_handle,
                TokenElevation,
                Some(&mut elevation as *mut _ as *mut _),
                std::mem::size_of::<TOKEN_ELEVATION>() as u32,
                &mut returned_len,
            );
            let _ = CloseHandle(token_handle);
            if success.is_ok() {
                return elevation.TokenIsElevated != 0;
            }
        }
    }
    false
}

/// Run a command silently without opening any console window
pub fn run_hidden_cmd(command: &str) -> Result<String, String> {
    let output = Command::new("cmd")
        .args(["/C", command])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| format!("Failed to execute cmd command: {e}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() {
        Ok(stdout)
    } else {
        Err(format!("Command failed: {stderr} (code: {:?})", output.status.code()))
    }
}

/// Run a PowerShell command silently with Bypass policy
pub fn run_hidden_powershell(command: &str) -> Result<String, String> {
    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            command,
        ])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| format!("Failed to execute powershell: {e}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() {
        Ok(stdout)
    } else {
        Err(format!("PowerShell execution error: {stderr}"))
    }
}

/// Empty working sets across all accessible processes using Win32 API K32EmptyWorkingSet
pub fn empty_all_working_sets() -> Result<(u32, u32), String> {
    let mut total_processes = 0u32;
    let mut cleaned_processes = 0u32;

    #[cfg(windows)]
    unsafe {
        let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0)
            .map_err(|e| format!("Snapshot creation failed: {e}"))?;

        let mut entry = PROCESSENTRY32W {
            dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32,
            ..Default::default()
        };

        if Process32FirstW(snapshot, &mut entry).is_ok() {
            loop {
                let pid = entry.th32ProcessID;
                if pid > 4 {
                    total_processes += 1;
                    let access = PROCESS_SET_QUOTA | PROCESS_QUERY_INFORMATION;
                    if let Ok(process_handle) = OpenProcess(access, false, pid) {
                        let ok = K32EmptyWorkingSet(process_handle);
                        let _ = CloseHandle(process_handle);
                        if ok.as_bool() {
                            cleaned_processes += 1;
                        }
                    }
                }

                if Process32NextW(snapshot, &mut entry).is_err() {
                    break;
                }
            }
        }

        let _ = CloseHandle(snapshot);
    }

    Ok((cleaned_processes, total_processes))
}
