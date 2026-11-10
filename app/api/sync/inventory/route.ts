import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const RUTA_INVENTARIO = path.join(process.cwd(), "data", "inventario_thetrip.json");
const RUTA_UPLOADS_LOCAL = path.join(process.cwd(), "public", "uploads");
const RUTA_UPLOADS_HOSTINGER = "/home/u893741392/domains/basecamp420.com/public_html/uploads";

interface SicarSyncItem {
  id: number;
  sku: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria?: string;
  departamento?: string;
}

const SINONIMOS: Record<string, string[]> = {
  "blueberry": ["mora", "arandano"],
  "grape": ["uva", "purple"],
  "pineapple": ["pina"],
  "strawberry": ["fresa"],
  "chocolate": ["choco"],
  "watermelon": ["sandia"],
  "peach": ["durazno"],
  "apple": ["manzana"],
  "banana": ["platano"],
  "melon": ["menlon"],
  "crema": ["cream", "batida"],
  "acrilico": ["acrylic"],
  "silicon": ["silicone"],
  "charola": ["bandeja", "tray"],
  "moledor": ["grinder"],
  "sabana": ["papel", "rolling", "tips"],
  "pipa": ["pipe"]
};

const PALABRAS_CLAVE_CONOCIDAS = [
  "blunt", "wrap", "xxl", "platinum", "double", "kreepy", "original",
  "afghan", "hemp", "blazy", "susan", "raw", "ocb", "smoking", "lion",
  "cyclones", "hornet", "juicy", "elements", "alien", "tips", "filter",
  "bong", "pipa", "grinder", "bubbler", "dabber", "charola", "bandeja",
  "silicon", "acrilico", "pyrex", "vidrio", "conos", "cones",
  "blueberry", "chocolate", "grape", "melon", "menlon", "mango", "vanilla",
  "strawberry", "kiwi", "pineapple", "pinapple", "watermelon", "cherry",
  "fresa", "mora", "uva", "pina", "durazno", "cereza", "platano", "sandia",
  "zero", "black", "purple", "sweet", "wet", "cosmic", "spark"
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function extraerTokensDescompuestos(nombreArchivoOProducto: string): Set<string> {
  const norm = normalizar(nombreArchivoOProducto)
    .replace(/1024x1024|1296x|500x500|\d{1,4}x\d{1,4}/g, "")
    .replace(/teotros|thetrip/g, "");

  const tokens = new Set<string>();

  for (const kw of PALABRAS_CLAVE_CONOCIDAS) {
    if (norm.includes(kw)) {
      tokens.add(kw);
      if (SINONIMOS[kw]) {
        SINONIMOS[kw].forEach(s => tokens.add(s));
      }
    }
  }

  const partes = nombreArchivoOProducto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2 && !["para", "con", "los", "las", "del", "que", "otros"].includes(t));

  for (const p of partes) {
    tokens.add(p);
    if (SINONIMOS[p]) {
      SINONIMOS[p].forEach(s => tokens.add(s));
    }
  }

  return tokens;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const edgeSecretHeader = req.headers.get("x-edge-secret") || "";
    const expectedSecret = process.env.EDGE_SYNC_SECRET;

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : edgeSecretHeader;

    if (!expectedSecret || token !== expectedSecret) {
      return NextResponse.json(
        { error: "No autorizado. Token de sincronización inválido." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const productosRecibidos: SicarSyncItem[] = body.productos || [];

    if (!Array.isArray(productosRecibidos) || productosRecibidos.length === 0) {
      return NextResponse.json(
        { error: "Payload inválido o lista de productos vacía." },
        { status: 400 }
      );
    }

    // 1. Detectar carpeta de uploads (preferir ruta persistente de Hostinger si existe)
    let rutaEfectivaUploads = "";
    if (fs.existsSync(RUTA_UPLOADS_HOSTINGER) && fs.readdirSync(RUTA_UPLOADS_HOSTINGER).some(f => f.endsWith(".webp"))) {
      rutaEfectivaUploads = RUTA_UPLOADS_HOSTINGER;
    } else if (fs.existsSync(RUTA_UPLOADS_LOCAL) && fs.readdirSync(RUTA_UPLOADS_LOCAL).some(f => f.endsWith(".webp"))) {
      rutaEfectivaUploads = RUTA_UPLOADS_LOCAL;
    }

    interface FotoIndexada {
      archivo: string;
      nombreNorm: string;
      tokens: Set<string>;
    }
    const catalogoFotos: FotoIndexada[] = [];

    if (rutaEfectivaUploads) {
      try {
        const archivos = fs.readdirSync(rutaEfectivaUploads);
        for (const arch of archivos) {
          if (arch.toLowerCase().endsWith(".webp")) {
            catalogoFotos.push({
              archivo: arch,
              nombreNorm: normalizar(arch.replace(/\.webp$/i, "")),
              tokens: extraerTokensDescompuestos(arch)
            });
          }
        }
      } catch (err) {
        console.warn("[SYNC] Error al leer directorio de fotos:", err);
      }
    }

    // 2. Cargar inventario_thetrip.json
    let rawContenido: any = { productos: [] };
    if (fs.existsSync(RUTA_INVENTARIO)) {
      try {
        const fileData = fs.readFileSync(RUTA_INVENTARIO, "utf-8");
        rawContenido = JSON.parse(fileData);
        if (!Array.isArray(rawContenido.productos)) {
          rawContenido.productos = [];
        }
      } catch (err) {
        console.warn("[SYNC] Error al leer inventario_thetrip.json:", err);
        rawContenido = { productos: [] };
      }
    }

    const mapaProductos = new Map<string, any>();
    for (const prod of rawContenido.productos) {
      if (prod && prod.sku) {
        mapaProductos.set(String(prod.sku).trim().toUpperCase(), prod);
      }
    }

    let actualizados = 0;
    let nuevos = 0;
    let fotosAsociadas = 0;

    for (const item of productosRecibidos) {
      const skuNorm = (item.sku || "").trim().toUpperCase();
      if (!skuNorm) continue;

      const precioNum = Number(item.precio) || 0;
      const stockNum = Number(item.stock) || 0;
      const estadoDisponibilidad = stockNum > 0 ? "EN_STOCK" : "AGOTADO";
      const catLimpia = (item.categoria && item.categoria !== "SIN DEFINIR") ? item.categoria : "Parafernalia";
      const depLimpio = item.departamento || "The Trip";

      // 3. Matching enriquecido
      const nombreNormProd = normalizar(item.nombre || "");
      const tokensProd = extraerTokensDescompuestos(item.nombre || "");

      let mejorFoto = "";
      let mayorPuntaje = 0;

      for (const f of catalogoFotos) {
        let coincidencias = 0;
        let tieneSaborMarca = false;

        tokensProd.forEach(tp => {
          if (f.tokens.has(tp)) {
            coincidencias++;
            if (["blueberry", "chocolate", "grape", "kreepy", "melon", "menlon", "mango", "vanilla", "strawberry", "kiwi", "pineapple", "pinapple", "watermelon", "cherry", "pina", "uva", "fresa", "sandia", "zero"].includes(tp)) {
              tieneSaborMarca = true;
              coincidencias += 2;
            }
          }
        });

        if (nombreNormProd.length > 5 && f.nombreNorm.includes(nombreNormProd)) {
          coincidencias += 4;
        }

        if (coincidencias > mayorPuntaje && (coincidencias >= 3 || (tieneSaborMarca && coincidencias >= 2))) {
          mayorPuntaje = coincidencias;
          mejorFoto = `/uploads/${f.archivo}`;
        }
      }

      if (mapaProductos.has(skuNorm)) {
        const prod = mapaProductos.get(skuNorm);
        prod.precio_mxn = precioNum;
        prod.stock_disponible = stockNum;
        if (prod.disponibilidad !== "PRE-VENTA") {
          prod.disponibilidad = estadoDisponibilidad;
        }
        if (!prod.categoria || prod.categoria === "Catálogo General") {
          prod.categoria = catLimpia;
        }
        prod.departamento = depLimpio;

        // Actualizar o asignar foto si se encontró una mejor coincidencia
        if (mejorFoto && (!prod.imagenes || prod.imagenes.length === 0 || prod.imagenes[0] !== mejorFoto)) {
          prod.imagenes = [mejorFoto];
          fotosAsociadas++;
        }
        actualizados++;
      } else {
        const imagenesInit = mejorFoto ? [mejorFoto] : [];
        if (mejorFoto) fotosAsociadas++;

        const nuevoProd = {
          id: `prod_sicar_${item.id}`,
          sku: item.sku,
          nombre: item.nombre,
          precio_mxn: precioNum,
          stock_disponible: stockNum,
          disponibilidad: estadoDisponibilidad,
          categoria: catLimpia,
          departamento: depLimpio,
          imagenes: imagenesInit
        };
        mapaProductos.set(skuNorm, nuevoProd);
        nuevos++;
      }
    }

    const listaFinal = Array.from(mapaProductos.values());
    const payloadFinal = {
      ...rawContenido,
      total_variantes: listaFinal.length,
      productos: listaFinal,
      ultima_actualizacion: new Date().toISOString()
    };

    fs.writeFileSync(RUTA_INVENTARIO, JSON.stringify(payloadFinal, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      total_variantes: payloadFinal.total_variantes,
      actualizados,
      nuevos,
      fotos_asociadas: fotosAsociadas,
      fotos_disponibles_en_disco: catalogoFotos.length,
      directorio_usado: rutaEfectivaUploads || "NINGUNO_ENCONTRADO",
      timestamp: payloadFinal.ultima_actualizacion
    });
  } catch (error: any) {
    console.error("[SYNC_ERROR]:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el catálogo", detalle: error.message },
      { status: 500 }
    );
  }
}
