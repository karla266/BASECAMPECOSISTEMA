import { NextResponse } from "next/server";
import { crearTokenSesion, NOMBRE_COOKIE_SESION, opcionesCookieSesion } from "@/lib/adminSession";
import { autenticar } from "@/lib/adminUsuarios";
import { jsonPrivado } from "@/lib/adminGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let cuerpo: { usuario?: unknown; clave?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return jsonPrivado({ error: "No se pudo leer la solicitud." }, 400);
  }
  if (typeof cuerpo.usuario !== "string" || typeof cuerpo.clave !== "string") {
    return jsonPrivado({ error: "Indica usuario y contraseña." }, 400);
  }

  try {
    const usuario = await autenticar(cuerpo.usuario, cuerpo.clave);
    if (!usuario) {
      return jsonPrivado({ error: "Usuario o contraseña incorrectos." }, 401);
    }
    const token = await crearTokenSesion(usuario.usuario);
    const respuesta = NextResponse.json(
      { ok: true, usuario: usuario.usuario, nombre: usuario.nombre },
      { headers: { "Cache-Control": "no-store" } }
    );
    respuesta.cookies.set(NOMBRE_COOKIE_SESION, token, opcionesCookieSesion());
    return respuesta;
  } catch {
    return jsonPrivado({ error: "No se pudo comprobar el acceso." }, 500);
  }
}
