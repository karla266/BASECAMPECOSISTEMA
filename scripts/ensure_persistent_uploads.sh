#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${HOSTINGER_APP_ROOT:-/home/u893741392/domains/basecamp420.com}"
SHARED_UPLOADS="${HOSTINGER_SHARED_UPLOADS:-/home/u893741392/shared_uploads}"
ACTIVE_BUILD_UPLOADS="$APP_ROOT/hbuilds/current/nodejs/public/uploads"
PUBLIC_UPLOADS="$APP_ROOT/public_html/uploads"
BACKUP_ROOT="$APP_ROOT/.upload-migrations"

mkdir -p "$SHARED_UPLOADS" "$BACKUP_ROOT"

link_uploads() {
  local target="$1"
  local stamp backup

  if [[ -L "$target" ]]; then
    if [[ "$(readlink -f "$target")" == "$(readlink -f "$SHARED_UPLOADS")" ]]; then
      return 0
    fi
    printf 'Refusing to replace unexpected symlink: %s\n' "$target" >&2
    return 1
  fi

  if [[ -e "$target" ]]; then
    stamp="$(date -u +%Y%m%dT%H%M%SZ)"
    backup="$BACKUP_ROOT/$(basename "$target")-$stamp"
    mkdir -p "$(dirname "$target")"
    cp -a "$target/." "$SHARED_UPLOADS/"
    mv "$target" "$backup"
    printf 'Migrated existing uploads to %s\n' "$SHARED_UPLOADS"
    printf 'Preserved pre-link directory at %s\n' "$backup"
  else
    mkdir -p "$(dirname "$target")"
  fi

  ln -s "$SHARED_UPLOADS" "$target"
}

link_uploads "$ACTIVE_BUILD_UPLOADS"
link_uploads "$PUBLIC_UPLOADS"

[[ -L "$ACTIVE_BUILD_UPLOADS" ]]
[[ -L "$PUBLIC_UPLOADS" ]]
[[ "$(readlink -f "$ACTIVE_BUILD_UPLOADS")" == "$(readlink -f "$SHARED_UPLOADS")" ]]
[[ "$(readlink -f "$PUBLIC_UPLOADS")" == "$(readlink -f "$SHARED_UPLOADS")" ]]
printf 'Persistent uploads verified for active build and public web root.\n'
