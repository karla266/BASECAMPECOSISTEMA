#!/usr/bin/env bash
set -euo pipefail

required=(
  SICAR_HOST
  SICAR_PORT
  SICAR_USER
  SICAR_PASSWORD
  SICAR_DATABASE
  DB_HOST
  DB_PORT
  DB_USER
  DB_PASSWORD
  DB_NAME
  MP_ACCESS_TOKEN
  MP_WEBHOOK_SECRET
  NEXT_PUBLIC_POS_API_BASE
)

placeholder_re='^(|change[-_ ]?me|your[-_ ]|replace[-_ ]|placeholder|example|todo|xxx+)$'
missing=0

for key in "${required[@]}"; do
  value="${!key-}"
  if [[ -z "$value" || "$value" =~ $placeholder_re ]]; then
    printf 'Missing or placeholder production variable: %s\n' "$key" >&2
    missing=1
  fi
done

if [[ "${1-}" == "--contract-only" ]]; then
  printf 'Production environment contract checked: %s required names.\n' "${#required[@]}"
  exit 0
fi

if (( missing )); then
  exit 1
fi

printf 'Production environment variables are present and non-placeholder. Values were not printed.\n'
