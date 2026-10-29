param(
  [string]$EntryScript = "",
  [string]$AppName = "Basecamp420_POS"
)

$ErrorActionPreference = "Stop"

function Resolve-ProjectRoot {
  return (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

function Find-IsccPath {
  $default = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
  if (Test-Path $default) { return $default }
  $inPath = Get-Command ISCC.exe -ErrorAction SilentlyContinue
  if ($inPath) { return $inPath.Source }
  throw "No se encontró ISCC.exe. Instala Inno Setup 6 o agrega ISCC al PATH."
}

function Resolve-EntryScript([string]$Root, [string]$Explicit) {
  if ($Explicit) {
    $candidate = Join-Path $Root $Explicit
    if (Test-Path $candidate) { return $candidate }
    throw "No existe el entry script especificado: $candidate"
  }

  $candidates = @(
    (Join-Path $Root "backend\main.py"),
    (Join-Path $Root "backend\app.py"),
    (Join-Path $Root "main.py")
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) { return $candidate }
  }

  throw "No se encontró un entry script Python. Usa -EntryScript ruta\archivo.py"
}

$root = Resolve-ProjectRoot
$distPath = Join-Path $root "dist"
$buildPath = Join-Path $root "build"
$distInstaller = Join-Path $root "dist_installer"
$specPath = Join-Path $root "$AppName.spec"
$entry = Resolve-EntryScript -Root $root -Explicit $EntryScript
$iscc = Find-IsccPath
$issPath = Join-Path $root "scripts\installer.iss"

Write-Host "Limpiando artefactos previos..."
if (Test-Path $distPath) { Remove-Item $distPath -Recurse -Force }
if (Test-Path $buildPath) { Remove-Item $buildPath -Recurse -Force }
if (Test-Path $distInstaller) { Remove-Item $distInstaller -Recurse -Force }
if (Test-Path $specPath) { Remove-Item $specPath -Force }

Write-Host "Compilando PyInstaller..."
& pyinstaller --noconfirm --clean --name $AppName --onedir --hidden-import anyio --hidden-import uvicorn --hidden-import sqlite3 $entry
if ($LASTEXITCODE -ne 0) {
  throw "PyInstaller falló con código $LASTEXITCODE."
}

if (-not (Test-Path (Join-Path $root "dist\Basecamp420_POS"))) {
  throw "No se generó la carpeta dist\Basecamp420_POS requerida por el instalador."
}

Write-Host "Compilando instalador Inno Setup..."
& $iscc $issPath
if ($LASTEXITCODE -ne 0) {
  throw "ISCC falló con código $LASTEXITCODE."
}

$setupPath = Join-Path $distInstaller "Basecamp420_POS_Setup.exe"
if (-not (Test-Path $setupPath)) {
  throw "No se generó el instalador final en $setupPath"
}

Write-Host "Instalador listo: $setupPath"
