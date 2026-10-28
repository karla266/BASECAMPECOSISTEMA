import { jsonPrivado } from "@/lib/adminGuard";
import { leerEstadoLectores } from "@/lib/adminUsuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lectores = await leerEstadoLectores();
    return jsonPrivado({
      nfc: { activo: lectores.nfc.activo, destinos: lectores.nfc.destinos },
      huella: {
        activo: lectores.huella.activo,
        destinos: lectores.huella.destinos,
        origen: lectores.huella.origen,
      },
    });
  } catch {
    return jsonPrivado({ error: "No se pudo leer la configuración de los lectores." }, 500);
  }
}
