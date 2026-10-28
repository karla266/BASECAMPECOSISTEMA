import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { NOMBRE_COOKIE_SESION, verificarSesionAdmin } from "./adminSession";
import { listarUsuarios, type UsuarioPublico } from "./adminUsuarios";

export function jsonPrivado(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function usuarioDeLaSesion(): Promise<UsuarioPublico | null> {
  const token = cookies().get(NOMBRE_COOKIE_SESION)?.value;
  const sesion = await verificarSesionAdmin(token);
  if (!sesion) return null;
  const usuarios = await listarUsuarios();
  return usuarios.find((item) => item.usuario === sesion.usuario) ?? null;
}

export async function exigirAdministrador(): Promise<
  { ok: true; sesion: UsuarioPublico } | { ok: false; respuesta: NextResponse }
> {
  const sesion = await usuarioDeLaSesion();
  if (!sesion) {
    return { ok: false, respuesta: jsonPrivado({ error: "Inicia sesión para continuar." }, 401) };
  }
  if (sesion.rol !== "admin") {
    return { ok: false, respuesta: jsonPrivado({ error: "Solo un administrador configura los lectores." }, 403) };
  }
  return { ok: true, sesion };
}
