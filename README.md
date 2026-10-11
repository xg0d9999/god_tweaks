# ⚡ g0d tweaks — Windows 11/10 Extreme Gaming & Latency Suite

![Stack](https://img.shields.io/badge/Architecture-Tauri_v2_+_Rust-orange.svg)
![Frontend](https://img.shields.io/badge/Frontend-React_18_+_Tailwind_+_Framer_Motion-blue.svg)
![Style](https://img.shields.io/badge/UI_Style-macOS_/_Raycast_/_Linear-08090A.svg)
![Platform](https://img.shields.io/badge/Platform-Windows_11_/_10_(Win32)-00F0FF.svg)

**g0d tweaks** es una suite de optimización para Windows 11 y 10 orientada a eSports y gaming competitivo. Diseñada con una estética visual ultra-premium inspirada en **macOS**, **Raycast** y **Linear**, combina controles nativos de ventana sin bordes, glassmorphism acrílico, y un motor de alto rendimiento en **Rust** que interactúa directamente con el Registro de Windows y las APIs nativas de Win32.

---

## 🏛️ Arquitectura del Sistema

```
god_tweaks/
├── src-tauri/                       # Backend Nativo en Rust (Tauri v2)
│   ├── Cargo.toml                  # Dependencias: tauri v2, sysinfo, winreg, windows
│   ├── tauri.conf.json             # Configuración de ventana acrílica, sin bordes y transparente
│   ├── capabilities/               # Permisos de IPC y gestión de ventana de Tauri v2
│   └── src/
│       ├── main.rs                 # Entrada del proceso con eliminación de consola Win32
│       ├── lib.rs                  # Orquestador del runtime, estados y registro de handlers
│       ├── utils/
│       │   ├── registry.rs         # Wrappers de lectura/escritura DWORD/SZ en Registro
│       │   └── win32.rs            # Comprobación de UAC, llamadas a K32EmptyWorkingSet y comandos ocultos
│       └── commands/
│           ├── telemetry.rs        # Telemetría en tiempo real de CPU y memoria RAM (sysinfo)
│           ├── gaming.rs           # HPET, Ultimate Performance, GameDVR y prioridades MMCSS
│           ├── debloat.rs          # Desactivación de Telemetría, Cortana, Copilot y UWP bloatware
│           ├── network.rs          # Algoritmo Nagle (TCPNoDelay), flush DNS y throttling multimedia
│           ├── memory.rs           # Vaciado del Working Set de RAM y limpieza de caché de Shaders DirectX
│           └── backup.rs           # Puntos de Restauración (VSS) y exportación de archivos .reg
└── src/                            # Frontend (React 18 + Tailwind CSS + Framer Motion)
    ├── App.tsx                     # Orquestador de vistas, polling de telemetría y ejecución 1-Click
    ├── types/                      # Interfaces TypeScript para métricas y estados
    ├── components/
    │   ├── layout/
    │   │   ├── TitleBar.tsx        # Semáforo de ventana macOS (rojo, amarillo, verde) y UAC badge
    │   │   └── Sidebar.tsx         # Barra de navegación flotante translúcida
    │   ├── ui/
    │   │   ├── GlassCard.tsx       # Tarjetas modulares de cristal con borde ultra-fino
    │   │   ├── ToggleSwitch.tsx    # Switches de palanca hiper-fluidos con Framer Motion
    │   │   ├── Badge.tsx           # Badges de seguridad: Seguro, Gaming, Extremo
    │   │   └── ActionButton.tsx    # Botones con gradientes, luces de neón y estados de carga
    │   └── views/
    │       ├── DashboardView.tsx   # Telemetría en vivo, banner 1-Click y terminal de logs del Kernel
    │       ├── GamingView.tsx      # Ajustes de Input Lag, temporizador TSC y GameDVR
    │       ├── DebloatView.tsx     # Desactivación de telemetría de diagnóstico y bloatware
    │       ├── NetworkView.tsx     # Optimización de latencia TCP y paquetes de red
    │       ├── MemoryView.tsx      # Purga de memoria RAM activa y cachés de sombreadores de GPU
    │       └── BackupView.tsx      # Seguridad obligatoria y puntos de restauración
```

---

## 🚀 Motor de Optimización de Bajo Nivel (Rust / Win32)

### 1. Gaming & Input Lag
- **HPET & Dynamic Tick**: Ejecuta `bcdedit /set useplatformclock false` y `bcdedit /set disabledynamictick yes`, forzando el uso exclusivo del reloj TSC en el silicio del procesador.
- **Ultimate Performance**: Duplica e inyecta el esquema de energía de estaciones de trabajo `e9a42b02-d5df-448d-aa00-03f14749eb61` para evitar latencias de cambio de frecuencia en núcleos de la CPU.
- **GameDVR & Game Bar**: Deshabilita la captura en segundo plano en `HKCU\System\GameConfigStore\GameDVR_Enabled = 0` y `HKLM\SOFTWARE\Policies\Microsoft\Windows\GameDVR\AllowGameDVR = 0`.
- **MMCSS & Prioridad de GPU**: Maximiza `SystemResponsiveness = 0` y configura en la tarea `Games` una prioridad de GPU de 8 y SFIO de alta prioridad.

### 2. Red & Ping
- **Algoritmo Nagle**: Recorre todas las interfaces de red activas en el registro e inyecta `TcpAckFrequency = 1` y `TCPNoDelay = 1`, forzando el envío inmediato de paquetes sin agrupar.
- **Throttling Multimedia**: Anula la limitación de red multimedia de Windows configurando `NetworkThrottlingIndex = 0xFFFFFFFF`.
- **Vaciado DNS**: Invoca `ipconfig /flushdns` para resolver desajustes de enrutamiento y servidores de emparejamiento.

### 3. Memoria & Basura
- **Purga de Working Set**: Invoca la API Win32 nativa `K32EmptyWorkingSet` a través de identificadores de procesos obtenidos mediante instantáneas de herramientas de depuración (`CreateToolhelp32Snapshot`).
- **Cachés de Sombreadores**: Elimina de forma segura sombreadores compilados desactualizados en `%LOCALAPPDATA%\NVIDIA\DXCache`, `GLCache`, `AMD\DxCache`, `D3DSCache`, así como archivos temporales y Prefetch.

### 4. Respaldo y Seguridad
- **Punto de Restauración**: Ejecuta `Checkpoint-Computer -Description 'g0d_tweaks' -RestorePointType 'MODIFY_SETTINGS'` a través de PowerShell antes de cualquier cambio sustancial.
- **Exportación de Registro**: Exporta copias de seguridad de las claves modificadas a archivos `.reg` fechados en `%USERPROFILE%\.god_tweaks\backups\`.

---

## 🛠️ Comandos de Ejecución y Compilación

### Requisitos previos
- Node.js (v18+)
- Rust & Cargo (1.78+)
- Visual Studio C++ Build Tools (con SDK de Windows)

### Modo Desarrollo Frontend (Previsualización en Navegador)
```bash
npm run dev
```

### Modo Escritorio Tauri v2 (Conexión Nativa a Windows)
```bash
npm run tauri dev
```

### Compilar Ejecutable de Producción
```bash
npm run tauri build
```
El instalador y ejecutable autónomo se generará en `src-tauri/target/release/bundle/msi` o `.exe`.
