import { NextResponse } from "next/server";
import { hasValidEdgeSyncKey, listPendingWebSales } from "@/lib/edge-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasValidEdgeSyncKey(request)) {
    return NextResponse.json({ status: "ERROR", message: "No autorizado." }, { status: 401 });
  }

  try {
    const pending = await listPendingWebSales();
    return NextResponse.json({ status: "OK", orders: pending }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar la cola de ventas web.";
    return NextResponse.json({ status: "ERROR", message }, { status: 500 });
  }
}
