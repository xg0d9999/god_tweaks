@echo off
chcp 65001 >nul
title g0d suite - Modo Pruebas (Dev Staging)
cd /d "%~dp0"
echo ====================================================================
echo    [LAB] g0d suite - INICIANDO MODO PRUEBAS EN VIVO (STAGING)
echo    Este entorno es aislado y no afecta a tus datos de produccion.
echo ====================================================================
echo.
call npm run dev:staging
echo.
pause
