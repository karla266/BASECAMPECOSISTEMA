import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export type ProductoFoto = {
  sku: string;
  nombre: string;
  departamento: string;
  categoria: string;
  costo: number;
  precio: number;
  imagen_url: string;
};

const SCRIPT = path.join(process.cwd(), "scripts", "asignar_foto_webp.py");
const DB = path.resolve(process.cwd(), "..", "pos_local.db");
const DIR_PUBLICO = path.join(process.cwd(), "public", "media", "productos");

function rutasJson(): string[] {
  return [
    path.join(process.cwd(), "data", "catalogo_productos.json"),
    path.join(process.cwd(), "data", "inventario_thetrip.json"),
    path.resolve(process.cwd(), "..", "data", "catalogo_productos.json"),
  ];
}

export function skuValido(valor: string): string {
  const sku = valor.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$/.test(sku)) {
    throw new Error("El SKU contiene caracteres que no se pueden usar como nombre de archivo.");
  }
  return sku;
}

function leerDocumento(ruta: string): { envelope: unknown; productos: Record<string, unknown>[] } | null {
  if (!fs.existsSync(ruta)) return null;
  const data = JSON.parse(fs.readFileSync(ruta, "utf8")) as unknown;
  if (Array.isArray(data)) return { envelope: data, productos: data as Record<string, unknown>[] };
  if (data && typeof data === "object") {
    const bolsa = data as Record<string, unknown>;
    for (const clave of ["productos", "items"]) {
      if (Array.isArray(bolsa[clave])) {
        return { envelope: data, productos: bolsa[clave] as Record<string, unknown>[] };
      }
    }
  }
  return null;
}

function imagenDe(item: Record<string, unknown>): string {
  const lista = item.imagenes;
  if (Array.isArray(lista) && typeof lista[0] === "string") return lista[0];
  return typeof item.imagen_url === "string" ? item.imagen_url : "";
}

function filaDesdeItem(item: Record<string, unknown>): ProductoFoto | null {
  const sku = String(item.sku || "").trim();
  if (!sku) return null;
  const costo = Number(item.costo_interno ?? item.precio_compra ?? item.costo ?? 0);
  const precio = Number(item.precio_mxn ?? item.precio_venta ?? item.precio ?? 0);
  return {
    sku,
    nombre: String(item.nombre || sku),
    departamento: String(item.departamento || ""),
    categoria: String(item.categoria || ""),
    costo: Number.isFinite(costo) ? costo : 0,
    precio: Number.isFinite(precio) ? precio : 0,
    imagen_url: imagenDe(item),
  };
}

function filasSqlite(): ProductoFoto[] {
  if (!fs.existsSync(DB)) return [];
  const resultado = spawnSync("python", [SCRIPT, "listar", DB], { encoding: "utf8" });
  if (resultado.status !== 0) return [];
  const filas = JSON.parse(resultado.stdout || "[]") as Record<string, unknown>[];
  return filas.map((fila) => filaDesdeItem(fila)).filter((fila): fila is ProductoFoto => Boolean(fila));
}

export function listarProductosFoto(): ProductoFoto[] {
  const porSku = new Map<string, ProductoFoto>();
  for (const ruta of rutasJson()) {
    const doc = leerDocumento(ruta);
    if (!doc) continue;
    for (const item of doc.productos) {
      const fila = filaDesdeItem(item);
      if (!fila) continue;
      const previa = porSku.get(fila.sku.toLowerCase());
      porSku.set(fila.sku.toLowerCase(), previa ? { ...previa, ...fila, imagen_url: fila.imagen_url || previa.imagen_url } : fila);
    }
  }
  for (const fila of filasSqlite()) {
    const previa = porSku.get(fila.sku.toLowerCase());
    porSku.set(fila.sku.toLowerCase(), previa ? { ...fila, ...previa, imagen_url: previa.imagen_url || fila.imagen_url } : fila);
  }
  return Array.from(porSku.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export function buscarProductoFoto(sku: string): ProductoFoto | undefined {
  const clave = sku.toLowerCase();
  return listarProductosFoto().find((producto) => producto.sku.toLowerCase() === clave);
}

function preciosDe(item: Record<string, unknown>): string {
  return JSON.stringify({
    precio_mxn: item.precio_mxn,
    precio_venta: item.precio_venta,
    precio: item.precio,
    costo_interno: item.costo_interno,
    precio_compra: item.precio_compra,
    precio_ecommerce: item.precio_ecommerce,
    precio_mercadolibre: item.precio_mercadolibre,
  });
}

function escribirImagen(item: Record<string, unknown>, url: string): void {
  const antes = preciosDe(item);
  if (Array.isArray(item.imagenes)) item.imagenes[0] = url;
  else item.imagenes = [url];
  item.imagen_url = url;
  if (preciosDe(item) !== antes) {
    throw new Error("La asignación de foto intentó cambiar un precio.");
  }
}

function guardarDocumento(ruta: string, envelope: unknown): void {
  const temporal = `${ruta}.tmp`;
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(temporal, `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
  fs.renameSync(temporal, ruta);
}

export function asignarImagenCatalogo(sku: string, url: string, nombre: string): void {
  const destino = path.join(process.cwd(), "data", "catalogo_productos.json");
  for (const ruta of rutasJson()) {
    if (path.resolve(ruta) === path.resolve(destino)) continue;
    const doc = leerDocumento(ruta);
    if (!doc) continue;
    const item = doc.productos.find((fila) => String(fila.sku || "").toLowerCase() === sku.toLowerCase());
    if (!item) continue;
    escribirImagen(item, url);
    guardarDocumento(ruta, doc.envelope);
  }
  const existente = leerDocumento(destino);
  const productos = existente?.productos ?? [];
  const envelope = existente?.envelope ?? { productos };
  let item = productos.find((fila) => String(fila.sku || "").toLowerCase() === sku.toLowerCase());
  if (!item) {
    item = { sku, nombre };
    productos.push(item);
    if (!existente) (envelope as { productos: Record<string, unknown>[] }).productos = productos;
  }
  escribirImagen(item, url);
  guardarDocumento(destino, envelope);
  if (fs.existsSync(DB)) {
    const resultado = spawnSync("python", [SCRIPT, "asignar", DB, sku, url], { encoding: "utf8" });
    if (resultado.status !== 0) {
      throw new Error(resultado.stderr || "No se pudo actualizar la foto en SQLite.");
    }
  }
}

export function guardarWebp(bytes: Buffer, sku: string): string {
  fs.mkdirSync(DIR_PUBLICO, { recursive: true });
  const archivo = path.join(DIR_PUBLICO, `${sku}.webp`);
  const resultado = spawnSync("python", [SCRIPT, "convertir", archivo], { input: bytes });
  if (resultado.status !== 0) {
    const detalle = resultado.stderr?.toString() || "No se pudo convertir la foto a WebP.";
    throw new Error(detalle);
  }
  return `/media/productos/${sku}.webp`;
}
