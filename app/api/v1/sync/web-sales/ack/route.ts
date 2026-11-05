import { NextResponse } from "next/server";
import { ackWebSale, hasValidEdgeSyncKey } from "@/lib/edge-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasValidEdgeSyncKey(request)) {
    return NextResponse.json({ status: "ERROR", message: "No autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "ERROR", message: "Payload JSON inválido." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ status: "ERROR", message: "Payload inválido." }, { status: 400 });
  }

  const orderId = String((body as { order_id?: string }).order_id || "").trim();
  if (!orderId) {
    return NextResponse.json({ status: "ERROR", message: "order_id es obligatorio." }, { status: 400 });
  }

  try {
    const updated = await ackWebSale(orderId);
    if (!updated) {
      return NextResponse.json(
        { status: "ERROR", message: "order_id no existe en la cola web." },
        { status: 404 },
      );
    }
    return NextResponse.json({ status: "OK", synced: true, order_id: orderId }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo confirmar la sincronización.";
    return NextResponse.json({ status: "ERROR", message }, { status: 500 });
  }
}
