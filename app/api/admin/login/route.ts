import { NextResponse } from "next/server";
import { aplicarCookiesSesion, crearTokenSesion, normalizarRol } from "@/lib/adminSession";
import { autenticar } from "@/lib/adminUsuarios";
import { jsonPrivado } from "@/lib/adminGuard";
import { resolverPin } from "@/lib/pinAcceso";

const fallosPin = new Map<string, { n: number; hasta: number }>();

function ipDe(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function pinBloqueado(ip: string): boolean {
  const previo = fallosPin.get(ip);
  return Boolean(previo && previo.hasta > Date.now() && previo.n >= 8);
}

function anotarFallo(ip: string) {
  const ahora = Date.now();
  const previo = fallosPin.get(ip);
  const n = previo && previo.hasta > ahora ? previo.n + 1 : 1;
  fallosPin.set(ip, { n, hasta: ahora + 60_000 });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let cuerpo: { usuario?: unknown; clave?: unknown; pin?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return jsonPrivado({ error: "No se pudo leer la solicitud." }, 400);
  }
  if (typeof cuerpo.pin === "string") {
    const ip = ipDe(request);
    if (pinBloqueado(ip)) return jsonPrivado({ error: "Demasiados intentos. Espera un minuto." }, 429);
    const acceso = resolverPin(cuerpo.pin);
    if (!acceso) {
      anotarFallo(ip);
      return jsonPrivado({ error: "PIN incorrecto." }, 401);
    }
    const token = await crearTokenSesion(acceso.usuario, acceso.rol);
    const respuesta = NextResponse.json(
      { ok: true, usuario: acceso.usuario, nombre: acceso.nombre, rol: acceso.rol },
      { headers: { "Cache-Control": "no-store" } }
    );
    aplicarCookiesSesion(respuesta, token);
    return respuesta;
  }
  if (typeof cuerpo.usuario !== "string" || typeof cuerpo.clave !== "string") {
    return jsonPrivado({ error: "Indica usuario y contraseña." }, 400);
  }

  try {
    const usuario = await autenticar(cuerpo.usuario, cuerpo.clave);
    if (!usuario) {
      return jsonPrivado({ error: "Usuario o contraseña incorrectos." }, 401);
    }
    const token = await crearTokenSesion(usuario.usuario, normalizarRol(usuario.rol));
    const respuesta = NextResponse.json(
      { ok: true, usuario: usuario.usuario, nombre: usuario.nombre, rol: normalizarRol(usuario.rol) },
      { headers: { "Cache-Control": "no-store" } }
    );
    aplicarCookiesSesion(respuesta, token);
    return respuesta;
  } catch {
    return jsonPrivado({ error: "No se pudo comprobar el acceso." }, 500);
  }
}
