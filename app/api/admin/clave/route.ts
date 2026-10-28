import { usuarioDeLaSesion, jsonPrivado } from "@/lib/adminGuard";
import { cambiarClave } from "@/lib/adminUsuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const sesion = await usuarioDeLaSesion();
  if (!sesion) {
    return jsonPrivado({ error: "Inicia sesión para continuar." }, 401);
  }

  let cuerpo: { actual?: unknown; nueva?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return jsonPrivado({ error: "No se pudo leer la solicitud." }, 400);
  }
  if (typeof cuerpo.actual !== "string" || typeof cuerpo.nueva !== "string") {
    return jsonPrivado({ error: "Indica la contraseña actual y la nueva." }, 400);
  }

  try {
    const resultado = await cambiarClave(sesion.usuario, cuerpo.actual, cuerpo.nueva);
    if (!resultado.ok) return jsonPrivado({ error: resultado.error }, 400);
    return jsonPrivado({ ok: true });
  } catch {
    return jsonPrivado({ error: "No se pudo guardar la contraseña." }, 500);
  }
}
