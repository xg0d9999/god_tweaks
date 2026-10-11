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
  console.log(`\n${ANSI.bold}${ANSI.magenta}================================================================${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.white}       🚀 g0d suite | PUBLICADOR AUTOMÁTICO A GITHUB 🚀        ${ANSI.reset}`);
  console.log(`${ANSI.dim}        Zero-Touch: Test Bench + Version Bump + Secrets + Release${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.magenta}================================================================${ANSI.reset}\n`);
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

function bumpSemver(version, type, isBeta = false, isPromote = false) {
  if (isPromote) {
    return version.replace(/-beta\.\d+$/, '');
  }

  const base = version.replace(/-beta\.\d+$/, '');
  const parts = base.split('.').map(Number);

  if (isBeta) {
    if (version.includes('-beta.')) {
      const currentBetaNum = parseInt(version.split('-beta.')[1], 10) || 1;
      return `${base}-beta.${currentBetaNum + 1}`;
    } else {
      parts[2] += 1;
      return `${parts.join('.')}-beta.1`;
    }
  }

  if (type === 'major') {
    parts[0] += 1;
    parts[1] = 0;
    parts[2] = 0;
  } else if (type === 'minor') {
    parts[1] += 1;
    parts[2] = 0;
  } else {
    parts[2] += 1;
  }
  return parts.join('.');
}

function updateConfigFilesVersion(newVersion) {
  // 1. package.json
  const pkgPath = path.resolve('package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  // 2. src-tauri/tauri.conf.json
  const tauriPath = path.resolve('src-tauri/tauri.conf.json');
  const tauriConf = JSON.parse(fs.readFileSync(tauriPath, 'utf8'));
  tauriConf.version = newVersion;
  fs.writeFileSync(tauriPath, JSON.stringify(tauriConf, null, 2) + '\n');

  // 3. src-tauri/Cargo.toml
  const cargoPath = path.resolve('src-tauri/Cargo.toml');
  let cargoContent = fs.readFileSync(cargoPath, 'utf8');
  cargoContent = cargoContent.replace(/version = "[^"]+"/, `version = "${newVersion}"`);
  fs.writeFileSync(cargoPath, cargoContent);
}

async function uploadSecretToGitHub(token, owner, repo, secretName, secretValue) {
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

  if (!keyRes.ok) {
    throw new Error(`Error obteniendo clave pública del repo: ${await keyRes.text()}`);
  }

  const keyData = await keyRes.json();
  const binkey = sodium.from_base64(keyData.key, sodium.base64_variants.ORIGINAL);
  const binsec = sodium.from_string(secretValue);
  const encBytes = sodium.crypto_box_seal(binsec, binkey);
  const encVal = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);

  const putUrl = `https://api.github.com/repos/${owner}/${repo}/actions/secrets/${secretName}`;
  const putRes = await fetch(putUrl, {
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

  if (!putRes.ok) {
    throw new Error(`Error inyectando secret ${secretName}: ${await putRes.text()}`);
  }
}

async function main() {
  printBanner();

  // Argumentos
  const args = process.argv.slice(2);
  const isFirstRelease = args.includes('--initial');
  const isBeta = args.includes('--beta') || args.includes('--staging');
  const isPromote = args.includes('--promote');
  const isCurrent = args.includes('--current') || args.includes('--no-bump');
  const skipTest = args.includes('--skip-test');
  let bumpType = 'patch';
  if (args.includes('--minor')) bumpType = 'minor';
  if (args.includes('--major')) bumpType = 'major';

  // 1. BANCO DE PRUEBAS AUTOMATIZADO OBLIGATORIO
  if (!skipTest) {
    console.log(`${ANSI.bold}${ANSI.cyan}PASO 1/5: Ejecutando Banco de Pruebas de Calidad...${ANSI.reset}`);
    try {
      execSync('node scripts/test-bench.mjs', { stdio: 'inherit' });
    } catch (e) {
      console.log(`\n${ANSI.red}${ANSI.bold}❌ Publicación cancelada: El banco de pruebas detectó fallos que deben corregirse antes de lanzar a GitHub.${ANSI.reset}\n`);
      process.exit(1);
    }
  } else {
    console.log(`${ANSI.yellow}Omitiendo banco de pruebas (--skip-test especificado).${ANSI.reset}`);
  }

  // 2. GESTIÓN DE VERSIÓN
  console.log(`\n${ANSI.bold}${ANSI.cyan}PASO 2/5: Gestionando Versión del Proyecto...${ANSI.reset}`);
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  let currentVersion = pkg.version || '1.0.0';
  let targetVersion = currentVersion;

  if (isCurrent) {
    targetVersion = currentVersion;
    console.log(`  Publicando versión actual de Producción: ${ANSI.bold}${ANSI.green}v${targetVersion}${ANSI.reset}`);
    updateConfigFilesVersion(targetVersion);
  } else if (isBeta) {
    targetVersion = bumpSemver(currentVersion, bumpType, true, false);
    console.log(`  Creando versión de banco de pruebas (BETA): ${ANSI.dim}v${currentVersion}${ANSI.reset} ➔ ${ANSI.bold}${ANSI.yellow}v${targetVersion}${ANSI.reset}`);
    console.log(`  ${ANSI.dim}Nota: Esta versión solo se publicará en el canal preliminar (Pre-Release). No afectará la build principal.${ANSI.reset}`);
    updateConfigFilesVersion(targetVersion);
  } else if (isPromote) {
    targetVersion = bumpSemver(currentVersion, bumpType, false, true);
    console.log(`  Promocionando versión a Producción Estable: ${ANSI.dim}v${currentVersion}${ANSI.reset} ➔ ${ANSI.bold}${ANSI.green}v${targetVersion}${ANSI.reset}`);
    updateConfigFilesVersion(targetVersion);
  } else if (!isFirstRelease) {
    targetVersion = bumpSemver(currentVersion, bumpType, false, false);
    console.log(`  Incrementando versión oficial: ${ANSI.dim}v${currentVersion}${ANSI.reset} ➔ ${ANSI.bold}${ANSI.green}v${targetVersion}${ANSI.reset}`);
    updateConfigFilesVersion(targetVersion);
  } else {
    console.log(`  Lanzamiento inicial con versión: ${ANSI.bold}${ANSI.green}v${targetVersion}${ANSI.reset}`);
    updateConfigFilesVersion(targetVersion);
  }

  // 3. OBTENCIÓN DE GITHUB TOKEN
  console.log(`\n${ANSI.bold}${ANSI.cyan}PASO 3/5: Comprobando Autenticación con GitHub...${ANSI.reset}`);
  let token = readEnvToken();
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--token' && args[i + 1]) {
      token = args[i + 1];
    }
  }

  if (!token) {
    console.log(`${ANSI.yellow}No se detectó GITHUB_TOKEN en variables de entorno o archivo .env.${ANSI.reset}`);
    console.log(`Para automatizar completamente la creación del repositorio y secrets, introduce tu GitHub Personal Access Token (PAT).`);
    console.log(`${ANSI.dim}(Crea uno en https://github.com/settings/tokens con permisos "repo" y "workflow")${ANSI.reset}`);
    token = await promptQuestion(`\nIntroduce tu GitHub Token (o presiona ENTER para usar git remote manual): `);
  }

  let owner = 'ismae-dev';
  const repoName = 'god_tweaks';

  if (token) {
    // Validar token y obtener nombre de usuario
    try {
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'god-tweaks-publisher',
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        owner = userData.login;
        console.log(`  ✔ Autenticado como usuario de GitHub: ${ANSI.bold}${ANSI.green}${owner}${ANSI.reset}`);
      } else {
        console.log(`${ANSI.yellow}Token no válido o expirado. Se procederá con Git local.${ANSI.reset}`);
        token = null;
      }
    } catch (e) {
      console.log(`${ANSI.yellow}No se pudo contactar la API de GitHub. Se usará Git local.${ANSI.reset}`);
      token = null;
    }
  }

  // 4. CREACIÓN AUTOMÁTICA DEL REPO Y SECRETS
  if (token) {
    console.log(`\n${ANSI.bold}${ANSI.cyan}PASO 4/5: Configuración de Repositorio y Cripto-Secrets...${ANSI.reset}`);
    // Verificar si el repositorio ya existe
    const repoCheck = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'god-tweaks-publisher',
      },
    });

    if (repoCheck.status === 404) {
      console.log(`  Creando repositorio ${ANSI.bold}${owner}/${repoName}${ANSI.reset} en GitHub...`);
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'god-tweaks-publisher',
        },
        body: JSON.stringify({
          name: repoName,
          description: 'g0d suite - Suite de Optimización Extrema para Windows 11/10 y FiveM',
          private: false,
        }),
      });
      if (createRes.ok) {
        console.log(`  ✔ Repositorio creado exitosamente en GitHub.`);
      } else {
        console.log(`  ⚠️ Aviso al crear repo: ${await createRes.text()}`);
      }
    } else {
      console.log(`  ✔ Repositorio ${ANSI.bold}${owner}/${repoName}${ANSI.reset} verificado en GitHub.`);
    }

    // Inyectar Clave Privada Minisign en GitHub Secrets de Actions
    const privateKeyPath = path.resolve('.updater.key');
    if (fs.existsSync(privateKeyPath)) {
      try {
        const privateKey = fs.readFileSync(privateKeyPath, 'utf8').trim();
        console.log(`  Inyectando clave privada Minisign en GitHub Actions Secrets (TAURI_SIGNING_PRIVATE_KEY)...`);
        await uploadSecretToGitHub(token, owner, repoName, 'TAURI_SIGNING_PRIVATE_KEY', privateKey);
        console.log(`  ✔ Secret TAURI_SIGNING_PRIVATE_KEY configurado y blindado en GitHub.`);
      } catch (err) {
        console.log(`  ⚠️ No se pudo inyectar el secret automáticamente: ${err.message}`);
      }
    }
  }

  // 5. GIT COMMIT, TAG & PUSH
  console.log(`\n${ANSI.bold}${ANSI.cyan}PASO 5/5: Creando Commit, Tag y Publicando Rama main...${ANSI.reset}`);

  try {
    // Configurar remote si hay token
    if (token) {
      const remoteUrl = `https://x-access-token:${token}@github.com/${owner}/${repoName}.git`;
      try {
        execSync(`git remote set-url origin ${remoteUrl}`, { stdio: 'pipe' });
      } catch {
        execSync(`git remote add origin ${remoteUrl}`, { stdio: 'pipe' });
      }
    }

    execSync('git add .', { stdio: 'inherit' });

    try {
      execSync(`git commit -m "release: v${targetVersion} - actualizacion oficial de g0d suite"`, { stdio: 'inherit' });
    } catch {
      console.log('  No hay cambios pendientes para commit.');
    }

    const tagName = `v${targetVersion}`;
    try {
      execSync(`git tag -a ${tagName} -m "Release ${tagName}"`, { stdio: 'inherit' });
      console.log(`  ✔ Tag ${ANSI.bold}${tagName}${ANSI.reset} creado.`);
    } catch {
      console.log(`  El tag ${tagName} ya existía o se actualizará.`);
    }

    console.log(`  Subiendo cambios y tags a GitHub...`);
    execSync('git push -u origin main --tags --force', { stdio: 'inherit' });

    console.log(`\n${ANSI.bold}${ANSI.green}================================================================${ANSI.reset}`);
    console.log(`${ANSI.bold}${ANSI.green}       🎉 ¡PUBLICACIÓN A GITHUB COMPLETADA CON ÉXITO! 🎉        ${ANSI.reset}`);
    console.log(`${ANSI.bold}${ANSI.green}================================================================${ANSI.reset}\n`);

    console.log(`  • Repositorio  : ${ANSI.cyan}https://github.com/${owner}/${repoName}${ANSI.reset}`);
    console.log(`  • GitHub Actions: ${ANSI.cyan}https://github.com/${owner}/${repoName}/actions${ANSI.reset}`);
    console.log(`  • Releases     : ${ANSI.cyan}https://github.com/${owner}/${repoName}/releases${ANSI.reset}\n`);
    console.log(`${ANSI.dim}El flujo de GitHub Actions se activará en segundos, compilará la versión ${tagName} y publicará el actualizador automático con latest.json.${ANSI.reset}\n`);
  } catch (err) {
    console.error(`\n${ANSI.red}${ANSI.bold}Error durante el push de Git:${ANSI.reset}`, err.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
