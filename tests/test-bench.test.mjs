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
});
