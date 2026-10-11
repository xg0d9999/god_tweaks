@echo off
chcp 65001 >nul
title g0d tweaks - Publicar Actualizacion Oficial
cd /d "%~dp0"
echo ====================================================================
echo    [PROD] g0d tweaks - PUBLICANDO ACTUALIZACION OFICIAL A PRODUCCION
echo    Esta version se distribuira a todos los usuarios activos.
echo ====================================================================
echo.
call npm run release
echo.
pause
