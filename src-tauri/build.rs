fn main() {
    let mut windows = tauri_build::WindowsAttributes::new();
    let is_release = std::env::var("PROFILE").map(|p| p == "release").unwrap_or(false);
    let level = if is_release {
        "requireAdministrator"
    } else {
        "asInvoker"
    };

    let manifest = format!(r#"
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
  <trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
    <security>
      <requestedPrivileges>
        <requestedExecutionLevel level="{level}" uiAccess="false" />
      </requestedPrivileges>
    </security>
  </trustInfo>
  <dependency>
    <dependentAssembly>
      <assemblyIdentity
        type="win32"
        name="Microsoft.Windows.Common-Controls"
        version="6.0.0.0"
        processorArchitecture="*"
        publicKeyToken="6595b64144ccf1df"
        language="*"
      />
    </dependentAssembly>
  </dependency>
</assembly>
"#);

    windows = windows.app_manifest(&manifest);

    tauri_build::try_build(tauri_build::Attributes::new().windows_attributes(windows))
        .expect("failed to run tauri-build");
}
