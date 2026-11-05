import { NextResponse } from "next/server";
import { applyStockDelta, hasValidEdgeSyncKey, type StockDeltaInput } from "@/lib/edge-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function badRequest(message: string) {
  return NextResponse.json({ status: "ERROR", message }, { status: 400 });
}

export async function POST(request: Request) {
  if (!hasValidEdgeSyncKey(request)) {
    return NextResponse.json({ status: "ERROR", message: "No autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Payload JSON inválido.");
  }

  if (!body || typeof body !== "object") {
    return badRequest("Payload vacío o inválido.");
  }

  const payload = body as Partial<StockDeltaInput>;
  if (typeof payload.idempotency_key !== "string" || !payload.idempotency_key.trim()) {
    return badRequest("idempotency_key es obligatorio.");
  }
  if (typeof payload.articulo_clave !== "string" || !payload.articulo_clave.trim()) {
    return badRequest("articulo_clave es obligatorio.");
  }
  if (typeof payload.delta !== "number" || !Number.isFinite(payload.delta)) {
    return badRequest("delta debe ser numérico.");
  }

  try {
    const result = await applyStockDelta({
      idempotency_key: payload.idempotency_key,
      articulo_clave: payload.articulo_clave,
      delta: payload.delta,
      existencia_final: payload.existencia_final,
      origen: payload.origen,
    });
    if (result.duplicate) {
      return NextResponse.json({ status: "OK", aplicado: false, duplicate: true }, { status: 409 });
    }
    return NextResponse.json({ status: "OK", aplicado: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo aplicar el delta de stock.";
    return NextResponse.json({ status: "ERROR", message }, { status: 500 });
  }
}
