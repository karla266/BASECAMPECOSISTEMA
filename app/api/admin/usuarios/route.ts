import { jsonPrivado, usuarioDeLaSesion } from "@/lib/adminGuard";
import { crearUsuario, listarUsuarios } from "@/lib/adminUsuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sesion = await usuarioDeLaSesion();
  if (!sesion) {
    return jsonPrivado({ error: "Inicia sesión para continuar." }, 401);
  }
  try {
    const usuarios = await listarUsuarios();
    return jsonPrivado({ actual: sesion, usuarios });
  } catch {
    return jsonPrivado({ error: "No se pudo leer la lista de usuarios." }, 500);
  }
}

export async function POST(request: Request) {
  const sesion = await usuarioDeLaSesion();
  if (!sesion) {
    return jsonPrivado({ error: "Inicia sesión para continuar." }, 401);
  }

  let cuerpo: {
    usuario?: unknown;
    nombre?: unknown;
    clave?: unknown;
    rol?: unknown;
    horario?: unknown;
  };
  try {
    cuerpo = await request.json();
  } catch {
    return jsonPrivado({ error: "No se pudo leer la solicitud." }, 400);
  }
  if (
    typeof cuerpo.usuario !== "string" ||
    typeof cuerpo.nombre !== "string" ||
    typeof cuerpo.clave !== "string" ||
    typeof cuerpo.rol !== "string" ||
    typeof cuerpo.horario !== "string"
  ) {
    return jsonPrivado({ error: "Indica usuario, nombre, contraseña, rol y horario." }, 400);
  }

  try {
    const resultado = await crearUsuario({
      usuario: cuerpo.usuario,
      nombre: cuerpo.nombre,
      clave: cuerpo.clave,
      rol: cuerpo.rol,
      horario: cuerpo.horario,
    });
    if (!resultado.ok) return jsonPrivado({ error: resultado.error }, 400);
    return jsonPrivado({ ok: true, usuario: resultado.datos }, 201);
  } catch {
    return jsonPrivado({ error: "No se pudo crear el usuario." }, 500);
  }
}
