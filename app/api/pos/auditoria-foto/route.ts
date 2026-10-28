import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ARCHIVO = path.join(process.cwd(), "..", "data", "auditoria-foto.json");

function leer() {
  try {
    const data = JSON.parse(fs.readFileSync(ARCHIVO, "utf8")) as { activa?: unknown };
    return Boolean(data?.activa);
  } catch {
    return false;
  }
}

export async function GET() {
  return NextResponse.json({ activa: leer() });
}

export async function PUT(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const activa = Boolean(cuerpo?.activa);
  fs.mkdirSync(path.dirname(ARCHIVO), { recursive: true });
  fs.writeFileSync(ARCHIVO, JSON.stringify({ activa }, null, 2));
  return NextResponse.json({ ok: true, activa });
}
