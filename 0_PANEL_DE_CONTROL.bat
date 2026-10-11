@echo off
chcp 65001 >nul
title g0d suite - Centro de Control y Automatizacion
cd /d "%~dp0"

net session >nul 2>&1
if %errorLevel% neq 0 (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

:MENU
cls
echo ====================================================================
echo             ⚡ g0d suite - CENTRO DE CONTROL Y RELEASE ⚡
echo ====================================================================
echo.
echo   --- [BANCO DE PRUEBAS Y DESARROLLO (NO AFECTA A PRODUCCION)] ---
echo   [1] Abrir Modo Pruebas en Vivo (Dev Staging / Lab)
echo   [2] Compilar Instalador .exe de Pruebas (Staging Build)
echo   [3] Publicar Version de Pruebas a GitHub (Beta Pre-Release)
echo   [4] Ejecutar Diagnostico Integral de Sistema (Test Bench)
echo.
echo   --- [PRODUCCION OFICIAL (ACTUALIZA A TODOS LOS USUARIOS)] ---
echo   [5] Promocionar la version Beta probada a PRODUCCION OFICIAL
echo   [6] Publicar Actualizacion Oficial Directa a Produccion
echo.
echo   --- [INTEGRACION Y COMUNIDAD] ---
echo   [7] Iniciar Bot de Discord para Anuncios (/actualizacion)
echo.
echo   --- [DESARROLLO AVANZADO] ---
echo   [8] Abrir en Modo Administrador (Dev Admin)
echo   [9] Salir
echo.
echo ====================================================================
set /p OPT="Selecciona una opcion [1-9]: "

if "%OPT%"=="1" goto DEV_STAGING
if "%OPT%"=="2" goto BUILD_STAGING
if "%OPT%"=="3" goto RELEASE_BETA
if "%OPT%"=="4" goto TEST_BENCH
if "%OPT%"=="5" goto PROMOTE
if "%OPT%"=="6" goto RELEASE_PROD
if "%OPT%"=="7" goto DISCORD_BOT
if "%OPT%"=="8" goto DEV_ADMIN
if "%OPT%"=="9" exit
goto MENU

:DEV_STAGING
cls
echo [1/1] Iniciando g0d suite en Entorno de Pruebas Aislado (Dev Staging)...
call npm run dev:staging
echo.
pause
goto MENU

:BUILD_STAGING
cls
echo [1/1] Compilando instalador .exe del Banco de Pruebas (Staging)...
call npm run build:staging
echo.
echo Compilacion finalizada.
pause
goto MENU

:RELEASE_BETA
cls
echo [1/1] Publicando version Beta / Pre-Release a GitHub...
call npm run release:beta
echo.
pause
goto MENU

:TEST_BENCH
cls
echo [1/1] Ejecutando Banco de Pruebas y Diagnostico Integral...
call npm run test:bench
echo.
pause
goto MENU

:PROMOTE
cls
echo [1/1] Promocionando version a Produccion Oficial...
call npm run release:promote
echo.
pause
goto MENU

:RELEASE_PROD
cls
echo [1/1] Publicando version Oficial a Produccion...
call npm run release
echo.
pause
:DISCORD_BOT
cls
call "7_BOT_DISCORD_ANUNCIOS.bat"
goto MENU

:DEV_ADMIN
cls
echo [1/1] Iniciando en Modo Administrador...
call npm run dev:admin
goto MENU
