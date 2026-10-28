import { NextResponse } from "next/server";
import { autenticar } from "@/lib/adminUsuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORIGENES = new Set(["http://127.0.0.1:8110", "http://localhost:3000"]);

function cabeceras(request: Request): Record<string, string> {
  const base: Record<string, string> = {
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
  const origen = request.headers.get("origin");
  if (origen && ORIGENES.has(origen)) {
    base["Access-Control-Allow-Origin"] = origen;
    base["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    base["Access-Control-Allow-Headers"] = "Content-Type";
    base["Access-Control-Allow-Private-Network"] = "true";
  }
  return base;
}

function origenRechazado(request: Request): boolean {
  const origen = request.headers.get("origin");
  return Boolean(origen && !ORIGENES.has(origen));
}

export function OPTIONS(request: Request) {
  if (origenRechazado(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  return new NextResponse(null, { status: 204, headers: cabeceras(request) });
}

export async function POST(request: Request) {
  const headers = cabeceras(request);
  if (origenRechazado(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  let cuerpo: { usuario?: unknown; clave?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "No se pudo leer la solicitud." }, { status: 400, headers });
  }
  if (typeof cuerpo.usuario !== "string" || typeof cuerpo.clave !== "string") {
    return NextResponse.json({ error: "Indica usuario y contraseña." }, { status: 400, headers });
  }

  try {
    const usuario = await autenticar(cuerpo.usuario, cuerpo.clave);
    if (!usuario) {
      return NextResponse.json(
        { ok: false, error: "Usuario o contraseña incorrectos." },
        { status: 401, headers }
      );
    }
    if (usuario.rol !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Este usuario no abre el panel del mostrador." },
        { status: 403, headers }
      );
    }
    return NextResponse.json(
      { ok: true, usuario: usuario.usuario, nombre: usuario.nombre, rol: usuario.rol },
      { headers }
    );
  } catch {
    return NextResponse.json({ error: "No se pudo comprobar el acceso." }, { status: 500, headers });
  }
}
