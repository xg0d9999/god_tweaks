@echo off
chcp 65001 >nul
title g0d tweaks - Compilar Instalador Staging
cd /d "%~dp0"
echo ====================================================================
echo    📦 g0d tweaks ^| COMPILANDO INSTALADOR .EXE DE PRUEBAS
echo ====================================================================
echo.
npm run build:staging
echo.
echo ====================================================================
echo    ✔ Compilación completada con éxito.
echo    Instalador disponible en: src-tauri\target\release\bundle\nsis
echo ====================================================================
pause
