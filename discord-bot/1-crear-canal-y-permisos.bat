@echo off
setlocal
cd /d "%~dp0"
title g0d suite - Configurar Canales y Permisos de Tickets
color 0B

echo ================================================================
echo   G0D SUITE - CONFIGURADOR DE CANAL Y PERMISOS DE TICKETS
echo ================================================================
echo.

if not exist node_modules (
    echo [*] Instalando dependencias de Node.js por primera vez...
    call npm install
    echo.
)

echo [*] Configurando categoria, canal de tickets y permisos exclusivos
echo     para tu ID (1103581405096710226)...
echo.

node setup-tickets.js

echo.
echo ================================================================
echo   Configuracion finalizada con exito.
echo   Ya puedes cerrar esta ventana y ejecutar "2-iniciar-bot-24-7.bat".
echo ================================================================
echo.
pause