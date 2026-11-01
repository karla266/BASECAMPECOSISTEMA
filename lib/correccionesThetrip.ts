import { spawnSync } from "node:child_process";
import fs from "fs";
import path from "path";

export type FotoBlunt = {
  sku: string;
  nombre: string;
  foto_actual: string;
  problema: string;
  foto_sugerida?: string;
};

export type Precio3x = {
  sku: string;
  nombre: string;
  costo: number;
  precio_actual: number;
  precio_sugerido: number;
};

export type Correcciones = {
  fotos_blunts: FotoBlunt[];
  precios_3x: Precio3x[];
};

const VACIO: Correcciones = { fotos_blunts: [], precios_3x: [] };
const PENDIENTES = path.join(process.cwd(), "data", "correcciones_pendientes.json");
const INVENTARIO = path.join(process.cwd(), "data", "inventario_thetrip.json");
const CATALOGO = path.join(process.cwd(), "data", "catalogo_the_trip.json");

function leerJson<T>(ruta: string, respaldo: T): T {
  if (!fs.existsSync(ruta)) return respaldo;
  return JSON.parse(fs.readFileSync(ruta, "utf8")) as T;
}

function guardarJson(ruta: string, datos: unknown) {
  fs.writeFileSync(ruta, `${JSON.stringify(datos, null, 2)}\n`, "utf8");
}

export function leerCorrecciones(): Correcciones {
  const datos = leerJson<Partial<Correcciones>>(PENDIENTES, VACIO);
  return {
    fotos_blunts: Array.isArray(datos.fotos_blunts) ? datos.fotos_blunts : [],
    precios_3x: Array.isArray(datos.precios_3x) ? datos.precios_3x : [],
  };
}

function guardarCorrecciones(datos: Correcciones) {
  guardarJson(PENDIENTES, datos);
}

type ArchivoProductos = { productos?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>;

function listaProductos(datos: ArchivoProductos): Array<Record<string, unknown>> {
  if (Array.isArray(datos)) return datos;
  return Array.isArray(datos.productos) ? datos.productos : [];
}

function escribirProducto(ruta: string, sku: string, aplicar: (producto: Record<string, unknown>) => void) {
  if (!fs.existsSync(ruta)) return false;
  const datos = leerJson<ArchivoProductos>(ruta, { productos: [] });
  const lista = listaProductos(datos);
  const producto = lista.find((item) => String(item.sku || "") === sku);
  if (!producto) return false;
  aplicar(producto);
  guardarJson(ruta, datos);
  return true;
}

export function reauditar() {
  const resultado = spawnSync("python", ["scripts/auditoria_thetrip.py"], {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 60000,
  });
  if (resultado.status !== 0) {
    throw new Error(resultado.stderr || resultado.stdout || "La auditoría no pudo generar el reporte.");
  }
  return leerCorrecciones();
}

export function aprobarPrecio(sku: string) {
  const pendientes = leerCorrecciones();
  const fila = pendientes.precios_3x.find((item) => item.sku === sku);
  if (!fila || !(fila.precio_sugerido > 0)) {
    return { ok: false as const, status: 404, error: "Ese precio no está en la cola." };
  }
  const asignar = (producto: Record<string, unknown>) => {
    if ("precio_mxn" in producto || !("precio" in producto)) producto.precio_mxn = fila.precio_sugerido;
    if ("precio" in producto) producto.precio = fila.precio_sugerido;
    if ("precio_venta" in producto) producto.precio_venta = fila.precio_sugerido;
  };
  const guardado = escribirProducto(INVENTARIO, sku, asignar) || escribirProducto(CATALOGO, sku, asignar);
  if (!guardado) {
    return { ok: false as const, status: 404, error: "El SKU no está en el catálogo de The Trip." };
  }
  const correcciones = {
    ...pendientes,
    precios_3x: pendientes.precios_3x.filter((item) => item.sku !== sku),
  };
  guardarCorrecciones(correcciones);
  return { ok: true as const, correcciones };
}

export function aprobarPrecios() {
  const pendientes = leerCorrecciones();
  const aplicados = new Set<string>();
  for (const fila of pendientes.precios_3x) {
    const resultado = aprobarPrecio(fila.sku);
    if (resultado.ok) aplicados.add(fila.sku);
  }
  return { ok: true as const, aplicados: aplicados.size, correcciones: leerCorrecciones() };
}

function rutaPublicaSegura(relativa: string) {
  const limpia = relativa.replace(/\\/g, "/");
  if (!limpia.startsWith("/assets/productos/blunts/") || !limpia.toLowerCase().endsWith(".webp") || limpia.includes("..")) {
    return "";
  }
  const absoluta = path.resolve(process.cwd(), "public", limpia.replace(/^\/+/, ""));
  const base = path.resolve(process.cwd(), "public", "assets", "productos", "blunts");
  const dentro = absoluta.toLowerCase().startsWith(`${base.toLowerCase()}${path.sep}`);
  if (!dentro) return "";
  return fs.existsSync(absoluta) ? limpia : "";
}

export function aprobarFoto(sku: string) {
  const pendientes = leerCorrecciones();
  const fila = pendientes.fotos_blunts.find((item) => item.sku === sku);
  if (!fila) return { ok: false as const, status: 404, error: "Esa foto no está en la cola." };
  const sugerida = fila.foto_sugerida || "";
  const ruta = rutaPublicaSegura(sugerida);
  if (!ruta) {
    return {
      ok: false as const,
      status: 409,
      error: `Falta el archivo ${sugerida || ".webp"}. Colócalo en public y vuelve a aprobar.`,
    };
  }
  const asignar = (producto: Record<string, unknown>) => {
    const actuales = Array.isArray(producto.imagenes) ? producto.imagenes.map(String) : [];
    producto.imagenes = [ruta, ...actuales.filter((item) => item !== ruta)];
  };
  const guardado = escribirProducto(INVENTARIO, sku, asignar) || escribirProducto(CATALOGO, sku, asignar);
  if (!guardado) {
    return { ok: false as const, status: 404, error: "El SKU no está en el catálogo de The Trip." };
  }
  const correcciones = {
    ...pendientes,
    fotos_blunts: pendientes.fotos_blunts.filter((item) => item.sku !== sku),
  };
  guardarCorrecciones(correcciones);
  return { ok: true as const, correcciones };
}
