# Git repository setup script - RedLux Ajanlat projekt
# Futtasd a projekt mappájában!

Write-Host "=== RedLux Ajanlat Git Repository Setup ===" -ForegroundColor Cyan

# Ellenőrizzük, hogy a projekt mappában vagyunk-e
$currentPath = Get-Location
Write-Host "Jelenlegi mappa: $currentPath" -ForegroundColor Yellow

# Töröljük a régi .git mappát, ha van
if (Test-Path ".git") {
    Write-Host "`nRegi .git mappa torlese..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".git"
    Write-Host "Torolve!" -ForegroundColor Green
}

# Új git repo inicializálása
Write-Host "`nUj git repository inicializalasa..." -ForegroundColor Yellow
git init
Write-Host "Git inicializalva!" -ForegroundColor Green

# Git config beállítása
Write-Host "`nGit beallitasok..." -ForegroundColor Yellow
git config user.name "NovaroDigitalHungary"
git config user.email "digitalnovaro@gmail.com"
Write-Host "Beallitasok kesz!" -ForegroundColor Green

# .gitignore ellenőrzése
if (Test-Path ".gitignore") {
    Write-Host "`n.gitignore letezik" -ForegroundColor Green
} else {
    Write-Host "`nFIGYELEM: .gitignore nem talalhato!" -ForegroundColor Red
}

# Fájlok hozzáadása
Write-Host "`nFajlok hozzaadasa..." -ForegroundColor Yellow
git add .
Write-Host "Fajlok hozzaadva!" -ForegroundColor Green

# Első commit
Write-Host "`nElso commit keszitese..." -ForegroundColor Yellow
git commit -m "Initial commit - RedLux Ajanlat"
Write-Host "Commit kesz!" -ForegroundColor Green

# Branch neve
Write-Host "`nBranch beallitasa (main)..." -ForegroundColor Yellow
git branch -M main
Write-Host "Branch: main" -ForegroundColor Green

Write-Host "`n=== KESZ! ===" -ForegroundColor Cyan
Write-Host "`nKovetkezo lepesek:" -ForegroundColor Yellow
Write-Host "1. Hozz letre egy uj GitHub repository-t: https://github.com/new" -ForegroundColor White
Write-Host "2. Add hozza a remote-ot:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/Renopapa/redlux-ajanlat.git" -ForegroundColor Gray
Write-Host "3. Push:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Gray

