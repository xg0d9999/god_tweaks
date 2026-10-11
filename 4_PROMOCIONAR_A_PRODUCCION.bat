@echo off
chcp 65001 >nul
title g0d tweaks - Promocionar a Produccion Oficial
cd /d "%~dp0"
echo ====================================================================
echo    [PROD] g0d tweaks - PROMOCIONANDO BETA A PRODUCCION OFICIAL
echo    Esta version se distribuira a todos los usuarios activos.
echo ====================================================================
echo.
call npm run release:promote
echo.
pause
