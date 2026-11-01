import { jsonPrivado, usuarioDeLaSesion } from "@/lib/adminGuard";
import { aplicarRotacion, anexarTraza, guardarMotor, leerMotor, liberarEntregasVencidas, type CuerpoRotacion } from "@/lib/dropsArchivos";
import { diaMexico, estadoDrop } from "@/lib/dropsEstado";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cuerpoDe(valor: unknown): CuerpoRotacion {
  if (!valor || typeof valor !== "object") return {};
  const crudo = valor as Record<string, unknown>;
  const cuerpo: CuerpoRotacion = {};
  if (crudo.drop_id !== undefined) cuerpo.drop_id = String(crudo.drop_id);
  if (crudo.fecha_apertura !== undefined) cuerpo.fecha_apertura = String(crudo.fecha_apertura);
  if (crudo.fecha_cierre_preventa !== undefined) cuerpo.fecha_cierre_preventa = String(crudo.fecha_cierre_preventa);
  if (crudo.fecha_entrega_oficial !== undefined) cuerpo.fecha_entrega_oficial = String(crudo.fecha_entrega_oficial);
  if (crudo.fecha_entrega_iso !== undefined) cuerpo.fecha_entrega_iso = String(crudo.fecha_entrega_iso);
  if (crudo.activo !== undefined) cuerpo.activo = Boolean(crudo.activo);
  return cuerpo;
}

export async function POST(request: Request) {
  const sesion = await usuarioDeLaSesion();
  if (!sesion) return jsonPrivado({ error: "Inicia sesión para continuar." }, 401);
  if (sesion.rol !== "admin") return jsonPrivado({ error: "Solo un administrador rota el drop." }, 403);

  let crudo: unknown = {};
  const texto = await request.text();
  if (texto.trim()) {
    try {
      crudo = JSON.parse(texto);
    } catch {
      return jsonPrivado({ error: "No se pudo leer la solicitud." }, 400);
    }
  }

  try {
    const hoy = diaMexico();
    const motor = aplicarRotacion(leerMotor(), cuerpoDe(crudo));
    const liberados = liberarEntregasVencidas(motor, hoy);
    guardarMotor(motor);
    anexarTraza({
      ts: new Date().toISOString(),
      usuario: sesion.usuario,
      accion: "rotar-drop",
      hoy,
      drop_activo: motor.drop_activo.id,
      liberados: liberados.length,
      skus: liberados,
    });
    return jsonPrivado({
      ok: true,
      hoy,
      liberados: liberados.length,
      drop: estadoDrop(motor),
    });
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : "No se pudo rotar el drop.";
    return jsonPrivado({ error: mensaje }, 400);
  }
}
