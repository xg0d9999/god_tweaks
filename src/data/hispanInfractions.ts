export interface InfractionData {
  id: number;
  name: string;
  sin_reconocer: string;
  reconocida: string;
}

export interface ParsedPenalty {
  jail: number;
  ban_days: number;
  perma: boolean;
  ck: boolean;
  kick: boolean;
  aviso: boolean;
  consultar: boolean;
  revision: boolean;
  special?: string;
  note?: string;
  shortLabel: string;
  category: "consultar" | "perma" | "ban" | "jail" | "ck" | "special" | "kick" | "aviso" | "none";
}

export const HISPAN_INFRACTIONS: InfractionData[] = [
  { id: 1, name: "Abusa de bindeos", sin_reconocer: "15 Minutos de Jail", reconocida: "5 Minutos de Jail" },
  { id: 2, name: "Abusar de GP", sin_reconocer: "30 Minutos de Jail", reconocida: "15 Minutos de Jail" },
  { id: 3, name: "Abusar de un vacío legal de la normativa intencionalmente", sin_reconocer: "Consultar con un superior.", reconocida: "Consultar con un superior." },
  { id: 4, name: "Abuso de th", sin_reconocer: "60 minutos de jail", reconocida: "30 minutos de jail" },
  { id: 5, name: "Acumulación de sanciones (20)", sin_reconocer: "Consultar con un superior.", reconocida: "Consultar con un superior." },
  { id: 6, name: "Aprovecharse de menú de facción", sin_reconocer: "1 Dias de baneo", reconocida: "90 Minutos de Jail" },
  { id: 7, name: "BJ / BD", sin_reconocer: "15 Minutos de Jail", reconocida: "10 Minutos de Jail" },
  { id: 8, name: "Bug Abuse", sin_reconocer: "3 Dias de baneo", reconocida: "1 Dia de baneo (- depende del bug)" },
  { id: 9, name: "Corrupción", sin_reconocer: "Consultar con un superior.", reconocida: "Consultar con un superior." },
  { id: 10, name: "Cortar rol - GRAVE", sin_reconocer: "1 Dias de baneo", reconocida: "45 Minutos de Jail" },
  { id: 11, name: "Cortar rol - LEVE", sin_reconocer: "30 Minutos de Jail", reconocida: "15 Minutos de Jail" },
  { id: 12, name: "Desconectarse estando muerto", sin_reconocer: "1 Dia de baneo", reconocida: "30 Minutos de Jail" },
  { id: 13, name: "DM - GRAVE", sin_reconocer: "Baneo permanente", reconocida: "45 Minutos de Jail" },
  { id: 14, name: "DM - LEVE", sin_reconocer: "35 Minutos de Jail", reconocida: "15 Minutos de Jail" },
  { id: 15, name: "Duplicar ITEMS / ARMAS", sin_reconocer: "CK Admistrativo", reconocida: "CK Admistrativo" },
  { id: 16, name: "Evadir CK", sin_reconocer: "2 Dias de baneo", reconocida: "1 Dia de baneo" },
  { id: 17, name: "Evadir PKT", sin_reconocer: "1 Dias de baneo", reconocida: "60 Minutos de Jail" },
  { id: 18, name: "Evadir rol", sin_reconocer: "45 Minutos de Jail", reconocida: "25 Minutos de Jail" },
  { id: 19, name: "Evadir un reporte / sanción", sin_reconocer: "Baneo permanente", reconocida: "1 Dias de baneo" },
  { id: 20, name: "Falso rol", sin_reconocer: "40 Minutos de Jail", reconocida: "20 Minutos de Jail" },
  { id: 21, name: "Faltar a la normativa delictiva", sin_reconocer: "50 Minutos de Jail", reconocida: "30 Minutos de Jail" },
  { id: 22, name: "Faltar a la normativa general", sin_reconocer: "50 Minutos de Jail", reconocida: "30 Minutos de Jail" },
  { id: 23, name: "Faltar a la normativa policial", sin_reconocer: "50 Minutos de Jail", reconocida: "30 Minutos de Jail" },
  { id: 24, name: "Flood", sin_reconocer: "Depende la intensidad", reconocida: "1 Kick 2 Ban 1 dia" },
  { id: 25, name: "Forzar rol - GRAVE", sin_reconocer: "80 Minutos de Jail", reconocida: "40 Minutos de Jail" },
  { id: 26, name: "Forzar rol - LEVE", sin_reconocer: "40 Minutos de Jail", reconocida: "20 Minutos de Jail" },
  { id: 27, name: "Hablar estando muerto", sin_reconocer: "120 Minutos de Jail", reconocida: "60 Minutos de Jail" },
  { id: 28, name: "Hacer el infantil en soporte - reporte", sin_reconocer: "Baneo permanente", reconocida: "Baneo Permanente" },
  { id: 29, name: "Hacerte pasar que eres de una facción", sin_reconocer: "Baneo permanente", reconocida: "3 Dias de baneo" },
  { id: 30, name: "Hacker / Cheater", sin_reconocer: "Baneo permanente", reconocida: "Baneo Permanente" },
  { id: 31, name: "Incitar a incumplir las normativas / adm abuse", sin_reconocer: "7 Dias de baneo", reconocida: "4 Dias de baneo" },
  { id: 32, name: "Iniciar un rol agresivo en una Zona segura", sin_reconocer: "40 Minutos de Jail", reconocida: "20 Minutos de Jail" },
  { id: 33, name: "Insultos / Toxicidad OOC - GRAVE", sin_reconocer: "Baneo permanente", reconocida: "7 Dias de baneo" },
  { id: 34, name: "Insultos / Toxicidad OOC - LEVE", sin_reconocer: "2 Dias de baneo", reconocida: "1 Dia de baneo" },
  { id: 35, name: "Invadir rol", sin_reconocer: "30 Minutos de Jail", reconocida: "15 Minutos de Jail" },
  { id: 36, name: "Llevar casco antibalas", sin_reconocer: "Kick", reconocida: "(AVISO)" },
  { id: 37, name: "Llevar máscara en zona segura", sin_reconocer: "1 (AVISO /msg) al 3 aviso 5 Mins Jail", reconocida: "(AVISO)" },
  { id: 38, name: "Mal uso - nulo uso de /entorno", sin_reconocer: "35 Minutos de Jail", reconocida: "10 Minutos de Jail" },
  { id: 39, name: "Mal uso - nulo uso de /me y /do", sin_reconocer: "35 Minutos de Jail", reconocida: "10 Minutos de Jail" },
  { id: 40, name: "Mal uso del /ayuda o /twt o /anon", sin_reconocer: "25 Minutos de Jail", reconocida: "Avisar por MSG / KICK" },
  { id: 41, name: "Matar en jail", sin_reconocer: "1 Dias de baneo", reconocida: "10 Minutos de Jail" },
  { id: 42, name: "Mentir en reporte - soporte", sin_reconocer: "7 Dias de baneo", reconocida: "3 dias de baneo" },
  { id: 43, name: "MG - GRAVE", sin_reconocer: "5 Dias de baneo", reconocida: "1 Dias de baneo (depende como sea -)" },
  { id: 44, name: "MG - LEVE", sin_reconocer: "30 Minutos de Jail", reconocida: "15 Minutos de Jail" },
  { id: 45, name: "No respetar RDE - GRAVE", sin_reconocer: "1 Dias de baneo (depende como sea jail)", reconocida: "25 Minutos de Jail" },
  { id: 46, name: "No respetar RDE - LEVE", sin_reconocer: "35 Minutos de Jail", reconocida: "15 Minutos de Jail" },
  { id: 47, name: "No rolear choque", sin_reconocer: "15 Minutos de Jail", reconocida: "10 Minutos de Jail" },
  { id: 48, name: "No valorar vida", sin_reconocer: "45 Minutos de Jail", reconocida: "25 Minutos de Jail" },
  { id: 49, name: "Obligar a persona a sacar dinero del banco", sin_reconocer: "60 Minutos de Jail", reconocida: "30 Minutos de Jail" },
  { id: 50, name: "PG - GRAVE", sin_reconocer: "5 Dias de baneo", reconocida: "1 Dias de baneo" },
  { id: 51, name: "PG - LEVE", sin_reconocer: "25 Minutos de Jail", reconocida: "10 Minutos de Jail" },
  { id: 52, name: "Robar un vehículo de donador", sin_reconocer: "30 Minutos de Jail", reconocida: "15 Minutos de Jail" },
  { id: 53, name: "Robar un vehículo de una facción sin justificación", sin_reconocer: "60 Minutos de Jail", reconocida: "30 Minutos de Jail" },
  { id: 54, name: "Roles sexuales no consentidos", sin_reconocer: "Baneo permanente", reconocida: "Baneo permanente" },
  { id: 55, name: "Romper la economía", sin_reconocer: "Baneo permanente + CK Admistrativo", reconocida: "CK Admistrativo" },
  { id: 56, name: "Spam /entornos, /auxilio", sin_reconocer: "Kick", reconocida: "(AVISO)" },
  { id: 57, name: "Spam de cosas externas al servidor", sin_reconocer: "Baneo permanente", reconocida: "Baneo permanente" },
  { id: 58, name: "Tirar de e / f8 en mitad de rol", sin_reconocer: "1 Dia de baneo [Apelable a Jail]", reconocida: "1 Dia de baneo [Apelable a Jail]" },
  { id: 59, name: "Utilizar armas prohibidas", sin_reconocer: "1 Dia de baneo + Revision de armario.", reconocida: "60 Minutos de Jail + Revision de armario." },
  { id: 60, name: "Utilizar dinero de proveniencia de Hacker", sin_reconocer: "Baneo permanente + CK Adm", reconocida: "CK Adm" },
  { id: 61, name: "Utilizar trazers, kill efect o confeti", sin_reconocer: "1ro, Aviso 2do, Ban de 1 dia", reconocida: "(AVISO)" },
  { id: 62, name: "VDM - GRAVE", sin_reconocer: "5 Dias de baneo", reconocida: "60 Minutos de Jail" },
  { id: 63, name: "VDM - LEVE", sin_reconocer: "30 Minutos de Jail", reconocida: "15 Minutos de Jail" },
  { id: 64, name: "Violar EULA del servidor", sin_reconocer: "Baneo permanente", reconocida: "Baneo permanente" },
];

export function parsePenalty(rawText: string): ParsedPenalty {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  const res: ParsedPenalty = {
    jail: 0,
    ban_days: 0,
    perma: false,
    ck: false,
    kick: false,
    aviso: false,
    consultar: false,
    revision: false,
    shortLabel: "-",
    category: "none",
  };

  // Specific overrides according to PROMPT_REBUILD.md §2.1
  if (lower === "depende la intensidad") {
    res.special = "Depende de la intensidad";
    res.shortLabel = "Especial";
    res.category = "special";
    return res;
  }
  if (lower === "1 kick 2 ban 1 dia") {
    res.kick = true;
    res.special = "1er aviso: Kick / 2º: Ban 1 día";
    res.shortLabel = "Kick/Ban";
    res.category = "special";
    return res;
  }
  if (lower === "1 (aviso /msg) al 3 aviso 5 mins jail") {
    res.aviso = true;
    res.special = "1er y 2º aviso /msg; al 3º aviso → 5 min Jail";
    res.shortLabel = "Aviso/Jail";
    res.category = "special";
    return res;
  }
  if (lower === "avisar por msg / kick") {
    res.aviso = true;
    res.kick = true;
    res.special = "Avisar por MSG / Kick";
    res.shortLabel = "Aviso/Kick";
    res.category = "special";
    return res;
  }
  if (lower === "1ro, aviso 2do, ban de 1 dia") {
    res.aviso = true;
    res.special = "1er aviso / 2º: Ban 1 día";
    res.shortLabel = "Aviso/Ban";
    res.category = "special";
    return res;
  }

  // Notes
  if (lower.includes("(- depende del bug)")) res.note = "Depende del bug";
  else if (lower.includes("(depende como sea -)")) res.note = "Depende de la gravedad";
  else if (lower.includes("(depende como sea jail)")) res.note = "Depende: puede ser Jail";
  else if (lower.includes("[apelable a jail]")) res.note = "Apelable a Jail";

  // General checks
  if (lower.includes("consultar")) {
    res.consultar = true;
    res.shortLabel = "Consultar";
    res.category = "consultar";
    return res;
  }

  if (lower.includes("permanente")) {
    res.perma = true;
  }

  const banMatch = lower.match(/(\d+)\s*d[ií]as?\s*de\s*baneo/);
  if (banMatch) {
    res.ban_days = parseInt(banMatch[1], 10);
  }

  const jailMatch = lower.match(/(\d+)\s*(?:mins?\b|minutos?\b)/);
  if (jailMatch) {
    res.jail = parseInt(jailMatch[1], 10);
  }

  if (lower.includes("ck adm") || lower.includes("ck admistrativo")) {
    res.ck = true;
  }
  if (lower.includes("kick")) {
    res.kick = true;
  }
  if (lower.includes("aviso") || lower.includes("avisar")) {
    res.aviso = true;
  }
  if (lower.includes("revisi")) {
    res.revision = true;
  }

  // Short labels and categories
  if (res.perma && res.ck) {
    res.shortLabel = "PERMA+CK";
    res.category = "perma";
  } else if (res.perma) {
    res.shortLabel = "PERMA";
    res.category = "perma";
  } else if (res.ban_days > 0) {
    res.shortLabel = `${res.ban_days}d ban`;
    res.category = "ban";
  } else if (res.jail > 0) {
    res.shortLabel = `${res.jail} min`;
    res.category = "jail";
  } else if (res.ck) {
    res.shortLabel = "CK";
    res.category = "ck";
  } else if (res.kick) {
    res.shortLabel = "Kick";
    res.category = "kick";
  } else if (res.aviso) {
    res.shortLabel = "Aviso";
    res.category = "aviso";
  }

  if (res.revision) {
    res.shortLabel += " +R";
  }

  return res;
}

export interface SanctionCalculationResult {
  jail_minutes: number;
  ban_days: number;
  perma: boolean;
  dias_ban: number | null; // -1 for perma, null for no ban
  tipo: string;
  tipo_full: string;
  duracion: string;
  adicionales: string[];
  specials: string[];
  notes: string[];
  notas_extra: string[];
  motivoWithTag: string;
  motivoWithoutTag: string;
}

export function calculateSanction(
  selections: Record<number, "sin_reconocer" | "reconocida">,
  extraNote: string = ""
): SanctionCalculationResult {
  const selectedEntries = Object.entries(selections);
  if (selectedEntries.length === 0) {
    return {
      jail_minutes: 0,
      ban_days: 0,
      perma: false,
      dias_ban: null,
      tipo: "-",
      tipo_full: "-",
      duracion: "-",
      adicionales: [],
      specials: [],
      notes: [],
      notas_extra: [],
      motivoWithTag: "",
      motivoWithoutTag: "",
    };
  }

  let jail_total = 0;
  let ban_total = 0;
  let perma = false;
  let ck = false;
  let kick = false;
  let aviso = false;
  let consultar = false;
  let revision = false;

  const specials: string[] = [];
  const notes: string[] = [];
  const notas_extra: string[] = [];
  const motivoTags: string[] = [];
  const motivoNoTags: string[] = [];

  for (const [idStr, mode] of selectedEntries) {
    const id = parseInt(idStr, 10);
    const item = HISPAN_INFRACTIONS.find((inf) => inf.id === id);
    if (!item) continue;

    const raw = mode === "sin_reconocer" ? item.sin_reconocer : item.reconocida;
    const parsed = parsePenalty(raw);

    jail_total += parsed.jail;
    ban_total += parsed.ban_days;
    if (parsed.perma) perma = true;
    if (parsed.ck) ck = true;
    if (parsed.kick) kick = true;
    if (parsed.aviso) aviso = true;
    if (parsed.consultar) consultar = true;
    if (parsed.revision) revision = true;

    if (parsed.special) specials.push(`${item.name}: ${parsed.special}`);
    if (parsed.note) notes.push(`${item.name}: ${parsed.note}`);

    // Motivo name overrides
    const displayName = item.name === "Hacker / Cheater" ? "Cheater" : item.name;
    const tag = mode === "reconocida" ? "reconocida" : "no reconocida";

    motivoTags.push(`${displayName} (${tag})`);
    motivoNoTags.push(displayName);
  }

  // Precedence for principal result according to PROMPT_REBUILD.md §3
  let tipo = "-";
  let duracion = "-";
  let dias_ban: number | null = null;

  if (perma) {
    tipo = "Baneo";
    duracion = "Permanente";
    dias_ban = -1;
  } else if (ban_total > 0) {
    tipo = "Baneo";
    duracion = `${ban_total} día(s)`;
    dias_ban = ban_total;
  } else if (jail_total > 0) {
    tipo = "Jail";
    duracion = `${jail_total} minuto(s)`;
    dias_ban = null;
  } else if (ck) {
    tipo = "CK Administrativo";
    duracion = "CK Administrativo";
  } else if (kick) {
    tipo = "Kick";
    duracion = "Kick";
  } else if (aviso) {
    tipo = "Aviso";
    duracion = "Aviso";
  } else if (consultar) {
    tipo = "Consultar con un superior";
    duracion = "Consultar con un superior";
  } else if (specials.length > 0) {
    tipo = "Especial";
    duracion = "-";
  }

  // Additionals
  const adicionales: string[] = [];
  if (ck && tipo !== "CK Administrativo") adicionales.push("CK Administrativo");
  if (revision) adicionales.push("Revisión de armario");
  if (kick && tipo !== "Kick") adicionales.push("Kick");
  if (aviso && tipo !== "Aviso") adicionales.push("Aviso");
  if (consultar && tipo !== "Consultar con un superior") adicionales.push("Consultar con un superior");

  let tipo_full = tipo;
  if (adicionales.length > 0) {
    tipo_full = tipo === "-" ? adicionales.join(" + ") : `${tipo} + ${adicionales.join(" + ")}`;
  }

  // Discarded jail notice
  if ((perma || ban_total > 0) && jail_total > 0) {
    notas_extra.push(`Jail de ${jail_total} minutos descartado (prevalece el baneo)`);
  }

  let finalMotivoTags = motivoTags.join(" + ");
  let finalMotivoNoTags = motivoNoTags.join(" + ");

  if (extraNote.trim()) {
    finalMotivoTags += ` | ${extraNote.trim()}`;
    finalMotivoNoTags += ` | ${extraNote.trim()}`;
  }

  return {
    jail_minutes: jail_total,
    ban_days: ban_total,
    perma,
    dias_ban,
    tipo,
    tipo_full,
    duracion,
    adicionales,
    specials,
    notes,
    notas_extra,
    motivoWithTag: finalMotivoTags,
    motivoWithoutTag: finalMotivoNoTags,
  };
}
