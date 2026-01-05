# Projekt másoló script
# Futtasd a projekt gyökér mappájában

$ErrorActionPreference = "Stop"

$sourcePath = $PSScriptRoot
$parentPath = Split-Path $sourcePath -Parent
$destPath = Join-Path $parentPath "arajanlat-keszito-crm"

Write-Host "Forras: $sourcePath"
Write-Host "Cel: $destPath"

# Törlés ha létezik
if (Test-Path $destPath) {
    Write-Host "Torles meglozo masolat..." -ForegroundColor Yellow
    Remove-Item $destPath -Recurse -Force
}

# Új mappa létrehozása
New-Item -ItemType Directory -Path $destPath -Force | Out-Null

# Másolás (node_modules nélkül)
$itemsToCopy = @(
    "backend",
    "src", 
    "public",
    "package.json",
    "README.md",
    "CRM_PROJECT_VISION.md",
    "MIGRATION_PLAN.md",
    "PROJECT_REVIEW.md"
)

foreach ($item in $itemsToCopy) {
    $sourceItem = Join-Path $sourcePath $item
    if (Test-Path $sourceItem) {
        Write-Host "Masolas: $item" -ForegroundColor Green
        Copy-Item -Path $sourceItem -Destination $destPath -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "Nincs: $item" -ForegroundColor Yellow
    }
}

Write-Host "`nMasolat kesz! Ide: $destPath" -ForegroundColor Cyan
Write-Host "`nKovetkezo lepesek:" -ForegroundColor Yellow
Write-Host "1. Nyisd meg az uj mappat: $destPath"
Write-Host "2. Telepitsd a fuggosegeket: npm install"
Write-Host "3. Hozz letre .env fajlt a sajat beallitasokkal"


