# Geckium Installer for Windows
# Dependency-free PowerShell installer for Geckium
# Run: Right-click > Run with PowerShell, or: powershell -ExecutionPolicy Bypass -File install.ps1

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Geckium Installer" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "$ScriptDir\Profile Folder")) {
    Write-Host "[ERROR] Could not find 'Profile Folder' directory." -ForegroundColor Red
    Write-Host "Run this script from the Geckium extracted folder."
    exit 1
}

Write-Host "[1/4] Finding Firefox profile..."

$Profiles = @()
$BasePaths = @(
    "$env:APPDATA\Mozilla\Firefox\Profiles",
    "$env:LOCALAPPDATA\Mozilla\Firefox\Profiles"
)

foreach ($Base in $BasePaths) {
    if (Test-Path $Base) {
        $Profiles = Get-ChildItem -Path $Base -Directory -Filter "*default*" | Select-Object -ExpandProperty FullName
        break
    }
}

if ($Profiles.Count -eq 0) {
    Write-Host "[ERROR] No Firefox profile found" -ForegroundColor Red
    exit 1
}

if ($Profiles.Count -eq 1) {
    $ProfileDir = $Profiles[0]
} else {
    Write-Host ""
    Write-Host "Multiple profiles found:"
    for ($i = 0; $i -lt $Profiles.Count; $i++) {
        Write-Host "  $($i+1). $(Split-Path $Profiles[$i] -Leaf)"
    }
    while ($true) {
        $choice = Read-Host "Select profile (number)"
        if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $Profiles.Count) {
            $ProfileDir = $Profiles[[int]$choice - 1]
            break
        }
        Write-Host "Invalid choice, try again"
    }
}
Write-Host "  Found: $ProfileDir"

Write-Host ""
Write-Host "[2/4] Finding Firefox installation..."

$InstallDir = ""
$Candidates = @(
    "${env:ProgramFiles}\Mozilla Firefox",
    "${env:ProgramFiles(x86)}\Mozilla Firefox"
)
foreach ($p in $Candidates) {
    if (Test-Path "$p\application.ini") {
        $InstallDir = $p
        break
    }
}

if (-not $InstallDir) {
    Write-Host "[WARNING] Firefox installation not found." -ForegroundColor Yellow
    Write-Host "You'll need to manually copy config.js and config-prefs.js."
} else {
    Write-Host "  Found: $InstallDir"
}

Write-Host ""
Write-Host "[3/4] Installing Geckium..."
Write-Host "  Profile: $ProfileDir"
if ($InstallDir) { Write-Host "  Install: $InstallDir" }
Write-Host ""

$confirm = Read-Host "Continue? [Y/n]"
if ($confirm -ne "" -and $confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Cancelled."
    exit 0
}

Write-Host ""
Write-Host "  Copying Geckium files..."

$ChromeDir = Join-Path $ProfileDir "chrome"
if (Test-Path $ChromeDir) {
    Write-Host "  Removing existing chrome folder..."
    Remove-Item -Recurse -Force $ChromeDir
}

Copy-Item -Recurse "$ScriptDir\Profile Folder\chrome" $ChromeDir
Write-Host "  Copied chrome/"

$ChrThemesSrc = "$ScriptDir\Profile Folder\chrThemes"
$ChrThemesDst = Join-Path $ProfileDir "chrThemes"
if ((Test-Path $ChrThemesSrc) -and -not (Test-Path $ChrThemesDst)) {
    Copy-Item -Recurse $ChrThemesSrc $ChrThemesDst
    Write-Host "  Copied chrThemes/"
} else {
    Write-Host "  chrThemes/ already exists, skipping"
}

if ($InstallDir) {
    Write-Host ""
    Write-Host "  Copying autoconfig files..."
    Copy-Item "$ScriptDir\Firefox Folder\config.js" "$InstallDir\config.js" -Force
    Write-Host "  Copied config.js"
    New-Item -ItemType Directory -Path "$InstallDir\defaults\pref" -Force | Out-Null
    Copy-Item "$ScriptDir\Firefox Folder\defaults\pref\config-prefs.js" "$InstallDir\defaults\pref\config-prefs.js" -Force
    Write-Host "  Copied config-prefs.js"
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Installation complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Next steps:"
Write-Host "  1. Open about:support"
Write-Host "  It will restart Firefox 1/2 times"
Write-Host "  3. Geckium set up wizard will appear on the first run"
Write-Host ""
