const NOMBRE_COOKIE_SESION = "bc_admin_sesion";
const DURACION_COOKIE = 60 * 60 * 12;

function secretoSesion(): string {
  return process.env.ADMIN_SESSION_SECRET || "bc420-panel-admin-sesion-local-v1";
}

function bytesABase64Url(bytes: Uint8Array): string {
  let binario = "";
  for (let i = 0; i < bytes.length; i++) {
    binario += String.fromCharCode(bytes[i]);
  }
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlABytes(valor: string): Uint8Array {
  const resto = valor.length % 4;
  const relleno = resto === 0 ? "" : "=".repeat(4 - resto);
  const base64 = valor.replace(/-/g, "+").replace(/_/g, "/") + relleno;
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

async function firmar(datos: string): Promise<string> {
  const clave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretoSesion()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const firma = await crypto.subtle.sign("HMAC", clave, new TextEncoder().encode(datos));
  return bytesABase64Url(new Uint8Array(firma));
}

function firmasIguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) {
    diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diferencia === 0;
}

export async function crearTokenSesion(usuario: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + DURACION_COOKIE;
  const payload = bytesABase64Url(new TextEncoder().encode(JSON.stringify({ usuario, exp })));
  const firma = await firmar(payload);
  return `${payload}.${firma}`;
}

export async function verificarSesionAdmin(
  token: string | undefined | null
): Promise<{ usuario: string } | null> {
  if (!token) return null;
  const partes = token.split(".");
  if (partes.length !== 2) return null;
  const [payload, firma] = partes;
  if (!payload || !firma) return null;
  const esperada = await firmar(payload);
  if (!firmasIguales(esperada, firma)) return null;
  try {
    const json = JSON.parse(new TextDecoder().decode(base64UrlABytes(payload))) as {
      usuario?: unknown;
      exp?: unknown;
    };
    if (typeof json.usuario !== "string" || typeof json.exp !== "number") return null;
    if (!json.usuario || json.exp < Math.floor(Date.now() / 1000)) return null;
    return { usuario: json.usuario };
  } catch {
    return null;
  }
}

export function opcionesCookieSesion(maxAge = DURACION_COOKIE) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export { NOMBRE_COOKIE_SESION };
