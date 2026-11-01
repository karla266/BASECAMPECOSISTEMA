import fs from "fs";
import path from "path";
import { diasEntre, esMotorDrops, ymd, type Drop, type MotorDrops } from "./dropsEstado";

const MOTOR_PATH = path.join(process.cwd(), "config", "drops_engine.json");
const INVENTARIO_PATH = path.join(process.cwd(), "data", "inventario_thetrip.json");
const TRAZA_PATH = path.join(process.cwd(), "data", "trazas_drops.jsonl");

export type CuerpoRotacion = {
  drop_id?: string;
  fecha_apertura?: string;
  fecha_cierre_preventa?: string;
  fecha_entrega_oficial?: string;
  fecha_entrega_iso?: string;
  activo?: boolean;
};

function escribirAtomico(destino: string, contenido: string) {
  const temporal = `${destino}.${process.pid}.tmp`;
  fs.writeFileSync(temporal, contenido, "utf8");
  fs.renameSync(temporal, destino);
}

export function leerMotor(): MotorDrops {
  const crudo = fs.readFileSync(MOTOR_PATH, "utf8");
  const motor = JSON.parse(crudo) as unknown;
  if (!esMotorDrops(motor)) throw new Error("config/drops_engine.json no tiene un drop activo.");
  ymd(motor.drop_activo.fecha_entrega_iso);
  return motor;
}

function fechaCampo(valor: unknown, nombre: string): string {
  if (typeof valor !== "string" || !valor.trim()) throw new Error(`Falta ${nombre}.`);
  return valor.trim();
}

function normalizarInstante(valor: string, finDeDia: boolean): string {
  const dia = ymd(valor);
  if (valor.length <= 10) return finDeDia ? `${dia}T23:59:59` : `${dia}T00:00:00`;
  return valor;
}

export function aplicarRotacion(motor: MotorDrops, cuerpo: CuerpoRotacion): MotorDrops {
  let activo: Drop = { ...motor.drop_activo };
  if (cuerpo.drop_id) {
    const encontrado =
      motor.calendario.find((drop) => drop.id === cuerpo.drop_id) ??
      (motor.drop_activo.id === cuerpo.drop_id ? motor.drop_activo : undefined);
    if (!encontrado) throw new Error("Ese drop no está en el calendario.");
    activo = { ...encontrado, activo: true };
  }
  if (cuerpo.fecha_apertura !== undefined) {
    activo.fecha_apertura = normalizarInstante(fechaCampo(cuerpo.fecha_apertura, "fecha_apertura"), false);
  }
  if (cuerpo.fecha_cierre_preventa !== undefined) {
    activo.fecha_cierre_preventa = normalizarInstante(
      fechaCampo(cuerpo.fecha_cierre_preventa, "fecha_cierre_preventa"),
      true
    );
  }
  if (cuerpo.fecha_entrega_oficial !== undefined) {
    const entrega = fechaCampo(cuerpo.fecha_entrega_oficial, "fecha_entrega_oficial");
    if (entrega.length > 40) throw new Error("La fecha de entrega visible es demasiado larga.");
    activo.fecha_entrega_oficial = entrega;
  }
  if (cuerpo.fecha_entrega_iso !== undefined) {
    activo.fecha_entrega_iso = ymd(fechaCampo(cuerpo.fecha_entrega_iso, "fecha_entrega_iso"));
  }
  if (cuerpo.activo !== undefined) {
    if (typeof cuerpo.activo !== "boolean") throw new Error("activo debe ser verdadero o falso.");
    activo.activo = cuerpo.activo;
  }
  if (diasEntre(activo.fecha_apertura, activo.fecha_cierre_preventa) < 0) {
    throw new Error("El cierre de la pre-venta queda antes de la apertura.");
  }
  if (diasEntre(activo.fecha_cierre_preventa, activo.fecha_entrega_iso) < 0) {
    throw new Error("La entrega queda antes del cierre de la pre-venta.");
  }
  return {
    ...motor,
    drop_activo: activo,
    calendario: motor.calendario.map((drop) => (drop.id === activo.id ? activo : drop)),
  };
}

export function liberarEntregasVencidas(motor: MotorDrops, hoy: string): string[] {
  const catalogo = JSON.parse(fs.readFileSync(INVENTARIO_PATH, "utf8")) as {
    productos?: Array<Record<string, unknown>>;
    ultima_actualizacion?: string;
  };
  if (!Array.isArray(catalogo.productos)) {
    throw new Error("inventario_thetrip.json no tiene una lista de productos.");
  }
  const vencidas = new Set<string>();
  for (const drop of [motor.drop_activo, ...motor.calendario]) {
    if (hoy > ymd(drop.fecha_entrega_iso)) vencidas.add(drop.fecha_entrega_oficial);
  }
  const skus: string[] = [];
  for (const producto of catalogo.productos) {
    if (producto.disponibilidad !== "PRE-VENTA") continue;
    if (typeof producto.fecha_llegada !== "string" || !vencidas.has(producto.fecha_llegada)) continue;
    producto.disponibilidad = "DISPONIBLE";
    if (typeof producto.sku === "string") skus.push(producto.sku);
  }
  if (skus.length > 0) {
    catalogo.ultima_actualizacion = new Date().toISOString();
    escribirAtomico(INVENTARIO_PATH, JSON.stringify(catalogo, null, 2));
  }
  return skus;
}

export function guardarMotor(motor: MotorDrops) {
  escribirAtomico(MOTOR_PATH, `${JSON.stringify(motor, null, 2)}\n`);
}

export function anexarTraza(entrada: Record<string, unknown>) {
  fs.appendFileSync(TRAZA_PATH, `${JSON.stringify(entrada)}\n`, "utf8");
}
