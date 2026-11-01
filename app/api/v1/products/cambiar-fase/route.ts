import { NextResponse } from "next/server";
import { ejecutarTienda, tenantDe } from "@/lib/tiendaCli";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const cuerpo = await request.json().catch(() => ({}));
  const resultado = await ejecutarTienda("cambiar-fase", { ...cuerpo, tenant: tenantDe(request) });
  return NextResponse.json(resultado.body, { status: resultado.status });
}
