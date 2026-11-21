$ErrorActionPreference = "Stop"

# Native executables (cmake) do not throw on a non-zero exit code in Windows
# PowerShell 5.1, even with ErrorActionPreference=Stop. Check every step
# explicitly so a failed compile cannot silently install the previous build.
function Assert-LastExitCode {
    param([string]$Step)

    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "ERROR: $Step failed with exit code $LASTEXITCODE." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

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
Assert-LastExitCode "CMake configure"

cmake --build build --config Release --target Obstacle_Standalone Obstacle_VST3
Assert-LastExitCode "CMake build"

cmake --install build --config Release --prefix $env:OBSTACLE_HOME
Assert-LastExitCode "CMake install"

# UAC can be declined; Start-Process -Verb RunAs throws in that case, which
# with ErrorActionPreference=Stop would print a raw exception. Report it
# clearly and leave the per-user install (already done above) in place.
$elevatedInstall = $null
try {
    $elevatedInstall = Start-Process powershell -Verb RunAs -Wait -PassThru -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", (Join-Path $projectRoot "cmake\install-vst3-elevated.ps1")
} catch {
    Write-Host ""
    Write-Host "ERROR: VST3 install cancelled/failed; the build in the user profile is still installed." -ForegroundColor Red
    Write-Host "       $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

if ($elevatedInstall.ExitCode -ne 0) {
    Write-Host ""
    Write-Host "ERROR: VST3 install failed with exit code $($elevatedInstall.ExitCode)." -ForegroundColor Red
    exit $elevatedInstall.ExitCode
}

Remove-Item -Recurse -Force (Join-Path $env:OBSTACLE_HOME "VST3") -ErrorAction SilentlyContinue

Start-Process -FilePath (Join-Path $env:OBSTACLE_HOME "Obstacle.exe")
