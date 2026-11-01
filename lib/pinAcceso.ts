import { spawnSync } from "node:child_process";
import { timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { RolSesion } from "@/lib/adminSession";

const DB = path.resolve(process.cwd(), "..", "pos_local.db");
const PIN_ADMIN = "4200";
const PIN_FOTO = "1010";

export type AccesoPin = {
  usuario: string;
  nombre: string;
  rol: RolSesion;
};

function igual(a: string, b: string): boolean {
  const izquierda = Buffer.from(a);
  const derecha = Buffer.from(b);
  if (izquierda.length !== derecha.length) return false;
  return timingSafeEqual(izquierda, derecha);
}

function desdeCaja(pin: string): AccesoPin | null {
  if (!fs.existsSync(DB)) return null;
  const script = [
    "import json, sqlite3, sys",
    "pin = sys.stdin.read().strip()",
    "db = sys.argv[1]",
    "permitidas = {'cajeros','empleados','usuarios_pos','usuarios'}",
    "conn = sqlite3.connect(db)",
    "tablas = [fila[0] for fila in conn.execute(\"SELECT name FROM sqlite_master WHERE type='table'\")]",
    "for tabla in tablas:",
    "    if tabla.lower() not in permitidas: continue",
    "    cols = {fila[1].lower(): fila[1] for fila in conn.execute(f'PRAGMA table_info({tabla})')}",
    "    pin_col = next((cols[n] for n in ('pin','clave_pin','nip') if n in cols), None)",
    "    if not pin_col: continue",
    "    usuario_col = next((cols[n] for n in ('usuario','nombre') if n in cols), pin_col)",
    "    rol_col = cols.get('rol') or cols.get('tipo')",
    "    rol_sql = rol_col if rol_col else \"'cajero'\"",
    "    fila = conn.execute(f'SELECT {usuario_col} AS usuario, {rol_sql} AS rol FROM {tabla} WHERE {pin_col} = ?', (pin,)).fetchone()",
    "    if fila:",
    "        json.dump({'usuario': str(fila[0] or 'cajero'), 'rol': str(fila[1] or 'cajero')}, sys.stdout)",
    "        raise SystemExit",
    "json.dump({}, sys.stdout)",
  ].join("\n");
  const resultado = spawnSync("python", ["-c", script, DB], { input: pin, encoding: "utf8" });
  if (resultado.status !== 0) return null;
  try {
    const fila = JSON.parse(resultado.stdout || "{}") as { usuario?: string; rol?: string };
    if (!fila.usuario) return null;
    const rol: RolSesion = fila.rol === "operador_foto" || String(fila.rol).includes("foto") ? "operador_foto" : fila.rol === "admin" ? "admin" : "cajero";
    return { usuario: fila.usuario, nombre: fila.usuario, rol };
  } catch {
    return null;
  }
}

export function resolverPin(pin: string): AccesoPin | null {
  const limpio = pin.trim();
  if (!/^\d{4,8}$/.test(limpio)) return null;
  if (igual(limpio, PIN_ADMIN)) return { usuario: "admin", nombre: "Administración", rol: "admin" };
  if (igual(limpio, PIN_FOTO)) return { usuario: "operador_foto", nombre: "Fotos de mostrador", rol: "operador_foto" };
  return desdeCaja(limpio);
}
