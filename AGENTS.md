# Reglas y Guía para Agentes de IA en g0d tweaks

## 1. Propósito del Proyecto
g0d tweaks es una suite de optimización de sistema y latencia en Windows 10/11 enfocada en gaming competitivo y eSports. Combina una interfaz gráfica React inspirada en macOS/Raycast con un motor nativo en Rust (Tauri v2) que interactúa con la Win32 API y el Registro de Windows.

## 2. Stack Tecnológico
- **Frontend**: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Framer Motion 11, Lucide React.
- **Backend Nativo**: Rust, Tauri v2, Win32 API (`windows`, `winreg`, `sysinfo`, `K32EmptyWorkingSet`).
- **Nube y Auth**: Supabase (`@supabase/supabase-js`), Discord OAuth & Webhooks.
- **Testing**: Node.js test runner (`node --test`).

## 3. Comandos Principales
- `npm run dev`: Servidor web Vite local con mocks en navegador.
- `npm run dev:lan`: Servidor Vite accesible en red local (`0.0.0.0:3000`).
- `npm run preview:lan`: Previsualización de producción en red local (`0.0.0.0:3000`).
- `npm run tauri dev`: Ejecución de escritorio nativa en modo dev.
- `npm run dev:admin`: Ejecución nativa con elevación de administrador (UAC).
- `npm test`: Ejecutar tests unitarios (`tests/test-bench.test.mjs`).
- `npm run build`: Type-check (`tsc`) y compilación web con Vite.
- `npm run tauri build`: Compilación del instalador final para Windows.

## 4. Mapa Rápido de Carpetas
- `src/components/views/`: Vistas principales de la aplicación (`DashboardView`, `PresetsView`, etc.).
- `src/components/ui/`: Componentes UI atómicos y modales (`GlassCard`, `ActionButton`, etc.).
- `src/components/layout/`: Layout general (`Sidebar`, `TitleBar`).
- `src/context/`: Estado global de autenticación, HWID y roles (`AuthContext.tsx`).
- `src/services/`: Clientes de servicios externos (`supabase.ts`, `discordLogger.ts`).
- `src/types/`: Definiciones TypeScript (`index.ts`).
- `src/utils/`: Utilidades generales e IPC seguro con fallback (`safeInvoke.ts`).
- `src-tauri/src/commands/`: Handlers Rust de comandos nativos de Windows.
- `src-tauri/src/utils/`: Wrappers Win32 y Registro de Windows.
- `tests/`: Suites de pruebas unitarias.

## 5. Reglas Estrictas para Agentes
1. **Regla de Oro**: Antes de editar, identifica el módulo afectado y abre solo los archivos relacionados.
2. **Autonomía Total**: El usuario otorga permiso absoluto y control total. El agente NO debe preguntar ni pedir confirmación intermedia; debe ejecutar las modificaciones directamente hasta finalizar la tarea.
3. **Prohibición de lectura indiscriminada**: Está estrictamente prohibido abrir o leer archivos no relacionados con la tarea actual.
4. **Ignorar carpetas pesadas/sensibles**: No inspeccionar `node_modules/`, `dist/`, `src-tauri/target/`, `.git/`, `.env`, ni `.updater.key*`.
5. **Respetar patrones existentes**: Reutilizar `safeInvoke` para llamadas Tauri, `GlassCard`/`ActionButton` para UI, y tipos en `src/types/index.ts`.
6. **Simulación web requerida**: Todo nuevo comando IPC en Tauri debe incluir su simulación mock correspondiente en `src/utils/safeInvoke.ts` para permitir el modo navegador / LAN preview.
7. **No romper tests**: Siempre ejecutar `npm test` antes de dar una tarea por finalizada.
8. **Control de cambios en docs**: Cada nueva feature debe actualizar `docs/project-map.md` y `docs/features.md`.
