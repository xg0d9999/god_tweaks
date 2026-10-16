import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Partials,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  AttachmentBuilder,
} from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  OWNER_ID,
  BRAND,
  buildTicketPanelEmbed,
  buildTicketDropdownRow,
} from './setup-tickets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error('\x1b[31m✖ ERROR: DISCORD_BOT_TOKEN no configurado en discord-bot/.env\x1b[0m');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://oparanbvwqduvfrejlir.supabase.co';
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wYXJhbmJ2d3FkdXZmcmVqbGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MDEzNDMsImV4cCI6MjEwNzI3NzM0M30.uWL-1FE-Wxsm79sm7JOzYs7bwmm_itP3hwwlDpzKRGE';

const supabase = createClient(supabaseUrl, supabaseKey);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User],
});

// Construir menú desplegable de acciones dentro de un ticket abierto
function buildTicketControlDropdown() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('ticket_control_action')
    .setPlaceholder('⚙️ Opciones de gestión del ticket...')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Notificar al usuario (DM)')
        .setDescription('Envía un aviso privado al creador del ticket (Solo Dueño).')
        .setValue('notify_user')
        .setEmoji('🔔'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Cerrar y eliminar ticket')
        .setDescription('Guarda el registro de auditoría y cierra el canal en 5 segundos.')
        .setValue('close_ticket')
        .setEmoji('🔒')
    );

  return new ActionRowBuilder().addComponents(menu);
}

// Obtener la categoría de tickets del servidor
async function resolveTicketsCategory(guild) {
  // 1. Intentar leer de tickets-config.json
  const configPath = path.join(__dirname, 'tickets-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const guildCfg = cfg[guild.id];
      if (guildCfg?.categoryId) {
        const cat = guild.channels.cache.get(guildCfg.categoryId) || (await guild.channels.fetch(guildCfg.categoryId).catch(() => null));
        if (cat) return cat;
      }
    } catch {
      // Continuar con búsqueda por nombre
    }
  }

  // 2. Buscar categoría por nombre
  await guild.channels.fetch();
  return guild.channels.cache.find(
    (c) =>
      c.type === ChannelType.GuildCategory &&
      (c.name.toLowerCase().includes('tickets') || c.name.toLowerCase().includes('soporte'))
  );
}

client.once('clientReady', async () => {
  console.log(`\n\x1b[1m\x1b[36m================================================================\x1b[0m`);
  console.log(`\x1b[1m\x1b[32m  ✔ Bot 24/7 Activo como: ${client.user.tag}\x1b[0m`);
  console.log(`\x1b[36m  ID Bot: ${client.user.id} | Encargado Tickets: ${OWNER_ID}\x1b[0m`);

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
  console.log('⚡ Sistema de Tickets (Soporte y Errores) y Notificaciones activo 24/7.\n');
});

client.on('interactionCreate', async (interaction) => {
  try {
    // =========================================================================
    // 1. MENÚ DESPLEGABLE DE CREACIÓN DE TICKETS (SOPORTE / ERRORES)
    // =========================================================================
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select_category') {
      const selectedType = interaction.values[0]; // 'soporte' | 'errores'
      await interaction.deferReply({ ephemeral: true });

      // Resetear el menú desplegable del panel para que quede limpio para la próxima selección
      await interaction.message
        .edit({
          components: [buildTicketDropdownRow()],
        })
        .catch(() => {});

      const guild = interaction.guild;
      if (!guild) {
        return interaction.editReply({
          content: '❌ Esta acción solo está disponible dentro del servidor.',
        });
      }

      await guild.channels.fetch();

      // Comprobar si el usuario ya tiene un ticket abierto
      const existingTicket = guild.channels.cache.find(
        (c) =>
          c.type === ChannelType.GuildText &&
          c.topic &&
          c.topic.includes(`UID:${interaction.user.id}`)
      );

      if (existingTicket) {
        return interaction.editReply({
          content: `⚠️ Ya tienes un ticket privado abierto en <#${existingTicket.id}>. Por favor utilízalo o ciérralo antes de abrir otro.`,
        });
      }

      const category = await resolveTicketsCategory(guild);

      const cleanUsername =
        interaction.user.username
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 16) || 'usuario';

      const channelName =
        selectedType === 'soporte'
          ? `⚡・soporte-${cleanUsername}`
          : `🛠️・error-${cleanUsername}`;

      // Permisos estrictos: SOLO @everyone denegado, el usuario creador, el Dueño (1103581405096710226) y el Bot
      const overwrites = [
        {
          id: guild.id, // @everyone: Nadie más puede ver el canal
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id, // Usuario que abre el ticket
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks,
          ],
        },
        {
          id: client.user.id, // Bot
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.AttachFiles,
          ],
        },
        {
          id: OWNER_ID, // EXCLUSIVAMENTE EL DUEÑO (1103581405096710226)
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.AttachFiles,
          ],
        },
      ];

      let ticketChannel;
      try {
        ticketChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category ? category.id : undefined,
          topic: `Ticket de ${interaction.user.tag} | UID:${interaction.user.id} | Tipo:${selectedType.toUpperCase()} | Encargado:${OWNER_ID}`,
          permissionOverwrites: overwrites,
        });
      } catch {
        ticketChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category ? category.id : undefined,
          topic: `Ticket de ${interaction.user.tag} | UID:${interaction.user.id} | Tipo:${selectedType.toUpperCase()} | Encargado:${OWNER_ID}`,
          permissionOverwrites: overwrites.filter((o) => o.id !== OWNER_ID),
        });
      }

      const isSoporte = selectedType === 'soporte';

      const ticketEmbed = new EmbedBuilder()
        .setColor(BRAND.COLOR)
        .setTitle(isSoporte ? '⚡ |  Ticket de soporte' : '⚡ |  Reporte de errores')
        .setThumbnail(BRAND.LOGO)
        .setDescription(
          [
            isSoporte ? '## SOPORTE Y ASISTENCIA' : '## REPORTE DE ERRORES',
            '',
            '### 1. Información del ticket.',
            '',
            `> • **Solicitante:** <@${interaction.user.id}> (\`${interaction.user.tag}\`)`,
            `> • **ID de Usuario:** \`${interaction.user.id}\``,
            `> • **Departamento:** \`${isSoporte ? 'Soporte General & Accesos' : 'Reporte de Errores (Bugs)'}\``,
            `> • **Encargado exclusivo:** <@${OWNER_ID}>`,
            '',
            '### 2. Instrucciones de atención.',
            '',
            isSoporte
              ? `> Describe detalladamente tu consulta, solicitud de acceso o duda sobre **g0d suite**. En breve <@${OWNER_ID}> te atenderá personalmente.`
              : `> Explica con detalle qué fallo o error has experimentado en **g0d suite**, en qué sección ocurre y adjunta capturas de pantalla si dispones de ellas. En breve <@${OWNER_ID}> revisará tu caso.`,
            '',
            '__Utiliza el menú desplegable inferior cuando desees gestionar o cerrar este ticket.__',
          ].join('\n')
        )
        .setImage(BRAND.BANNER)
        .setFooter({ text: BRAND.FOOTER })
        .setTimestamp();

      await ticketChannel.send({
        content: `⚡ <@${interaction.user.id}> • Atención directa: <@${OWNER_ID}>`,
        embeds: [ticketEmbed],
        components: [buildTicketControlDropdown()],
      });

      const confirmEmbed = new EmbedBuilder()
        .setColor(BRAND.COLOR)
        .setDescription(
          `### ✔ Ticket creado correctamente\n> Tu canal privado de **${
            isSoporte ? 'Soporte' : 'Errores'
          }** está listo en <#${ticketChannel.id}>.`
        );

      return interaction.editReply({
        embeds: [confirmEmbed],
      });
    }

    // =========================================================================
    // 2. MENÚ DESPLEGABLE DENTRO DEL TICKET (GESTIÓN Y CIERRE)
    // =========================================================================
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_control_action') {
      const action = interaction.values[0];
      const channel = interaction.channel;

      // Resetear selección del menú
      await interaction.message
        .edit({
          components: [buildTicketControlDropdown()],
        })
        .catch(() => {});

      const topic = channel?.topic || '';
      const uidMatch = topic.match(/UID:(\d+)/);
      const ticketOwnerId = uidMatch ? uidMatch[1] : null;

      if (action === 'notify_user') {
        if (interaction.user.id !== OWNER_ID) {
          return interaction.reply({
            content: `❌ Solo el encargado exclusivo (<@${OWNER_ID}>) puede enviar notificaciones de ticket.`,
            ephemeral: true,
          });
        }

        if (!ticketOwnerId) {
          return interaction.reply({
            content: '⚠️ No se pudo identificar el ID del creador del ticket.',
            ephemeral: true,
          });
        }

        try {
          const targetUser = await client.users.fetch(ticketOwnerId);
          const dmEmbed = new EmbedBuilder()
            .setColor(BRAND.COLOR)
            .setTitle('⚡ |  Notificación de soporte')
            .setThumbnail(BRAND.LOGO)
            .setDescription(
              [
                '## TIENES UNA RESPUESTA PENDIENTE',
                '',
                `> Hola <@${ticketOwnerId}>, <@${OWNER_ID}> ha respondido a tu ticket privado en <#${channel.id}>.`,
                '',
                '__Por favor, revisa el canal lo antes posible.__',
              ].join('\n')
            )
            .setImage(BRAND.BANNER)
            .setFooter({ text: BRAND.FOOTER })
            .setTimestamp();

          await targetUser.send({ embeds: [dmEmbed] });
          return interaction.reply({
            content: `✔ Se ha enviado un aviso por MD a <@${ticketOwnerId}>.`,
            ephemeral: true,
          });
        } catch {
          return interaction.reply({
            content: `⚠️ No se pudo enviar MD a <@${ticketOwnerId}> (tiene los mensajes directos cerrados).`,
            ephemeral: true,
          });
        }
      }

      if (action === 'close_ticket') {
        // Permitir cerrar al Dueño (1103581405096710226) o al propio creador del ticket
        if (interaction.user.id !== OWNER_ID && interaction.user.id !== ticketOwnerId) {
          return interaction.reply({
            content: `❌ Solo <@${OWNER_ID}> o el creador del ticket pueden cerrarlo.`,
            ephemeral: true,
          });
        }

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(BRAND.COLOR)
              .setDescription(
                `### 🔒 Cerrando ticket...\n> Ticket cerrado por <@${interaction.user.id}>. Este canal se eliminará en **5 segundos**.`
              ),
          ],
        });

        // Guardar log en canal de registros si existe en el servidor
        try {
          const logChannel = interaction.guild.channels.cache.find(
            (c) =>
              c.type === ChannelType.GuildText &&
              (c.name.includes('registros') || c.name.includes('logs'))
          );

          if (logChannel) {
            const fetchedMessages = await channel.messages.fetch({ limit: 100 });
            const transcriptLines = Array.from(fetchedMessages.values())
              .reverse()
              .map(
                (m) =>
                  `[${new Date(m.createdTimestamp).toLocaleString('es-ES')}] ${m.author.tag}: ${
                    m.content || (m.embeds.length > 0 ? '[Embed]' : '[Archivo]')
                  }`
              )
              .join('\n');

            const attachment = new AttachmentBuilder(Buffer.from(transcriptLines, 'utf-8'), {
              name: `transcripcion-${channel.name}.txt`,
            });

            const logEmbed = new EmbedBuilder()
              .setColor(BRAND.COLOR)
              .setTitle('⚡ |  Registro de ticket cerrado')
              .setThumbnail(BRAND.LOGO)
              .setDescription(
                [
                  `> • **Canal:** \`#${channel.name}\``,
                  `> • **Solicitante:** ${ticketOwnerId ? `<@${ticketOwnerId}> (\`${ticketOwnerId}\`)` : 'Desconocido'}`,
                  `> • **Cerrado por:** <@${interaction.user.id}>`,
                  `> • **Encargado:** <@${OWNER_ID}>`,
                ].join('\n')
              )
              .setFooter({ text: BRAND.FOOTER })
              .setTimestamp();

            await logChannel.send({
              embeds: [logEmbed],
              files: [attachment],
            });
          }
        } catch {
          // Ignorar errores de transcripción
        }

        setTimeout(() => {
          channel.delete('Ticket finalizado').catch(() => {});
        }, 5000);
      }
      return;
    }

    // =========================================================================
    // 3. COMANDOS SLASH (/actualizacion)
    // =========================================================================
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'actualizacion') {
      await interaction.deferReply();

      const titulo = interaction.options.getString('titulo');
      const version = interaction.options.getString('version');
      const novedades = interaction.options.getString('novedades');
      const selectedChannel = interaction.options.getChannel('canal');
      const enviarDm = interaction.options.getBoolean('enviar_dm') ?? true;

      const embed = new EmbedBuilder()
        .setTitle(`⚡ |  Actualización v${version}`)
        .setDescription(`## ${titulo.toUpperCase()}\n\n${novedades}`)
        .setColor(BRAND.COLOR)
        .setThumbnail(BRAND.LOGO)
        .setImage(BRAND.BANNER)
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
          text: BRAND.FOOTER,
        })
        .setTimestamp();

      let channelNotice = 'No se especificó canal público.';

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
                const reason =
                  err.code === 50007
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
            ...failedUsers.map((f) => `• <@${f.id}> (\`${f.username}\`) — *${f.reason}*`)
          );
        }
      } else {
        responseLines.push('• **Mensajes Directos:** Desactivados para este envío.');
      }

      await interaction.editReply({
        content: responseLines.join('\n'),
      });
    }
  } catch (err) {
    console.error('[Interaction Error]:', err);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction
        .reply({ content: '❌ Ocurrió un error al procesar la solicitud.', ephemeral: true })
        .catch(() => {});
    }
  }
});

// =========================================================================
// 4. AUTOROL DE MIEMBRO Y PROTECCIÓN ANTI-RAID
// =========================================================================
const recentJoins = [];
let isRaidLockdown = false;
let raidTimeoutTimer = null;

client.on('guildMemberAdd', async (member) => {
  try {
    const now = Date.now();
    recentJoins.push(now);

    // Mantener únicamente las entradas de los últimos 12 segundos
    while (recentJoins.length > 0 && now - recentJoins[0] > 12000) {
      recentJoins.shift();
    }

    const logChannel = member.guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildText &&
        (c.name.includes('registros') || c.name.includes('logs'))
    );

    // Activación de Anti-Raid si entran 5 o más usuarios en 12 segundos
    if (recentJoins.length >= 5) {
      if (!isRaidLockdown) {
        isRaidLockdown = true;
        console.warn(`[ANTI-RAID] ¡ALERTA ACTIVADA! Detección de ${recentJoins.length} ingresos en 12s.`);

        if (logChannel) {
          const raidEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('🚨 |  Alerta Anti-Raid Activada')
            .setThumbnail(BRAND.LOGO)
            .setDescription(
              [
                '## INGRESO MASIVO DETECTADO (POSIBLE RAID)',
                '',
                `> Se han detectado **${recentJoins.length} entradas en menos de 12 segundos**.`,
                '> • **Medida preventiva:** Auto-rol de miembro pausado temporalmente.',
                '> • **Acción:** Los nuevos ingresos quedan en cuarentena de seguridad.',
                `> • **Último usuario detectado:** <@${member.id}> (\`${member.user.tag}\`)`,
                '',
                '__El modo de protección se desactivará automáticamente al normalizarse las entradas.__',
              ].join('\n')
            )
            .setImage(BRAND.BANNER)
            .setFooter({ text: BRAND.FOOTER })
            .setTimestamp();

          await logChannel
            .send({
              content: `🚨 <@${OWNER_ID}> ¡Alerta de posible Raid masivo en el servidor!`,
              embeds: [raidEmbed],
            })
            .catch(() => {});
        }
      }

      // Reiniciar temporizador de desactivación tras 45 segundos sin nuevos ingresos masivos
      if (raidTimeoutTimer) clearTimeout(raidTimeoutTimer);
      raidTimeoutTimer = setTimeout(() => {
        isRaidLockdown = false;
        console.log('[ANTI-RAID] Modo lockdown finalizado. Entradas normalizadas.');
        if (logChannel) {
          const calmEmbed = new EmbedBuilder()
            .setColor(BRAND.COLOR)
            .setTitle('⚡ |  Anti-Raid: Situación Normalizada')
            .setDescription(
              '> El flujo de entradas se ha normalizado. El sistema de auto-rol de miembros vuelve a operar habitualmente.'
            )
            .setFooter({ text: BRAND.FOOTER })
            .setTimestamp();
          logChannel.send({ embeds: [calmEmbed] }).catch(() => {});
        }
      }, 45000);

      // Si la cuenta tiene menos de 3 días de creación durante un raid, aplicar timeout preventivo
      const accountAgeDays = (now - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
      if (accountAgeDays < 3) {
        await member.timeout(60 * 60 * 1000, 'Anti-Raid: Cuenta nueva en masa detectada').catch(() => {});
      }
      return;
    }

    // Flujo Normal: Asignación de Auto-Rol de Miembro (👤・Miembro)
    let memberRole = member.guild.roles.cache.get('1543332744292081734');
    if (!memberRole) {
      memberRole = member.guild.roles.cache.find(
        (r) =>
          r.name.toLowerCase().includes('miembro') ||
          r.name.toLowerCase().includes('member')
      );
    }

    if (memberRole) {
      await member.roles.add(memberRole, 'Auto-Rol de nuevo miembro').catch((err) => {
        console.warn('[Auto-Rol] Error al asignar rol de miembro:', err.message);
      });
    }

    // Registrar ingreso en el canal de registros
    if (logChannel) {
      const joinEmbed = new EmbedBuilder()
        .setColor(BRAND.COLOR)
        .setTitle('⚡ |  Nuevo Miembro & Auto-Rol')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          [
            '## NUEVO USUARIO REGISTRADO',
            '',
            `> • **Usuario:** <@${member.id}> (\`${member.user.tag}\`)`,
            `> • **ID:** \`${member.id}\``,
            `> • **Rol otorgado:** ${memberRole ? `<@&${memberRole.id}>` : '`No encontrado`'}`,
            `> • **Antigüedad de cuenta:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
          ].join('\n')
        )
        .setFooter({ text: BRAND.FOOTER })
        .setTimestamp();

      await logChannel.send({ embeds: [joinEmbed] }).catch(() => {});
    }
  } catch (err) {
    console.error('[guildMemberAdd Error]:', err);
  }
});

// =========================================================================
// 5. SISTEMA ANTI-SPAM MASIVO (FLOOD, REPETICIONES, MENCIONES & ENLACES)
// =========================================================================
const userMessages = new Map();

client.on('messageCreate', async (message) => {
  try {
    if (!message.guild || message.author.bot) return;

    // Exenciones de Anti-Spam: Dueño (1103581405096710226) y Administradores
    if (message.author.id === OWNER_ID) return;
    if (message.member?.permissions.has(PermissionFlagsBits.Administrator)) return;

    const logChannel = message.guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildText &&
        (c.name.includes('registros') || c.name.includes('logs'))
    );

    const now = Date.now();
    const userId = message.author.id;
    const content = message.content.trim();

    // 1. CHEQUEO DE ENLACES DE DISCORD EXTERNOS (ANTI-INVITES / SCAM)
    const inviteRegex = /(discord\.(gg|io|me|li)\/|discord\.com\/invite\/)([a-zA-Z0-9]+)/i;
    if (inviteRegex.test(content)) {
      await message.delete().catch(() => {});
      const warnMsg = await message.channel
        .send({
          content: `⚠️ <@${userId}>, los enlaces de invitación externos no están permitidos en este servidor.`,
        })
        .catch(() => null);

      if (warnMsg) setTimeout(() => warnMsg.delete().catch(() => {}), 6000);

      if (logChannel) {
        const inviteEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('🛡️ |  Anti-Spam: Enlace de Invitación Eliminado')
          .setThumbnail(BRAND.LOGO)
          .setDescription(
            [
              `> • **Usuario:** <@${userId}> (\`${message.author.tag}\`)`,
              `> • **Canal:** <#${message.channel.id}>`,
              `> • **Mensaje interceptado:** \`${content.slice(0, 200)}\``,
            ].join('\n')
          )
          .setFooter({ text: BRAND.FOOTER })
          .setTimestamp();
        await logChannel.send({ embeds: [inviteEmbed] }).catch(() => {});
      }
      return;
    }

    // 2. CHEQUEO DE MENCIONES MASIVAS (@everyone, @here o >=4 menciones)
    const hasEveryone = message.mentions.everyone;
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    if (hasEveryone || mentionCount >= 4) {
      await message.delete().catch(() => {});
      await message.member?.timeout(15 * 60 * 1000, 'Anti-Spam: Menciones masivas').catch(() => {});

      const warnMsg = await message.channel
        .send({
          content: `⚠️ <@${userId}>, has sido silenciado por 15 minutos debido a menciones masivas no autorizadas.`,
        })
        .catch(() => null);

      if (warnMsg) setTimeout(() => warnMsg.delete().catch(() => {}), 7000);

      if (logChannel) {
        const mentionEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('🛡️ |  Anti-Spam: Menciones Masivas Bloqueadas')
          .setThumbnail(BRAND.LOGO)
          .setDescription(
            [
              `> • **Usuario silenciado:** <@${userId}> (\`${message.author.tag}\`)`,
              `> • **Menciones detectadas:** \`${mentionCount}\` ${hasEveryone ? '(@everyone/@here)' : ''}`,
              `> • **Canal:** <#${message.channel.id}>`,
              '> • **Sanción aplicada:** Aislamiento temporal de 15 minutos.',
            ].join('\n')
          )
          .setFooter({ text: BRAND.FOOTER })
          .setTimestamp();
        await logChannel.send({ embeds: [mentionEmbed] }).catch(() => {});
      }
      return;
    }

    // 3. CONTROL DE FLOOD (MENSAJES DEMASIADO RÁPIDOS) Y REPETICIONES
    let userData = userMessages.get(userId);
    if (!userData) {
      userData = { timestamps: [], lastContent: '', repeatCount: 1 };
      userMessages.set(userId, userData);
    }

    userData.timestamps.push(now);

    // Limpiar marcas de tiempo de más de 4 segundos
    while (userData.timestamps.length > 0 && now - userData.timestamps[0] > 4000) {
      userData.timestamps.shift();
    }

    // Comprobar repetición de mismo contenido
    if (content.length > 3 && content.toLowerCase() === userData.lastContent.toLowerCase()) {
      userData.repeatCount++;
    } else {
      userData.lastContent = content;
      userData.repeatCount = 1;
    }

    // Sanción por flood (5 o más mensajes en menos de 4 segundos)
    if (userData.timestamps.length >= 5) {
      userMessages.delete(userId);
      await message.delete().catch(() => {});
      await message.member?.timeout(5 * 60 * 1000, 'Anti-Spam: Flood de mensajes').catch(() => {});

      const warnMsg = await message.channel
        .send({
          content: `⚠️ <@${userId}>, has sido silenciado por 5 minutos por enviar mensajes demasiado rápido (Flood).`,
        })
        .catch(() => null);

      if (warnMsg) setTimeout(() => warnMsg.delete().catch(() => {}), 6000);

      if (logChannel) {
        const floodEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('🛡️ |  Anti-Spam: Flood de Mensajes Detectado')
          .setThumbnail(BRAND.LOGO)
          .setDescription(
            [
              `> • **Usuario:** <@${userId}> (\`${message.author.tag}\`)`,
              `> • **Canal:** <#${message.channel.id}>`,
              '> • **Motivo:** Más de 5 mensajes en menos de 4 segundos.',
              '> • **Sanción:** Silenciado temporal de 5 minutos.',
            ].join('\n')
          )
          .setFooter({ text: BRAND.FOOTER })
          .setTimestamp();
        await logChannel.send({ embeds: [floodEmbed] }).catch(() => {});
      }
      return;
    }

    // Sanción por texto idéntico repetido (3 o más veces consecutivas)
    if (userData.repeatCount >= 3) {
      userMessages.delete(userId);
      await message.delete().catch(() => {});
      await message.member?.timeout(5 * 60 * 1000, 'Anti-Spam: Mensajes repetidos').catch(() => {});

      const warnMsg = await message.channel
        .send({
          content: `⚠️ <@${userId}>, has sido silenciado por 5 minutos por repetir el mismo mensaje continuamente.`,
        })
        .catch(() => null);

      if (warnMsg) setTimeout(() => warnMsg.delete().catch(() => {}), 6000);

      if (logChannel) {
        const repeatEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('🛡️ |  Anti-Spam: Mensaje Repetitivo Eliminado')
          .setThumbnail(BRAND.LOGO)
          .setDescription(
            [
              `> • **Usuario:** <@${userId}> (\`${message.author.tag}\`)`,
              `> • **Canal:** <#${message.channel.id}>`,
              `> • **Texto repetido:** \`${content.slice(0, 150)}\``,
              '> • **Sanción:** Silenciado temporal de 5 minutos.',
            ].join('\n')
          )
          .setFooter({ text: BRAND.FOOTER })
          .setTimestamp();
        await logChannel.send({ embeds: [repeatEmbed] }).catch(() => {});
      }
      return;
    }
  } catch (err) {
    console.error('[Anti-Spam Error]:', err);
  }
});

// Evitar que errores no capturados detengan el proceso 24/7
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]:', err);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
});

client.login(token);
