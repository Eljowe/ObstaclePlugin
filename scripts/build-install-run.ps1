$ErrorActionPreference = "Stop"

$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot

Get-Process -Name Obstacle -ErrorAction SilentlyContinue | Stop-Process -Force

$env:OBSTACLE_HOME = Join-Path $env:USERPROFILE "Obstacle"
$vst3Dir = Join-Path $env:OBSTACLE_HOME "VST3"

if (-not (Test-Path build -PathType Container)) {
    cmake -S . -B build "-DOBSTACLE_VST3_DIR=$vst3Dir" | Out-Null
} else {
    cmake -B build "-DOBSTACLE_VST3_DIR=$vst3Dir" | Out-Null
}

cmake --build build --config Release --target Obstacle_Standalone Obstacle_VST3
cmake --install build --config Release --prefix $env:OBSTACLE_HOME

Start-Process powershell -Verb RunAs -Wait -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", (Join-Path $projectRoot "cmake\install-vst3-elevated.ps1")

Remove-Item -Recurse -Force (Join-Path $env:OBSTACLE_HOME "VST3") -ErrorAction SilentlyContinue

Start-Process -FilePath (Join-Path $env:OBSTACLE_HOME "Obstacle.exe")
