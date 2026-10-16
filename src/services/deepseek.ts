export interface DeepSeekAuditResult {
  ticket_resolved: boolean;
  valid_supporters: {
    discord_id?: string;
    username: string;
    contribution: string;
  }[];
  ignored_participants: {
    username: string;
    reason: string;
  }[];
  summary: string;
}

export async function evaluateTicketTranscript(
  apiKey: string,
  transcript: string,
  customPrompt?: string
): Promise<DeepSeekAuditResult> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('No se ha configurado la API Key de DeepSeek.');
  }

  const systemInstructions =
    customPrompt?.trim() ||
    `Eres un auditor imparcial y estricto de soporte técnico en Discord para servidores de gaming y comunidades eSports.
Tu tarea es analizar el historial de mensajes de un ticket de soporte y determinar con total objetividad cuáles miembros del equipo de soporte (staff) realmente aportaron una SOLUCIÓN REAL O AYUDA GENUINA al usuario que pidió ayuda.

REGLAS ESTRICTAS DE EVALUACIÓN:
1. NO recompenses a miembros que únicamente dijeron saludos, confirmaciones vacías ("hola", "ya voy", "buenas", "espera un momento", "revisa"), emojis, reacciones o mensajes de charla sin aportar nada a la resolución.
2. RECOMPENSA ÚNICAMENTE a miembros que investigaron el problema, dieron instrucciones técnicas claras, ejecutaron comandos de soporte, solicitaron información clave relevante o resolvieron la incidencia.
3. No recompenses al usuario que abrió el ticket (el usuario afectado que busca ayuda).
4. Si varios miembros de soporte colaboraron activamente con soluciones reales, incluye a cada uno de ellos.
5. Devuelve EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura, sin texto previo ni posterior:

{
  "ticket_resolved": true,
  "valid_supporters": [
    {
      "username": "NombreDelStaff",
      "contribution": "Explicación breve de la ayuda técnica real que brindó."
    }
  ],
  "ignored_participants": [
    {
      "username": "NombreDelStaffIgnorado",
      "reason": "Motivo por el que no suma punto (ej: solo saludó o no aportó solución)."
    }
  ],
  "summary": "Resumen en una frase del problema y cómo se solventó."
}`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cleanKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemInstructions },
        {
          role: 'user',
          content: `Historial de la conversación del ticket de soporte para auditar:\n\n${transcript}`,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error DeepSeek API (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content?.trim();

  if (!rawContent) {
    throw new Error('DeepSeek no devolvió contenido en la respuesta.');
  }

  // Limpiar posibles bloques ```json ... ```
  const cleanJson = rawContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/, '')
    .trim();

  try {
    const parsed: DeepSeekAuditResult = JSON.parse(cleanJson);
    return {
      ticket_resolved: Boolean(parsed.ticket_resolved),
      valid_supporters: Array.isArray(parsed.valid_supporters) ? parsed.valid_supporters : [],
      ignored_participants: Array.isArray(parsed.ignored_participants) ? parsed.ignored_participants : [],
      summary: parsed.summary || 'Ticket evaluado por DeepSeek AI.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`No se pudo parsear la respuesta JSON de DeepSeek: ${message}`);
  }
}
