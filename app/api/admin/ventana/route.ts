import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const NAVEGADORES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST() {
  const navegador = NAVEGADORES.find((ruta) => fs.existsSync(ruta));
  if (!navegador) {
    return NextResponse.json(
      { error: "No se encontró Edge ni Chrome para abrir el panel como aplicación." },
      { status: 500, headers: cors }
    );
  }

  const perfil = path.resolve(process.cwd(), "..", "data", "ventana-admin");
  fs.mkdirSync(perfil, { recursive: true });
  const url = "http://localhost:3000/admin";

  const proceso = spawn(navegador, [
    `--app=${url}`,
    "--window-size=1440,900",
    `--user-data-dir=${perfil}`,
    "--no-first-run",
    "--disable-translate",
    "--disable-extensions",
  ], { detached: true, stdio: "ignore", windowsHide: false });
  proceso.unref();

  return NextResponse.json({ ok: true, url }, { headers: cors });
}
