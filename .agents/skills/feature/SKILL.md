---
name: feature
description: Añade una nueva feature al proyecto siguiendo la arquitectura existente y con contexto mínimo.
---

# Skill: /feature

Esta skill permite añadir nuevas funcionalidades al proyecto `g0d tweaks` con autonomía total, garantizando la coherencia arquitectónica, sin saturar el contexto y ejecutando directamente de principio a fin.

## Modo de Uso
```text
/feature DESCRIPCIÓN DE LA FEATURE
```

---

## Flujo de Trabajo Autónomo

1. **Lectura de contexto base**:
   Leer exclusivamente `AGENTS.md`, `docs/architecture.md` y `docs/project-map.md`.

2. **Identificación de impacto**:
   Identificar la funcionalidad requerida y delimitar exactamente qué módulos (Frontend, Backend Tauri, Base de datos o IPC) están afectados.

3. **Ubicación canónica**:
   Elegir la carpeta correcta respetando la estructura existente:
   - Vista completa -> `src/components/views/`
   - Componente UI reutilizable -> `src/components/ui/`
   - Lógica nativa de Windows -> `src-tauri/src/commands/`
   - Abstracción / Mock -> `src/utils/safeInvoke.ts`
   - Tipos de datos -> `src/types/index.ts`

4. **Lista mínima de archivos**:
   Listar internamente los únicos archivos que se van a leer, crear o modificar.

5. **Ejecución directa (Permiso Total)**:
   El agente cuenta con autorización y control absoluto concedido por el usuario. No debe detenerse a pedir confirmación previa; implementa los cambios directamente.

6. **Implementación canónica**:
   Desarrollar la feature reutilizando los patrones existentes:
   - UI: `GlassCard`, `ActionButton`, Tailwind, Framer Motion.
   - Llamadas nativas: siempre mediante `safeInvoke.ts` asegurando fallback mock para navegador/LAN.
   - Tipado estricto en `src/types/index.ts`.

7. **Criterio de minimalismo**:
   No introducir librerías externas sin necesidad justificada, no crear abstracciones prematuras y no refactorizar código ajeno a la feature.

8. **Verificación y Testing**:
   Ejecutar las suites de validación (`npm test` o `npm run build`) para comprobar que todo compila y pasa sin regresiones.

9. **Documentación continua**:
   Actualizar `docs/project-map.md` (si se agregaron archivos) y `docs/features.md` (documentando la nueva feature).

10. **Reporte final de entrega**:
    Finalizar informando con claridad:
    - Qué se implementó exactamente.
    - Archivos modificados y creados.
    - Cómo probarlo (vía web o modo nativo).
    - Siguiente paso recomendado.

---

## Restricciones

- **No leer fuera de alcance**: Prohibido abrir o consultar archivos ajenos al módulo afectado.
- **No duplicación**: No replicar utilidades o componentes ya presentes en `src/components/ui/` o `src/utils/`.
- **Documentación concisa**: Prohibido pegar código fuente completo en archivos `.md`.
