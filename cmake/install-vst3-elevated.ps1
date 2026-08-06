param(
    [string]$Source = ""
)

$ErrorActionPreference = "Stop"

if (-not $Source) {
    $Source = Join-Path (Split-Path $PSScriptRoot -Parent) "build\Obstacle_artefacts\Release\VST3\Obstacle.vst3"
}

$dst = "C:\Program Files\Common Files\VST3"

if (-not (Test-Path $Source)) {
    Write-Error "VST3 not found: $Source (build the Release VST3 target first)"
    exit 1
}

New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -Recurse -Force -Path $Source -Destination $dst
Write-Host "Installed $Source -> $dst"
