const RAW_TOKEN_FALLBACK =
  'TVRVME16TXlPVFE1T1RrNE5UTTBOalkxTWcuR05yXy1kLmVaNFlJNHlCempicGVFQzBQUktXTS1oOU1Cb3IxVlBld3k2MjhF';
const RAW_WEBHOOK_FALLBACK =
  'aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTU1ODc5NTI1MzI2MjA2NTc1Ni9oVlpFQWtEa0ktcUNUY3pNZUszT3V3SUxVS3dsQVJ2MzUxNGNxa04zQmRXdF91TUFHZ2FwQ3NNYzhPTUhZSWs4WXRlcA==';

export const DISCORD_BOT_TOKEN =
  (import.meta.env?.VITE_DISCORD_BOT_TOKEN as string) ||
  (typeof atob === 'function' ? atob(RAW_TOKEN_FALLBACK) : '');
export const DISCORD_GUILD_ID =
  (import.meta.env?.VITE_DISCORD_GUILD_ID as string) || '1543324125685358713';
export const DISCORD_LOGS_CHANNEL_ID =
  (import.meta.env?.VITE_DISCORD_LOGS_CHANNEL_ID as string) || '1543324127283253270';
export const DISCORD_ERRORS_CHANNEL_ID =
  (import.meta.env?.VITE_DISCORD_ERRORS_CHANNEL_ID as string) || '1543333635799781508';
export const DISCORD_WEBHOOK_URL =
  (import.meta.env?.VITE_DISCORD_WEBHOOK_URL as string) ||
  (typeof atob === 'function' ? atob(RAW_WEBHOOK_FALLBACK) : '');

let currentGlobalSession: {
  user?: { id: string; username: string; avatar_url?: string } | null;
  hardware?: { hwid?: string; os?: string; cpu?: string; gpu?: string; ram_mb?: number } | null;
  ip?: string | null;
} = {};

export function setGlobalLoggerSession(session: {
  user?: { id: string; username: string; avatar_url?: string } | null;
  hardware?: { hwid?: string; os?: string; cpu?: string; gpu?: string; ram_mb?: number } | null;
  ip?: string | null;
}) {
  currentGlobalSession = { ...currentGlobalSession, ...session };
}

export function getGlobalLoggerSession() {
  return currentGlobalSession;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  thumbnail?: { url: string };
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
}

const EMBED_COLOR_WHITE = 0xffffff;

/**
 * Envía un mensaje embebido al Webhook oficial de Discord
 */
export async function sendDiscordWebhook(embed: DiscordEmbed): Promise<boolean> {
  const url = DISCORD_WEBHOOK_URL;
  if (!url) return false;

  try {
    const payload = {
      username: 'g0d suite',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [
        {
          ...embed,
          color: embed.color ?? EMBED_COLOR_WHITE,
          footer: embed.footer || { text: 'g0d suite' },
          timestamp: embed.timestamp || new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.ok || res.status === 204;
  } catch (err) {
    console.warn('[DiscordWebhook] Error enviando webhook:', err);
    return false;
  }
}

/**
 * Envía un mensaje embebido a Discord (vía Webhook oficial y canal de auditoría)
 */
export async function sendDiscordLog(embed: DiscordEmbed): Promise<boolean> {
  // 1. Intento prioritario por Webhook directo
  const webhookSuccess = await sendDiscordWebhook(embed);
  if (webhookSuccess) return true;

  // 2. Respaldo por REST API con Bot token si el webhook no respondiera
  try {
    const payload = {
      embeds: [
        {
          ...embed,
          color: embed.color ?? EMBED_COLOR_WHITE,
          footer: embed.footer || { text: 'g0d suite' },
          timestamp: embed.timestamp || new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(
      `https://discord.com/api/v10/channels/${DISCORD_LOGS_CHANNEL_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    return res.ok;
  } catch (err) {
    console.warn('[DiscordLogger] Error enviando registro a Discord:', err);
    return false;
  }
}

/**
 * Log de Inicio de Sesión y Telemetría de Hardware
 */
export async function logUserLogin(data: {
  user: { id: string; username: string; avatar_url: string };
  hardware: { hwid: string; cpu: string; cpu_cores: number; ram_mb: number; gpu: string; os: string } | null;
  ip: string | null;
}) {
  const { user, hardware, ip } = data;

  const fields: DiscordEmbedField[] = [
    { name: 'Usuario', value: `**${user.username}** (<@${user.id}>)`, inline: true },
    { name: 'IP', value: `\`${ip || 'N/A'}\``, inline: true },
    { name: 'RAM', value: hardware ? `${(hardware.ram_mb / 1024).toFixed(1)} GB` : 'N/A', inline: true },
    { name: 'HWID', value: `\`${hardware?.hwid || 'N/A'}\``, inline: false },
    {
      name: 'CPU',
      value: hardware ? `${hardware.cpu} (${hardware.cpu_cores} núcleos)` : 'N/A',
      inline: true,
    },
    { name: 'GPU', value: hardware?.gpu || 'N/A', inline: true },
    { name: 'SO', value: hardware?.os || 'Windows', inline: true },
  ];

  return sendDiscordLog({
    title: 'Conexión de Usuario',
    color: EMBED_COLOR_WHITE,
    fields,
    thumbnail: { url: user.avatar_url },
    footer: { text: 'g0d suite' },
  });
}

/**
 * Log de Optimización de Sistema Ejecutada
 */
export async function logOptimizationApplied(data: {
  username?: string;
  userId?: string;
  planTitle: string;
  appliedCount: number;
}) {
  const fields: DiscordEmbedField[] = [
    { name: 'Usuario', value: data.username || 'Usuario Local', inline: true },
    { name: 'Plan', value: `**${data.planTitle}**`, inline: true },
    { name: 'Módulos', value: `${data.appliedCount}`, inline: true },
  ];

  return sendDiscordLog({
    title: 'Optimización Aplicada',
    color: EMBED_COLOR_WHITE,
    fields,
    footer: { text: 'g0d suite' },
  });
}

/**
 * Log de Sanción / Moderación HispanLife
 */
export async function logHispanSanction(data: {
  staffAtt: string;
  targetId: string;
  reason: string;
  hours: number;
}) {
  return sendDiscordLog({
    title: 'Sanción HispanLife',
    color: EMBED_COLOR_WHITE,
    fields: [
      { name: 'Staff', value: `**${data.staffAtt}**`, inline: true },
      { name: 'ID', value: `\`${data.targetId}\``, inline: true },
      { name: 'Duración', value: `${data.hours}h`, inline: true },
      { name: 'Motivo', value: data.reason, inline: false },
    ],
    footer: { text: 'g0d suite' },
  });
}

let lastErrorTimestamp = 0;
let lastErrorMessage = '';

/**
 * Envía un reporte estructurado de error a Discord cuando la app da problemas.
 * Destinado al Webhook oficial y al canal 1543333635799781508.
 */
export async function logAppError(data: {
  error: Error | string | unknown;
  context?: string;
  user?: { id: string; username: string; avatar_url?: string } | null;
  hardware?: { hwid?: string; os?: string; cpu?: string; gpu?: string; ram_mb?: number } | null;
  ip?: string | null;
}): Promise<boolean> {
  const user = data.user || currentGlobalSession.user;
  const hardware = data.hardware || currentGlobalSession.hardware;
  const ip = data.ip || currentGlobalSession.ip;

  const errObj = data.error instanceof Error ? data.error : new Error(String(data.error));
  const errMessage = errObj.message || String(data.error);
  const errStack = errObj.stack || '';

  // Throttling / Deduplicación (máximo 1 reporte cada 5s para el mismo mensaje)
  const now = Date.now();
  if (errMessage === lastErrorMessage && now - lastErrorTimestamp < 5000) {
    return false;
  }
  lastErrorTimestamp = now;
  lastErrorMessage = errMessage;

  const fields: DiscordEmbedField[] = [
    {
      name: 'Usuario',
      value: user ? `**${user.username}** (<@${user.id}>)` : '`Anónimo`',
      inline: true,
    },
    {
      name: 'Contexto',
      value: `\`${data.context || 'General'}\``,
      inline: true,
    },
    {
      name: 'IP',
      value: `\`${ip || 'N/A'}\``,
      inline: true,
    },
    {
      name: 'HWID',
      value: `\`${hardware?.hwid || 'N/A'}\``,
      inline: true,
    },
    {
      name: 'Error',
      value: `\`\`\`${errMessage.slice(0, 500)}\`\`\``,
      inline: false,
    },
  ];

  if (errStack && errStack !== errMessage) {
    fields.push({
      name: 'Pila de Error',
      value: `\`\`\`${errStack.slice(0, 600)}\`\`\``,
      inline: false,
    });
  }

  const embed: DiscordEmbed = {
    title: 'Error en Aplicación',
    color: EMBED_COLOR_WHITE,
    fields,
    thumbnail: user?.avatar_url ? { url: user.avatar_url } : undefined,
    footer: { text: 'g0d suite' },
    timestamp: new Date().toISOString(),
  };

  // 1. Envío prioritario al Webhook
  const webhookResult = await sendDiscordWebhook(embed);

  // 2. Envío al canal de errores vía Bot token como respaldo directo
  try {
    if (DISCORD_BOT_TOKEN) {
      await fetch(
        `https://discord.com/api/v10/channels/${DISCORD_ERRORS_CHANNEL_ID}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ embeds: [embed] }),
        }
      );
    }
  } catch (err) {
    console.warn('[DiscordLogger] Fallo al enviar al canal de errores mediante Bot:', err);
  }

  return webhookResult;
}

// Escuchas globales automáticas en entorno navegador / Tauri WebView
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Ignorar errores triviales de resize observer o extensiones externas
    if (event.message?.includes('ResizeObserver') || event.filename?.includes('chrome-extension')) {
      return;
    }
    logAppError({
      error: event.error || event.message,
      context: `window.onerror: ${event.filename || 'app'}:${event.lineno || 0}`,
    }).catch(() => {});
  });

  window.addEventListener('unhandledrejection', (event) => {
    logAppError({
      error: event.reason,
      context: 'window.unhandledrejection (Promesa rechazada no controlada)',
    }).catch(() => {});
  });
}
