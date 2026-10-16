@echo off
setlocal
cd /d "%~dp0"
title g0d suite - Bot de Tickets 24/7 (Daemon)
color 0A

echo ================================================================
echo   G0D SUITE - INICIADOR DE BOT 24/7 EN SEGUNDO PLANO
echo ================================================================
echo.

if not exist node_modules (
    echo [*] Instalando dependencias de Node.js por primera vez...
    call npm install
    echo.
)

REM Detener instancias previas si estaban activas
if exist daemon.pid (
    for /f "usebackq tokens=*" %%a in ("daemon.pid") do (
        taskkill /F /PID %%a >nul 2>&1
    )
    del /f /q daemon.pid >nul 2>&1
)

if exist bot.pid (
    for /f "usebackq tokens=*" %%a in ("bot.pid") do (
        taskkill /F /PID %%a >nul 2>&1
    )
    del /f /q bot.pid >nul 2>&1
)

echo [*] Iniciando bot en segundo plano (proceso desacoplado)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath 'node' -ArgumentList 'daemon.js' -WorkingDirectory '%~dp0' -WindowStyle Hidden"

powershell -NoProfile -Command "Start-Sleep -Seconds 3"

echo.
echo ================================================================
echo   [OK] EL BOT YA ESTA ACTIVO 24/7 EN SEGUNDO PLANO
echo ================================================================
echo   - Aunque cierres esta ventana, el bot seguira funcionando.
echo   - Se reinicia automaticamente si se cae la conexion.
echo   - Registro de actividad guardado en: bot-24-7.log
echo   - Para detenerlo cuando quieras: 3-detener-bot-24-7.bat
echo ================================================================
echo.
if exist bot-24-7.log (
    echo --- Ultimas lineas del registro ---
    powershell -NoProfile -Command "Get-Content -Path 'bot-24-7.log' -Tail 6"
    echo -----------------------------------
)
echo.
pause