# g0d tweaks - Publicador Automatizado a GitHub (PowerShell Native)
param(
    [string]$Token = "",
    [switch]$Minor,
    [switch]$Major,
    [switch]$SkipTest,
    [switch]$Initial
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$argsList = @()
if ($Token) { $argsList += "--token", $Token }
if ($Minor) { $argsList += "--minor" }
if ($Major) { $argsList += "--major" }
if ($SkipTest) { $argsList += "--skip-test" }
if ($Initial) { $argsList += "--initial" }

node scripts/publish.mjs @argsList
exit $LASTEXITCODE
