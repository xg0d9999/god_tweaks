import {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
  console.error('\x1b[31m✖ ERROR: DISCORD_BOT_TOKEN no está definido en discord-bot/.env\x1b[0m');
  process.exit(1);
}

// ID exclusivo del dueño que atenderá todos los tickets
export const OWNER_ID = '1103581405096710226';

// Brand Kit Oficial g0d suite (Extraído exactamente del servidor g0d hub)
export const BRAND = {
  COLOR: 0xffffff,
  BANNER: 'https://i.postimg.cc/7YsdvXqh/banner-god-suite.png',
  LOGO: 'https://i.postimg.cc/qzKjyshM/i-Tunes-Artwork-3x.png',
  FOOTER: 'g0d hub    -     Todos los derechos reservados.',
};

export function buildTicketPanelEmbed() {
  return new EmbedBuilder()
    .setColor(BRAND.COLOR)
    .setTitle('⚡ |  Centro de soporte')
    .setThumbnail(BRAND.LOGO)
    .setDescription(
      [
        '## SISTEMA DE TICKETS',
        '',
        '### 1. Soporte y asistencia.',
        '',
        '> Si necesitas ayuda con tu cuenta, activación de licencias o permisos en **g0d suite**, dudas sobre la configuración o asistencia general, selecciona el apartado de **Soporte** en el menú inferior.',
        '',
        '### 2. Reporte de errores.',
        '',
        '> Si has detectado algún fallo técnico, bug o comportamiento inesperado en cualquiera de las utilidades de la aplicación, selecciona el apartado de **Errores** detallando lo ocurrido.',
        '',
        '### 3. Atención directa y privacidad.',
        '',
        `> Todos los tickets son estrictamente privados y atendidos de forma personal y exclusiva por <@${OWNER_ID}>.`,
        '',
        '__Selecciona el departamento correspondiente en el menú desplegable inferior para abrir un ticket privado.__',
      ].join('\n')
    )
    .setImage(BRAND.BANNER)
    .setFooter({ text: BRAND.FOOTER })
    .setTimestamp();
}

export function buildTicketDropdownRow() {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('ticket_select_category')
    .setPlaceholder('⚡ Selecciona el tipo de ticket que deseas abrir...')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Soporte')
        .setDescription('Asistencia general, activación de accesos y dudas sobre g0d suite.')
        .setValue('soporte')
        .setEmoji('⚡'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Errores')
        .setDescription('Reporte de fallos técnicos, bugs o problemas en la aplicación.')
        .setValue('errores')
        .setEmoji('🛠️')
    );

  return new ActionRowBuilder().addComponents(selectMenu);
}

async function runSetup() {
  console.log('\x1b[36m================================================================\x1b[0m');
  console.log('\x1b[1m  ⚡ CONFIGURADOR DE CATEGORÍA, CANAL Y PERMISOS DE TICKETS\x1b[0m');
  console.log('\x1b[36m================================================================\x1b[0m\n');

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once('clientReady', async () => {
    try {
      console.log(`✔ Conectado como: ${client.user.tag} (${client.user.id})`);

      const guilds = Array.from(client.guilds.cache.values());
      if (guilds.length === 0) {
        console.error('\x1b[31m✖ El bot no se encuentra en ningún servidor de Discord.\x1b[0m');
        process.exit(1);
      }

      const savedConfigs = {};

      for (const guild of guilds) {
        console.log(`\n⚙ Configurando servidor: "${guild.name}" (${guild.id})...`);

        // Intentar cachear al dueño en el servidor
        try {
          await guild.members.fetch(OWNER_ID);
        } catch {
          // Continuar si no está en caché
        }

        // 1. Permisos de la Categoría (Oculta para @everyone, visible solo para el Dueño 1103581405096710226 y el Bot)
        const categoryOverwrites = [
          {
            id: guild.id, // @everyone
            deny: [PermissionFlagsBits.ViewChannel],
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
            id: OWNER_ID, // Dueño exclusivo (1103581405096710226)
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

        await guild.channels.fetch();
        let category = guild.channels.cache.find(
          (c) =>
            c.type === ChannelType.GuildCategory &&
            (c.name.toLowerCase().includes('tickets') || c.name.toLowerCase().includes('soporte'))
        );

        if (!category) {
          try {
            category = await guild.channels.create({
              name: '🎫・SOPORTE & TICKETS',
              type: ChannelType.GuildCategory,
              permissionOverwrites: categoryOverwrites,
            });
          } catch {
            category = await guild.channels.create({
              name: '🎫・SOPORTE & TICKETS',
              type: ChannelType.GuildCategory,
              permissionOverwrites: categoryOverwrites.filter((o) => o.id !== OWNER_ID),
            });
          }
          console.log(`  ✔ Categoría creada: "${category.name}" (ID: ${category.id})`);
        } else {
          try {
            await category.permissionOverwrites.set(categoryOverwrites);
          } catch {
            // Ignorar si no se pudo aplicar overwrite
          }
          console.log(`  ✔ Categoría existente actualizada: "${category.name}" (ID: ${category.id})`);
        }

        // 2. Permisos para el Canal Público del Panel (Todos ven el panel y usan el menú desplegable, nadie puede escribir texto libre salvo Owner y Bot)
        const channelOverwrites = [
          {
            id: guild.id, // @everyone
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
            deny: [
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.CreatePublicThreads,
              PermissionFlagsBits.CreatePrivateThreads,
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
            id: OWNER_ID, // Dueño exclusivo (1103581405096710226)
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

        let ticketChannel = guild.channels.cache.find(
          (c) =>
            c.type === ChannelType.GuildText &&
            c.parentId === category.id &&
            (c.name.includes('tickets') || c.name.includes('soporte'))
        );

        if (!ticketChannel) {
          try {
            ticketChannel = await guild.channels.create({
              name: '🎫・tickets',
              type: ChannelType.GuildText,
              parent: category.id,
              topic: 'Centro oficial de soporte y reporte de errores de g0d suite.',
              permissionOverwrites: channelOverwrites,
            });
          } catch {
            ticketChannel = await guild.channels.create({
              name: '🎫・tickets',
              type: ChannelType.GuildText,
              parent: category.id,
              topic: 'Centro oficial de soporte y reporte de errores de g0d suite.',
              permissionOverwrites: channelOverwrites.filter((o) => o.id !== OWNER_ID),
            });
          }
          console.log(`  ✔ Canal de tickets creado: #${ticketChannel.name} (ID: ${ticketChannel.id})`);
        } else {
          try {
            await ticketChannel.permissionOverwrites.set(channelOverwrites);
          } catch {
            // Ignorar error menor
          }
          console.log(`  ✔ Canal de tickets actualizado: #${ticketChannel.name} (ID: ${ticketChannel.id})`);
        }

        // 3. Limpiar paneles anteriores enviados por el bot para dejar únicamente el nuevo limpio
        try {
          const messages = await ticketChannel.messages.fetch({ limit: 25 });
          const botMessages = messages.filter((m) => m.author.id === client.user.id);
          for (const msg of botMessages.values()) {
            await msg.delete().catch(() => {});
          }
        } catch {
          // Ignorar errores de limpieza
        }

        // 4. Publicar el Embed Blanco con el Brand Kit y el Menú Desplegable (Soporte / Errores)
        const panelEmbed = buildTicketPanelEmbed();
        const dropdownRow = buildTicketDropdownRow();

        const sentMsg = await ticketChannel.send({
          embeds: [panelEmbed],
          components: [dropdownRow],
        });

        console.log(`  ✔ Panel de tickets publicado con éxito (Mensaje ID: ${sentMsg.id})`);

        savedConfigs[guild.id] = {
          guildId: guild.id,
          guildName: guild.name,
          categoryId: category.id,
          panelChannelId: ticketChannel.id,
          panelMessageId: sentMsg.id,
          ownerId: OWNER_ID,
          updatedAt: new Date().toISOString(),
        };
      }

      const configPath = path.join(__dirname, 'tickets-config.json');
      fs.writeFileSync(configPath, JSON.stringify(savedConfigs, null, 2), 'utf-8');

      console.log('\n\x1b[32m================================================================\x1b[0m');
      console.log('\x1b[1m\x1b[32m  ✔ CATEGORÍA, CANAL Y PERMISOS CONFIGURADOS CON ÉXITO\x1b[0m');
      console.log(`\x1b[32m  ✔ Atención exclusiva asignada a ID: ${OWNER_ID}\x1b[0m`);
      console.log('\x1b[32m================================================================\x1b[0m\n');

      client.destroy();
      process.exit(0);
    } catch (err) {
      console.error('\n\x1b[31m✖ Error durante la configuración:\x1b[0m', err);
      client.destroy();
      process.exit(1);
    }
  });

  client.login(TOKEN).catch((err) => {
    console.error('\x1b[31m✖ Error al iniciar sesión con el token:\x1b[0m', err.message);
    process.exit(1);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  runSetup();
}
