# g0d tweaks - Banco de Pruebas Automatizado (PowerShell Native)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "          ⚡ g0d tweaks | BANCO DE PRUEBAS AUTOMATIZADO ⚡       " -ForegroundColor White
Write-Host "        Suite de Diagnóstico, Verificación y Pruebas Unitarias  " -ForegroundColor Gray
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

node scripts/test-bench.mjs
exit $LASTEXITCODE
