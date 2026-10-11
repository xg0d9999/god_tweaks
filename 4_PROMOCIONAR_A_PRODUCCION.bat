@echo off
chcp 65001 >nul
title g0d tweaks - Promocionar a Producción Oficial
cd /d "%~dp0"
echo ====================================================================
echo    🚀 g0d tweaks ^| PROMOCIONANDO BETA A PRODUCCIÓN OFICIAL
echo    ¡ATENCIÓN! Esta versión se auto-actualizará a todos los usuarios.
echo ====================================================================
echo.
npm run release:promote
pause
