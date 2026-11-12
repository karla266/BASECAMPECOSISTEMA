#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
let hasErrors = false;

function fail(msg) {
  console.error(`[BLOQUEO CI] ${msg}`);
  hasErrors = true;
}

const requiredPaths = [
  'src/app/checkout',
  'src/app/calendario',
  'public/robots.txt'
];

for (const relPath of requiredPaths) {
  const fullPath = path.join(ROOT, relPath);
  const altPath = path.join(ROOT, relPath.replace('src/', ''));
  if (!fs.existsSync(fullPath) && !fs.existsSync(altPath)) {
    fail(`Falta ruta crítica requerida para conversión: ${relPath}`);
  }
}

const commercialDirs = ['vuelos', 'reservar', 'renta', 'cursos', 'ordenar', 'checkout', 'tienda'];
const forbiddenPatterns = [/wa\.me\//i, /api\.whatsapp\.com/i, /mercadolibre\.com/i];

function scanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanDir(full);
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          fail(`Enlace externo de fuga detectado (${pattern}) en archivo comercial: ${full}`);
        }
      }
      if (content.includes('href="/admin"') && !full.includes('admin')) {
        fail(`Ruta pública apunta indebidamente a área administrativa en: ${full}`);
      }
    }
  }
}

for (const dir of commercialDirs) {
  scanDir(path.join(ROOT, 'src/app', dir));
  scanDir(path.join(ROOT, 'app', dir));
}

if (hasErrors) {
  process.exit(1);
}
console.log('[OK] Guardia de conversión, checkout y rutas superada.');
