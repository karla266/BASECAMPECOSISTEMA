import { NextResponse } from "next/server";
import { limpiarCookiesSesion } from "@/lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const respuesta = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );
  limpiarCookiesSesion(respuesta);
  return respuesta;
}
