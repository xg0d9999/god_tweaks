import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  console.error('\x1b[31m[ERROR] Debes configurar DISCORD_BOT_TOKEN y DISCORD_CLIENT_ID en discord-bot/.env\x1b[0m');
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName('actualizacion')
    .setDescription('Publica una actualización oficial de g0d suite y notifica a los usuarios por DM.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName('titulo')
        .setDescription('Título descriptivo (ej: g0d suite v1.0.3 - Latency Overhaul)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('version')
        .setDescription('Número de versión (ej: 1.0.3)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('novedades')
        .setDescription('Novedades y notas de la versión (ej: - bla bla 1 \n - bla bla 2)')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('canal')
        .setDescription('Canal de Discord donde publicar el anuncio (opcional)')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('enviar_dm')
        .setDescription('¿Enviar mensaje privado a los usuarios registrados en la base de datos? (Defecto: sí)')
        .setRequired(false)
    ),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

async function register() {
  try {
    console.log('\x1b[36m[Discord Bot] Registrando comando /actualizacion...\x1b[0m');

    if (guildId && guildId.trim().length > 0) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`\x1b[32m✔ Comando /actualizacion registrado instantáneamente en el servidor (${guildId}).\x1b[0m`);
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('\x1b[32m✔ Comando /actualizacion registrado de forma global en Discord.\x1b[0m');
    }
  } catch (err) {
    console.error('\x1b[31m[ERROR] Fallo al registrar comandos:\x1b[0m', err);
    process.exit(1);
  }
}

register();
