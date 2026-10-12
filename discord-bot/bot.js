import { Client, GatewayIntentBits, EmbedBuilder, Partials } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL || 'https://oparanbvwqduvfrejlir.supabase.co';
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wYXJhbmJ2d3FkdXZmcmVqbGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MDEzNDMsImV4cCI6MjEwNzI3NzM0M30.uWL-1FE-Wxsm79sm7JOzYs7bwmm_itP3hwwlDpzKRGE';

if (!token) {
  console.error('\x1b[31m[ERROR] DISCORD_BOT_TOKEN no configurado en discord-bot/.env\x1b[0m');
  console.error('Por favor, edita discord-bot/.env e introduce tu token de Discord Bot.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.once('clientReady', async () => {
  console.log(`\n\x1b[1m\x1b[36m================================================================\x1b[0m`);
  console.log(`\x1b[1m\x1b[32m  ✔ Bot de Discord Conectado como: ${client.user.tag}\x1b[0m`);
  console.log(`\x1b[36m  ID: ${client.user.id}\x1b[0m`);

  // Consultar usuarios registrados en Supabase
  try {
    const { count, error } = await supabase
      .from('app_users')
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`\x1b[35m  Usuarios registrados en Supabase: ${count ?? 0}\x1b[0m`);
    }
  } catch (err) {
    console.warn('  Aviso al verificar usuarios en Supabase:', err.message);
  }

  console.log(`\x1b[1m\x1b[36m================================================================\x1b[0m\n`);
  console.log('Listo para escuchar el comando /actualizacion en tus servidores.\n');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'actualizacion') {
    await interaction.deferReply();

    const titulo = interaction.options.getString('titulo');
    const version = interaction.options.getString('version');
    const novedades = interaction.options.getString('novedades');
    const selectedChannel = interaction.options.getChannel('canal');
    const enviarDm = interaction.options.getBoolean('enviar_dm') ?? true;

    // Crear Embed de la Actualización
    const embed = new EmbedBuilder()
      .setTitle(`⚡ g0d suite • Actualización v${version}`)
      .setDescription(`**${titulo}**\n\n${novedades}`)
      .setColor(0xFFFFFF)
      .addFields(
        {
          name: 'Versión',
          value: `\`v${version}\``,
          inline: true,
        },
        {
          name: 'Actualización',
          value: 'Automática al abrir la suite',
          inline: true,
        }
      )
      .setFooter({
        text: 'g0d suite',
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    let channelNotice = 'No se especificó canal público.';

    // 1. Publicar en canal de Discord
    const targetChannel =
      selectedChannel ||
      (process.env.ANNOUNCEMENT_CHANNEL_ID
        ? client.channels.cache.get(process.env.ANNOUNCEMENT_CHANNEL_ID)
        : null) ||
      interaction.channel;

    if (targetChannel && targetChannel.isTextBased()) {
      try {
        await targetChannel.send({ embeds: [embed] });
        channelNotice = `Publicado con éxito en <#${targetChannel.id}>`;
      } catch (err) {
        channelNotice = `No se pudo enviar al canal: ${err.message}`;
      }
    }

    // 2. Guardar actualización en la base de datos Supabase
    try {
      await supabase.from('app_updates').insert({
        title: titulo,
        version: version,
        changelog: novedades,
        created_by: interaction.user.tag,
        published_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn('[Supabase] Aviso al registrar app_update:', dbErr.message);
    }

    // 3. Enviar Mensaje Privado (DM) a todos los usuarios de Supabase
    let dmSuccess = 0;
    const failedUsers = [];

    if (enviarDm) {
      try {
        const { data: users, error } = await supabase
          .from('app_users')
          .select('discord_id, discord_username');

        if (!error && users && users.length > 0) {
          for (const u of users) {
            if (!u.discord_id) continue;
            try {
              const targetUser = await client.users.fetch(u.discord_id);
              if (targetUser) {
                await targetUser.send({
                  content: `👋 ¡Hola **${u.discord_username || targetUser.username}**! Hay una nueva actualización disponible de **g0d suite**.`,
                  embeds: [embed],
                });
                dmSuccess++;
              } else {
                failedUsers.push({
                  id: u.discord_id,
                  username: u.discord_username || 'Desconocido',
                  reason: 'Usuario no encontrado',
                });
              }
            } catch (err) {
              const reason = err.code === 50007
                ? 'DMs cerrados / no comparte servidor'
                : err.message || 'Error desconocido';
              failedUsers.push({
                id: u.discord_id,
                username: u.discord_username || 'Desconocido',
                reason,
              });
            }
          }
        }
      } catch (dmErr) {
        console.error('[Discord DM] Error enviando DMs:', dmErr.message);
      }
    }

    // Responder a quien ejecutó el comando
    const responseLines = [
      `### ✔ Actualización **v${version}** procesada con éxito`,
      `• **Canal:** ${channelNotice}`,
    ];

    if (enviarDm) {
      responseLines.push(
        `• **Mensajes Directos:** Enviados a **${dmSuccess}** usuarios registrados (${failedUsers.length} fallidos).`
      );
      if (failedUsers.length > 0) {
        responseLines.push(
          `\n⚠️ **Usuarios que no recibieron el DM:**`,
          ...failedUsers.map(
            (f) => `• <@${f.id}> (\`${f.username}\`) — *${f.reason}*`
          )
        );
      }
    } else {
      responseLines.push('• **Mensajes Directos:** Desactivados para este envío.');
    }

    await interaction.editReply({
      content: responseLines.join('\n'),
    });
  }
});

client.login(token);
