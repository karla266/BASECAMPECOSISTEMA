#!/usr/bin/env bash
# Empaqueta Basecamp 420 (Next.js standalone) y lo publica por SSH en Hostinger.
# No lee ni escribe secretos. .env.production se queda en el servidor.
#
# Preflight, sin compilar ni conectar:
#   bash scripts/deploy_hostinger.sh --check
#
# Despliegue, con el usuario y el host del panel:
#   HOSTINGER_SSH_USER=uXXXXXXXX HOSTINGER_SSH_HOST=ssh.ejemplo.com bash scripts/deploy_hostinger.sh
#
# Opcional: HOSTINGER_SSH_KEY, HOSTINGER_REMOTE_DIR, PM2_APP_NAME.

set -euo pipefail

HOSTINGER_SSH_PORT=65002
HOSTINGER_SSH_USER="${HOSTINGER_SSH_USER:-}"
HOSTINGER_SSH_HOST="${HOSTINGER_SSH_HOST:-}"
HOSTINGER_SSH_KEY="${HOSTINGER_SSH_KEY:-}"
HOSTINGER_REMOTE_DIR="${HOSTINGER_REMOTE_DIR:-~/domains/basecamp420.com/public_html}"
PM2_APP_NAME="${PM2_APP_NAME:-basecamp420}"

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ"

advertir_entorno() {
  printf '\n'
  printf '\033[1;33m%s\033[0m\n' '================================================================'
  printf '\033[1;33m%s\033[0m\n' ' ADVERTENCIA DE ENTORNO'
  printf '\033[1;33m%s\033[0m\n' '================================================================'
  printf '%s\n' 'Este script no copia .env.production ni ninguna llave.'
  printf '%s\n' 'En el servidor, abre .env.production y confirma que sigan vigentes:'
  printf '%s\n' '  - Mercado Pago: MP_ACCESS_TOKEN y MP_WEBHOOK_SECRET'
  printf '%s\n' '  - SICAR: SICAR_HOST y el resto de accesos de esa base'
  printf '\033[1;33m%s\033[0m\n' '================================================================'
  printf '\n'
}

exigir_herramientas() {
  local faltan=0
  local herramienta
  for herramienta in npm npx ssh tar; do
    if ! command -v "$herramienta" >/dev/null 2>&1; then
      printf 'Falta %s en esta máquina.\n' "$herramienta" >&2
      faltan=1
    fi
  done
  if [[ "$faltan" -ne 0 ]]; then
    exit 1
  fi
}

validar_destino() {
  if [[ -z "$HOSTINGER_SSH_USER" || -z "$HOSTINGER_SSH_HOST" ]]; then
    printf '%s\n' 'Define HOSTINGER_SSH_USER y HOSTINGER_SSH_HOST. El script no inventa el servidor.' >&2
    exit 1
  fi
  if [[ ! "$HOSTINGER_SSH_USER" =~ ^[A-Za-z0-9._-]+$ ]]; then
    printf '%s\n' 'HOSTINGER_SSH_USER tiene caracteres no permitidos.' >&2
    exit 1
  fi
  if [[ ! "$HOSTINGER_SSH_HOST" =~ ^[A-Za-z0-9.-]+$ ]]; then
    printf '%s\n' 'HOSTINGER_SSH_HOST tiene caracteres no permitidos.' >&2
    exit 1
  fi
  if [[ ! "$HOSTINGER_REMOTE_DIR" =~ ^[A-Za-z0-9_./~-]+$ ]]; then
    printf '%s\n' 'HOSTINGER_REMOTE_DIR tiene caracteres no permitidos.' >&2
    exit 1
  fi
  if [[ ! "$PM2_APP_NAME" =~ ^[A-Za-z0-9._-]+$ ]]; then
    printf '%s\n' 'PM2_APP_NAME tiene caracteres no permitidos.' >&2
    exit 1
  fi
  if [[ -n "$HOSTINGER_SSH_KEY" && ! -f "$HOSTINGER_SSH_KEY" ]]; then
    printf 'No existe la llave SSH: %s\n' "$HOSTINGER_SSH_KEY" >&2
    exit 1
  fi
}

opciones_ssh() {
  SSH_BASE=(
    -p "$HOSTINGER_SSH_PORT"
    -o BatchMode=yes
    -o ConnectTimeout=20
    -o ServerAliveInterval=30
  )
  if [[ -n "$HOSTINGER_SSH_KEY" ]]; then
    SSH_BASE+=(-i "$HOSTINGER_SSH_KEY" -o IdentitiesOnly=yes)
  fi
}

compilar() {
  printf '%s\n' 'Typecheck. next build de este repo no detiene errores de TypeScript.'
  npx tsc --noEmit --pretty false --incremental false
  printf '%s\n' 'Compilación Next.js standalone.'
  npm run build
  if [[ ! -f .next/standalone/server.js ]]; then
    printf '%s\n' 'La compilación no dejó .next/standalone/server.js.' >&2
    exit 1
  fi
  mkdir -p .next/standalone/.next
  rm -rf .next/standalone/.next/static
  cp -R .next/static .next/standalone/.next/static
  rm -rf .next/standalone/public
  cp -R public .next/standalone/public
  printf '%s\n' 'Standalone listo: .next/standalone/server.js, estáticos y public.'
}

transferir() {
  local destino="${HOSTINGER_SSH_USER}@${HOSTINGER_SSH_HOST}"
  # /node_modules solo en la raíz. .next/standalone/node_modules sí viaja.
  local exclusiones=(
    --include '.env.example'
    --exclude '/node_modules'
    --exclude '/.git'
    --exclude '.env'
    --exclude '.env.local'
    --exclude '.env.production'
    --exclude '.env.development'
    --exclude '.env.*'
    --exclude '/secrets'
    --exclude '/coverage'
    --exclude '*.log'
    --exclude '.next/cache'
    --exclude 'data/admin-acceso.json'
    --exclude 'data/ordenes_palapa.json'
    --exclude 'client_secret*.json'
  )
  local rsh="ssh -p ${HOSTINGER_SSH_PORT} -o BatchMode=yes -o ConnectTimeout=20 -o ServerAliveInterval=30"
  if [[ -n "$HOSTINGER_SSH_KEY" ]]; then
    rsh="${rsh} -i ${HOSTINGER_SSH_KEY} -o IdentitiesOnly=yes"
  fi
  printf 'Transferencia al puerto %s, destino %s:%s\n' "$HOSTINGER_SSH_PORT" "$destino" "$HOSTINGER_REMOTE_DIR"
  if command -v rsync >/dev/null 2>&1; then
    rsync -az -e "$rsh" "${exclusiones[@]}" ./ "${destino}:${HOSTINGER_REMOTE_DIR}/"
    return
  fi
  printf '%s\n' 'rsync no está en esta máquina. La transferencia usa tar por SSH.'
  tar -czf - \
    --exclude=./node_modules \
    --exclude=./.git \
    --exclude=./.env \
    --exclude=./.env.local \
    --exclude=./.env.production \
    --exclude=./.env.development \
    --exclude=./secrets \
    --exclude=./coverage \
    --exclude=./.next/cache \
    --exclude=./data/admin-acceso.json \
    --exclude=./data/ordenes_palapa.json \
    -C "$RAIZ" . \
    | ssh "${SSH_BASE[@]}" "$destino" "mkdir -p ${HOSTINGER_REMOTE_DIR} && tar -xzf - -C ${HOSTINGER_REMOTE_DIR}"
}

reiniciar() {
  local destino="${HOSTINGER_SSH_USER}@${HOSTINGER_SSH_HOST}"
  printf 'Dependencias de producción y pm2 restart %s\n' "$PM2_APP_NAME"
  ssh "${SSH_BASE[@]}" "$destino" \
    "cd ${HOSTINGER_REMOTE_DIR} && npm install --production && pm2 restart ${PM2_APP_NAME}"
}

if [[ "${1:-}" == "--check" ]]; then
  printf '%s\n' 'Preflight de deploy_hostinger.sh'
  printf 'Puerto SSH obligatorio: %s\n' "$HOSTINGER_SSH_PORT"
  printf 'Directorio remoto por defecto: %s\n' "$HOSTINGER_REMOTE_DIR"
  printf 'Proceso PM2: %s\n' "$PM2_APP_NAME"
  printf '%s\n' 'Sin compilación y sin conexión. Sintaxis lista para el equipo operativo.'
  exit 0
fi

exigir_herramientas
validar_destino
opciones_ssh
compilar
transferir
reiniciar
advertir_entorno
printf '%s\n' 'Despliegue terminado. Revisa el semáforo de la app en Hostinger.'
