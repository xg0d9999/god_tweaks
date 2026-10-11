@echo off
chcp 65001 >nul
title g0d suite - Diagnostico y Banco de Pruebas
cd /d "%~dp0"
echo ====================================================================
echo    [TEST] g0d suite - EJECUTANDO BANCO DE PRUEBAS Y DIAGNOSTICO
echo ====================================================================
echo.
call npm run test:bench
echo.
pause
