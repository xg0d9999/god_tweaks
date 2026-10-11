const RAW_TOKEN_FALLBACK =
  'TVRVME16TXlPVFE1T1RrNE5UTTBOalkxTWcuR05yXy1kLmVaNFlJNHlCempicGVFQzBQUktXTS1oOU1Cb3IxVlBld3k2MjhF';

export const DISCORD_BOT_TOKEN =
  (import.meta.env?.VITE_DISCORD_BOT_TOKEN as string) ||
  (typeof atob === 'function' ? atob(RAW_TOKEN_FALLBACK) : '');
export const DISCORD_GUILD_ID =
  (import.meta.env?.VITE_DISCORD_GUILD_ID as string) || '1543324125685358713';
export const DISCORD_LOGS_CHANNEL_ID =
  (import.meta.env?.VITE_DISCORD_LOGS_CHANNEL_ID as string) || '1543324127283253270';

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
 * Envía un mensaje embebido al canal de logs oficial de Discord (1543324127283253270)
 */
export async function sendDiscordLog(embed: DiscordEmbed): Promise<boolean> {
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
    { name: '🌐 Dirección IP', value: `\`${ip || 'Desconocida'}\``, inline: true },
    { name: '💻 Hardware ID (HWID)', value: `\`${hardware?.hwid || 'No disponible'}\``, inline: false },
    {
      name: '⚙️ Procesador (CPU)',
      value: hardware ? `${hardware.cpu} (${hardware.cpu_cores} núcleos)` : 'N/A',
      inline: true,
    },
    { name: '🎮 Tarjeta Gráfica (GPU)', value: hardware?.gpu || 'N/A', inline: true },
    {
      name: '🧠 Memoria RAM',
      value: hardware ? `${(hardware.ram_mb / 1024).toFixed(1)} GB` : 'N/A',
      inline: true,
    },
    { name: '🪟 Sistema Operativo', value: hardware?.os || 'Windows', inline: true },
    { name: '📡 Base de Datos', value: '🟢 Registrado en Supabase (`app_users`)', inline: true },
  ];

  return sendDiscordLog({
    title: '🛡️ [LOG] Inicio de Sesión & Telemetría Registrada',
    color: 0x5865f2, // Discord Blurple
    fields,
    thumbnail: { url: user.avatar_url },
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
