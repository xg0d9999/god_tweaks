@echo off
chcp 65001 >nul
title g0d tweaks - Compilar Instalador Staging
cd /d "%~dp0"
echo ====================================================================
echo    [LAB] g0d tweaks - COMPILANDO INSTALADOR .EXE DE PRUEBAS
echo ====================================================================
echo.
call npm run build:staging
echo.
if errorlevel 1 (
    echo ====================================================================
    echo    ❌ La compilación falló. Revisa el mensaje superior.
    echo ====================================================================
) else (
    echo ====================================================================
    echo    ✔ Instalador generado en: src-tauri\target\release\bundle\nsis
    echo ====================================================================
)
echo.
pause
