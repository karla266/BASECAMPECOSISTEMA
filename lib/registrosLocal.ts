import { spawnSync } from "node:child_process";
import path from "node:path";

const DB = path.resolve(process.cwd(), "..", "pos_local.db");

const SCRIPT = [
  "import json, sqlite3, sys",
  "fila = json.loads(sys.stdin.read())",
  "db, tabla = sys.argv[1], sys.argv[2]",
  "if tabla not in ('pilotos', 'aliados_b2b'):",
  "    raise SystemExit(2)",
  "conn = sqlite3.connect(db)",
  "if tabla == 'pilotos':",
  "    conn.execute('''CREATE TABLE IF NOT EXISTS pilotos (",
  "      id INTEGER PRIMARY KEY AUTOINCREMENT,",
  "      nombre TEXT NOT NULL,",
  "      telefono TEXT NOT NULL,",
  "      correo TEXT NOT NULL,",
  "      licencia_numero TEXT NOT NULL,",
  "      licencia_organismo TEXT NOT NULL,",
  "      nivel TEXT NOT NULL,",
  "      horas_vuelo REAL NOT NULL,",
  "      equipo TEXT NOT NULL,",
  "      ciudad TEXT NOT NULL,",
  "      estado TEXT NOT NULL DEFAULT 'PENDIENTE',",
  "      creado_en TEXT NOT NULL)''')",
  "    conn.execute('''INSERT INTO pilotos",
  "      (nombre, telefono, correo, licencia_numero, licencia_organismo, nivel, horas_vuelo, equipo, ciudad, estado, creado_en)",
  "      VALUES (:nombre, :telefono, :correo, :licencia_numero, :licencia_organismo, :nivel, :horas_vuelo, :equipo, :ciudad, 'PENDIENTE', :creado_en)''', fila)",
  "else:",
  "    conn.execute('''CREATE TABLE IF NOT EXISTS aliados_b2b (",
  "      id INTEGER PRIMARY KEY AUTOINCREMENT,",
  "      empresa TEXT NOT NULL,",
  "      representante TEXT NOT NULL,",
  "      telefono TEXT NOT NULL,",
  "      correo TEXT NOT NULL,",
  "      giro TEXT NOT NULL,",
  "      ciudad TEXT NOT NULL,",
  "      estado_geo TEXT NOT NULL,",
  "      tipo_alianza TEXT NOT NULL,",
  "      mensaje TEXT NOT NULL,",
  "      estado TEXT NOT NULL DEFAULT 'PENDIENTE',",
  "      creado_en TEXT NOT NULL)''')",
  "    conn.execute('''INSERT INTO aliados_b2b",
  "      (empresa, representante, telefono, correo, giro, ciudad, estado_geo, tipo_alianza, mensaje, estado, creado_en)",
  "      VALUES (:empresa, :representante, :telefono, :correo, :giro, :ciudad, :estado_geo, :tipo_alianza, :mensaje, 'PENDIENTE', :creado_en)''', fila)",
  "conn.commit()",
  "print('ok')",
].join("\n");

export function insertarRegistro(tabla: "pilotos" | "aliados_b2b", fila: Record<string, string | number>) {
  const resultado = spawnSync("python", ["-c", SCRIPT, DB, tabla], {
    input: JSON.stringify({ ...fila, creado_en: new Date().toISOString() }),
    encoding: "utf8",
  });
  if (resultado.status !== 0) {
    throw new Error("No se pudo guardar el registro.");
  }
}
