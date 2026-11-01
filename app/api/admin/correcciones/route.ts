import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { NOMBRE_COOKIE_SESION, verificarSesionAdmin } from "@/lib/adminSession";
import { aprobarFoto, aprobarPrecio, aprobarPrecios, leerCorrecciones, reauditar } from "@/lib/correccionesThetrip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function sesionValida() {
  const token = cookies().get(NOMBRE_COOKIE_SESION)?.value;
  return verificarSesionAdmin(token);
}

export async function GET(request: Request) {
  if (!(await sesionValida())) {
    return NextResponse.json({ error: "Inicia sesión en el panel." }, { status: 401 });
  }
  try {
    const url = new URL(request.url);
    const correcciones = url.searchParams.get("reauditar") === "1" ? reauditar() : leerCorrecciones();
    return NextResponse.json(correcciones, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo leer la auditoría.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await sesionValida())) {
    return NextResponse.json({ error: "Inicia sesión en el panel." }, { status: 401 });
  }
  const cuerpo = (await request.json().catch(() => ({}))) as { accion?: string; sku?: string };
  const accion = cuerpo.accion;
  const sku = typeof cuerpo.sku === "string" ? cuerpo.sku : "";
  try {
    if (accion === "reauditar") {
      return NextResponse.json(reauditar());
    }
    if (accion === "precio" && sku) {
      const resultado = aprobarPrecio(sku);
      if (!resultado.ok) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
      return NextResponse.json(resultado.correcciones);
    }
    if (accion === "precios") {
      return NextResponse.json(aprobarPrecios().correcciones);
    }
    if (accion === "foto" && sku) {
      const resultado = aprobarFoto(sku);
      if (!resultado.ok) return NextResponse.json({ error: resultado.error }, { status: resultado.status });
      return NextResponse.json(resultado.correcciones);
    }
    return NextResponse.json({ error: "Indica la corrección a aprobar." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo aplicar la corrección.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
