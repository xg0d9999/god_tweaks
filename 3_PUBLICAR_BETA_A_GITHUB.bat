@echo off
chcp 65001 >nul
title g0d tweaks - Publicar Beta a GitHub
cd /d "%~dp0"
echo ====================================================================
echo    🧪 g0d tweaks ^| PUBLICANDO VERSIÓN BETA A GITHUB (PRE-RELEASE)
echo    Los usuarios de la versión normal NO recibirán esta actualización.
echo ====================================================================
echo.
npm run release:beta
pause
