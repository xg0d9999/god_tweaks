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
export const DISCORD_WEBHOOK_URL =
  (import.meta.env?.VITE_DISCORD_WEBHOOK_URL as string) ||
  (typeof atob === 'function' ? atob(RAW_WEBHOOK_FALLBACK) : '');

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

/**
 * Envía un mensaje embebido al Webhook oficial de Discord
 */
export async function sendDiscordWebhook(embed: DiscordEmbed): Promise<boolean> {
  const url = DISCORD_WEBHOOK_URL;
  if (!url) return false;

  try {
    const payload = {
      username: 'g0d suite • Telemetría & HWID',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [
        {
          ...embed,
          footer: embed.footer || { text: 'g0d suite • Control de Hardware & Auditoría' },
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
          footer: embed.footer || { text: 'g0d suite • Discord Audit Logger' },
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
    { name: '👤 Usuario Discord', value: `**${user.username}** (<@${user.id}>)`, inline: true },
    { name: '🆔 Discord ID', value: `\`${user.id}\``, inline: true },
    { name: '🌐 Dirección IP Pública', value: `\`${ip || 'Desconocida'}\``, inline: true },
    { name: '💻 Hardware ID (HWID)', value: `\`${hardware?.hwid || 'No disponible'}\``, inline: false },
    {
      name: '⚙️ Procesador (CPU)',
      value: hardware ? `${hardware.cpu} (${hardware.cpu_cores} núcleos)` : 'N/A',
      inline: true,
    },
    { name: '🎮 Tarjeta Gráfica (GPU)', value: hardware?.gpu || 'N/A', inline: true },
    {
      name: '🧠 Memoria RAM',
      value: hardware ? `${(hardware.ram_mb / 1024).toFixed(1)} GB (${hardware.ram_mb} MB)` : 'N/A',
      inline: true,
    },
    { name: '🪟 Sistema Operativo', value: hardware?.os || 'Windows 11 / 10', inline: true },
    { name: '📡 Base de Datos Supabase', value: '🟢 Sincronizado en `app_users`', inline: true },
  ];

  return sendDiscordLog({
    title: '🛡️ [TELEMETRÍA] Conexión de Usuario & HWID Registrado',
    description: `El usuario **${user.username}** se ha conectado a **g0d suite**. Se ha registrado su hardware completo.`,
    color: 0x00f0ff, // Neon Cyan
    fields,
    thumbnail: { url: user.avatar_url },
    footer: { text: 'g0d suite • Control Total de Hardware & Auditoría' },
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
    { name: '👤 Usuario', value: data.username || 'Usuario Local', inline: true },
    { name: '🚀 Plan Aplicado', value: `**${data.planTitle}**`, inline: true },
    { name: '⚡ Optimizaciones Activas', value: `${data.appliedCount} módulos activados`, inline: true },
  ];

  return sendDiscordLog({
    title: '⚡ [LOG] Optimización de Rendimiento Aplicada',
    color: 0x00f0ff, // Neon Cyan
    fields,
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
    title: '🚨 [LOG] Sanción HispanLife Aplicada',
    color: 0xe11d48, // Rose Red
    fields: [
      { name: 'Staff Responsable', value: `**${data.staffAtt}**`, inline: true },
      { name: 'ID Sancionada', value: `\`${data.targetId}\``, inline: true },
      { name: 'Duración', value: `${data.hours} Horas`, inline: true },
      { name: 'Motivo', value: data.reason, inline: false },
    ],
  });
}
