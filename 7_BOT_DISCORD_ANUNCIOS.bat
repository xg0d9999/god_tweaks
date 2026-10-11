@echo off
chcp 65001 >nul
title g0d suite - Bot de Discord & Sistema de Notificaciones
cd /d "%~dp0\discord-bot"

echo ====================================================================
echo      🤖 g0d suite - BOT DE DISCORD PARA ANUNCIOS Y MENSAJES PRIVADOS
echo ====================================================================
echo.

if not exist ".env" (
    copy ".env.example" ".env" >nul
)

if not exist "node_modules" (
    echo [1/3] Instalando dependencias del bot (discord.js, @supabase/supabase-js)...
    call npm install
    echo.
)

findstr /C:"DISCORD_BOT_TOKEN=TU_DISCORD_BOT_TOKEN_AQUI" ".env" >nul
if not errorlevel 1 (
    echo ====================================================================
    echo    ⚠️ ATENCIÓN: Debes configurar tu DISCORD_BOT_TOKEN en .env
    echo    Abriendo discord-bot\.env para que pegues tu token y Client ID...
    echo ====================================================================
    notepad ".env"
    echo.
    echo Cuando hayas guardado el archivo .env, presiona cualquier tecla...
    pause >nul
)

echo [2/3] Registrando comando Slash /actualizacion en Discord...
call node register-commands.js
echo.

echo [3/3] Iniciando el Bot de Discord en vivo...
echo (Presiona Ctrl+C para detener el bot en cualquier momento)
echo ====================================================================
echo.
node bot.js

if errorlevel 1 (
    echo.
    echo ====================================================================
    echo    ❌ Ocurrió un error al ejecutar el bot de Discord.
    echo    Revisa el token y permisos en discord-bot\.env
    echo ====================================================================
    pause
)
