param(
  [Parameter(Mandatory = $true)]
  [string]$brand,
  [Parameter(Mandatory = $true)]
  [string]$domain,
  [Parameter(Mandatory = $true)]
  [string]$phone
)

$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$configPath = Join-Path $projectRoot "tenant.config.json"

if (-not (Test-Path $configPath)) {
  throw "No se encontró tenant.config.json en $configPath"
}

$raw = Get-Content -Path $configPath -Raw -Encoding UTF8
$config = $raw | ConvertFrom-Json

$config.brandName = $brand
$config.domain = $domain
$config.supportPhone = ($phone -replace "[^\d]", "")
$config.tenantId = (($brand.ToLower() -replace "[^a-z0-9]+", "-").Trim("-"))

$json = $config | ConvertTo-Json -Depth 10
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($configPath, $json + [Environment]::NewLine, $utf8NoBom)

if (-not $config.tenantId) {
  throw "No se pudo construir tenantId."
}
if (-not ($config.domain -match "\.")) {
  throw "Dominio inválido: $($config.domain)"
}
if ($config.supportPhone.Length -lt 10) {
  throw "Teléfono inválido: $($config.supportPhone)"
}

Write-Host "Tenant actualizado:"
Write-Host "  tenantId: $($config.tenantId)"
Write-Host "  brandName: $($config.brandName)"
Write-Host "  domain: $($config.domain)"
Write-Host "  supportPhone: $($config.supportPhone)"
