@echo off
chcp 65001 >nul
title g0d tweaks - Publicar Actualización Oficial
cd /d "%~dp0"
echo ====================================================================
echo    ⚡ g0d tweaks ^| PUBLICANDO ACTUALIZACIÓN OFICIAL A PRODUCCIÓN
echo    Esta versión se distribuirá a todos los usuarios activos.
echo ====================================================================
echo.
npm run release
pause
