import { NextResponse } from "next/server";
import { getPosApiBase } from "@/lib/apiBase";

const POS_CANDIDATOS = Array.from(
  new Set([getPosApiBase(), "http://127.0.0.1:8000", "http://127.0.0.1:8110"])
);

function detalle(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as { detail?: unknown; error?: unknown };
  if (typeof record.detail === "string") return record.detail;
  if (typeof record.error === "string") return record.error;
  return null;
}

async function leerJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchPos(path: string, init?: RequestInit): Promise<Response> {
  let ultimo: Response | null = null;
  for (const base of POS_CANDIDATOS) {
    try {
      const response = await fetch(`${base}${path}`, { ...init, cache: "no-store" });
      if (response.status === 404) {
        ultimo = response;
        continue;
      }
      return response;
    } catch {
      continue;
    }
  }
  if (ultimo) return ultimo;
  throw new Error("pos-down");
}

export async function GET() {
  try {
    const response = await fetchPos("/api/v1/pos/acceso");
    const data = await leerJson(response);
    if (!response.ok || !data || typeof data !== "object") {
      return NextResponse.json(
        { error: detalle(data) || "No se pudo leer el acceso del punto de venta." },
        { status: response.ok ? 502 : response.status }
      );
    }
    const acceso = data as { usuario?: unknown; configurado?: unknown; revision?: unknown };
    return NextResponse.json({
      usuario: typeof acceso.usuario === "string" ? acceso.usuario : "",
      configurado: Boolean(acceso.configurado),
      revision: typeof acceso.revision === "string" ? acceso.revision : "",
    });
  } catch {
    return NextResponse.json({ error: "El punto de venta no está disponible." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  let body: { usuario?: unknown; password?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  try {
    const response = await fetchPos("/api/v1/pos/acceso", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario: typeof body.usuario === "string" ? body.usuario : "",
        password: typeof body.password === "string" ? body.password : "",
      }),
    });
    const data = await leerJson(response);
    if (!response.ok) {
      return NextResponse.json(
        { error: detalle(data) || "No se pudo guardar el acceso." },
        { status: response.status }
      );
    }
    const acceso = (data && typeof data === "object" ? data : {}) as {
      usuario?: unknown;
      configurado?: unknown;
      revision?: unknown;
    };
    return NextResponse.json({
      ok: true,
      usuario: typeof acceso.usuario === "string" ? acceso.usuario : "",
      configurado: acceso.configurado !== false,
      revision: typeof acceso.revision === "string" ? acceso.revision : "",
    });
  } catch {
    return NextResponse.json({ error: "El punto de venta no está disponible." }, { status: 503 });
  }
}
