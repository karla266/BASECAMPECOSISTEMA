import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ARCHIVO = path.join(process.cwd(), "data", "lote-aprobacion.json");

type Ficha = { estado: string; nota: string };

function leer(): Record<string, Ficha> {
  try {
    const crudo = JSON.parse(fs.readFileSync(ARCHIVO, "utf8")) as Record<string, unknown>;
    const salida: Record<string, Ficha> = {};
    for (const [id, valor] of Object.entries(crudo || {})) {
      if (typeof valor === "string") {
        salida[id] = { estado: valor, nota: "" };
      } else if (valor && typeof valor === "object") {
        const ficha = valor as { estado?: unknown; nota?: unknown };
        salida[id] = {
          estado: String(ficha.estado || "PENDIENTE"),
          nota: String(ficha.nota || ""),
        };
      }
    }
    return salida;
  } catch {
    return {};
  }
}

function responder(fichas: Record<string, Ficha>) {
  const decisiones: Record<string, string> = {};
  const notas: Record<string, string> = {};
  for (const [id, ficha] of Object.entries(fichas)) {
    decisiones[id] = ficha.estado;
    notas[id] = ficha.nota;
  }
  return { decisiones, notas, publicado: false };
}

export async function GET() {
  return NextResponse.json(responder(leer()));
}

export async function POST(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const artId = String(cuerpo?.art_id || "").replace(/\D/g, "");
  const estado = String(cuerpo?.estado || "");
  const nota = String(cuerpo?.nota || "").slice(0, 500);
  if (!artId || !["APROBADO", "RECHAZADO", "PENDIENTE"].includes(estado)) {
    return NextResponse.json({ error: "Decisión no válida." }, { status: 400 });
  }
  const fichas = leer();
  fichas[artId] = { estado, nota };
  fs.mkdirSync(path.dirname(ARCHIVO), { recursive: true });
  fs.writeFileSync(ARCHIVO, JSON.stringify(fichas, null, 2));
  return NextResponse.json({ ok: true, ...responder(fichas) });
}
