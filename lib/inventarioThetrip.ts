import fs from "fs";
import path from "path";

export type ProductoTheTrip = {
  id?: string;
  sku: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  subcategoria?: string;
  precio_mxn?: number;
  stock_disponible?: number;
  disponibilidad?: string;
  fecha_llegada?: string;
  imagenes?: string[];
  imagen_url?: string;
  mercadolibre_url?: string;
  link_cobro?: string;
  departamento?: string;
  fase_comercial?: string;
};

export type InventarioTheTrip = {
  productos: ProductoTheTrip[];
  ultima_actualizacion?: string;
};

const RUTA = path.join(process.cwd(), "data", "inventario_thetrip.json");

export function leerInventarioTheTrip(): InventarioTheTrip {
  const data = JSON.parse(fs.readFileSync(RUTA, "utf8")) as InventarioTheTrip;
  if (!Array.isArray(data.productos)) {
    throw new Error("inventario_thetrip.json no tiene una lista de productos.");
  }
  return data;
}

export function buscarProductoPorSku(sku: string): ProductoTheTrip | undefined {
  const clave = decodeURIComponent(sku).toLowerCase();
  return leerInventarioTheTrip().productos.find((producto) => producto.sku.toLowerCase() === clave);
}
