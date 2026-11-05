import mysql, { Pool, RowDataPacket } from "mysql2/promise";
import { TripProduct, resolverRutaImagen } from "@/lib/thetrip-helper";

declare global {
  // eslint-disable-next-line no-var
  var sicarPool3307: Pool | undefined;
}

export function getSicarPool(): Pool {
  const configuredPort = Number(process.env.DB_SMOKESHOP_PORT || 3307);
  if (configuredPort === 3308) {
    throw new Error("VIOLACIÓN DE ARQUITECTURA: The Trip no puede conectarse al puerto 3308.");
  }

  if (!global.sicarPool3307) {
    global.sicarPool3307 = mysql.createPool({
      host: process.env.SICAR_HOST || "127.0.0.1",
      port: configuredPort,
      user: process.env.DB_SMOKESHOP_USER || "sicar_read",
      password: process.env.DB_SMOKESHOP_PASSWORD || "",
      database: process.env.DB_SMOKESHOP_NAME || "sicar",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000,
      supportBigNumbers: true,
      bigNumberStrings: true,
      decimalNumbers: false,
    });
  }

  return global.sicarPool3307;
}

export interface SicarArticuloRow extends RowDataPacket {
  sku: string;
  nombre: string;
  descripcion: string | null;
  departamento: string | null;
  marca: string | null;
  costo_base: string;
  precio1: string;
  existencia: string | number;
  fase_web?: string | null;
  imagen_url?: string | null;
}

export function clasificarCategoriaSicar(
  sku: string,
  nombre: string,
  departamento: string
): TripProduct["categoria"] {
  const texto = `${sku} ${nombre} ${departamento}`.toLowerCase();

  if (sku.toLowerCase().startsWith("bw2x-") || texto.includes("blunt")) {
    return "BLUNT_WRAP";
  }
  if (
    texto.includes("bong") ||
    texto.includes("pyrex") ||
    texto.includes("pipa") ||
    texto.includes("cristal")
  ) {
    return "BONGS_PYREX";
  }
  if (texto.includes("cono") || texto.includes("papel") || texto.includes("raw") || texto.includes("ocb")) {
    return "CONOS";
  }
  if (
    texto.includes("outdoor") ||
    texto.includes("montaña") ||
    texto.includes("camping") ||
    texto.includes("arnes") ||
    texto.includes("casco") ||
    texto.includes("piolet") ||
    texto.includes("parapente")
  ) {
    return "OUTDOOR";
  }

  return "ACCESORIOS";
}

export function mapearFilaSicarAProducto(row: SicarArticuloRow): TripProduct {
  const skuLimpio = String(row.sku || "").trim();
  const stockNumerico = Math.max(0, Math.floor(Number(row.existencia || 0)));
  const categoria = clasificarCategoriaSicar(skuLimpio, row.nombre || "", row.departamento || "");
  const faseCalculada: TripProduct["fase"] =
    row.fase_web === "PREVENTA_2X" || (categoria === "ACCESORIOS" && stockNumerico === 0)
      ? "PREVENTA_2X"
      : "STOCK_3X";

  const costoBase = Number(row.costo_base || "0").toFixed(2);
  const precio1 = Number(row.precio1 || "0").toFixed(2);

  return {
    sku: skuLimpio,
    nombre: String(row.nombre || "").trim(),
    categoria,
    marca: row.marca ? String(row.marca).trim() : undefined,
    costoBase,
    precio1,
    stock: stockNumerico,
    fase: faseCalculada,
    imagenUrl: resolverRutaImagen(skuLimpio, row.imagen_url || undefined),
    descripcion: row.descripcion ? String(row.descripcion).trim() : undefined,
  };
}
