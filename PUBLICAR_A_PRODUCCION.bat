@echo off
title g0d suite - Gestor de Versiones y Publicador Oficial
cd /d "%~dp0"

REM 1. Cerrar instancias previas para evitar bloqueos de archivos en disco
taskkill /F /IM god_tweaks.exe >nul 2>&1

REM 2. Ejecutar el asistente interactivo de gestion de versiones y publicacion a GitHub
call node scripts/publish.mjs %*

if errorlevel 1 (
    echo.
    echo [ERROR] La operacion de publicacion no se pudo completar.
    echo.
    pause
    exit /b 1
)

echo.
echo Presione una tecla para salir . . .
pause >nul
exit /b 0
