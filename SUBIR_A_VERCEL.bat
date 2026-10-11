@echo off
chcp 65001 >nul
title Desplegar Landing Page en Vercel - g0d suite
color 0b

echo ======================================================================
echo          g0d suite - DESPLIEGUE OFICIAL EN VERCEL
echo ======================================================================
echo.
echo [1/3] Compilando la landing page en modo produccion...
echo.

cd /d "%~dp0landing"
call npm.cmd run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] La compilacion ha fallado. Revisa los errores anteriores.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ======================================================================
echo [2/3] Verificando credenciales de Vercel...
echo ======================================================================

set HAS_AUTH=0
if exist "%APPDATA%\com.vercel.cli\Data\auth.json" set HAS_AUTH=1
if exist "%APPDATA%\com.vercel.cli\auth.json" set HAS_AUTH=1
if exist "%LOCALAPPDATA%\com.vercel.cli\auth.json" set HAS_AUTH=1

if "%HAS_AUTH%"=="0" (
    echo.
    echo [!] No se han detectado credenciales de Vercel guardadas en este equipo.
    echo Vamos a conectar tu cuenta. En el siguiente paso puedes elegir:
    echo   - GitHub (Recomendado)
    echo   - Email / GitLab / Bitbucket
    echo.
    echo Presiona cualquier tecla para abrir el inicio de sesion de Vercel...
    pause >nul
    echo.
    call npx.cmd vercel login
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] No se pudo completar el inicio de sesion en Vercel.
        pause
        exit /b %ERRORLEVEL%
    )
) else (
    echo [OK] Sesion de Vercel detectada correctamente.
)

echo.
echo ======================================================================
echo [3/3] Publicando landing page en produccion...
echo ======================================================================
echo.

call npx.cmd vercel deploy --prod --yes

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo  ?DESPLIEGUE COMPLETADO CON EXITO EN VERCEL!
    echo ======================================================================
    echo.
    echo Tu landing page ya esta en vivo en Vercel con SSL y CDN global.
) else (
    echo.
    echo [AVISO] El despliegue finalizo con codigo %ERRORLEVEL%.
)

echo.
pause