import { NextResponse } from "next/server";
import { NOMBRE_COOKIE_SESION, opcionesCookieSesion } from "@/lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const respuesta = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );
  respuesta.cookies.set(NOMBRE_COOKIE_SESION, "", opcionesCookieSesion(0));
  return respuesta;
}
