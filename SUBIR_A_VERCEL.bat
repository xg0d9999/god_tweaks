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
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] La compilacion ha fallado. Revisa los errores anteriores.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ======================================================================
echo [2/3] Conectando y publicando en Vercel...
echo.
echo (Si es tu primera vez, Vercel abrira una ventana de navegador para)
echo (iniciar sesion con tu cuenta de GitHub/Vercel con 1 clic)
echo ======================================================================
echo.

call npx vercel deploy --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo  ¡DESPLIEGUE COMPLETADO CON EXITO EN VERCEL!
    echo ======================================================================
    echo.
    echo Tu landing page ya esta en vivo en Vercel con SSL y CDN global.
) else (
    echo.
    echo [AVISO] El comando finalizo con codigo %ERRORLEVEL%.
)

echo.
pause
