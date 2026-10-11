@echo off
chcp 65001 >nul
title g0d tweaks - Modo Pruebas (Dev Staging)
cd /d "%~dp0"
echo ====================================================================
echo    🧪 g0d tweaks ^| INICIANDO MODO PRUEBAS EN VIVO (STAGING)
echo    Este entorno es aislado y no afecta a tus datos de producción.
echo ====================================================================
echo.
call npm run dev:staging
echo.
if errorlevel 1 (
    echo [ERROR] La ejecución finalizó con código de error.
)
pause
