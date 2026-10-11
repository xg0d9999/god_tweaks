# 🤖 g0d suite — Bot de Discord para Anuncios & DMs Directos

Este bot permite notificar a tu comunidad de Discord y **enviar mensajes privados (DMs)** a todos los usuarios registrados en tu base de datos **Supabase** cada vez que lances una nueva actualización con el comando `/actualizacion`.

---

## 🚀 Pasos Rápidos para Activar el Bot

### 1. Crear la Aplicación en Discord Developer Portal
1. Ve a [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. Haz clic en **New Application**, ponle de nombre `g0d suite` y guarda.
3. Copia el **Application ID** (Client ID).
4. Ve a la pestaña **Bot** en el menú izquierdo:
   * Haz clic en **Reset Token** para copiar el **Bot Token**.
   * Activa los intents en **Privileged Gateway Intents**:
     * ✔ **Message Content Intent**
     * ✔ **Server Members Intent** (recomendado)

### 2. Invitar el Bot a tu Servidor de Discord
1. En el Developer Portal, ve a **OAuth2** -> **URL Generator**.
2. Marca los scopes:
   * `bot`
   * `applications.commands`
3. Marca los permisos:
   * `Send Messages`
   * `Embed Links`
   * `Attach Files`
   * `Use Slash Commands`
4. Copia la URL generada al final, ábrela en tu navegador e invita al bot a tu servidor.

### 3. Configurar las Claves
Edita el archivo `discord-bot/.env`:
```env
DISCORD_BOT_TOKEN=tu_token_aqui
DISCORD_CLIENT_ID=tu_client_id_aqui
DISCORD_GUILD_ID=tu_servidor_id_opcional
ANNOUNCEMENT_CHANNEL_ID=id_canal_anuncios_opcional
```

### 4. Iniciar el Bot
Haz doble clic en:
`7_BOT_DISCORD_ANUNCIOS.bat` en la carpeta raíz.

Automáticamente instalará las dependencias si no las tienes, registrará el comando `/actualizacion` en Discord y pondrá el bot en línea.

---

## ⚡ Uso del Comando `/actualizacion`

En cualquier canal de tu servidor de Discord escribe:

```
/actualizacion
  titulo: g0d suite v1.0.3 - Parche de Rendimiento eSports
  version: 1.0.3
  novedades:
  - Reducción de latencia DPC al 0.05ms
  - Soporte de resolución 1200x800
  - Login integrado con Discord y registro en Supabase
  canal: #anuncios (opcional)
  enviar_dm: True
```

El bot:
1. Publicará un mensaje enriquecido (Embed Neon) en `#anuncios`.
2. Consultará la tabla `app_users` en Supabase.
3. Enviará un mensaje privado por Discord a **cada usuario que haya iniciado sesión en la app**.
4. Guardará el registro en la tabla `app_updates`.
