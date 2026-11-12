#!/bin/bash
set -euo pipefail

echo "=== Consolidando Biblioteca Completa Basecamp 420 en Repositorio Real ==="
echo 'Curso APPI configurado en: $30,000 MXN (Anticipo: $3,800 MXN)'

node scripts/ci-audit-gates.mjs
git add .github/ scripts/ public/ next.config.mjs src/
git commit -m "feat(site): consolidar 32 archivos, checkout unico, curso APPI 30000 y CI/CD Hostinger" || true
git push origin main
