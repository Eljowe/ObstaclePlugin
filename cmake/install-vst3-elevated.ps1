param(
    [string]$Source = ""
)

$ErrorActionPreference = "Stop"

# Relaunch elevated (UAC prompt) if not already running as admin. The VS Code
# task runs this script directly, so without this the copy into Program Files
# would be denied. build-install-run.ps1 already launches us elevated, so this
# is a no-op there.
$principal = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    # Forward -Source so an explicit bundle path survives the relaunch (it may
    # contain spaces, so it is quoted inside the argument list).
    $argumentList = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $PSCommandPath)
    if ($Source) {
        $argumentList += @("-Source", "`"$Source`"")
    }

    $elevated = Start-Process powershell -Verb RunAs -Wait -PassThru -ArgumentList $argumentList
    exit $elevated.ExitCode
}

if (-not $Source) {
    $Source = Join-Path (Split-Path $PSScriptRoot -Parent) "build\Obstacle_artefacts\Release\VST3\Obstacle.vst3"
}

$dst = "C:\Program Files\Common Files\VST3"
$dstBundle = Join-Path $dst "Obstacle.vst3"

if (-not (Test-Path $Source)) {
    Write-Error "VST3 not found: $Source (build the Release VST3 target first)"
    exit 1
}

New-Item -ItemType Directory -Force -Path $dst | Out-Null

# Drop a stray desktop.ini from the source bundle so it is never copied across.
$srcIni = Join-Path $Source "desktop.ini"
if (Test-Path $srcIni) {
    attrib -s -h -r $srcIni | Out-Null
    Remove-Item -Force $srcIni
}

# Copy-Item fails with "access denied" when overwriting the old bundle in
# place (the stale desktop.ini is read-only/locked), so delete the old bundle
# first. If a file is locked (e.g. the folder is open in Explorer), fall back
# to robocopy, which overwrites read-only/system files.
if (Test-Path $dstBundle) {
    try {
        Remove-Item -Recurse -Force $dstBundle
    } catch {
        Write-Warning "Could not delete old bundle: $($_.Exception.Message)"
        Write-Host "Falling back to robocopy overwrite..."
        robocopy $Source $dstBundle /E /PURGE /R:1 /W:1 /NFL /NDL /NJH /NJS
        if ($LASTEXITCODE -ge 8) { exit 1 }
    }
}

if (-not (Test-Path $dstBundle)) {
    Copy-Item -Recurse -Force -Path $Source -Destination $dst
}

# Clear the FolderView (System/ReadOnly) hint on the bundle folder so Explorer
# does not create desktop.ini inside it again.
attrib -s -r $dstBundle | Out-Null

Write-Host "Installed $Source -> $dst"
