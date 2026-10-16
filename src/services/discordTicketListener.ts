import { TicketAuditRecord, TicketBotConfig } from '../types';
import { evaluateTicketTranscript } from './deepseek';

export type ListenerStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ListenerCallbacks {
  onStatusChange?: (status: ListenerStatus, message?: string) => void;
  onAuditRecord?: (record: TicketAuditRecord) => void;
  onLog?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

class DiscordTicketListener {
  private ws: WebSocket | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private status: ListenerStatus = 'disconnected';
  private config: TicketBotConfig | null = null;
  private callbacks: ListenerCallbacks = {};
  private processedMessageIds = new Set<string>();

  public getStatus(): ListenerStatus {
    return this.status;
  }

  private getCleanToken(): string {
    const raw = this.config?.token || this.config?.bot_token || '';
    return raw.trim().replace(/^(Bot|Bearer)\s+/i, '');
  }

  private getAuthHeader(): string {
    const clean = this.getCleanToken();
    if (this.config?.token_mode === 'bot') {
      return `Bot ${clean}`;
    }
    // Modo Cuenta Propia (Selfbot / User Token como Nighty)
    return clean;
  }

  public start(config: TicketBotConfig, callbacks: ListenerCallbacks) {
    this.config = config;
    this.callbacks = callbacks;

    const token = this.getCleanToken();
    if (!token) {
      this.setStatus('error', 'Token de Discord no configurado.');
      return;
    }
    if (!config.deepseek_api_key?.trim()) {
      this.setStatus('error', 'API Key de DeepSeek no configurada.');
      return;
    }

    this.connectGateway();
  }

  public stop() {
    this.cleanup();
    this.setStatus('disconnected', 'Escucha detenida por el usuario.');
    this.callbacks.onLog?.('Servicio de escucha de tickets detenido.', 'info');
  }

  private setStatus(status: ListenerStatus, message?: string) {
    this.status = status;
    this.callbacks.onStatusChange?.(status, message);
    if (message) {
      const type = status === 'error' ? 'error' : status === 'connected' ? 'success' : 'info';
      this.callbacks.onLog?.(message, type);
    }
  }

  private cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // Ignorar error al cerrar socket
      }
      this.ws = null;
    }
  }

  private connectGateway() {
    this.cleanup();
    const modeLabel = this.config?.token_mode === 'user' ? 'Cuenta Propia (Nighty Style)' : 'Bot de Servidor';
    this.setStatus('connecting', `Conectando con Discord Gateway en modo ${modeLabel}...`);

    try {
      this.ws = new WebSocket('wss://gateway.discord.gg/?v=9&encoding=json');

      this.ws.onopen = () => {
        this.callbacks.onLog?.('WebSocket con Discord establecido. Autenticando sesión...', 'info');
      };

      this.ws.onmessage = async (event) => {
        try {
          const payload = JSON.parse(event.data as string);
          await this.handlePayload(payload);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          this.callbacks.onLog?.(`Error procesando evento de Discord: ${message}`, 'warning');
        }
      };

      this.ws.onerror = (e) => {
        console.error('Discord WebSocket error:', e);
        this.setStatus('error', 'Error en la conexión con Discord Gateway.');
      };

      this.ws.onclose = (event) => {
        if (this.status !== 'disconnected') {
          this.setStatus('disconnected', `Conexión cerrada (${event.code}).`);
        }
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.setStatus('error', `Error al iniciar WebSocket: ${message}`);
    }
  }

  private async handlePayload(payload: { op: number; d: any; t?: string; s?: number }) {
    // Opcode 10: Hello -> empezar heartbeat y mandar Identify
    if (payload.op === 10) {
      const intervalMs = payload.d?.heartbeat_interval || 41250;
      this.startHeartbeat(intervalMs);
      this.sendIdentify();
      return;
    }

    // Evento de Dispatch (op 0)
    if (payload.op === 0 && payload.t) {
      if (payload.t === 'READY') {
        const username = payload.d?.user?.username || 'Usuario';
        const disc = payload.d?.user?.discriminator;
        const tag = disc && disc !== '0' ? `${username}#${disc}` : username;
        const modeDesc = this.config?.token_mode === 'user' ? 'Cuenta Personal (En cualquier servidor)' : 'Bot';
        this.setStatus('connected', `Escuchando en vivo como: ${tag} (${modeDesc})`);
        return;
      }

      if (payload.t === 'MESSAGE_CREATE') {
        await this.handleMessageCreate(payload.d);
      }
    }
  }

  private startHeartbeat(intervalMs: number) {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ op: 1, d: null }));
      }
    }, intervalMs);
  }

  private sendIdentify() {
    if (!this.ws || !this.config) return;

    const token = this.getCleanToken();
    const isBot = this.config.token_mode === 'bot';

    // Para cuentas de usuario (Selfbot / Nighty), NO se debe enviar 'intents'
    // porque Discord rechaza la conexión con error 4004. Las cuentas de usuario reciben mensajes automáticamente.
    const identifyPayload: any = {
      op: 2,
      d: {
        token: isBot ? `Bot ${token}` : token,
        properties: {
          os: 'Windows',
          browser: 'Discord Client',
          release_channel: 'stable',
          client_version: '1.0.9261',
          os_version: '10.0.22631',
          os_arch: 'x64',
          system_locale: 'es-ES',
        },
      },
    };

    if (isBot) {
      // Intents de Bot: Guilds (1) + GuildMessages (512) + MessageContent (32768)
      identifyPayload.d.intents = 33281;
    } else {
      identifyPayload.d.capabilities = 30717;
      identifyPayload.d.presence = {
        status: 'online',
        since: 0,
        activities: [],
        afk: false,
      };
    }

    this.ws.send(JSON.stringify(identifyPayload));
  }

  private async handleMessageCreate(msg: any) {
    if (!msg || !msg.content || !msg.channel_id) return;

    const rawContent = msg.content.trim().toLowerCase();
    
    // Detectar comandos soportados: /revisa, .revisa, !revisa, -revisa
    const isTrigger =
      rawContent.startsWith('/revisa') ||
      rawContent.startsWith('.revisa') ||
      rawContent.startsWith('!revisa') ||
      rawContent.startsWith('-revisa');

    if (!isTrigger) return;

    // Evitar procesar el mismo mensaje repetido
    if (this.processedMessageIds.has(msg.id)) return;
    this.processedMessageIds.add(msg.id);

    const channelId = msg.channel_id;
    const authorName = msg.author?.username || 'Staff';

    this.callbacks.onLog?.(
      `Comando de revisión detectado en canal ${channelId} por ${authorName}. Analizando con DeepSeek AI...`,
      'info'
    );

    try {
      await this.auditChannel(channelId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.callbacks.onLog?.(`Error auditando canal ${channelId}: ${message}`, 'error');
    }
  }

  public updateConfig(config: TicketBotConfig, callbacks?: ListenerCallbacks) {
    this.config = config;
    if (callbacks) {
      this.callbacks = { ...this.callbacks, ...callbacks };
    }
  }

  /**
   * Descarga mensajes del canal, envía a DeepSeek y publica respuesta en Discord
   */
  public async auditChannel(
    channelIdOrUrl: string,
    overrideConfig?: TicketBotConfig
  ): Promise<TicketAuditRecord> {
    if (overrideConfig) {
      this.config = overrideConfig;
    }
    if (!this.config) {
      throw new Error('Configuración de bot o cuenta ausente. Configura tus claves primero.');
    }

    // Extraer ID si el usuario pasó una URL (ej: https://discord.com/channels/123/456)
    let channelId = channelIdOrUrl.trim();
    const urlMatch = channelId.match(/channels\/\d+\/(\d+)/i);
    if (urlMatch && urlMatch[1]) {
      channelId = urlMatch[1];
    }

    const authHeader = this.getAuthHeader();
    const isBot = this.config.token_mode === 'bot';

    // 1. Obtener información del canal
    let channelName = `ticket-${channelId.slice(-4)}`;
    try {
      const chRes = await fetch(`https://discord.com/api/v9/channels/${channelId}`, {
        headers: {
          Authorization: authHeader,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9261 Chrome/128.0.6613.186 Electron/32.2.7 Safari/537.36',
        },
      });
      if (chRes.ok) {
        const chData = await chRes.json();
        if (chData.name) channelName = chData.name;
      }
    } catch {
      // Usar nombre fallback si no se puede consultar canal
    }

    // 2. Obtener historial reciente de mensajes
    const msgRes = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages?limit=60`, {
      headers: {
        Authorization: authHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9261 Chrome/128.0.6613.186 Electron/32.2.7 Safari/537.36',
      },
    });

    if (!msgRes.ok) {
      throw new Error(`No se pudieron obtener mensajes del canal ${channelId} (${msgRes.status}). Verifica tus permisos en este canal.`);
    }

    const rawMessages: any[] = await msgRes.json();
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      throw new Error('El canal no contiene mensajes para analizar.');
    }

    // Invertir orden para que quede cronológico
    const sorted = [...rawMessages].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Formatear transcripción para DeepSeek
    const transcriptLines = sorted.map((m) => {
      const author = m.author?.username || 'Usuario';
      const isBotAuthor = m.author?.bot ? ' [BOT]' : '';
      const text = m.content || (m.attachments?.length ? '[Archivo adjunto]' : '[Sin texto]');
      return `[${author}${isBotAuthor}]: ${text}`;
    });

    const transcript = transcriptLines.join('\n');

    // 3. Evaluar con DeepSeek AI
    this.callbacks.onLog?.(`Enviando ${sorted.length} mensajes a DeepSeek AI para evaluación objetiva...`, 'info');
    const evaluation = await evaluateTicketTranscript(
      this.config.deepseek_api_key,
      transcript,
      this.config.custom_prompt
    );

    // 4. Mapear a TicketAuditRecord
    const auditRecord: TicketAuditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channel_id: channelId,
      channel_name: channelName,
      audited_at: new Date().toLocaleTimeString(),
      summary: evaluation.summary,
      rewarded_staff: evaluation.valid_supporters.map((s) => ({
        discord_id: s.discord_id || '',
        username: s.username,
        contribution: s.contribution,
      })),
      ignored_staff: evaluation.ignored_participants,
    };

    // 5. Responder en el canal de Discord
    try {
      const rewardedList =
        auditRecord.rewarded_staff.length > 0
          ? auditRecord.rewarded_staff.map((s) => `• **${s.username}** (+1 intervención)\n  *${s.contribution}*`).join('\n')
          : '*(Ningún miembro del staff aportó una solución técnica real)*';

      const ignoredList =
        auditRecord.ignored_staff.length > 0
          ? auditRecord.ignored_staff.map((s) => `• **${s.username}**: ${s.reason}`).join('\n')
          : null;

      let postBody: any;

      if (isBot) {
        // En modo Bot enviamos un embed oficial
        const embedFields: any[] = [
          { name: '🏆 Soportes Recompensados (+1)', value: rewardedList, inline: false },
          { name: '📋 Resumen del Ticket', value: auditRecord.summary, inline: false },
        ];
        if (ignoredList) {
          embedFields.push({ name: '⚠️ Intervenciones Sin Puntos', value: ignoredList, inline: false });
        }
        postBody = {
          embeds: [
            {
              title: `🛡️ Auditoría de Ticket — #${channelName}`,
              description: 'Evaluación completada mediante **DeepSeek AI**.',
              color: auditRecord.rewarded_staff.length > 0 ? 0x10b981 : 0xf59e0b,
              fields: embedFields,
              footer: { text: 'g0d suite | Sistema de Conteo de Tickets' },
              timestamp: new Date().toISOString(),
            },
          ],
        };
      } else {
        // En modo Cuenta Personal (Selfbot / Nighty), enviamos un mensaje Markdown formateado elegante
        let textMessage = `╔═════════════════════════════════════════════════════╗\n`;
        textMessage += `║  🛡️ **AUDITORÍA DE TICKET (#${channelName}) — DEEPSEEK AI**\n`;
        textMessage += `╚═════════════════════════════════════════════════════╝\n\n`;
        textMessage += `📋 **Resumen del Caso**: *${auditRecord.summary}*\n\n`;
        textMessage += `🏆 **Soportes Recompensados (+1 Intervención)**:\n${rewardedList}\n\n`;

        if (ignoredList) {
          textMessage += `⚠️ **Sin Puntos (No aportaron solución)**:\n${ignoredList}\n\n`;
        }
        textMessage += `*Registrado en la suite de soporte.*`;

        postBody = { content: textMessage };
      }

      await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9261 Chrome/128.0.6613.186 Electron/32.2.7 Safari/537.36',
        },
        body: JSON.stringify(postBody),
      });
    } catch (postErr) {
      console.warn('No se pudo enviar el mensaje de confirmación a Discord:', postErr);
    }

    // 6. Notificar a la app
    this.callbacks.onAuditRecord?.(auditRecord);
    this.callbacks.onLog?.(
      `✔ Ticket #${channelName} auditado con éxito. Soportes premiados: ${auditRecord.rewarded_staff.length}`,
      'success'
    );

    return auditRecord;
  }

  /**
   * Permite probar una auditoría simulada sin necesidad de conectar a Discord
   */
  public async simulateAudit(
    channelName: string,
    transcript: string,
    config: TicketBotConfig
  ): Promise<TicketAuditRecord> {
    const evaluation = await evaluateTicketTranscript(
      config.deepseek_api_key,
      transcript,
      config.custom_prompt
    );

    const auditRecord: TicketAuditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channel_id: 'simulated-channel',
      channel_name: channelName,
      audited_at: new Date().toLocaleTimeString(),
      summary: evaluation.summary,
      rewarded_staff: evaluation.valid_supporters.map((s) => ({
        discord_id: '',
        username: s.username,
        contribution: s.contribution,
      })),
      ignored_staff: evaluation.ignored_participants,
    };

    this.callbacks.onAuditRecord?.(auditRecord);
    return auditRecord;
  }

  /**
   * Evalúa una transcripción capturada localmente (por ejemplo, con el atajo Win + Y)
   * Sin necesidad de tokens de Discord
   */
  public async auditCapturedTicket(
    channelName: string,
    transcript: string,
    config: TicketBotConfig
  ): Promise<TicketAuditRecord> {
    if (!config.deepseek_api_key?.trim()) {
      throw new Error('API Key de DeepSeek no configurada.');
    }

    this.callbacks.onLog?.(
      `Analizando conversación capturada de #${channelName} con DeepSeek AI...`,
      'info'
    );

    const evaluation = await evaluateTicketTranscript(
      config.deepseek_api_key,
      transcript,
      config.custom_prompt
    );

    const auditRecord: TicketAuditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channel_id: 'local-capture',
      channel_name: channelName,
      audited_at: new Date().toLocaleTimeString(),
      summary: evaluation.summary,
      rewarded_staff: evaluation.valid_supporters.map((s) => ({
        discord_id: s.discord_id || '',
        username: s.username,
        contribution: s.contribution,
      })),
      ignored_staff: evaluation.ignored_participants,
    };

    this.callbacks.onAuditRecord?.(auditRecord);
    this.callbacks.onLog?.(
      `✔ Ticket #${channelName} auditado por Win+Y. Soportes premiados: ${auditRecord.rewarded_staff.length}`,
      'success'
    );

    return auditRecord;
  }
}

export const discordTicketListener = new DiscordTicketListener();
