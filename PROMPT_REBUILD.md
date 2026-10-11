# PROMPT DE RECREACIÓN — "HispanLife RP · Sistema de Sanciones"

> Pega este documento completo como especificación para reconstruir la
> aplicación en otro framework (Electron, Tauri, .NET WPF, Qt, etc.).
> El objetivo es una **app de escritorio portable para Windows** que un staff de
> FiveM usa **en paralelo al juego** para calcular y aplicar sanciones.

---

## 1. Objetivo

Crear una aplicación de escritorio (no web) para Windows que:

1. Permita **seleccionar infracciones** del reglamento de HispanLife RP,
   eligiendo para cada una si el jugador **reconoció** o **no reconoció** la falta.
2. Calcule **automáticamente la sanción total** (jail y/o baneo) según reglas de
   precedencia.
3. Copie al portapapeles / envíe al juego **comandos ya formateados**.
4. Genere una **plantilla de registro** y la **escriba directamente en un canal de
   Discord** (simulando teclado), tras doble confirmación.
5. Se pueda **ocultar/mostrar con un atajo global** configurable (por defecto
   `Windows + J`) mientras se juega, con icono en la **bandeja del sistema**.
6. Sea **portable**: un único ejecutable, sin instalación.

Requisitos de plataforma: APIs de Windows para atajo global, bandeja, envío de
teclado/ratón (SendInput), enumeración de ventanas y foco forzado.

---

## 2. Modelo de datos — Infracciones

64 infracciones. Cada una tiene dos penalizaciones: **Sin reconocer** (la alta) y
**Reconocida** (la baja; reconocer reduce). La tabla es literal:

| Nº | Nombre | Sin reconocer | Reconocida |
|----|--------|---------------|------------|
| 1 | Abusa de bindeos | 15 Minutos de Jail | 5 Minutos de Jail |
| 2 | Abusar de GP | 30 Minutos de Jail | 15 Minutos de Jail |
| 3 | Abusar de un vacío legal de la normativa intencionalmente | Consultar con un superior. | Consultar con un superior. |
| 4 | Abuso de th | 60 minutos de jail | 30 minutos de jail |
| 5 | Acumulación de sanciones (20) | Consultar con un superior. | Consultar con un superior. |
| 6 | Aprovecharse de menú de facción | 1 Dias de baneo | 90 Minutos de Jail |
| 7 | BJ / BD | 15 Minutos de Jail | 10 Minutos de Jail |
| 8 | Bug Abuse | 3 Dias de baneo | 1 Dia de baneo (- depende del bug) |
| 9 | Corrupción | Consultar con un superior. | Consultar con un superior. |
| 10 | Cortar rol - GRAVE | 1 Dias de baneo | 45 Minutos de Jail |
| 11 | Cortar rol - LEVE | 30 Minutos de Jail | 15 Minutos de Jail |
| 12 | Desconectarse estando muerto | 1 Dia de baneo | 30 Minutos de Jail |
| 13 | DM - GRAVE | Baneo permanente | 45 Minutos de Jail |
| 14 | DM - LEVE | 35 Minutos de Jail | 15 Minutos de Jail |
| 15 | Duplicar ITEMS / ARMAS | CK Admistrativo | CK Admistrativo |
| 16 | Evadir CK | 2 Dias de baneo | 1 Dia de baneo |
| 17 | Evadir PKT | 1 Dias de baneo | 60 Minutos de Jail |
| 18 | Evadir rol | 45 Minutos de Jail | 25 Minutos de Jail |
| 19 | Evadir un reporte / sanción | Baneo permanente | 1 Dias de baneo |
| 20 | Falso rol | 40 Minutos de Jail | 20 Minutos de Jail |
| 21 | Faltar a la normativa delictiva | 50 Minutos de Jail | 30 Minutos de Jail |
| 22 | Faltar a la normativa general | 50 Minutos de Jail | 30 Minutos de Jail |
| 23 | Faltar a la normativa policial | 50 Minutos de Jail | 30 Minutos de Jail |
| 24 | Flood | Depende la intensidad | 1 Kick 2 Ban 1 dia |
| 25 | Forzar rol - GRAVE | 80 Minutos de Jail | 40 Minutos de Jail |
| 26 | Forzar rol - LEVE | 40 Minutos de Jail | 20 Minutos de Jail |
| 27 | Hablar estando muerto | 120 Minutos de Jail | 60 Minutos de Jail |
| 28 | Hacer el infantil en soporte - reporte | Baneo permanente | Baneo Permanente |
| 29 | Hacerte pasar que eres de una facción | Baneo permanente | 3 Dias de baneo |
| 30 | Hacker / Cheater | Baneo permanente | Baneo Permanente |
| 31 | Incitar a incumplir las normativas / adm abuse | 7 Dias de baneo | 4 Dias de baneo |
| 32 | Iniciar un rol agresivo en una Zona segura | 40 Minutos de Jail | 20 Minutos de Jail |
| 33 | Insultos / Toxicidad OOC - GRAVE | Baneo permanente | 7 Dias de baneo |
| 34 | Insultos / Toxicidad OOC - LEVE | 2 Dias de baneo | 1 Dia de baneo |
| 35 | Invadir rol | 30 Minutos de Jail | 15 Minutos de Jail |
| 36 | Llevar casco antibalas | Kick | (AVISO) |
| 37 | Llevar máscara en zona segura | 1 (AVISO /msg) al 3 aviso 5 Mins Jail | (AVISO) |
| 38 | Mal uso - nulo uso de /entorno | 35 Minutos de Jail | 10 Minutos de Jail |
| 39 | Mal uso - nulo uso de /me y /do | 35 Minutos de Jail | 10 Minutos de Jail |
| 40 | Mal uso del /ayuda o /twt o /anon | 25 Minutos de Jail | Avisar por MSG / KICK |
| 41 | Matar en jail | 1 Dias de baneo | 10 Minutos de Jail |
| 42 | Mentir en reporte - soporte | 7 Dias de baneo | 3 dias de baneo |
| 43 | MG - GRAVE | 5 Dias de baneo | 1 Dias de baneo (depende como sea -) |
| 44 | MG - LEVE | 30 Minutos de Jail | 15 Minutos de Jail |
| 45 | No respetar RDE - GRAVE | 1 Dias de baneo (depende como sea jail) | 25 Minutos de Jail |
| 46 | No respetar RDE - LEVE | 35 Minutos de Jail | 15 Minutos de Jail |
| 47 | No rolear choque | 15 Minutos de Jail | 10 Minutos de Jail |
| 48 | No valorar vida | 45 Minutos de Jail | 25 Minutos de Jail |
| 49 | Obligar a persona a sacar dinero del banco | 60 Minutos de Jail | 30 Minutos de Jail |
| 50 | PG - GRAVE | 5 Dias de baneo | 1 Dias de baneo |
| 51 | PG - LEVE | 25 Minutos de Jail | 10 Minutos de Jail |
| 52 | Robar un vehículo de donador | 30 Minutos de Jail | 15 Minutos de Jail |
| 53 | Robar un vehículo de una facción sin justificación | 60 Minutos de Jail | 30 Minutos de Jail |
| 54 | Roles sexuales no consentidos | Baneo permanente | Baneo permanente |
| 55 | Romper la economía | Baneo permanente + CK Admistrativo | CK Admistrativo |
| 56 | Spam /entornos, /auxilio | Kick | (AVISO) |
| 57 | Spam de cosas externas al servidor | Baneo permanente | Baneo permanente |
| 58 | Tirar de e / f8 en mitad de rol | 1 Dia de baneo [Apelable a Jail] | 1 Dia de baneo [Apelable a Jail] |
| 59 | Utilizar armas prohibidas | 1 Dia de baneo + Revision de armario. | 60 Minutos de Jail + Revision de armario. |
| 60 | Utilizar dinero de proveniencia de Hacker | Baneo permanente + CK Adm | CK Adm |
| 61 | Utilizar trazers, kill efect o confeti | 1ro, Aviso 2do, Ban de 1 dia | (AVISO) |
| 62 | VDM - GRAVE | 5 Dias de baneo | 60 Minutos de Jail |
| 63 | VDM - LEVE | 30 Minutos de Jail | 15 Minutos de Jail |
| 64 | Violar EULA del servidor | Baneo permanente | Baneo permanente |

### 2.1. Interpretación de cada texto de sanción

Convertir cada cadena en una estructura:

```
jail: int          # minutos de jail (0 si no hay)
ban_days: int      # días de baneo (0 si no hay)
perma: bool        # baneo permanente
ck: bool           # CK Administrativo
kick: bool
aviso: bool
consultar: bool    # "Consultar con un superior"
revision: bool     # "Revisión de armario"
special: string?   # condición no sumable (texto)
note: string?      # nota informativa
```

Reglas de parsing (case-insensitive sobre el texto):

- Si contiene `"consultar"` → `consultar = true` y se termina el análisis.
- Si contiene `"permanente"` → `perma = true`.
- Regex días: `(\d+)\s*d[ií]as?\s*de\s*baneo` → `ban_days`.
- Regex minutos: `(\d+)\s*(?:mins?\b|minutos?\b)` → `jail`.
- Si contiene `"ck adm"` → `ck = true`.
- Si contiene `"kick"` → `kick = true`.
- Si contiene `"aviso"` o `"avisar"` → `aviso = true`.
- Si contiene `"revisi"` → `revision = true`.

**Overrides exactos** (comparando el texto completo en minúsculas) para los casos
condicionales, que además fijan `special`:

| Texto (minúsculas) | Resultado |
|---|---|
| `depende la intensidad` | `special = "Depende de la intensidad"` |
| `1 kick 2 ban 1 dia` | `kick = true`, `special = "1er aviso: Kick / 2º: Ban 1 día"` |
| `1 (aviso /msg) al 3 aviso 5 mins jail` | `aviso = true`, `jail = 0`, `special = "1er y 2º aviso /msg; al 3º aviso → 5 min Jail"` |
| `avisar por msg / kick` | `aviso = true`, `kick = true`, `special = "Avisar por MSG / Kick"` |
| `1ro, aviso 2do, ban de 1 dia` | `aviso = true`, `special = "1er aviso / 2º: Ban 1 día"` |

**Notas** (no afectan al cálculo, solo se muestran):

| Texto (minúsculas) | Nota |
|---|---|
| `1 dia de baneo (- depende del bug)` | `Depende del bug` |
| `1 dias de baneo (depende como sea -)` | `Depende de la gravedad` |
| `1 dias de baneo (depende como sea jail)` | `Depende: puede ser Jail` |
| `1 dia de baneo [apelable a jail]` | `Apelable a Jail` |

---

## 3. Reglas de negocio (cálculo del resultado)

Dada una lista de selecciones `{infracción, reconocida: bool}`:

1. **Sumar** los `jail` de todas las seleccionadas → `jail_total`.
2. **Sumar** los `ban_days` de todas → `ban_total`.
3. `perma` = OR de todos. `ck`, `kick`, `aviso`, `consultar`, `revision` = OR.
4. Acumular `specials` y `notes` con el formato `"{nombre infracción}: {texto}"`.

**Precedencia para el resultado principal:**

1. Si `perma` → tipo `"Baneo"`, duración `"Permanente"`, `dias_ban = -1`.
2. Si no, si `ban_total > 0` → tipo `"Baneo"`, duración `"{n} día(s)"`, `dias_ban = ban_total`.
3. Si no, si `jail_total > 0` → tipo `"Jail"`, duración `"{n} minuto(s)"`, `dias_ban = null`.
4. Si no, si `ck` → tipo `"CK Administrativo"`, duración `"CK Administrativo"`.
5. Si no, si `kick` → tipo `"Kick"`.
6. Si no, si `aviso` → tipo `"Aviso"`.
7. Si no, si `consultar` → tipo `"Consultar con un superior"`.
8. Si no → tipo `"Especial"` si hay `specials`, si no `"-"`.

**Adicionales** (acompañan al tipo principal, se concatenan con `" + "`):

- `"CK Administrativo"` si `ck` y el tipo no es ya CK.
- `"Revisión de armario"` si `revision`.
- `"Kick"` si `kick` y el tipo no es Kick.
- `"Aviso"` si `aviso` y el tipo no es Aviso.
- `"Consultar con un superior"` si `consultar` y el tipo no es Consultar.

`tipo_full` = tipo + `" + "` + adicionales (o solo adicionales si tipo es `"-"`).

**Aviso de jail descartado:** si hay baneo (`perma` o `ban_total > 0`) **y**
`jail_total > 0`, añadir una nota: `"Jail de {n} minutos descartado (prevalece el
baneo)"`.

**Resumen del resultado (para UI):**
`jail_minutes`, `ban_days`, `perma`, `dias_ban` (-1 perma / null sin ban),
`tipo`, `tipo_full`, `duracion`, `adicionales[]`, `specials[]`, `notes[]`,
`notas_extra[]`.

### 3.1. Etiqueta corta (chip) y color

Etiqueta corta según la sanción interpretada (orden de prioridad):
`Consultar` → `PERMA`/`PERMA+CK` → `{n}d ban` → `{n} min` → `CK` → `Especial` →
`Kick` → `Aviso` → `-`. Si `revision`, añadir `" +R"`.

Categoría (para color):
`consultar`, `perma`, `ban`, `jail`, `ck`, `special`, `kick`, `aviso`, `none`.
Colores sugeridos: ban/perma = rojo, jail = naranja (acento), ck = morado,
kick/aviso = azul, consultar/special = amarillo, none = gris.

---

## 4. Textos que se generan

### 4.1. Motivo

- Se listan las infracciones seleccionadas separadas por `" + "`.
- Si `include_tag = true` → `"Nombre (reconocida)"` o `"Nombre (no reconocida)"`.
  **Jail y plantilla usan `include_tag = true`.**
- Si `include_tag = false` → solo `"Nombre"`. **El Baneo usa `include_tag = false`.
- **Override de nombre:** la infracción `"Hacker / Cheater"` se escribe como
  `"Cheater"` en el motivo.
- Si hay **nota extra** (campo de texto opcional): se añade al final como
  `"{motivo} | {nota}"`.

### 4.2. Plantilla de registro

```
Nombre de Steam: {steam}
Motivo: {motivo}
Duración: {duracion}
Tipo de sanción: {tipo_full}
Pruebas: {pruebas}
```

### 4.3. Comandos (sin comillas)

- Jail: `/jail {ID} {jail_minutes} {motivo}`
- Baneo: `/sqlban {ID} {dias_ban} {motivo} att:{staff}`  (`-1` = permanente)

El motivo del jail lleva etiqueta (reconocida/no reconocida); el del ban no.

---

## 5. Interfaz de usuario

### 5.1. Estructura general

Dos columnas + cabecera + barra de estado inferior.

**Cabecera**
- Logo de marca (imagen) + subtítulo `"Sistema de Sanciones"`.
- Texto informativo: *"El baneo prevalece sobre el jail · un baneo permanente
  prevalece sobre todo"*.
- Chip que muestra el **atajo actual** + `"Ocultar / Mostrar"`.
- Botón **`⚙ Configuración`**.

**Panel izquierdo — Infracciones**
- Título `"Infracciones"` y chip con `"N seleccionadas"`.
- Buscador (filtro por nombre o número, en vivo).
- Texto de ayuda: *"Clic en «Sin reconocer» o «Reconocida» para añadir. Vuelve a
  clicar en la opción activa para quitarla."*
- Lista con scroll de 64 filas. Cada fila:
  - Número (2 dígitos).
  - Nombre de la infracción.
  - **Selector segmentado de 2 opciones**: `Sin reconocer` (color naranja al
    activarse) y `Reconocida` (color verde al activarse). Cuando ninguna está
    activa, el control aparece con un contorno tenue.
  - **Chip de valor** con la etiqueta corta de la opción activa, coloreado.
  - **Interacción:** clic en `Sin reconocer` → selecciona en modo sin reconocer;
    clic en `Reconocida` → selecciona en modo reconocida; clic en la opción **ya
    activa** → deselecciona la fila; clic en la **otra** opción → cambia el modo
    sin deseleccionar. **No hay checkboxes.**
  - La fila seleccionada se resalta (fondo distinto + borde de acento) y el chip
    pasa a ser una insignia oscura.
  - Efecto *hover* en las filas.

**Panel derecho**
- Tarjeta **"Datos de la sanción"**:
  - `Nombre de Steam` (ancho completo)
  - `ID del jugador` (media) | `Staff (ATT)` (media)
  - `Pruebas (enlace / archivo)` (ancho completo)
  - `Nota extra para el motivo (opcional)` (ancho completo)
- Tarjeta **"RESULTADO"**:
  - Tipo (`tipo_full`) en grande, **coloreado según el tipo** (rojo ban, naranja
    jail, morado CK, azul kick/aviso, amarillo consultar/especial, gris sin
    selección).
  - Duración.
  - Dos insignias: `Jail {n} min` y `Baneo {n} día(s)` / `Baneo PERMANENTE` / `Baneo —`.
  - Lista de notas/advertencias (specials, notes, jail descartado).
  - Estado vacío: `"Sin selección"`.
- Botones (todos copian/actúan):
  1. `📋 Aplicar sanción (plantilla)`
  2. `🔒 Aplicar Jail` | `⛔ Aplicar Baneo`
  3. `🎮 Jail IG (T+Enter)` | `🎮 Baneo IG (T+Enter)`
  4. `🧹 Limpiar todo (conserva el ATT)`
- Tarjeta **Opciones**:
  - Checkbox `"Ventana siempre visible (sobre el juego)"` (por defecto **activado**).
  - Botón `"🗕 Ocultar / Mostrar ventana"`.

**Barra de estado inferior**: punto de color + mensaje (verde éxito, rojo error,
gris info).

### 5.2. Notificaciones (toasts)

Aviso flotante arriba-centro de la ventana: verde con `✔` si éxito, rojo con `✖`
si error, con el mensaje; se cierra solo a los ~2,6 s. Además se actualiza la
barra de estado.

### 5.3. Diálogos

- **Confirmación**: modal oscuro con título, cuerpo (resumen) y botones
  `Sí, ...` y `Cancelar`.

- **Configuración**: modal con dos secciones:
  - *Atajo*: checkboxes de modificadores (`Windows`, `Ctrl`, `Alt`, `Shift`) +
    selector de tecla (`A–Z`, `0–9`, `F1–F12`) + vista previa del atajo
    (`"Windows + J"`). Botón `Guardar`.
  - *Canal de Discord*: campos `ID del servidor` e `ID del canal`.

---

## 6. Flujo de las acciones (doble confirmación)

Todas las acciones de sanción tienen **dos confirmaciones**:

1. **1ª confirmación** — *"Confirmar sanción"*: muestra el resumen
   (motivo, tipo, duración, ID, Steam, ATT, pruebas) y, si aplica, el comando.
   Botón `Sí, aplicar` / `Cancelar`.
2. Si confirma → **2ª confirmación** — *"Enviar registro a Discord"*:
   *"¿Escribir este registro en el canal de Discord?"* con la plantilla.
   Botón `Sí, enviar` / `Cancelar`.
3. Después se ejecuta la acción (copiar comando / enviar al juego) y, si se
   aceptó, se **escribe el registro en Discord**.

Detalle por botón:

| Botón | Validación | Acción | Motivo |
|---|---|---|---|
| Aplicar sanción (plantilla) | ≥1 infracción y Nombre de Steam | Copia la plantilla al portapapeles | con etiqueta |
| Aplicar Jail | ≥1 infracción, ID, y `jail_minutes > 0` | Copia `/jail ...` | con etiqueta |
| Aplicar Baneo | ≥1 infracción, ID, Staff, y hay baneo | Copia `/sqlban ...` | **sin** etiqueta |
| Jail IG | igual que Jail | Envía `/jail ...` al juego | con etiqueta |
| Baneo IG | igual que Baneo | Envía `/sqlban ...` al juego | **sin** etiqueta |
| Limpiar todo | — | Borra selección, Steam, ID, Pruebas y Nota. **Conserva el ATT** | — |

Errores: si falta algo, toast rojo indicando qué falta; no se ejecuta la acción.

---

## 7. Envío del registro a Discord (simulado por teclado)

Objetivo: escribir la plantilla en un canal concreto de Discord **como si el
staff la pegara a mano**. Debe:

1. **Usar solo el Discord que ya está abierto** (nunca abrir uno nuevo ni Canary).
   Localizar la ventana por proceso, **prefiriendo `Discord.exe` (estable)**;
   `DiscordCanary.exe` solo como último recurso.
2. **Saltar exactamente al canal** con el enlace
   `discord://discord.com/channels/{guild_id}/{channel_id}`, pero **lanzándolo con
   el propio ejecutable del Discord abierto**:
   `"{ruta de Discord.exe}" --url "discord://discord.com/channels/{g}/{c}"`.
   Así no interviene el manejador de protocolo del sistema (que abriría Canary) y
   no se abre otra ventana.
3. **Forzar el primer plano** de la ventana de Discord (AttachThreadInput, con
   reintentos).
4. **Hacer clic en la caja de mensaje** (abajo, centrada: `x = centro de la
   ventana`, `y = borde inferior − 60 px`) para asegurar el foco.
5. **Pegar** la plantilla (`Ctrl+V`, previamente puesta en el portapapeles) y
   pulsar **Enter**.

Si Discord no está abierto → no se abre nada y se avisa. El atajo NO debe usar
`Ctrl+K` (es unreliable y provoca navegaciones/entradas no deseadas).

---

## 8. Envío del comando al juego (FiveM, simulado por teclado)

1. **Localizar la ventana de FiveM**: enumerar ventanas visibles y quedarse con la
   del proceso cuyo nombre contenga `fivem` (priorizar `gta`), la de mayor área.
   Clase de ventana típica: `grcWindow`.
2. **Forzar el primer plano** con AttachThreadInput + ALT unlock. Reintentar hasta
   confirmar que es la ventana activa.
3. **Abrir el chat**: pulsar **T**.
4. **Escribir el comando** (texto Unicode, soportando acentos y emojis vía
   unidades UTF-16).
5. Pulsar **Enter**.
6. Las teclas deben enviarse **con scan code** (`MapVirtualKey`, manteniendo la
   tecla ~50 ms), porque los juegos usan entrada directa.
7. Mientras se envía: **quitar temporalmente el "siempre visible"** de la app y
   **restaurarlo** al terminar, para que el juego pueda coger el foco.

Si hay **registro a Discord + comando al juego** en la misma acción (Jail IG /
Baneo IG), hacerlo **en secuencia**: primero Discord, luego el juego.

---

## 9. Atajo global configurable

- Por defecto `Windows + J`: **oculta/muestra** la ventana.
- Registro global de Windows (`RegisterHotKey`) con `MOD_NOREPEAT`.
- Configurable desde Ajustes: combinación de modificadores
  (`Win`/`Ctrl`/`Alt`/`Shift`) + tecla (`A–Z`, `0–9`, `F1–F12`).
- Al aplicar: detener el atajo anterior, **validar** que Windows lo permite
  (registro temporal) y, si está ocupado, avisar y **mantener el anterior**.
- Persistir en `config.json` (junto al ejecutable). Etiqueta visible en la
  cabecera (ej. `"Windows + J · Ocultar / Mostrar"`).

---

## 10. Bandeja del sistema (junto al reloj)

- Icono con el logo de la app.
- **Tooltip**: `"HispanLife · Sanciones — abierto"` o `"— en segundo plano"`
  según si la ventana está visible.
- Menú (clic derecho): `Mostrar / Ocultar (Windows + J)` y `Salir`.
- **Clic izquierdo**: muestra/oculta la ventana.
- Al cerrar la app se elimina el icono.

---

## 11. Ventana y tema

- Tema **oscuro moderno** (fondo `#0e1016`, paneles `#161a22`, tarjetas
  `#1d222c`, texto `#e9edf3`, acento naranja `#ff7a18`, verde `#2fbf71`, rojo
  `#e5484d`, azul `#3b82f6`, morado `#a855f7`, amarillo `#eab308`).
- Opción **"Siempre visible" (topmost)** por defecto activada.
- **Sin destello blanco** al mostrar: poner el fondo de clase de la ventana en
  oscuro y mostrar la ventana en alfa 0, dejar que se pinte, y subir a alfa 1.
- **DPI-aware** (texto nítido en pantallas escaladas).
- Al arrancar, crear la ventana oculta y mostrarla ya pintada.
- Icono de la ventana y del ejecutable con el logo de HispanLife.
- El logo aparece también en la cabecera.

---

## 12. Configuración persistente

Archivo `config.json` **en la carpeta del ejecutable** (portable). Estructura:

```json
{
  "hotkey": { "mods": ["win"], "key": "J" },
  "discord_channel_name": "registro-sanciones",
  "discord_guild": "667478197927018530",
  "discord_channel": "668062839990386701"
}
```

Al leer, **fusionar con valores por defecto** para tolerar archivos parciales.
Guardar sin destruir otras claves.

---

## 13. Portapapeles

Copiar texto al portapapeles de Windows de forma que **persista aunque la app se
cierre** (usar la API nativa `OpenClipboard`/`SetClipboardData`), con respaldo al
portapapeles del framework.

---

## 14. Empaquetado

- Ejecutable **portable de un solo archivo**, sin consola (windowed), sin
  instalación ni dependencias.
- Incluir el **icono** del ejecutable y los **assets** (logo) dentro.
- Script de compilación que instale dependencias y genere el `.exe`.

---

## 15. Detalles y casos límite a respetar

- Los textos "spellings" originales de la tabla se conservan (p. ej.
  `"CK Admistrativo"` con la errata) — no normalizar los datos fuente.
- Los valores condicionales ("depende…", "1er aviso…", "3º aviso…") **no se
  suman**: se muestran como `specials` para decisión manual del staff.
- El baneo **siempre** prevalece sobre el jail; el permanente sobre cualquier
  baneo.
- El motivo del **baneo** nunca lleva `(reconocida)`/`(no reconocida)`.
- `"Hacker / Cheater"` → `"Cheater"` solo en el motivo.
- "Limpiar todo" **nunca** borra el campo `Staff (ATT)`.
- Los comandos se generan **sin comillas**.
- Cuando se envía algo al juego/Discord, la app cede el foco y luego recupera su
  estado "siempre visible".

---

## 16. Entregable esperado

App de escritorio portable para Windows, en el framework elegido, con:

- Lista interactiva de las 64 infracciones con doble estado y sumatorio en vivo.
- Cálculo exacto según §3.
- Generación de motivo, plantilla y comandos según §4.
- Doble confirmación (§6).
- Envío simulado a Discord (§7) y a FiveM (§8).
- Atajo global configurable (§9), bandeja (§10), ajustes (§12), tema oscuro (§11).
- Ejecutable portable (§14).
