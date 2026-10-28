import { exigirAdministrador, jsonPrivado } from "@/lib/adminGuard";
import { guardarLectores, leerConfiguracionLectores } from "@/lib/adminUsuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const acceso = await exigirAdministrador();
  if (!acceso.ok) return acceso.respuesta;
  try {
    const datos = await leerConfiguracionLectores();
    return jsonPrivado(datos);
  } catch {
    return jsonPrivado({ error: "No se pudo leer la configuración de los lectores." }, 500);
  }
}

export async function PUT(request: Request) {
  const acceso = await exigirAdministrador();
  if (!acceso.ok) return acceso.respuesta;
  let cuerpo: {
    nfc?: { activo?: unknown; destinos?: unknown };
    huella?: { activo?: unknown; destinos?: unknown; origen?: unknown };
  };
  try {
    cuerpo = await request.json();
  } catch {
    return jsonPrivado({ error: "No se pudo leer la solicitud." }, 400);
  }
  if (!cuerpo.nfc || !cuerpo.huella || typeof cuerpo.nfc.activo !== "boolean" || typeof cuerpo.huella.activo !== "boolean") {
    return jsonPrivado({ error: "Indica si cada lector está activo y para qué destino." }, 400);
  }
  try {
    const resultado = await guardarLectores({
      nfc: { activo: cuerpo.nfc.activo, destinos: cuerpo.nfc.destinos },
      huella: { activo: cuerpo.huella.activo, destinos: cuerpo.huella.destinos, origen: cuerpo.huella.origen },
    });
    if (!resultado.ok) return jsonPrivado({ error: resultado.error }, 400);
    return jsonPrivado({ ok: true, lectores: resultado.datos });
  } catch {
    return jsonPrivado({ error: "No se pudo guardar la configuración." }, 500);
  }
}
