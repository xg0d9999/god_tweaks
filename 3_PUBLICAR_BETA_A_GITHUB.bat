@echo off
chcp 65001 >nul
title g0d tweaks - Publicar Beta a GitHub
cd /d "%~dp0"
echo ====================================================================
echo    🧪 g0d tweaks ^| PUBLICANDO VERSIÓN BETA A GITHUB (PRE-RELEASE)
echo    Los usuarios de la versión normal NO recibirán esta actualización.
echo ====================================================================
echo.
call npm run release:beta
echo.
if errorlevel 1 (
    echo ====================================================================
    echo    ❌ La publicación de la Beta no se pudo completar.
    echo    Revisa el mensaje superior para ver el motivo exacto.
    echo ====================================================================
) else (
    echo ====================================================================
    echo    ✔ Versión Beta publicada con éxito en GitHub (Pre-Release).
    echo ====================================================================
)
echo.
pause
