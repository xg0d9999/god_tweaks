# Catálogo de Features — g0d tweaks

## 1. Features Existentes

### 1. Telemetría de Hardware en Tiempo Real
- **Descripción**: Monitorización en vivo de uso de CPU, RAM, modelo de hardware y sistema operativo.
- **Ubicación**: `src/components/views/DashboardView.tsx`, `src-tauri/src/commands/telemetry.rs`.

### 2. Planes de Optimización (Presets 1-Click)
- **Descripción**: Aplicación de planes de rendimiento (Lite, Premium, Ultra) con selector de juego (FiveM, CS2, Valorant, Fortnite), distinción entre optimizaciones permanentes y temporales (Pre-Game Boost), e indicador visual de plan activo.
- **Ubicación**: `src/components/views/PresetsView.tsx`, `src-tauri/src/commands/gaming.rs`.

### 3. Gestor de Citizens para FiveM
- **Descripción**: Catálogo de Citizens optimizados, descarga remota, reemplazo seguro con backup, vista previa gráfica y edición individual de ciudadanos. Control de acceso con candado por roles de staff.
- **Ubicación**: `src/components/views/CitizensManagerView.tsx`, `src-tauri/src/commands/citizens.rs`.

### 4. Modo Avanzado (Tweaks Granulares)
- **Descripción**: Activación y desactivación individual de tweaks en CPU, memoria, red y debloat de Windows.
- **Ubicación**: `src/components/views/AdvancedModeView.tsx`, `src-tauri/src/commands/`.

### 5. Copias de Seguridad y Puntos de Restauración
- **Descripción**: Creación de puntos de restauración VSS de Windows y exportación fechada de claves de registro `.reg`.
- **Ubicación**: `src/components/views/BackupView.tsx`, `src-tauri/src/commands/backup.rs`.

### 6. Banco de Pruebas y Reporte PDF
- **Descripción**: Medición de latencia y parámetros antes y después de aplicar optimizaciones, con exportación de reporte visual impoluto en PDF.
- **Ubicación**: `src/components/views/BenchmarkView.tsx`, `src-tauri/src/commands/test_bench.rs`.

### 7. Autenticación, Roles y Auditoría
- **Descripción**: Login con Discord OAuth, perfiles HWID, control en tiempo real de permisos (`can_use_tweaks`, `can_use_citizens`, `can_use_sanciones`, `can_use_tickets`, `is_admin`) vía Supabase Realtime y webhooks de auditoría a Discord.
  - **1 Cuenta de Discord por PC**: Cada instalación / PC (identificado por MachineGuid HWID único en Supabase) solo admite una única cuenta de Discord. Cualquier intento de inicio de sesión con una cuenta secundaria desde el mismo equipo es bloqueado con advertencia explícita.
  - **Bloqueo Total por Defecto para Futuros Nuevos Usuarios (Opt-in Estricto con Ticket Privado)**: A partir de ahora, todas las opciones (`can_use_tweaks`, `can_use_sanciones`, `can_use_citizens`, `can_use_tickets`) tienen `DEFAULT false` en la base de datos Supabase. Los nuevos usuarios que se registren iniciarán con todas las opciones bloqueadas, y la vista de bloqueo les instruye abrir un **ticket privado en Discord** para solicitar activación. Los usuarios ya registrados previamente conservan sus permisos activos intactos sin ninguna interrupción.
- **Ubicación**: `src/context/AuthContext.tsx`, `src/services/supabase.ts`, `src/services/discordLogger.ts`, `src/components/views/PermissionBlockedView.tsx`.
### 8. Panel de Administración
- **Descripción**: Gestión centralizada de usuarios registrados, asignación de permisos a dedo (toggles en tiempo real para Optimizaciones, Sanciones, Citizens y Conteos de Tickets) y monitoreo de hardware conectado:
  - **Aislamiento de IPs en "Ver Detalles Hardware"**: Las direcciones IP ya no se muestran en la lista general de usuarios, garantizando máxima privacidad durante retransmisiones o revisiones en directo. Para consultar la IP de un usuario, el administrador pulsa en su botón **"Ver Detalles Hardware"**, donde se despliega la telemetría completa (Dirección IP con botón de copiado rápido, CPU, GPU, RAM y Sistema Operativo).
  - **Desvinculación de HWID**: Botón para liberar el hardware vinculado a un usuario en caso de formateo o cambio de equipo.
- **Ubicación**: `src/components/views/AdminPanelView.tsx`.

### 9. Previsualización LAN / Navegador
- **Descripción**: Servidor Vite accesible en red local (`npm run preview:lan`) con fallback de APIs de Tauri mediante `safeInvoke.ts` para pruebas visuales en navegadores o macOS.
- **Ubicación**: `vite.config.ts`, `src/utils/safeInvoke.ts`.

### 10. Centro de Ayuda & FAQ para Principiantes
- **Descripción**: Botón en la barra lateral con modal interactivo "explicado para tontos" con buscador, guía por casos de uso (FiveM, shooters, uso mixto), explicación de planes y Pre-Game Boost, resolución de dudas de bans/seguridad y glosario.
- **Ubicación**: `src/components/ui/HelpFaqModal.tsx`, `src/components/layout/Sidebar.tsx`.

### 11. Gestor y Conteo Manual de Tickets HispanLifeRP con Generador de Plantilla Discord
- **Descripción**: Sistema ergonómico de conteo manual y gestión de staffs para tickets de soporte de Discord:
  - **Suma y Resta Instantánea**: Botones `+` / `-` y edición numérica directa por usuario para registrar intervenciones ágilmente sin hojas de Excel.
  - **Organización por 12 Rangos Oficiales**: Soporte Nivel 1 y 2, Moderador En Pruebas, Moderador, Super Moderador, Administrador En Pruebas, Administrador, Administrador +, Master Admin, SuperAdmin En Pruebas, SuperAdmin y Dirección.
  - **Orden Estrictamente Alfabético**: Todos los miembros de cada categoría se ordenan automáticamente de la A a la Z.
  - **Drag and Drop de Personal Suave (Spring Physics & Auto-Sort A-Z)**: Arrastre fluido de tarjetas de staff entre rangos para ascensos, descensos o traslados de categoría con animaciones Framer Motion (`layoutId` spring), banners visuales de recepción en rangos destino, auto-despliegue de categorías y reordenamiento automático estrictamente alfabético (A-Z) en tiempo real.
  - **Generador de Plantilla para Discord (1-Click Copy)**: Formateo automático de cabecera con fecha y turno dinámico (`__**RESUMEN CONTEO DE TICKETS HISPANLIFERP - xx/xx/xxxx - *TURNO**__` donde TURNO es MAÑANA, TARDE o NOCHE según la hora del sistema con selector visual de chips), omisión de miembros con 0 tickets, y reconocimientos finales para Top Soportes y Top Staff IG (con omisión de `@` para SuperAdmin hacia arriba).
  - **Registro y Auditoría de Interacciones (Logs en App & Discord)**: Registro detallado y automático de cada acción crítica (alta de staff, baja/expulsión, cambio de categoría por drag & drop, copiado de plantilla, cambio de turno y reseteo a 0). Cuenta con modal interactivo con buscador, filtrado por categorías, exportación de reportes y envío paralelo al webhook de auditoría de Discord.
  - **Historial y Reinicio**: Poner a 0 con guardado automático de sesiones pasadas en historial.
- **Ubicación**: `src/components/views/TicketCounterView.tsx`, `src/services/discordLogger.ts`, `src/utils/ticketTemplateFormatter.ts`, `src/types/index.ts`.

### 12. Limpieza & Analizador de Disco Duro en Modo Avanzado
- **Descripción**: Módulo completo de diagnóstico de almacenamiento y eliminación de gigabytes de archivos basura en Windows:
  - **Detección de Unidades Multi-Disco**: Monitorización en tiempo real de discos (C:, D:, etc.), formato (NTFS), tipo (SSD / HDD), espacio usado/libre y barras de progreso visuales con alertas cromáticas.
  - **Analizador de Consumo de Disco ("¿Qué se está consumiendo el tamaño?")**: Desglose porcentual y en gigabytes de las carpetas más pesadas del disco maestro (`C:\Program Files`, `C:\Users`, `C:\Windows`, `C:\ProgramData`).
  - **Escaneo Inteligente de Cachés & Basura Oculta**: Identificación de temporales (`%TEMP%`, `C:\Windows\Temp`), descargas residuales de Windows Update (`SoftwareDistribution\Download`), caché de sombreadores de GPU (`DXCache`, `GLCache`, `D3DSCache`), caché multimedia acumulada de Discord, caché de navegadores (Chrome, Edge, Brave), volcados de error y crash dumps (`.dmp`), miniaturas de Windows y caché pesada de FiveM.
  - **Selección Granular y Filtros**: Filtros rápidos por Sistema, Gaming y Apps, botón de "Seleccionar Seguros" (excluye prefetch y archivos sensibles), y barra de acción flotante con cálculo en tiempo real del espacio a recuperar.
  - **Vaciado y Limpieza Nativa Win32**: Motor en Rust con supresión de papelera de reciclaje y confirmación sonora de éxito.
- **Ubicación**: `src/components/views/DiskCleanerView.tsx`, `src/components/views/AdvancedModeView.tsx`, `src-tauri/src/commands/disk.rs`, `src/types/index.ts`.

### 13. Portal Web de Gestión de Staff & Control de Accesos (Vercel)
- **Descripción**: Plataforma web en la nube desplegada en producción (`https://hispansanciones.vercel.app`) para la administración de usuarios, equipo de moderación y permisos de la suite:
  - **1-Click Master Access & Toggles Granulares**: Botón de acción rápida para conceder o revocar acceso total a todos los módulos de golpe, con conmutadores individuales en tiempo real para Sanciones, Tweaks, Citizens y Conteo de Tickets.
  - **Protección Inquebrantable del Dueño**: Regla de seguridad absoluta tanto en la base de datos Supabase como en la interfaz web: ningún miembro del staff puede deshabilitar al Dueño ni retirarle permisos bajo ninguna circunstancia (indicador visual de Corona Dorada y blindaje total).
  - **Gestión de Cuentas Staff y Contraseñas a Voluntad**: El Dueño puede crear cuentas de Staff y Administrador asignando la contraseña que desee para cada usuario, y modificar la contraseña de cualquier usuario o staff a su antojo en cualquier momento mediante hashing nativo SHA-256 en Web Crypto.
  - **Vinculación con Discord**: Asociación de ID de usuario y nombre de usuario de Discord.
  - **Auditoría & Logs de Staff**: Registro exhaustivo y consulta en tiempo real de todas las acciones operativas (inicios de sesión, altas de personal, cambios de contraseña, suspensiones y concesión/bloqueo de accesos).
- **Ubicación**: Directorio `web/`, publicado y activo en `https://hispansanciones.vercel.app`.

### 14. Bot de Discord de Tickets 24/7 (Soporte & Errores con Brand Kit Oficial)
- **Descripción**: Sistema autónomo de tickets para el servidor de Discord (`g0d hub`), preparado para ejecución desatendida 24/7 mediante scripts `.bat`:
  - **Brand Kit Blanco Oficial**: Embeds con color blanco puro (`0xFFFFFF`), estructura tipográfica idéntica al Brand Guide del servidor (`##`, `###`, citas `>` y subrayado `__`), logo oficial en miniatura (`thumbnail`), banner inferior de `g0d suite` (`image`) y pie de página corporativo (`g0d hub  -  Todos los derechos reservados.`).
  - **Menú Desplegable (`StringSelectMenu`) sin Botones**: Selección limpia mediante menú desplegable con únicamente dos departamentos: **Soporte** (`⚡`) y **Errores** (`🛠️`), con auto-reseteo de selección en el panel tras cada apertura.
  - **Atención Exclusiva por ID (`1103581405096710226`)**: Los canales privados de ticket generados deniegan la vista a `@everyone` y conceden acceso exclusivamente al usuario solicitante y al ID `1103581405096710226`.
  - **Auto-Rol de Miembro Inmediato**: Asignación automática del rol `👤・Miembro` (`1543332744292081734`) a cada nuevo usuario al ingresar al servidor, con registro visual del evento en `#📊・registros`.
  - **Protección Anti-Raid & Cuarentena Automática**: Detección de ingresos masivos (más de 5 entradas en 12 segundos). Entra en modo *Lockdown*, pausa preventivamente el auto-rol para poner en cuarentena a los sospechosos, aisla cuentas nuevas y envía alerta prioritaria en tiempo real al dueño en `#📊・registros`.
  - **Protección Anti-Spam Integral**:
    - *Anti-Flood*: Bloquea y elimina ráfagas de 5 o más mensajes en 4 segundos, silenciando al infractor durante 5 minutos.
    - *Anti-Menciones*: Bloquea y elimina menciones masivas (>=4 menciones o intentos de `@everyone`) aplicando aislamiento de 15 minutos.
    - *Anti-Repetición*: Detecta y suprime textos idénticos repetidos 3 veces consecutivas.
    - *Anti-Invites*: Elimina enlaces de invitación externos de Discord y estafas en canales públicos con advertencia efímera.
  - **Doble Script `.bat` para Servidor Windows**:
    1. `1-crear-canal-y-permisos.bat` (`setup-tickets.js`): Crea automáticamente la categoría `🎫・SOPORTE & TICKETS`, el canal `🎫・tickets`, configura los permisos de solo lectura para miembros y publica el panel oficial.
    2. `2-iniciar-bot-24-7.bat` (`daemon.js` + `bot.js`): Lanza un demonio supervisor oculto en segundo plano (`WindowStyle Hidden`) con auto-reinicio ante caídas que mantiene el bot activo 24/7 aunque se cierre la ventana del `.bat`. Incluye `3-detener-bot-24-7.bat` para apagado manual.
- **Ubicación**: `discord-bot/bot.js`, `discord-bot/setup-tickets.js`, `discord-bot/daemon.js`, `discord-bot/1-crear-canal-y-permisos.bat`, `discord-bot/2-iniciar-bot-24-7.bat`.

---

## 2. Features Pendientes
- **Overclocking seguro asistido**: Perfiles guiados de curvas de ventiladores y offsets de GPU.
- **Detección automática de juego en ejecución**: Aplicación automática del plan temporal al lanzar FiveM o CS2 en segundo plano.

