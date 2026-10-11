@echo off
chcp 65001 >nul
title g0d tweaks - Diagnostico y Banco de Pruebas
cd /d "%~dp0"
echo ====================================================================
echo    [TEST] g0d tweaks - EJECUTANDO BANCO DE PRUEBAS Y DIAGNOSTICO
echo ====================================================================
echo.
call npm run test:bench
echo.
pause
