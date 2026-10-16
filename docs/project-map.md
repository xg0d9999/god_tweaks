# Mapa del Proyecto — g0d tweaks

Índice estructurado de directorios, responsabilidades y archivos clave.

## 1. Raíz (`/`)
- `package.json`: Scripts principales (`dev`, `build`, `test`, `tauri dev`, `preview:lan`) y dependencias.
- `vite.config.ts`: Configuración de Vite (puerto 3000, host `0.0.0.0` para LAN).
- `tailwind.config.js`: Tokens de diseño, colores neón/dark, glassmorphism y animaciones.
- `tsconfig.json`: Configuración y paths de compilación de TypeScript.

## 2. Frontend (`src/`)

### `src/components/views/` — Vistas principales
- `DashboardView.tsx`: Telemetría en vivo, monitor de recursos y ejecución 1-Click rápida.
- `PresetsView.tsx`: Planes de optimización (Lite, Premium, Ultra), selector de juego y Pre-Game Boost.
- `CitizensManagerView.tsx`: Catálogo, instalación, borrado y edición individual de Citizens de FiveM.
- `AdvancedModeView.tsx`: Control granular de optimizaciones individuales (CPU, Memoria, Red, Debloat, Disco).
- `DiskCleanerView.tsx`: Analizador de consumo de disco, unidades de almacenamiento y limpieza inteligente de gigabytes de basura.
- `BackupView.tsx`: Gestión de Puntos de Restauración (VSS) y respaldos `.reg` del registro.
- `BenchmarkView.tsx`: Banco de pruebas comparativo pre/post optimización con exportación a PDF.
- `HispanSancionesView.tsx`: Sistema de moderación y auditoría de sanciones para FiveM.
- `TicketCounterView.tsx`: Gestor y conteo manual de tickets para HispanLifeRP, con botones +/- por staff, Drag and Drop para cambios de rango, orden alfabético estricto y salida formateada para Discord.
- `AdminPanelView.tsx`: Panel administrativo de usuarios, HWIDs y permisos manuales.
- `PermissionBlockedView.tsx`: Vista de acceso denegado para roles no autorizados.

### `src/components/ui/` — Componentes visuales y modales
- `GlassCard.tsx`: Tarjetas de cristal acrílico con borde fino y desenfoque de fondo.
- `ActionButton.tsx`: Botón con gradientes interactivos, estados de carga y luces de neón.
- `Badge.tsx`: Badges de seguridad (`Seguro`, `Gaming`, `Extremo`).
- `MetricCard.tsx`: Indicadores modulares de uso de CPU, RAM y latencia.
- `GameSelectorModal.tsx` & `GameSelectorStandaloneView.tsx`: Modales de selección de títulos soportados.
- `OptimizationModal.tsx`: Progreso interactivo paso a paso de optimizaciones en ejecución.
- `HelpFaqModal.tsx`: Centro de ayuda, guía para principiantes ("para tontos"), FAQ y glosario.
- `UpdateModal.tsx`: Diálogo de notificación y descarga de actualizaciones OTA.

### `src/components/layout/` & `common/` — Estructura y utilidades UI
- `TitleBar.tsx`: Barra superior minimalista estilo macOS con semáforo de ventana, versión de la app, botón de atajos globales y avatar de Discord.
- `Sidebar.tsx`: Menú lateral de navegación con iconos y candados de restricción en tiempo real (incluyendo Sanciones HispanLife y Conteo de Tickets).
- `ErrorBoundary.tsx`: Atrapador de excepciones de React con UI de recuperación.
- `HotkeySettingsModal.tsx`: Diálogo para configurar combinaciones de teclas globales.

### `src/context/` — Estado Global
- `AuthContext.tsx`: Proveedor de contexto con Discord OAuth, HWID, permisos y canal Supabase Realtime.

### `src/services/` — Clientes de red
- `supabase.ts`: Cliente de Supabase, queries a `app_users`, `app_updates` y Storage.
- `discordLogger.ts`: Webhooks de auditoría y telemetría hacia Discord.
- `deepseek.ts`: Cliente de DeepSeek AI para auditoría semántica de tickets de soporte.
- `discordTicketListener.ts`: Motor de conexión WebSocket Gateway y REST API para Discord (Modo Usuario Nighty-style sin intents y Modo Bot con embeds) para capturar comandos `/revisa`.
- `updater.ts`: Orquestador de actualizaciones automáticas con `@tauri-apps/plugin-updater`.

### `src/types/` — Definiciones de datos
- `index.ts`: Modelos de TypeScript (`TabType`, `PresetType`, `ActivePlanData`, `SystemMetrics`, `HardwareProfile`).

### `src/utils/` — Utilidades
- `safeInvoke.ts`: Capa de abstracción IPC (`safeInvoke`) con mocks de prueba para navegador y LAN.
- `ticketTemplateFormatter.ts`: Roster oficial de 49 staffs, 12 rangos, ordenación alfabética y generador de plantillas Discord para tickets.

## 3. Backend Nativo (`src-tauri/`)

### `src-tauri/src/` — Núcleo Rust
- `main.rs`: Punto de entrada Win32 compilado sin ventana de consola.
- `lib.rs`: Orquestador Tauri, setup de tray, registro de plugins y handlers IPC.
- `tray.rs`: Icono y menú de opciones en la bandeja del sistema de Windows.

### `src-tauri/src/commands/` — Handlers IPC
- `gaming.rs`: HPET, Ultimate Performance, GameDVR y prioridades MMCSS.
- `debloat.rs`: Desactivación de telemetría de Windows, Cortana, Copilot y bloatware.
- `network.rs`: Parámetros TCP (Nagle), throttling multimedia y flush DNS.
- `memory.rs`: Vaciado de working set (`K32EmptyWorkingSet`) y purga de cachés de shaders.
- `citizens.rs`: Descarga, extracción de ZIPs y gestión de carpetas citizen en FiveM.
- `discord_reader.rs`: Captura y lectura de texto en ventanas de Discord sin tokens para auditoría con DeepSeek AI.
- `hotkey.rs`: Listener nativo Win32 de atajos globales (`Win+J` minimizar/restaurar, `Win+Y` auditar ticket de Discord).
- `backup.rs`: Instantáneas de volumen VSS y volcado de registro a `.reg`.
- `telemetry.rs`: Métricas del sistema en tiempo real y perfilado de hardware.
- `test_bench.rs`: Diagnósticos y tests antes/después de optimización.
- `disk.rs`: Información de unidades y particiones, escáner de archivos basura, limpiador Win32 y desglose de consumo de disco.

### `src-tauri/src/utils/` — Auxiliares de bajo nivel
- `registry.rs`: Lectura y escritura segura de claves DWORD y SZ en el Registro de Windows.
- `win32.rs`: Detección de privilegios de Administrador y ejecución silenciosa de procesos.

## 4. Tests y Scripts (`tests/`, `scripts/`)
- `tests/test-bench.test.mjs`: Test suite con Node.js runner para validar 12 aserciones clave del motor.
- `scripts/publish.mjs`: Pipeline de empaquetado, firmado y release en GitHub.

## 5. Portal Web Cloud (`web/`)
- `web/src/components/LoginView.tsx`: Pantalla de inicio de sesión de Staff con verificación criptográfica SHA-256.
- `web/src/components/Navbar.tsx`: Barra de navegación con pestañas, perfil con rango, y modal de vinculación con Discord.
- `web/src/components/UsersManagementTab.tsx`: Gestión y conmutación de accesos de usuarios de la suite con botón de "Acceso Total" y switches granulares protegidos.
- `web/src/components/StaffManagementTab.tsx`: Creación de cuentas Staff/Admin con contraseña arbitraria y cambio de contraseña a voluntad por el Dueño.
- `web/src/components/AuditLogsTab.tsx`: Tabla de auditoría en tiempo real con badges de colores para todas las operaciones críticas de staff.
- `web/src/services/supabase.ts`: Capa de datos con Supabase, hash Web Crypto SHA-256, políticas de protección del Dueño y auditoría.
- `web/vercel.json`: Reglas de reescritura SPA para despliegue en Vercel (`https://hispansanciones.vercel.app`).

## 6. Bot de Discord 24/7 (`discord-bot/`)
- `discord-bot/setup-tickets.js`: Script de despliegue único para crear categoría `🎫・SOPORTE & TICKETS`, canal `🎫・tickets`, permisos exclusivos para el ID `1103581405096710226` y envío del panel con Brand Kit blanco y menú desplegable (`Soporte` / `Errores`).
- `discord-bot/bot.js`: Motor principal del bot que gestiona las interacciones del menú desplegable, apertura de canales privados de ticket, transcripciones en `#📊・registros` y comando `/actualizacion`.
- `discord-bot/daemon.js`: Supervisor watchdog que mantiene `bot.js` vivo 24/7 con auto-reinicio automático ante desconexiones o caídas y registro en `bot-24-7.log`.
- `discord-bot/1-crear-canal-y-permisos.bat`: Ejecutable `.bat` para crear únicamente la categoría, el canal, los permisos y publicar el panel de tickets.
- `discord-bot/2-iniciar-bot-24-7.bat`: Ejecutable `.bat` que lanza el bot en segundo plano oculto (`WindowStyle Hidden`) de modo que sigue activo 24/7 aunque se cierre la ventana del `.bat`.
- `discord-bot/3-detener-bot-24-7.bat`: Ejecutable `.bat` auxiliar para detener el proceso en segundo plano cuando se requiera.
