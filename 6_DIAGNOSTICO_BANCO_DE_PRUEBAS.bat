@echo off
chcp 65001 >nul
title g0d tweaks - Diagnóstico y Banco de Pruebas
cd /d "%~dp0"
echo ====================================================================
echo    🔍 g0d tweaks ^| EJECUTANDO BANCO DE PRUEBAS Y DIAGNÓSTICO
echo ====================================================================
echo.
npm run test:bench
pause
