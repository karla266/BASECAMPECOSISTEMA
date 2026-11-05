import { NextResponse } from "next/server";
import { ejecutarTienda, tenantDe } from "@/lib/tiendaCli";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Contexto = { params: Promise<{ sku: string }> };

export async function PATCH(request: Request, contexto: Contexto) {
  const cambios = await request.json().catch(() => ({}));
  const { sku } = await contexto.params;
  const resultado = await ejecutarTienda("actualizar", {
    sku: decodeURIComponent(sku),
    cambios,
    tenant: tenantDe(request),
  });
  return NextResponse.json(resultado.body, { status: resultado.status });
}
