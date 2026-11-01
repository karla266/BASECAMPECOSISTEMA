import { NextResponse } from "next/server";
import { jsonPrivado } from "@/lib/adminGuard";
import { aplicarCookiesSesion, crearTokenSesion, normalizarRol } from "@/lib/adminSession";
import { verificarHuella } from "@/lib/adminUsuarios";
import { crearTicketMostrador } from "@/lib/lectorTickets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function leerCuerpo(request: Request): Promise<{ credentialId?: unknown; destino?: unknown } | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const cuerpo = await leerCuerpo(request);
  if (!cuerpo || typeof cuerpo.credentialId !== "string") {
    return jsonPrivado({ error: "Indica la huella de este equipo." }, 400);
  }
  const destino = cuerpo.destino === "mostrador" ? "mostrador" : "admin";
  try {
    const resultado = await verificarHuella(cuerpo.credentialId, destino);
    if (!resultado.ok) return jsonPrivado({ error: resultado.error }, resultado.status);
    if (destino === "mostrador") {
      const ticket = await crearTicketMostrador(resultado.usuario.usuario);
      return jsonPrivado({ ok: true, ticket, usuario: resultado.usuario.usuario });
    }
    const token = await crearTokenSesion(resultado.usuario.usuario, normalizarRol(resultado.usuario.rol));
    const respuesta = NextResponse.json(
      { ok: true, usuario: resultado.usuario.usuario, nombre: resultado.usuario.nombre },
      { headers: { "Cache-Control": "no-store" } }
    );
    aplicarCookiesSesion(respuesta, token);
    return respuesta;
  } catch {
    return jsonPrivado({ error: "No se pudo comprobar la huella." }, 500);
  }
}
