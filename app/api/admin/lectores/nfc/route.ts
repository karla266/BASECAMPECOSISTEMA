import { exigirAdministrador, jsonPrivado } from "@/lib/adminGuard";
import { enrolarNfc, quitarNfc } from "@/lib/adminUsuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const acceso = await exigirAdministrador();
  if (!acceso.ok) return acceso.respuesta;
  let cuerpo: { accion?: unknown; usuario?: unknown; uid?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return jsonPrivado({ error: "No se pudo leer la solicitud." }, 400);
  }
  if (typeof cuerpo.usuario !== "string" || typeof cuerpo.uid !== "string") {
    return jsonPrivado({ error: "Indica el usuario y el identificador de la tarjeta." }, 400);
  }
  try {
    const resultado =
      cuerpo.accion === "quitar"
        ? await quitarNfc(cuerpo.usuario, cuerpo.uid)
        : await enrolarNfc(cuerpo.usuario, cuerpo.uid);
    if (!resultado.ok) return jsonPrivado({ error: resultado.error }, 400);
    return jsonPrivado({ ok: true, uid: "datos" in resultado ? resultado.datos : undefined });
  } catch {
    return jsonPrivado({ error: "No se pudo guardar la tarjeta." }, 500);
  }
}
