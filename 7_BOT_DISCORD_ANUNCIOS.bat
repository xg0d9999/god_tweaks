@echo off
setlocal
cd /d "%~dp0discord-bot"
title g0d suite - Bot de Discord

echo ====================================================================
echo      [BOT] g0d suite - BOT DE DISCORD PARA ANUNCIOS Y DMS
echo ====================================================================
echo.

if not exist ".env" (
    copy ".env.example" ".env" >nul
)

if not exist "node_modules" (
    echo [1/3] Instalando dependencias del bot...
    call npm install
    echo.
)

echo [2/3] Registrando comando Slash /actualizacion en Discord...
call node register-commands.js
echo.

echo [3/3] Iniciando el Bot de Discord en vivo...
echo (Presiona Ctrl+C para detener el bot en cualquier momento)
echo ====================================================================
echo.
call node bot.js

if errorlevel 1 (
    echo.
    echo ====================================================================
    echo    Error al ejecutar el bot de Discord.
    echo    Revisa el token y permisos en discord-bot\.env
    echo ====================================================================
    pause
)
