@echo off
chcp 65001 >nul
title g0d suite - Publicar Actualizacion Oficial
cd /d "%~dp0"
echo ====================================================================
echo    [PROD] g0d suite - PUBLICANDO ACTUALIZACION OFICIAL A PRODUCCION
echo    Esta version se distribuira a todos los usuarios activos.
echo ====================================================================
echo.
call npm run release
echo.
pause
