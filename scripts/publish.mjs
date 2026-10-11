#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

function printBanner() {
  console.log(`\n${ANSI.bold}${ANSI.cyan}================================================================${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.white}     🚀 g0d suite | GESTOR DE VERSIONES Y PUBLICACIÓN 🚀        ${ANSI.reset}`);
  console.log(`${ANSI.dim}       Publicación oficial a GitHub para Auto-Actualizador      ${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}================================================================${ANSI.reset}\n`);
}

function promptQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

function readEnvToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const l of lines) {
      if (l.trim().startsWith('GITHUB_TOKEN=')) {
        return l.trim().split('=')[1]?.replace(/['"]/g, '').trim();
      }
    }
  }
  return null;
}

async function fetchPreviousReleases(token, owner, repo) {
  const releases = [];
  try {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'god-tweaks-release-manager',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=10`, { headers });
    if (res.ok) {
      const data = await res.json();
      for (const r of data) {
        releases.push({
          tag: r.tag_name,
          name: r.name || r.tag_name,
          date: r.published_at ? new Date(r.published_at).toLocaleDateString('es-ES') : 'N/A',
          assets: r.assets ? r.assets.length : 0,
        });
      }
    }
  } catch (err) {
    // Silently continue with local git tags
  }

  // Fallback to local git tags
  try {
    const rawTags = execSync('git tag -l --sort=-v:refname', { encoding: 'utf8' })
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    for (const t of rawTags) {
      if (!releases.some((r) => r.tag === t)) {
        releases.push({ tag: t, name: t, date: 'Local Git', assets: 0 });
      }
    }
  } catch {}

  return releases.slice(0, 8);
}

function computeSemverVariants(currentVersion) {
  const base = currentVersion.replace(/^v/, '').split('-')[0];
  const parts = base.split('.').map((n) => parseInt(n, 10) || 0);

  while (parts.length < 3) parts.push(0);

  const patch = `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  const minor = `${parts[0]}.${parts[1] + 1}.0`;
  const major = `${parts[0] + 1}.0.0`;

  return { patch, minor, major };
}

function updateAllProjectFiles(newVersion, oldVersion) {
  console.log(`\n${ANSI.bold}${ANSI.cyan}Sincronizando versión en todos los archivos del proyecto...${ANSI.reset}`);

  // 1. package.json
  const pkgPath = path.resolve('package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.version = newVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log(`  ✔ [package.json] ➔ ${ANSI.green}${newVersion}${ANSI.reset}`);
  }

  // 2. src-tauri/tauri.conf.json
  const tauriPath = path.resolve('src-tauri/tauri.conf.json');
  if (fs.existsSync(tauriPath)) {
    const tauriConf = JSON.parse(fs.readFileSync(tauriPath, 'utf8'));
    tauriConf.version = newVersion;
    fs.writeFileSync(tauriPath, JSON.stringify(tauriConf, null, 2) + '\n', 'utf8');
    console.log(`  ✔ [src-tauri/tauri.conf.json] ➔ ${ANSI.green}${newVersion}${ANSI.reset}`);
  }

  // 3. src-tauri/tauri.local.conf.json
  const tauriLocalPath = path.resolve('src-tauri/tauri.local.conf.json');
  if (fs.existsSync(tauriLocalPath)) {
    try {
      const tauriLocal = JSON.parse(fs.readFileSync(tauriLocalPath, 'utf8'));
      tauriLocal.version = newVersion;
      fs.writeFileSync(tauriLocalPath, JSON.stringify(tauriLocal, null, 2) + '\n', 'utf8');
      console.log(`  ✔ [src-tauri/tauri.local.conf.json] ➔ ${ANSI.green}${newVersion}${ANSI.reset}`);
    } catch {}
  }

  // 4. src-tauri/tauri.staging.conf.json
  const tauriStagingPath = path.resolve('src-tauri/tauri.staging.conf.json');
  if (fs.existsSync(tauriStagingPath)) {
    try {
      const tauriStaging = JSON.parse(fs.readFileSync(tauriStagingPath, 'utf8'));
      tauriStaging.version = newVersion;
      fs.writeFileSync(tauriStagingPath, JSON.stringify(tauriStaging, null, 2) + '\n', 'utf8');
      console.log(`  ✔ [src-tauri/tauri.staging.conf.json] ➔ ${ANSI.green}${newVersion}${ANSI.reset}`);
    } catch {}
  }

  // 5. src-tauri/Cargo.toml
  const cargoPath = path.resolve('src-tauri/Cargo.toml');
  if (fs.existsSync(cargoPath)) {
    let cargo = fs.readFileSync(cargoPath, 'utf8');
    cargo = cargo.replace(/version = "[^"]+"/, `version = "${newVersion}"`);
    fs.writeFileSync(cargoPath, cargo, 'utf8');
    console.log(`  ✔ [src-tauri/Cargo.toml] ➔ ${ANSI.green}${newVersion}${ANSI.reset}`);
  }

  // 6. src/components/layout/TitleBar.tsx
  const titleBarPath = path.resolve('src/components/layout/TitleBar.tsx');
  if (fs.existsSync(titleBarPath)) {
    let titleBar = fs.readFileSync(titleBarPath, 'utf8');
    titleBar = titleBar.replace(/useState\("[\d\.]+"\)/g, `useState("${newVersion}")`);
    titleBar = titleBar.replace(new RegExp(`v${oldVersion.replace(/\./g, '\\.')}`, 'g'), `v${newVersion}`);
    fs.writeFileSync(titleBarPath, titleBar, 'utf8');
    console.log(`  ✔ [src/components/layout/TitleBar.tsx] ➔ ${ANSI.green}v${newVersion}${ANSI.reset}`);
  }

  // 7. PUBLICAR_A_PRODUCCION.bat
  const batPath = path.resolve('PUBLICAR_A_PRODUCCION.bat');
  if (fs.existsSync(batPath)) {
    let bat = fs.readFileSync(batPath, 'utf8');
    bat = bat.replace(/Version de Produccion: [\d\.]+/g, `Version de Produccion: ${newVersion}`);
    bat = bat.replace(new RegExp(`v${oldVersion.replace(/\./g, '\\.')}`, 'g'), `v${newVersion}`);
    fs.writeFileSync(batPath, bat, 'utf8');
    console.log(`  ✔ [PUBLICAR_A_PRODUCCION.bat] ➔ ${ANSI.green}${newVersion}${ANSI.reset}`);
  }

  // 8. src/services/updater.ts
  const updaterPath = path.resolve('src/services/updater.ts');
  if (fs.existsSync(updaterPath)) {
    let updater = fs.readFileSync(updaterPath, 'utf8');
    updater = updater.replace(/let currentVersion = "[\d\.]+";/, `let currentVersion = "${newVersion}";`);
    fs.writeFileSync(updaterPath, updater, 'utf8');
    console.log(`  ✔ [src/services/updater.ts] ➔ ${ANSI.green}${newVersion}${ANSI.reset}`);
  }
}

async function uploadSecretToGitHub(token, owner, repo, secretName, secretValue) {
  try {
    const sodium = (await import('libsodium-wrappers')).default;
    await sodium.ready;

    const url = `https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`;
    const keyRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'god-tweaks-publisher',
      },
    });

    if (!keyRes.ok) return;

    const keyData = await keyRes.json();
    const binkey = sodium.from_base64(keyData.key, sodium.base64_variants.ORIGINAL);
    const binsec = sodium.from_string(secretValue);
    const encBytes = sodium.crypto_box_seal(binsec, binkey);
    const encVal = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);

    const putUrl = `https://api.github.com/repos/${owner}/${repo}/actions/secrets/${secretName}`;
    await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'god-tweaks-publisher',
      },
      body: JSON.stringify({
        encrypted_value: encVal,
        key_id: keyData.key_id,
      }),
    });
  } catch {}
}

async function main() {
  printBanner();

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentVersion = pkg.version || '1.0.7';

  const owner = 'xg0d9999';
  const repoName = 'god_tweaks';
  const token = readEnvToken();

  // 1. Mostrar versiones anteriores
  console.log(`${ANSI.bold}${ANSI.yellow}📋 Versión actual configurada en el proyecto:${ANSI.reset} ${ANSI.bold}${ANSI.green}v${currentVersion}${ANSI.reset}\n`);

  console.log(`${ANSI.bold}${ANSI.cyan}📜 HISTORIAL DE VERSIONES ANTERIORES REGISTRADAS:${ANSI.reset}`);
  const prevReleases = await fetchPreviousReleases(token, owner, repoName);
  if (prevReleases.length === 0) {
    console.log(`  ${ANSI.dim}• No se encontraron versiones previas.${ANSI.reset}`);
  } else {
    for (const r of prevReleases) {
      const isCurrent = r.tag === `v${currentVersion}` || r.tag === currentVersion;
      const marker = isCurrent ? ` ${ANSI.bold}${ANSI.green}[ACTUAL]${ANSI.reset}` : '';
      const assetInfo = r.assets > 0 ? ` ${ANSI.dim}(${r.assets} archivos)${ANSI.reset}` : '';
      console.log(`  • ${ANSI.bold}${r.tag}${ANSI.reset} - ${r.date}${assetInfo}${marker}`);
    }
  }

  // 2. Selector de Versión
  const variants = computeSemverVariants(currentVersion);

  console.log(`\n${ANSI.bold}${ANSI.white}----------------------------------------------------------------${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.white}🎯 SELECCIONA EL NÚMERO DE VERSIÓN PARA PUBLICAR:${ANSI.reset}`);
  console.log(`  [1] Siguiente Patch  ➔ ${ANSI.bold}${ANSI.green}${variants.patch}${ANSI.reset} (Recomendado: arreglos y mejoras)`);
  console.log(`  [2] Siguiente Minor  ➔ ${ANSI.bold}${ANSI.yellow}${variants.minor}${ANSI.reset} (Nuevas características/módulos)`);
  console.log(`  [3] Siguiente Major  ➔ ${ANSI.bold}${ANSI.magenta}${variants.major}${ANSI.reset} (Gran actualización del sistema)`);
  console.log(`  [4] Mantener actual  ➔ ${ANSI.bold}${ANSI.cyan}${currentVersion}${ANSI.reset} (Re-publicar misma versión)`);
  console.log(`  [5] Escribir Manual  ➔ Introducir versión personalizada (ej: 1.0.8, 1.2.0)`);
  console.log(`  [0] Cancelar`);
  console.log(`${ANSI.bold}${ANSI.white}----------------------------------------------------------------${ANSI.reset}`);

  // Soporte para flags CLI (ej: --patch, --minor, --current)
  const args = process.argv.slice(2);
  let choice = '';

  if (args.includes('--patch')) choice = '1';
  else if (args.includes('--minor')) choice = '2';
  else if (args.includes('--major')) choice = '3';
  else if (args.includes('--current')) choice = '4';
  else {
    choice = await promptQuestion(`\nElige una opción (1-5) [Por defecto: 1]: `);
    if (!choice) choice = '1';
  }

  if (choice === '0') {
    console.log(`\n${ANSI.yellow}Publicación cancelada por el usuario.${ANSI.reset}`);
    process.exit(0);
  }

  let targetVersion = currentVersion;
  if (choice === '1') {
    targetVersion = variants.patch;
  } else if (choice === '2') {
    targetVersion = variants.minor;
  } else if (choice === '3') {
    targetVersion = variants.major;
  } else if (choice === '4') {
    targetVersion = currentVersion;
  } else if (choice === '5') {
    const custom = await promptQuestion(`Introduce el número de versión deseado (ej: 1.0.8): `);
    if (!custom || !/^\d+\.\d+\.\d+/.test(custom.replace(/^v/, ''))) {
      console.log(`${ANSI.red}Formato inválido. Debe ser de tipo X.Y.Z (ej: 1.0.8). Cancelando.${ANSI.reset}`);
      process.exit(1);
    }
    targetVersion = custom.replace(/^v/, '').trim();
  } else {
    console.log(`${ANSI.red}Opción no válida. Cancelando.${ANSI.reset}`);
    process.exit(1);
  }

  console.log(`\n${ANSI.bold}${ANSI.green}➔ Versión elegida para publicación: v${targetVersion}${ANSI.reset}\n`);

  // 3. Actualizar todos los archivos de configuración
  updateAllProjectFiles(targetVersion, currentVersion);

  // 4. Inyectar Secret de Minisign si existe .updater.key
  if (token) {
    const keyPath = path.resolve('.updater.key');
    if (fs.existsSync(keyPath)) {
      try {
        const pk = fs.readFileSync(keyPath, 'utf8').trim();
        await uploadSecretToGitHub(token, owner, repoName, 'TAURI_SIGNING_PRIVATE_KEY', pk);
      } catch {}
    }
  }

  // 5. Verificación de compilación del Frontend
  console.log(`\n${ANSI.bold}${ANSI.cyan}Verificando compilación de TypeScript y Frontend...${ANSI.reset}`);
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log(`  ✔ Compilación frontend superada con éxito.`);
  } catch (err) {
    console.error(`\n${ANSI.red}${ANSI.bold}❌ Error en la compilación del frontend. Revisa los errores.${ANSI.reset}`);
    process.exit(1);
  }

  // 6. Git Add, Commit, Tag & Push
  console.log(`\n${ANSI.bold}${ANSI.cyan}Creando Tag y publicando a GitHub...${ANSI.reset}`);

  try {
    if (token) {
      const authRemote = `https://x-access-token:${token}@github.com/${owner}/${repoName}.git`;
      try {
        execSync(`git remote set-url origin ${authRemote}`, { stdio: 'pipe' });
      } catch {}
    }

    execSync('git add .', { stdio: 'inherit' });

    try {
      execSync(`git commit -m "release: v${targetVersion} - nueva version oficial de g0d suite"`, { stdio: 'inherit' });
    } catch {
      console.log('  No hay cambios pendientes para commit.');
    }

    const tagName = `v${targetVersion}`;
    try {
      execSync(`git tag -fa ${tagName} -m "Release ${tagName}"`, { stdio: 'inherit' });
      console.log(`  ✔ Tag ${ANSI.bold}${tagName}${ANSI.reset} creado.`);
    } catch {
      console.log(`  Tag ${tagName} ya existente, se sobreescribirá.`);
    }

    console.log(`  Subiendo cambios a la rama main y tags a GitHub...`);
    execSync('git push -u origin main --tags --force', { stdio: 'inherit' });

    console.log(`\n${ANSI.bold}${ANSI.green}================================================================${ANSI.reset}`);
    console.log(`${ANSI.bold}${ANSI.green}       🎉 ¡VERSIÓN v${targetVersion} SUBIDA A GITHUB CON ÉXITO! 🎉       ${ANSI.reset}`);
    console.log(`${ANSI.bold}${ANSI.green}================================================================${ANSI.reset}\n`);

    console.log(`  • Repositorio  : ${ANSI.cyan}https://github.com/${owner}/${repoName}${ANSI.reset}`);
    console.log(`  • GitHub Actions: ${ANSI.cyan}https://github.com/${owner}/${repoName}/actions${ANSI.reset}`);
    console.log(`  • Releases     : ${ANSI.cyan}https://github.com/${owner}/${repoName}/releases${ANSI.reset}\n`);
    console.log(`  ${ANSI.dim}GitHub Actions está compilando los instaladores y el archivo latest.json.`);
    console.log(`  Tan pronto termine el flujo en GitHub (1-2 min), la app detectará`);
    console.log(`  la actualización automáticamente al iniciar o pulsar en la versión superior.${ANSI.reset}\n`);
  } catch (err) {
    console.error(`\n${ANSI.red}${ANSI.bold}Error durante la publicación a Git:${ANSI.reset}`, err.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
