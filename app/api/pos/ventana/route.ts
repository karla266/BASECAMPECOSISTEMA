import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const EDGE_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

async function puertoDelMostrador(): Promise<number> {
  for (const puerto of [8110, 8000]) {
    try {
      const respuesta = await fetch(`http://127.0.0.1:${puerto}/api/v1/pos/acceso`, { cache: "no-store" });
      if (respuesta.status < 500) return puerto;
    } catch {
      continue;
    }
  }
  return 8110;
}

export async function POST() {
  const edge = EDGE_CANDIDATES.find((ruta) => fs.existsSync(ruta));
  if (!edge) {
    return NextResponse.json({ error: "No se encontró Microsoft Edge para abrir la ventana de la aplicación." }, { status: 500 });
  }

  const puerto = await puertoDelMostrador();
  const perfil = path.resolve(process.cwd(), "..", "data", "ventana-aplicacion");
  fs.mkdirSync(perfil, { recursive: true });
  const url = `http://127.0.0.1:${puerto}/static/index.html`;

  const proceso = spawn(edge, [
    `--app=${url}`,
    "--window-size=1440,900",
    `--user-data-dir=${perfil}`,
    "--no-first-run",
    "--disable-translate",
    "--disable-extensions",
  ], { detached: true, stdio: "ignore", windowsHide: false });
  proceso.unref();

  return NextResponse.json({ ok: true, url });
}
