import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.join(__dirname, 'bot-24-7.log');
const daemonPidFile = path.join(__dirname, 'daemon.pid');
const botPidFile = path.join(__dirname, 'bot.pid');

// Guardar PID del demonio supervisor
fs.writeFileSync(daemonPidFile, String(process.pid), 'utf-8');

function writeLog(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(logFile, line, 'utf-8');
  } catch {
    // Ignorar error de escritura de log
  }
}

writeLog('=== DEMONIO 24/7 INICIADO (Watchdog Activo) ===');

let child = null;
let shuttingDown = false;

function startBot() {
  if (shuttingDown) return;

  writeLog('Iniciando proceso de bot.js...');
  child = spawn(process.execPath, [path.join(__dirname, 'bot.js')], {
    cwd: __dirname,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (child.pid) {
    fs.writeFileSync(botPidFile, String(child.pid), 'utf-8');
  }

  child.stdout.on('data', (data) => {
    // Limpiar códigos ANSI para el archivo de log
    const clean = data.toString().replace(/\x1b\[[0-9;]*m/g, '').trim();
    if (clean) writeLog(clean);
  });

  child.stderr.on('data', (data) => {
    const clean = data.toString().replace(/\x1b\[[0-9;]*m/g, '').trim();
    if (clean) writeLog(`[ERROR] ${clean}`);
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    writeLog(`bot.js finalizó (code=${code}, signal=${signal}). Reiniciando automáticamente en 3 segundos...`);
    setTimeout(startBot, 3000);
  });
}

process.on('SIGTERM', () => {
  shuttingDown = true;
  if (child) child.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  shuttingDown = true;
  if (child) child.kill();
  process.exit(0);
});

startBot();
