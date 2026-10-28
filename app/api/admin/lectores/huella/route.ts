import { exigirAdministrador, jsonPrivado } from "@/lib/adminGuard";
import { enrolarHuella, quitarHuella } from "@/lib/adminUsuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const acceso = await exigirAdministrador();
  if (!acceso.ok) return acceso.respuesta;
  let cuerpo: { accion?: unknown; usuario?: unknown; credentialId?: unknown; origen?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return jsonPrivado({ error: "No se pudo leer la solicitud." }, 400);
  }
  if (typeof cuerpo.usuario !== "string" || typeof cuerpo.credentialId !== "string") {
    return jsonPrivado({ error: "Indica el usuario y la huella de este equipo." }, 400);
  }
  try {
    const resultado =
      cuerpo.accion === "quitar"
        ? await quitarHuella(cuerpo.usuario, cuerpo.credentialId)
        : await enrolarHuella(
            cuerpo.usuario,
            cuerpo.credentialId,
            typeof cuerpo.origen === "string" ? cuerpo.origen : ""
          );
    if (!resultado.ok) return jsonPrivado({ error: resultado.error }, 400);
    return jsonPrivado({ ok: true });
  } catch {
    return jsonPrivado({ error: "No se pudo guardar la huella." }, 500);
  }
}
