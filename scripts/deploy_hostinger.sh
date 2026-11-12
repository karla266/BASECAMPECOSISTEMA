#!/usr/bin/env bash
set -euo pipefail

HOSTINGER_SSH_HOST="${HOSTINGER_SSH_HOST:-basecamp420.com}"
HOSTINGER_SSH_PORT="65002"
HOSTINGER_SSH_USER="${HOSTINGER_SSH_USER:-u893741392}"
HOSTINGER_SSH_KEY="${HOSTINGER_SSH_KEY:-}"
APP_ROOT="${HOSTINGER_APP_ROOT:-/home/u893741392/domains/basecamp420.com}"

if [[ -z "$HOSTINGER_SSH_KEY" ]]; then
  printf 'HOSTINGER_SSH_KEY is required.\n' >&2
  exit 2
fi

ssh_args=(
  -p "$HOSTINGER_SSH_PORT"
  -o BatchMode=yes
  -o ConnectTimeout=20
  -o ServerAliveInterval=30
  -o IdentitiesOnly=yes
  -i "$HOSTINGER_SSH_KEY"
)

printf 'Checking deployed Basecamp 420 runtime on %s:%s.\n' "$HOSTINGER_SSH_HOST" "$HOSTINGER_SSH_PORT"

ssh "${ssh_args[@]}" "$HOSTINGER_SSH_USER@$HOSTINGER_SSH_HOST" "APP_ROOT='$APP_ROOT' bash -s" <<'REMOTE'
set -euo pipefail

: "${APP_ROOT:?APP_ROOT is required}"

if [[ ! -d "$APP_ROOT" ]]; then
  printf 'Application root does not exist: %s\n' "$APP_ROOT" >&2
  exit 1
fi

REMOTE

ssh "${ssh_args[@]}" "$HOSTINGER_SSH_USER@$HOSTINGER_SSH_HOST" 'bash -s' < scripts/ensure_persistent_uploads.sh
ssh "${ssh_args[@]}" "$HOSTINGER_SSH_USER@$HOSTINGER_SSH_HOST" 'bash -s -- --server-check' < scripts/verify_production_env.sh
ssh "${ssh_args[@]}" "$HOSTINGER_SSH_USER@$HOSTINGER_SSH_HOST" "mkdir -p '$APP_ROOT/tmp' && touch '$APP_ROOT/tmp/restart.txt'"

printf 'Passenger restart signal written and persistent runtime checks passed.\n'
