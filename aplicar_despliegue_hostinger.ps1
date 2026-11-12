$ErrorActionPreference = "Stop"
Write-Host '=== Consolidando Biblioteca Completa Basecamp 420 ===' -ForegroundColor Cyan
Write-Host 'Curso APPI configurado en: $30,000 MXN (Anticipo: $3,800 MXN)' -ForegroundColor Green
node scripts/ci-audit-gates.mjs
git add .github/ scripts/ public/ next.config.mjs src/
git commit -m "feat(site): consolidar 32 archivos, checkout unico, curso APPI 30000 y CI/CD Hostinger"
git push origin main
