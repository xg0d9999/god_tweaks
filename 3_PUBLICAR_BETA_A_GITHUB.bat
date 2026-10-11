@echo off
chcp 65001 >nul
title g0d suite - Publicar Beta a GitHub
cd /d "%~dp0"
echo ====================================================================
echo    [LAB] g0d suite - PUBLICANDO VERSION BETA A GITHUB (PRE-RELEASE)
echo    Los usuarios de la version normal NO recibiran esta actualizacion.
echo ====================================================================
echo.
call npm run release:beta
echo.
pause
