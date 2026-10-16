@echo off
setlocal
cd /d "%~dp0"
title g0d suite - Detener Bot 24/7
color 0C

echo ================================================================
echo   DETENIENDO BOT DE DISCORD 24/7 EN SEGUNDO PLANO
echo ================================================================
echo.

if exist daemon.pid (
    for /f "usebackq tokens=*" %%a in ("daemon.pid") do (
        echo [*] Cerrando proceso supervisor daemon (PID: %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
    del /f /q daemon.pid >nul 2>&1
)

if exist bot.pid (
    for /f "usebackq tokens=*" %%a in ("bot.pid") do (
        echo [*] Cerrando proceso del bot (PID: %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
    del /f /q bot.pid >nul 2>&1
)

echo.
echo [OK] El bot en segundo plano ha sido detenido correctamente.
echo.
pause