import { StaffRankItem, StaffMemberItem } from '../types';

export const DEFAULT_STAFF_RANKS: StaffRankItem[] = [
  {
    id: 'soporte_1',
    name: '『🔰』Soporte Nivel 1',
    is_support: true,
    is_high_staff: false,
    order: 1,
  },
  {
    id: 'soporte_2',
    name: '『🔰』Soporte Nivel 2',
    is_support: true,
    is_high_staff: false,
    order: 2,
  },
  {
    id: 'mod_pruebas',
    name: '『〽️』Moderador En Pruebas',
    is_support: false,
    is_high_staff: false,
    order: 3,
  },
  {
    id: 'mod',
    name: '『〽️』Moderador',
    is_support: false,
    is_high_staff: false,
    order: 4,
  },
  {
    id: 'super_mod',
    name: '『📗』Super Moderador',
    is_support: false,
    is_high_staff: false,
    order: 5,
  },
  {
    id: 'admin_pruebas',
    name: '『📕』Administrador En Pruebas',
    is_support: false,
    is_high_staff: false,
    order: 6,
  },
  {
    id: 'admin',
    name: '『📕』Administrador',
    is_support: false,
    is_high_staff: false,
    order: 7,
  },
  {
    id: 'admin_plus',
    name: '『📕』Administrador +',
    is_support: false,
    is_high_staff: false,
    order: 8,
  },
  {
    id: 'master_admin',
    name: '『🔮』Master Admin',
    is_support: false,
    is_high_staff: false,
    order: 9,
  },
  {
    id: 'superadmin_pruebas',
    name: '『💿』SuperAdmin En Pruebas',
    is_support: false,
    is_high_staff: true,
    order: 10,
  },
  {
    id: 'superadmin',
    name: '『💿』SuperAdmin',
    is_support: false,
    is_high_staff: true,
    order: 11,
  },
  {
    id: 'direccion',
    name: '『🌌』Dirección',
    is_support: false,
    is_high_staff: true,
    order: 12,
  },
];

export const DEFAULT_STAFF_MEMBERS: StaffMemberItem[] = [
  // 『🔰』Soporte Nivel 1
  { id: 's1-adrii', name: 'Adrii', rank_id: 'soporte_1', count: 0 },
  { id: 's1-assier', name: 'Assier', rank_id: 'soporte_1', count: 0 },
  { id: 's1-delaisla', name: 'Delaisla', rank_id: 'soporte_1', count: 0 },
  { id: 's1-donmarzo', name: 'DonMarzo', rank_id: 'soporte_1', count: 0 },
  { id: 's1-elnene', name: 'Elnene', rank_id: 'soporte_1', count: 0 },
  { id: 's1-elpingu', name: 'Elpingu', rank_id: 'soporte_1', count: 0 },
  { id: 's1-elrifeno', name: 'Elrifeño', rank_id: 'soporte_1', count: 0 },
  { id: 's1-jota', name: 'JOTA', rank_id: 'soporte_1', count: 0 },
  { id: 's1-jota5m', name: 'Jota5M', rank_id: 'soporte_1', count: 0 },
  { id: 's1-narco', name: 'Narco', rank_id: 'soporte_1', count: 0 },
  { id: 's1-tete', name: 'Tete', rank_id: 'soporte_1', count: 0 },

  // 『🔰』Soporte Nivel 2
  { id: 's2-adg', name: 'Adg', rank_id: 'soporte_2', count: 0 },
  { id: 's2-brayan', name: 'Brayan Santos', rank_id: 'soporte_2', count: 0 },
  { id: 's2-nano', name: 'Nano', rank_id: 'soporte_2', count: 0 },
  { id: 's2-nastronio', name: 'Nastronio', rank_id: 'soporte_2', count: 0 },
  { id: 's2-kfc', name: 'The KFC NIGGA', rank_id: 'soporte_2', count: 0 },

  // 『〽️』Moderador En Pruebas
  { id: 'mp-drako', name: 'Drako', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-elpeinacabras', name: 'ElPeinaCabras', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-fired', name: 'Fired', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-god', name: 'God', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-gregorio', name: 'Gregorio', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-happy', name: 'Happy', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-japo', name: 'Japo', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-joell', name: 'Joell', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-kaiser', name: 'Kaiser', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-nikola', name: 'Nikola_07', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-pablo', name: 'Pablo', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-raf', name: 'RaF', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-sergi', name: 'Sergi', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-tumba', name: 'Tumba', rank_id: 'mod_pruebas', count: 0 },
  { id: 'mp-vizar', name: 'Vizar', rank_id: 'mod_pruebas', count: 0 },

  // 『〽️』Moderador
  { id: 'm-imperium', name: 'Imperium', rank_id: 'mod', count: 0 },
  { id: 'm-jeree', name: 'Jeree', rank_id: 'mod', count: 0 },
  { id: 'm-phoenix', name: 'Phoenix', rank_id: 'mod', count: 0 },

  // 『📗』Super Moderador
  { id: 'sm-yeti', name: 'Yeti', rank_id: 'super_mod', count: 0 },

  // 『📕』Administrador En Pruebas
  { id: 'ap-28aalex', name: '28aalex', rank_id: 'admin_pruebas', count: 0 },
  { id: 'ap-moree', name: 'Moree', rank_id: 'admin_pruebas', count: 0 },
  { id: 'ap-raul', name: 'Raul', rank_id: 'admin_pruebas', count: 0 },
  { id: 'ap-valero', name: 'Valero', rank_id: 'admin_pruebas', count: 0 },

  // 『📕』Administrador
  { id: 'a-akktete', name: 'Akktete', rank_id: 'admin', count: 0 },
  { id: 'a-mtnzz', name: 'Mtnzz', rank_id: 'admin', count: 0 },

  // 『📕』Administrador +
  { id: 'aplus-raulito', name: 'Raulito', rank_id: 'admin_plus', count: 0 },

  // 『🔮』Master Admin
  { id: 'ma-locojan', name: 'Locojan', rank_id: 'master_admin', count: 0 },

  // 『💿』SuperAdmin En Pruebas
  { id: 'sap-king', name: 'King', rank_id: 'superadmin_pruebas', count: 0 },
  { id: 'sap-nikito', name: 'Nikito', rank_id: 'superadmin_pruebas', count: 0 },

  // 『💿』SuperAdmin
  { id: 'sa-antonio', name: 'Antonio', rank_id: 'superadmin', count: 0 },

  // 『🌌』Dirección
  { id: 'd-alvaropopess', name: 'Alvaropopess', rank_id: 'direccion', count: 0 },
  { id: 'd-andrearz', name: 'AndreaRZ', rank_id: 'direccion', count: 0 },
  { id: 'd-ttyeray', name: 'TTYeray', rank_id: 'direccion', count: 0 },
];

/**
 * Ordena una lista de miembros de forma estrictamente alfabética por su nombre.
 */
export function sortStaffAlphabetically(members: StaffMemberItem[]): StaffMemberItem[] {
  return [...members].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}

export interface TopPerformersResult {
  topSupports: StaffMemberItem[];
  topStaffIg: StaffMemberItem[];
}

/**
 * Calcula los soportes y staff IG más destacados según las reglas:
 * - Soportes: Solo rangos Nivel 1 y Nivel 2.
 * - Staff IG: Moderador En Pruebas en adelante.
 * - Si del 1º al 2º hay poca diferencia (1-2) pero ambos destacan frente al 3º, se pueden poner 2; si no, 1.
 */
export function calculateTopPerformers(
  ranks: StaffRankItem[],
  members: StaffMemberItem[],
  forceSupportCount?: 1 | 2,
  forceStaffIgCount?: 1 | 2
): TopPerformersResult {
  const rankMap = new Map(ranks.map((r) => [r.id, r]));

  // Separar soportes y staff IG con count > 0, ordenados de mayor a menor
  const activeSupports = members
    .filter((m) => rankMap.get(m.rank_id)?.is_support && m.count > 0)
    .sort((a, b) => b.count - a.count);

  const activeStaffIg = members
    .filter((m) => !rankMap.get(m.rank_id)?.is_support && m.count > 0)
    .sort((a, b) => b.count - a.count);

  const selectTops = (list: StaffMemberItem[], forced?: 1 | 2): StaffMemberItem[] => {
    if (list.length === 0) return [];
    if (list.length === 1) return [list[0]];

    if (forced === 1) return [list[0]];
    if (forced === 2) return [list[0], list[1]];

    const first = list[0];
    const second = list[1];
    const third = list[2];

    const diff1_2 = first.count - second.count;
    const diff2_3 = third ? second.count - third.count : second.count;

    // Si los dos primeros están muy juntos (diferencia <= 2) y sacan ventaja notable al 3º (>= 4), premiamos a ambos
    if (diff1_2 <= 2 && diff2_3 >= 4) {
      return [first, second];
    }

    return [first];
  };

  return {
    topSupports: selectTops(activeSupports, forceSupportCount),
    topStaffIg: selectTops(activeStaffIg, forceStaffIgCount),
  };
}

export type ShiftType = 'MAÑANA' | 'TARDE' | 'NOCHE';

/**
 * Detecta automáticamente el turno según la hora del sistema:
 * - 06:00 a 14:59 -> MAÑANA
 * - 15:00 a 21:59 -> TARDE
 * - 22:00 a 05:59 -> NOCHE
 */
export function getAutoDetectedShift(date: Date = new Date()): ShiftType {
  const hour = date.getHours();
  if (hour >= 6 && hour < 15) {
    return 'MAÑANA';
  }
  if (hour >= 15 && hour < 22) {
    return 'TARDE';
  }
  return 'NOCHE';
}

/**
 * Normaliza la etiqueta del turno en el formato Discord (*MAÑANA, *TARDE, *NOCHE)
 */
export function formatShiftLabel(rawShift?: string): string {
  if (!rawShift || !rawShift.trim()) {
    return `*${getAutoDetectedShift()}`;
  }
  const clean = rawShift.trim().toUpperCase();
  const stripped = clean.replace(/^\*+|\*+$/g, '');
  return `*${stripped || getAutoDetectedShift()}`;
}

/**
 * Genera la plantilla de resumen formateada para Discord.
 * - Omite miembros con 0 interacciones.
 * - Agrupa por rango en orden definido, ordenados alfabéticamente dentro de cada rango.
 * - Cabecera con turno automático (MAÑANA, TARDE, NOCHE).
 * - Añade menciones '@' solo a los miembros que no sean SuperAdmin hacia arriba.
 */
export function generateDiscordSummary(params: {
  date: string;
  code: string;
  ranks: StaffRankItem[];
  members: StaffMemberItem[];
  forceSupportCount?: 1 | 2;
  forceStaffIgCount?: 1 | 2;
}): string {
  const { date, code, ranks, members, forceSupportCount, forceStaffIgCount } = params;
  const rankMap = new Map(ranks.map((r) => [r.id, r]));

  const lines: string[] = [];

  // Cabecera oficial
  lines.push(`__**RESUMEN CONTEO DE TICKETS HISPANLIFERP - ${date} - ${formatShiftLabel(code)}**__`);
  lines.push('');

  // Iterar rangos en su orden correspondiente
  const sortedRanks = [...ranks].sort((a, b) => a.order - b.order);

  sortedRanks.forEach((rank) => {
    // Filtrar miembros de este rango con count > 0
    const rankMembers = members.filter((m) => m.rank_id === rank.id && m.count > 0);

    if (rankMembers.length > 0) {
      lines.push(`**${rank.name}**`);
      // Orden alfabético obligatorio
      const alphaMembers = sortStaffAlphabetically(rankMembers);
      alphaMembers.forEach((m) => {
        lines.push(`${m.name} → ${m.count}`);
      });
      lines.push('');
    }
  });

  // Cálculo de destacados
  const { topSupports, topStaffIg } = calculateTopPerformers(
    ranks,
    members,
    forceSupportCount,
    forceStaffIgCount
  );

  // Pie de reconocimientos para Soportes (siempre llevan '@' ya que son Nivel 1 o 2)
  if (topSupports.length > 0) {
    if (topSupports.length === 1) {
      lines.push(
        `Felicidades a @${topSupports[0].name} por ser el soporte que más tickets ha atendido.`
      );
    } else {
      lines.push(
        `Felicidades a @${topSupports[0].name} y @${topSupports[1].name} por ser los soportes que más tickets han atendido.`
      );
    }
  }

  // Pie de reconocimientos para Staff IG (Superadmin hacia arriba NUNCA llevan '@')
  if (topStaffIg.length > 0) {
    const formatStaffName = (m: StaffMemberItem): string => {
      const r = rankMap.get(m.rank_id);
      return r?.is_high_staff ? m.name : `@${m.name}`;
    };

    if (topStaffIg.length === 1) {
      lines.push(
        `Enhorabuena a ${formatStaffName(
          topStaffIg[0]
        )} por ser el STAFF-IG que más tickets ha ayudado a resolver.`
      );
    } else {
      lines.push(
        `Enhorabuena a ${formatStaffName(topStaffIg[0])} y ${formatStaffName(
          topStaffIg[1]
        )} por ser los STAFF-IG que más tickets han ayudado a resolver.`
      );
    }
  }

  return lines.join('\n').trim();
}
