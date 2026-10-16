# Arquitectura del Sistema — g0d tweaks

## 1. Visión General
g0d tweaks es una aplicación de escritorio híbrida con arquitectura de dos capas principales:
1. **Frontend (Capa de Presentación y Estado)**: React 18 SPA impulsada por Vite y Tailwind CSS, con diseño estilo macOS/Raycast.
2. **Backend Nativo (Capa de Sistema)**: Binario en Rust orquestado por Tauri v2, con acceso directo a la Win32 API, Registro de Windows, VSS y gestión de procesos.

## 2. Diagrama de Flujo de Datos

```
[ Usuario / UI ]
       │
       ▼
[ React Views (src/components/views) ]
       │
       ├─► [ AuthContext (Supabase / Discord OAuth / Realtime Roles) ]
       │
       ▼
[ safeInvoke.ts (Abstracción IPC) ]
       ├── (En navegador / Mac preview) ──► [ Mocks de Hardware y Métricas ]
       │
       └── (En Windows Desktop Tauri v2) ─► [ invoke_handler (src-tauri/src/lib.rs) ]
                                                    │
                                                    ▼
                                     [ commands/*.rs (Rust) ]
                                                    │
                                     [ utils/win32.rs & registry.rs ]
                                                    │
                                                    ▼
                                     [ Windows 10/11 Kernel & Win32 API ]
```

## 3. Módulos Principales

### A. Capa de Presentación (Frontend)
- **Vistas (`src/components/views/`)**: Renderizan pantallas según la pestaña activa (`TabType`).
- **Componentes UI (`src/components/ui/`)**: Primitivas visuales (Glassmorphism, gradientes, estados de carga, modales flotantes).
- **Contexto (`src/context/AuthContext.tsx`)**: Gestiona la sesión de Discord, hardware profile (HWID), permisos por roles (`can_use_tweaks`, `can_use_citizens`, `is_admin`) y presencia Realtime en Supabase.
- **IPC Seguro (`src/utils/safeInvoke.ts`)**: Envuelve `@tauri-apps/api/core.invoke`. Si la app se ejecuta fuera de Tauri (e.g. Vite dev en navegador o LAN preview), emula respuestas seguras en memoria.

### B. Capa de Sistema (Rust Backend)
- **Runtime (`src-tauri/src/lib.rs`)**: Registro de handlers de comandos, bandeja del sistema (tray) y configuración de plugins Tauri (`shell`, `process`, `updater`).
- **Módulo Gaming (`commands/gaming.rs`)**: Desactiva HPET (`bcdedit`), habilita Ultimate Performance (`powercfg`), deshabilita GameDVR y ajusta MMCSS.
- **Módulo Citizens (`commands/citizens.rs`)**: Gestión de presets y addons para FiveM, respaldos de citizen y descompresión.
- **Módulo Red y Memoria (`commands/network.rs`, `commands/memory.rs`)**: Algoritmo Nagle (`TcpAckFrequency`), throttling multimedia, y purga de RAM vía `K32EmptyWorkingSet`.
- **Módulo Backup (`commands/backup.rs`)**: Puntos de restauración de Windows (VSS) y exportación de claves del registro (`.reg`).

## 4. Dependencias Clave
- **Frontend**: `@tauri-apps/api`, `@supabase/supabase-js`, `framer-motion`, `lucide-react`, `jspdf`, `html2canvas`.
- **Backend**: `tauri v2`, `sysinfo`, `windows`, `winreg`, `tauri-plugin-updater`, `tauri-plugin-process`.
