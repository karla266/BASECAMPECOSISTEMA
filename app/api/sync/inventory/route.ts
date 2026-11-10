import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const RUTA_INVENTARIO = path.join(process.cwd(), "data", "inventario_thetrip.json");

interface SicarSyncItem {
  id: number;
  sku: string;
  nombre: string;
  precio: number;
  stock: number;
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

    // 1. Leer archivo existente preservando estructura
    let rawContenido: any = { productos: [] };
    if (fs.existsSync(RUTA_INVENTARIO)) {
      try {
        const fileData = fs.readFileSync(RUTA_INVENTARIO, "utf-8");
        rawContenido = JSON.parse(fileData);
        if (!Array.isArray(rawContenido.productos)) {
          rawContenido.productos = [];
        }
      } catch (err) {
        console.warn("[SYNC] Error al leer inventario_thetrip.json previo:", err);
        rawContenido = { productos: [] };
      }
    }

    // 2. Mapear existentes por SKU normalizado
    const mapaProductos = new Map<string, any>();
    for (const prod of rawContenido.productos) {
      if (prod && prod.sku) {
        mapaProductos.set(String(prod.sku).trim().toUpperCase(), prod);
      }
    }

    let actualizados = 0;
    let nuevos = 0;

    // 3. Upsert atómico por SKU
    for (const item of productosRecibidos) {
      const skuNorm = (item.sku || "").trim().toUpperCase();
      if (!skuNorm) continue;

      const precioNum = Number(item.precio) || 0;
      const stockNum = Number(item.stock) || 0;
      const estadoDisponibilidad = stockNum > 0 ? "EN_STOCK" : "AGOTADO";

      if (mapaProductos.has(skuNorm)) {
        const prodExistente = mapaProductos.get(skuNorm);
        prodExistente.precio_mxn = precioNum;
        prodExistente.stock_disponible = stockNum;
        // Solo pasar a EN_STOCK o AGOTADO si no está en pre-venta manual
        if (prodExistente.disponibilidad !== "PRE-VENTA") {
          prodExistente.disponibilidad = estadoDisponibilidad;
        }
        if (!prodExistente.nombre || prodExistente.nombre.trim() === "") {
          prodExistente.nombre = item.nombre;
        }
        actualizados++;
      } else {
        const nuevoProd = {
          id: `prod_sicar_${item.id}`,
          sku: item.sku,
          nombre: item.nombre,
          precio_mxn: precioNum,
          stock_disponible: stockNum,
          disponibilidad: estadoDisponibilidad,
          categoria: "Catálogo General",
          imagenes: []
        };
        mapaProductos.set(skuNorm, nuevoProd);
        nuevos++;
      }
    }

    // 4. Guardar archivo final conservando llaves raíz
    const listaFinal = Array.from(mapaProductos.values());
    const payloadFinal = {
      ...rawContenido,
      total_variantes: listaFinal.length,
      productos: listaFinal,
      ultima_actualizacion: new Date().toISOString()
    };

    fs.writeFileSync(RUTA_INVENTARIO, JSON.stringify(payloadFinal, null, 2), "utf-8");
    console.log(`[SYNC] SICAR -> The Trip: ${actualizados} actualizados, ${nuevos} nuevos. Total: ${listaFinal.length}`);

    return NextResponse.json({
      success: true,
      total_variantes: payloadFinal.total_variantes,
      actualizados,
      nuevos,
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
