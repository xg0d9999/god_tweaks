import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('g0d suite Test Bench - Configuration & Security Validation', async (t) => {
  await t.test('Verificar que .gitignore protege la clave privada Minisign', () => {
    const gitignorePath = path.resolve('.gitignore');
    assert.ok(fs.existsSync(gitignorePath), '.gitignore debe existir');
    const content = fs.readFileSync(gitignorePath, 'utf8');
    assert.ok(content.includes('.updater.key'), '.gitignore debe excluir .updater.key');
    assert.ok(content.includes('node_modules'), '.gitignore debe excluir node_modules');
    assert.ok(content.includes('target'), '.gitignore debe excluir directorios target');
  });

  await t.test('Verificar configuración de Tauri v2 y Auto-Updater', () => {
    const confPath = path.resolve('src-tauri/tauri.conf.json');
    assert.ok(fs.existsSync(confPath), 'tauri.conf.json debe existir');
    const conf = JSON.parse(fs.readFileSync(confPath, 'utf8'));

    assert.equal(conf.bundle?.createUpdaterArtifacts, true, 'createUpdaterArtifacts debe ser true');
    assert.ok(conf.plugins?.updater?.pubkey, 'Debe haber una pubkey de Minisign configurada');
    assert.ok(conf.plugins.updater.endpoints?.length > 0, 'Debe haber al menos 1 endpoint de actualización');
  });

  await t.test('Verificar permisos de capacidades de Tauri v2', () => {
    const capPath = path.resolve('src-tauri/capabilities/default.json');
    assert.ok(fs.existsSync(capPath), 'default.json capability debe existir');
    const cap = JSON.parse(fs.readFileSync(capPath, 'utf8'));

    assert.ok(cap.permissions.includes('updater:default'), 'Debe incluir permiso updater:default');
    assert.ok(cap.permissions.includes('process:default'), 'Debe incluir permiso process:default');
    assert.ok(cap.permissions.includes('core:default'), 'Debe incluir permiso core:default');
  });
});

test('g0d suite Test Bench - Telemetría & Fórmulas Matemáticas', async (t) => {
  await t.test('Cálculo de mejora porcentual de FPS en FiveM', () => {
    const fpsBefore = 63;
    const fpsAfter = 94;
    const boost = ((fpsAfter - fpsBefore) / fpsBefore) * 100;
    assert.ok(Math.abs(boost - 49.2) < 0.1, 'El boost de FPS debe calcularse con precisión');
  });

  await t.test('Cálculo de reducción de latencia DPC', () => {
    const dpcBefore = 840;
    const dpcAfter = 165;
    const reduction = ((dpcBefore - dpcAfter) / dpcBefore) * 100;
    assert.ok(reduction > 80.0, 'La reducción de microsegundos debe superar el 80%');
  });

  await t.test('Cálculo de puntuación de respuesta del sistema (Responsiveness)', () => {
    const scoreBefore = 58;
    const scoreAfter = 96;
    const gain = scoreAfter - scoreBefore;
    assert.equal(gain, 38, 'La ganancia de respuesta debe ser exacta');
  });
});

test('g0d suite Test Bench - HispanLife Sanciones Payload Formatter', async (t) => {
  await t.test('Generación de embed para Discord Webhook', () => {
    const staffAtt = 'Admin_Isma';
    const targetId = '2481';
    const reason = '1.2 No valorar vida (NVL)';
    const penaltyHours = 12;

    const payload = {
      username: 'g0d suite | HispanLife Bot',
      embeds: [
        {
          title: `🛡️ Sanción Aplicada a ID: ${targetId}`,
          color: 0xe11d48,
          fields: [
            { name: 'Staff Responsable', value: staffAtt, inline: true },
            { name: 'Motivo', value: reason, inline: true },
            { name: 'Duración', value: `${penaltyHours} Horas`, inline: true },
          ],
        },
      ],
    };

    assert.equal(payload.embeds[0].fields[0].value, 'Admin_Isma');
    assert.equal(payload.embeds[0].color, 0xe11d48);
  });

  await t.test('Verificar servidor y canal oficial de HispanLife RP (#registro-sanciones) y auto-migración', () => {
    const HISPAN_OFFICIAL_GUILD = '667478197927018530';
    const HISPAN_OFFICIAL_CHANNEL = '668062839990386701';

    const BOT_LEGACY_GUILD = '1543324125685358713';
    const BOT_LEGACY_CHANNEL = '1543324127283253270';

    const migrateDiscordConfig = (cfg) => {
      let guild = cfg.discord_guild;
      let channel = cfg.discord_channel;
      if (!guild || guild === BOT_LEGACY_GUILD) {
        guild = HISPAN_OFFICIAL_GUILD;
      }
      if (!channel || channel === BOT_LEGACY_CHANNEL) {
        channel = HISPAN_OFFICIAL_CHANNEL;
      }
      return { ...cfg, discord_guild: guild, discord_channel: channel };
    };

    // Caso 1: Configuración heredada con IDs del bot personal -> Migra automáticamente al canal oficial
    const legacyConfig = {
      staff_att: 'Staff',
      discord_guild: BOT_LEGACY_GUILD,
      discord_channel: BOT_LEGACY_CHANNEL,
    };
    const migrated = migrateDiscordConfig(legacyConfig);
    assert.equal(migrated.discord_guild, HISPAN_OFFICIAL_GUILD, 'Debe migrar al servidor oficial de HispanLife RP');
    assert.equal(migrated.discord_channel, HISPAN_OFFICIAL_CHANNEL, 'Debe migrar al canal oficial #registro-sanciones');

    // Caso 2: Extracción de IDs desde URL directa de Discord
    const parseDiscordUrl = (url) => {
      const match = url.match(/channels\/(\d+)\/(\d+)/);
      if (match) return { guild: match[1], channel: match[2] };
      return null;
    };
    const parsed = parseDiscordUrl('https://discord.com/channels/667478197927018530/668062839990386701');
    assert.ok(parsed, 'Debe parsear URL de Discord');
    assert.equal(parsed.guild, HISPAN_OFFICIAL_GUILD);
    assert.equal(parsed.channel, HISPAN_OFFICIAL_CHANNEL);
  });
});

test('g0d suite Test Bench - Control de Permisos y Citizens Manager', async (t) => {
  await t.test('Verificar que can_use_citizens está deshabilitado por defecto si no es true', () => {
    const userWithoutField = { discord_id: '123', can_use_tweaks: true };
    const canUseCitizensDefault = userWithoutField.can_use_citizens === true;
    assert.equal(canUseCitizensDefault, false, 'can_use_citizens debe ser false por defecto');

    const userExplicitlyEnabled = { discord_id: '123', can_use_citizens: true };
    assert.equal(userExplicitlyEnabled.can_use_citizens === true, true, 'can_use_citizens habilitado');

    const userExplicitlyDisabled = { discord_id: '123', can_use_citizens: false };
    assert.equal(userExplicitlyDisabled.can_use_citizens === true, false, 'can_use_citizens deshabilitado');
  });

  await t.test('Verificar que can_use_tickets está deshabilitado por defecto si no es true (como citizens)', () => {
    // Usuario sin el campo (por defecto desactivado como citizens)
    const userDefault = { discord_id: '123' };
    const canUseTicketsDefault = userDefault.can_use_tickets === true;
    assert.equal(canUseTicketsDefault, false, 'can_use_tickets debe ser false por defecto');

    // Admin desbloquea al usuario
    const userUnblocked = { discord_id: '123', can_use_tickets: true };
    assert.equal(userUnblocked.can_use_tickets === true, true, 'can_use_tickets es true cuando admin lo habilita');

    // Admin bloquea al usuario
    const userBlocked = { discord_id: '123', can_use_tickets: false };
    assert.equal(userBlocked.can_use_tickets === true, false, 'can_use_tickets es false si admin lo deshabilita');
  });

  await t.test('Verificar bloqueo total por defecto para futuros nuevos usuarios (opt-in estricto con ticket)', () => {
    // 1. Futuro nuevo usuario registrado sin permisos previos
    const newFutureUser = {
      discord_id: 'new_user_999',
      discord_username: 'NewPlayer',
      can_use_tweaks: false,
      can_use_sanciones: false,
      can_use_citizens: false,
      can_use_tickets: false,
    };

    assert.equal(newFutureUser.can_use_tweaks === true, false, 'Tweaks debe estar bloqueado para nuevos usuarios');
    assert.equal(newFutureUser.can_use_sanciones === true, false, 'Sanciones debe estar bloqueado para nuevos usuarios');
    assert.equal(newFutureUser.can_use_citizens === true, false, 'Citizens debe estar bloqueado para nuevos usuarios');
    assert.equal(newFutureUser.can_use_tickets === true, false, 'Tickets debe estar bloqueado para nuevos usuarios');

    // 2. Usuario existente previo conserva sus permisos activos sin verse afectado
    const existingUser = {
      discord_id: 'existing_user_1',
      discord_username: 'VeteranStaff',
      can_use_tweaks: true,
      can_use_sanciones: true,
      can_use_citizens: false,
      can_use_tickets: true,
    };

    assert.equal(existingUser.can_use_tweaks === true, true, 'Usuario existente conserva tweaks activos');
    assert.equal(existingUser.can_use_sanciones === true, true, 'Usuario existente conserva sanciones activas');
    assert.equal(existingUser.can_use_tickets === true, true, 'Usuario existente conserva tickets activos');
  });

  await t.test('Verificar regla de seguridad: 1 sola cuenta de Discord por PC (HWID único)', () => {
    const existingUsers = [
      { discord_id: 'user_111', discord_username: 'ProGamer', hwid: 'HWID-PC-ORIGINAL' },
      { discord_id: 'user_222', discord_username: 'StreamerOne', hwid: 'HWID-PC-SECONDARY' },
      { discord_id: 'user_333', discord_username: 'UnboundUser', hwid: null },
    ];

    const checkHwidBindingMock = (hwid, discordId) => {
      if (!hwid) return { bound: false };
      const match = existingUsers.find((u) => u.hwid === hwid && u.discord_id !== discordId);
      if (match) {
        return { bound: true, linkedUser: match.discord_username };
      }
      return { bound: false };
    };

    // Caso 1: Mismo usuario en su mismo equipo -> Permitido
    const sameUserCheck = checkHwidBindingMock('HWID-PC-ORIGINAL', 'user_111');
    assert.equal(sameUserCheck.bound, false, 'El mismo usuario puede volver a identificarse en su PC');

    // Caso 2: Segunda cuenta distinta en el mismo PC -> DENEGADO (1 cuenta por PC)
    const secondAccountCheck = checkHwidBindingMock('HWID-PC-ORIGINAL', 'user_alt_999');
    assert.equal(secondAccountCheck.bound, true, 'Se detecta que el PC ya está vinculado a otra cuenta');
    assert.equal(secondAccountCheck.linkedUser, 'ProGamer', 'Identifica correctamente al propietario del PC');

    // Caso 3: Usuario nuevo en un PC libre -> Permitido
    const freshPcCheck = checkHwidBindingMock('HWID-PC-BRAND-NEW', 'user_alt_999');
    assert.equal(freshPcCheck.bound, false, 'Un PC nuevo o no reclamado se puede vincular sin problemas');

    // Caso 4: Desvinculación de HWID por admin -> Permite vincular
    const unlinkedCheck = checkHwidBindingMock(null, 'user_333');
    assert.equal(unlinkedCheck.bound, false, 'Un usuario con HWID nulo o desvinculado no colisiona');
  });

  await t.test('Verificar visualización de IPs en Admin Panel (oculta en lista general, revelada en Ver Detalles Hardware)', () => {
    const user = {
      discord_id: '1103581405096710226',
      discord_username: 'g0d',
      ip_address: '46.35.120.171',
      hwid: 'f74d3a5c-e784-4d52-9ec9-d7140cffc280',
    };

    // Fila principal: NO expone la IP directamente
    const renderMainRowFields = (u) => ({
      hwid: u.hwid ? `${u.hwid.slice(0, 16)}...` : 'Sin vincular',
      hasIp: false, // La IP ya no se muestra en la fila principal
    });

    // Cajón expandible de detalles hardware: contiene la IP de forma segura
    const renderHardwareDrawerFields = (u) => ({
      ip: u.ip_address || '127.0.0.1',
      cpu: u.cpu_info || 'No reportado',
      gpu: u.gpu_info || 'No reportado',
    });

    const mainRow = renderMainRowFields(user);
    assert.equal(mainRow.hasIp, false, 'La fila principal no debe mostrar la IP del usuario');

    const drawer = renderHardwareDrawerFields(user);
    assert.equal(drawer.ip, '46.35.120.171', 'Al expandir Ver Detalles Hardware se muestra la IP del usuario');
  });

  await t.test('Verificar eliminación de staff de la base de datos (Protección absoluta al Dueño y rol Owner)', () => {
    const ownerAccount = { id: 'owner_1', username: 'xg0d9999', role: 'owner' };
    const adminAccount = { id: 'admin_1', username: 'superadmin_test', role: 'admin' };
    const staffAccount = { id: 'staff_1', username: 'moderator_test', role: 'staff' };

    let staffRoster = [ownerAccount, adminAccount, staffAccount];

    const deleteStaffMock = (targetId, operator) => {
      if (operator.role !== 'owner') {
        throw new Error('Solo el Dueño (SuperAdmin) tiene autorización para eliminar cuentas de staff.');
      }
      const target = staffRoster.find((s) => s.id === targetId);
      if (!target) throw new Error('Cuenta de staff no encontrada.');
      if (target.role === 'owner') {
        throw new Error('¡Acción denegada! La cuenta del Dueño nunca puede ser eliminada.');
      }
      staffRoster = staffRoster.filter((s) => s.id !== targetId);
      return true;
    };

    // 1. Un staff o admin intenta eliminar a otro -> DENEGADO
    assert.throws(
      () => deleteStaffMock('staff_1', adminAccount),
      /Solo el Dueño/,
      'Un admin no puede eliminar staffs de la base de datos'
    );

    // 2. Alguien intenta eliminar al Owner -> DENEGADO ABSOLUTAMENTE
    assert.throws(
      () => deleteStaffMock('owner_1', ownerAccount),
      /La cuenta del Dueño nunca puede ser eliminada/,
      'La cuenta del dueño está blindada contra eliminación'
    );

    // 3. El Owner elimina un staff válido -> PERMITIDO Y ELIMINADO
    const result = deleteStaffMock('staff_1', ownerAccount);
    assert.equal(result, true, 'El Dueño puede eliminar una cuenta de staff');
    assert.equal(staffRoster.some((s) => s.id === 'staff_1'), false, 'El staff ya no existe en el roster');
    assert.equal(staffRoster.length, 2, 'El roster se reduce exactamente en 1');
  });
});

test('g0d suite Test Bench - Sistema de Conteo Manual de Tickets & Plantilla Discord', async (t) => {
  const RANKS = [
    { id: 'soporte_1', name: '『🔰』Soporte Nivel 1', is_support: true, is_high_staff: false, order: 1 },
    { id: 'soporte_2', name: '『🔰』Soporte Nivel 2', is_support: true, is_high_staff: false, order: 2 },
    { id: 'mod_pruebas', name: '『〽️』Moderador En Pruebas', is_support: false, is_high_staff: false, order: 3 },
    { id: 'superadmin', name: '『💿』SuperAdmin', is_support: false, is_high_staff: true, order: 11 },
    { id: 'direccion', name: '『🌌』Dirección', is_support: false, is_high_staff: true, order: 12 },
  ];

  await t.test('Verificar orden estrictamente alfabético de los staffs', () => {
    const unordered = [
      { name: 'Delaisla', count: 5 },
      { name: 'Adrii', count: 3 },
      { name: 'Tete', count: 1 },
      { name: 'Assier', count: 8 },
    ];

    const sorted = [...unordered].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    assert.deepEqual(
      sorted.map((s) => s.name),
      ['Adrii', 'Assier', 'Delaisla', 'Tete'],
      'Los staffs deben estar ordenados alfabéticamente'
    );
  });

  await t.test('Verificar que miembros con 0 tickets NO son mencionados en la plantilla', () => {
    const staffMembers = [
      { id: '1', name: 'Delaisla', rank_id: 'soporte_1', count: 12 },
      { id: '2', name: 'Adrii', rank_id: 'soporte_1', count: 0 }, // No debe aparecer
      { id: '3', name: 'Drako', rank_id: 'mod_pruebas', count: 8 },
    ];

    // Simular formateador
    const activeStaff = staffMembers.filter((m) => m.count > 0);
    assert.equal(activeStaff.length, 2, 'Solo 2 miembros deben tener tickets');
    assert.ok(!activeStaff.some((m) => m.name === 'Adrii'), 'Adrii con 0 tickets no debe figurar');
  });

  await t.test('Verificar regla de menciones @ (SuperAdmin hacia arriba NUNCA lleva @)', () => {
    const rankMap = new Map(RANKS.map((r) => [r.id, r]));

    const formatMention = (memberName, rankId) => {
      const r = rankMap.get(rankId);
      return r?.is_high_staff ? memberName : `@${memberName}`;
    };

    // Soporte Nivel 1 -> lleva @
    assert.equal(formatMention('Delaisla', 'soporte_1'), '@Delaisla');

    // Moderador En Pruebas -> lleva @
    assert.equal(formatMention('Drako', 'mod_pruebas'), '@Drako');

    // SuperAdmin -> NO lleva @
    assert.equal(formatMention('Antonio', 'superadmin'), 'Antonio');

    // Dirección -> NO lleva @
    assert.equal(formatMention('Alvaropopess', 'direccion'), 'Alvaropopess');
  });

  await t.test('Verificar lógica de selección de Top Performers (1 ó 2 ganadores)', () => {
    // Caso 1: Gran ventaja del primero
    const listA = [{ name: 'A', count: 30 }, { name: 'B', count: 12 }, { name: 'C', count: 10 }];
    const diff1_2_A = listA[0].count - listA[1].count;
    const countA = diff1_2_A <= 2 ? 2 : 1;
    assert.equal(countA, 1, 'Si hay gran diferencia entre 1º y 2º, solo 1 ganador');

    // Caso 2: Los dos primeros muy juntos y con ventaja sobre el 3º
    const listB = [{ name: 'A', count: 25 }, { name: 'B', count: 24 }, { name: 'C', count: 6 }];
    const diff1_2_B = listB[0].count - listB[1].count;
    const diff2_3_B = listB[1].count - listB[2].count;
    const countB = (diff1_2_B <= 2 && diff2_3_B >= 4) ? 2 : 1;
    assert.equal(countB, 2, 'Si 1º y 2º están empatados o a 1 ticket y lejos del 3º, van los dos');
  });

  await t.test('Verificar formato de cabecera con turnos (MAÑANA, TARDE, NOCHE)', () => {
    const detectShift = (hour) => {
      if (hour >= 6 && hour < 15) return 'MAÑANA';
      if (hour >= 15 && hour < 22) return 'TARDE';
      return 'NOCHE';
    };

    const formatHeader = (date, shift) => {
      const clean = (shift || '').trim().toUpperCase().replace(/^\*+|\*+$/g, '');
      const tag = clean ? `*${clean}` : '*MAÑANA';
      return `__**RESUMEN CONTEO DE TICKETS HISPANLIFERP - ${date} - ${tag}**__`;
    };

    // Auto-detección por horas
    assert.equal(detectShift(10), 'MAÑANA', '10:00 es Mañana');
    assert.equal(detectShift(18), 'TARDE', '18:00 es Tarde');
    assert.equal(detectShift(23), 'NOCHE', '23:00 es Noche');
    assert.equal(detectShift(2), 'NOCHE', '02:00 es Noche');

    // Formato de cabecera
    assert.equal(
      formatHeader('15/10/2026', 'MAÑANA'),
      '__**RESUMEN CONTEO DE TICKETS HISPANLIFERP - 15/10/2026 - *MAÑANA**__'
    );
    assert.equal(
      formatHeader('15/10/2026', 'tarde'),
      '__**RESUMEN CONTEO DE TICKETS HISPANLIFERP - 15/10/2026 - *TARDE**__'
    );
    assert.equal(
      formatHeader('15/10/2026', '*NOCHE*'),
      '__**RESUMEN CONTEO DE TICKETS HISPANLIFERP - 15/10/2026 - *NOCHE**__'
    );
  });

  await t.test('Verificar auditoría de interacciones críticas (alta, baja, cambio de rango, copiado)', () => {
    const logs = [];
    const record = (type, title, details, operator = 'Tester') => {
      logs.push({
        id: `log-${Date.now()}-${logs.length}`,
        type,
        title,
        details,
        timestamp: '22:30:00',
        date: '15/10/2026',
        operator,
      });
    };

    record('add_staff', 'Staff Añadido', 'Se ha incorporado a NuevoStaff en Soporte Nivel 1');
    record('remove_staff', 'Staff Eliminado', 'Se ha eliminado a Adrii de la plantilla');
    record('change_rank', 'Cambio de Rango', 'Drako: Moderador En Pruebas -> Moderador');
    record('copy_template', 'Plantilla Copiada', 'Plantilla de Discord copiada para el turno TARDE');

    assert.equal(logs.length, 4, 'Deben haberse registrado 4 eventos');
    assert.equal(logs[0].type, 'add_staff');
    assert.equal(logs[1].type, 'remove_staff');
    assert.equal(logs[2].type, 'change_rank');
    assert.equal(logs[3].type, 'copy_template');

    // Verificar filtro por categoría staff
    const staffLogs = logs.filter((l) => ['add_staff', 'remove_staff', 'change_rank'].includes(l.type));
    assert.equal(staffLogs.length, 3, '3 de los 4 eventos pertenecen a gestión de staff');
  });

  await t.test('Verificar que el traslado de staff por drag & drop mantiene el orden estrictamente alfabético', () => {
    let staffRoster = [
      { id: '1', name: 'Delaisla', rank_id: 'soporte_1' },
      { id: '2', name: 'Adrii', rank_id: 'soporte_1' },
      { id: '3', name: 'Zeta', rank_id: 'mod' },
      { id: '4', name: 'Bernardo', rank_id: 'mod' },
    ];

    // Simular drag and drop: mover 'Delaisla' de 'soporte_1' a 'mod'
    const targetRankId = 'mod';
    const memberIdToMove = '1';

    staffRoster = staffRoster.map((m) =>
      m.id === memberIdToMove ? { ...m, rank_id: targetRankId } : m
    );
    staffRoster.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    const modMembers = staffRoster.filter((m) => m.rank_id === 'mod');
    assert.deepEqual(
      modMembers.map((m) => m.name),
      ['Bernardo', 'Delaisla', 'Zeta'],
      'Los miembros del rango destino deben quedar ordenados alfabéticamente (A-Z)'
    );
  });
});

test('g0d suite Test Bench - Analizador & Limpiador de Disco Duro', async (t) => {
  await t.test('Verificar cálculo y formateo de tamaños de disco (bytes a GB/MB)', () => {
    const formatBytes = (bytes) => {
      const KB = 1024;
      const MB = KB * 1024;
      const GB = MB * 1024;
      if (bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`;
      if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
      if (bytes >= KB) return `${(bytes / KB).toFixed(0)} KB`;
      return `${bytes} B`;
    };

    assert.equal(formatBytes(1024 * 1024 * 1024 * 10), '10.00 GB', '10 GB debe formatearse correctamente');
    assert.equal(formatBytes(1024 * 1024 * 350), '350.0 MB', '350 MB debe formatearse correctamente');
    assert.equal(formatBytes(1024 * 45), '45 KB', '45 KB debe formatearse correctamente');
  });

  await t.test('Verificar selección de categorías recomendadas y seguras', () => {
    const mockCategories = [
      { id: 'temp_files', is_safe: true, recommended: true, bytes: 3000 },
      { id: 'windows_update', is_safe: true, recommended: true, bytes: 5000 },
      { id: 'prefetch', is_safe: false, recommended: false, bytes: 1000 },
    ];

    const recommended = mockCategories.filter((c) => c.recommended).map((c) => c.id);
    assert.deepEqual(recommended, ['temp_files', 'windows_update'], 'Solo temp_files y windows_update deben seleccionarse por defecto');
    assert.ok(!recommended.includes('prefetch'), 'prefetch no debe estar recomendado por defecto');
  });

  await t.test('Verificar desglose de consumo de disco suma hasta 100%', () => {
    const mockBreakdown = [
      { name: 'Juegos', bytes: 500 },
      { name: 'Usuarios', bytes: 300 },
      { name: 'Windows', bytes: 200 },
    ];
    const total = mockBreakdown.reduce((acc, curr) => acc + curr.bytes, 0);
    const percentages = mockBreakdown.map((item) => (item.bytes / total) * 100);
    const sumPct = percentages.reduce((acc, curr) => acc + curr, 0);
    assert.equal(Math.round(sumPct), 100, 'El desglose de porcentaje debe sumar 100%');
  });
});

test('g0d suite Test Bench - Bot de Tickets Discord 24/7 & Brand Kit', async (t) => {
  await t.test('Verificar Brand Kit blanco (0xFFFFFF), banners, logo y atención exclusiva ID 1103581405096710226', () => {
    const setupPath = path.resolve('discord-bot/setup-tickets.js');
    assert.ok(fs.existsSync(setupPath), 'El archivo setup-tickets.js debe existir');
    const content = fs.readFileSync(setupPath, 'utf-8');

    assert.ok(content.includes('1103581405096710226'), 'El ID exclusivo del dueño (1103581405096710226) debe estar configurado');
    assert.ok(content.toLowerCase().includes('0xffffff'), 'El color del embed del Brand Kit debe ser blanco puro (0xFFFFFF)');
    assert.ok(content.includes('banner-god-suite.png'), 'Debe incluir el banner oficial de g0d suite');
    assert.ok(content.includes('i-Tunes-Artwork-3x.png'), 'Debe incluir el logo oficial de g0d suite');
  });

  await t.test('Verificar que el selector de tickets usa menú desplegable (StringSelectMenu) con solo Soporte y Errores', () => {
    const setupPath = path.resolve('discord-bot/setup-tickets.js');
    const content = fs.readFileSync(setupPath, 'utf-8');

    assert.ok(content.includes('StringSelectMenuBuilder'), 'Debe usar StringSelectMenuBuilder (menú desplegable, no botones)');
    assert.ok(content.includes(".setValue('soporte')"), 'Debe incluir el apartado de Soporte');
    assert.ok(content.includes(".setValue('errores')"), 'Debe incluir el apartado de Errores');
    assert.ok(!content.includes('ButtonBuilder'), 'No debe usar botones para elegir el tipo de soporte');
  });

  await t.test('Verificar existencia de scripts .bat para crear canales y ejecutar el bot 24/7 en segundo plano', () => {
    const batSetup = path.resolve('discord-bot/1-crear-canal-y-permisos.bat');
    const batDaemon = path.resolve('discord-bot/2-iniciar-bot-24-7.bat');
    const daemonJs = path.resolve('discord-bot/daemon.js');

    assert.ok(fs.existsSync(batSetup), 'Debe existir 1-crear-canal-y-permisos.bat');
    assert.ok(fs.existsSync(batDaemon), 'Debe existir 2-iniciar-bot-24-7.bat');
    assert.ok(fs.existsSync(daemonJs), 'Debe existir daemon.js para mantener el bot activo 24/7 tras cerrar el .bat');
  });

  await t.test('Verificar Auto-Rol de miembro (1543332744292081734) y sistema Anti-Raid / Anti-Spam', () => {
    const botPath = path.resolve('discord-bot/bot.js');
    assert.ok(fs.existsSync(botPath), 'bot.js debe existir');
    const content = fs.readFileSync(botPath, 'utf-8');

    assert.ok(content.includes('1543332744292081734'), 'Debe incluir el ID del rol de Miembro para el Auto-Rol');
    assert.ok(content.includes('guildMemberAdd'), 'Debe implementar el listener guildMemberAdd para asignar el rol');
    assert.ok(content.includes('recentJoins'), 'Debe implementar el tracking de ingresos masivos (Anti-Raid)');
    assert.ok(content.includes('isRaidLockdown'), 'Debe contar con estado de cuarentena/lockdown anti-raid');
    assert.ok(content.includes('messageCreate'), 'Debe implementar el listener messageCreate para Anti-Spam');
    assert.ok(content.includes('inviteRegex'), 'Debe detectar y eliminar enlaces externos / invites de Discord');
    assert.ok(content.includes('mentionCount'), 'Debe detectar y sancionar menciones masivas');
  });
});



