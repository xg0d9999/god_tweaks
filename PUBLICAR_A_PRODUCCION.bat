@echo off
chcp 65001 >nul
title g0d suite - Compilar y Publicar a Producción
cd /d "%~dp0"

net session >nul 2>&1
if %errorLevel% neq 0 (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo ====================================================================
echo        🚀 g0d suite - COMPILADOR Y PUBLICADOR DE PRODUCCIÓN 🚀
echo ====================================================================
echo.
echo   Versión de Producción: 1.0.4
echo   Este proceso compilará el .exe nativo de alto rendimiento,
echo   generará el instalador NSIS (.exe) firmado y permitirá
echo   publicar la Release oficial en GitHub.
echo.
echo ====================================================================
echo.

:: 1. Verificación de clave de firma para el auto-actualizador
if exist ".updater.key" (
    set /p TAURI_SIGNING_PRIVATE_KEY=<.updater.key
    set TAURI_SIGNING_PRIVATE_KEY_PASSWORD=
    echo [✔] Clave privada de firma Minisign (.updater.key) cargada correctamente.
) else (
    echo [!] AVISO: No se detectó .updater.key en la raíz. Los artefactos no se firmarán localmente.
)

echo.
echo [PASO 1/3] Ejecutando validaciones y pruebas de calidad...
call npm test
if errorLevel 1 (
    echo.
    echo ❌ ERROR: Las pruebas de verificación fallaron. Compilación cancelada por seguridad.
    echo.
    pause
    exit /b 1
)

echo.
echo [PASO 2/3] Compilando ejecutable .exe e instalador oficial (Tauri Production Build)...
echo           (Esto puede tomar unos momentos en optimizar binarios Rust en Release)
echo.

call npx tauri build
if errorLevel 1 (
    echo.
    echo ❌ ERROR en la compilación de producción. Revisa los mensajes superiores.
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================================================
echo    ✔ ¡COMPILACIÓN COMPLETADA CON ÉXITO!
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

:: 3. Publicación opcional a GitHub Releases
set /p DO_PUBLISH="¿Deseas publicar esta versión (v1.0.4) en GitHub Releases para el actualizador automático? (S/N): "
if /i "%DO_PUBLISH%"=="S" (
    echo.
    echo [PASO 3/3] Publicando versión v1.0.4 a GitHub Releases...
    call npm run release:current
    echo.
    echo [✔] Publicación lanzada. GitHub Actions generará el Release oficial con latest.json.
) else (
    echo.
    echo [ℹ] Publicación en GitHub omitida. Puedes usar tus archivos .exe locales.
)

echo.
echo Abriendo la carpeta con los ejecutables generados...
start "" explorer "src-tauri\target\release\bundle\nsis"

echo.
echo Proceso finalizado.
pause
