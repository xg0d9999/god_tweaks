# HispanLife RP · Sistema de Sanciones

Aplicación de escritorio **portable** (Python + Tkinter) para calcular y aplicar
sanciones del reglamento de **HispanLife RP** mientras juegas.

No es una página web: es una app nativa que se puede empaquetar en un único `.exe`.

---

## ¿Qué hace?

- Muestra las **64 infracciones** del reglamento con un buscador.
- Para cada infracción eliges si es **Reconocida** o **Sin reconocer**
  (según los encabezados de la tabla, "Sin reconocer" es la sanción más alta).
- Hace un **sumatorio automático** de minutos de Jail y de días de Baneo.
- Muestra el **resultado** (tipo + duración + adicionales).
- Copia al portapapeles:
  - la **plantilla de reporte**,
  - el comando **`/jail`**,
  - el comando **`/sqlban`**.
- Atajo global **Windows + J** para ocultar/mostrar la ventana sin salir del juego.

---

## Lógica de las sanciones

1. Se **suman** los minutos de Jail de todas las infracciones seleccionadas.
2. Se **suman** los días de Baneo de todas las infracciones seleccionadas.
3. **El baneo prevalece sobre el jail:**
   *Ejemplo:* 50 min de Jail + 1 día de Baneo → **1 día de Baneo** (el jail se descarta).
4. Un **baneo permanente** prevalece sobre cualquier otro baneo.
5. **CK Administrativo, Kick, Aviso, "Consultar con un superior" y las infracciones
   condicionales** (p. ej. "Depende la intensidad", "1er aviso / 2do ban",
   "3er aviso → 5 min") se muestran como **adicionales / notas** y **no se suman
   automáticamente**, porque dependen del criterio del staff.

```
Ejemplo:  DM - LEVE (reconocida) = 15 min  +  PG - LEVE (reconocida) = 10 min
          →  JAIL 25 minutos
```

---

## Cómo ejecutarlo

### Opción rápida (con Python instalado)
Doble clic en **`run.bat`** o ejecuta:

```
python main.py
```

### App portable de verdad (un solo .exe)
Doble clic en **`build.bat`**. Instalará PyInstaller y generará:

```
dist\HispanLifeSanciones.exe
```

Ese `.exe` es portable (no requiere Python en el equipo destino).

> **Ya está compilado**: lo tienes en `dist\HispanLifeSanciones.exe` (~11 MB).
> Copia ese único archivo a cualquier PC y ejecútalo: no hace falta Python ni
> instalar nada.
>
> Si Windows muestra un aviso de SmartScreen ("Windows protegió tu PC"), pulsa
> **Más información → Ejecutar de todas formas**. Aparece porque el `.exe` no
> está firmado digitalmente, no porque tenga algo malo.
>
> Para recompilarlo tras cambiar el código: doble clic en `build.bat`.
> Requisito para compilar: Python 3.8+ (Tkinter incluido en Windows).

---

## Uso

1. Busca la infracción.
2. Haz **clic** en **Sin reconocer** o **Reconocida** para añadirla: se suma al
   instante (no hay casillas). Para quitarla, **vuelve a clicar** en la opción activa.
3. Rellena:
   - **Nombre de Steam**
   - **ID del jugador**
   - **Pruebas** (enlace o nombre de archivo)
   - **Staff (ATT)** → se usa en el comando de baneo (`att:Staff`)
   - **Nota extra** (opcional, se añade al motivo)
4. Pulsa uno de los botones:
   - **📋 Aplicar sanción (plantilla)** → copia:

     ```
     Nombre de Steam: 
     Motivo:
     Duración: 
     Tipo de sanción: 
     Pruebas: 
     ```

   - **🔒 Aplicar Jail** → copia al portapapeles (el motivo incluye
     "reconocida" / "no reconocida"):

     ```
     /jail ID minutos motivo
     ```

   - **⛔ Aplicar Baneo** → copia al portapapeles (el motivo va **sin**
     "reconocida" / "no reconocida"):

     ```
     /sqlban ID días motivo att:Staff
     ```

     (en un baneo permanente los días son **-1**)

   - **🎮 Jail IG (T+Enter)** y **🎮 Baneo IG (T+Enter)** → además de copiarlo,
     traen la ventana de **FiveM** al primer plano (forzando el foco de Windows),
     abren el chat (**T**), escriben el comando y pulsan **Enter** automáticamente.
     Mientras se envía, la app suelta el *"siempre visible"* para que el juego
     pueda coger el foco, y lo recupera después.

   - **🧹 Limpiar todo** → borra selección y campos, pero **conserva el ATT**.

Aparecerá una notificación verde (éxito) o roja (error) indicando si se copió
correctamente o qué dato falta.

### Confirmaciones y registro en Discord

Al pulsar cualquier botón de sanción:

1. Se abre una **ventana de confirmación** con el resumen (motivo, tipo, duración,
   ID, Steam, ATT y el comando). Pulsa **Sí, aplicar** o **Cancelar**.
2. Si confirmas, aparece una **segunda confirmación**: *"¿Enviar este registro al
   canal de Discord?"* con la plantilla del registro.
3. Si vuelves a confirmar, la **plantilla se envía al canal de Discord**
   directamente. Si cancelas, solo se aplica la sanción (copiar / enviar al juego).

### Atajo durante la partida

- **Windows + J** (por defecto): oculta/muestra la ventana del sistema de sanciones.
- El atajo es **configurable**: botón **"⚙ Configuración"** (arriba a la derecha) →
  elige modificadores (Windows / Ctrl / Alt / Shift) y tecla (A-Z, 0-9, F1-F12).
  Se guarda en `config.json` junto al ejecutable.

### Registro en Discord

Al confirmar el envío, la app escribe el registro en el canal de Discord
usando el Discord que **ya tienes abierto** (nunca abre otro cliente, ni Canary):

1. Salta **exactamente a ese canal** con su enlace, lanzado con el propio
   ejecutable del Discord abierto (no usa el manejador del sistema).
2. Enfoca Discord y hace **clic en la caja de mensaje**.
3. Pega la plantilla (**Ctrl+V**) y pulsa **Enter**.

En **⚙ Configuración** indicas el **ID del servidor** y el **ID del canal**
(ya vienen rellenos). No hace falta webhook ni token.

Si Discord no está abierto, la app **no lo abre**: avisa y no envía nada.
- La ventana tiene la opción **"Siempre visible"** activada, para que quede por
  encima del juego (recomendado jugar en *ventana sin bordes / borderless*).

### Motivos

- En el **Jail** y en la **plantilla** el motivo indica si es *reconocida* o
  *no reconocida*.
- En el **Baneo** el motivo va limpio, sin ese sufijo.
- La infracción **"Hacker / Cheater"** se escribe simplemente como **Cheater**.

### Icono en la bandeja del sistema (junto al reloj)

Al abrir la app aparece un icono con el logo de HispanLife en la bandeja del
sistema, para saber en todo momento que sigue abierta en segundo plano:

- El **tooltip** indica el estado: *abierto* o *en segundo plano*.
- **Clic** en el icono: muestra/oculta la ventana.
- **Clic derecho**: menú con *Mostrar / Ocultar* y **Salir**.
- Al cerrar la ventana (X) también se quita el icono de la bandeja.

> En **Windows 11** los iconos nuevos se ocultan en el desplegable `^` de la
> barra de tareas. Para que se vea siempre, arrástralo a la barra o actívalo en
> *Configuración → Personalización → Barra de tareas → Otros iconos de la bandeja*.

---

## Archivos

| Archivo            | Descripción                                                        |
|--------------------|--------------------------------------------------------------------|
| `main.py`          | Interfaz gráfica, atajo global y copiado al portapapeles.          |
| `infractions.py`   | Las 64 infracciones y su interpretación (minutos / días / extras). |
| `sanciones.py`     | Lógica del sumatorio, precedencia y construcción de plantillas.    |
| `run.bat`          | Ejecuta la app con Python.                                         |
| `build.bat`        | Compila el `.exe` portable.                                        |
| `requirements.txt` | Notas de dependencias (ninguna en ejecución).                      |

Para **editar una sanción** solo hay que modificar los valores en
`infractions.py` (columna "sin reconocer" y "reconocida" de cada fila).
