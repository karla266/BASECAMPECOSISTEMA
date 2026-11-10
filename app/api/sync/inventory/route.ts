import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const RUTA_INVENTARIO = path.join(process.cwd(), "data", "inventario_thetrip.json");
const RUTA_UPLOADS = path.join(process.cwd(), "public", "uploads");

interface SicarSyncItem {
  id: number;
  sku: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria?: string;
  departamento?: string;
}

// Limpia caracteres y genera tokens alfanuméricos relevantes (> 2 caracteres)
function extraerTokens(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2 && !["para", "con", "los", "las", "del", "que", "1024x1024", "otros"].includes(t));
}

function normalizarCadena(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
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

    // 1. Indexar fotos disponibles en public/uploads
    interface FotoIndexada {
      archivo: string;
      nombreNorm: string;
      tokens: string[];
    }
    const catalogoFotos: FotoIndexada[] = [];

    if (fs.existsSync(RUTA_UPLOADS)) {
      try {
        const archivos = fs.readdirSync(RUTA_UPLOADS);
        for (const arch of archivos) {
          if (arch.toLowerCase().endsWith(".webp")) {
            const base = arch.replace(/\.webp$/i, "").replace(/^te-otros-/, "");
            catalogoFotos.push({
              archivo: arch,
              nombreNorm: normalizarCadena(base),
              tokens: extraerTokens(base)
            });
          }
        }
      } catch (err) {
        console.warn("[SYNC] Error al leer public/uploads:", err);
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

    // 3. Mapear existentes por SKU
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

      // 4. Emparejamiento inteligente de foto
      const nombreNormProd = normalizarCadena(item.nombre || "");
      const tokensProd = extraerTokens(item.nombre || "");
      let mejorFoto = "";
      let mayorPuntaje = 0;

      for (const f of catalogoFotos) {
        // Coincidencia exacta de cadena normalizada
        if (nombreNormProd.length > 5 && (f.nombreNorm.includes(nombreNormProd) || nombreNormProd.includes(f.nombreNorm))) {
          mejorFoto = `/uploads/${f.archivo}`;
          break;
        }

        // Puntuación por coincidencia de tokens compartidos
        let coincidencias = 0;
        for (const tp of tokensProd) {
          if (f.tokens.includes(tp) || f.nombreNorm.includes(tp)) {
            coincidencias++;
          }
        }

        if (coincidencias >= 2 && coincidencias > mayorPuntaje) {
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

        if ((!prod.imagenes || prod.imagenes.length === 0) && mejorFoto) {
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
    console.log(`[SYNC] OK: ${actualizados} act, ${nuevos} nuevos, ${fotosAsociadas} fotos asociadas.`);

    return NextResponse.json({
      success: true,
      total_variantes: payloadFinal.total_variantes,
      actualizados,
      nuevos,
      fotos_asociadas: fotosAsociadas,
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
