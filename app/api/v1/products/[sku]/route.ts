import { NextResponse } from "next/server";
import { ejecutarTienda, tenantDe } from "@/lib/tiendaCli";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Contexto = { params: { sku: string } };

export async function PATCH(request: Request, contexto: Contexto) {
  const cambios = await request.json().catch(() => ({}));
  const resultado = await ejecutarTienda("actualizar", {
    sku: decodeURIComponent(contexto.params.sku),
    cambios,
    tenant: tenantDe(request),
  });
  return NextResponse.json(resultado.body, { status: resultado.status });
}
