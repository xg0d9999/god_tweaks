@echo off
title g0d suite - Compilar y Publicar a Produccion
cd /d "%~dp0"

echo ====================================================================
echo        g0d suite - COMPILADOR Y PUBLICADOR DE PRODUCCION
echo ====================================================================
echo.
echo Version de Produccion: 1.0.5
echo Este script compila el instalador oficial .exe y permite publicar
echo la Release oficial en GitHub para el actualizador automatico.
echo.
echo ====================================================================
echo.

REM 1. Cerrar instancias previas para evitar bloqueos de archivo
taskkill /F /IM god_tweaks.exe >nul 2>&1

REM 2. Cargar clave de firma para el auto-actualizador si existe
if exist ".updater.key" (
    set /p TAURI_SIGNING_PRIVATE_KEY=<.updater.key
    set TAURI_SIGNING_PRIVATE_KEY_PASSWORD=
    echo [*] Clave de firma Minisign cargada correctamente.
) else (
    echo [!] AVISO: No se detecto .updater.key local.
)

echo.
echo [PASO 1/3] Ejecutando pruebas de verificacion del codigo...
call npm test
if errorlevel 1 (
    echo.
    echo [ERROR] Las pruebas de verificacion fallaron. Compilacion cancelada.
    echo.
    pause
    exit /b 1
)

echo.
echo [PASO 2/3] Compilando ejecutable e instalador de produccion con Tauri...
echo           Por favor espera mientras Rust compila el binario en Release...
echo.

call npx tauri build
if errorlevel 1 (
    echo.
    echo [ERROR] Fallo la compilacion de produccion. Revisa el error superior.
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================================================
echo    COMPILACION COMPLETADA CON EXITO
echo ====================================================================
echo.
echo    Binario Portable (.exe):
echo    src-tauri\target\release\god_tweaks.exe
echo.
echo    Instalador Oficial Setup (.exe):
echo    src-tauri\target\release\bundle\nsis\
echo.
echo ====================================================================
echo.

REM 3. Publicacion a GitHub Releases
set /p DO_PUB="Deseas publicar esta version (v1.0.5) en GitHub Releases ahora? (S/N): "
if /i "%DO_PUB%"=="S" (
    echo.
    echo [PASO 3/3] Publicando version v1.0.5 a GitHub Releases...
    call npm run release:current
    echo.
    echo [*] Release enviada a GitHub. GitHub Actions generara el paquete oficial.
) else (
    echo.
    echo [*] Publicacion en GitHub omitida. Puedes usar los instaladores locales.
)

echo.
echo Abriendo carpeta con los instaladores generados...
start "" explorer "src-tauri\target\release\bundle\nsis"

echo.
echo Proceso finalizado.
pause
