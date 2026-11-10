import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
    const productos = body.productos || [];

    if (!Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json(
        { error: "Payload inválido o lista de productos vacía." },
        { status: 400 }
      );
    }

    console.log(`[SYNC] Recibidos ${productos.length} artículos desde SICAR POS.`);

    return NextResponse.json({
      success: true,
      recibidos: productos.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[SYNC_ERROR]:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el catálogo", detalle: error.message },
      { status: 500 }
    );
  }
}
