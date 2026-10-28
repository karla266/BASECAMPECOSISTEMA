import { NextResponse } from "next/server";
import { jsonPrivado } from "@/lib/adminGuard";
import { crearTokenSesion, NOMBRE_COOKIE_SESION, opcionesCookieSesion } from "@/lib/adminSession";
import { verificarNfc } from "@/lib/adminUsuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let cuerpo: { uid?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return jsonPrivado({ error: "No se pudo leer la solicitud." }, 400);
  }
  if (typeof cuerpo.uid !== "string") {
    return jsonPrivado({ error: "Indica el identificador de la tarjeta." }, 400);
  }
  try {
    const resultado = await verificarNfc(cuerpo.uid, "admin");
    if (!resultado.ok) return jsonPrivado({ error: resultado.error }, resultado.status);
    const token = await crearTokenSesion(resultado.usuario.usuario);
    const respuesta = NextResponse.json(
      { ok: true, usuario: resultado.usuario.usuario, nombre: resultado.usuario.nombre },
      { headers: { "Cache-Control": "no-store" } }
    );
    respuesta.cookies.set(NOMBRE_COOKIE_SESION, token, opcionesCookieSesion());
    return respuesta;
  } catch {
    return jsonPrivado({ error: "No se pudo comprobar la tarjeta." }, 500);
  }
}
