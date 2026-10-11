@echo off
chcp 65001 >nul
title g0d tweaks | Centro de Control y Automatización
cd /d "%~dp0"

:MENU
cls
echo ====================================================================
echo             ⚡ g0d tweaks - CENTRO DE CONTROL Y RELEASE ⚡
echo ====================================================================
echo.
echo   --- [BANCO DE PRUEBAS Y DESARROLLO (NO AFECTA A PRODUCCIÓN)] ---
echo   [1] Abrir Modo Pruebas en Vivo (Dev Staging / Lab)
echo   [2] Compilar Instalador .exe de Pruebas (Staging Build)
echo   [3] Publicar Versión de Pruebas a GitHub (Beta Pre-Release)
echo   [4] Ejecutar Diagnóstico Integral de Sistema (Test Bench)
echo.
echo   --- [PRODUCCIÓN OFICIAL (ACTUALIZA A TODOS LOS USUARIOS)] ---
echo   [5] Promocionar la versión Beta probada a PRODUCCIÓN OFICIAL
echo   [6] Publicar Actualización Oficial Directa a Producción
echo.
echo   --- [DESARROLLO AVANZADO] ---
echo   [7] Abrir en Modo Administrador (Dev Admin)
echo   [8] Salir
echo.
echo ====================================================================
set /p OPT="Selecciona una opción [1-8]: "

if "%OPT%"=="1" goto DEV_STAGING
if "%OPT%"=="2" goto BUILD_STAGING
if "%OPT%"=="3" goto RELEASE_BETA
if "%OPT%"=="4" goto TEST_BENCH
if "%OPT%"=="5" goto PROMOTE
if "%OPT%"=="6" goto RELEASE_PROD
if "%OPT%"=="7" goto DEV_ADMIN
if "%OPT%"=="8" exit
goto MENU

:DEV_STAGING
cls
echo [1/1] Iniciando g0d tweaks en Entorno de Pruebas Aislado (Dev Staging)...
npm run dev:staging
pause
goto MENU

:BUILD_STAGING
cls
echo [1/1] Compilando instalador .exe del Banco de Pruebas (Staging)...
npm run build:staging
echo.
echo Compilación finalizada. Los instaladores se encuentran en:
echo src-tauri\target\release\bundle\nsis
pause
goto MENU

:RELEASE_BETA
cls
echo [1/1] Publicando versión Beta / Pre-Release a GitHub...
npm run release:beta
pause
goto MENU

:TEST_BENCH
cls
echo [1/1] Ejecutando Banco de Pruebas y Diagnóstico Integral...
npm run test:bench
pause
goto MENU

:PROMOTE
cls
echo [1/1] Promocionando versión a Producción Oficial...
npm run release:promote
pause
goto MENU

:RELEASE_PROD
cls
echo [1/1] Publicando versión Oficial a Producción...
npm run release
pause
goto MENU

:DEV_ADMIN
cls
echo [1/1] Iniciando en Modo Administrador...
npm run dev:admin
goto MENU
