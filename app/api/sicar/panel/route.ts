import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PILOTO = ["1779", "1409", "995", "264", "1128"];

const PAQUETES: Record<string, { tomas: string[]; video: string[] }> = {
  "1779": {
    tomas: [
      "Frente: sleeping de pluma sobre fondo neutro.",
      "Detalle: cierre y costura de los bafles.",
      "Lifestyle: tendido junto a una casa de campaña.",
      "Cuadrada Mercado Libre: rollo centrado, sin texto.",
    ],
    video: [
      "Plano 1: el sleeping enrollado entra en cuadro.",
      "Plano 2: se abre el cierre y se ve el interior.",
      "Plano 3: queda tendido en un campamento al anochecer.",
      "Cierre: precio de renta y leyenda de retiro en tienda.",
    ],
  },
  "1409": {
    tomas: [
      "Frente: una pieza mediana del artículo HITER, fondo neutro, sin uso.",
      "Detalle: tamaño de la pieza suelta.",
      "Lifestyle: sobre el mostrador, sin encender.",
      "Cuadrada Mercado Libre: pieza centrada, sin texto.",
    ],
    video: ["Giro de 360 grados.", "Acercamiento al tamaño mediano.", "Pieza sobre el mostrador.", "Precio SICAR y existencia del paquete."],
  },
  "995": {
    tomas: [
      "Frente: pila de bolsas negras vacías.",
      "Detalle: cierre zip.",
      "Lifestyle: paquete en anaquel.",
      "Cuadrada Mercado Libre: stack centrado.",
    ],
    video: ["La pila entra en cuadro.", "Se abre una bolsa vacía.", "Se cierra el zip.", "Cantidad del paquete y precio."],
  },
  "264": {
    tomas: [
      "Frente: bowl de vidrio vacío.",
      "Detalle: junta y borde.",
      "Lifestyle: junto a otros repuestos, sin humo.",
      "Cuadrada Mercado Libre: pieza centrada.",
    ],
    video: ["Pieza sobre fondo blanco.", "Giro corto.", "Acercamiento al borde.", "Precio y existencia SICAR."],
  },
  "1128": {
    tomas: [
      "Frente: charola metálica con diseño.",
      "Detalle: el grabado.",
      "Lifestyle: sobre mesa, sin contenido.",
      "Cuadrada Mercado Libre: charola centrada.",
    ],
    video: ["La charola entra de lado.", "Recorrido del diseño.", "Vista cenital.", "Precio y existencia."],
  },
};

const ROLES = ["frente", "detalle", "lifestyle", "ml"] as const;
const SKU_PHOTO_MAP_PATH = path.join(process.cwd(), "..", "data", "sku-photo-map.json");

function redondear(valor: number) {
  return Math.round(valor * 100) / 100;
}

function precios(base: number) {
  const precioSicar = redondear(base);
  const precioMl = redondear(precioSicar * 1.15);
  const precioWeb = redondear(precioMl * 0.85);
  return { precio_sicar: precioSicar, precio_ml: precioMl, precio_web: precioWeb };
}

function fichaTexto(descripcion: string, depto: string, categoria: string, tipo: string) {
  const rubro = categoria || depto || "catálogo";
  const uso = tipo === "renta"
    ? "Se renta en tienda y se entrega en el mostrador."
    : "Se vende en tienda y puede salir con el precio de SICAR.";
  return {
    descripcion_generada: `${descripcion} es un artículo de ${rubro}. ${uso}`,
    textos: [
      `Título: ${descripcion}`,
      `Qué es: ${descripcion}, rubro ${rubro}.`,
      `Para qué sirve: ${uso}`,
    ],
  };
}

function esRenta(depto: string, categoria: string, descripcion: string) {
  const texto = `${depto} ${categoria} ${descripcion}`.toUpperCase();
  return texto.includes("RENTA") || texto.includes("ALQUILER");
}

async function conectar() {
  return mysql.createConnection({
    host: process.env.SICAR_HOST || "127.0.0.1",
    port: Number(process.env.SICAR_PORT || 3307),
    user: process.env.SICAR_USER || process.env.DB_USER || "root",
    password: process.env.SICAR_PASS || process.env.DB_PASSWORD || "",
    database: process.env.SICAR_DATABASE || process.env.SICAR_DB_NAME || "sicar",
    connectTimeout: 4000,
  });
}

function leerMapaSkuFotos(): Record<string, string> {
  try {
    const raw = fs.readFileSync(SKU_PHOTO_MAP_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string" && value.trim()) out[key.toUpperCase()] = value.trim();
    }
    return out;
  } catch {
    return {};
  }
}

function imagenesDe(artId: string, clave: string, mapaSkuFotos: Record<string, string>) {
  const carpeta = path.join(process.cwd(), "public", "lote");
  const salida: Record<string, string | null> = {};
  for (const rol of ROLES) {
    const archivo = path.join(carpeta, `lote-${artId}-${rol}.jpg`);
    salida[rol] = fs.existsSync(archivo) ? `/lote/lote-${artId}-${rol}.jpg` : null;
  }
  const fotoSku =
    mapaSkuFotos[String(clave || "").toUpperCase()] || mapaSkuFotos[String(artId || "").toUpperCase()];
  if (fotoSku && !salida.frente) {
    salida.frente = `/api/webcam/${encodeURIComponent(fotoSku)}`;
  }
  return salida;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  let db: mysql.Connection | null = null;
  try {
    db = await conectar();
    const [resumenFilas] = await db.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN UPPER(COALESCE(d.nombre,'')) LIKE '%RENTA%'
                   OR UPPER(COALESCE(c.nombre,'')) LIKE '%RENTA%'
                   OR UPPER(COALESCE(a.descripcion,'')) LIKE 'RENTA %'
                   OR UPPER(COALESCE(a.descripcion,'')) LIKE '%ALQUILER%'
              THEN 1 ELSE 0 END) AS renta,
         SUM(CASE WHEN a.status = 1 OR a.status IS NULL THEN 1 ELSE 0 END) AS activos,
         SUM(COALESCE(a.existencia, 0)) AS piezas,
         SUM(COALESCE(a.precio1, 0) * COALESCE(a.existencia, 0)) AS valor
       FROM articulo a
       LEFT JOIN categoria c ON a.cat_id = c.cat_id
       LEFT JOIN departamento d ON c.dep_id = d.dep_id`
    );
    const resumen = (resumenFilas as Array<Record<string, number>>)[0] || {};
    const total = Number(resumen.total || 0);
    const renta = Number(resumen.renta || 0);

    const filtro = q ? "AND (a.descripcion LIKE ? OR a.clave LIKE ? OR d.nombre LIKE ?)" : "";
    const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];
    const [productos] = await db.query(
      `SELECT a.art_id, a.clave, a.descripcion, a.precio1, a.existencia, a.status,
              COALESCE(d.nombre, 'SIN DEPARTAMENTO') AS depto,
              COALESCE(c.nombre, '') AS categoria
       FROM articulo a
       LEFT JOIN categoria c ON a.cat_id = c.cat_id
       LEFT JOIN departamento d ON c.dep_id = d.dep_id
       WHERE a.descripcion IS NOT NULL AND TRIM(a.descripcion) <> ''
       ${filtro}
       ORDER BY a.existencia DESC, a.art_id DESC
       LIMIT 40`,
      params
    );

    const marcas = PILOTO.map(() => "?").join(",");
    const [pilotoFilas] = await db.query(
      `SELECT a.art_id, a.clave, a.descripcion, a.precio1, a.existencia,
              COALESCE(d.nombre, 'SIN DEPARTAMENTO') AS depto,
              COALESCE(c.nombre, '') AS categoria
       FROM articulo a
       LEFT JOIN categoria c ON a.cat_id = c.cat_id
       LEFT JOIN departamento d ON c.dep_id = d.dep_id
       WHERE a.art_id IN (${marcas})`,
      PILOTO
    );

    const mapaSkuFotos = leerMapaSkuFotos();
    const mapear = (fila: Record<string, unknown>) => {
      const descripcion = String(fila.descripcion || "");
      const depto = String(fila.depto || "");
      const categoria = String(fila.categoria || "");
      const artId = String(fila.art_id);
      const clave = String(fila.clave || "");
      const paquete = PAQUETES[artId];
      const tipo = esRenta(depto, categoria, descripcion) ? "renta" : "venta";
      const textos = fichaTexto(descripcion, depto, categoria, tipo);
      return {
        art_id: artId,
        clave,
        descripcion,
        depto,
        categoria,
        existencia: Number(fila.existencia || 0),
        tipo,
        descripcion_generada: textos.descripcion_generada,
        textos: textos.textos,
        ...precios(Number(fila.precio1 || 0)),
        imagenes: imagenesDe(artId, clave, mapaSkuFotos),
        tomas: paquete?.tomas || [],
        video: paquete?.video || [],
        mercado_libre: "no_publicado",
        sitio_web: "no_publicado",
      };
    };

    const lista = (productos as Array<Record<string, unknown>>).map(mapear);
    const prueba = PILOTO.map((id) =>
      (pilotoFilas as Array<Record<string, unknown>>).find((fila) => String(fila.art_id) === id)
    )
      .filter(Boolean)
      .map((fila) => mapear(fila as Record<string, unknown>));

    return NextResponse.json({
      conectado: true,
      fuente: "SICAR MariaDB 127.0.0.1:3307 / sicar",
      total_articulos: total,
      en_renta: renta,
      en_venta: total - renta,
      activos: Number(resumen.activos || 0),
      piezas: Number(resumen.piezas || 0),
      valor_inventario: redondear(Number(resumen.valor || 0)),
      productos: lista,
      prueba,
      hostinger: {
        conectado: false,
        motivo: "No hay token de API de Hostinger en el entorno. El FTP del workflow no entrega visitas ni ventas.",
        sitio_configurado: "basecamp420.com",
        lectura_ia: null,
      },
    });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "SICAR no respondió";
    return NextResponse.json(
      {
        conectado: false,
        error: mensaje,
        total_articulos: null,
        en_renta: null,
        en_venta: null,
        piezas: null,
        valor_inventario: null,
        productos: [],
        prueba: [],
        hostinger: {
          conectado: false,
          motivo: "Hostinger sigue sin token de API.",
          sitio_configurado: "basecamp420.com",
          lectura_ia: null,
        },
      },
      { status: 503 }
    );
  } finally {
    if (db) await db.end();
  }
}
